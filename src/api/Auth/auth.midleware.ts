import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "./auth.interfaces";
import { verifyAccessToken } from "../../shared/jwt.utils";

// Extender Request de Express para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware para verificar autenticación
 * Requiere que el usuario esté autenticado
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    // 1. Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "No autorizado",
        error: "Token no proporcionado",
      });
      return;
    }

    // 2. Extraer token
    const token = authHeader.substring(7); // Remover "Bearer "

    // 3. Verificar token
    const payload = verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        message: "No autorizado",
        error: "Token inválido o expirado",
      });
      return;
    }

    // 4. Agregar user al request
    req.user = payload;

    console.log(
      `[AUTH] Usuario autenticado: ${payload.email} (${payload.role})`,
    );

    next();
  } catch (error) {
    console.error("[AUTH] Error en middleware de autenticación:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}

/**
 * Middleware para verificar rol específico
 * Requiere que el usuario tenga uno de los roles permitidos
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "No autorizado",
          error: "Debe estar autenticado para acceder a este recurso",
        });
        return;
      }

      // Verificar que tenga el rol requerido
      if (!allowedRoles.includes(req.user.role)) {
        console.log(
          `[AUTH] Acceso denegado - Usuario: ${req.user.email}, Rol: ${req.user.role}, Roles permitidos: ${allowedRoles.join(", ")}`,
        );

        res.status(403).json({
          success: false,
          message: "Acceso denegado",
          error: "No tienes permisos para acceder a este recurso",
        });
        return;
      }

      console.log(
        `[AUTH] Acceso permitido - Usuario: ${req.user.email}, Rol: ${req.user.role}`,
      );

      next();
    } catch (error) {
      console.error("[AUTH] Error en middleware de roles:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };
}

/**
 * Middleware opcional de autenticación
 * Agrega user si está autenticado, pero no requiere autenticación
 */
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);

      if (payload) {
        req.user = payload;
        console.log(`[AUTH] Usuario opcional autenticado: ${payload.email}`);
      }
    }

    next();
  } catch (error) {
    // No hacer nada, solo continuar
    next();
  }
}

/**
 * Middleware para verificar que el usuario es el dueño del recurso
 */
export function requireOwnership(
  getUserIdFromParams: (req: Request) => string,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "No autorizado",
          error: "Debe estar autenticado",
        });
        return;
      }

      const resourceUserId = getUserIdFromParams(req);

      // Admin puede acceder a todo
      if (req.user.role === "admin") {
        next();
        return;
      }

      // Verificar que sea el dueño
      if (req.user.userId !== resourceUserId) {
        res.status(403).json({
          success: false,
          message: "Acceso denegado",
          error: "No tienes permisos para modificar este recurso",
        });
        return;
      }

      next();
    } catch (error) {
      console.error("[AUTH] Error en middleware de ownership:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };
}
