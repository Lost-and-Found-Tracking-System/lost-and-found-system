/**
 * COMPREHENSIVE ROUTE INTEGRATION TESTS
 * Tests all v1 API routes focusing on authentication and validation
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { router } from '../../src/routes/index.js'
import { UserModel, ItemModel, ClaimModel, NotificationModel } from '../../src/models/index.js'
import { signAccessToken } from '../../src/utils/jwt.js'
import { hashPassword } from '../../src/utils/password.js'

// Create a test app instance
const app = express()
app.use(express.json())
app.use('/api', router)

let mongoServer: MongoMemoryServer
let studentToken: string
let adminToken: string
let testUserId: string
let adminUserId: string

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())

    // Create test student user
    const studentUser = await UserModel.create({
        role: 'student',
        credentials: {
            passwordHash: await hashPassword('password123'),
            passwordUpdatedAt: new Date(),
            failedLoginAttempts: 0,
        },
        profile: {
            fullName: 'Test Student',
            email: 'student@example.com',
        },
        status: 'active',
    })
    testUserId = studentUser._id.toString()
    studentToken = signAccessToken({ userId: testUserId, role: 'student' })

    // Create admin user
    const adminUser = await UserModel.create({
        role: 'admin',
        credentials: {
            passwordHash: await hashPassword('admin123'),
            passwordUpdatedAt: new Date(),
            failedLoginAttempts: 0,
        },
        profile: {
            fullName: 'Admin User',
            email: 'admin@example.com',
        },
        status: 'active',
    })
    adminUserId = adminUser._id.toString()
    adminToken = signAccessToken({ userId: adminUserId, role: 'admin' })
})

beforeEach(async () => {
    await ItemModel.deleteMany({})
    await ClaimModel.deleteMany({})
    await NotificationModel.deleteMany({})
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})

// ============================================
// AUTH ROUTES - Validation Tests
// ============================================
describe('Routes - Auth Validation', () => {
    it('POST /api/v1/auth/register should reject empty body', async () => {
        const response = await request(app)
            .post('/api/v1/auth/register')
            .send({})
            .expect(400)

        expect(response.body.error).toBeDefined()
    })

    it('POST /api/v1/auth/login should reject empty body', async () => {
        const response = await request(app)
            .post('/api/v1/auth/login')
            .send({})
            .expect(400)

        expect(response.body.error).toBeDefined()
    })

    it('POST /api/v1/auth/login should reject invalid email', async () => {
        const response = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'not-an-email',
                password: 'password123',
            })
            .expect(400)

        expect(response.body.error).toBeDefined()
    })
})

// ============================================
// ITEMS ROUTES - Auth Tests
// ============================================
describe('Routes - Items Auth', () => {
    it('POST /api/v1/items should require authentication', async () => {
        const response = await request(app)
            .post('/api/v1/items')
            .send({
                type: 'lost',
                category: 'electronics',
                title: 'Lost Phone',
                description: 'Black iPhone',
            })
            .expect(401)

        expect(response.body.error).toBeDefined()
    })

    it('GET /api/v1/items should work without auth', async () => {
        const response = await request(app)
            .get('/api/v1/items')

        // Should not be 401
        expect(response.status).not.toBe(401)
    })
})

// ============================================
// CLAIMS ROUTES - Auth Tests
// ============================================
describe('Routes - Claims Auth', () => {
    it('POST /api/v1/claims should require authentication', async () => {
        const response = await request(app)
            .post('/api/v1/claims')
            .send({
                itemId: 'some-item-id',
                description: 'This is my item',
            })
            .expect(401)

        expect(response.body.error).toBeDefined()
    })
})

// ============================================
// USERS ROUTES - Auth Tests
// ============================================
describe('Routes - Users Auth', () => {
    it('GET /api/v1/users/profile should require authentication', async () => {
        const response = await request(app)
            .get('/api/v1/users/profile')
            .expect(401)

        expect(response.body.error).toBeDefined()
    })

    it('PUT /api/v1/users/profile should require auth', async () => {
        const response = await request(app)
            .put('/api/v1/users/profile')
            .send({ fullName: 'Updated Name' })
            .expect(401)

        expect(response.body.error).toBeDefined()
    })
})

// ============================================
// NOTIFICATIONS ROUTES - Auth Tests
// ============================================
describe('Routes - Notifications Auth', () => {
    it('GET /api/v1/notifications should require auth', async () => {
        const response = await request(app)
            .get('/api/v1/notifications')
            .expect(401)

        expect(response.body.error).toBeDefined()
    })
})

// ============================================
// ADMIN ROUTES - Role Tests
// ============================================
describe('Routes - Admin Role', () => {
    it('GET /api/v1/admin/users should require admin role', async () => {
        const response = await request(app)
            .get('/api/v1/admin/users')
            .set('Authorization', `Bearer ${studentToken}`)
            .expect(403)

        expect(response.body.error).toBeDefined()
    })

    it('GET /api/v1/admin/stats should require auth', async () => {
        const response = await request(app)
            .get('/api/v1/admin/stats')
            .expect(401)

        expect(response.body.error).toBeDefined()
    })

    it('Admin should access admin routes', async () => {
        const response = await request(app)
            .get('/api/v1/admin/users')
            .set('Authorization', `Bearer ${adminToken}`)

        // Should not be 401 or 403
        expect(response.status).not.toBe(401)
        expect(response.status).not.toBe(403)
    })
})

// ============================================
// UPLOADS ROUTES - Auth Tests
// ============================================
describe('Routes - Uploads Auth', () => {
    it('POST /api/v1/uploads/image should require auth', async () => {
        const response = await request(app)
            .post('/api/v1/uploads/image')
            .expect(401)

        expect(response.body.error).toBeDefined()
    })
})

// ============================================
// HEALTH CHECK
// ============================================
describe('Routes - Health', () => {
    it('GET /api/health should return OK', async () => {
        const response = await request(app)
            .get('/api/health')
            .expect(200)

        expect(response.body.status).toBe('ok')
    })
})
