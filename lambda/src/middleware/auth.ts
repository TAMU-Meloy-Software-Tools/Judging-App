import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';
import { query } from '../db/connection';

// JWT library for Auth0 verification
import * as jose from 'jose';

// Custom types for authenticated requests
export interface AuthRequest extends Request {
    user?: {
        id: string;
        netId?: string;
        role: string;
        email?: string;
        auth_provider?: string;
    };
}

// ⚠️ DEVELOPMENT MODE - Remove before production!
const DEV_MODE = process.env.DEV_MODE === 'true';
const MOCK_USER = {
    id: '00000000-0000-0000-0000-000000000001',
    netId: 'testuser',
    role: 'admin', // Can be: 'admin', 'moderator', 'judge'
    auth_provider: 'local'
};

if (DEV_MODE) {
    console.warn('🚨 WARNING: DEV_MODE is enabled - Authentication is BYPASSED!');
    console.warn('🚨 Mock user:', MOCK_USER);
}

/**
 * Verify Auth0 JWT token (ID token or Access token)
 */
async function verifyAuth0Token(token: string): Promise<any> {
    const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
    const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
    const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;

    if (!AUTH0_DOMAIN) {
        throw new Error('AUTH0_DOMAIN not configured');
    }

    const JWKS = jose.createRemoteJWKSet(new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`));

    // Try to verify with API audience first (access token)
    if (AUTH0_AUDIENCE) {
        try {
            const { payload } = await jose.jwtVerify(token, JWKS, {
                issuer: `https://${AUTH0_DOMAIN}/`,
                audience: AUTH0_AUDIENCE,
            });
            return payload;
        } catch (error: any) {
            // If audience doesn't match, might be an ID token
            console.log('[auth] Access token verification failed, trying ID token:', error.message);
        }
    }

    // Try to verify as ID token (audience is client ID)
    if (AUTH0_CLIENT_ID) {
        try {
            const { payload } = await jose.jwtVerify(token, JWKS, {
                issuer: `https://${AUTH0_DOMAIN}/`,
                audience: AUTH0_CLIENT_ID,
            });
            return payload;
        } catch (error: any) {
            console.log('[auth] ID token verification failed:', error.message);
            throw error;
        }
    }

    // Fallback: verify without audience check
    const { payload } = await jose.jwtVerify(token, JWKS, {
        issuer: `https://${AUTH0_DOMAIN}/`,
    });

    return payload;
}

/**
 * Look up user in database by auth provider info
 * If user doesn't exist, create them automatically
 */
async function getUserFromDatabase(auth_provider: string, auth_provider_id: string, userPayload?: any): Promise<any> {
    let users = await query(
        `SELECT id, email, name, role, is_active, auth_provider 
         FROM users 
         WHERE auth_provider = $1 AND auth_provider_id = $2 AND is_active = true`,
        [auth_provider, auth_provider_id]
    );

    // If user doesn't exist and we have payload data, create them
    if ((!users || users.length === 0) && userPayload) {
        console.log('[auth-middleware] User not found, creating new user:', {
            auth_provider,
            auth_provider_id,
            email: userPayload.email
        });

        const newUsers = await query(
            `INSERT INTO users (
                email, 
                name, 
                role, 
                auth_provider, 
                auth_provider_id, 
                auth_metadata,
                is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, email, name, role, is_active, auth_provider`,
            [
                userPayload.email,
                userPayload.name || userPayload.email?.split('@')[0] || 'User',
                'judge', // Default role
                auth_provider,
                auth_provider_id,
                JSON.stringify(userPayload),
                true
            ]
        );

        return newUsers && newUsers.length > 0 ? newUsers[0] : null;
    }

    return users && users.length > 0 ? users[0] : null;
}

/**
 * Authentication middleware
 * Supports multiple auth methods:
 * 1. DEV_MODE bypass (development only)
 * 2. Auth0 JWT tokens (iss: auth0)
 * 3. Custom JWT tokens (local auth)
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

        // Decode token header to determine issuer
        const unverifiedPayload = jose.decodeJwt(token);

        // Check if it's an Auth0 token (by issuer)
        const isAuth0Token = typeof unverifiedPayload.iss === 'string' && 
                            unverifiedPayload.iss.includes('auth0.com');

        if (isAuth0Token) {
            // Verify Auth0 token
            const auth0Payload = await verifyAuth0Token(token);
            
            // Look up user in database (will auto-create if doesn't exist)
            const user = await getUserFromDatabase('auth0', auth0Payload.sub as string, auth0Payload);
            
            if (!user) {
                res.status(500).json({ 
                    error: 'Failed to create or retrieve user' 
                });
                return;
            }

            req.user = {
                id: user.id,
                email: user.email,
                role: user.role,
                auth_provider: 'auth0'
            };
        } else {
            // Verify custom JWT token (local auth)
            const payload = await verifyJwt(token) as any;
            req.user = {
                id: payload.id,
                netId: payload.netId,
                role: payload.role,
                auth_provider: 'local'
            };
        }

        next();
    } catch (error: any) {
        console.error('[auth-middleware] Token verification failed:', error.message);
        res.status(401).json({ 
            error: 'Unauthorized - Invalid token',
            details: error.message 
        });
        return;
    }
};

/**
 * Role-based authorization middleware factory
 * @param roles - Array of allowed roles
 * @returns Middleware function that checks user role
 */
export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
            return;
        }
        next();
    };
};
