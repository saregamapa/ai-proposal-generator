import { Router } from 'express';
import { getPlans, createCheckoutSession, createPortalSession, getSubscription, handleWebhook } from '../controllers/billing.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Stripe webhook — must be before JSON middleware (raw body)
router.post('/webhook', handleWebhook);

// Public
router.get('/plans', getPlans);

// Protected
router.use(authenticate);
router.get('/subscription', getSubscription);
router.post('/checkout', createCheckoutSession);
router.post('/portal', createPortalSession);

export default router;
