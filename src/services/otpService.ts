import crypto from 'crypto'
import { UserModel } from '../models/index.js'

// In-memory OTP store (in production, use Redis)
const otpStore = new Map<string, { otp: string; expiresAt: Date; purpose: 'password_reset' | 'visitor_registration' | 'email_verification' }>()

const OTP_EXPIRY_MINUTES = 10
const MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

// Rate limiting store
const rateLimitStore = new Map<string, { attempts: number; windowStart: Date }>()

export function generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString()
}

export async function createOtp(
    identifier: string,
    purpose: 'password_reset' | 'visitor_registration' | 'email_verification'
): Promise<{ otp: string; expiresAt: Date }> {
    // Check rate limiting
    const rateLimit = rateLimitStore.get(identifier)
    const now = new Date()

    if (rateLimit) {
        if (now.getTime() - rateLimit.windowStart.getTime() < RATE_LIMIT_WINDOW_MS) {
            if (rateLimit.attempts >= MAX_ATTEMPTS) {
                throw new Error('Too many OTP requests. Please try again later.')
            }
            rateLimit.attempts += 1
        } else {
            // Reset window
            rateLimitStore.set(identifier, { attempts: 1, windowStart: now })
        }
    } else {
        rateLimitStore.set(identifier, { attempts: 1, windowStart: now })
    }

    const otp = generateOtp()
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000)

    otpStore.set(`${identifier}:${purpose}`, { otp, expiresAt, purpose })

    return { otp, expiresAt }
}

export function verifyOtp(
    identifier: string,
    inputOtp: string,
    purpose: 'password_reset' | 'visitor_registration' | 'email_verification'
): boolean {
    const key = `${identifier}:${purpose}`
    const stored = otpStore.get(key)

    if (!stored) {
        return false
    }

    if (new Date() > stored.expiresAt) {
        otpStore.delete(key)
        return false
    }

    if (stored.otp !== inputOtp) {
        return false
    }

    // OTP verified, remove it
    otpStore.delete(key)
    return true
}

export async function sendOtpEmail(
    email: string,
    otp: string,
    purpose: 'password_reset' | 'visitor_registration' | 'email_verification'
): Promise<void> {
    // TODO: Integrate with email service (nodemailer, SendGrid, etc.)
    // For now, log to console in development
    const subjectMap = {
        password_reset: 'Password Reset OTP',
        visitor_registration: 'Visitor Registration OTP',
        email_verification: 'Email Verification OTP',
    }

    console.log(`
========================================
📧 OTP EMAIL
To: ${email}
Subject: ${subjectMap[purpose]}
OTP: ${otp}
Valid for: ${OTP_EXPIRY_MINUTES} minutes
========================================
  `)
}

export async function initiatePasswordReset(email: string): Promise<void> {
    const user = await UserModel.findOne({ 'profile.email': email })

    if (!user) {
        // Don't reveal if user exists - return silently
        return
    }

    const { otp } = await createOtp(email, 'password_reset')
    await sendOtpEmail(email, otp, 'password_reset')
}

export async function initiateVisitorRegistration(email: string): Promise<void> {
    const { otp } = await createOtp(email, 'visitor_registration')
    await sendOtpEmail(email, otp, 'visitor_registration')
}

export interface VisitorRegistrationInput {
    email: string
    fullName: string
    phone?: string
    otp: string
}

export async function completeVisitorRegistration(input: VisitorRegistrationInput): Promise<{ userId: string; expiresAt: Date }> {
    // Verify OTP
    const isValid = verifyOtp(input.email, input.otp, 'visitor_registration')
    if (!isValid) {
        throw new Error('Invalid or expired OTP')
    }

    // Check if visitor already exists
    const existingUser = await UserModel.findOne({ 'profile.email': input.email })
    if (existingUser) {
        throw new Error('User already exists')
    }

    // Create temporary visitor account (expires in 24 hours)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const visitorId = `VISITOR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

    const visitor = new UserModel({
        visitorId,
        role: 'visitor',
        credentials: {
            passwordHash: null,
            passwordUpdatedAt: new Date(),
            failedLoginAttempts: 0,
        },
        profile: {
            fullName: input.fullName,
            email: input.email,
            phone: input.phone,
        },
        visitorMetadata: {
            otpVerified: true,
            expiresAt,
        },
        status: 'active',
    })

    await visitor.save()

    return {
        userId: visitor._id.toString(),
        expiresAt,
    }
}

export function cleanupExpiredOtps(): void {
    const now = new Date()
    for (const [key, value] of otpStore.entries()) {
        if (now > value.expiresAt) {
            otpStore.delete(key)
        }
    }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOtps, 5 * 60 * 1000)
