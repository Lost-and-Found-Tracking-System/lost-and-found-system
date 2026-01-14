import jwt, { JwtPayload } from 'jsonwebtoken'
import { env } from '../config/env.js'

export interface TokenPayload extends JwtPayload {
  userId: string
  role: string
}

export function signAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiry,
  })
}

export function signRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiry,
  })
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.jwt.accessSecret) as TokenPayload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.jwt.refreshSecret) as TokenPayload
  } catch {
    return null
  }
}
