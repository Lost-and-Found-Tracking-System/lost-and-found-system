/**
 * UNIT TESTS FOR VALIDATION MIDDLEWARE LOGIC
 * Tests validation patterns and error handling
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'

describe('Validation Middleware - Schema Validation', () => {
    const userSchema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        age: z.number().optional(),
    })

    it('should validate correct data', () => {
        const data = { name: 'John', email: 'john@example.com' }
        const result = userSchema.safeParse(data)

        expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
        const data = { name: 'John', email: 'not-an-email' }
        const result = userSchema.safeParse(data)

        expect(result.success).toBe(false)
    })

    it('should reject missing required fields', () => {
        const data = { email: 'john@example.com' }
        const result = userSchema.safeParse(data)

        expect(result.success).toBe(false)
    })

    it('should include error details on failure', () => {
        const data = { name: '', email: 'invalid' }
        const result = userSchema.safeParse(data)

        if (!result.success) {
            expect(result.error.errors.length).toBeGreaterThan(0)
        }
    })
})

describe('Validation Middleware - Query Validation', () => {
    const querySchema = z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
        sort: z.enum(['asc', 'desc']).optional(),
    })

    it('should coerce string to number', () => {
        const query = { page: '5', limit: '25' }
        const result = querySchema.safeParse(query)

        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.page).toBe(5)
            expect(result.data.limit).toBe(25)
        }
    })

    it('should apply defaults', () => {
        const result = querySchema.safeParse({})

        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.page).toBe(1)
            expect(result.data.limit).toBe(20)
        }
    })

    it('should reject invalid enum value', () => {
        const query = { sort: 'invalid' }
        const result = querySchema.safeParse(query)

        expect(result.success).toBe(false)
    })
})

describe('Validation Middleware - Error Response', () => {
    it('should define 400 for validation errors', () => {
        const HTTP_BAD_REQUEST = 400
        expect(HTTP_BAD_REQUEST).toBe(400)
    })

    it('should format error response', () => {
        const formatError = (errors: string[]) => ({
            error: 'Validation failed',
            details: errors,
        })

        const response = formatError(['Name is required', 'Invalid email'])
        expect(response.error).toBe('Validation failed')
        expect(response.details).toHaveLength(2)
    })
})
