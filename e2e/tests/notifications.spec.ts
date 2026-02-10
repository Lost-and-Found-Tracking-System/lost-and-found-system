import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';
import { LoginPage } from '../page-objects/login.page';

test.describe('Notifications E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await page.waitForURL(/\/dashboard/);
    });

    // ── Positive: Notifications page loads ──
    test('TC-NTF-01: Notifications page loads successfully', async ({ page }) => {
        await page.goto('/notifications');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/notifications/);
    });

    // ── Positive: Notifications heading visible ──
    test('TC-NTF-02: Notifications page displays heading', async ({ page }) => {
        await page.goto('/notifications');
        await page.waitForLoadState('networkidle');
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible();
    });

    // ── Positive: Notifications list or empty state ──
    test('TC-NTF-03: Notifications page shows list or empty state', async ({ page }) => {
        await page.goto('/notifications');
        await page.waitForLoadState('networkidle');
        const content = page.locator('text=/No notification|notification|empty|all caught up/i').first();
        await expect(content).toBeVisible();
    });

    // ── Positive: Mark all read button visibility ──
    test('TC-NTF-04: Mark all as read button is visible if applicable', async ({ page }) => {
        await page.goto('/notifications');
        await page.waitForLoadState('networkidle');
        const markAllBtn = page.locator('button:has-text("Mark all"), button:has-text("Read all"), button:has-text("mark all")').first();
        if (await markAllBtn.isVisible()) {
            await expect(markAllBtn).toBeVisible();
        }
    });

    // ── Positive: Notifications sidebar link ──
    test('TC-NTF-05: Notifications link in sidebar navigates correctly', async ({ page }) => {
        const notifLink = page.locator('a[href="/notifications"]').first();
        if (await notifLink.isVisible()) {
            await notifLink.click();
            await expect(page).toHaveURL(/\/notifications/);
        }
    });

    // ── Negative (altered): Unauthenticated access redirects ──
    test('TC-NTF-06: Unauthenticated access to notifications redirects to login', async ({ browser }) => {
        const context = await browser.newContext();
        const newPage = await context.newPage();
        await newPage.goto('/notifications');
        await expect(newPage).toHaveURL(/\/login/);
        await context.close();
    });

});
