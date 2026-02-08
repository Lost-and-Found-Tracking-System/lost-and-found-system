import { Page, Locator } from '@playwright/test';

export class InventoryPage {
    readonly page: Page;
    readonly searchInput: Locator;
    readonly gridViewButton: Locator;
    readonly listViewButton: Locator;
    readonly itemCards: Locator;
    readonly lostFilter: Locator;
    readonly foundFilter: Locator;
    readonly categoryFilter: Locator;
    readonly clearFiltersButton: Locator;
    readonly nextPageButton: Locator;
    readonly prevPageButton: Locator;
    readonly resultsCount: Locator;
    readonly emptyState: Locator;

    constructor(page: Page) {
        this.page = page;
        this.searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
        this.gridViewButton = page.locator('button:has(svg[class*="grid"]), button[data-view="grid"]');
        this.listViewButton = page.locator('button:has(svg[class*="list"]), button[data-view="list"]');
        this.itemCards = page.locator('.grid > div, [class*="item-card"]');
        this.lostFilter = page.locator('button:has-text("Lost")');
        this.foundFilter = page.locator('button:has-text("Found")');
        this.categoryFilter = page.locator('select[name="category"], [data-filter="category"]');
        this.clearFiltersButton = page.locator('button:has-text("Clear"), button:has-text("Reset")');
        this.nextPageButton = page.locator('button:has-text("Next"), button[aria-label*="next"]');
        this.prevPageButton = page.locator('button:has-text("Previous"), button[aria-label*="prev"]');
        this.resultsCount = page.locator('text=/Showing \\d+ of \\d+/');
        this.emptyState = page.locator('text=No items found, text=No results');
    }

    async goto() {
        await this.page.goto('/inventory');
        await this.page.waitForLoadState('networkidle');
    }

    async search(query: string) {
        await this.searchInput.fill(query);
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(500);
    }

    async switchToGridView() {
        await this.gridViewButton.click();
    }

    async switchToListView() {
        await this.listViewButton.click();
    }

    async filterByLost() {
        await this.lostFilter.click();
    }

    async filterByFound() {
        await this.foundFilter.click();
    }

    async clearFilters() {
        await this.clearFiltersButton.click();
    }

    async goToNextPage() {
        await this.nextPageButton.click();
    }

    async goToPrevPage() {
        await this.prevPageButton.click();
    }

    async getItemCount() {
        return await this.itemCards.count();
    }

    async clickFirstItem() {
        await this.itemCards.first().click();
    }
}
