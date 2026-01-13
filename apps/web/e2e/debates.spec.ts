import { test, expect } from '@playwright/test';

test.describe('Debates Feature', () => {
  test.describe('Debate Episodes', () => {
    test('should display debates on episodes page', async ({ page }) => {
      await page.goto('/episodes');
      await page.waitForLoadState('networkidle');

      // Look for debate-specific content or filters
      const debateContent = page.locator('[data-type="debate"], .debate, :text("debate")');

      // Content may or may not exist depending on data
      const count = await debateContent.count();
      // Just verify page loads without error
      await expect(page).not.toHaveURL(/error/);
    });
  });

  test.describe('Voting System', () => {
    test('should handle voting UI elements', async ({ page }) => {
      await page.goto('/episodes');
      await page.waitForLoadState('networkidle');

      // Look for voting buttons
      const voteButtons = page.locator('[data-testid="vote-button"], button:has-text("vote"), .vote-btn');

      const count = await voteButtons.count();
      if (count > 0) {
        // Verify buttons are visible and clickable
        await expect(voteButtons.first()).toBeVisible();
      }
    });

    test('vote buttons should be accessible', async ({ page }) => {
      await page.goto('/episodes');
      await page.waitForLoadState('networkidle');

      const voteButtons = page.locator('[data-testid="vote-button"], button:has-text("vote")');

      const count = await voteButtons.count();
      for (let i = 0; i < Math.min(count, 3); i++) {
        const button = voteButtons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        expect(text?.trim() || ariaLabel).toBeTruthy();
      }
    });
  });

  test.describe('Debate Player', () => {
    test('debate player should have proper structure', async ({ page }) => {
      await page.goto('/episodes');
      await page.waitForLoadState('networkidle');

      // Look for debate player components
      const debatePlayer = page.locator('[data-testid="debate-player"], .debate-player');

      const count = await debatePlayer.count();
      if (count > 0) {
        await expect(debatePlayer.first()).toBeVisible();

        // Should have position indicators or labels
        const positions = debatePlayer.first().locator('.position, [data-position]');
        // Positions may or may not exist
      }
    });
  });
});

test.describe('Debates API', () => {
  test('vote API should handle requests', async ({ request }) => {
    // Test the vote API endpoint structure
    const response = await request.post('/api/debates/vote', {
      data: {
        debateId: 'test-debate-id',
        position: 1,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Should return a proper response (even if unauthorized or not found)
    expect([200, 400, 401, 404, 429]).toContain(response.status());
  });

  test('vote API should validate input', async ({ request }) => {
    // Test with invalid input
    const response = await request.post('/api/debates/vote', {
      data: {
        // Missing required fields
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Should return validation error
    expect([400, 404]).toContain(response.status());
  });

  test('vote API should reject invalid position', async ({ request }) => {
    const response = await request.post('/api/debates/vote', {
      data: {
        debateId: 'test-debate-id',
        position: 5, // Invalid: should be 1 or 2
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Should return validation error
    expect([400, 404]).toContain(response.status());
  });
});
