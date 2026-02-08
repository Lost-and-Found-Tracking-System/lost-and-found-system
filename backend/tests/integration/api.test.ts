/**
 * API INTEGRATION TESTS
 * 
 * This file demonstrates how to test Express API endpoints.
 * Uses 'supertest' to make HTTP requests to your Express app.
 * 
 * KEY CONCEPTS:
 * - supertest: Makes HTTP requests without starting a real server
 * - request(app): Creates a test client for your Express app
 * - .get(), .post(), .put(), .delete(): HTTP methods
 * - .expect(): Check status codes and response data
 * 
 * RUN THIS TEST:
 *   npm run test
 *   npm run test -- api  (run only this file)
 */

import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import { router } from '../../src/routes/index.js'

// Create a test app instance
const app = express()
app.use(express.json())
app.use('/api', router)

// ============================================
// TEST GROUP: Health Check Endpoint
// ============================================
describe('API - Health Check', () => {

    it('GET /api/health should return 200 OK', async () => {
        // Make a GET request to /api/health
        const response = await request(app)
            .get('/api/health')
            .expect(200)  // Assert status code is 200

        // Check response body
        expect(response.body).toHaveProperty('status', 'ok')
    })
})

// ============================================
// TEST GROUP: Auth Endpoints (without DB)
// ============================================
describe('API - Auth Validation', () => {

    it('POST /api/v1/auth/login should require email and password', async () => {
        // Send empty body
        const response = await request(app)
            .post('/api/v1/auth/login')
            .send({})  // Empty request body
            .expect(400)  // Should return 400 Bad Request

        // Check that error message mentions validation
        expect(response.body).toHaveProperty('error')
    })

    it('POST /api/v1/auth/login should reject invalid email format', async () => {
        const response = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'not-an-email',  // Invalid email
                password: 'password123'
            })
            .expect(400)

        expect(response.body.error).toBeDefined()
    })
})

// ============================================
// TEST GROUP: Protected Routes
// ============================================
describe('API - Protected Routes', () => {

    it('GET /api/v1/users/profile should require authentication', async () => {
        // Try to access without token
        const response = await request(app)
            .get('/api/v1/users/profile')
            .expect(401)  // Should return 401 Unauthorized

        expect(response.body.error).toContain('token')
    })

    it('should reject invalid JWT token', async () => {
        const response = await request(app)
            .get('/api/v1/users/profile')
            .set('Authorization', 'Bearer invalid-token-here')
            .expect(401)

        expect(response.body.error).toBeDefined()
    })
})
