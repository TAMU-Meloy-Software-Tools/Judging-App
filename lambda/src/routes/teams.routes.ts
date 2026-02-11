import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { query, queryOne } from '../db/connection';

const router = Router();

// ==================== TEAMS ====================

/**
 * Get single team by ID
 */
router.get('/:teamId', async (req, res): Promise<void> => {
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

/**
 * Update team (admin only)
 */
router.put('/:teamId', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const updates = req.body;
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }

        // Build the SET clause with proper parameter placeholders
        const setClause = Object.keys(updates)
            .map((key, i) => `${key} = $${i + 2}`)
            .join(', ');
        
        const values = [req.params.teamId, ...Object.values(updates)];

        const team = await queryOne(
            `UPDATE teams SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
            values
        );

        if (!team) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }

        res.json({ team });
    } catch (error) {
        console.error('Failed to update team:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: 'Failed to update team', details: errorMessage });
    }
});

/**
 * Delete team (admin only)
 */
router.delete('/:teamId', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        await query('DELETE FROM teams WHERE id = $1', [req.params.teamId]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete team' });
    }
});

/**
 * Add team member (admin only)
 */
router.post('/:teamId/members', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const { name, email } = req.body;
        
        if (!name || !name.trim()) {
            res.status(400).json({ error: 'Member name is required' });
            return;
        }

        const member = await queryOne(
            `INSERT INTO team_members (team_id, name, email)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [req.params.teamId, name, email || null]
        );

        res.status(201).json({ member });
    } catch (error) {
        console.error('Failed to add team member:', error);
        res.status(500).json({ error: 'Failed to add team member' });
    }
});

/**
 * Delete all team members (admin only) - used when updating team
 */
router.delete('/:teamId/members', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        await query('DELETE FROM team_members WHERE team_id = $1', [req.params.teamId]);
        res.status(204).send();
    } catch (error) {
        console.error('Failed to delete team members:', error);
        res.status(500).json({ error: 'Failed to delete team members' });
    }
});

/**
 * Update team status (moderator/admin)
 */
router.patch('/:teamId/status', authenticate, requireRole(['moderator', 'admin']), async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['waiting', 'active', 'completed'];

        if (!validStatuses.includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }

        const team = await queryOne(
            'UPDATE teams SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, req.params.teamId]
        );

        res.json({ team });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update team status' });
    }
});

export default router;
