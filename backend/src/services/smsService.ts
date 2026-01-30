// SMS Service
// Twilio integration for SMS OTP (primarily for visitor registration)

import Twilio from 'twilio'
import { env, isProductionServicesEnabled } from '../config/env.js'

// Initialize Twilio client
let twilioClient: ReturnType<typeof Twilio> | null = null

function getTwilioClient(): ReturnType<typeof Twilio> | null {
    if (!env.twilio.accountSid || !env.twilio.authToken) {
        return null
    }

    if (!twilioClient) {
        twilioClient = Twilio(env.twilio.accountSid, env.twilio.authToken)
    }

    return twilioClient
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
    // Basic validation - should be E.164 format (+1234567890)
    const phoneRegex = /^\+[1-9]\d{6,14}$/
    return phoneRegex.test(phone)
}

/**
 * Normalize phone number to E.164 format
 */
export function normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters except leading +
    let normalized = phone.replace(/[^\d+]/g, '')

    // Ensure it starts with +
    if (!normalized.startsWith('+')) {
        // Assume it's an Indian number if no country code
        if (normalized.length === 10) {
            normalized = '+91' + normalized
        } else {
            normalized = '+' + normalized
        }
    }

    return normalized
}

/**
 * Send SMS via Twilio
 */
export async function sendSms(to: string, message: string): Promise<boolean> {
    const normalizedPhone = normalizePhoneNumber(to)

    // Check if production services are enabled
    if (!isProductionServicesEnabled() || !getTwilioClient()) {
        console.log(`📱 SMS (dev mode):`)
        console.log(`   To: ${normalizedPhone}`)
        console.log(`   Message: ${message}`)
        return true
    }

    try {
        const client = getTwilioClient()
        if (!client) {
            console.warn('Twilio client not initialized')
            return false
        }

        await client.messages.create({
            body: message,
            from: env.twilio.phoneNumber,
            to: normalizedPhone,
        })

        console.log(`✅ SMS sent to ${normalizedPhone}`)
        return true
    } catch (error) {
        console.error('Twilio error:', error)
        return false
    }
}

/**
 * Send OTP via SMS
 */
export async function sendOtpSms(
    phone: string,
    otp: string,
    purpose: 'visitor_registration' | 'password_reset' = 'visitor_registration'
): Promise<boolean> {
    const messages = {
        visitor_registration: `Your Lost & Found visitor registration OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`,
        password_reset: `Your Lost & Found password reset OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`,
    }

    return sendSms(phone, messages[purpose])
}

/**
 * Send claim status notification via SMS
 */
export async function sendClaimStatusSms(
    phone: string,
    itemId: string,
    status: 'approved' | 'rejected'
): Promise<boolean> {
    const message =
        status === 'approved'
            ? `Good news! Your claim for item ${itemId} has been approved. Please visit the Lost & Found office to collect your item.`
            : `Update: Your claim for item ${itemId} requires additional verification. Please check your email for details.`

    return sendSms(phone, message)
}

/**
 * Send security alert via SMS
 */
export async function sendSecurityAlertSms(
    phone: string,
    alertType: string
): Promise<boolean> {
    const message = `Security Alert: ${alertType} detected on your Lost & Found account. If this wasn't you, please contact support immediately.`
    return sendSms(phone, message)
}
