import { test as base, Page } from '@playwright/test';
import { ROUTES, TEST_USERS } from './test-data';

// Extend base test with auth fixtures
export const test = base.extend<{
    authenticatedPage: Page;
    adminPage: Page;
    facultyPage: Page;
}>({
    authenticatedPage: async ({ page }, use) => {
        await loginAs(page, TEST_USERS.student);
        await use(page);
    },
    adminPage: async ({ page }, use) => {
        await loginAs(page, TEST_USERS.admin);
        await use(page);
    },
    facultyPage: async ({ page }, use) => {
        await loginAs(page, TEST_USERS.faculty);
        await use(page);
    },
});

// Helper function to login as a user
export async function loginAs(page: Page, user: { email: string; password: string }) {
    await page.goto(ROUTES.login);
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    // The login button uses .login-btn class (ElasticButton component)
    await page.locator('.login-btn').first().click();

    // Wait for navigation — GSAP animation has 0.5s delay before navigate()
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 15000 });
}

// Helper to logout
export async function logout(page: Page) {
    const logoutButton = page.locator('text=Logout').first();
    if (await logoutButton.isVisible()) {
        await logoutButton.click();
    }
}

// Helper to get auth token via API
export async function getAuthToken(request: any, user: { email: string; password: string }): Promise<string> {
    const response = await request.post('http://localhost:3000/api/v1/auth/login', {
        data: { email: user.email, password: user.password },
    });
    const body = await response.json();
    return body.accessToken;
}

export { expect } from '@playwright/test';
