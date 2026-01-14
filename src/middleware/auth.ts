import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js'

export interface AuthRequest extends Request {
  user?: TokenPayload
}

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

export function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
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
