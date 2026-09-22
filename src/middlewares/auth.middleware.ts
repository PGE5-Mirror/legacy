import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
    const authHeader = req.headers['authorization'];

    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Missing token.' });
    }

    const secret = process.env.JWT_SECRET || 'default_secret';

    try {
        const verified = jwt.verify(token, secret) as { id: string; email: string };
        req.user = verified;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};
