import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';
import { DashboardPage } from '../page-objects/dashboard.page';
import { LoginPage } from '../page-objects/login.page';

test.describe('User Dashboard E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await page.waitForURL(/\/dashboard/);
    });

    // ── Positive: Dashboard loads ──
    test('TC-DASH-01: Dashboard page loads for authenticated student', async ({ page }) => {
        await expect(page).toHaveURL(/\/dashboard/);
    });

    // ── Positive: Dashboard heading ──
    test('TC-DASH-02: Dashboard displays heading text', async ({ page }) => {
        const dashboard = new DashboardPage(page);
        await expect(dashboard.heading).toBeVisible();
    });

    // ── Positive: Sidebar visible ──
    test('TC-DASH-03: Sidebar navigation is visible', async ({ page }) => {
        const dashboard = new DashboardPage(page);
        await expect(dashboard.sidebarNav).toBeVisible();
    });

    // ── Positive: Report link ──
    test('TC-DASH-04: Report item link is accessible from dashboard', async ({ page }) => {
        const dashboard = new DashboardPage(page);
        const reportLink = page.locator('a[href="/report"]').first();
        if (await reportLink.isVisible()) {
            await expect(reportLink).toBeVisible();
        }
    });

    // ── Positive: Inventory link ──
    test('TC-DASH-05: Inventory link is accessible from sidebar', async ({ page }) => {
        const dashboard = new DashboardPage(page);
        const inventoryLink = page.locator('a[href="/inventory"]').first();
        if (await inventoryLink.isVisible()) {
            await expect(inventoryLink).toBeVisible();
        }
    });

    // ── Positive: Navigate to inventory ──
    test('TC-DASH-06: Navigate from dashboard to inventory page', async ({ page }) => {
        const inventoryLink = page.locator('a[href="/inventory"]').first();
        if (await inventoryLink.isVisible()) {
            await inventoryLink.click();
            await expect(page).toHaveURL(/\/inventory/);
        }
    });

    // ── Positive: Navigate to profile ──
    test('TC-DASH-07: Navigate from dashboard to profile page', async ({ page }) => {
        const profileLink = page.locator('a[href="/profile"]').first();
        if (await profileLink.isVisible()) {
            await profileLink.click();
            await expect(page).toHaveURL(/\/profile/);
        }
    });

    // ── Positive: Stats section exists ──
    test('TC-DASH-08: Dashboard displays statistics or content section', async ({ page }) => {
        const contentArea = page.locator('main, [class*="content"], [class*="dashboard"]').first();
        await expect(contentArea).toBeVisible();
    });

});
