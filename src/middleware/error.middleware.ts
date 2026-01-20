import { Request, Response, NextFunction } from 'express';
import { logger } from '../shared/logger.utils.js';

export interface ApiError extends Error {
  statusCode?: number;
}

export function errorMiddleware(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error({
    err,
    req: {
      method: req.method,
      url: req.url,
      headers: req.headers
    },
    statusCode
  }, message);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
