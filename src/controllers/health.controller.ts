import { Request, Response, NextFunction } from 'express';
import { isDatabaseConnected } from '../config/database.config';
import { isRedisConnected } from '../config/redis.config';
import logger from '../utils/logger.util';

export class HealthController {
  /**
   * Basic health check
   * GET /api/v1/health
   */
  async healthCheck(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Detailed health check with dependencies
   * GET /api/v1/health/detailed
   */
  async detailedHealthCheck(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mongoStatus = isDatabaseConnected();
      const redisStatus = await isRedisConnected();

      const allHealthy = mongoStatus && redisStatus;
      const statusCode = allHealthy ? 200 : 503;

      const response = {
        status: allHealthy ? 'OK' : 'DEGRADED',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        services: {
          mongodb: mongoStatus ? 'connected' : 'disconnected',
          redis: redisStatus ? 'connected' : 'disconnected',
        },
        memory: {
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        },
      };

      if (!allHealthy) {
        logger.warn('Service health check failed', response);
      }

      res.status(statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Readiness check for orchestration tools (Kubernetes, etc.)
   * GET /api/v1/health/ready
   */
  async readinessCheck(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mongoStatus = isDatabaseConnected();
      const redisStatus = await isRedisConnected();

      if (mongoStatus && redisStatus) {
        res.status(200).json({ status: 'READY' });
      } else {
        res.status(503).json({ 
          status: 'NOT_READY',
          mongodb: mongoStatus,
          redis: redisStatus,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Liveness check for orchestration tools
   * GET /api/v1/health/live
   */
  async livenessCheck(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    // Simple check that the application is running
    res.status(200).json({ status: 'ALIVE' });
  }
}

export default new HealthController();
