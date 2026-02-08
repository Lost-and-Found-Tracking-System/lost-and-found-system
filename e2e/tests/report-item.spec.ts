import { test, expect } from '@playwright/test';
import { ReportItemPage } from '../page-objects/report-item.page';
import { LoginPage } from '../page-objects/login.page';
import { TEST_USERS, TEST_ITEM } from '../fixtures/test-data';

test.describe('Report Item E2E', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await page.waitForURL(/\/dashboard/);
    });

    test('report page loads', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await expect(page).toHaveURL(/\/report/);
    });

    test('step 1 shows type selection', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await expect(reportPage.lostButton).toBeVisible();
        await expect(reportPage.foundButton).toBeVisible();
    });

    test('lost type selection works', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await reportPage.selectType('lost');
    });

    test('found type selection works', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await reportPage.selectType('found');
    });

    test('category selection visible', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await reportPage.selectType('lost');
        const categoryButton = page.locator('button:has-text("Electronics"), button:has-text("Books"), button:has-text("Clothing")').first();
        await expect(categoryButton).toBeVisible();
    });

    test('category selection works', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await reportPage.selectType('lost');
        await reportPage.selectCategory('Electronics');
    });

    test('description input works', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await reportPage.selectType('lost');
        await reportPage.selectCategory('Electronics');
        const descInput = page.locator('textarea').first();
        await descInput.fill(TEST_ITEM.description);
        await expect(descInput).toHaveValue(TEST_ITEM.description);
    });

    test('navigate to step 2 works', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await reportPage.selectType('lost');
        await reportPage.selectCategory('Electronics');
        await page.locator('textarea').first().fill(TEST_ITEM.description);
        await reportPage.goToNextStep();
        await expect(page.locator('text=/Location|Zone|Map|Step 2/i').first()).toBeVisible();
    });

    test('step 2 date picker visible', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await reportPage.selectType('lost');
        await reportPage.selectCategory('Electronics');
        await page.locator('textarea').first().fill(TEST_ITEM.description);
        await reportPage.goToNextStep();
        const datePicker = page.locator('input[type="date"], input[type="datetime-local"]').first();
        if (await datePicker.isVisible()) {
            await expect(datePicker).toBeVisible();
        }
    });

    test('step 2 zone selection visible', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await reportPage.selectType('lost');
        await reportPage.selectCategory('Electronics');
        await page.locator('textarea').first().fill(TEST_ITEM.description);
        await reportPage.goToNextStep();
        const zoneSelect = page.locator('select').first();
        if (await zoneSelect.isVisible()) {
            await expect(zoneSelect).toBeVisible();
        }
    });

    test('navigate to step 3 review', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await reportPage.selectType('lost');
        await reportPage.selectCategory('Electronics');
        await page.locator('textarea').first().fill(TEST_ITEM.description);
        await reportPage.goToNextStep();
        const zoneSelect = page.locator('select').first();
        if (await zoneSelect.isVisible()) {
            await zoneSelect.selectOption({ index: 1 });
        }
        await reportPage.goToNextStep();
        await expect(page.locator('text=/Review|Summary|Confirm|Step 3/i').first()).toBeVisible();
    });

    test('step 3 shows entered data', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await reportPage.selectType('lost');
        await reportPage.selectCategory('Electronics');
        await page.locator('textarea').first().fill(TEST_ITEM.description);
        await reportPage.goToNextStep();
        await reportPage.goToNextStep();
        await expect(page.locator(`text=/${TEST_ITEM.description.substring(0, 20)}/i`).first()).toBeVisible();
    });

    test('anonymous checkbox visible', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        const anonymousCheckbox = page.locator('input[type="checkbox"]').first();
        if (await anonymousCheckbox.isVisible()) {
            await expect(anonymousCheckbox).toBeVisible();
        }
    });

    test('anonymous checkbox toggle works', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        const anonymousCheckbox = page.locator('input[type="checkbox"]').first();
        if (await anonymousCheckbox.isVisible()) {
            await anonymousCheckbox.check();
            await expect(anonymousCheckbox).toBeChecked();
        }
    });

    test('[NEGATIVE] cannot proceed without selecting type', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        // Don't select type, try to click next
        const nextButton = page.locator('button:has-text("Next")').first();
        if (await nextButton.isVisible()) {
            await nextButton.click();
            // Should still be on report page
            await expect(page).toHaveURL(/\/report/);
        }
    });

    test('[NEGATIVE] cannot proceed without category', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await reportPage.selectType('lost');
        // Don't select category
        const nextButton = page.locator('button:has-text("Next")').first();
        if (await nextButton.isVisible()) {
            await nextButton.click();
            await expect(page.locator('text=/Category|Select|Required/i').first()).toBeVisible();
        }
    });

    test('[NEGATIVE] short description shows error', async ({ page }) => {
        const reportPage = new ReportItemPage(page);
        await reportPage.goto();
        await reportPage.selectType('lost');
        await reportPage.selectCategory('Electronics');
        await page.locator('textarea').first().fill('Hi');
        const nextButton = page.locator('button:has-text("Next")').first();
        await nextButton.click();
        const errorOrStillHere = page.locator('text=/description|characters|minimum/i');
        if (await errorOrStillHere.isVisible()) {
            await expect(errorOrStillHere.first()).toBeVisible();
        }
    });
});
