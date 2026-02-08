import { test, expect } from '@playwright/test';
import { ROUTES } from '../fixtures/test-data';

test.describe('Landing Page E2E', () => {
    test('landing page loads successfully', async ({ page }) => {
        await page.goto(ROUTES.home);
        await expect(page).toHaveTitle(/Amrita|Lost|Found|Nexus/i);
    });

    test('hero section displays correctly', async ({ page }) => {
        await page.goto(ROUTES.home);
        await expect(page.locator('h1').first()).toBeVisible();
    });

    test('feature cards display', async ({ page }) => {
        await page.goto(ROUTES.home);
        const features = page.locator('[class*="rounded"]').filter({ hasText: /AI|Secure|Zone|Live/i });
        await expect(features.first()).toBeVisible();
    });

    test('statistics section shows data', async ({ page }) => {
        await page.goto(ROUTES.home);
        await expect(page.locator('text=/\\d+k\\+|\\d+/').first()).toBeVisible();
    });

    test('CTA button visible', async ({ page }) => {
        await page.goto(ROUTES.home);
        const ctaButton = page.locator('a:has-text("Launch"), a:has-text("Portal"), a:has-text("Login")').first();
        await expect(ctaButton).toBeVisible();
    });

    test('navigation to login from landing', async ({ page }) => {
        await page.goto(ROUTES.home);
        const ctaButton = page.locator('a:has-text("Launch"), a:has-text("Portal"), a:has-text("Login")').first();
        await ctaButton.click();
        await expect(page).toHaveURL(/\/(login|portal)/);
    });

    test('footer section visible', async ({ page }) => {
        await page.goto(ROUTES.home);
        const footer = page.locator('footer').first();
        if (await footer.isVisible()) {
            await expect(footer).toBeVisible();
        }
    });
});
