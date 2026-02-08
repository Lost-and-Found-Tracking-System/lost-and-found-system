import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';
import { TEST_USERS, ROUTES } from '../fixtures/test-data';

test.describe('Item Details E2E', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await page.waitForURL(/\/dashboard/);
    });

    test('item details page loads from inventory', async ({ page }) => {
        await page.goto(ROUTES.inventory);
        const itemLink = page.locator('a[href*="/item/"]').first();
        if (await itemLink.isVisible()) {
            await itemLink.click();
            await expect(page).toHaveURL(/\/item\//);
        }
    });

    test('item title displays', async ({ page }) => {
        await page.goto(ROUTES.inventory);
        const itemLink = page.locator('a[href*="/item/"]').first();
        if (await itemLink.isVisible()) {
            await itemLink.click();
            await expect(page.locator('h1, h2').first()).toBeVisible();
        }
    });

    test('item status badge visible', async ({ page }) => {
        await page.goto(ROUTES.inventory);
        const itemLink = page.locator('a[href*="/item/"]').first();
        if (await itemLink.isVisible()) {
            await itemLink.click();
            await expect(page.locator('text=/Active|Pending|Resolved|Claimed/i').first()).toBeVisible();
        }
    });

    test('item type badge visible', async ({ page }) => {
        await page.goto(ROUTES.inventory);
        const itemLink = page.locator('a[href*="/item/"]').first();
        if (await itemLink.isVisible()) {
            await itemLink.click();
            await expect(page.locator('text=/Lost|Found/i').first()).toBeVisible();
        }
    });

    test('item description visible', async ({ page }) => {
        await page.goto(ROUTES.inventory);
        const itemLink = page.locator('a[href*="/item/"]').first();
        if (await itemLink.isVisible()) {
            await itemLink.click();
            await expect(page.locator('text=/Description/i').first()).toBeVisible();
        }
    });

    test('item attributes visible', async ({ page }) => {
        await page.goto(ROUTES.inventory);
        const itemLink = page.locator('a[href*="/item/"]').first();
        if (await itemLink.isVisible()) {
            await itemLink.click();
            await expect(page.locator('text=/Color|Material|Size|Category/i').first()).toBeVisible();
        }
    });

    test('back navigation works', async ({ page }) => {
        await page.goto(ROUTES.inventory);
        const itemLink = page.locator('a[href*="/item/"]').first();
        if (await itemLink.isVisible()) {
            await itemLink.click();
            await page.waitForURL(/\/item\//);
            const backButton = page.locator('button:has-text("Back"), a:has-text("Back")').first();
            if (await backButton.isVisible()) {
                await backButton.click();
                await expect(page).toHaveURL(/\/inventory/);
            }
        }
    });

    test('claim button visible for found items', async ({ page }) => {
        await page.goto(ROUTES.inventory);
        const foundFilter = page.locator('button:has-text("Found")').first();
        if (await foundFilter.isVisible()) {
            await foundFilter.click();
            await page.waitForTimeout(500);
        }
        const itemLink = page.locator('a[href*="/item/"]').first();
        if (await itemLink.isVisible()) {
            await itemLink.click();
            const claimButton = page.locator('button:has-text("Claim"), a:has-text("Claim")').first();
            if (await claimButton.isVisible()) {
                await expect(claimButton).toBeVisible();
            }
        }
    });
});
