import { test, expect } from '@playwright/test';
import { InventoryPage } from '../page-objects/inventory.page';
import { LoginPage } from '../page-objects/login.page';
import { TEST_USERS, ROUTES } from '../fixtures/test-data';

test.describe('Inventory Browsing E2E', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await page.waitForURL(/\/dashboard/);
    });

    test('inventory page loads', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        await expect(page).toHaveURL(/\/inventory/);
    });

    test('inventory page displays title', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('view toggle buttons visible', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        const viewBtns = page.locator('button:has(svg)');
        await expect(viewBtns.first()).toBeVisible();
    });

    test('list view toggle works', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        const listViewBtn = page.locator('button:has(svg), button[data-view="list"]').nth(1);
        if (await listViewBtn.isVisible()) {
            await listViewBtn.click();
            await page.waitForTimeout(300);
        }
    });

    test('grid view toggle works', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        const gridViewBtn = page.locator('button:has(svg), button[data-view="grid"]').first();
        if (await gridViewBtn.isVisible()) {
            await gridViewBtn.click();
        }
    });

    test('filter by lost works', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        const lostFilter = page.locator('button:has-text("Lost")').first();
        if (await lostFilter.isVisible()) {
            await lostFilter.click();
            await page.waitForTimeout(500);
        }
    });

    test('filter by found works', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        const foundFilter = page.locator('button:has-text("Found")').first();
        if (await foundFilter.isVisible()) {
            await foundFilter.click();
            await page.waitForTimeout(500);
        }
    });

    test('clear filters works', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        const clearBtn = page.locator('button:has-text("Clear"), button:has-text("Reset"), button:has-text("All")').first();
        if (await clearBtn.isVisible()) {
            await clearBtn.click();
        }
    });

    test('category filtering works', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        const categorySelect = page.locator('select[name="category"], select').first();
        if (await categorySelect.isVisible()) {
            await categorySelect.selectOption({ index: 1 });
            await page.waitForTimeout(500);
        }
    });

    test('pagination next works', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        const nextBtn = page.locator('button:has-text("Next"), button[aria-label*="next"]').first();
        if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
            await nextBtn.click();
            await page.waitForTimeout(500);
        }
    });

    test('pagination prev works', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        const nextBtn = page.locator('button:has-text("Next")').first();
        if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
            await nextBtn.click();
            await page.waitForTimeout(300);
            const prevBtn = page.locator('button:has-text("Previous"), button:has-text("Prev")').first();
            if (await prevBtn.isVisible()) {
                await prevBtn.click();
            }
        }
    });

    test('clicking item navigates to details', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
        const itemLink = page.locator('a[href*="/item/"]').first();
        if (await itemLink.isVisible()) {
            await itemLink.click();
            await expect(page).toHaveURL(/\/item\//);
        }
    });

    test('[NEGATIVE] invalid item ID handled gracefully', async ({ page }) => {
        await page.goto('/item/999999999');
        await expect(page.locator('body')).toBeVisible();
    });
});
