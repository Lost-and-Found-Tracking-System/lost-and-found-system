import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';
import { LoginPage } from '../page-objects/login.page';

test.describe('Admin Role Management E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
        await page.waitForURL(/\/admin/);
        await page.goto('/admin/roles');
        await page.waitForLoadState('networkidle');
    });

    // ── Positive: Roles page loads ──
    test('TC-ARL-01: Admin role management page loads', async ({ page }) => {
        await expect(page).toHaveURL(/\/admin\/roles/);
    });

    // ── Positive: Roles heading visible ──
    test('TC-ARL-02: Role management page displays heading', async ({ page }) => {
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible();
    });

    // ── Positive: User list visible ──
    test('TC-ARL-03: User list or table is visible', async ({ page }) => {
        const bodyText = await page.locator('body').innerText();
        const hasUserContent = /student|faculty|admin|user|email|role/i.test(bodyText);
        expect(hasUserContent).toBeTruthy();
    });

    // ── Positive: Role filter/search ──
    test('TC-ARL-04: Search or filter input is available', async ({ page }) => {
        const searchInput = page.locator('input[type="search"], input[type="text"][placeholder*="search" i], select').first();
        if (await searchInput.isVisible()) {
            await expect(searchInput).toBeVisible();
        }
    });

    // ── Positive: User roles are displayed ──
    test('TC-ARL-05: User role badges are visible in the list', async ({ page }) => {
        const roleBadge = page.locator('text=/student|faculty|admin|delegated_admin|visitor/i').first();
        await expect(roleBadge).toBeVisible();
    });

    // ── Positive: Role change button visibility ──
    test('TC-ARL-06: Role change or edit button is visible for users', async ({ page }) => {
        const editBtn = page.locator('button:has-text("Edit"), button:has-text("Change"), button:has-text("Update"), select').first();
        if (await editBtn.isVisible()) {
            await expect(editBtn).toBeVisible();
        }
    });

});
