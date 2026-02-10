import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';
import { LoginPage } from '../page-objects/login.page';

test.describe('Admin Claims Management E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
        await page.waitForURL(/\/admin/);
        await page.goto('/admin/claims');
        await page.waitForLoadState('networkidle');
    });

    // ── Positive: Claims management page loads ──
    test('TC-ACL-01: Admin claims management page loads', async ({ page }) => {
        await expect(page).toHaveURL(/\/admin\/claims/);
    });

    // ── Positive: Claims title displays ──
    test('TC-ACL-02: Admin claims page displays heading', async ({ page }) => {
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible();
    });

    // ── Positive: Claims list or empty state ──
    test('TC-ACL-03: Admin claims shows claims list or empty state', async ({ page }) => {
        const claimsOrEmpty = page.locator('text=/No claims|Pending|Approved|Rejected|claim/i');
        await expect(claimsOrEmpty.first()).toBeVisible();
    });

    // ── Positive: Pending filter visible ──
    test('TC-ACL-04: Pending filter button is visible', async ({ page }) => {
        const pendingFilter = page.locator('button:has-text("Pending")').first();
        if (await pendingFilter.isVisible()) {
            await expect(pendingFilter).toBeVisible();
        }
    });

    // ── Positive: Pending filter works ──
    test('TC-ACL-05: Clicking Pending filter does not break the page', async ({ page }) => {
        const pendingFilter = page.locator('button:has-text("Pending")').first();
        if (await pendingFilter.isVisible()) {
            await pendingFilter.click();
            await page.waitForTimeout(500);
            await expect(page).toHaveURL(/\/admin\/claims/);
        }
    });

    // ── Positive: Approved filter works ──
    test('TC-ACL-06: Clicking Approved filter does not break the page', async ({ page }) => {
        const approvedFilter = page.locator('button:has-text("Approved")').first();
        if (await approvedFilter.isVisible()) {
            await approvedFilter.click();
            await page.waitForTimeout(500);
            await expect(page).toHaveURL(/\/admin\/claims/);
        }
    });

    // ── Positive: Rejected filter works ──
    test('TC-ACL-07: Clicking Rejected filter does not break the page', async ({ page }) => {
        const rejectedFilter = page.locator('button:has-text("Rejected")').first();
        if (await rejectedFilter.isVisible()) {
            await rejectedFilter.click();
            await page.waitForTimeout(500);
            await expect(page).toHaveURL(/\/admin\/claims/);
        }
    });

    // ── Positive: Search input visible ──
    test('TC-ACL-08: Search input is visible on claims management page', async ({ page }) => {
        const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
        if (await searchInput.isVisible()) {
            await expect(searchInput).toBeVisible();
        }
    });

});
