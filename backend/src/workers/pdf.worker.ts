import Bull from 'bull';
import { config } from '../config';
import { pdfService } from '../services/pdf.service';
import { logger } from '../config/logger';

export const pdfQueue = new Bull('pdf-generation', config.redisUrl, { defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 50, removeOnFail: 100 } });

pdfQueue.process(2, async (job) => {
  const { proposalId } = job.data;
  logger.info('Processing PDF job', { jobId: job.id, proposalId });
  try {
    const pdfUrl = await pdfService.generateProposalPdf(proposalId);
    logger.info('PDF job complete', { jobId: job.id, proposalId, pdfUrl });
    return { pdfUrl };
  } catch (err: any) {
    logger.error('PDF job failed', { jobId: job.id, proposalId, error: err.message });
    throw err;
  }
});

pdfQueue.on('completed', (job, result) => logger.info('PDF job completed', { jobId: job.id, ...result }));
pdfQueue.on('failed', (job, err) => logger.error('PDF job failed permanently', { jobId: job.id, error: err.message }));
