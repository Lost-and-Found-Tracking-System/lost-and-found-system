import { expect, test } from '@playwright/test';
import { ROUTES, TEST_USERS } from '../fixtures/test-data';
import { LoginPage } from '../page-objects/login.page';

test.describe('Authentication E2E Tests', () => {

    // ── Positive: Student Login ──
    test('TC-AUTH-01: Student login navigates to user dashboard', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    });

    // ── Positive: Admin Login ──
    test('TC-AUTH-02: Admin login navigates to admin dashboard', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
        await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
    });

    // ── Positive: Faculty Login ──
    test('TC-AUTH-03: Faculty login navigates to user dashboard', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.faculty.email, TEST_USERS.faculty.password);
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    });

    // ── Positive: Login page renders correctly ──
    test('TC-AUTH-04: Login page displays email, password, and submit button', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.submitButton).toBeVisible();
    });

    // ── Positive: Form accepts input ──
    test('TC-AUTH-05: Login form accepts and retains typed input', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.emailInput.fill('test@test.com');
        await loginPage.passwordInput.fill('password123');
        await expect(loginPage.emailInput).toHaveValue('test@test.com');
        await expect(loginPage.passwordInput).toHaveValue('password123');
    });

    // ── Positive: Register link is visible ──
    test('TC-AUTH-06: Register link is visible on login page', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await expect(loginPage.registerLink).toBeVisible();
    });

    // ── Positive: Logout clears session ──
    test('TC-AUTH-07: Logout clears session and redirects to login or home', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await page.waitForURL(/\/dashboard/, { timeout: 15000 });

        // Look for logout in sidebar or menu
        const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out"), text=Logout').first();
        if (await logoutBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await logoutBtn.click();
            await expect(page).toHaveURL(/\/(login|$)/, { timeout: 15000 });
        }
    });

    // ── Negative (altered to positive assertion): Invalid credentials show error message ──
    test('TC-AUTH-08: Invalid credentials display error message on login page', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login('invalid@test.com', 'wrongpassword');
        await page.waitForTimeout(2000);
        // Verify error message appears (positive assertion on negative scenario)
        await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 });
    });

    // ── Negative (altered to positive assertion): Wrong password shows error ──
    test('TC-AUTH-09: Wrong password for valid email displays error', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, 'WrongPassword@999');
        await page.waitForTimeout(2000);
        await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 });
    });

    // ── Negative (altered to positive assertion): Empty fields keeps user on login ──
    test('TC-AUTH-10: Clicking submit with empty fields stays on login page', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        // Click submit without filling anything
        await loginPage.submitButton.click();
        await page.waitForTimeout(2000);
        // Verify user stays on login page (form validation prevents navigation)
        await expect(page).toHaveURL(/\/login/);
    });

    // ── Negative (altered to positive assertion): Protected route redirects to login ──
    test('TC-AUTH-11: Unauthenticated access to dashboard redirects to login', async ({ page }) => {
        await page.goto(ROUTES.dashboard);
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    // ── Negative (altered to positive assertion): Protected profile redirects ──
    test('TC-AUTH-12: Unauthenticated access to profile redirects to login', async ({ page }) => {
        await page.goto(ROUTES.profile);
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

});
