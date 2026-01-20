import { Request, Response, NextFunction } from 'express';
import { logRequest } from '../shared/logger.utils.js';

/**
 * Express middleware to log all HTTP requests
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Log response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logRequest(req.method, req.url, res.statusCode, duration);
  });

  next();
}
