import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query, queryOne } from '../db/connection';

const router = Router();

// ==================== JUDGING ====================

/**
 * Judge heartbeat - update last activity for judge profile
 */
router.post('/heartbeat', authenticate, async (req: AuthRequest, res) => {
    try {
        const { eventId, judgeId } = req.body;

        if (!judgeId) {
            return res.status(400).json({ error: 'judgeId is required' });
        }

        // Update or create session for this judge profile
        await query(
            `INSERT INTO judge_sessions (event_id, judge_id, logged_in_at, last_activity)
             VALUES ($1, $2, NOW(), NOW())
             ON CONFLICT (event_id, judge_id, logged_in_at) 
             DO UPDATE SET last_activity = NOW()`,
            [eventId, judgeId]
        );

        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update heartbeat' });
    }
});

/**
 * Get judge profiles for an event (for profile selection screen)
 */
router.get('/profiles/:eventId', authenticate, async (req: AuthRequest, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user!.id;

        // Get all judge profiles for this event that belong to the current user
        const profiles = await query(
            `SELECT id, name, assigned_at 
             FROM event_judges 
             WHERE event_id = $1 AND user_id = $2 
             ORDER BY name`,
            [eventId, userId]
        );

        return res.json({ profiles });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch judge profiles' });
    }
});

/**
 * Start a judge session (when selecting a profile)
 */
router.post('/session/start', authenticate, async (req: AuthRequest, res) => {
    try {
        const { eventId, judgeId } = req.body;

        // Verify judge profile belongs to the authenticated user
        const profile = await queryOne(
            'SELECT id, name FROM event_judges WHERE id = $1 AND event_id = $2 AND user_id = $3',
            [judgeId, eventId, req.user!.id]
        );

        if (!profile) {
            return res.status(403).json({ error: 'Invalid judge profile' });
        }

        // Create new session
        await query(
            `INSERT INTO judge_sessions (event_id, judge_id, logged_in_at, last_activity)
             VALUES ($1, $2, NOW(), NOW())`,
            [eventId, judgeId]
        );

        return res.json({ 
            message: 'Session started',
            profile: {
                id: profile.id,
                name: profile.name
            }
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to start session' });
    }
});

export default router;

