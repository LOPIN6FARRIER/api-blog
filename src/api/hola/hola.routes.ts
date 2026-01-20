import { Router } from 'express';
import { getHolaHandler } from './hola.handler.js';

const router = Router();

// ==================== ROUTES ====================

/**
 * @route GET /api/hola
 * @desc Example endpoint - returns a greeting message
 */
router.get('/', getHolaHandler);

export default router;