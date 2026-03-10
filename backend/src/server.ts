import app from './app';
import { config } from './config';
import { connectDatabase } from './config/database';
import { redis } from './config/redis';
import { logger } from './config/logger';

const start = async (): Promise<void> => {
  await connectDatabase();
  await redis.ping();
  logger.info('Redis ready');

  const server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} [${config.env}]`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await redis.quit();
      logger.info('Server closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason });
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { error: err.message });
    process.exit(1);
  });
};

start().catch((err) => {
  logger.error('Failed to start server', { error: err.message });
  process.exit(1);
});
