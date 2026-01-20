import { logger } from '../shared/logger.utils.js';

interface RequiredEnvVars {
  [key: string]: string;
}

/**
 * Validate that all required environment variables are present
 */
export function validateEnvironment(): void {
  const required: RequiredEnvVars = {
    PORT: process.env.PORT || '',
    NODE_ENV: process.env.NODE_ENV || ''
  };

  // Database variables
  required.DATABASE_URL = process.env.DATABASE_URL || '';
  // JWT variables
  required.JWT_SECRET = process.env.JWT_SECRET || '';
  required.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';

  const missing: string[] = [];

  for (const [key, value] of Object.entries(required)) {
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    logger.error('Please check your .env file');
    process.exit(1);
  }

  logger.info('Environment variables validated successfully');
}
