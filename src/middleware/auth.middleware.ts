import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { ForbiddenError } from '../utils/app-error.util';
import logger from '../utils/logger.util';

/**
 * Authenticate client using shared secret key
 */
export function authenticateClient(req: Request, _res: Response, next: NextFunction): void {
  try {
    const clientSecret = req.header('X-Client-Secret');

    if (!clientSecret || clientSecret !== config.security.clientSecretKey) {
      logger.warn('Unauthorized API access attempt', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('user-agent'),
      });
      
      throw new ForbiddenError('Invalid or missing client secret key');
    }

    next();
  } catch (error) {
    next(error);
  }
}
