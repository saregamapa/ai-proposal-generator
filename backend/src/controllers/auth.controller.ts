import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { redis } from '../config/redis';
import { emailService } from '../services/email.service';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import crypto from 'crypto';
import slugify from 'slugify';

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = signupSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: `${name}'s Workspace`,
          slug: slugify(`${name}-${Date.now()}`, { lower: true, strict: true }),
          owner: { connect: { id: 'placeholder' } },
        },
      });

      const newUser = await tx.user.create({
        data: { name, email, passwordHash, emailVerifyToken, organizationId: org.id },
      });

      await tx.organization.update({ where: { id: org.id }, data: { ownerId: newUser.id } });

      await tx.subscription.create({
        data: { organizationId: org.id, stripeCustomerId: `pending_${newUser.id}`, plan: 'FREE', status: 'ACTIVE' },
      });

      return newUser;
    });

    await emailService.sendVerification(email, name, emailVerifyToken);
    const tokens = generateTokenPair({ userId: user.id, email: user.email });

    res.status(201).json({ success: true, message: 'Account created. Please verify your email.', data: { user: { id: user.id, name: user.name, email: user.email }, ...tokens } });
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email }, include: { organization: { include: { subscription: true } } } });
    if (!user || !user.passwordHash) throw new AppError('Invalid credentials', 401);
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new AppError('Invalid credentials', 401);
    const tokens = generateTokenPair({ userId: user.id, email: user.email });
    await redis.set(`refresh:${user.id}`, tokens.refreshToken, 'EX', 60 * 60 * 24 * 7);
    res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, plan: user.organization?.subscription?.plan || 'FREE' }, ...tokens } });
  } catch (err) { next(err); }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new AppError('Refresh token required', 400);
    const payload = verifyRefreshToken(token);
    const stored = await redis.get(`refresh:${payload.userId}`);
    if (!stored || stored !== token) throw new AppError('Invalid refresh token', 401);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new AppError('User not found', 401);
    const tokens = generateTokenPair({ userId: user.id, email: user.email });
    await redis.set(`refresh:${user.id}`, tokens.refreshToken, 'EX', 60 * 60 * 24 * 7);
    res.json({ success: true, data: tokens });
  } catch (err) { next(err); }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) await redis.set(`blacklist:${token}`, '1', 'EX', 60 * 15);
    if (req.user) await redis.del(`refresh:${req.user.id}`);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExpiry: new Date(Date.now() + 3600000) } });
      await emailService.sendPasswordReset(email, user.name, resetToken);
    }
    res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  } catch (err) { next(err); }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = z.object({ token: z.string(), password: z.string().min(8) }).parse(req.body);
    const user = await prisma.user.findFirst({ where: { resetToken: token, resetTokenExpiry: { gt: new Date() } } });
    if (!user) throw new AppError('Invalid or expired reset token', 400);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(password, 12), resetToken: null, resetTokenExpiry: null } });
    await redis.del(`refresh:${user.id}`);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) { next(err); }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findFirst({ where: { emailVerifyToken: req.params.token } });
    if (!user) throw new AppError('Invalid verification token', 400);
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true, emailVerifyToken: null } });
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) { next(err); }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { organization: { include: { subscription: true } } } });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, emailVerified: user.emailVerified, role: user.role, organization: user.organization, plan: user.organization?.subscription?.plan || 'FREE', subscription: user.organization?.subscription } });
  } catch (err) { next(err); }
};
