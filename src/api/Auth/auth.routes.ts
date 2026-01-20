import { Router, Request, Response } from "express";
import { register, login, refreshAccessToken, logout } from "./auth.controller";
import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
} from "./auth.validator";

import { requireAuth } from "./auth.midleware";
import { sendResponse } from "../../shared/api.utils";

export const router = Router();

/**
 * POST /api/auth/register
 * Registrar un nuevo usuario
 */
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  await sendResponse(
    req,
    res,
    () => validateRegister(req.body),
    (validData) => register(validData),
  );
});

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  await sendResponse(
    req,
    res,
    () => validateLogin(req.body),
    (validData) => login(validData),
  );
});

/**
 * POST /api/auth/refresh
 * Refrescar access token
 */
router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  await sendResponse(
    req,
    res,
    () => validateRefreshToken(req.body),
    (validData) => refreshAccessToken(validData),
  );
});

/**
 * POST /api/auth/logout
 * Cerrar sesión (requiere autenticación)
 */
router.post(
  "/logout",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: "Refresh token requerido",
          error: "El refresh token es obligatorio para cerrar sesión",
        });
        return;
      }

      const result = await logout(refreshToken);

      const statusCode = result.statusCode || (result.success ? 200 : 400);
      res.status(statusCode).json({
        success: result.success,
        message: result.message,
        error: result.error,
      });
    } catch (error) {
      console.error("[AUTH] Error en logout:", error);
      res.status(500).json({
        success: false,
        message: "Error al cerrar sesión",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  },
);

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado
 */
router.get(
  "/me",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "No autenticado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Usuario autenticado",
        data: {
          userId: req.user.userId,
          email: req.user.email,
          role: req.user.role,
        },
      });
    } catch (error) {
      console.error("[AUTH] Error en /me:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener información del usuario",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  },
);

export default router;
