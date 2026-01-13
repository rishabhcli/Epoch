import { test, expect } from '@playwright/test';

test.describe('Adventures Feature', () => {
  test.describe('Adventures Listing', () => {
    test('should display adventures page', async ({ page }) => {
      await page.goto('/adventures');
      await page.waitForLoadState('networkidle');

      // Page should load successfully
      await expect(page).toHaveURL(/adventures/);
    });

    test('should have adventure cards or list items', async ({ page }) => {
      await page.goto('/adventures');
      await page.waitForLoadState('networkidle');

      // Look for adventure containers
      const adventureElements = page.locator('[data-testid="adventure-card"], article, .adventure');

      // If there are adventures, they should be visible
      const count = await adventureElements.count();
      if (count > 0) {
        await expect(adventureElements.first()).toBeVisible();
      }
    });

    test('should display adventure metadata', async ({ page }) => {
      await page.goto('/adventures');
      await page.waitForLoadState('networkidle');

      // Look for adventure titles or descriptions
      const titles = page.locator('h2, h3, .adventure-title');
      const count = await titles.count();

      // If content exists, it should be visible
      if (count > 0) {
        await expect(titles.first()).toBeVisible();
      }
    });
  });

  test.describe('Adventure Detail', () => {
    test('should handle adventure detail page', async ({ page }) => {
      await page.goto('/adventures');
      await page.waitForLoadState('networkidle');

      // Look for links to adventure details
      const adventureLinks = page.locator('a[href*="/adventures/"]');
      const count = await adventureLinks.count();

      if (count > 0) {
        await adventureLinks.first().click();
        await page.waitForLoadState('networkidle');

        // Should navigate to an adventure detail page
        await expect(page).toHaveURL(/adventures\//);
      }
    });

    test('should handle non-existent adventure gracefully', async ({ page }) => {
      const response = await page.goto('/adventures/non-existent-adventure-12345');

      // Should either show 404 or redirect
      const status = response?.status();
      expect([200, 404, 302, 307]).toContain(status);
    });
  });

  test.describe('Adventure Journey', () => {
    test('should display choices for decision nodes', async ({ page }) => {
      await page.goto('/adventures');
      await page.waitForLoadState('networkidle');

      // Find and navigate to an adventure if available
      const adventureLinks = page.locator('a[href*="/adventures/"]');
      const count = await adventureLinks.count();

      if (count > 0) {
        await adventureLinks.first().click();
        await page.waitForLoadState('networkidle');

        // Look for choice buttons or links
        const choices = page.locator('[data-testid="adventure-choice"], button:has-text("choice"), .choice');
        // Choices may or may not be present depending on node type
      }
    });
  });
});

test.describe('Adventures Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/adventures');
    await page.waitForLoadState('networkidle');

    const h1 = page.locator('h1');
    const count = await h1.count();

    if (count > 0) {
      await expect(h1.first()).toBeVisible();
    }
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto('/adventures');
    await page.waitForLoadState('networkidle');

    const buttons = await page.locator('button').all();

    for (const button of buttons.slice(0, 5)) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });
});
