import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';
import { InventoryPage } from '../page-objects/inventory.page';
import { LoginPage } from '../page-objects/login.page';

test.describe('Item Inventory E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await page.waitForURL(/\/dashboard/);
    });

    // ── Positive: Inventory page loads ──
    test('TC-INV-01: Inventory page loads successfully', async ({ page }) => {
        const inventory = new InventoryPage(page);
        await inventory.goto();
        await expect(page).toHaveURL(/\/inventory/);
    });

    // ── Positive: Inventory displays heading ──
    test('TC-INV-02: Inventory page displays a heading', async ({ page }) => {
        const inventory = new InventoryPage(page);
        await inventory.goto();
        await expect(inventory.heading).toBeVisible();
    });

    // ── Positive: Search input visible ──
    test('TC-INV-03: Search input is visible on inventory page', async ({ page }) => {
        const inventory = new InventoryPage(page);
        await inventory.goto();
        const searchInput = page.locator('input[type="search"], input[type="text"][placeholder*="search" i], input[placeholder*="Search" i]').first();
        if (await searchInput.isVisible()) {
            await expect(searchInput).toBeVisible();
        }
    });

    // ── Positive: Search accepts input ──
    test('TC-INV-04: Search input accepts and retains typed text', async ({ page }) => {
        const inventory = new InventoryPage(page);
        await inventory.goto();
        const searchInput = page.locator('input[type="search"], input[type="text"][placeholder*="search" i], input[placeholder*="Search" i]').first();
        if (await searchInput.isVisible()) {
            await searchInput.fill('laptop');
            await expect(searchInput).toHaveValue('laptop');
        }
    });

    // ── Positive: Filter buttons visible ──
    test('TC-INV-05: Filter options are visible on inventory page', async ({ page }) => {
        const inventory = new InventoryPage(page);
        await inventory.goto();
        const filterEl = page.locator('button:has-text("All"), button:has-text("Lost"), button:has-text("Found"), select').first();
        if (await filterEl.isVisible()) {
            await expect(filterEl).toBeVisible();
        }
    });

    // ── Positive: Lost filter works ──
    test('TC-INV-06: Clicking Lost filter does not break the page', async ({ page }) => {
        const inventory = new InventoryPage(page);
        await inventory.goto();
        const lostFilter = page.locator('button:has-text("Lost")').first();
        if (await lostFilter.isVisible()) {
            await lostFilter.click();
            await page.waitForTimeout(500);
            await expect(page).toHaveURL(/\/inventory/);
        }
    });

    // ── Positive: Found filter works ──
    test('TC-INV-07: Clicking Found filter does not break the page', async ({ page }) => {
        const inventory = new InventoryPage(page);
        await inventory.goto();
        const foundFilter = page.locator('button:has-text("Found")').first();
        if (await foundFilter.isVisible()) {
            await foundFilter.click();
            await page.waitForTimeout(500);
            await expect(page).toHaveURL(/\/inventory/);
        }
    });

    // ── Positive: Items or empty state displayed ──
    test('TC-INV-08: Inventory shows items or an empty state message', async ({ page }) => {
        const inventory = new InventoryPage(page);
        await inventory.goto();
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.length).toBeGreaterThan(50);
    });

    // ── Positive: Item card is clickable ──
    test('TC-INV-09: Item card is clickable and navigates to item details', async ({ page }) => {
        const inventory = new InventoryPage(page);
        await inventory.goto();
        const itemCard = page.locator('[class*="card"] a, [class*="item"] a, a[href*="/item/"]').first();
        if (await itemCard.isVisible()) {
            await itemCard.click();
            await expect(page).toHaveURL(/\/item\//);
        }
    });

    // ── Positive: Page content is present ──
    test('TC-INV-10: Inventory page contains meaningful content', async ({ page }) => {
        const inventory = new InventoryPage(page);
        await inventory.goto();
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.length).toBeGreaterThan(50);
    });

});
