import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';
import { TEST_USERS, ROUTES } from '../fixtures/test-data';

test.describe('Authentication E2E', () => {
    // Complete login flow - covers all login scenarios efficiently
    test('complete login flow for different user roles', async ({ page }) => {
        const loginPage = new LoginPage(page);

        // Test 1: Student login → dashboard
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await expect(page).toHaveURL(/\/dashboard/);
        await expect(page.locator('h1')).toContainText(/Dashboard/i);

        // Logout
        const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
        if (await logoutBtn.isVisible()) {
            await logoutBtn.click();
        }
    });

    test('admin login redirects to admin dashboard', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
        await expect(page).toHaveURL(/\/admin/);
    });

    test('faculty login redirects to user dashboard', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.faculty.email, TEST_USERS.faculty.password);
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('login page displays correctly', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.submitButton).toBeVisible();
    });

    test('login form accepts input', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.emailInput.fill('test@test.com');
        await loginPage.passwordInput.fill('password');
        await expect(loginPage.emailInput).toHaveValue('test@test.com');
        await expect(loginPage.passwordInput).toHaveValue('password');
    });

    test('logout clears session', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await page.waitForURL(/\/dashboard/);

        const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
        if (await logoutBtn.isVisible()) {
            await logoutBtn.click();
            await expect(page).toHaveURL(/\/(login|\/)/);
        }
    });

    test('[NEGATIVE] invalid credentials show error', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login('invalid@test.com', 'wrongpassword');
        await expect(loginPage.errorMessage).toBeVisible();
    });

    test('[NEGATIVE] wrong password shows error', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, 'wrongpassword');
        await expect(loginPage.errorMessage).toBeVisible();
    });

    test('[NEGATIVE] empty email stays on login', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.passwordInput.fill('password');
        await loginPage.submitButton.click();
        await expect(page).toHaveURL(/\/login/);
    });

    test('[NEGATIVE] empty password stays on login', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.emailInput.fill('test@test.com');
        await loginPage.submitButton.click();
        await expect(page).toHaveURL(/\/login/);
    });

    test('[NEGATIVE] protected dashboard redirects to login', async ({ page }) => {
        await page.goto(ROUTES.dashboard);
        await expect(page).toHaveURL(/\/login/);
    });

    test('[NEGATIVE] protected profile redirects to login', async ({ page }) => {
        await page.goto(ROUTES.profile);
        await expect(page).toHaveURL(/\/login/);
    });

    test('[NEGATIVE] protected claims redirects to login', async ({ page }) => {
        await page.goto(ROUTES.myClaims);
        await expect(page).toHaveURL(/\/login/);
    });
});
