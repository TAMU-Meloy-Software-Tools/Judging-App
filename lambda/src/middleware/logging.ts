import { Request, Response, NextFunction } from 'express';

/**
 * Logging middleware for debugging
 * Logs all incoming requests with method, path, query params, and headers
 */
export const logging = (req: Request, _res: Response, next: NextFunction): void => {
    console.log('[REQUEST]', {
        method: req.method,
        path: req.path,
        url: req.url,
        query: req.query,
        headers: req.headers
    });
    next();
};
