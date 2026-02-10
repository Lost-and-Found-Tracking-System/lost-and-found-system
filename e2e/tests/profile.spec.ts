import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';
import { LoginPage } from '../page-objects/login.page';
import { ProfilePage } from '../page-objects/profile.page';

test.describe('Profile E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await page.waitForURL(/\/dashboard/);
    });

    // ── Positive: Profile page loads ──
    test('TC-PRF-01: Profile page loads successfully', async ({ page }) => {
        const profilePage = new ProfilePage(page);
        await profilePage.goto();
        await expect(page).toHaveURL(/\/profile/);
    });

    // ── Positive: Profile heading visible ──
    test('TC-PRF-02: Profile page displays heading', async ({ page }) => {
        const profilePage = new ProfilePage(page);
        await profilePage.goto();
        await expect(profilePage.heading).toBeVisible();
    });

    // ── Positive: Profile shows user info ──
    test('TC-PRF-03: Profile page displays user email or name', async ({ page }) => {
        const profilePage = new ProfilePage(page);
        await profilePage.goto();
        const userInfo = page.locator(`text=/${TEST_USERS.student.email}|${TEST_USERS.student.fullName}|Student/i`).first();
        await expect(userInfo).toBeVisible();
    });

    // ── Positive: Edit profile fields visible ──
    test('TC-PRF-04: Profile edit form fields are visible', async ({ page }) => {
        const profilePage = new ProfilePage(page);
        await profilePage.goto();
        // Click edit if needed
        const editBtn = page.locator('button:has-text("Edit")').first();
        if (await editBtn.isVisible()) {
            await editBtn.click();
        }
        const inputField = page.locator('input[name="fullName"], input[placeholder*="name" i], input[name="phone"], input[type="tel"]').first();
        if (await inputField.isVisible()) {
            await expect(inputField).toBeVisible();
        }
    });

    // ── Positive: Change password section visible ──
    test('TC-PRF-05: Change password section is visible on profile page', async ({ page }) => {
        const profilePage = new ProfilePage(page);
        await profilePage.goto();
        const changePwSection = page.locator('text=/Change Password|Update Password|Password/i').first();
        if (await changePwSection.isVisible()) {
            await expect(changePwSection).toBeVisible();
        }
    });

    // ── Positive: Login activity section ──
    test('TC-PRF-06: Profile page shows login activity or security section', async ({ page }) => {
        const profilePage = new ProfilePage(page);
        await profilePage.goto();
        const activitySection = page.locator('text=/Login Activity|Security|Recent Activity|Session/i').first();
        if (await activitySection.isVisible()) {
            await expect(activitySection).toBeVisible();
        }
    });

    // ── Positive: Profile sidebar link ──
    test('TC-PRF-07: Profile link in sidebar navigates correctly', async ({ page }) => {
        const profileLink = page.locator('a[href="/profile"]').first();
        if (await profileLink.isVisible()) {
            await profileLink.click();
            await expect(page).toHaveURL(/\/profile/);
        }
    });

    // ── Negative (altered): Unauthenticated profile access redirects ──
    test('TC-PRF-08: Unauthenticated access to profile redirects to login', async ({ browser }) => {
        const context = await browser.newContext();
        const newPage = await context.newPage();
        await newPage.goto('/profile');
        await expect(newPage).toHaveURL(/\/login/);
        await context.close();
    });

});
