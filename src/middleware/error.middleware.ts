import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error.util';
import logger from '../utils/logger.util';

/**
 * Error handling middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any[] = [];

  // Handle known application errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    
    // Include validation errors if available
    if ('errors' in err) {
      errors = (err as any).errors;
    }
  } else {
    // Log unexpected errors
    logger.error('Unexpected error:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Send error response
  const response: any = {
    error: message,
    statusCode,
  };

  // Include errors array if present
  if (errors.length > 0) {
    response.errors = errors;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  res.status(404).json({
    error: 'Route not found',
    statusCode: 404,
    path: req.path,
  });
}
