import express from 'express';
import morgan from 'morgan';
import { helmetMiddleware, corsMiddleware, compressionMiddleware, generalRateLimit } from './middleware/security';
import { errorHandler, notFound } from './middleware/errorHandler';
import { logger } from './config/logger';

// Route imports
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import proposalRoutes from './routes/proposal.routes';
import templateRoutes from './routes/template.routes';
import analyticsRoutes from './routes/analytics.routes';
import billingRoutes from './routes/billing.routes';
import publicRoutes from './routes/public.routes';

const app = express();

// ─── Trust proxy (for Render/AWS) ────────────────────────────────────────────
app.set('trust proxy', 1);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compressionMiddleware);

// ─── Stripe Webhook (raw body needed before json parser) ─────────────────────
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── HTTP Logging ─────────────────────────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) },
    skip: (req) => req.path === '/health',
  })
);

// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use('/api/', generalRateLimit);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/public', publicRoutes);   // public proposal viewing (no auth)

// ─── 404 & Error Handling ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
