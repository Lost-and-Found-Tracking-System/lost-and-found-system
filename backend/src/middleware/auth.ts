/**
 * @module middleware/auth
 * @description JWT authentication middleware for protecting API routes.
 * Extracts and verifies Bearer tokens from the Authorization header.
 */

import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt.js'
import type { TokenPayload } from '../utils/jwt.js'

/**
 * Extended Express Request with an authenticated user payload.
 * Populated by {@link authMiddleware} after successful token verification.
 */
export interface AuthRequest extends Request {
  /** The decoded JWT payload containing userId and role */
  user?: TokenPayload
}

/**
 * Requires a valid JWT access token in the `Authorization: Bearer <token>` header.
 * Responds with 401 if the token is missing or invalid.
 *
 * @param req - The incoming request (extended as {@link AuthRequest})
 * @param res - The outgoing response
 * @param next - The next middleware function
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  const token = authHeader.slice(7)
  const payload = verifyAccessToken(token)

  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  req.user = payload
  next()
}

/**
 * Optionally extracts and verifies a JWT token if present.
 * Unlike {@link authMiddleware}, this does not reject requests without tokens —
 * it simply passes through, allowing both authenticated and anonymous access.
 *
 * @param req - The incoming request (extended as {@link AuthRequest})
 * @param _res - The outgoing response (unused)
 * @param next - The next middleware function
 */
export function optionalAuthMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const payload = verifyAccessToken(token)
    if (payload) {
      req.user = payload
    }
  }

  next()
}
