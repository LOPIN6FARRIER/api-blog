import {
  ControllerResult,
  createSuccessResult,
  createErrorResult,
} from "../../shared/api.utils.js";
import { HolaQuery } from "./hola.validator.js";
import { logger } from "../../shared/logger.utils.js";

/**
 * Get hola message
 */
export async function getHola(
  queryData: HolaQuery,
): Promise<ControllerResult<{ message: string; timestamp: string }>> {
  try {
    const name = queryData.name || "World";
    logger.debug({ message: "Processing hola request", name });

    return createSuccessResult("Hola endpoint working!", {
      message: `Hola ${name}! Welcome to your API 🚀`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ message: "Error in getHola controller", err: error });
    return createErrorResult(
      "Failed to get hola message",
      error instanceof Error ? error.message : "Unknown error",
      500,
    );
  }
}
