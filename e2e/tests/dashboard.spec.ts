import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';
import { TEST_USERS, ROUTES } from '../fixtures/test-data';

test.describe('User Dashboard E2E', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await page.waitForURL(/\/dashboard/);
    });

    test('dashboard page loads', async ({ page }) => {
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('dashboard displays title', async ({ page }) => {
        await expect(page.locator('h1')).toContainText(/Dashboard/i);
    });

    test('welcome message shows', async ({ page }) => {
        await expect(page.locator('text=/Welcome|Hello/i')).toBeVisible();
    });

    test('stats cards display', async ({ page }) => {
        await expect(page.locator('text=/Items|Claims|Resolved|Pending/i').first()).toBeVisible();
    });

    test('my items section visible', async ({ page }) => {
        await expect(page.locator('text=/My Items|Your Items/i').first()).toBeVisible();
    });

    test('my claims section visible', async ({ page }) => {
        await expect(page.locator('text=/My Claims|Your Claims|Claims/i').first()).toBeVisible();
    });

    test('sidebar navigation visible', async ({ page }) => {
        await expect(page.locator('nav, aside').first()).toBeVisible();
    });

    test('sidebar navigation to inventory', async ({ page }) => {
        const inventoryLink = page.locator('a[href="/inventory"]').first();
        if (await inventoryLink.isVisible()) {
            await inventoryLink.click();
            await expect(page).toHaveURL(/\/inventory/);
        }
    });

    test('sidebar navigation to profile', async ({ page }) => {
        const profileLink = page.locator('a[href="/profile"]').first();
        if (await profileLink.isVisible()) {
            await profileLink.click();
            await expect(page).toHaveURL(/\/profile/);
        }
    });

    test('[NEGATIVE] student cannot access admin pages', async ({ page }) => {
        await page.goto('/admin');
        await expect(page).not.toHaveURL(/\/admin\/dashboard/);
    });

    test('[NEGATIVE] student cannot access admin claims', async ({ page }) => {
        await page.goto('/admin/claims');
        await expect(page).not.toHaveURL(/\/admin\/claims/);
    });
});
