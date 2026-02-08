import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';
import { TEST_USERS, TEST_CLAIM, ROUTES } from '../fixtures/test-data';

test.describe('Claims Flow E2E', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
        await page.waitForURL(/\/dashboard/);
    });

    test('claim page loads from item', async ({ page }) => {
        await page.goto(ROUTES.inventory);
        const foundFilter = page.locator('button:has-text("Found")').first();
        if (await foundFilter.isVisible()) {
            await foundFilter.click();
            await page.waitForTimeout(500);
        }
        const itemLink = page.locator('a[href*="/item/"]').first();
        if (await itemLink.isVisible()) {
            await itemLink.click();
            const claimButton = page.locator('a[href*="/claim/"], button:has-text("Claim")').first();
            if (await claimButton.isVisible()) {
                await claimButton.click();
                await expect(page).toHaveURL(/\/claim\//);
            }
        }
    });

    test('claim form displays proof textarea', async ({ page }) => {
        await page.goto(ROUTES.inventory);
        const itemLink = page.locator('a[href*="/item/"]').first();
        if (await itemLink.isVisible()) {
            await itemLink.click();
            const claimButton = page.locator('a[href*="/claim/"]').first();
            if (await claimButton.isVisible()) {
                await claimButton.click();
                const proofTextarea = page.locator('textarea').first();
                await expect(proofTextarea).toBeVisible();
            }
        }
    });

    test('ownership proof textarea accepts text', async ({ page }) => {
        await page.goto(ROUTES.inventory);
        const itemLink = page.locator('a[href*="/item/"]').first();
        if (await itemLink.isVisible()) {
            await itemLink.click();
            const claimButton = page.locator('a[href*="/claim/"]').first();
            if (await claimButton.isVisible()) {
                await claimButton.click();
                const proofTextarea = page.locator('textarea').first();
                await proofTextarea.fill(TEST_CLAIM.ownershipProof);
                await expect(proofTextarea).toHaveValue(TEST_CLAIM.ownershipProof);
            }
        }
    });

    test('my claims page loads', async ({ page }) => {
        await page.goto(ROUTES.myClaims);
        await expect(page).toHaveURL(/\/my-claims/);
    });

    test('my claims page displays title', async ({ page }) => {
        await page.goto(ROUTES.myClaims);
        await expect(page.locator('h1, h2').first()).toContainText(/Claim/i);
    });

    test('claims list or empty state displays', async ({ page }) => {
        await page.goto(ROUTES.myClaims);
        const claimsOrEmpty = page.locator('text=/No claims|Pending|Approved|Rejected/i');
        await expect(claimsOrEmpty.first()).toBeVisible();
    });



    test('expand claim to view details', async ({ page }) => {
        await page.goto(ROUTES.myClaims);
        const claimCard = page.locator('[class*="claim"], .bg-slate-900').first();
        if (await claimCard.isVisible()) {
            await claimCard.click();
            await page.waitForTimeout(500);
        }
    });

    test('[NEGATIVE] cannot submit claim without proof', async ({ page }) => {
        await page.goto(ROUTES.inventory);
        const itemLink = page.locator('a[href*="/item/"]').first();
        if (await itemLink.isVisible()) {
            await itemLink.click();
            const claimButton = page.locator('a[href*="/claim/"]').first();
            if (await claimButton.isVisible()) {
                await claimButton.click();
                await page.waitForURL(/\/claim\//);
                const submitBtn = page.locator('button[type="submit"], button:has-text("Submit")').first();
                await submitBtn.click();
                await expect(page).toHaveURL(/\/claim\//);
            }
        }
    });

    test('[NEGATIVE] short proof text rejected', async ({ page }) => {
        await page.goto(ROUTES.inventory);
        const itemLink = page.locator('a[href*="/item/"]').first();
        if (await itemLink.isVisible()) {
            await itemLink.click();
            const claimButton = page.locator('a[href*="/claim/"]').first();
            if (await claimButton.isVisible()) {
                await claimButton.click();
                const proofTextarea = page.locator('textarea').first();
                await proofTextarea.fill('Hi');
                const submitBtn = page.locator('button[type="submit"], button:has-text("Submit")').first();
                await submitBtn.click();
                await expect(page).toHaveURL(/\/claim\//);
            }
        }
    });
});
