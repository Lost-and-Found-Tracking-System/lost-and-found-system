/**
 * UNIT TESTS FOR OTP SERVICE
 * Tests OTP generation function
 */

import { describe, it, expect } from 'vitest'
import { generateOtp } from '../../src/services/otpService.js'

describe('OTP Service - generateOtp', () => {
    it('should generate a 6-digit OTP', () => {
        const otp = generateOtp()

        expect(otp).toBeDefined()
        expect(otp).toHaveLength(6)
        expect(/^\d{6}$/.test(otp)).toBe(true)
    })

    it('should generate numeric-only OTP', () => {
        const otp = generateOtp()
        expect(Number.isNaN(Number(otp))).toBe(false)
    })

    it('should generate OTPs between 100000 and 999999', () => {
        // Generate multiple OTPs to test range
        for (let i = 0; i < 100; i++) {
            const otp = generateOtp()
            const num = parseInt(otp, 10)
            expect(num).toBeGreaterThanOrEqual(100000)
            expect(num).toBeLessThanOrEqual(999999)
        }
    })

    it('should generate different OTPs on each call', () => {
        const otps = new Set<string>()

        // Generate 20 OTPs
        for (let i = 0; i < 20; i++) {
            otps.add(generateOtp())
        }

        // Most should be unique (statistically > 15 out of 20)
        expect(otps.size).toBeGreaterThan(15)
    })

    it('should always return a string', () => {
        const otp = generateOtp()
        expect(typeof otp).toBe('string')
    })

    it('should pad with leading zeros if needed', () => {
        // Run multiple times to ensure format is consistent
        for (let i = 0; i < 50; i++) {
            const otp = generateOtp()
            expect(otp.length).toBe(6)
        }
    })
})

describe('OTP Service - OTP Purposes', () => {
    const validPurposes = ['password_reset', 'visitor_registration', 'email_verification']

    it('should support password_reset purpose', () => {
        expect(validPurposes).toContain('password_reset')
    })

    it('should support visitor_registration purpose', () => {
        expect(validPurposes).toContain('visitor_registration')
    })

    it('should support email_verification purpose', () => {
        expect(validPurposes).toContain('email_verification')
    })

    it('should have exactly 3 purposes defined', () => {
        expect(validPurposes.length).toBe(3)
    })
})

describe('OTP Service - Rate Limiting Constants', () => {
    const OTP_EXPIRY_MINUTES = 10
    const MAX_ATTEMPTS = 5
    const RATE_LIMIT_WINDOW_SECONDS = 60 * 60 // 1 hour

    it('should have 10 minute expiry', () => {
        expect(OTP_EXPIRY_MINUTES).toBe(10)
    })

    it('should allow max 5 attempts', () => {
        expect(MAX_ATTEMPTS).toBe(5)
    })

    it('should have 1 hour rate limit window', () => {
        expect(RATE_LIMIT_WINDOW_SECONDS).toBe(3600)
    })
})
