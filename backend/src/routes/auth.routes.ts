import { Router } from 'express';
import passport from 'passport';
import { signup, login, logout, refreshToken, forgotPassword, resetPassword, verifyEmail, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authRateLimit } from '../middleware/security';

const router = Router();

// Public routes
router.post('/signup', authRateLimit, signup);
router.post('/login', authRateLimit, login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', authRateLimit, forgotPassword);
router.post('/reset-password', authRateLimit, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=oauth' }),
  (req: any, res) => {
    const { accessToken, refreshToken } = req.user;
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
  }
);

// Protected routes
router.use(authenticate);
router.get('/me', getMe);
router.post('/logout', logout);

export default router;
