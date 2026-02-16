import { katax } from "katax-service-manager";

/**
 * Lazy logger proxy - forwards calls to katax.logger after init()
 * This allows importing { logger } without causing errors before init()
 */
export const logger = new Proxy({} as typeof katax.logger, {
  get(_, prop: string) {
    return (katax.logger as any)[prop];
  },
});

/**
 * Log HTTP request
 */
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
): void {
  const payload = {
    message: `${method} ${url} - ${statusCode} (${duration}ms)`,
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
  };

  if (statusCode >= 500) {
    // critical server error: broadcast live and persist to Redis
    katax.logger.error({ ...payload, broadcast: true, persist: true });
  } else if (statusCode >= 400) {
    // client error: broadcast but don't force persist
    katax.logger.warn({ ...payload, broadcast: true });
  } else {
    katax.logger.info({ ...payload, broadcast: true });
  }
}

/**
 * Log error with context
 */
export function logError(error: Error, context?: Record<string, any>): void {
  katax.logger.error({
    message: error.message,
    err: error,
    ...context,
    broadcast: true,
  });
}

/**
 * Log info message
 */
export function logInfo(message: string, data?: Record<string, any>): void {
  katax.logger.info({ message, ...data, broadcast: true });
}

/**
 * Log warning message
 */
export function logWarning(message: string, data?: Record<string, any>): void {
  katax.logger.warn({ message, ...data, broadcast: true });
}

/**
 * Log debug message
 */
export function logDebug(message: string, data?: Record<string, any>): void {
  katax.logger.debug({ message, ...data, broadcast: true });
}
