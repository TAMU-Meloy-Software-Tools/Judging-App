import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { query, queryOne } from '../db/connection';

const router = Router();

// ==================== JUDGE PROFILE MANAGEMENT ====================

/**
 * Get all judge profiles for an event (admin only)
 */
router.get('/events/:eventId/judge-profiles', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const { eventId } = req.params;

        const profiles = await query(
            `SELECT 
                ej.id,
                ej.event_id,
                ej.user_id,
                ej.name,
                ej.assigned_at,
                u.email as user_email
             FROM event_judges ej
             LEFT JOIN users u ON ej.user_id = u.id
             WHERE ej.event_id = $1
             ORDER BY ej.name`,
            [eventId]
        );

        return res.json({ profiles });
    } catch (error) {
        console.error('Get judge profiles error:', error);
        return res.status(500).json({ error: 'Failed to get judge profiles' });
    }
});

/**
 * Create a new judge profile for an event (admin only)
 */
router.post('/events/:eventId/judge-profiles', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const { eventId } = req.params;
        const { name, user_id } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Judge profile name is required' });
        }

        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Check if profile name already exists for this event
        const existing = await queryOne(
            'SELECT id FROM event_judges WHERE event_id = $1 AND name = $2',
            [eventId, name]
        );

        if (existing) {
            return res.status(400).json({ error: 'A judge profile with this name already exists for this event' });
        }

        const profile = await queryOne(
            `INSERT INTO event_judges (event_id, user_id, name)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [eventId, user_id, name]
        );

        return res.status(201).json({ profile });
    } catch (error) {
        console.error('Create judge profile error:', error);
        return res.status(500).json({ error: 'Failed to create judge profile' });
    }
});

/**
 * Delete a judge profile (admin only)
 */
router.delete('/judge-profiles/:profileId', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const { profileId } = req.params;

        await query('DELETE FROM event_judges WHERE id = $1', [profileId]);

        return res.status(204).send();
    } catch (error) {
        console.error('Delete judge profile error:', error);
        return res.status(500).json({ error: 'Failed to delete judge profile' });
    }
});

export default router;
