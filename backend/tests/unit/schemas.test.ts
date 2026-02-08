/**
 * UNIT TESTS FOR ZOD VALIDATION SCHEMAS
 * Tests request validation schemas
 */

import { describe, it, expect } from 'vitest'
import {
    registerSchema,
    loginSchema,
    submitItemSchema,
    submitClaimSchema,
    updateProfileSchema,
    searchItemsSchema,
    claimDecisionSchema,
} from '../../src/schemas/index.js'

describe('Auth Schemas - registerSchema', () => {
    it('should accept valid registration data', () => {
        const data = {
            email: 'test@example.com',
            fullName: 'John Doe',
            password: 'password123',
        }

        const result = registerSchema.safeParse(data)
        expect(result.success).toBe(true)
    })

    it('should accept registration with optional fields', () => {
        const data = {
            institutionalId: 'STU001',
            email: 'student@college.edu',
            fullName: 'Jane Smith',
            password: 'securepass123',
            phone: '9876543210',
            affiliation: 'Computer Science',
        }

        const result = registerSchema.safeParse(data)
        expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
        const data = {
            email: 'not-an-email',
            fullName: 'Test User',
            password: 'password123',
        }

        const result = registerSchema.safeParse(data)
        expect(result.success).toBe(false)
    })

    it('should reject short password', () => {
        const data = {
            email: 'test@example.com',
            fullName: 'Test User',
            password: 'short',  // Less than 8 chars
        }

        const result = registerSchema.safeParse(data)
        expect(result.success).toBe(false)
    })

    it('should reject empty fullName', () => {
        const data = {
            email: 'test@example.com',
            fullName: '',
            password: 'password123',
        }

        const result = registerSchema.safeParse(data)
        expect(result.success).toBe(false)
    })
})

describe('Auth Schemas - loginSchema', () => {
    it('should accept valid login data', () => {
        const data = {
            email: 'user@example.com',
            password: 'mypassword',
        }

        const result = loginSchema.safeParse(data)
        expect(result.success).toBe(true)
    })

    it('should reject missing password', () => {
        const data = {
            email: 'user@example.com',
        }

        const result = loginSchema.safeParse(data)
        expect(result.success).toBe(false)
    })

    it('should reject invalid email format', () => {
        const data = {
            email: 'invalid',
            password: 'password',
        }

        const result = loginSchema.safeParse(data)
        expect(result.success).toBe(false)
    })
})

describe('Item Schemas - submitItemSchema', () => {
    it('should accept valid lost item submission', () => {
        const data = {
            submissionType: 'lost',
            itemAttributes: {
                category: 'Electronics',
                description: 'Black iPhone 14 with cracked screen',
                color: 'Black',
            },
            location: {
                type: 'Point',
                coordinates: [80.2707, 13.0827],
                zoneId: '507f1f77bcf86cd799439011',
            },
            timeMetadata: {
                lostOrFoundAt: new Date().toISOString(),
                reportedAt: new Date().toISOString(),
            },
            isAnonymous: false,
        }

        const result = submitItemSchema.safeParse(data)
        expect(result.success).toBe(true)
    })

    it('should accept valid found item submission', () => {
        const data = {
            submissionType: 'found',
            itemAttributes: {
                category: 'Documents',
                description: 'Student ID card',
            },
            location: {
                type: 'Point',
                coordinates: [80.2, 13.1],
                zoneId: '507f1f77bcf86cd799439011',
            },
            timeMetadata: {
                lostOrFoundAt: new Date().toISOString(),
                reportedAt: new Date().toISOString(),
            },
            isAnonymous: true,
        }

        const result = submitItemSchema.safeParse(data)
        expect(result.success).toBe(true)
    })

    it('should reject invalid submission type', () => {
        const data = {
            submissionType: 'stolen',  // Invalid
            itemAttributes: {
                category: 'Electronics',
                description: 'Test item',
            },
            location: {
                type: 'Point',
                coordinates: [0, 0],
                zoneId: '507f1f77bcf86cd799439011',
            },
            timeMetadata: {
                lostOrFoundAt: new Date().toISOString(),
                reportedAt: new Date().toISOString(),
            },
            isAnonymous: false,
        }

        const result = submitItemSchema.safeParse(data)
        expect(result.success).toBe(false)
    })
})

describe('Claim Schemas - submitClaimSchema', () => {
    it('should accept valid claim submission', () => {
        const data = {
            itemId: '507f1f77bcf86cd799439011',
            ownershipProofs: ['I can describe the lock screen image'],
        }

        const result = submitClaimSchema.safeParse(data)
        expect(result.success).toBe(true)
    })

    it('should accept claim with multiple proofs', () => {
        const data = {
            itemId: '507f1f77bcf86cd799439011',
            ownershipProofs: [
                'Serial number: ABC123',
                'Has a scratch on back',
                'Contains my photos',
            ],
        }

        const result = submitClaimSchema.safeParse(data)
        expect(result.success).toBe(true)
    })

    it('should reject claim without proofs', () => {
        const data = {
            itemId: '507f1f77bcf86cd799439011',
            ownershipProofs: [],
        }

        const result = submitClaimSchema.safeParse(data)
        expect(result.success).toBe(false)
    })
})

describe('Claim Schemas - claimDecisionSchema', () => {
    it('should accept approved decision', () => {
        const data = {
            decision: 'approved',
            remarks: 'Ownership verified successfully',
        }

        const result = claimDecisionSchema.safeParse(data)
        expect(result.success).toBe(true)
    })

    it('should accept rejected decision', () => {
        const data = {
            decision: 'rejected',
            remarks: 'Unable to verify ownership',
        }

        const result = claimDecisionSchema.safeParse(data)
        expect(result.success).toBe(true)
    })

    it('should reject invalid decision', () => {
        const data = {
            decision: 'pending',  // Invalid
            remarks: 'Some remarks',
        }

        const result = claimDecisionSchema.safeParse(data)
        expect(result.success).toBe(false)
    })

    it('should reject empty remarks', () => {
        const data = {
            decision: 'approved',
            remarks: '',
        }

        const result = claimDecisionSchema.safeParse(data)
        expect(result.success).toBe(false)
    })
})

describe('User Schemas - updateProfileSchema', () => {
    it('should accept partial update', () => {
        const data = {
            fullName: 'Updated Name',
        }

        const result = updateProfileSchema.safeParse(data)
        expect(result.success).toBe(true)
    })

    it('should accept all optional fields', () => {
        const data = {
            fullName: 'New Name',
            phone: '9876543210',
            affiliation: 'Engineering',
        }

        const result = updateProfileSchema.safeParse(data)
        expect(result.success).toBe(true)
    })

    it('should accept empty object', () => {
        const result = updateProfileSchema.safeParse({})
        expect(result.success).toBe(true)
    })
})

describe('Search Schemas - searchItemsSchema', () => {
    it('should accept empty search params', () => {
        const result = searchItemsSchema.safeParse({})
        expect(result.success).toBe(true)
    })

    it('should accept full search params', () => {
        const data = {
            q: 'iphone',
            category: 'Electronics',
            submissionType: 'lost',
            limit: 50,
            skip: 10,
        }

        const result = searchItemsSchema.safeParse(data)
        expect(result.success).toBe(true)
    })

    it('should apply defaults for limit and skip', () => {
        const result = searchItemsSchema.safeParse({})

        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.limit).toBe(20)
            expect(result.data.skip).toBe(0)
        }
    })

    it('should reject limit over 100', () => {
        const data = {
            limit: 500,
        }

        const result = searchItemsSchema.safeParse(data)
        expect(result.success).toBe(false)
    })
})
