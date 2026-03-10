import Stripe from 'stripe';
import { config } from '../config';

const stripe = new Stripe(config.stripe.secretKey, { apiVersion: '2024-06-20' });

export const stripeService = {
  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    return stripe.customers.create({ email, name });
  },
  async createCheckoutSession(params: { customerId: string; priceId: string; successUrl: string; cancelUrl: string; metadata: Record<string, string>; }): Promise<Stripe.Checkout.Session> {
    return stripe.checkout.sessions.create({ customer: params.customerId, payment_method_types: ['card'], line_items: [{ price: params.priceId, quantity: 1 }], mode: 'subscription', success_url: params.successUrl, cancel_url: params.cancelUrl, metadata: params.metadata, subscription_data: { trial_period_days: 7 }, allow_promotion_codes: true });
  },
  async createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    return stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
  },
  constructEvent(payload: Buffer, sig: string, secret: string): Stripe.Event {
    return stripe.webhooks.constructEvent(payload, sig, secret);
  },
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return stripe.subscriptions.retrieve(subscriptionId);
  },
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
  },
};
