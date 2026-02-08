/**
 * DATABASE INTEGRATION TESTS FOR ITEM SERVICE
 * Tests item submission, search, and retrieval
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import {
    submitItem,
    getItemById,
    getItemsByType,
    searchItems,
    saveDraft,
    getDraft,
    deleteDraft
} from '../../src/services/itemService.js'
import { ItemModel, DraftSubmissionModel, UserModel } from '../../src/models/index.js'

let mongoServer: MongoMemoryServer
let testUserId: string

// Setup in-memory MongoDB
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())

    // Create a test user
    const user = await UserModel.create({
        role: 'student',
        credentials: {
            passwordHash: 'test-hash',
            passwordUpdatedAt: new Date(),
            failedLoginAttempts: 0,
        },
        profile: {
            fullName: 'Test User',
            email: 'test@example.com',
        },
        status: 'active',
    })
    testUserId = user._id.toString()
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})

describe('Item Service - Submit Item', () => {
    beforeEach(async () => {
        await ItemModel.deleteMany({})
    })

    it('should submit a lost item', async () => {
        const input = {
            submissionType: 'lost' as const,
            itemAttributes: {
                category: 'Electronics',
                description: 'Black iPhone 14 with cracked screen',
                color: 'Black',
            },
            location: {
                type: 'Point' as const,
                coordinates: [80.2707, 13.0827] as [number, number],
                zoneId: new mongoose.Types.ObjectId().toString(),
            },
            timeMetadata: {
                lostOrFoundAt: new Date(),
                reportedAt: new Date(),
            },
            isAnonymous: false,
            submittedBy: testUserId,
        }

        const item = await submitItem(input)

        expect(item).toBeDefined()
        expect(item.trackingId).toMatch(/^ITEM-[A-F0-9]{16}$/)
        expect(item.submissionType).toBe('lost')
        expect(item.status).toBe('submitted')
        expect(item.itemAttributes.category).toBe('Electronics')
    })

    it('should submit a found item', async () => {
        const input = {
            submissionType: 'found' as const,
            itemAttributes: {
                category: 'Documents',
                description: 'Student ID Card',
            },
            location: {
                type: 'Point' as const,
                coordinates: [80.25, 13.05] as [number, number],
                zoneId: new mongoose.Types.ObjectId().toString(),
            },
            timeMetadata: {
                lostOrFoundAt: new Date(),
                reportedAt: new Date(),
            },
            isAnonymous: true,
        }

        const item = await submitItem(input)

        expect(item.submissionType).toBe('found')
        expect(item.isAnonymous).toBe(true)
    })

    it('should generate unique tracking IDs', async () => {
        const baseInput = {
            submissionType: 'lost' as const,
            itemAttributes: {
                category: 'Electronics',
                description: 'Test item',
            },
            location: {
                type: 'Point' as const,
                coordinates: [0, 0] as [number, number],
                zoneId: new mongoose.Types.ObjectId().toString(),
            },
            timeMetadata: {
                lostOrFoundAt: new Date(),
                reportedAt: new Date(),
            },
            isAnonymous: false,
        }

        const item1 = await submitItem(baseInput)
        const item2 = await submitItem(baseInput)

        expect(item1.trackingId).not.toBe(item2.trackingId)
    })
})

describe('Item Service - Get Item', () => {
    beforeEach(async () => {
        await ItemModel.deleteMany({})
    })

    it('should retrieve item by ID', async () => {
        // First create an item
        const created = await submitItem({
            submissionType: 'lost' as const,
            itemAttributes: {
                category: 'Bags',
                description: 'Blue backpack with laptop inside',
            },
            location: {
                type: 'Point' as const,
                coordinates: [80.2, 13.1] as [number, number],
                zoneId: new mongoose.Types.ObjectId().toString(),
            },
            timeMetadata: {
                lostOrFoundAt: new Date(),
                reportedAt: new Date(),
            },
            isAnonymous: false,
        })

        const found = await getItemById(created._id.toString())

        expect(found).toBeDefined()
        expect(found?.trackingId).toBe(created.trackingId)
        expect(found?.itemAttributes.description).toBe('Blue backpack with laptop inside')
    })

    it('should return null for non-existent item', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString()
        const result = await getItemById(fakeId)
        expect(result).toBeNull()
    })
})

describe('Item Service - Get Items by Type', () => {
    beforeEach(async () => {
        await ItemModel.deleteMany({})

        // Create test items for each test
        for (let i = 0; i < 5; i++) {
            await submitItem({
                submissionType: 'lost' as const,
                itemAttributes: {
                    category: 'Electronics',
                    description: `Lost item ${i}`,
                },
                location: {
                    type: 'Point' as const,
                    coordinates: [80.2, 13.1] as [number, number],
                    zoneId: new mongoose.Types.ObjectId().toString(),
                },
                timeMetadata: {
                    lostOrFoundAt: new Date(),
                    reportedAt: new Date(),
                },
                isAnonymous: false,
            })
        }

        for (let i = 0; i < 3; i++) {
            await submitItem({
                submissionType: 'found' as const,
                itemAttributes: {
                    category: 'Documents',
                    description: `Found item ${i}`,
                },
                location: {
                    type: 'Point' as const,
                    coordinates: [80.3, 13.2] as [number, number],
                    zoneId: new mongoose.Types.ObjectId().toString(),
                },
                timeMetadata: {
                    lostOrFoundAt: new Date(),
                    reportedAt: new Date(),
                },
                isAnonymous: false,
            })
        }
    })

    it('should get lost items', async () => {
        const items = await getItemsByType('lost', 10, 0)
        expect(items.length).toBe(5)
        items.forEach(item => {
            expect(item.submissionType).toBe('lost')
        })
    })

    it('should get found items', async () => {
        const items = await getItemsByType('found', 10, 0)
        expect(items.length).toBe(3)
        items.forEach(item => {
            expect(item.submissionType).toBe('found')
        })
    })

    it('should respect limit parameter', async () => {
        const items = await getItemsByType('lost', 2, 0)
        expect(items.length).toBe(2)
    })
})

describe('Item Service - Search Items', () => {
    beforeEach(async () => {
        await ItemModel.deleteMany({})

        // Create searchable items
        await submitItem({
            submissionType: 'lost' as const,
            itemAttributes: {
                category: 'Electronics',
                description: 'Black iPhone with case',
            },
            location: {
                type: 'Point' as const,
                coordinates: [80.2, 13.1] as [number, number],
                zoneId: new mongoose.Types.ObjectId().toString(),
            },
            timeMetadata: {
                lostOrFoundAt: new Date(),
                reportedAt: new Date(),
            },
            isAnonymous: false,
        })

        await submitItem({
            submissionType: 'found' as const,
            itemAttributes: {
                category: 'Electronics',
                description: 'White Samsung phone',
            },
            location: {
                type: 'Point' as const,
                coordinates: [80.3, 13.2] as [number, number],
                zoneId: new mongoose.Types.ObjectId().toString(),
            },
            timeMetadata: {
                lostOrFoundAt: new Date(),
                reportedAt: new Date(),
            },
            isAnonymous: false,
        })
    })

    it('should search by keyword', async () => {
        const result = await searchItems({ q: 'iPhone' })
        expect(result.total).toBe(1)
        expect(result.items.length).toBe(1)
    })

    it('should filter by category', async () => {
        const result = await searchItems({ category: 'Electronics' })
        expect(result.total).toBe(2)
    })

    it('should filter by submission type', async () => {
        const result = await searchItems({ submissionType: 'lost' })
        expect(result.total).toBe(1)
        result.items.forEach((item: any) => {
            expect(item.submissionType).toBe('lost')
        })
    })

    it('should return empty results for no match', async () => {
        const result = await searchItems({ q: 'xyznonexistent' })
        expect(result.total).toBe(0)
        expect(result.items.length).toBe(0)
    })
})

describe('Item Service - Draft Management', () => {
    beforeEach(async () => {
        await DraftSubmissionModel.deleteMany({})
    })

    it('should save a draft', async () => {
        const partialData = {
            submissionType: 'lost',
            itemAttributes: {
                category: 'Electronics',
                description: 'In progress...',
            },
        }

        const draft = await saveDraft(testUserId, partialData)

        expect(draft).toBeDefined()
        expect(draft.partialData).toEqual(partialData)
    })

    it('should update existing draft', async () => {
        const partialData1 = { description: 'First version' }
        await saveDraft(testUserId, partialData1)

        const partialData2 = { description: 'Updated version' }
        const updated = await saveDraft(testUserId, partialData2)

        expect(updated.partialData).toEqual(partialData2)

        // Should only have one draft per user
        const count = await DraftSubmissionModel.countDocuments({ userId: testUserId })
        expect(count).toBe(1)
    })

    it('should retrieve draft', async () => {
        const partialData = { test: 'data' }
        await saveDraft(testUserId, partialData)

        const draft = await getDraft(testUserId)

        expect(draft).toBeDefined()
        expect(draft?.partialData).toEqual(partialData)
    })

    it('should delete draft', async () => {
        await saveDraft(testUserId, { test: 'data' })
        await deleteDraft(testUserId)

        const draft = await getDraft(testUserId)
        expect(draft).toBeNull()
    })
})
