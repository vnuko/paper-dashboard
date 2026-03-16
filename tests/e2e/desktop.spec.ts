import { test, expect } from '@playwright/test';

test.describe('Desktop Grid UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('smoke test - grid renders seeded links', async ({ page }) => {
    await page.waitForSelector('.desktop-grid', { state: 'visible' });

    const linkIcons = await page.locator('.desktop-grid li a').count();
    expect(linkIcons).toBeGreaterThan(0);

    const linksVisible = await page.isVisible('.desktop-grid');
    expect(linksVisible).toBeTruthy();

    const links = await page.$$(
      '.desktop-grid .desktop-grid__label span:first-child'
    );
    expect(links.length).toBeGreaterThan(0);
  });

  test('clicking a link icon opens correct URL in new tab', async ({
    page,
    context,
  }) => {
    await page.waitForLoadState();

    const pagePromise = context.waitForEvent('page');

    const firstIconLink = page.locator('.desktop-grid li a').first();
    await firstIconLink.click();

    const newPage = await pagePromise;

    const newPageUrl = newPage.url();
    const currentPageUrl = page.url();

    expect(newPageUrl).not.toBe(currentPageUrl);
  });
});
