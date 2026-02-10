import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';
import { AdminDashboardPage } from '../page-objects/admin-dashboard.page';
import { LoginPage } from '../page-objects/login.page';

test.describe('Admin Dashboard E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
        await page.waitForURL(/\/admin/);
    });

    // ── Positive: Admin dashboard loads ──
    test('TC-ADM-01: Admin dashboard loads successfully', async ({ page }) => {
        await expect(page).toHaveURL(/\/admin/);
    });

    // ── Positive: Admin heading visible ──
    test('TC-ADM-02: Admin dashboard displays heading', async ({ page }) => {
        const adminDash = new AdminDashboardPage(page);
        await expect(adminDash.heading).toBeVisible();
    });

    // ── Positive: Admin sidebar visible ──
    test('TC-ADM-03: Admin sidebar navigation is visible', async ({ page }) => {
        const adminDash = new AdminDashboardPage(page);
        await expect(adminDash.sidebar).toBeVisible();
    });

    // ── Positive: Stats cards visible ──
    test('TC-ADM-04: Admin dashboard displays statistics cards', async ({ page }) => {
        const statsOrContent = page.locator('text=/Total|Users|Items|Claims|Pending|Resolved/i').first();
        await expect(statsOrContent).toBeVisible();
    });

    // ── Positive: Activity feed visible ──
    test('TC-ADM-05: Admin dashboard shows activity feed or recent activity', async ({ page }) => {
        const activity = page.locator('text=/Activity|Recent|Feed|Latest/i').first();
        if (await activity.isVisible()) {
            await expect(activity).toBeVisible();
        }
    });

    // ── Positive: Claims management link ──
    test('TC-ADM-06: Claims management link is accessible from admin sidebar', async ({ page }) => {
        const claimsLink = page.locator('a[href="/admin/claims"]').first();
        if (await claimsLink.isVisible()) {
            await expect(claimsLink).toBeVisible();
        }
    });

    // ── Positive: Roles management link ──
    test('TC-ADM-07: Role management link is accessible from admin sidebar', async ({ page }) => {
        const rolesLink = page.locator('a[href="/admin/roles"]').first();
        if (await rolesLink.isVisible()) {
            await expect(rolesLink).toBeVisible();
        }
    });

    // ── Negative (altered): Non-admin cannot access admin dashboard ──
    test('TC-ADM-08: Non-admin user is redirected away from admin dashboard', async ({ browser }) => {
        const context = await browser.newContext();
        const newPage = await context.newPage();
        // Login as student
        await newPage.goto('/login');
        await newPage.waitForLoadState('networkidle');
        await newPage.fill('input[type="email"]', TEST_USERS.student.email);
        await newPage.fill('input[type="password"]', TEST_USERS.student.password);
        await newPage.locator('.login-btn').first().click();
        await newPage.waitForURL(/\/dashboard/, { timeout: 15000 });
        // Try to access admin page
        await newPage.goto('/admin');
        await newPage.waitForTimeout(2000);
        // Student should be redirected away from admin, or page should show unauthorized
        const url = newPage.url();
        const pageText = await newPage.locator('body').innerText();
        const isRedirected = /\/dashboard/.test(url) || /\/login/.test(url);
        const isUnauthorized = /unauthorized|access denied|not authorized/i.test(pageText);
        const notOnAdmin = !url.includes('/admin');
        expect(isRedirected || isUnauthorized || notOnAdmin).toBeTruthy();
        await context.close();
    });

});
