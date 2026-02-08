// Test setup file - runs before each test file
import { beforeAll, afterAll, vi } from 'vitest'

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.JWT_ACCESS_SECRET = 'test-access-secret'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
process.env.MONGODB_URI = 'mongodb://localhost:27017/lostfound_test'

// Mock console to reduce noise during tests
beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => { })
    vi.spyOn(console, 'warn').mockImplementation(() => { })
})

afterAll(() => {
    vi.restoreAllMocks()
})
