import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { redis } from '../config/redis';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId: string | null;
    plan: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Check token blacklist (for logout)
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) throw new AppError('Token has been revoked', 401);

    const decoded = jwt.verify(token, config.jwt.accessSecret) as {
      userId: string;
      email: string;
    };

    // Fetch user with subscription
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: {
          include: { subscription: true },
        },
      },
    });

    if (!user) throw new AppError('User not found', 401);

    const plan = user.organization?.subscription?.plan || 'FREE';

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      plan,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else if (err instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else {
      next(err);
    }
  }
};

export const requirePlan = (minPlan: 'FREE' | 'PRO' | 'AGENCY') => {
  const planRank = { FREE: 0, PRO: 1, AGENCY: 2 };
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    const userPlan = (req.user?.plan || 'FREE') as keyof typeof planRank;
    if (planRank[userPlan] < planRank[minPlan]) {
      return next(new AppError(`This feature requires the ${minPlan} plan`, 403));
    }
    next();
  };
};
