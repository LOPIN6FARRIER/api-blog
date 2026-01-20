import express from 'express';
import path from 'path';
import cors from 'cors';
import router from './api/routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { requestLogger } from './middleware/logger.middleware.js';
import { corsOptions } from './config/cors.config.js';
import { imagesDir } from './middleware/upload.middleware.js';

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve uploaded images from filesystem (configured by upload.middleware)
app.use('/images', express.static(path.resolve(imagesDir)));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to api-blog API',
    version: '1.0.0',
    endpoints: '/api',
    health: '/api/health'
  });
});

app.use('/api', router);

// Error handling
app.use(errorMiddleware);

export default app;
