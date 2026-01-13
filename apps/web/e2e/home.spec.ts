import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the home page', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads
    await expect(page).toHaveTitle(/Epoch/i);
  });

  test('should have navigation elements', async ({ page }) => {
    await page.goto('/');

    // Look for common navigation elements
    const nav = page.locator('nav, header');
    await expect(nav.first()).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Page should still load properly
    await expect(page).toHaveTitle(/Epoch/i);
  });
});

test.describe('Episodes Page', () => {
  test('should display episodes listing', async ({ page }) => {
    await page.goto('/episodes');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should have a heading or main content area
    const main = page.locator('main, [role="main"]');
    await expect(main.first()).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');

    // Find and click a link to episodes (if exists)
    const episodesLink = page.getByRole('link', { name: /episodes/i });
    if (await episodesLink.count() > 0) {
      await episodesLink.first().click();
      await expect(page).toHaveURL(/episodes/);
    }
  });
});

test.describe('Accessibility', () => {
  test('home page should have proper heading structure', async ({ page }) => {
    await page.goto('/');

    // Should have at least one heading
    const headings = page.locator('h1, h2, h3');
    await expect(headings.first()).toBeVisible();
  });

  test('should have accessible links', async ({ page }) => {
    await page.goto('/');

    // All links should have accessible names
    const links = await page.locator('a[href]').all();
    for (const link of links.slice(0, 10)) { // Check first 10 links
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});
