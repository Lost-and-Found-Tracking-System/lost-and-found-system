/**
 * @module utils/jwt
 * @description JSON Web Token utilities for authentication.
 * Provides functions to sign and verify access and refresh tokens
 * using separate secrets for enhanced security.
 */

import jwt from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'
import { env } from '../config/env.js'

/**
 * JWT token payload containing user identity and role.
 * Embedded in both access and refresh tokens.
 */
export interface TokenPayload extends JwtPayload {
  /** The MongoDB ObjectId of the authenticated user */
  userId: string
  /** The user's role (e.g., `'student'`, `'admin'`) */
  role: string
}

/**
 * Signs a short-lived access token (default: 15 minutes).
 *
 * @param payload - The token payload (userId, role)
 * @returns The signed JWT access token string
 */
export function signAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiry,
  } as jwt.SignOptions)
}

/**
 * Signs a long-lived refresh token (default: 7 days).
 * Stored as an httpOnly cookie for secure token rotation.
 *
 * @param payload - The token payload (userId, role)
 * @returns The signed JWT refresh token string
 */
export function signRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiry,
  } as jwt.SignOptions)
}

/**
 * Verifies and decodes an access token.
 *
 * @param token - The JWT access token string
 * @returns The decoded {@link TokenPayload}, or `null` if verification fails
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.jwt.accessSecret) as TokenPayload
  } catch {
    return null
  }
}

/**
 * Verifies and decodes a refresh token.
 *
 * @param token - The JWT refresh token string
 * @returns The decoded {@link TokenPayload}, or `null` if verification fails
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.jwt.refreshSecret) as TokenPayload
  } catch {
    return null
  }
}
