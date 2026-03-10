import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const templateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['MARKETING', 'SEO', 'WEB_DEVELOPMENT', 'CONSULTING', 'AI_AUTOMATION', 'CUSTOM']),
  content: z.record(z.any()),
  isPublic: z.boolean().optional().default(false),
});

export const listTemplates = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { category } = req.query;

    const where: any = {
      OR: [
        { isSystem: true },
        { userId },
        { isPublic: true },
      ],
    };
    if (category) where.category = category;

    const templates = await prisma.proposalTemplate.findMany({
      where,
      orderBy: [{ isSystem: 'desc' }, { usageCount: 'desc' }],
      include: { _count: { select: { proposals: true } } },
    });

    res.json({ success: true, data: templates });
  } catch (err) {
    next(err);
  }
};

export const getTemplate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const template = await prisma.proposalTemplate.findFirst({
      where: {
        id: req.params.id,
        OR: [{ isSystem: true }, { userId: req.user!.id }, { isPublic: true }],
      },
    });
    if (!template) throw new AppError('Template not found', 404);
    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
};

export const createTemplate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = templateSchema.parse(req.body);
    const template = await prisma.proposalTemplate.create({
      data: { ...data, userId: req.user!.id },
    });
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
};

export const updateTemplate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = templateSchema.partial().parse(req.body);
    const existing = await prisma.proposalTemplate.findFirst({
      where: { id: req.params.id, userId: req.user!.id, isSystem: false },
    });
    if (!existing) throw new AppError('Template not found or not editable', 404);
    const template = await prisma.proposalTemplate.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
};

export const deleteTemplate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.proposalTemplate.findFirst({
      where: { id: req.params.id, userId: req.user!.id, isSystem: false },
    });
    if (!existing) throw new AppError('Template not found or not deletable', 404);
    await prisma.proposalTemplate.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Template deleted' });
  } catch (err) {
    next(err);
  }
};
