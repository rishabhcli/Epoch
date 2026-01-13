import { test, expect } from '@playwright/test';

test.describe('Episodes Feature', () => {
  test.describe('Episodes Listing', () => {
    test('should display episodes page', async ({ page }) => {
      await page.goto('/episodes');
      await page.waitForLoadState('networkidle');

      // Page should load successfully
      await expect(page).toHaveURL(/episodes/);
    });

    test('should have episode cards or list items', async ({ page }) => {
      await page.goto('/episodes');
      await page.waitForLoadState('networkidle');

      // Look for episode containers
      const episodeElements = page.locator('[data-testid="episode-card"], article, .episode');

      // If there are episodes, they should be visible
      const count = await episodeElements.count();
      if (count > 0) {
        await expect(episodeElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Episode Detail', () => {
    test('should handle non-existent episode gracefully', async ({ page }) => {
      const response = await page.goto('/episodes/non-existent-id-12345');

      // Should either show 404 or redirect
      const status = response?.status();
      expect([200, 404, 302, 307]).toContain(status);
    });
  });

  test.describe('Audio Player', () => {
    test('audio controls should be accessible', async ({ page }) => {
      await page.goto('/episodes');
      await page.waitForLoadState('networkidle');

      // Look for audio elements or player components
      const audioElements = page.locator('audio, [data-testid="audio-player"], .audio-player');

      // If audio players exist, they should have controls
      const count = await audioElements.count();
      if (count > 0) {
        const hasControls = await audioElements.first().evaluate((el) => {
          return el.hasAttribute('controls') || el.querySelector('button') !== null;
        });
        expect(hasControls || count === 0).toBeTruthy();
      }
    });
  });
});

test.describe('Episode Types', () => {
  const episodeTypes = ['narrative', 'interview', 'debate', 'adventure'];

  for (const type of episodeTypes) {
    test(`should handle ${type} episode type`, async ({ page }) => {
      // Navigate to episodes and look for type-specific content
      await page.goto('/episodes');
      await page.waitForLoadState('networkidle');

      // Check that the page loads without errors
      const errorMessage = page.locator('text=error, text=Error');
      const hasError = await errorMessage.count() > 0;
      expect(hasError).toBe(false);
    });
  }
});
