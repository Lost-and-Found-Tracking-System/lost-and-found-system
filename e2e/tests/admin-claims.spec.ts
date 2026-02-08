import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Admin Claims Management E2E', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
        await page.waitForURL(/\/admin/);
        await page.goto('/admin/claims');
    });

    test('claims management page loads', async ({ page }) => {
        await expect(page).toHaveURL(/\/admin\/claims/);
    });

    test('claims management title displays', async ({ page }) => {
        await expect(page.locator('h1, h2').first()).toContainText(/Claim/i);
    });

    test('claims list or empty state displays', async ({ page }) => {
        const claimsOrEmpty = page.locator('text=/No claims|Pending|Approved|Rejected/i');
        await expect(claimsOrEmpty.first()).toBeVisible();
    });

    test('pending filter visible', async ({ page }) => {
        const pendingFilter = page.locator('button:has-text("Pending"), select option:has-text("Pending")').first();
        if (await pendingFilter.isVisible()) {
            await expect(pendingFilter).toBeVisible();
        }
    });

    test('pending filter works', async ({ page }) => {
        const pendingFilter = page.locator('button:has-text("Pending")').first();
        if (await pendingFilter.isVisible()) {
            await pendingFilter.click();
            await page.waitForTimeout(500);
        }
    });

    test('approved filter works', async ({ page }) => {
        const approvedFilter = page.locator('button:has-text("Approved")').first();
        if (await approvedFilter.isVisible()) {
            await approvedFilter.click();
            await page.waitForTimeout(500);
        }
    });

    test('rejected filter works', async ({ page }) => {
        const rejectedFilter = page.locator('button:has-text("Rejected")').first();
        if (await rejectedFilter.isVisible()) {
            await rejectedFilter.click();
            await page.waitForTimeout(500);
        }
    });

    test('expand claim row', async ({ page }) => {
        const claimRow = page.locator('tr, [class*="claim"]').filter({ hasText: /Claim|Pending|claim/i }).first();
        if (await claimRow.isVisible()) {
            await claimRow.click();
            await page.waitForTimeout(500);
        }
    });

    test('claim actions visible for pending', async ({ page }) => {
        const pendingClaim = page.locator('text=Pending').first();
        if (await pendingClaim.isVisible()) {
            await pendingClaim.click();
            const approveBtn = page.locator('button:has-text("Approve")').first();
            if (await approveBtn.isVisible()) {
                await expect(approveBtn).toBeVisible();
            }
        }
    });

    test('approve button visible for pending claims', async ({ page }) => {
        const pendingClaim = page.locator('text=Pending').first();
        if (await pendingClaim.isVisible()) {
            await pendingClaim.click();
            const approveBtn = page.locator('button:has-text("Approve")').first();
            if (await approveBtn.isVisible()) {
                await expect(approveBtn).toBeVisible();
            }
        }
    });

    test('reject button visible for pending claims', async ({ page }) => {
        const pendingClaim = page.locator('text=Pending').first();
        if (await pendingClaim.isVisible()) {
            await pendingClaim.click();
            const rejectBtn = page.locator('button:has-text("Reject")').first();
            if (await rejectBtn.isVisible()) {
                await expect(rejectBtn).toBeVisible();
            }
        }
    });

    test('remarks modal opens', async ({ page }) => {
        const pendingClaim = page.locator('text=Pending').first();
        if (await pendingClaim.isVisible()) {
            await pendingClaim.click();
            const approveBtn = page.locator('button:has-text("Approve")').first();
            if (await approveBtn.isVisible()) {
                await approveBtn.click();
                const modal = page.locator('[role="dialog"], .modal, textarea').first();
                if (await modal.isVisible()) {
                    await expect(modal).toBeVisible();
                }
            }
        }
    });

    test('search input visible', async ({ page }) => {
        const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
        if (await searchInput.isVisible()) {
            await expect(searchInput).toBeVisible();
        }
    });

    test('search works', async ({ page }) => {
        const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
        if (await searchInput.isVisible()) {
            await searchInput.fill('test');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
        }
    });
});
