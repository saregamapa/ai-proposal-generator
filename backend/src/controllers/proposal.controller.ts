import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import { aiService } from '../services/ai.service';
import { pdfQueue } from '../workers/pdf.worker';
import { cache } from '../config/redis';
import { config } from '../config';
import { z } from 'zod';
import slugify from 'slugify';

const generateSchema = z.object({ clientId: z.string().optional(), clientName: z.string().min(1), companyName: z.string().min(1), industry: z.string().min(1), services: z.array(z.string()).min(1), budget: z.string().optional(), timeline: z.string().optional(), additionalContext: z.string().max(2000).optional(), templateId: z.string().optional() });

async function checkProposalLimit(userId: string, plan: string): Promise<void> {
  const limit = (config.planLimits as any)[plan]?.proposalsPerMonth;
  if (limit === -1) return;
  const org = await prisma.user.findUnique({ where: { id: userId }, include: { organization: { include: { subscription: true } } } });
  const used = org?.organization?.subscription?.proposalsUsedThisMonth || 0;
  if (used >= limit) throw new AppError(`You've reached your ${limit} proposal limit this month. Upgrade to Pro for unlimited proposals.`, 403, 'LIMIT_REACHED');
}

export const listProposals = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { status, search, page = '1', limit = '20', clientId } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page)); const limitNum = Math.min(100, parseInt(limit));
    const where: any = { userId };
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { client: { companyName: { contains: search, mode: 'insensitive' } } }];
    const [proposals, total] = await Promise.all([prisma.proposal.findMany({ where, skip: (pageNum-1)*limitNum, take: limitNum, orderBy: { updatedAt: 'desc' }, include: { client: { select: { name: true, companyName: true } }, _count: { select: { views: true } } } }), prisma.proposal.count({ where })]);
    res.json({ success: true, data: proposals, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total/limitNum) } });
  } catch (err) { next(err); }
};

export const getProposal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposal = await prisma.proposal.findFirst({ where: { id: req.params.id, userId: req.user!.id }, include: { client: true, template: { select: { id: true, title: true, category: true } }, views: { orderBy: { createdAt: 'desc' }, take: 10 }, activities: { orderBy: { createdAt: 'desc' }, take: 20 }, _count: { select: { views: true } } } });
    if (!proposal) throw new AppError('Proposal not found', 404);
    res.json({ success: true, data: proposal });
  } catch (err) { next(err); }
};

export const generateProposal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = generateSchema.parse(req.body);
    await checkProposalLimit(req.user!.id, req.user!.plan);
    const generated = await aiService.generateProposal({ clientName: data.clientName, companyName: data.companyName, industry: data.industry, services: data.services, budget: data.budget, timeline: data.timeline, additionalContext: data.additionalContext });
    const slug = slugify(`${data.companyName}-proposal-${Date.now()}`, { lower: true, strict: true });
    const proposal = await prisma.proposal.create({ data: { userId: req.user!.id, clientId: data.clientId || null, templateId: data.templateId || null, title: `${data.companyName} — Proposal`, slug, aiGenerated: true, aiModel: config.openai.model, aiTokensUsed: generated.tokensUsed, executiveSummary: generated.executiveSummary, clientProblem: generated.clientProblem, proposedSolution: generated.proposedSolution, scopeOfWork: generated.scopeOfWork, deliverables: generated.deliverables, timeline: generated.timeline, pricingTable: generated.pricingTable, terms: generated.terms, nextSteps: generated.nextSteps, coverPage: { title: `${data.companyName} — Proposal`, subtitle: data.services.join(', '), date: new Date().toISOString() }, totalAmount: generated.totalAmount } });
    await prisma.subscription.updateMany({ where: { organization: { members: { some: { id: req.user!.id } } } }, data: { proposalsUsedThisMonth: { increment: 1 } } });
    await prisma.proposalActivity.create({ data: { proposalId: proposal.id, type: 'created', metadata: { aiGenerated: true } } });
    res.status(201).json({ success: true, data: proposal });
  } catch (err) { next(err); }
};

export const updateProposal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.proposal.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!existing) throw new AppError('Proposal not found', 404);
    const proposal = await prisma.proposal.update({ where: { id: req.params.id }, data: { ...req.body, pdfUrl: null, pdfGeneratedAt: null } });
    await prisma.proposalActivity.create({ data: { proposalId: proposal.id, type: 'edited' } });
    res.json({ success: true, data: proposal });
  } catch (err) { next(err); }
};

export const sendProposal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.proposal.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!existing) throw new AppError('Proposal not found', 404);
    const proposal = await prisma.proposal.update({ where: { id: req.params.id }, data: { status: 'SENT', isPublic: true } });
    await prisma.proposalActivity.create({ data: { proposalId: proposal.id, type: 'sent' } });
    res.json({ success: true, data: { proposal, shareLink: `${config.frontendUrl}/p/${proposal.publicToken}` } });
  } catch (err) { next(err); }
};

export const deleteProposal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.proposal.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!existing) throw new AppError('Proposal not found', 404);
    await prisma.proposal.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Proposal deleted' });
  } catch (err) { next(err); }
};

export const generatePdf = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.proposal.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!existing) throw new AppError('Proposal not found', 404);
    if (existing.pdfUrl && existing.pdfGeneratedAt && Date.now() - existing.pdfGeneratedAt.getTime() < 86400000) { res.json({ success: true, data: { pdfUrl: existing.pdfUrl } }); return; }
    const job = await pdfQueue.add({ proposalId: req.params.id, userId: req.user!.id });
    res.json({ success: true, data: { jobId: job.id, message: 'PDF generation started' } });
  } catch (err) { next(err); }
};

export const duplicateProposal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const original = await prisma.proposal.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!original) throw new AppError('Proposal not found', 404);
    const { id, slug, publicToken, pdfUrl, pdfGeneratedAt, approvedAt, approvedBy, status, createdAt, updatedAt, ...rest } = original;
    const copy = await prisma.proposal.create({ data: { ...rest, title: `${original.title} (Copy)`, slug: slugify(`${original.title}-copy-${Date.now()}`, { lower: true, strict: true }), status: 'DRAFT', isPublic: false } });
    res.status(201).json({ success: true, data: copy });
  } catch (err) { next(err); }
};
