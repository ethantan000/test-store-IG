import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import User from '../models/User';
import RefreshToken from '../models/RefreshToken';
import MagicLinkToken from '../models/MagicLinkToken';
import TwoFactorToken from '../models/TwoFactorToken';
import { generateToken, generateTwoFactorToken, requireAuth, verifyTwoFactorToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthRequest } from '../types';
import { sendAdminTwoFactorCode, sendAdminMagicLink } from '../services/email';

const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const REFRESH_TOKEN_TTL_DAYS = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '30', 10);
const MAGIC_LINK_TTL_MINUTES = parseInt(process.env.MAGIC_LINK_TTL_MINUTES || '15', 10);
const ADMIN_REQUIRE_2FA = process.env.ADMIN_REQUIRE_2FA === 'true';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const twoFactorSchema = z.object({
  twoFactorToken: z.string().min(1),
  code: z.string().min(6).max(6),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const magicLinkRequestSchema = z.object({
  email: z.string().email(),
});

const magicLinkVerifySchema = z.object({
  token: z.string().min(1),
});

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function issueRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ userId, tokenHash, expiresAt });
  return token;
}

function shouldRequireTwoFactor(user: { twoFactorEnabled?: boolean }): boolean {
  return ADMIN_REQUIRE_2FA || !!user.twoFactorEnabled;
}

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (shouldRequireTwoFactor(user)) {
      const code = (Math.floor(100000 + Math.random() * 900000)).toString();
      const codeHash = hashToken(code);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await TwoFactorToken.create({ userId: user._id, codeHash, expiresAt });
      await sendAdminTwoFactorCode({ adminEmail: user.email, code });
      const twoFactorToken = generateTwoFactorToken(user._id.toString());

      res.json({ requiresTwoFactor: true, twoFactorToken });
      return;
    }

    const token = generateToken(user._id.toString());
    const refreshToken = await issueRefreshToken(user._id.toString());

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verify-2fa', validate(twoFactorSchema), async (req: Request, res: Response) => {
  const { twoFactorToken, code } = req.body;
  const decoded = verifyTwoFactorToken(twoFactorToken);
  if (!decoded) {
    res.status(401).json({ error: 'Invalid or expired 2FA token' });
    return;
  }

  try {
    const tokenHash = hashToken(code);
    const record = await TwoFactorToken.findOne({
      userId: decoded.userId,
      codeHash: tokenHash,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      res.status(401).json({ error: 'Invalid or expired verification code' });
      return;
    }

    record.usedAt = new Date();
    await record.save();

    const token = generateToken(decoded.userId);
    const refreshToken = await issueRefreshToken(decoded.userId);
    const user = await User.findById(decoded.userId);

    res.json({
      token,
      refreshToken,
      user: user
        ? { id: user._id, email: user.email, name: user.name, role: user.role }
        : undefined,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

router.post('/refresh', validate(refreshSchema), async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokenHash = hashToken(refreshToken);

  try {
    const existing = await RefreshToken.findOne({
      tokenHash,
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (!existing) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    existing.revokedAt = new Date();
    await existing.save();

    const token = generateToken(existing.userId.toString());
    const newRefreshToken = await issueRefreshToken(existing.userId.toString());
    const user = await User.findById(existing.userId);

    res.json({
      token,
      refreshToken: newRefreshToken,
      user: user ? { id: user._id, email: user.email, name: user.name, role: user.role } : undefined,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

router.post('/magic-link/request', validate(magicLinkRequestSchema), async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.json({ sent: true });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MINUTES * 60 * 1000);
    await MagicLinkToken.create({ userId: user._id, tokenHash, expiresAt });

    const link = `${FRONTEND_URL}/admin?magicToken=${token}`;
    await sendAdminMagicLink({ adminEmail: user.email, link });

    res.json({ sent: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send magic link' });
  }
});

router.post('/magic-link/verify', validate(magicLinkVerifySchema), async (req: Request, res: Response) => {
  const { token } = req.body;
  const tokenHash = hashToken(token);

  try {
    const record = await MagicLinkToken.findOne({
      tokenHash,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      res.status(401).json({ error: 'Invalid or expired magic link' });
      return;
    }

    record.usedAt = new Date();
    await record.save();

    const user = await User.findById(record.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const accessToken = generateToken(user._id.toString());
    const refreshToken = await issueRefreshToken(user._id.toString());

    res.json({
      token: accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify magic link' });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
