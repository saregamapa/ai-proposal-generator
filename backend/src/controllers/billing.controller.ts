import { Request, Response, NextFunction } from 'express';
import { stripeService } from '../services/stripe.service';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import { config } from '../config';
import Stripe from 'stripe';

export const getPlans = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({ success: true, data: [{ id: 'FREE', name: 'Free', price: 0, features: ['3 proposals/month', 'AI generation', 'PDF export'] }, { id: 'PRO', name: 'Pro', price: 29, interval: 'month', stripePriceId: config.stripe.prices.pro, features: ['Unlimited proposals', 'Analytics'] }, { id: 'AGENCY', name: 'Agency', price: 79, interval: 'month', stripePriceId: config.stripe.prices.agency, features: ['Unlimited proposals', 'Custom branding', '5 team members'] }] });
  } catch (err) { next(err); }
};

export const createCheckoutSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { plan } = req.body;
    if (!['PRO', 'AGENCY'].includes(plan)) throw new AppError('Invalid plan', 400);
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { organization: { include: { subscription: true } } } });
    if (!user?.organization) throw new AppError('Organization not found', 404);
    let customerId = user.organization.subscription?.stripeCustomerId;
    if (!customerId || customerId.startsWith('pending_')) {
      const customer = await stripeService.createCustomer(user.email, user.name);
      customerId = customer.id;
      await prisma.subscription.update({ where: { organizationId: user.organization.id }, data: { stripeCustomerId: customerId } });
    }
    const priceId = plan === 'PRO' ? config.stripe.prices.pro : config.stripe.prices.agency;
    const session = await stripeService.createCheckoutSession({ customerId, priceId, successUrl: `${config.frontendUrl}/billing?success=true`, cancelUrl: `${config.frontendUrl}/billing?canceled=true`, metadata: { userId: req.user!.id, orgId: user.organization.id, plan } });
    res.json({ success: true, data: { url: session.url, sessionId: session.id } });
  } catch (err) { next(err); }
};

export const createPortalSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { organization: { include: { subscription: true } } } });
    const customerId = user?.organization?.subscription?.stripeCustomerId;
    if (!customerId || customerId.startsWith('pending_')) throw new AppError('No active subscription', 400);
    const session = await stripeService.createPortalSession(customerId, `${config.frontendUrl}/billing`);
    res.json({ success: true, data: { url: session.url } });
  } catch (err) { next(err); }
};

export const getSubscription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { organization: { include: { subscription: { include: { invoices: { orderBy: { createdAt: 'desc' }, take: 10 } } } } } } });
    res.json({ success: true, data: user?.organization?.subscription || null });
  } catch (err) { next(err); }
};

export const handleWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;
  try { event = stripeService.constructEvent(req.body, sig, config.stripe.webhookSecret); }
  catch { res.status(400).send('Webhook signature verification failed'); return; }
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { orgId, plan } = session.metadata!;
        await prisma.subscription.update({ where: { organizationId: orgId }, data: { stripeCustomerId: session.customer as string, stripeSubscriptionId: session.subscription as string, plan: plan as any, status: 'ACTIVE' } });
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const sub = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: invoice.subscription as string } });
        if (sub) {
          await prisma.invoice.create({ data: { subscriptionId: sub.id, stripeInvoiceId: invoice.id, amount: invoice.amount_paid, currency: invoice.currency, status: 'paid', invoiceUrl: invoice.hosted_invoice_url, paidAt: new Date() } });
          await prisma.subscription.update({ where: { id: sub.id }, data: { proposalsUsedThisMonth: 0, status: 'ACTIVE' } });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({ where: { stripeSubscriptionId: subscription.id }, data: { plan: 'FREE', status: 'CANCELED', stripeSubscriptionId: null } });
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({ where: { stripeSubscriptionId: subscription.id }, data: { status: subscription.status.toUpperCase() as any, cancelAtPeriodEnd: subscription.cancel_at_period_end, currentPeriodEnd: new Date(subscription.current_period_end * 1000) } });
        break;
      }
    }
    res.json({ received: true });
  } catch (err) { next(err); }
};
