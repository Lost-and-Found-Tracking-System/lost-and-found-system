/**
 * Database Setup for Integration Tests
 * Uses mongodb-memory-server for isolated test database
 */

import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { beforeAll, afterAll, afterEach } from 'vitest'

let mongoServer: MongoMemoryServer

/**
 * Start in-memory MongoDB before all tests
 */
export async function setupTestDatabase() {
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()
    await mongoose.connect(mongoUri)
}

/**
 * Clear all collections after each test
 */
export async function clearDatabase() {
    const collections = mongoose.connection.collections
    for (const key in collections) {
        await collections[key].deleteMany({})
    }
}

/**
 * Stop MongoDB and disconnect after all tests
 */
export async function teardownTestDatabase() {
    await mongoose.disconnect()
    await mongoServer.stop()
}

/**
 * Setup hooks for use in test files
 */
export function useTestDatabase() {
    beforeAll(async () => {
        await setupTestDatabase()
    })

    afterEach(async () => {
        await clearDatabase()
    })

    afterAll(async () => {
        await teardownTestDatabase()
    })
}
