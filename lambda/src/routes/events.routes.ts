import { Router } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { query, queryOne } from '../db/connection';

const router = Router();

// ==================== EVENTS ====================

/**
 * Get all events with optional filtering
 */
router.get('/', async (req, res) => {
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

/**
 * Get single event by ID with teams and stats
 */
router.get('/:id', async (req, res): Promise<void> => {
    try {
        const eventData = await queryOne(
            `SELECT 
        e.*,
        json_build_object(
          'name', s.name,
          'logo_url', s.logo_url,
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

/**
 * Create new event (admin only)
 */
router.post('/', authenticate, requireRole(['admin']), async (req: AuthRequest, res) => {
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

/**
 * Update event (admin/moderator)
 */
router.put('/:eventId', authenticate, requireRole(['admin', 'moderator']), async (req, res) => {
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

/**
 * Delete event (admin only)
 */
router.delete('/:eventId', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        await query('DELETE FROM events WHERE id = $1', [req.params.eventId]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete event' });
    }
});


// ==================== MODERATOR ENDPOINTS ====================

/**
 * Get team scores matrix for moderator dashboard
 * IMPORTANT: This route must come BEFORE /:eventId/teams to avoid being shadowed
 */
router.get('/:eventId/teams/scores', async (req, res) => {
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

        // Get all judge profiles for this event with online status
        const judges = await query(
            `SELECT DISTINCT ON (ej.id)
        ej.id,
        ej.name,
        js.last_activity,
        CASE 
          WHEN js.last_activity > NOW() - INTERVAL '5 minutes' THEN true
          ELSE false
        END as is_online
      FROM event_judges ej
      LEFT JOIN judge_sessions js ON ej.id = js.judge_id AND js.event_id = $1 AND js.logged_out_at IS NULL
      WHERE ej.event_id = $1
      ORDER BY ej.id, js.last_activity DESC NULLS LAST, ej.name`,
            [req.params.eventId]
        );

        // Get all score submissions with total scores
        const scoreSubmissions = await query(
            `SELECT 
        ss.team_id,
        ss.judge_id,
        COALESCE(SUM(s.score), 0) as total_score,
        ss.submitted_at IS NOT NULL as is_submitted
      FROM score_submissions ss
      LEFT JOIN scores s ON ss.id = s.submission_id
      WHERE ss.event_id = $1
      GROUP BY ss.team_id, ss.judge_id, ss.submitted_at`,
            [req.params.eventId]
        );

        // Build scoring matrix
        const teamsWithScores = teams.map((team: any) => {
            const teamScores = judges.map((judge: any) => {
                const submission = scoreSubmissions.find(
                    (sub: any) => sub.team_id === team.id && sub.judge_id === judge.id
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

// ==================== TEAM MANAGEMENT ====================

/**
 * Get all teams for an event
 * Supports activeOnly filter for judges
 * Optional judgeId query param to check if current judge profile has scored
 */
router.get('/:eventId/teams', authenticate, async (req: AuthRequest, res) => {
    try {
        const activeOnly = req.query.activeOnly === 'true';
        const judgeId = req.query.judgeId as string | undefined;

        // Build status filter:
        // - If activeOnly=true (judges view), only show active teams (not completed)
        // - Otherwise (admin/moderator view), show all teams
        const statusFilter = activeOnly ? "AND t.status IN ('waiting', 'active')" : '';

        // If judgeId provided, check if that judge profile has scored each team
        const hasCurrentJudgeScoredClause = judgeId
            ? `EXISTS(
                 SELECT 1 FROM score_submissions 
                 WHERE team_id = t.id 
                 AND judge_id = $2 
                 AND submitted_at IS NOT NULL
               )`
            : 'false';

        const params = judgeId
            ? [req.params.eventId, judgeId]
            : [req.params.eventId];

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
        ${hasCurrentJudgeScoredClause} as has_current_user_scored
      FROM teams t
      LEFT JOIN score_submissions ss ON t.id = ss.team_id
      WHERE t.event_id = $1 ${statusFilter}
      GROUP BY t.id
      ORDER BY t.presentation_order ASC, t.created_at DESC`,
            params
        );

        res.json({ teams });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

/**
 * Create new team for an event (admin only)
 */
router.post('/:eventId/teams', authenticate, requireRole(['admin']), async (req: AuthRequest, res) => {
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

/**
 * Update event judging phase (moderator/admin)
 */
router.patch('/:eventId/phase', authenticate, requireRole(['moderator', 'admin']), async (req, res) => {
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

/**
 * Get event leaderboard
 */
router.get('/:eventId/leaderboard', async (req, res) => {
    try {
        const leaderboardData = await query(
            `SELECT 
        t.id,
        t.name as team_name,
        t.project_title,
        COALESCE(SUM(s.score), 0) as total_score,
        COUNT(DISTINCT ss.judge_id) FILTER (WHERE ss.submitted_at IS NOT NULL) as judges_scored,
        CASE 
          WHEN COUNT(DISTINCT ss.judge_id) FILTER (WHERE ss.submitted_at IS NOT NULL) > 0 
          THEN ROUND(COALESCE(SUM(s.score), 0)::numeric / COUNT(DISTINCT ss.judge_id) FILTER (WHERE ss.submitted_at IS NOT NULL), 2)
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

/**
 * Get event insights (admin only)
 */
router.get('/:eventId/insights', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const insights = await queryOne(
            `SELECT 
        COUNT(DISTINCT t.id) as total_teams,
        COUNT(DISTINCT ss.judge_id) as total_judges,
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

/**
 * Get online judges for an event
 */
router.get('/:eventId/judges/online', async (req, res) => {
    try {
        const judges = await query(
            `SELECT 
        ej.id,
        ej.name,
        js.last_activity,
        CASE 
          WHEN js.last_activity > NOW() - INTERVAL '5 minutes' THEN true
          ELSE false
        END as is_online
      FROM event_judges ej
      LEFT JOIN judge_sessions js ON ej.id = js.judge_id AND js.logged_out_at IS NULL
      WHERE ej.event_id = $1
      ORDER BY js.last_activity DESC NULLS LAST`,
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

/**
 * Update active team (moderator/admin)
 */
router.put('/:eventId/team-active', authenticate, requireRole(['moderator', 'admin']), async (req, res) => {
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

/**
 * Get moderator status for an event
 */
router.get('/:eventId/moderator/status', authenticate, requireRole(['moderator', 'admin']), async (req, res) => {
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

/**
 * Get judge profile's progress/history for an event
 * Returns detailed scoring information including reflections and comments
 * Requires judgeId query parameter
 */
router.get('/:eventId/my-progress', authenticate, async (req: AuthRequest, res) => {
    try {
        const { eventId } = req.params;
        const judgeId = req.query.judgeId as string;

        if (!judgeId) {
            return res.status(400).json({ error: 'judgeId query parameter is required' });
        }

        // Verify judge profile belongs to the authenticated user
        const profile = await queryOne(
            'SELECT id FROM event_judges WHERE id = $1 AND event_id = $2 AND user_id = $3',
            [judgeId, eventId, req.user!.id]
        );

        if (!profile) {
            return res.status(403).json({ error: 'Invalid judge profile' });
        }

        // Get all teams for the event with judge profile's submission status
        const teams = await query(
            `SELECT 
        t.id,
        t.name,
        t.description,
        ss.id as submission_id,
        ss.submitted_at,
        CASE WHEN ss.submitted_at IS NOT NULL THEN true ELSE false END as is_completed
      FROM teams t
      LEFT JOIN score_submissions ss ON t.id = ss.team_id AND ss.judge_id = $1
      WHERE t.event_id = $2
      ORDER BY t.presentation_order`,
            [judgeId, eventId]
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

        return res.json(scoredTeams);
    } catch (error) {
        console.error('Error fetching judge progress:', error);
        return res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

export default router;
