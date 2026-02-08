import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const ACCESS_TOKEN_TTL = process.env.JWT_EXPIRES_IN || '1h';
const TWO_FACTOR_TTL = process.env.TWO_FACTOR_TOKEN_TTL || '10m';

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

export function generateTwoFactorToken(userId: string): string {
  return jwt.sign({ userId, purpose: '2fa' }, JWT_SECRET, { expiresIn: TWO_FACTOR_TTL });
}

export function verifyTwoFactorToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; purpose?: string };
    if (decoded.purpose !== '2fa') return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
