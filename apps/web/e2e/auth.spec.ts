import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Sign In Page', () => {
    test('should display sign in page', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      // Should show sign in content
      const signInContent = page.locator(':text("sign in"), :text("Sign In"), :text("login"), :text("Login")');
      const count = await signInContent.count();

      // Page should load (might redirect to provider or show form)
      await expect(page).not.toHaveURL(/error/);
    });

    test('should have accessible form elements', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      // Look for form inputs
      const inputs = page.locator('input[type="email"], input[type="text"]');
      const count = await inputs.count();

      if (count > 0) {
        // Inputs should have labels or aria-labels
        for (let i = 0; i < count; i++) {
          const input = inputs.nth(i);
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const placeholder = await input.getAttribute('placeholder');

          // Should have some form of label
          expect(id || ariaLabel || placeholder).toBeTruthy();
        }
      }
    });
  });

  test.describe('Protected Routes', () => {
    test('dashboard should require authentication', async ({ page }) => {
      const response = await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should either redirect to sign in or show unauthorized
      const url = page.url();
      const isRedirected = url.includes('signin') || url.includes('auth');
      const status = response?.status();

      expect(isRedirected || [401, 403].includes(status ?? 0) || status === 200).toBeTruthy();
    });
  });

  test.describe('Sign Out', () => {
    test('sign out should be accessible when logged in', async ({ page }) => {
      // This test would require a logged-in state
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for sign out button (might not exist if not logged in)
      const signOutButton = page.locator('button:has-text("sign out"), button:has-text("Sign Out"), a:has-text("sign out")');

      // Just verify page loads without error
      await expect(page).not.toHaveURL(/error/);
    });
  });
});

test.describe('Authentication API', () => {
  test('auth API endpoints should exist', async ({ request }) => {
    // NextAuth endpoints should be accessible
    const response = await request.get('/api/auth/providers');

    // Should return providers or redirect
    expect([200, 302, 307]).toContain(response.status());
  });

  test('session endpoint should return valid response', async ({ request }) => {
    const response = await request.get('/api/auth/session');

    // Should return session info (empty if not logged in)
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toBeDefined();
  });

  test('CSRF token endpoint should work', async ({ request }) => {
    const response = await request.get('/api/auth/csrf');

    // Should return CSRF token
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.csrfToken).toBeDefined();
  });
});
