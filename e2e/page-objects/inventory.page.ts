import { Locator, Page } from '@playwright/test';

export class InventoryPage {
    readonly page: Page;
    readonly heading: Locator;
    readonly searchInput: Locator;
    readonly itemCards: Locator;
    readonly filterButtons: Locator;
    readonly categoryFilter: Locator;
    readonly lostFilter: Locator;
    readonly foundFilter: Locator;
    readonly allFilter: Locator;
    readonly emptyState: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.locator('h1, h2').first();
        this.searchInput = page.locator('input[type="search"], input[type="text"][placeholder*="search" i], input[placeholder*="Search" i]').first();
        this.itemCards = page.locator('[class*="card"], [class*="item"], [class*="Card"]');
        this.filterButtons = page.locator('button[class*="filter"], button[class*="tab"]');
        this.categoryFilter = page.locator('select, button:has-text("Category")').first();
        this.lostFilter = page.locator('button:has-text("Lost")').first();
        this.foundFilter = page.locator('button:has-text("Found")').first();
        this.allFilter = page.locator('button:has-text("All")').first();
        this.emptyState = page.locator('text=/No items|No results|Empty/i');
    }

    async goto() {
        await this.page.goto('/inventory');
        await this.page.waitForLoadState('networkidle');
    }
}
