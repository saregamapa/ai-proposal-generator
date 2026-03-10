import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    const [totalProposals, statusBreakdown, recentProposals, totalViews, monthlyProposals] =
      await Promise.all([
        prisma.proposal.count({ where: { userId } }),

        prisma.proposal.groupBy({
          by: ['status'],
          where: { userId },
          _count: { id: true },
        }),

        prisma.proposal.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          include: { client: { select: { name: true, companyName: true } }, _count: { select: { views: true } } },
        }),

        prisma.proposalView.count({ where: { proposal: { userId } } }),

        // Proposals per month (last 6 months)
        prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
          SELECT TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
                 COUNT(*) AS count
          FROM "Proposal"
          WHERE "userId" = ${userId}
            AND "createdAt" >= NOW() - INTERVAL '6 months'
          GROUP BY 1
          ORDER BY 1
        `,
      ]);

    const approvedAmount = await prisma.proposal.aggregate({
      where: { userId, status: 'APPROVED' },
      _sum: { totalAmount: true },
    });

    res.json({
      success: true,
      data: {
        totalProposals,
        totalViews,
        approvedAmount: approvedAmount._sum.totalAmount || 0,
        statusBreakdown: Object.fromEntries(statusBreakdown.map((s) => [s.status, s._count.id])),
        recentProposals,
        monthlyProposals: monthlyProposals.map((m) => ({ month: m.month, count: Number(m.count) })),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getProposalAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposal = await prisma.proposal.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: {
        views: { orderBy: { createdAt: 'desc' } },
        activities: { orderBy: { createdAt: 'desc' } },
        _count: { select: { views: true } },
      },
    });

    if (!proposal) throw new AppError('Proposal not found', 404);

    const avgDuration =
      proposal.views.reduce((sum, v) => sum + (v.duration || 0), 0) /
      (proposal.views.length || 1);

    const uniqueIps = new Set(proposal.views.map((v) => v.viewerIp)).size;

    res.json({
      success: true,
      data: {
        totalViews: proposal._count.views,
        uniqueVisitors: uniqueIps,
        avgTimeSpent: Math.round(avgDuration),
        views: proposal.views,
        activities: proposal.activities,
        status: proposal.status,
        approvedAt: proposal.approvedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Track a public proposal view (called from public routes)
export const trackView = async (
  proposalId: string,
  ip: string | undefined,
  userAgent: string | undefined,
  referrer: string | undefined
): Promise<void> => {
  await prisma.proposalView.create({
    data: { proposalId, viewerIp: ip, viewerAgent: userAgent, referrer },
  });
};
