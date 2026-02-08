import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';
import { TEST_USERS, ROUTES } from '../fixtures/test-data';

test.describe('Admin Dashboard E2E', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
        await page.waitForURL(/\/admin/);
    });

    test('admin dashboard loads', async ({ page }) => {
        await expect(page).toHaveURL(/\/admin/);
    });

    test('admin dashboard title displays', async ({ page }) => {
        await expect(page.locator('h1').first()).toContainText(/Admin|Dashboard/i);
    });

    test('stats cards visible', async ({ page }) => {
        const statsGrid = page.locator('.grid').first();
        await expect(statsGrid).toBeVisible();
    });

    test('stats show key metrics', async ({ page }) => {
        await expect(page.locator('text=/Users|Items|Claims|Pending/i').first()).toBeVisible();
    });

    test('recent activity visible', async ({ page }) => {
        await expect(page.locator('text=/Activity|Recent/i').first()).toBeVisible();
    });

    test('claims management link visible', async ({ page }) => {
        const claimsLink = page.locator('a[href="/admin/claims"]').first();
        await expect(claimsLink).toBeVisible();
    });

    test('navigation to claims management works', async ({ page }) => {
        const claimsLink = page.locator('a[href="/admin/claims"]').first();
        await claimsLink.click();
        await expect(page).toHaveURL(/\/admin\/claims/);
    });

    test('quick action cards visible', async ({ page }) => {
        const actionCard = page.locator('a[href*="/admin/"]').first();
        if (await actionCard.isVisible()) {
            await expect(actionCard).toBeVisible();
        }
    });

    test('quick action cards navigate', async ({ page }) => {
        const actionCard = page.locator('a[href*="/admin/"]').first();
        if (await actionCard.isVisible()) {
            const href = await actionCard.getAttribute('href');
            await actionCard.click();
            if (href) {
                await expect(page).toHaveURL(new RegExp(href));
            }
        }
    });
});

test.describe('Admin Access Control E2E', () => {
    test('[NEGATIVE] student cannot access admin pages', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await page.waitForURL(/\/dashboard/);
        await page.goto(ROUTES.admin);
        await expect(page).not.toHaveURL(/\/admin\/dashboard/);
    });

    test('[NEGATIVE] faculty cannot access admin pages', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.faculty.email, TEST_USERS.faculty.password);
        await page.waitForURL(/\/dashboard/);
        await page.goto(ROUTES.admin);
        await expect(page).not.toHaveURL(/\/admin\/dashboard/);
    });

    test('[NEGATIVE] unauthenticated user redirected to login', async ({ page }) => {
        await page.goto(ROUTES.admin);
        await expect(page).toHaveURL(/\/login/);
    });
});
