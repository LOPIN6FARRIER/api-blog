import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Pino logger configuration
 * - Pretty printing in development
 * - JSON logs in production
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname'
        }
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    }
  }
});

/**
 * Log HTTP request
 */
export function logRequest(method: string, url: string, statusCode: number, duration: number): void {
  logger.info({
    method,
    url,
    statusCode,
    duration: `${duration}ms`
  }, `${method} ${url} - ${statusCode} (${duration}ms)`);
}

/**
 * Log error with context
 */
export function logError(error: Error, context?: Record<string, any>): void {
  logger.error({
    err: error,
    ...context
  }, error.message);
}

/**
 * Log info message
 */
export function logInfo(message: string, data?: Record<string, any>): void {
  logger.info(data, message);
}

/**
 * Log warning message
 */
export function logWarning(message: string, data?: Record<string, any>): void {
  logger.warn(data, message);
}

/**
 * Log debug message (only in development)
 */
export function logDebug(message: string, data?: Record<string, any>): void {
  logger.debug(data, message);
}
