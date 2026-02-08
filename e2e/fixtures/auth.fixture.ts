import { test as base, Page } from '@playwright/test';
import { TEST_USERS, ROUTES } from './test-data';

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
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForURL(/\/(dashboard|admin)/);
}

// Helper to logout
export async function logout(page: Page) {
    // Click on sidebar logout or profile menu logout
    const logoutButton = page.locator('text=Logout').first();
    if (await logoutButton.isVisible()) {
        await logoutButton.click();
    }
}

export { expect } from '@playwright/test';
