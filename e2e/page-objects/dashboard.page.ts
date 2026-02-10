import { Locator, Page } from '@playwright/test';

export class DashboardPage {
    readonly page: Page;
    readonly heading: Locator;
    readonly statsSection: Locator;
    readonly sidebarNav: Locator;
    readonly reportButton: Locator;
    readonly inventoryLink: Locator;
    readonly claimsLink: Locator;
    readonly notificationsLink: Locator;
    readonly profileLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.locator('h1, h2').first();
        this.statsSection = page.locator('[class*="stat"], [class*="card"], [class*="metric"]').first();
        this.sidebarNav = page.locator('nav, [class*="sidebar"], [class*="Sidebar"]').first();
        this.reportButton = page.locator('a[href="/report"], button:has-text("Report")').first();
        this.inventoryLink = page.locator('a[href="/inventory"]').first();
        this.claimsLink = page.locator('a[href="/my-claims"]').first();
        this.notificationsLink = page.locator('a[href="/notifications"]').first();
        this.profileLink = page.locator('a[href="/profile"]').first();
    }

    async goto() {
        await this.page.goto('/dashboard');
        await this.page.waitForLoadState('networkidle');
    }
}
