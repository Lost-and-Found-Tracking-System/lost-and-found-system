import { Locator, Page } from '@playwright/test';

export class ReportItemPage {
    readonly page: Page;
    readonly lostButton: Locator;
    readonly foundButton: Locator;
    readonly nextButton: Locator;
    readonly prevButton: Locator;
    readonly submitButton: Locator;
    readonly descriptionInput: Locator;
    readonly anonymousCheckbox: Locator;

    constructor(page: Page) {
        this.page = page;
        this.lostButton = page.locator('button:has-text("Lost"), [class*="lost" i]').first();
        this.foundButton = page.locator('button:has-text("Found"), [class*="found" i]').first();
        this.nextButton = page.locator('button:has-text("Next")').first();
        this.prevButton = page.locator('button:has-text("Back"), button:has-text("Previous")').first();
        this.submitButton = page.locator('button:has-text("Submit")').first();
        this.descriptionInput = page.locator('textarea').first();
        this.anonymousCheckbox = page.locator('input[type="checkbox"]').first();
    }

    async goto() {
        await this.page.goto('/report');
        await this.page.waitForLoadState('networkidle');
    }

    async selectType(type: 'lost' | 'found') {
        if (type === 'lost') {
            await this.lostButton.click();
        } else {
            await this.foundButton.click();
        }
    }

    async selectCategory(category: string) {
        const categoryBtn = this.page.locator(`button:has-text("${category}")`).first();
        await categoryBtn.click();
    }

    async goToNextStep() {
        await this.nextButton.click();
    }

    async goToPreviousStep() {
        await this.prevButton.click();
    }
}
