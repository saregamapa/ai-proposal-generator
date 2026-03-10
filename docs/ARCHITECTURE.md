# AI Proposal Generator — Architecture

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, TailwindCSS, TypeScript |
| Backend | Node.js 20, Express 4, TypeScript |
| Database | PostgreSQL 15 (Prisma ORM) |
| Cache | Redis 7 |
| AI | OpenAI GPT-4o |
| Auth | JWT + Google OAuth 2.0 |
| Payments | Stripe (Subscriptions) |
| Storage | AWS S3 |
| PDF | Puppeteer |
| Queue | Bull (Redis-backed) |
| Email | Resend |
| Deployment | Docker + Render / AWS ECS |

## Subscription Plans

| Plan | Price | Proposals | Analytics | Team |
|------|-------|-----------|-----------|------|
| Free | $0 | 3/month | No | No |
| Pro | $29/mo | Unlimited | Yes | No |
| Agency | $79/mo | Unlimited | Advanced | 5 |
