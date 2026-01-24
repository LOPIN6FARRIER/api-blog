import { RegisterData, LoginData, RefreshTokenData } from "./auth.validator.js";
import { AuthResponse, JwtPayload } from "./auth.interfaces.js";
import { User } from "./user.types.js";
import {
  ControllerResult,
  createErrorResult,
  createSuccessResult,
} from "../../shared/api.utils";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../shared/jwt.utils";
import { hashPassword, verifyPassword } from "../../shared/password.util.js";
import pool from "../../database/connection.js";

/**
 * Registrar un nuevo usuario
 */
export async function register(
  data: RegisterData,
): Promise<ControllerResult<AuthResponse>> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Hash de la contraseña
    const passwordHash = hashPassword(data.password);

    // 2. Obtener el role_id de 'usuario' (rol por defecto)
    const roleResult = await client.query(
      "SELECT id FROM roles WHERE name = 'usuario' LIMIT 1",
    );

    const roleId = roleResult.rows[0]?.id || 2; // Default: usuario

    // 3. Insertar usuario
    const userResult = await client.query<User>(
      `INSERT INTO users (
        username, email, password_hash, full_name, role_id
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, full_name, role_id, created_at`,
      [data.username, data.email, passwordHash, data.full_name || null, roleId],
    );

    const newUser = userResult.rows[0];

    // 4. Obtener nombre del rol
    const roleNameResult = await client.query(
      "SELECT name FROM roles WHERE id = $1",
      [newUser.role_id],
    );
    const roleName = roleNameResult.rows[0]?.name || "usuario";

    // 5. Generar tokens
    const jwtPayload: JwtPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: roleName,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // 6. Guardar refresh token en la base de datos
    await client.query(
      `INSERT INTO user_sessions (user_id, refresh_token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [newUser.id, refreshToken],
    );

    await client.query("COMMIT");

    console.log(
      `[AUTH] Usuario registrado: ${newUser.username} (${newUser.email})`,
    );

    return createSuccessResult(
      "Usuario registrado exitosamente",
      {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          full_name: newUser.full_name || undefined,
          role: roleName,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
      undefined,
      201,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[AUTH] Error en registro:", error);
    return createErrorResult(
      "Error al registrar usuario",
      error instanceof Error ? error.message : "Error desconocido",
      500,
    );
  } finally {
    client.release();
  }
}

/**
 * Login de usuario
 */
export async function login(
  data: LoginData,
): Promise<ControllerResult<AuthResponse>> {
  try {
    // 1. Buscar usuario por email
    const result = await pool.query<User>(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = $1`,
      [data.email],
    );

    if (result.rows.length === 0) {
      return createErrorResult(
        "Credenciales inválidas",
        "Email o contraseña incorrectos",
        401,
      );
    }

    const user = result.rows[0] as any;

    // 2. Verificar que el usuario esté activo
    if (!user.is_active) {
      return createErrorResult(
        "Cuenta desactivada",
        "Tu cuenta ha sido desactivada. Contacta al administrador.",
        403,
      );
    }

    // 3. Verificar contraseña
    const isValidPassword = verifyPassword(data.password, user.password_hash);

    if (!isValidPassword) {
      return createErrorResult(
        "Credenciales inválidas",
        "Email o contraseña incorrectos",
        401,
      );
    }

    // 4. Generar tokens
    const jwtPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role_name,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // 5. Guardar refresh token
    await pool.query(
      `INSERT INTO user_sessions (user_id, refresh_token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken],
    );

    // 6. Actualizar last_login
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [
      user.id,
    ]);

    console.log(`[AUTH] Login exitoso: ${user.username} (${user.email})`);

    return createSuccessResult("Login exitoso", {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role_name,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("[AUTH] Error en login:", error);
    return createErrorResult(
      "Error al iniciar sesión",
      error instanceof Error ? error.message : "Error desconocido",
      500,
    );
  }
}

/**
 * Refrescar access token
 */
export async function refreshAccessToken(
  data: RefreshTokenData,
): Promise<ControllerResult<{ accessToken: string }>> {
  try {
    // 1. Verificar refresh token
    const payload = verifyRefreshToken(data.refreshToken);

    if (!payload) {
      return createErrorResult(
        "Token inválido",
        "El refresh token es inválido o ha expirado",
        401,
      );
    }

    // 2. Verificar que el refresh token existe en la BD
    const sessionResult = await pool.query(
      `SELECT * FROM user_sessions 
       WHERE user_id = $1 AND refresh_token = $2 AND expires_at > NOW()`,
      [payload.userId, data.refreshToken],
    );

    if (sessionResult.rows.length === 0) {
      return createErrorResult(
        "Sesión inválida",
        "La sesión ha expirado. Por favor inicia sesión nuevamente.",
        401,
      );
    }

    // 3. Generar nuevo access token
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    console.log(
      `[AUTH] Access token refrescado para usuario: ${payload.userId}`,
    );

    return createSuccessResult("Token refrescado exitosamente", {
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("[AUTH] Error al refrescar token:", error);
    return createErrorResult(
      "Error al refrescar token",
      error instanceof Error ? error.message : "Error desconocido",
      500,
    );
  }
}

/**
 * Logout (invalidar refresh token)
 */
export async function logout(
  refreshToken: string,
): Promise<ControllerResult<void>> {
  try {
    // Eliminar refresh token de la BD
    await pool.query("DELETE FROM user_sessions WHERE refresh_token = $1", [
      refreshToken,
    ]);

    console.log(`[AUTH] Logout exitoso`);

    return createSuccessResult("Logout exitoso", undefined);
  } catch (error) {
    console.error("[AUTH] Error en logout:", error);
    return createErrorResult(
      "Error al cerrar sesión",
      error instanceof Error ? error.message : "Error desconocido",
      500,
    );
  }
}
