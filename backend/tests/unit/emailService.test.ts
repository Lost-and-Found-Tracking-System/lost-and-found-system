/**
 * UNIT TESTS FOR EMAIL SERVICE
 * Tests email sending functions (mocked in dev mode)
 * 
 * NOTE: These tests run in dev mode where emails are logged, not sent
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock SendGrid before importing email service
vi.mock('@sendgrid/mail', () => ({
    default: {
        setApiKey: vi.fn(),
        send: vi.fn().mockResolvedValue([{ statusCode: 202 }]),
    },
}))

// Mock env to ensure dev mode
vi.mock('../../src/config/env.js', () => ({
    env: {
        sendgrid: {
            apiKey: '',  // Empty = dev mode
            fromEmail: 'test@example.com',
            fromName: 'Test System',
        },
    },
    isProductionServicesEnabled: () => false,
}))

// Now import the email service
import { sendEmail, sendOtpEmail, sendNotificationEmail, sendSecurityAlertEmail } from '../../src/services/emailService.js'

// Mock console.log to check dev mode logs
beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => { })
})

describe('Email Service - sendEmail', () => {
    it('should accept valid email options', async () => {
        const result = await sendEmail({
            to: 'test@example.com',
            subject: 'Test Subject',
            text: 'Test body content',
        })

        // In dev mode (no API key), returns true
        expect(result).toBe(true)
    })

    it('should accept HTML content', async () => {
        const result = await sendEmail({
            to: 'test@example.com',
            subject: 'HTML Email',
            html: '<h1>Hello</h1><p>Test content</p>',
        })

        expect(result).toBe(true)
    })

    it('should handle emails with both text and html', async () => {
        const result = await sendEmail({
            to: 'test@example.com',
            subject: 'Dual Format',
            text: 'Plain text version',
            html: '<p>HTML version</p>',
        })

        expect(result).toBe(true)
    })
})

describe('Email Service - sendOtpEmail', () => {
    it('should send password reset OTP email', async () => {
        const result = await sendOtpEmail(
            'user@example.com',
            '123456',
            'password_reset'
        )

        expect(result).toBe(true)
    })

    it('should send visitor registration OTP email', async () => {
        const result = await sendOtpEmail(
            'visitor@example.com',
            '654321',
            'visitor_registration'
        )

        expect(result).toBe(true)
    })

    it('should send email verification OTP', async () => {
        const result = await sendOtpEmail(
            'new@example.com',
            '111222',
            'email_verification'
        )

        expect(result).toBe(true)
    })
})

describe('Email Service - sendNotificationEmail', () => {
    it('should send notification without action URL', async () => {
        const result = await sendNotificationEmail(
            'user@example.com',
            'Item Update',
            'Your item has been matched!'
        )

        expect(result).toBe(true)
    })

    it('should send notification with action URL', async () => {
        const result = await sendNotificationEmail(
            'user@example.com',
            'Claim Approved',
            'Your claim has been approved.',
            'https://example.com/claims/123'
        )

        expect(result).toBe(true)
    })
})

describe('Email Service - sendSecurityAlertEmail', () => {
    it('should send security alert email', async () => {
        const result = await sendSecurityAlertEmail(
            'user@example.com',
            'New Login',
            'A new login was detected from Chrome on Windows'
        )

        expect(result).toBe(true)
    })

    it('should send security alert for password change', async () => {
        const result = await sendSecurityAlertEmail(
            'user@example.com',
            'Password Changed',
            'Your password was changed on Feb 8, 2026'
        )

        expect(result).toBe(true)
    })
})
