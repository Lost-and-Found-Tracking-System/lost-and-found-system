import { expect, test } from '@playwright/test';
import { API_ROUTES, TEST_USERS } from '../fixtures/test-data';

/**
 * API Integration Tests
 * These tests verify the contract between frontend and backend
 * by making direct HTTP requests to the backend API endpoints.
 */
test.describe('API Integration E2E Tests', () => {

    // ── Positive: Login API returns access token ──
    test('TC-API-01: POST /auth/login returns accessToken for valid credentials', async ({ request }) => {
        const response = await request.post(API_ROUTES.login, {
            data: {
                email: TEST_USERS.student.email,
                password: TEST_USERS.student.password,
            },
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('accessToken');
        expect(body).toHaveProperty('userId');
        expect(body).toHaveProperty('role');
    });

    // ── Positive: Admin login returns admin role ──
    test('TC-API-02: POST /auth/login for admin returns role=admin', async ({ request }) => {
        const response = await request.post(API_ROUTES.login, {
            data: {
                email: TEST_USERS.admin.email,
                password: TEST_USERS.admin.password,
            },
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.role).toBe('admin');
    });

    // ── Positive: Get user profile with token ──
    test('TC-API-03: GET /users/profile returns user data with valid token', async ({ request }) => {
        // Login first to get token
        const loginRes = await request.post(API_ROUTES.login, {
            data: {
                email: TEST_USERS.student.email,
                password: TEST_USERS.student.password,
            },
        });
        const { accessToken } = await loginRes.json();

        // Get profile
        const profileRes = await request.get(API_ROUTES.profile, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        expect(profileRes.status()).toBe(200);
        const profile = await profileRes.json();
        expect(profile).toHaveProperty('profile');
        expect(profile.profile.email).toBe(TEST_USERS.student.email);
    });

    // ── Positive: Get items list ──
    test('TC-API-04: GET /items returns paginated items list', async ({ request }) => {
        const loginRes = await request.post(API_ROUTES.login, {
            data: {
                email: TEST_USERS.student.email,
                password: TEST_USERS.student.password,
            },
        });
        const { accessToken } = await loginRes.json();

        const itemsRes = await request.get(API_ROUTES.items, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        expect(itemsRes.status()).toBe(200);
        const body = await itemsRes.json();
        expect(body).toHaveProperty('items');
        expect(body).toHaveProperty('pagination');
        expect(Array.isArray(body.items)).toBeTruthy();
    });

    // ── Positive: Get zones list ──
    test('TC-API-05: GET /zones returns zones array', async ({ request }) => {
        const response = await request.get(API_ROUTES.zones);
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBeTruthy();
    });

    // ── Positive: Get dashboard stats ──
    test('TC-API-06: GET /dashboard/stats returns user statistics', async ({ request }) => {
        const loginRes = await request.post(API_ROUTES.login, {
            data: {
                email: TEST_USERS.student.email,
                password: TEST_USERS.student.password,
            },
        });
        const { accessToken } = await loginRes.json();

        const statsRes = await request.get(API_ROUTES.dashboardStats, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        expect(statsRes.status()).toBe(200);
        const stats = await statsRes.json();
        expect(stats).toHaveProperty('totalReported');
        expect(stats).toHaveProperty('totalClaims');
    });

    // ── Positive: Get admin stats ──
    test('TC-API-07: GET /admin/stats returns admin statistics', async ({ request }) => {
        const loginRes = await request.post(API_ROUTES.login, {
            data: {
                email: TEST_USERS.admin.email,
                password: TEST_USERS.admin.password,
            },
        });
        const { accessToken } = await loginRes.json();

        const statsRes = await request.get(API_ROUTES.adminStats, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        expect(statsRes.status()).toBe(200);
        const stats = await statsRes.json();
        expect(stats).toHaveProperty('totalUsers');
        expect(stats).toHaveProperty('totalItems');
        expect(stats).toHaveProperty('totalClaims');
    });

    // ── Positive: Get my claims ──
    test('TC-API-08: GET /claims/user/my-claims returns claims array', async ({ request }) => {
        const loginRes = await request.post(API_ROUTES.login, {
            data: {
                email: TEST_USERS.student.email,
                password: TEST_USERS.student.password,
            },
        });
        const { accessToken } = await loginRes.json();

        const claimsRes = await request.get(API_ROUTES.myClaims, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        expect(claimsRes.status()).toBe(200);
        const claims = await claimsRes.json();
        expect(Array.isArray(claims)).toBeTruthy();
    });

    // ── Negative (altered to positive): Invalid login returns error ──
    test('TC-API-09: POST /auth/login with wrong password returns 401', async ({ request }) => {
        const response = await request.post(API_ROUTES.login, {
            data: {
                email: TEST_USERS.student.email,
                password: 'WrongPassword@999',
            },
        });
        expect(response.status()).toBe(401);
    });

    // ── Negative (altered to positive): Unauthenticated profile returns 401 ──
    test('TC-API-10: GET /users/profile without token returns 401', async ({ request }) => {
        const response = await request.get(API_ROUTES.profile);
        expect(response.status()).toBe(401);
    });

});
