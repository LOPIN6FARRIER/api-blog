import { k, kataxInfer } from 'katax-core';
import type { ValidationResult } from '../../shared/api.utils.js';

// ==================== SCHEMAS ====================

/**
 * Schema for hola query params
 */
export const holaQuerySchema = k.object({
  name: k.string().minLength(2).optional()
});

/**
 * Inferred TypeScript type from schema
 */
export type HolaQuery = kataxInfer<typeof holaQuerySchema>;

/**
 * Validate hola query params
 */
export async function validateHolaQuery(data: unknown): Promise<ValidationResult<HolaQuery>> {
  const result = holaQuerySchema.safeParse(data);

  if (!result.success) {
    const errors = result.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));

    return {
      isValid: false,
      errors
    };
  }

  return {
    isValid: true,
    data: result.data
  };
}