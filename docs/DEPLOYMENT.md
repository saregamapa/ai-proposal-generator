# Deployment Guide — AI Proposal Generator

## Local Development

```bash
git clone https://github.com/saregamapa/ai-proposal-generator.git
cd ai-proposal-generator
cp .env.example .env
# Fill in API keys in .env
docker compose up postgres redis -d
cd backend && npm install && npx prisma migrate deploy && npx prisma db seed && npm run dev
# In new terminal:
cd frontend && npm install && npm run dev
```

## Deploy to Render.com

This repo includes `render.yaml` for one-click deploy. Connect the repo in Render dashboard and fill in environment variables.

## Stripe Setup

1. Create Pro ($29/mo) and Agency ($79/mo) products in Stripe Dashboard
2. Copy Price IDs to `STRIPE_PRO_PRICE_ID` and `STRIPE_AGENCY_PRICE_ID`
3. Set webhook endpoint: `https://yourdomain.com/api/billing/webhook`
4. Enable events: checkout.session.completed, invoice.payment_succeeded, customer.subscription.deleted
5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Security Checklist

- [ ] All secrets generated with `openssl rand -base64 64`
- [ ] HTTPS enforced
- [ ] Stripe webhook signature verified
- [ ] Rate limiting enabled
- [ ] JWT tokens expire (15min access, 7d refresh)
