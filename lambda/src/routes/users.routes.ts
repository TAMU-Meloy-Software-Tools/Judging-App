import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { query, queryOne } from '../db/connection';

const router = Router();

// ==================== USER MANAGEMENT (ADMIN) ====================

/**
 * Get all users (admin only)
 */
router.get('/', authenticate, requireRole(['admin']), async (_req, res) => {
    try {
        const users = await query(
            `SELECT 
                id, 
                email, 
                name,
                role, 
                created_at,
                updated_at
             FROM users 
             ORDER BY created_at DESC`
        );
        res.json({ users });
    } catch (error) {
        console.error('Failed to fetch users:', error);
        res.status(500).json({ error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' });
    }
});

/**
 * Update user role (admin only)
 */
router.put('/:userId/role', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['admin', 'moderator', 'judge', 'participant'];

        if (!validRoles.includes(role)) {
            res.status(400).json({ error: 'Invalid role' });
            return;
        }

        const user = await queryOne(
            'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role',
            [role, req.params.userId]
        );

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

export default router;
