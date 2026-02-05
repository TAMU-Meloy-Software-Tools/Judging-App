import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';

// Custom types for authenticated requests
export interface AuthRequest extends Request {
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

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 * In DEV_MODE, bypasses authentication with mock user
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

        const payload = await verifyJwt(token) as any;
        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized - Invalid token' });
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
