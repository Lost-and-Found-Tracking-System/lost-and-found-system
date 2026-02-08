import { Page, Locator } from '@playwright/test';

export class ReportItemPage {
    readonly page: Page;
    readonly progressSteps: Locator;
    readonly lostButton: Locator;
    readonly foundButton: Locator;
    readonly categoryButtons: Locator;
    readonly descriptionInput: Locator;
    readonly colorInput: Locator;
    readonly materialInput: Locator;
    readonly sizeSelect: Locator;
    readonly nextButton: Locator;
    readonly backButton: Locator;
    readonly submitButton: Locator;
    readonly anonymousCheckbox: Locator;
    readonly datePicker: Locator;
    readonly zoneSelect: Locator;
    readonly trackingId: Locator;

    constructor(page: Page) {
        this.page = page;
        this.progressSteps = page.locator('[class*="step"], .flex.items-center.gap');
        this.lostButton = page.locator('button:has-text("Lost"), [data-type="lost"]');
        this.foundButton = page.locator('button:has-text("Found"), [data-type="found"]');
        this.categoryButtons = page.locator('.grid button, [data-category]');
        this.descriptionInput = page.locator('textarea[name="description"], textarea').first();
        this.colorInput = page.locator('input[name="color"], input[placeholder*="color" i]');
        this.materialInput = page.locator('input[name="material"], input[placeholder*="material" i]');
        this.sizeSelect = page.locator('select[name="size"], select');
        this.nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")');
        this.backButton = page.locator('button:has-text("Back"), button:has-text("Previous")');
        this.submitButton = page.locator('button:has-text("Submit"), button[type="submit"]');
        this.anonymousCheckbox = page.locator('input[type="checkbox"][name*="anonymous"], input[type="checkbox"]').first();
        this.datePicker = page.locator('input[type="date"], input[type="datetime-local"]');
        this.zoneSelect = page.locator('select[name="zone"], [data-zone]');
        this.trackingId = page.locator('code, [class*="tracking"]');
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
        await this.page.locator(`button:has-text("${category}")`).click();
    }

    async fillDescription(description: string) {
        await this.descriptionInput.fill(description);
    }

    async fillItemDetails(data: { color?: string; material?: string; size?: string }) {
        if (data.color) await this.colorInput.fill(data.color);
        if (data.material) await this.materialInput.fill(data.material);
        if (data.size) await this.sizeSelect.selectOption(data.size);
    }

    async goToNextStep() {
        await this.nextButton.click();
    }

    async goToPreviousStep() {
        await this.backButton.click();
    }

    async submit() {
        await this.submitButton.click();
    }

    async toggleAnonymous() {
        await this.anonymousCheckbox.click();
    }

    async getTrackingId() {
        return await this.trackingId.textContent();
    }
}
