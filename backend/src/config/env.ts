import dotenv from 'dotenv'

dotenv.config()

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI ?? '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY ?? '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY ?? '7d',
  },
  // Redis configuration
  redis: {
    url: optionalEnv('REDIS_URL', 'redis://localhost:6379'),
  },
  // SendGrid email configuration
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY ?? '',
    fromEmail: optionalEnv('SENDGRID_FROM_EMAIL', 'noreply@lostfound.campus.edu'),
    fromName: optionalEnv('SENDGRID_FROM_NAME', 'Lost & Found System'),
  },
  // Twilio SMS configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
    authToken: process.env.TWILIO_AUTH_TOKEN ?? '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER ?? '',
  },
  // Cloudinary image storage configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
}

export function assertRequiredEnv(): void {
  requireEnv('MONGODB_URI')
  requireEnv('JWT_ACCESS_SECRET')
  requireEnv('JWT_REFRESH_SECRET')
}

export function isProductionServicesEnabled(): boolean {
  return !!(env.sendgrid.apiKey && env.twilio.accountSid)
}

