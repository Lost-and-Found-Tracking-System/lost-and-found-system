import { Page, Locator } from '@playwright/test';

export class DashboardPage {
    readonly page: Page;
    readonly welcomeMessage: Locator;
    readonly statsCards: Locator;
    readonly myItemsSection: Locator;
    readonly myClaimsSection: Locator;
    readonly reportItemLink: Locator;
    readonly browseItemsLink: Locator;
    readonly sidebar: Locator;

    constructor(page: Page) {
        this.page = page;
        this.welcomeMessage = page.locator('h1:has-text("Dashboard"), p:has-text("Welcome")');
        this.statsCards = page.locator('.grid .bg-slate-900, [class*="stat"]');
        this.myItemsSection = page.locator('text=My Items, text=Your Items').first();
        this.myClaimsSection = page.locator('text=My Claims, text=Your Claims').first();
        this.reportItemLink = page.locator('a[href="/report"]');
        this.browseItemsLink = page.locator('a[href="/inventory"]');
        this.sidebar = page.locator('nav, aside').first();
    }

    async goto() {
        await this.page.goto('/dashboard');
        await this.page.waitForLoadState('networkidle');
    }

    async getStatsCount() {
        return await this.statsCards.count();
    }

    async clickReportItem() {
        await this.reportItemLink.click();
    }

    async clickBrowseItems() {
        await this.browseItemsLink.click();
    }

    async getWelcomeText() {
        return await this.welcomeMessage.textContent();
    }
}
