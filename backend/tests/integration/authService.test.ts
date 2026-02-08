/**
 * DATABASE INTEGRATION TESTS FOR AUTH SERVICE
 * Tests user registration, login, and authentication flows
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { registerUser, loginUser, getUserById } from '../../src/services/authService.js'
import { UserModel } from '../../src/models/index.js'

let mongoServer: MongoMemoryServer

// Setup in-memory MongoDB
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})

describe('Auth Service - User Registration', () => {
    beforeEach(async () => {
        await UserModel.deleteMany({})
    })

    it('should register a new user successfully', async () => {
        const input = {
            email: 'test@example.com',
            fullName: 'Test User',
            password: 'password123',
        }

        const result = await registerUser(input)

        expect(result).toBeDefined()
        expect(result.userId).toBeDefined()
        expect(result.role).toBe('student')
        expect(result.accessToken).toBeDefined()
        expect(result.refreshToken).toBeDefined()
    })

    it('should register user with optional fields', async () => {
        const input = {
            institutionalId: 'STU001',
            email: 'student@college.edu',
            fullName: 'John Student',
            password: 'securepass123',
            phone: '9876543210',
            affiliation: 'Computer Science',
        }

        const result = await registerUser(input)

        expect(result.userId).toBeDefined()

        // Verify user was saved with optional fields
        const user = await UserModel.findById(result.userId)
        expect(user?.profile.phone).toBe('9876543210')
        expect(user?.profile.affiliation).toBe('Computer Science')
    })

    it('should reject duplicate email registration', async () => {
        const input = {
            email: 'duplicate@example.com',
            fullName: 'First User',
            password: 'password123',
        }

        // First registration should succeed
        await registerUser(input)

        // Second registration with same email should fail
        await expect(registerUser({
            ...input,
            fullName: 'Second User',
        })).rejects.toThrow('User already exists')
    })

    it('should hash password before storing', async () => {
        const input = {
            email: 'hash@example.com',
            fullName: 'Hash Test',
            password: 'plaintextpassword',
        }

        const result = await registerUser(input)
        const user = await UserModel.findById(result.userId)

        expect(user?.credentials.passwordHash).toBeDefined()
        expect(user?.credentials.passwordHash).not.toBe('plaintextpassword')
        expect(user?.credentials.passwordHash?.startsWith('$argon2')).toBe(true)
    })
})

describe('Auth Service - User Login', () => {
    beforeEach(async () => {
        await UserModel.deleteMany({})
        // Create a test user for each login test
        await registerUser({
            email: 'login@example.com',
            fullName: 'Login User',
            password: 'correctpassword',
        })
    })

    it('should login with correct credentials', async () => {
        const result = await loginUser({
            email: 'login@example.com',
            password: 'correctpassword',
            deviceInfo: 'Test Browser',
            ipAddress: '127.0.0.1',
            approxLocation: 'Test Location',
        })

        expect(result).toBeDefined()
        expect(result.userId).toBeDefined()
        expect(result.accessToken).toBeDefined()
        expect(result.refreshToken).toBeDefined()
    })

    it('should reject incorrect password', async () => {
        await expect(loginUser({
            email: 'login@example.com',
            password: 'wrongpassword',
            deviceInfo: 'Test Browser',
            ipAddress: '127.0.0.1',
            approxLocation: 'Test Location',
        })).rejects.toThrow('Invalid email or password')
    })

    it('should reject non-existent user', async () => {
        await expect(loginUser({
            email: 'nonexistent@example.com',
            password: 'anypassword',
            deviceInfo: 'Test Browser',
            ipAddress: '127.0.0.1',
            approxLocation: 'Test Location',
        })).rejects.toThrow('Invalid email or password')
    })
})

describe('Auth Service - Get User', () => {
    beforeEach(async () => {
        await UserModel.deleteMany({})
    })

    it('should retrieve user by ID', async () => {
        const { userId } = await registerUser({
            email: 'getuser@example.com',
            fullName: 'Get User Test',
            password: 'password123',
        })

        const user = await getUserById(userId)

        expect(user).toBeDefined()
        expect(user?.profile.fullName).toBe('Get User Test')
        expect(user?.profile.email).toBe('getuser@example.com')
    })

    it('should not expose password hash', async () => {
        const { userId } = await registerUser({
            email: 'nohash@example.com',
            fullName: 'No Hash Test',
            password: 'password123',
        })

        const user = await getUserById(userId)

        // Password hash should be excluded
        expect(user?.credentials.passwordHash).toBeUndefined()
    })

    it('should return null for non-existent user ID', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString()
        const user = await getUserById(fakeId)
        expect(user).toBeNull()
    })
})
