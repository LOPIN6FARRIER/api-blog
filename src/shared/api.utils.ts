import { Request, Response } from "express";
import { logger } from "./logger.utils.js";

export interface ControllerResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode?: number;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  totalCount?: number;
  hasMorePages?: boolean;
}

export function createSuccessResult<T>(
  message: string,
  data?: T,
  error?: string,
  statusCode = 200,
  currentPage?: number,
  totalPages?: number,
  totalItems?: number,
  totalCount?: number,
  hasMorePages?: boolean,
): ControllerResult<T> {
  return {
    success: true,
    message,
    error,
    statusCode,
    currentPage,
    totalPages,
    totalItems,
    totalCount,
    hasMorePages,
    data,
  };
}

export function createErrorResult(
  message: string,
  error?: string,
  statusCode = 400,
): ControllerResult {
  return { success: false, message, error, statusCode };
}

export interface ValidationResult<T = any> {
  isValid: boolean;
  data?: T;
  errors?: any[];
}

export async function sendResponse<TValidation = any, TResponse = any>(
  req: Request,
  res: Response,
  validator: () => Promise<ValidationResult<TValidation>>,
  controller: (validData: TValidation) => Promise<ControllerResult<TResponse>>,
): Promise<void> {
  try {
    // 1. Execute validation
    const validationResult = await validator();

    if (!validationResult.isValid) {
      // Validation error
      logger.warn({
        message: "Validation failed",
        method: req.method,
        path: req.path,
        errors: validationResult.errors,
      });

      res.status(400).json({
        success: false,
        message: "Invalid data",
        error: "Validation failed",
        details: validationResult.errors,
      });
      return;
    }

    // 2. Execute controller if validation passes
    const controllerResult = await controller(
      validationResult.data as TValidation,
    );

    // 3. Build HTTP response
    const statusCode =
      controllerResult.statusCode || (controllerResult.success ? 200 : 400);

    const response: any = {
      success: controllerResult.success,
      message: controllerResult.message,
    };

    if (controllerResult.error) {
      response.error = controllerResult.error;
    }

    if (controllerResult.totalItems !== undefined) {
      response.totalItems = controllerResult.totalItems;
    }

    if (controllerResult.currentPage !== undefined) {
      response.currentPage = controllerResult.currentPage;
    }

    if (controllerResult.totalPages !== undefined) {
      response.totalPages = controllerResult.totalPages;
    }
    if (controllerResult.hasMorePages !== undefined) {
      response.hasMorePages = controllerResult.hasMorePages;
    }

    if (controllerResult.data !== undefined) {
      response.data = controllerResult.data;
    }

    res.status(statusCode).json(response);
  } catch (error) {
    // Internal server error
    logger.error({
      message: "Internal server error",
      err: error,
      method: req.method,
      path: req.path,
    });

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
