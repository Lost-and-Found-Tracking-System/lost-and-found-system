/**
 * UNIT TESTS FOR PASSWORD UTILITIES
 * Tests password hashing and verification with Argon2
 */

import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '../../src/utils/password.js'

describe('Password Utils - Hashing', () => {
    it('should hash a password', async () => {
        const password = 'mySecurePassword123!'
        const hashed = await hashPassword(password)

        expect(hashed).toBeDefined()
        expect(typeof hashed).toBe('string')
        expect(hashed).not.toBe(password) // Should not be plain text
        expect(hashed.startsWith('$argon2')).toBe(true) // Argon2 hash format
    })

    it('should generate different hashes for same password', async () => {
        const password = 'testPassword123'
        const hash1 = await hashPassword(password)
        const hash2 = await hashPassword(password)

        expect(hash1).not.toBe(hash2) // Different salts = different hashes
    })

    it('should handle special characters in password', async () => {
        const password = 'P@$$w0rd!@#$%^&*()'
        const hashed = await hashPassword(password)

        expect(hashed).toBeDefined()
        expect(hashed.startsWith('$argon2')).toBe(true)
    })

    it('should handle unicode characters in password', async () => {
        const password = 'पासवर्ड123தமிழ்'
        const hashed = await hashPassword(password)

        expect(hashed).toBeDefined()
        expect(hashed.startsWith('$argon2')).toBe(true)
    })
})

describe('Password Utils - Verification', () => {
    it('should verify correct password', async () => {
        const password = 'correctPassword123'
        const hash = await hashPassword(password)

        const isValid = await verifyPassword(hash, password)
        expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
        const password = 'correctPassword123'
        const hash = await hashPassword(password)

        const isValid = await verifyPassword(hash, 'wrongPassword')
        expect(isValid).toBe(false)
    })

    it('should reject similar but different passwords', async () => {
        const password = 'Password123'
        const hash = await hashPassword(password)

        // Case sensitive
        const isValid = await verifyPassword(hash, 'password123')
        expect(isValid).toBe(false)
    })

    it('should reject empty password against valid hash', async () => {
        const password = 'validPassword'
        const hash = await hashPassword(password)

        const isValid = await verifyPassword(hash, '')
        expect(isValid).toBe(false)
    })
})
