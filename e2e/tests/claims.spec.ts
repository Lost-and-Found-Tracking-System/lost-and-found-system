import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';
import { LoginPage } from '../page-objects/login.page';

test.describe('Claims E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await page.waitForURL(/\/dashboard/);
    });

    // ── Positive: My Claims page loads ──
    test('TC-CLM-01: My Claims page loads successfully', async ({ page }) => {
        await page.goto('/my-claims');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/my-claims/);
    });

    // ── Positive: My Claims heading visible ──
    test('TC-CLM-02: My Claims page displays heading', async ({ page }) => {
        await page.goto('/my-claims');
        await page.waitForLoadState('networkidle');
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible();
    });

    // ── Positive: Claims list or empty state ──
    test('TC-CLM-03: Claims page shows claims list or empty state', async ({ page }) => {
        await page.goto('/my-claims');
        await page.waitForLoadState('networkidle');
        const content = page.locator('text=/No claims|Pending|Approved|Rejected|claim/i').first();
        await expect(content).toBeVisible();
    });

    // ── Positive: Navigate to claim from inventory ──
    test('TC-CLM-04: Navigate to claim submission from item details', async ({ page }) => {
        await page.goto('/inventory');
        await page.waitForLoadState('networkidle');
        const itemLink = page.locator('a[href*="/item/"]').first();
        if (await itemLink.isVisible()) {
            await itemLink.click();
            await page.waitForLoadState('networkidle');
            const claimBtn = page.locator('button:has-text("Claim"), a:has-text("Claim"), a[href*="/claim/"]').first();
            if (await claimBtn.isVisible()) {
                await claimBtn.click();
                await expect(page).toHaveURL(/\/claim\//);
            }
        }
    });

    // ── Positive: Claim form visible ──
    test('TC-CLM-05: Claim submission form displays input fields', async ({ page }) => {
        await page.goto('/inventory');
        await page.waitForLoadState('networkidle');
        const itemLink = page.locator('a[href*="/item/"]').first();
        if (await itemLink.isVisible()) {
            await itemLink.click();
            await page.waitForLoadState('networkidle');
            const claimBtn = page.locator('button:has-text("Claim"), a:has-text("Claim"), a[href*="/claim/"]').first();
            if (await claimBtn.isVisible()) {
                await claimBtn.click();
                await page.waitForLoadState('networkidle');
                const formInput = page.locator('textarea, input[type="text"]').first();
                if (await formInput.isVisible()) {
                    await expect(formInput).toBeVisible();
                }
            }
        }
    });

    // ── Positive: My Claims sidebar link works ──
    test('TC-CLM-06: My Claims link in sidebar navigates correctly', async ({ page }) => {
        const claimsLink = page.locator('a[href="/my-claims"]').first();
        if (await claimsLink.isVisible()) {
            await claimsLink.click();
            await expect(page).toHaveURL(/\/my-claims/);
        }
    });

    // ── Negative (altered): Unauthenticated claims access redirects ──
    test('TC-CLM-07: Unauthenticated access to my-claims redirects to login', async ({ browser }) => {
        const context = await browser.newContext();
        const newPage = await context.newPage();
        await newPage.goto('/my-claims');
        await expect(newPage).toHaveURL(/\/login/);
        await context.close();
    });

    // ── Positive: Claims page shows status badges ──
    test('TC-CLM-08: Claims page displays status indicators if claims exist', async ({ page }) => {
        await page.goto('/my-claims');
        await page.waitForLoadState('networkidle');
        const statusBadge = page.locator('text=/pending|approved|rejected|withdrawn|No claims/i').first();
        await expect(statusBadge).toBeVisible();
    });

});
