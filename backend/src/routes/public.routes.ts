import { Router } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { trackView } from '../controllers/analytics.controller';

const router = Router();

// Public proposal view by token
router.get('/proposals/:token', async (req, res, next) => {
  try {
    const proposal = await prisma.proposal.findFirst({
      where: { publicToken: req.params.token, isPublic: true },
      include: { client: { select: { name: true, companyName: true, industry: true } } },
    });

    if (!proposal) throw new AppError('Proposal not found or not public', 404);

    if (proposal.expiresAt && proposal.expiresAt < new Date()) {
      throw new AppError('This proposal has expired', 410);
    }

    trackView(
      proposal.id,
      req.ip,
      req.headers['user-agent'],
      req.headers['referer']
    ).catch(() => {});

    const { passwordHash: _, viewPassword: __, ...safe } = proposal as any;
    res.json({ success: true, data: safe });
  } catch (err) {
    next(err);
  }
});

router.post('/proposals/:token/approve', async (req, res, next) => {
  try {
    const { clientName, clientEmail, note } = req.body;
    const proposal = await prisma.proposal.findFirst({
      where: { publicToken: req.params.token, isPublic: true },
    });

    if (!proposal) throw new AppError('Proposal not found', 404);
    if (proposal.status === 'APPROVED') throw new AppError('Proposal already approved', 400);

    await prisma.proposal.update({
      where: { id: proposal.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: `${clientName} <${clientEmail}>`,
        approvalNote: note,
      },
    });

    await prisma.proposalActivity.create({
      data: {
        proposalId: proposal.id,
        type: 'approved',
        actorName: clientName,
        actorEmail: clientEmail,
        metadata: { note },
      },
    });

    res.json({ success: true, message: 'Proposal approved successfully!' });
  } catch (err) {
    next(err);
  }
});

router.post('/proposals/:token/reject', async (req, res, next) => {
  try {
    const { clientName, clientEmail, reason } = req.body;
    const proposal = await prisma.proposal.findFirst({ where: { publicToken: req.params.token, isPublic: true } });
    if (!proposal) throw new AppError('Proposal not found', 404);

    await prisma.proposal.update({ where: { id: proposal.id }, data: { status: 'REJECTED' } });
    await prisma.proposalActivity.create({
      data: { proposalId: proposal.id, type: 'rejected', actorName: clientName, actorEmail: clientEmail, metadata: { reason } },
    });

    res.json({ success: true, message: 'Response recorded' });
  } catch (err) {
    next(err);
  }
});

export default router;
