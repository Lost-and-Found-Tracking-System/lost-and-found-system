/**
 * @module config/env
 * @description Centralized environment variable configuration.
 * Loads variables from `.env` via dotenv and provides typed access
 * to all application settings with sensible defaults.
 */

import dotenv from 'dotenv'

dotenv.config()

/**
 * Retrieves a required environment variable or throws if missing.
 * @param name - The environment variable name
 * @returns The variable value
 * @throws Error if the variable is not set
 */
function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

/**
 * Retrieves an optional environment variable with a fallback default.
 * @param name - The environment variable name
 * @param defaultValue - Value to return if the variable is not set
 * @returns The variable value or the default
 */
function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue
}

/**
 * Application-wide environment configuration object.
 *
 * @property nodeEnv - Current environment (`development` | `production` | `test`)
 * @property port - HTTP server port (default: `3000`)
 * @property mongoUri - MongoDB Atlas connection string
 * @property jwt - JWT token configuration (secrets and expiry durations)
 * @property redis - Redis connection URL
 * @property sendgrid - SendGrid email service credentials
 * @property fast2sms - Fast2SMS India SMS service API key
 * @property cloudinary - Cloudinary image CDN credentials
 */
export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI ?? '',
  /** JWT authentication configuration */
  jwt: {
    /** Secret key for signing access tokens */
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    /** Secret key for signing refresh tokens */
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    /** Access token expiry duration (default: 15 minutes) */
    accessExpiry: process.env.JWT_ACCESS_EXPIRY ?? '15m',
    /** Refresh token expiry duration (default: 7 days) */
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY ?? '7d',
  },
  /** Redis cache and queue broker configuration */
  redis: {
    /** Redis connection URL (default: `redis://localhost:6379`) */
    url: optionalEnv('REDIS_URL', 'redis://localhost:6379'),
  },
  /** SendGrid email service configuration */
  sendgrid: {
    /** SendGrid API key for sending emails */
    apiKey: process.env.SENDGRID_API_KEY ?? '',
    /** Sender email address */
    fromEmail: optionalEnv('SENDGRID_FROM_EMAIL', 'noreply@lostfound.campus.edu'),
    /** Sender display name */
    fromName: optionalEnv('SENDGRID_FROM_NAME', 'Lost & Found System'),
  },
  /** Fast2SMS India SMS service configuration */
  fast2sms: {
    /** Fast2SMS API key for transactional SMS */
    apiKey: process.env.FAST2SMS_API_KEY ?? '',
  },
  /** Cloudinary image CDN configuration */
  cloudinary: {
    /** Cloudinary cloud name */
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    /** Cloudinary API key */
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    /** Cloudinary API secret */
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
}

/**
 * Validates that all critical environment variables are set.
 * Should be called during application startup.
 * @throws Error if `MONGODB_URI`, `JWT_ACCESS_SECRET`, or `JWT_REFRESH_SECRET` is missing
 */
export function assertRequiredEnv(): void {
  requireEnv('MONGODB_URI')
  requireEnv('JWT_ACCESS_SECRET')
  requireEnv('JWT_REFRESH_SECRET')
}

/**
 * Checks whether external production services (SendGrid + Fast2SMS) are configured.
 * @returns `true` if both email and SMS API keys are present
 */
export function isProductionServicesEnabled(): boolean {
  return !!(env.sendgrid.apiKey && env.fast2sms.apiKey)
}

