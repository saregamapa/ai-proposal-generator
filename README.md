# AI Proposal Generator

AI-powered SaaS for generating professional business proposals using GPT-4o. Users sign up (email or Google), create clients, pick a template or start from scratch, and the AI fills sections (executive summary, scope, pricing, etc.). Proposals can be edited, sent by email, shared via public link, and exported to PDF. Billing is subscription-based (Free / Pro / Agency) via Stripe.

**Stack:** Next.js 14, Express, TypeScript, PostgreSQL (Prisma), Redis (Bull), OpenAI GPT-4o, Stripe, Resend, AWS S3, Puppeteer (PDF).

---

## Run locally

**Prerequisites:** Node 20+, Docker (for Postgres and Redis), or local Postgres and Redis.

### Option A — Docker for DB + Redis (recommended)

1. Clone and copy env:
   ```bash
   git clone https://github.com/saregamapa/ai-proposal-generator.git
   cd ai-proposal-generator
   cp .env.example .env
   ```
2. Edit `.env`: set `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `OPENAI_API_KEY` at minimum. You can leave Stripe/S3/Resend/Google as placeholders for a minimal run (AI generate and DB will work; send email / PDF / billing will need real keys).
3. Start Postgres and Redis:
   ```bash
   docker compose up postgres redis -d
   ```
4. Backend:
   ```bash
   cd backend && npm ci && npx prisma generate && npx prisma migrate deploy && npx prisma db seed
   npm run dev
   ```
   API: http://localhost:4000 — health: http://localhost:4000/health
5. Frontend (new terminal):
   ```bash
   cd frontend && npm ci
   # Ensure .env has NEXT_PUBLIC_API_URL=http://localhost:4000/api
   npm run dev
   ```
   App: http://localhost:3000

### Option B — Bootstrap script

```bash
./bootstrap.sh
# Edit .env with your API keys, then:
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
```

---

## Deploy to Render

1. **Connect repo:** In [Render Dashboard](https://dashboard.render.com), New → Blueprint, connect this repo. Render will read `render.yaml` and create:
   - Web service **proposal-api** (backend)
   - Web service **proposal-frontend** (Next.js)
   - PostgreSQL **proposal-db**
   - Key Value (Redis) **proposal-redis**

2. **Environment variables:** Set all `sync: false` vars in the dashboard for both services (see `.env.example`):
   - **proposal-api:** `OPENAI_API_KEY`, Stripe keys, `STRIPE_PRO_PRICE_ID`, `STRIPE_AGENCY_PRICE_ID`, AWS S3, `RESEND_API_KEY`, Google OAuth, `FRONTEND_URL`, `ALLOWED_ORIGINS`. JWT secrets are auto-generated.
   - **proposal-frontend:** `NEXT_PUBLIC_API_URL` (e.g. `https://proposal-api.onrender.com/api`).

3. **Stripe:** Create Pro ($29/mo) and Agency ($79/mo) products, set Price IDs, add webhook `https://<your-api-url>/api/billing/webhook`, enable `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`, and set `STRIPE_WEBHOOK_SECRET`. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

4. Deploy; first run will run Prisma migrations and start the API and frontend.

---

## Docs

- [Deployment guide](docs/DEPLOYMENT.md) — Stripe setup, security checklist  
- [Architecture](docs/ARCHITECTURE.md) — Tech stack, plans  
- [Folder structure](docs/FOLDER_STRUCTURE.md) — Codebase layout  
