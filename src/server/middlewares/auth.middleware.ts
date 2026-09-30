import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getUserById } from '../persistence';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const authHeader = req.headers['authorization'];

  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Missing token.' });
  }

  const secret = process.env.JWT_SECRET || 'default_secret';

  let verified: { id: string; email: string };
  try {
    verified = jwt.verify(token, secret) as { id: string; email: string };
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const user = await getUserById(verified.id);
  if (!user) {
    return res.status(401).json({ error: 'User no longer exists, please log in again' });
  }

  req.user = verified;
  next();
};
