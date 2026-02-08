/**
 * UNIT TESTS FOR JWT UTILITIES
 * Tests token signing and verification functions
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../src/utils/jwt.js'

// Ensure JWT secrets are set for tests
beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-12345'
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-12345'
})

describe('JWT Utils - Access Token', () => {
    const testPayload = {
        userId: 'user123',
        role: 'student',
    }

    it('should sign an access token', () => {
        const token = signAccessToken(testPayload)
        expect(token).toBeDefined()
        expect(typeof token).toBe('string')
        expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should verify a valid access token', () => {
        const token = signAccessToken(testPayload)
        const decoded = verifyAccessToken(token)

        expect(decoded).not.toBeNull()
        expect(decoded?.userId).toBe('user123')
        expect(decoded?.role).toBe('student')
    })

    it('should return null for invalid access token', () => {
        const result = verifyAccessToken('invalid-token')
        expect(result).toBeNull()
    })

    it('should return null for tampered token', () => {
        const token = signAccessToken(testPayload)
        const tamperedToken = token.slice(0, -5) + 'XXXXX'
        const result = verifyAccessToken(tamperedToken)
        expect(result).toBeNull()
    })
})

describe('JWT Utils - Refresh Token', () => {
    const testPayload = {
        userId: 'user456',
        role: 'admin',
    }

    it('should sign a refresh token', () => {
        const token = signRefreshToken(testPayload)
        expect(token).toBeDefined()
        expect(typeof token).toBe('string')
    })

    it('should verify a valid refresh token', () => {
        const token = signRefreshToken(testPayload)
        const decoded = verifyRefreshToken(token)

        expect(decoded).not.toBeNull()
        expect(decoded?.userId).toBe('user456')
        expect(decoded?.role).toBe('admin')
    })

    it('should return null for invalid refresh token', () => {
        const result = verifyRefreshToken('invalid-token')
        expect(result).toBeNull()
    })

    it('should not verify access token with refresh secret', () => {
        const accessToken = signAccessToken(testPayload)
        const result = verifyRefreshToken(accessToken)
        expect(result).toBeNull()
    })

    it('should not verify refresh token with access secret', () => {
        const refreshToken = signRefreshToken(testPayload)
        const result = verifyAccessToken(refreshToken)
        expect(result).toBeNull()
    })
})
