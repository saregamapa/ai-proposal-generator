import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import { cache } from '../config/redis';
import { z } from 'zod';

const clientSchema = z.object({ name: z.string().min(1).max(100), companyName: z.string().min(1).max(200), email: z.string().email(), website: z.string().url().optional().or(z.literal('')), industry: z.string().max(100).optional(), phone: z.string().max(30).optional(), address: z.string().max(500).optional(), notes: z.string().max(2000).optional() });

export const listClients = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page)); const limitNum = Math.min(100, parseInt(limit));
    const where: any = { userId };
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { companyName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }];
    const [clients, total] = await Promise.all([prisma.client.findMany({ where, skip: (pageNum-1)*limitNum, take: limitNum, orderBy: { createdAt: 'desc' }, include: { _count: { select: { proposals: true } } } }), prisma.client.count({ where })]);
    res.json({ success: true, data: clients, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total/limitNum) } });
  } catch (err) { next(err); }
};

export const getClient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const client = await prisma.client.findFirst({ where: { id: req.params.id, userId: req.user!.id }, include: { proposals: { orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, title: true, status: true, totalAmount: true, createdAt: true } }, _count: { select: { proposals: true } } } });
    if (!client) throw new AppError('Client not found', 404);
    res.json({ success: true, data: client });
  } catch (err) { next(err); }
};

export const createClient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = clientSchema.parse(req.body);
    const client = await prisma.client.create({ data: { ...data, userId: req.user!.id } });
    await cache.delPattern(`clients:${req.user!.id}:*`);
    res.status(201).json({ success: true, data: client });
  } catch (err) { next(err); }
};

export const updateClient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = clientSchema.partial().parse(req.body);
    const existing = await prisma.client.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!existing) throw new AppError('Client not found', 404);
    const client = await prisma.client.update({ where: { id: req.params.id }, data });
    await cache.delPattern(`clients:${req.user!.id}:*`);
    res.json({ success: true, data: client });
  } catch (err) { next(err); }
};

export const deleteClient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.client.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!existing) throw new AppError('Client not found', 404);
    await prisma.client.delete({ where: { id: req.params.id } });
    await cache.delPattern(`clients:${req.user!.id}:*`);
    res.json({ success: true, message: 'Client deleted' });
  } catch (err) { next(err); }
};
