import { Request, Response } from 'express';
import { getHola } from './hola.controller.js';
import { validateHolaQuery } from './hola.validator.js';
import { sendResponse } from '../../shared/api.utils.js';

// ==================== HANDLERS ====================

/**
 * Handler for GET /api/hola
 * Uses sendResponse utility for automatic validation and response handling
 */
export async function getHolaHandler(req: Request, res: Response): Promise<void> {
  await sendResponse(
    req,
    res,
    // Validator returns Promise<ValidationResult<HolaQuery>>
    () => validateHolaQuery(req.query),
    // validData is automatically: HolaQuery (not any)
    (validData) => getHola(validData)
  );
}