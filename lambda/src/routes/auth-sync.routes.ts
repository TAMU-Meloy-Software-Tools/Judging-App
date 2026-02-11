import { Router } from 'express';
import { query } from '../db/connection';

const router = Router();

/**
 * Sync user from Auth0/external provider
 * Called by Auth0 Action or directly after OAuth login
 */
router.post('/sync-user', async (req, res) => {
    try {
        const { auth_provider, auth_provider_id, email, name, auth_metadata } = req.body;

        // Validate required fields
        if (!auth_provider || !auth_provider_id || !email || !name) {
            return res.status(400).json({
                error: 'Missing required fields: auth_provider, auth_provider_id, email, name'
            });
        }

        // Check if user already exists by auth_provider_id
        const existingUser = await query(
            `SELECT id, email, name, role, is_active FROM users 
             WHERE auth_provider = $1 AND auth_provider_id = $2`,
            [auth_provider, auth_provider_id]
        );

        if (existingUser && existingUser.length > 0) {
            // User exists - update last_login and metadata
            await query(
                `UPDATE users 
                 SET last_login = NOW(), 
                     auth_metadata = $1,
                     updated_at = NOW()
                 WHERE auth_provider = $2 AND auth_provider_id = $3`,
                [JSON.stringify(auth_metadata || {}), auth_provider, auth_provider_id]
            );

            return res.json({
                user: existingUser[0],
                created: false,
                message: 'User synced successfully'
            });
        }

        // User doesn't exist - create new user
        // Default role is 'judge' - admins must be promoted manually
        const newUser = await query(
            `INSERT INTO users (
                email, 
                name, 
                role, 
                auth_provider, 
                auth_provider_id, 
                auth_metadata,
                last_login
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING id, email, name, role, is_active, created_at`,
            [
                email,
                name,
                'judge', // Default role
                auth_provider,
                auth_provider_id,
                JSON.stringify(auth_metadata || {})
            ]
        );

        return res.status(201).json({
            user: newUser[0],
            created: true,
            message: 'User created successfully'
        });

    } catch (error: any) {
        console.error('[auth-sync] Error syncing user:', error);
        
        // Handle unique constraint violations gracefully
        if (error.code === '23505') { // Postgres unique violation
            return res.status(409).json({
                error: 'User with this email already exists with a different auth provider',
                code: 'DUPLICATE_EMAIL'
            });
        }

        return res.status(500).json({
            error: 'Failed to sync user',
            details: error.message
        });
    }
});

/**
 * Get current user info from Auth0 token
 * Used by frontend to get user profile after Auth0 login
 */
router.get('/me', async (req, res) => {
    try {
        // Auth0 middleware should attach user info to req
        const auth0User = (req as any).oidc?.user;

        if (!auth0User) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Look up user in our database
        const user = await query(
            `SELECT id, email, name, role, is_active, auth_provider, last_login, created_at
             FROM users 
             WHERE auth_provider = 'auth0' AND auth_provider_id = $1`,
            [auth0User.sub]
        );

        if (!user || user.length === 0) {
            return res.status(404).json({
                error: 'User not found in database',
                suggestion: 'User may not have been synced yet'
            });
        }

        return res.json({ user: user[0] });

    } catch (error: any) {
        console.error('[auth-me] Error fetching user:', error);
        return res.status(500).json({
            error: 'Failed to fetch user info',
            details: error.message
        });
    }
});

export default router;
