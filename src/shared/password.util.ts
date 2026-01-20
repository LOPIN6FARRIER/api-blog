import crypto from 'crypto';

/**
 * Hash de contraseña usando SHA-256
 * Nota: En producción se recomienda bcrypt, pero usamos SHA-256 para simplificar
 */
export function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
}

/**
 * Verificar contraseña
 */
export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
}

/**
 * Generar API Key
 */
export function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex');
}