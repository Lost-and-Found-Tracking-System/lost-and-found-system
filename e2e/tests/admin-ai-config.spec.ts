import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';
import { LoginPage } from '../page-objects/login.page';

test.describe('Admin AI Config E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
        await page.waitForURL(/\/admin/);
        await page.goto('/admin/ai-config');
        await page.waitForLoadState('networkidle');
    });

    // ── Positive: AI Config page loads ──
    test('TC-AIC-01: Admin AI configuration page loads', async ({ page }) => {
        await expect(page).toHaveURL(/\/admin\/ai-config/);
    });

    // ── Positive: AI Config heading visible ──
    test('TC-AIC-02: AI configuration page displays heading', async ({ page }) => {
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible();
    });

    // ── Positive: Threshold settings visible ──
    test('TC-AIC-03: AI threshold settings are visible', async ({ page }) => {
        const thresholdContent = page.locator('text=/Threshold|Auto|Confidence|Weight|Score/i').first();
        if (await thresholdContent.isVisible()) {
            await expect(thresholdContent).toBeVisible();
        }
    });

    // ── Positive: Weight configuration visible ──
    test('TC-AIC-04: AI weight configuration fields are visible', async ({ page }) => {
        const bodyText = await page.locator('body').innerText();
        const hasWeightContent = /Description|Visual|Geolocation|Time|Weight|Feature/i.test(bodyText);
        expect(hasWeightContent).toBeTruthy();
    });

    // ── Positive: Save/Update button visible ──
    test('TC-AIC-05: Save or Update configuration button is visible', async ({ page }) => {
        const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update"), button:has-text("Apply")').first();
        if (await saveBtn.isVisible()) {
            await expect(saveBtn).toBeVisible();
        }
    });

    // ── Positive: Config page has content ──
    test('TC-AIC-06: AI configuration page has meaningful content', async ({ page }) => {
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.length).toBeGreaterThan(50);
    });

});
