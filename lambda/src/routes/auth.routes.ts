import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query } from '../db/connection';

const router = Router();

// ==================== AUTH ====================

/**
 * CAS authentication callback
 * TODO: Implement actual CAS ticket validation
 */
router.get('/cas-callback', async (_req, res) => {
    try {
        // TODO: Implement CAS validation with req.query.ticket
        res.json({ message: 'CAS callback - to be implemented' });
    } catch (error) {
        res.status(500).json({ error: 'CAS callback failed' });
    }
});

/**
 * Get current authenticated user
 */
router.get('/me', authenticate, async (req: AuthRequest, res) => {
    res.json({ user: req.user });
});

/**
 * Logout and end judge session
 */
router.post('/logout', authenticate, async (req: AuthRequest, res) => {
    try {
        const { eventId, judgeId } = req.body;
        if (eventId && judgeId) {
            await query(
                'UPDATE judge_sessions SET logged_out_at = NOW() WHERE judge_id = $1 AND event_id = $2 AND logged_out_at IS NULL',
                [judgeId, eventId]
            );
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
});

export default router;
