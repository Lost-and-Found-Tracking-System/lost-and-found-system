// SMS Service
// Fast2SMS integration for SMS OTP (India-focused, free tier available)
// Replaces Twilio which doesn't support Indian numbers on free tier

import { env } from '../config/env.js'

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
    // Basic validation - Indian numbers (10 digits) or E.164 format
    const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/
    const cleanPhone = phone.replace(/[\s-]/g, '')
    return phoneRegex.test(cleanPhone) || /^\+[1-9]\d{6,14}$/.test(cleanPhone)
}

/**
 * Normalize phone number for Indian format
 * Fast2SMS expects 10-digit Indian numbers without country code
 */
export function normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let normalized = phone.replace(/[^\d]/g, '')

    // Remove country code if present
    if (normalized.startsWith('91') && normalized.length === 12) {
        normalized = normalized.substring(2)
    }

    return normalized
}

/**
 * Get formatted phone with country code (for display/storage)
 */
export function formatPhoneWithCountryCode(phone: string): string {
    const normalized = normalizePhoneNumber(phone)
    return '+91' + normalized
}

/**
 * Send SMS via Fast2SMS
 * API Docs: https://docs.fast2sms.com/
 */
export async function sendSms(to: string, message: string): Promise<boolean> {
    const normalizedPhone = normalizePhoneNumber(to)

    // Check if SMS service is configured
    if (!env.fast2sms?.apiKey) {
        console.log(`📱 SMS (dev mode):`)
        console.log(`   To: +91${normalizedPhone}`)
        console.log(`   Message: ${message}`)
        return true
    }

    try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
                'authorization': env.fast2sms.apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                route: 'q', // Quick SMS route (for OTP)
                message: message,
                language: 'english',
                flash: 0,
                numbers: normalizedPhone,
            }),
        })

        const data = await response.json() as { return: boolean; message: string }

        if (data.return === true) {
            console.log(`✅ SMS sent to +91${normalizedPhone}`)
            return true
        } else {
            console.error('Fast2SMS error:', data.message)
            return false
        }
    } catch (error) {
        console.error('SMS send error:', error)
        return false
    }
}

/**
 * Send OTP via SMS using Fast2SMS DLT route (for registered templates)
 * Note: For production, you need DLT registration
 */
export async function sendOtpSms(
    phone: string,
    otp: string,
    purpose: 'visitor_registration' | 'password_reset' = 'visitor_registration'
): Promise<boolean> {
    const normalizedPhone = normalizePhoneNumber(phone)

    // Check if SMS service is configured
    if (!env.fast2sms?.apiKey) {
        console.log(`📱 OTP SMS (dev mode):`)
        console.log(`   To: +91${normalizedPhone}`)
        console.log(`   OTP: ${otp}`)
        console.log(`   Purpose: ${purpose}`)
        return true
    }

    try {
        // Use OTP route for sending OTP (simpler, works for testing)
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
                'authorization': env.fast2sms.apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                route: 'otp',
                variables_values: otp,
                numbers: normalizedPhone,
            }),
        })

        const data = await response.json() as { return: boolean; message: string }

        if (data.return === true) {
            console.log(`✅ OTP SMS sent to +91${normalizedPhone}`)
            return true
        } else {
            console.error('Fast2SMS OTP error:', data.message)
            // Fallback to quick SMS route
            return sendSms(phone, getOtpMessage(otp, purpose))
        }
    } catch (error) {
        console.error('OTP SMS send error:', error)
        // Fallback to quick SMS route
        return sendSms(phone, getOtpMessage(otp, purpose))
    }
}

function getOtpMessage(otp: string, purpose: string): string {
    const messages: Record<string, string> = {
        visitor_registration: `Your Lost & Found visitor registration OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`,
        password_reset: `Your Lost & Found password reset OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`,
    }
    return messages[purpose] || `Your OTP is: ${otp}. Valid for 10 minutes.`
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
