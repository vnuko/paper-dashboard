import { test, expect } from '@playwright/test';

test.describe('Desktop Grid UI', () => {
  test.beforeEach(async ({ page }) => {
    // Visit the main page
    await page.goto('http://localhost:3000');
  });

  test('smoke test - grid renders seeded services', async ({ page }) => {
    // Wait for the grid to load
    await page.waitForSelector('.desktop-grid', { state: 'visible' });

    // Verify at least one service icon is present
    const serviceIcons = await page.locator('.desktop-grid li a').count();
    expect(serviceIcons).toBeGreaterThan(0);

    // Verify that the services are visible
    const servicesVisible = await page.isVisible('.desktop-grid');
    expect(servicesVisible).toBeTruthy();

    // Check for any service title in page as evidence of seeding
    const services = await page.$$(
      '.desktop-grid .desktop-grid__label span:first-child'
    );
    expect(services.length).toBeGreaterThan(0);
  });

  test('clicking a service icon opens correct URL in new tab', async ({
    page,
    context,
  }) => {
    // Wait for the page to load
    await page.waitForLoadState();

    // Listen for the popup event (new tab)
    const pagePromise = context.waitForEvent('page');

    // Click one of the icons (we'll use the first one)
    const firstIconLink = page.locator('.desktop-grid li a').first();
    await firstIconLink.click();

    // Wait for the new page to open
    const newPage = await pagePromise;

    // Verify the new page opened with a URL different from the main page
    const newPageUrl = newPage.url();
    const currentPageUrl = page.url();

    // Since we're mocking service links to external URLs, they should be different
    expect(newPageUrl).not.toBe(currentPageUrl);
  });
});
