import { Page, Locator } from '@playwright/test';

export class RegisterPage {
    readonly page: Page;
    readonly fullNameInput: Locator;
    readonly emailInput: Locator;
    readonly phoneInput: Locator;
    readonly affiliationSelect: Locator;
    readonly passwordInput: Locator;
    readonly confirmPasswordInput: Locator;
    readonly submitButton: Locator;
    readonly errorMessage: Locator;
    readonly loginLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.fullNameInput = page.locator('input[name="fullName"], input[placeholder*="name" i]');
        this.emailInput = page.locator('input[type="email"]');
        this.phoneInput = page.locator('input[name="phone"], input[type="tel"]');
        this.affiliationSelect = page.locator('select[name="affiliation"], select').first();
        this.passwordInput = page.locator('input[name="password"], input[type="password"]').first();
        this.confirmPasswordInput = page.locator('input[name="confirmPassword"], input[type="password"]').nth(1);
        this.submitButton = page.locator('button[type="submit"]');
        this.errorMessage = page.locator('.text-red-400, [class*="error"]');
        this.loginLink = page.locator('a[href="/login"]');
    }

    async goto() {
        await this.page.goto('/register');
        await this.page.waitForLoadState('networkidle');
    }

    async register(data: {
        fullName: string;
        email: string;
        phone?: string;
        affiliation?: string;
        password: string;
        confirmPassword: string;
    }) {
        await this.fullNameInput.fill(data.fullName);
        await this.emailInput.fill(data.email);
        if (data.phone) await this.phoneInput.fill(data.phone);
        if (data.affiliation) await this.affiliationSelect.selectOption(data.affiliation);
        await this.passwordInput.fill(data.password);
        await this.confirmPasswordInput.fill(data.confirmPassword);
        await this.submitButton.click();
    }
}
