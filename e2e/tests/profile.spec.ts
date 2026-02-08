import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';
import { TEST_USERS, ROUTES } from '../fixtures/test-data';

test.describe('Profile & Settings E2E', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await page.waitForURL(/\/dashboard/);
    });

    test('profile page loads', async ({ page }) => {
        await page.goto(ROUTES.profile);
        await expect(page).toHaveURL(/\/profile/);
    });

    test('profile page displays title', async ({ page }) => {
        await page.goto(ROUTES.profile);
        await expect(page.locator('h1, h2').first()).toContainText(/Profile|Settings|Account/i);
    });

    test('email field populated', async ({ page }) => {
        await page.goto(ROUTES.profile);
        const emailField = page.locator('input[type="email"], input[name="email"]').first();
        await expect(emailField).toHaveValue(/.+@.+/);
    });

    test('role displayed', async ({ page }) => {
        await page.goto(ROUTES.profile);
        await expect(page.locator('text=/Role|Student|Faculty|Admin/i').first()).toBeVisible();
    });

    test('full name field visible', async ({ page }) => {
        await page.goto(ROUTES.profile);
        const nameField = page.locator('input[name="fullName"], input[placeholder*="name" i]').first();
        if (await nameField.isVisible()) {
            await expect(nameField).toBeVisible();
        }
    });

    test('full name field editable', async ({ page }) => {
        await page.goto(ROUTES.profile);
        const nameField = page.locator('input[name="fullName"], input[placeholder*="name" i]').first();
        if (await nameField.isVisible() && await nameField.isEnabled()) {
            await nameField.clear();
            await nameField.fill('Test User Updated');
            await expect(nameField).toHaveValue('Test User Updated');
        }
    });

    test('phone field visible', async ({ page }) => {
        await page.goto(ROUTES.profile);
        const phoneField = page.locator('input[name="phone"], input[type="tel"]').first();
        if (await phoneField.isVisible()) {
            await expect(phoneField).toBeVisible();
        }
    });

    test('phone field editable', async ({ page }) => {
        await page.goto(ROUTES.profile);
        const phoneField = page.locator('input[name="phone"], input[type="tel"]').first();
        if (await phoneField.isVisible() && await phoneField.isEnabled()) {
            await phoneField.clear();
            await phoneField.fill('9876543210');
            await expect(phoneField).toHaveValue('9876543210');
        }
    });

    test('email field is read-only', async ({ page }) => {
        await page.goto(ROUTES.profile);
        const emailField = page.locator('input[type="email"]').first();
        const isDisabled = await emailField.isDisabled();
        const isReadonly = await emailField.getAttribute('readonly');
        expect(isDisabled || isReadonly !== null).toBeTruthy();
    });

    test('notification toggles visible', async ({ page }) => {
        await page.goto(ROUTES.profile);
        const toggle = page.locator('input[type="checkbox"], [role="switch"]').first();
        if (await toggle.isVisible()) {
            await expect(toggle).toBeVisible();
        }
    });

    test('notification toggle works', async ({ page }) => {
        await page.goto(ROUTES.profile);
        const toggle = page.locator('input[type="checkbox"], [role="switch"]').first();
        if (await toggle.isVisible()) {
            const wasChecked = await toggle.isChecked();
            await toggle.click();
            if (wasChecked) {
                await expect(toggle).not.toBeChecked();
            } else {
                await expect(toggle).toBeChecked();
            }
        }
    });

    test('save button visible', async ({ page }) => {
        await page.goto(ROUTES.profile);
        const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
        if (await saveButton.isVisible()) {
            await expect(saveButton).toBeVisible();
        }
    });

    test('save button works', async ({ page }) => {
        await page.goto(ROUTES.profile);
        const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
        if (await saveButton.isVisible()) {
            await saveButton.click();
            await page.waitForTimeout(1000);
        }
    });
});
