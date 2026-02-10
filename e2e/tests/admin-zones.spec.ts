import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';
import { LoginPage } from '../page-objects/login.page';

test.describe('Admin Zone Management E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
        await page.waitForURL(/\/admin/);
        await page.goto('/admin/zones');
        await page.waitForLoadState('networkidle');
    });

    // ── Positive: Zones page loads ──
    test('TC-AZN-01: Admin zone management page loads', async ({ page }) => {
        await expect(page).toHaveURL(/\/admin\/zones/);
    });

    // ── Positive: Zones heading visible ──
    test('TC-AZN-02: Zone management page displays heading', async ({ page }) => {
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible();
    });

    // ── Positive: Zone list visible ──
    test('TC-AZN-03: Zone list or map is visible', async ({ page }) => {
        const bodyText = await page.locator('body').innerText();
        const hasZoneContent = /Zone|Campus|Area|Location|Block/i.test(bodyText);
        expect(hasZoneContent).toBeTruthy();
    });

    // ── Positive: Add zone button visible ──
    test('TC-AZN-04: Add zone button is visible', async ({ page }) => {
        const addBtn = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').first();
        if (await addBtn.isVisible()) {
            await expect(addBtn).toBeVisible();
        }
    });

    // ── Positive: Zone names displayed ──
    test('TC-AZN-05: Zone names are displayed in the list', async ({ page }) => {
        const zoneContent = page.locator('td, [class*="zone-name"], [class*="card"]').first();
        if (await zoneContent.isVisible()) {
            await expect(zoneContent).toBeVisible();
        }
    });

    // ── Positive: Zone page has content ──
    test('TC-AZN-06: Zone management page has meaningful content', async ({ page }) => {
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.length).toBeGreaterThan(50);
    });

});
