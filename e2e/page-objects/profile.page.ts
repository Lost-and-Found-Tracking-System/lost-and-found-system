import { Locator, Page } from '@playwright/test';

export class ProfilePage {
    readonly page: Page;
    readonly heading: Locator;
    readonly fullNameInput: Locator;
    readonly emailDisplay: Locator;
    readonly phoneInput: Locator;
    readonly saveButton: Locator;
    readonly editButton: Locator;
    readonly changePasswordSection: Locator;
    readonly successMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.locator('h1, h2').first();
        this.fullNameInput = page.locator('input[name="fullName"], input[placeholder*="name" i]').first();
        this.emailDisplay = page.locator('text=/email/i').first();
        this.phoneInput = page.locator('input[name="phone"], input[type="tel"], input[placeholder*="phone" i]').first();
        this.saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first();
        this.editButton = page.locator('button:has-text("Edit")').first();
        this.changePasswordSection = page.locator('text=/Change Password|Update Password/i').first();
        this.successMessage = page.locator('[class*="success"], text=/success|updated/i').first();
    }

    async goto() {
        await this.page.goto('/profile');
        await this.page.waitForLoadState('networkidle');
    }
}
