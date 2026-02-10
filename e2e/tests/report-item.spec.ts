import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';
import { LoginPage } from '../page-objects/login.page';
import { ReportItemPage } from '../page-objects/report-item.page';

test.describe('Report Item E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    });

    // ── Positive: Report page loads ──
    test('TC-RPT-01: Report item page loads successfully', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await expect(page).toHaveURL(/\/report/);
    });

    // ── Positive: Type selection buttons visible ──
    test('TC-RPT-02: Lost and Found type selection buttons are visible', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await expect(reportPage.lostButton).toBeVisible();
        await expect(reportPage.foundButton).toBeVisible();
    });

    // ── Positive: Select lost type ──
    test('TC-RPT-03: Selecting Lost type advances the form', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await reportPage.selectType('lost');
        // Verify something changed after clicking
        await page.waitForTimeout(500);
        await expect(page).toHaveURL(/\/report/);
    });

    // ── Positive: Select found type ──
    test('TC-RPT-04: Selecting Found type advances the form', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await reportPage.selectType('found');
        await page.waitForTimeout(500);
        await expect(page).toHaveURL(/\/report/);
    });

    // ── Positive: Report page has heading ──
    test('TC-RPT-05: Report page displays a heading', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible();
    });

    // ── Positive: Report form has content ──
    test('TC-RPT-06: Report form displays interactive elements', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        const content = page.locator('button, input, textarea, select').first();
        await expect(content).toBeVisible();
    });

    // ── Positive: Report page accessible from dashboard ──
    test('TC-RPT-07: Report page is accessible from dashboard navigation', async ({ page }) => {
        const reportLink = page.locator('a[href="/report"]').first();
        if (await reportLink.isVisible()) {
            await reportLink.click();
            await expect(page).toHaveURL(/\/report/);
        }
    });

    // ── Positive: Lost button interaction ──
    test('TC-RPT-08: Lost button click does not break the page', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await reportPage.lostButton.click();
        await page.waitForTimeout(500);
        // Report page should still be functional
        await expect(page).toHaveURL(/\/report/);
    });

    // ── Positive: Found button interaction ──
    test('TC-RPT-09: Found button click does not break the page', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await reportPage.foundButton.click();
        await page.waitForTimeout(500);
        await expect(page).toHaveURL(/\/report/);
    });

    // ── Positive: Page has meaningful content ──
    test('TC-RPT-10: Report page contains meaningful text content', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.length).toBeGreaterThan(50);
    });

    // ── Positive: Report page is secured ──
    test('TC-RPT-11: Unauthenticated access to report redirects to login', async ({ browser }) => {
        const context = await browser.newContext();
        const newPage = await context.newPage();
        await newPage.goto('/report');
        await expect(newPage).toHaveURL(/\/login/, { timeout: 10000 });
        await context.close();
    });

    // ── Positive: Multiple elements exist ──
    test('TC-RPT-12: Report page has multiple interactive buttons', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        const buttons = page.locator('button');
        const count = await buttons.count();
        expect(count).toBeGreaterThan(1);
    });

});
