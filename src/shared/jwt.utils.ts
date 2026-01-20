import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days

// ==================== INTERFACES ====================

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// ==================== TOKEN GENERATION ====================

/**
 * Generate Access Token
 * @param payload - JWT payload containing user information
 * @returns JWT access token string
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY
  });
}

/**
 * Generate Refresh Token
 * @param payload - JWT payload containing user information
 * @returns JWT refresh token string
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY
  });
}

/**
 * Generate both access and refresh tokens
 * @param payload - JWT payload containing user information
 * @returns Object with both tokens
 */
export function generateTokens(payload: JwtPayload): { accessToken: string; refreshToken: string } {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
}

// ==================== TOKEN VERIFICATION ====================

/**
 * Verify Access Token
 * @param token - JWT token to verify
 * @returns Decoded JWT payload or null if invalid
 */
export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('[JWT] Error verifying access token:', error);
    return null;
  }
}

/**
 * Verify Refresh Token
 * @param token - JWT token to verify
 * @returns Decoded JWT payload or null if invalid
 */
export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  } catch (error) {
    console.error('[JWT] Error verifying refresh token:', error);
    return null;
  }
}

/**
 * Decode token without verifying (useful for debugging)
 * @param token - JWT token to decode
 * @returns Decoded token data
 */
export function decodeToken(token: string): any {
  return jwt.decode(token);
}

// ==================== MIDDLEWARE ====================

/**
 * Express middleware to authenticate requests using JWT
 * Expects Bearer token in Authorization header
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
    return;
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
    return;
  }

  // Attach user info to request
  (req as any).user = payload;
  next();
}

/**
 * Middleware to check if user has specific role
 * @param roles - Array of allowed roles
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
}
