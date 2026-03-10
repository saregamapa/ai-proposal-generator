import { Router } from 'express';
import { getDashboardStats, getProposalAnalytics } from '../controllers/analytics.controller';
import { authenticate, requirePlan } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/proposals/:id', requirePlan('PRO'), getProposalAnalytics);

export default router;
