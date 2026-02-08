import { Page, Locator } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly passwordToggle: Locator;
    readonly errorMessage: Locator;
    readonly registerLink: Locator;
    readonly forgotPasswordLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.locator('input[type="email"]');
        this.passwordInput = page.locator('input[type="password"]');
        this.submitButton = page.locator('button[type="submit"]');
        this.passwordToggle = page.locator('[data-testid="password-toggle"], button:has(svg)').first();
        this.errorMessage = page.locator('.text-red-400, [class*="error"]');
        this.registerLink = page.locator('a[href="/register"]');
        this.forgotPasswordLink = page.locator('a[href*="forgot"]');
    }

    async goto() {
        await this.page.goto('/login');
        await this.page.waitForLoadState('networkidle');
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }

    async togglePasswordVisibility() {
        await this.passwordToggle.click();
    }

    async getPasswordInputType() {
        return await this.passwordInput.getAttribute('type');
    }
}
