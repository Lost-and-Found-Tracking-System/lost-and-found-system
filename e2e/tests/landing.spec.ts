import { expect, test } from '@playwright/test';

test.describe('Landing Page E2E Tests', () => {

    // ── Positive: Landing page loads ──
    test('TC-LAND-01: Landing page loads successfully at root URL', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        // Root URL may stay as / or have no path
        const url = page.url();
        expect(url).toContain('localhost:5173');
    });

    // ── Positive: Page has heading ──
    test('TC-LAND-02: Landing page displays a main heading', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const heading = page.locator('h1').first();
        await expect(heading).toBeVisible();
    });

    // ── Positive: Login link is visible ──
    test('TC-LAND-03: Landing page has login navigation link', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const loginLink = page.locator('a[href="/login"], button:has-text("Login"), a:has-text("Login"), button:has-text("Sign In"), a:has-text("Sign In")').first();
        await expect(loginLink).toBeVisible();
    });

    // ── Positive: Register link is visible ──
    test('TC-LAND-04: Landing page has register navigation link', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const registerLink = page.locator('a[href="/register"], button:has-text("Register"), a:has-text("Register"), button:has-text("Sign Up"), a:has-text("Sign Up")').first();
        await expect(registerLink).toBeVisible();
    });

    // ── Positive: Login link navigates correctly ──
    test('TC-LAND-05: Login link navigates to /login page', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const loginLink = page.locator('a[href="/login"], button:has-text("Login"), a:has-text("Login"), button:has-text("Sign In"), a:has-text("Sign In")').first();
        await loginLink.click();
        await expect(page).toHaveURL(/\/login/);
    });

    // ── Positive: Page title is set ──
    test('TC-LAND-06: Landing page has a non-empty document title', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
    });

    // ── Positive: Page content is present ──
    test('TC-LAND-07: Landing page contains descriptive content', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.length).toBeGreaterThan(50);
    });

    // ── Positive: /home alias works ──
    test('TC-LAND-08: /home alias loads the same landing page', async ({ page }) => {
        await page.goto('/home');
        await page.waitForLoadState('networkidle');
        const heading = page.locator('h1').first();
        await expect(heading).toBeVisible();
    });

});
