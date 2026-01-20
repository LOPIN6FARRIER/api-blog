import app from './app.js';
import dotenv from 'dotenv';
import { logger } from './shared/logger.utils.js';
import { validateEnvironment } from './config/env.validator.js';

dotenv.config();

// Validate required environment variables
validateEnvironment();

const PORT = process.env.PORT || 3055;

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`API endpoints available at http://localhost:${PORT}/api`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});
