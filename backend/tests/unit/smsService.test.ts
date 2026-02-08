/**
 * UNIT TESTS FOR SMS SERVICE
 * 
 * This file demonstrates how to write unit tests for utility functions.
 * 
 * KEY CONCEPTS:
 * - describe(): Groups related tests together
 * - it() or test(): Defines a single test case
 * - expect(): Makes assertions about the result
 * 
 * RUN THIS TEST:
 *   npm run test
 *   npm run test -- smsService  (run only this file)
 */

import { describe, it, expect } from 'vitest'
import { isValidPhoneNumber, normalizePhoneNumber, formatPhoneWithCountryCode } from '../../src/services/smsService.js'

// ============================================
// TEST GROUP: Phone Number Validation
// ============================================
describe('SMS Service - Phone Validation', () => {

    // Test 1: Valid Indian phone numbers
    it('should validate correct Indian phone numbers', () => {
        // Arrange: prepare test data
        const validNumbers = [
            '9876543210',      // 10 digits starting with 9
            '8765432109',      // 10 digits starting with 8
            '7654321098',      // 10 digits starting with 7
            '6543210987',      // 10 digits starting with 6
            '+919876543210',   // With country code
        ]

        // Act & Assert: test each number
        validNumbers.forEach(phone => {
            expect(isValidPhoneNumber(phone)).toBe(true)
        })
    })

    // Test 2: Invalid phone numbers
    it('should reject invalid phone numbers', () => {
        const invalidNumbers = [
            '12345',           // Too short
            '5876543210',      // Starts with 5 (invalid for India)
            'abcdefghij',      // Not a number
            '',                // Empty string
        ]

        invalidNumbers.forEach(phone => {
            expect(isValidPhoneNumber(phone)).toBe(false)
        })
    })
})

// ============================================
// TEST GROUP: Phone Number Normalization
// ============================================
describe('SMS Service - Phone Normalization', () => {

    // Test 3: Remove country code
    it('should normalize phone by removing country code', () => {
        // Input with country code
        const input = '+919876543210'

        // Expected output: just the 10 digits
        const expected = '9876543210'

        // Run the function and check result
        const result = normalizePhoneNumber(input)
        expect(result).toBe(expected)
    })

    // Test 4: Already normalized
    it('should keep already normalized numbers unchanged', () => {
        const input = '9876543210'
        const result = normalizePhoneNumber(input)
        expect(result).toBe('9876543210')
    })

    // Test 5: Remove special characters
    it('should remove spaces and dashes', () => {
        const input = '+91-987-654-3210'
        const result = normalizePhoneNumber(input)
        expect(result).toBe('9876543210')
    })
})

// ============================================
// TEST GROUP: Format with Country Code
// ============================================
describe('SMS Service - Format Phone', () => {

    it('should add +91 country code', () => {
        const input = '9876543210'
        const result = formatPhoneWithCountryCode(input)
        expect(result).toBe('+919876543210')
    })

    it('should not duplicate country code', () => {
        const input = '+919876543210'
        const result = formatPhoneWithCountryCode(input)
        expect(result).toBe('+919876543210')
    })
})
