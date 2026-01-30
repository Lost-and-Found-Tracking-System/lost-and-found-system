// OTP Service with Redis Storage
// Production-ready OTP generation, storage, and verification

import crypto from 'crypto'
import { UserModel } from '../models/index.js'
import { storeOtp, getStoredOtp, deleteOtp, checkRateLimit } from '../config/redis.js'
import { sendOtpEmail } from './emailService.js'
import { sendOtpSms, normalizePhoneNumber, isValidPhoneNumber } from './smsService.js'

const OTP_EXPIRY_MINUTES = 10
const OTP_EXPIRY_SECONDS = OTP_EXPIRY_MINUTES * 60
const MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60 // 1 hour

export type OtpPurpose = 'password_reset' | 'visitor_registration' | 'email_verification'

export function generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString()
}

/**
 * Create and store an OTP in Redis
 */
export async function createOtp(
    identifier: string,
    purpose: OtpPurpose
): Promise<{ otp: string; expiresAt: Date }> {
    // Check rate limiting using Redis
    const rateCheck = await checkRateLimit(
        `otp:${identifier}`,
        MAX_ATTEMPTS,
        RATE_LIMIT_WINDOW_SECONDS
    )

    if (!rateCheck.allowed) {
        throw new Error('Too many OTP requests. Please try again later.')
    }

    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000)

    // Store OTP in Redis with TTL
    await storeOtp(identifier, purpose, otp, OTP_EXPIRY_SECONDS)

    return { otp, expiresAt }
}

/**
 * Verify an OTP from Redis
 */
export async function verifyOtp(
    identifier: string,
    inputOtp: string,
    purpose: OtpPurpose
): Promise<boolean> {
    const storedOtp = await getStoredOtp(identifier, purpose)

    if (!storedOtp) {
        return false
    }

    if (storedOtp !== inputOtp) {
        return false
    }

    // OTP verified, delete it
    await deleteOtp(identifier, purpose)
    return true
}

/**
 * Initiate password reset via email OTP
 */
export async function initiatePasswordReset(email: string): Promise<void> {
    const user = await UserModel.findOne({ 'profile.email': email })

    if (!user) {
        // Don't reveal if user exists - return silently
        return
    }

    const { otp } = await createOtp(email, 'password_reset')
    await sendOtpEmail(email, otp, 'password_reset')
}

/**
 * Initiate visitor registration via SMS OTP
 * Visitors use phone number as primary identifier
 */
export async function initiateVisitorRegistration(phone: string): Promise<void> {
    const normalizedPhone = normalizePhoneNumber(phone)

    if (!isValidPhoneNumber(normalizedPhone)) {
        throw new Error('Invalid phone number format. Please use format: +91XXXXXXXXXX')
    }

    // Check if visitor already exists with this phone
    const existingUser = await UserModel.findOne({ 'profile.phone': normalizedPhone })
    if (existingUser) {
        throw new Error('A user with this phone number already exists')
    }

    const { otp } = await createOtp(normalizedPhone, 'visitor_registration')
    await sendOtpSms(normalizedPhone, otp, 'visitor_registration')
}

/**
 * Initiate visitor registration via email (optional secondary method)
 */
export async function initiateVisitorRegistrationByEmail(email: string): Promise<void> {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ 'profile.email': email })
    if (existingUser) {
        throw new Error('A user with this email already exists')
    }

    const { otp } = await createOtp(email, 'visitor_registration')
    await sendOtpEmail(email, otp, 'visitor_registration')
}

export interface VisitorRegistrationInput {
    phone: string
    fullName: string
    email?: string
    otp: string
}

/**
 * Complete visitor registration after phone OTP verification
 */
export async function completeVisitorRegistration(
    input: VisitorRegistrationInput
): Promise<{ userId: string; expiresAt: Date }> {
    const normalizedPhone = normalizePhoneNumber(input.phone)

    // Verify OTP
    const isValid = await verifyOtp(normalizedPhone, input.otp, 'visitor_registration')
    if (!isValid) {
        throw new Error('Invalid or expired OTP')
    }

    // Check if visitor already exists
    const existingUser = await UserModel.findOne({ 'profile.phone': normalizedPhone })
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
            phone: normalizedPhone,
            phoneVerified: true,
            email: input.email || undefined,
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

/**
 * Initiate email verification
 */
export async function initiateEmailVerification(email: string): Promise<void> {
    const { otp } = await createOtp(email, 'email_verification')
    await sendOtpEmail(email, otp, 'email_verification')
}

/**
 * Verify email address
 */
export async function verifyEmailAddress(
    userId: string,
    email: string,
    otp: string
): Promise<boolean> {
    const isValid = await verifyOtp(email, otp, 'email_verification')

    if (!isValid) {
        return false
    }

    // Update user's email verification status
    await UserModel.findByIdAndUpdate(userId, {
        'profile.emailVerified': true,
    })

    return true
}
