import 'reflect-metadata';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { connectDatabase } from './config/database.config';
import { connectRedis } from './config/redis.config';
import routes from './routes';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import logger from './utils/logger.util';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Secret'],
        credentials: true,
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(requestLogger);

    // Trust proxy (for rate limiting behind reverse proxy)
    this.app.set('trust proxy', 1);
  }

  private initializeRoutes(): void {
    // Mount API routes
    this.app.use('/api', routes);

    // Health check at root (for load balancers)
    this.app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'OK' });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to databases
      await this.connectDatabases();

      // Start server
      const PORT = config.port;
      this.app.listen(PORT, () => {
        logger.info('🚀 OTP Microservice started successfully', {
          port: PORT,
          environment: config.env,
          nodeVersion: process.version,
        });
        logger.info('📊 Configuration:', {
          mongoUri: config.mongo.uri.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
          redisUri: config.redis.uri.replace(/\/\/.*@/, '//***:***@'),
          otpExpiry: `${config.otp.expirySeconds}s`,
        });
      });

      // Graceful shutdown
      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('Failed to start application:', error);
      process.exit(1);
    }
  }

  private async connectDatabases(): Promise<void> {
    try {
      logger.info('Connecting to databases...');

      // Connect to MongoDB
      await connectDatabase();

      // Connect to Redis
      await connectRedis();

      logger.info('✅ All database connections established');
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      // Close server
      const { disconnectDatabase } = await import('./config/database.config');
      const { disconnectRedis } = await import('./config/redis.config');

      try {
        await disconnectDatabase();
        await disconnectRedis();
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Listen for termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection:', { reason, promise });
      process.exit(1);
    });
  }
}

// Bootstrap application
const application = new App();

if (process.env.NODE_ENV !== 'test') {
  application.start();
}

export default application.app;
