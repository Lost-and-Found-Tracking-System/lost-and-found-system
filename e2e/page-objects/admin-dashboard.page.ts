import { Locator, Page } from '@playwright/test';

export class AdminDashboardPage {
    readonly page: Page;
    readonly heading: Locator;
    readonly statsCards: Locator;
    readonly activityFeed: Locator;
    readonly sidebar: Locator;
    readonly claimsLink: Locator;
    readonly rolesLink: Locator;
    readonly zonesLink: Locator;
    readonly aiConfigLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.locator('h1, h2').first();
        this.statsCards = page.locator('[class*="stat"], [class*="card"], [class*="metric"]');
        this.activityFeed = page.locator('[class*="activity"], [class*="feed"], [class*="recent"]').first();
        this.sidebar = page.locator('nav, [class*="sidebar"], [class*="Sidebar"]').first();
        this.claimsLink = page.locator('a[href="/admin/claims"]').first();
        this.rolesLink = page.locator('a[href="/admin/roles"]').first();
        this.zonesLink = page.locator('a[href="/admin/zones"]').first();
        this.aiConfigLink = page.locator('a[href="/admin/ai-config"]').first();
    }

    async goto() {
        await this.page.goto('/admin');
        await this.page.waitForLoadState('networkidle');
    }
}
