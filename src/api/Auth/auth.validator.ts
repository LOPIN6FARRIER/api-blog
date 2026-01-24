import { k, kataxInfer } from "katax-core";
import type { AsyncValidator } from "katax-core";
import pool from "../../database/connection.js";
import { ValidationResult } from "../../shared/api.utils.js";

// ==================== VALIDADORES ASÍNCRONOS ====================

/**
 * Verificar si el email ya existe
 */
export const emailExistsValidator: AsyncValidator<string> = async (
  email,
  path,
) => {
  console.log(`[ASYNC DB] Verificando si existe email: ${email}`);

  try {
    const result = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      return [
        {
          path,
          message: "Este email ya está registrado",
        },
      ];
    }

    return [];
  } catch (error) {
    console.error(`[ASYNC DB] Error verificando email:`, error);
    return [
      {
        path,
        message: "Error al verificar el email",
      },
    ];
  }
};

/**
 * Verificar si el username ya existe
 */
export const usernameExistsValidator: AsyncValidator<string> = async (
  username,
  path,
) => {
  console.log(`[ASYNC DB] Verificando si existe username: ${username}`);

  try {
    const result = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username],
    );

    if (result.rows.length > 0) {
      return [
        {
          path,
          message: "Este nombre de usuario ya está en uso",
        },
      ];
    }

    return [];
  } catch (error) {
    console.error(`[ASYNC DB] Error verificando username:`, error);
    return [
      {
        path,
        message: "Error al verificar el nombre de usuario",
      },
    ];
  }
};

// ==================== SCHEMAS ====================

/**
 * Schema para registro
 */
export const registerSchema = k.object({
  username: k
    .string()
    .minLength(3, "El username debe tener al menos 3 caracteres")
    .maxLength(50, "El username no puede exceder 50 caracteres")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "El username solo puede contener letras, números y guiones bajos",
    )
    .asyncRefine(usernameExistsValidator),

  email: k
    .string()
    .email("Debe ser un email válido")
    .asyncRefine(emailExistsValidator),

  password: k
    .string()
    .minLength(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número"),

  full_name: k
    .string()
    .minLength(2, "El nombre completo debe tener al menos 2 caracteres")
    .maxLength(100, "El nombre completo no puede exceder 100 caracteres")
    .optional(),
});

/**
 * Schema para login
 */
export const loginSchema = k.object({
  email: k.string().email("Debe ser un email válido"),

  password: k.string().minLength(1, "La contraseña es requerida"),
});

/**
 * Schema para refresh token
 */
export const refreshTokenSchema = k.object({
  refreshToken: k.string().minLength(1, "El refresh token es requerido"),
});

// ==================== TIPOS ====================

export type RegisterData = kataxInfer<typeof registerSchema>;
export type LoginData = kataxInfer<typeof loginSchema>;
export type RefreshTokenData = kataxInfer<typeof refreshTokenSchema>;

// ==================== WRAPPER FUNCTIONS ====================

export async function validateRegister(
  data: unknown,
): Promise<ValidationResult<RegisterData>> {
  const result = await registerSchema.safeParseAsync(data);

  if (!result.success && result.issues) {
    const errors = result.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    data: result.data,
  };
}

export async function validateLogin(
  data: unknown,
): Promise<ValidationResult<LoginData>> {
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    const errors = result.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    data: result.data,
  };
}

export async function validateRefreshToken(
  data: unknown,
): Promise<ValidationResult<RefreshTokenData>> {
  const result = refreshTokenSchema.safeParse(data);

  if (!result.success) {
    const errors = result.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    data: result.data,
  };
}
