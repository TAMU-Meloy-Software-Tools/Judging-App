import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { query, queryOne } from '../db/connection';

const router = Router();

// ==================== SPONSOR MANAGEMENT ====================

/**
 * Create a new sponsor (admin only)
 */
router.post('/', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const { name, logo_url, website_url, tier, primary_color, secondary_color, text_color } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Sponsor name is required' });
        }

        const sponsor = await queryOne(
            `INSERT INTO sponsors (name, logo_url, website_url, tier, primary_color, secondary_color, text_color)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                name,
                logo_url || null,
                website_url || null,
                tier || null,
                primary_color || '#500000',
                secondary_color || '#FFFFFF',
                text_color || '#FFFFFF'
            ]
        );

        return res.status(201).json({ sponsor });
    } catch (error) {
        console.error('Create sponsor error:', error);
        return res.status(500).json({ error: 'Failed to create sponsor' });
    }
});

/**
 * Update a sponsor (admin only)
 */
router.put('/:sponsorId', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const { sponsorId } = req.params;
        const updates = req.body;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const allowedFields = ['name', 'logo_url', 'website_url', 'tier', 'primary_color', 'secondary_color', 'text_color'];
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = $${paramIndex++}`);
                values.push(updates[key]);
            }
        });

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        values.push(sponsorId);

        const sponsor = await queryOne(
            `UPDATE sponsors 
             SET ${fields.join(', ')}
             WHERE id = $${paramIndex}
             RETURNING *`,
            values
        );

        if (!sponsor) {
            return res.status(404).json({ error: 'Sponsor not found' });
        }

        return res.json({ sponsor });
    } catch (error) {
        console.error('Update sponsor error:', error);
        return res.status(500).json({ error: 'Failed to update sponsor' });
    }
});

/**
 * Delete a sponsor (admin only)
 */
router.delete('/:sponsorId', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const { sponsorId } = req.params;

        await query('DELETE FROM sponsors WHERE id = $1', [sponsorId]);

        return res.status(204).send();
    } catch (error) {
        console.error('Delete sponsor error:', error);
        return res.status(500).json({ error: 'Failed to delete sponsor' });
    }
});

export default router;
