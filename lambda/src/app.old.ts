import express, { Request, Response, NextFunction } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { query, queryOne, transaction } from './db/connection';
import { verifyJwt } from './utils/jwt';

const app = express();

// Middleware - MUST be before routes
app.use(express.json());
app.use(cors());

// Logging middleware for debugging (remove in production)
app.use((req, _res, next) => {
    console.log('[REQUEST]', {
        method: req.method,
        path: req.path,
        url: req.url,
        query: req.query,
        headers: req.headers
    });
    next();
});


// Custom types for authenticated requests
interface AuthRequest extends Request {
    user?: {
        id: string;
        netId?: string;
        role: string;
    };
}

// ⚠️ DEVELOPMENT MODE - Remove before production!
const DEV_MODE = process.env.DEV_MODE === 'true';
const MOCK_USER = {
    id: '00000000-0000-0000-0000-000000000001',
    netId: 'testuser',
    role: 'admin' // Can be: 'admin', 'moderator', 'judge'
};

if (DEV_MODE) {
    console.warn('🚨 WARNING: DEV_MODE is enabled - Authentication is BYPASSED!');
    console.warn('🚨 Mock user:', MOCK_USER);
}

// Authentication middleware
const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // ⚠️ DEVELOPMENT MODE BYPASS
    if (DEV_MODE) {
        console.log('🔓 DEV_MODE: Bypassing authentication');
        req.user = MOCK_USER;
        next();
        return;
    }

    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ error: 'Unauthorized - No token provided' });
            return;
        }

        const payload = await verifyJwt(token) as any;
        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized - Invalid token' });
        return;
    }
};

// Role-based authorization middleware
const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
            return;
        }
        next();
    };
};

// ==================== HEALTH & AUTH ====================

// TEMPORARY FIX: Seed the missing mock user
app.post('/admin/seed-fix', async (_req, res) => {
    try {
        await query(`
            INSERT INTO users (id, netid, email, first_name, last_name, role)
            VALUES ('00000000-0000-0000-0000-000000000001', 'testuser', 'test@example.com', 'Test', 'User', 'judge')
            ON CONFLICT (id) DO NOTHING
        `);
        res.json({ message: 'Mock user seeded successfully within existing DB' });
    } catch (error) {
        console.error('Seeding error:', error);
        res.status(500).json({ error: 'Failed to seed mock user', details: error });
    }
});

app.get('/health', async (_req, res) => {
    try {
        await query('SELECT 1 as health');
        res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error });
    }
});

app.get('/auth/cas-callback', async (_req, res) => {
    try {
        // TODO: Implement CAS validation with req.query.ticket
        res.json({ message: 'CAS callback - to be implemented' });
    } catch (error) {
        res.status(500).json({ error: 'CAS callback failed' });
    }
});

app.get('/auth/me', authenticate, async (req: AuthRequest, res) => {
    res.json({ user: req.user });
});

app.post('/auth/logout', authenticate, async (req: AuthRequest, res) => {
    try {
        const eventId = req.body.eventId;
        if (eventId) {
            await query(
                'UPDATE judge_sessions SET logged_out_at = NOW() WHERE user_id = $1 AND event_id = $2 AND logged_out_at IS NULL',
                [req.user!.id, eventId]
            );
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
});

// ==================== EVENTS ====================

app.get('/events', async (req, res) => {
    try {
        const { status, type } = req.query;
        const conditions: string[] = ['1=1'];
        const params: any[] = [];
        let paramIndex = 1;

        if (status) {
            conditions.push(`e.status = $${paramIndex++}`);
            params.push(status);
        }

        if (type) {
            conditions.push(`e.event_type = $${paramIndex++}`);
            params.push(type);
        }

        const events = await query(
            `SELECT 
        e.*,
        json_build_object(
          'name', s.name,
          'logo_url', s.logo_url,
          'website_url', s.website_url,
          'tier', s.tier,
          'primary_color', s.primary_color,
          'secondary_color', s.secondary_color,
          'text_color', s.text_color
        ) as sponsor,
        (SELECT COUNT(*) FROM teams WHERE event_id = e.id) as teams_count,
        (SELECT COUNT(*) FROM event_judges WHERE event_id = e.id) as judges_count
      FROM events e
      LEFT JOIN sponsors s ON e.sponsor_id = s.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY e.start_date DESC NULLS LAST, e.created_at DESC`,
            params
        );

        res.json({ events, total: events.length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.get('/events/:id', async (req, res): Promise<void> => {
    try {
        const eventData = await queryOne(
            `SELECT 
        e.*,
        json_build_object(
          'name', s.name,
          'logo_url', s.logo_url,
          'website_url', s.website_url,
          'tier', s.tier,
          'primary_color', s.primary_color,
          'secondary_color', s.secondary_color,
          'text_color', s.text_color
       ) as sponsor
      FROM events e
      LEFT JOIN sponsors s ON e.sponsor_id = s.id
      WHERE e.id = $1`,
            [req.params.id]
        );

        if (!eventData) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        const teams = await query(
            `SELECT 
        t.id,
        t.name,
        t.description,
        t.status,
        t.project_url,
        COUNT(tm.id) as member_count
      FROM teams t
      LEFT JOIN team_members tm ON tm.team_id = t.id
      WHERE t.event_id = $1
      GROUP BY t.id, t.name, t.description, t.status, t.project_url
      ORDER BY t.created_at ASC`,
            [req.params.id]
        );

        const submissionStats = await queryOne<{
            total_submissions: string;
            completed_submissions: string;
        }>(
            `SELECT 
        COUNT(*) as total_submissions,
        COUNT(CASE WHEN ss.submitted_at IS NOT NULL THEN 1 END) as completed_submissions
      FROM score_submissions ss
      JOIN teams t ON ss.team_id = t.id
      WHERE t.event_id = $1`,
            [req.params.id]
        );

        res.json({
            event: eventData,
            teams,
            stats: {
                totalTeams: teams.length,
                totalSubmissions: parseInt(submissionStats?.total_submissions || '0', 10),
                completedSubmissions: parseInt(submissionStats?.completed_submissions || '0', 10),
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

app.post('/events', authenticate, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
        const { name, event_type, start_date, end_date, location, description } = req.body;

        const event = await queryOne(
            `INSERT INTO events (name, event_type, start_date, end_date, location, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [name, event_type, start_date, end_date, location, description]
        );

        res.status(201).json({ event });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create event' });
    }
});

app.put('/events/:eventId', authenticate, requireRole(['admin', 'moderator']), async (req, res) => {
    try {
        const updates = req.body;
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }

        const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ');
        const values = [req.params.eventId, ...Object.values(updates)];

        const event = await queryOne(
            `UPDATE events SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`,
            values
        );

        res.json({ event });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update event' });
    }
});

app.delete('/events/:eventId', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        await query('DELETE FROM events WHERE id = $1', [req.params.eventId]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// ==================== MODERATOR ENDPOINTS ====================

// Get team scoring matrix for moderator view
app.get('/events/:eventId/teams/scores', async (req, res) => {
    try {
        // Get all teams for the event
        const teams = await query(
            `SELECT 
        t.id,
        t.name,
        t.project_title,
        t.status,
        t.presentation_order
      FROM teams t
      WHERE t.event_id = $1
      ORDER BY t.presentation_order`,
            [req.params.eventId]
        );

        // Get all judges for the event  
        const judges = await query(
            `SELECT 
        u.id,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        js.last_activity,
        CASE 
          WHEN js.last_activity > NOW() - INTERVAL '5 minutes' THEN true
          ELSE false
        END as is_online
      FROM users u
      JOIN event_judges ej ON u.id = ej.user_id
      LEFT JOIN judge_sessions js ON u.id = js.user_id AND js.event_id = $1 AND js.logged_out_at IS NULL
      WHERE ej.event_id = $1 AND u.role = 'judge'
      ORDER BY u.first_name, u.last_name`,
            [req.params.eventId]
        );

        // Get all score submissions with total scores
        const scoreSubmissions = await query(
            `SELECT 
        ss.team_id,
        ss.user_id,
        COALESCE(SUM(s.score), 0) as total_score,
        ss.submitted_at IS NOT NULL as is_submitted
      FROM score_submissions ss
      LEFT JOIN scores s ON ss.id = s.submission_id
      WHERE ss.event_id = $1
      GROUP BY ss.team_id, ss.user_id, ss.submitted_at`,
            [req.params.eventId]
        );

        // Build scoring matrix
        const teamsWithScores = teams.map((team: any) => {
            const teamScores = judges.map((judge: any) => {
                const submission = scoreSubmissions.find(
                    (sub: any) => sub.team_id === team.id && sub.user_id === judge.id
                );
                return {
                    judgeId: judge.id,
                    judgeName: judge.name,
                    score: submission?.is_submitted ? parseFloat(submission.total_score) : null
                };
            });

            return {
                id: team.id,
                name: team.name,
                projectTitle: team.project_title,
                status: team.status,
                order: team.presentation_order,
                scores: teamScores
            };
        });

        res.json({
            teams: teamsWithScores,
            judges: judges.map((j: any) => ({
                id: j.id,
                name: j.name,
                isOnline: j.is_online
            }))
        });
    } catch (error) {
        console.error('Error fetching team scores:', error);
        res.status(500).json({ error: 'Failed to fetch team scores' });
    }
});

// Update team status
app.patch('/teams/:teamId/status', authenticate, requireRole(['moderator', 'admin']), async (req, res) => {
    try {
        const { status } = req.body;

        if (!['waiting', 'active', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const team = await queryOne(
            'UPDATE teams SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, req.params.teamId]
        );

        return res.json({ team });
    } catch (error) {
        console.error('Error updating team status:', error);
        return res.status(500).json({ error: 'Failed to update team status' });
    }
});

// Update event judging phase
app.patch('/events/:eventId/phase', authenticate, requireRole(['moderator', 'admin']), async (req, res) => {
    try {
        const { judging_phase } = req.body;

        if (!['not-started', 'in-progress', 'ended'].includes(judging_phase)) {
            return res.status(400).json({ error: 'Invalid judging phase value' });
        }

        const event = await queryOne(
            'UPDATE events SET judging_phase = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [judging_phase, req.params.eventId]
        );

        return res.json({ event });
    } catch (error) {
        console.error('Error updating event phase:', error);
        return res.status(500).json({ error: 'Failed to update event phase' });
    }
});


app.get('/events/:eventId/leaderboard', async (req, res) => {
    try {
        const leaderboardData = await query(
            `SELECT 
        t.id,
        t.name as team_name,
        t.project_title,
        COALESCE(SUM(s.score), 0) as total_score,
        COUNT(DISTINCT ss.user_id) FILTER (WHERE ss.submitted_at IS NOT NULL) as judges_scored,
        CASE 
          WHEN COUNT(DISTINCT ss.user_id) FILTER (WHERE ss.submitted_at IS NOT NULL) > 0 
          THEN ROUND(COALESCE(SUM(s.score), 0)::numeric / COUNT(DISTINCT ss.user_id) FILTER (WHERE ss.submitted_at IS NOT NULL), 2)
          ELSE 0
        END as avg_score
      FROM teams t
      LEFT JOIN score_submissions ss ON t.id = ss.team_id
      LEFT JOIN scores s ON ss.id = s.submission_id
      WHERE t.event_id = $1
      GROUP BY t.id
      ORDER BY total_score DESC, t.name ASC`,
            [req.params.eventId]
        );

        // Add rank to each team
        const leaderboard = leaderboardData.map((team: any, index: number) => ({
            ...team,
            rank: index + 1,
            avg_score: parseFloat(team.avg_score)
        }));

        res.json({ leaderboard });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

app.get('/events/:eventId/insights', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const insights = await queryOne(
            `SELECT 
        COUNT(DISTINCT t.id) as total_teams,
        COUNT(DISTINCT ss.user_id) as total_judges,
        COUNT(DISTINCT ss.id) FILTER (WHERE ss.submitted_at IS NOT NULL) as completed_scores,
        AVG(s.score) as average_score
      FROM teams t
      LEFT JOIN score_submissions ss ON t.id = ss.team_id
      LEFT JOIN scores s ON ss.id = s.submission_id
      WHERE t.event_id = $1`,
            [req.params.eventId]
        );

        res.json({ insights });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch insights' });
    }
});

app.get('/events/:eventId/judges/online', async (req, res) => {
    try {
        const judges = await query(
            `SELECT 
        u.id,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        js.last_activity,
        CASE 
          WHEN js.last_activity > NOW() - INTERVAL '5 minutes' THEN true
          ELSE false
        END as is_online
      FROM users u
      JOIN judge_sessions js ON u.id = js.user_id
      WHERE js.event_id = $1 AND js.logged_out_at IS NULL
      ORDER BY js.last_activity DESC`,
            [req.params.eventId]
        );

        // Return empty array if no judges, not an error
        res.json({ judges: judges || [] });
    } catch (error) {
        // If query fails (e.g., invalid event ID), still return empty array
        console.error('Error fetching online judges:', error);
        res.json({ judges: [] });
    }
});

app.put('/events/:eventId/team-active', authenticate, requireRole(['moderator', 'admin']), async (req, res) => {
    try {
        const { teamId } = req.body;

        await query(
            'UPDATE events SET current_active_team_id = $1, updated_at = NOW() WHERE id = $2',
            [teamId, req.params.eventId]
        );

        res.json({ message: 'Active team updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update active team' });
    }
});

app.put('/events/:eventId/judging-phase', authenticate, requireRole(['moderator', 'admin']), async (req, res) => {
    try {
        const { phase } = req.body;

        await query(
            'UPDATE events SET judging_phase = $1, updated_at = NOW() WHERE id = $2',
            [phase, req.params.eventId]
        );

        res.json({ message: 'Judging phase updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update judging phase' });
    }
});

app.get('/events/:eventId/moderator/status', authenticate, requireRole(['moderator', 'admin']), async (req, res) => {
    try {
        const status = await queryOne(
            `SELECT 
        e.id,
        e.name,
        e.judging_phase,
        e.current_active_team_id,
        t.name as active_team_name
      FROM events e
      LEFT JOIN teams t ON e.current_active_team_id = t.id
      WHERE e.id = $1`,
            [req.params.eventId]
        );

        res.json({ status });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch moderator status' });
    }
});

// ==================== TEAMS ====================

app.get('/events/:eventId/teams', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const activeOnly = req.query.activeOnly === 'true';

        // Build status filter for judges who should only see active teams
        const statusFilter = activeOnly ? "AND t.status = 'active'" : '';

        const teams = await query(
            `SELECT 
        t.*,
        COUNT(DISTINCT ss.id) as total_scores,
        COUNT(DISTINCT CASE WHEN ss.submitted_at IS NOT NULL THEN ss.id END) as completed_scores,
        ROUND(AVG(
          CASE WHEN ss.submitted_at IS NOT NULL 
          THEN (SELECT SUM(score) FROM scores WHERE submission_id = ss.id)
          END
        ), 2) as average_score,
        EXISTS(
          SELECT 1 FROM score_submissions 
          WHERE team_id = t.id 
          AND user_id = $2 
          AND submitted_at IS NOT NULL
        ) as has_current_user_scored
      FROM teams t
      LEFT JOIN score_submissions ss ON t.id = ss.team_id
      WHERE t.event_id = $1 ${statusFilter}
      GROUP BY t.id
      ORDER BY t.presentation_order ASC, t.created_at DESC`,
            [req.params.eventId, userId]
        );

        res.json({ teams });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

app.get('/teams/:teamId', async (req, res): Promise<void> => {
    try {
        const team = await queryOne(
            `SELECT t.*, e.name as event_name 
       FROM teams t
       JOIN events e ON t.event_id = e.id
       WHERE t.id = $1`,
            [req.params.teamId]
        );

        if (!team) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }

        const members = await query(
            'SELECT * FROM team_members WHERE team_id = $1',
            [req.params.teamId]
        );

        res.json({ team, members });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

app.post('/events/:eventId/teams', authenticate, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
        const { name, description, project_url, presentation_order } = req.body;

        const team = await queryOne(
            `INSERT INTO teams (event_id, name, description, project_url, presentation_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [req.params.eventId, name, description, project_url, presentation_order]
        );

        res.status(201).json({ team });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create team' });
    }
});

app.put('/teams/:teamId', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const updates = req.body;
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }

        const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ');
        const values = [req.params.teamId, ...Object.values(updates)];

        const team = await queryOne(
            `UPDATE teams SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`,
            values
        );

        res.json({ team });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update team' });
    }
});

app.delete('/teams/:teamId', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        await query('DELETE FROM teams WHERE id = $1', [req.params.teamId]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete team' });
    }
});

// ==================== SCORES ====================

app.post('/scores', authenticate, async (req: AuthRequest, res) => {
    try {
        const { eventId, teamId, scores, overallComments, timeSpentSeconds } = req.body;
        const userId = req.user!.id;

        await transaction(async (client) => {
            // Create or update score submission
            const submissionResult = await client.query(
                `INSERT INTO score_submissions (user_id, event_id, team_id, started_at, submitted_at, time_spent_seconds)
         VALUES ($1, $2, $3, NOW(), NOW(), $4)
         ON CONFLICT (user_id, team_id) 
         DO UPDATE SET submitted_at = NOW(), time_spent_seconds = $4
         RETURNING id`,
                [userId, eventId, teamId, timeSpentSeconds || 0]
            );

            const submissionId = submissionResult.rows[0].id;

            // Delete existing scores
            await client.query('DELETE FROM scores WHERE submission_id = $1', [submissionId]);

            // Insert new scores
            for (const score of scores) {
                await client.query(
                    `INSERT INTO scores (submission_id, user_id, team_id, rubric_criteria_id, score, reflection)
           VALUES ($1, $2, $3, $4, $5, $6)`,
                    [submissionId, userId, teamId, score.criteriaId, score.score, score.reflection || null]
                );
            }

            // Insert or update overall comment
            if (overallComments) {
                await client.query(
                    `INSERT INTO judge_comments (submission_id, user_id, team_id, comments)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, team_id)
           DO UPDATE SET comments = $4, updated_at = NOW()`,
                    [submissionId, userId, teamId, overallComments]
                );
            }

            // Log activity
            await client.query(
                `INSERT INTO activity_log (event_id, user_id, title, description, activity_type, icon_name, tone)
         VALUES ($1, $2, 'Scores Submitted', $3, 'score_submitted', 'CheckCircle', 'success')`,
                [eventId, userId, 'Judge submitted scores for team']
            );
        });

        res.json({ message: 'Scores submitted successfully' });
    } catch (error: any) {
        console.error('Score submission error:', error);
        res.status(500).json({ error: 'Failed to submit scores', details: error.message });
    }
});

// ==================== RUBRIC ====================

app.get('/rubric', async (_req, res) => {
    try {
        const criteria = await query(
            'SELECT * FROM rubric_criteria ORDER BY display_order ASC'
        );

        res.json({ criteria });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rubric' });
    }
});

// ==================== JUDGE ====================

app.post('/judge/heartbeat', authenticate, async (req: AuthRequest, res) => {
    try {
        const { eventId } = req.body;

        await query(
            `UPDATE judge_sessions 
       SET last_activity = NOW() 
       WHERE user_id = $1 AND event_id = $2 AND logged_out_at IS NULL`,
            [req.user!.id, eventId]
        );

        res.json({ lastActivity: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ error: 'Heartbeat failed' });
    }
});

app.get('/events/:eventId/my-progress', authenticate, async (req: AuthRequest, res) => {
    try {
        // Get all teams for the event with judge's submission status
        const teams = await query(
            `SELECT 
        t.id,
        t.name,
        t.description,
        ss.id as submission_id,
        ss.submitted_at,
        CASE WHEN ss.submitted_at IS NOT NULL THEN true ELSE false END as is_completed
      FROM teams t
      LEFT JOIN score_submissions ss ON t.id = ss.team_id AND ss.user_id = $1
      WHERE t.event_id = $2
      ORDER BY t.presentation_order`,
            [req.user!.id, req.params.eventId]
        );

        // For each completed submission, get detailed scores
        const scoredTeams = [];
        for (const team of teams) {
            if (team.is_completed && team.submission_id) {
                // Get all scores for this submission
                const scores = await query(
                    `SELECT 
            rc.id as criteria_id,
            rc.short_name,
            s.score,
            s.reflection
          FROM scores s
          JOIN rubric_criteria rc ON s.rubric_criteria_id = rc.id
          WHERE s.submission_id = $1
          ORDER BY rc.display_order`,
                    [team.submission_id]
                );

                // Get overall comments
                const comment = await queryOne(
                    'SELECT comments FROM judge_comments WHERE submission_id = $1',
                    [team.submission_id]
                );

                // Build breakdown object
                const breakdown: Record<string, number> = {};
                const reflections: Record<string, string> = {};
                let totalScore = 0;

                for (const score of scores) {
                    breakdown[score.short_name.toLowerCase()] = score.score;
                    totalScore += score.score;
                    if (score.reflection) {
                        reflections[score.short_name.toLowerCase()] = score.reflection;
                    }
                }

                scoredTeams.push({
                    teamName: team.name,
                    projectTitle: team.description,
                    totalScore,
                    judgedAt: new Date(team.submitted_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    }),
                    breakdown,
                    reflections,
                    comments: comment?.comments || null
                });
            }
        }

        res.json(scoredTeams);
    } catch (error) {
        console.error('Error fetching judge progress:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// ==================== USERS ====================

app.get('/users', authenticate, requireRole(['admin']), async (_req, res) => {
    try {
        const users = await query('SELECT id, netid, email, first_name, last_name, role, is_active, created_at FROM users ORDER BY created_at DESC');
        res.json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.put('/users/:userId/role', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const { role } = req.body;

        const user = await queryOne(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, netid, email, first_name, last_name, role',
            [role, req.params.userId]
        );

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// ==================== ADMIN ====================

app.post('/admin/init-schema', async (_req, res) => {
    try {
        // This endpoint is deprecated - schema should be initialized via migration scripts
        // or manually via database/schema.sql
        res.status(501).json({
            error: 'Not implemented',
            message: 'Please run schema initialization manually using database/schema.sql'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to initialize schema' });
    }
});

app.post('/admin/seed-data', async (_req, res) => {
    try {
        // Seed test data logic here
        res.json({ message: 'Data seeded successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to seed data' });
    }
});

app.get('/activity', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const activities = await query(
            `SELECT al.*, 
                    CONCAT(u.first_name, ' ', u.last_name) as user_name
       FROM activity_log al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT $1`,
            [limit]
        );

        res.json({ activities });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

// Export Lambda handler with basePath for API Gateway stage
export const handler = serverless(app, {
    basePath: '/prod'
});
