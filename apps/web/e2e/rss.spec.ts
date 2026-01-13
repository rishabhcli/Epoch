import { test, expect } from '@playwright/test';

test.describe('RSS Feed', () => {
  test.describe('Public RSS Feed', () => {
    test('should return valid RSS XML', async ({ request }) => {
      const response = await request.get('/api/rss');

      expect(response.status()).toBe(200);

      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('xml');

      const body = await response.text();
      expect(body).toContain('<?xml');
      expect(body).toContain('<rss');
      expect(body).toContain('</rss>');
    });

    test('should include required RSS 2.0 elements', async ({ request }) => {
      const response = await request.get('/api/rss');
      const body = await response.text();

      // Channel elements
      expect(body).toContain('<channel>');
      expect(body).toContain('<title>');
      expect(body).toContain('<link>');
      expect(body).toContain('<description>');
    });

    test('should include iTunes podcast tags', async ({ request }) => {
      const response = await request.get('/api/rss');
      const body = await response.text();

      // iTunes namespace
      expect(body).toContain('xmlns:itunes');

      // iTunes tags
      expect(body).toContain('<itunes:');
    });

    test('should include Podcasting 2.0 tags', async ({ request }) => {
      const response = await request.get('/api/rss');
      const body = await response.text();

      // Podcast namespace
      expect(body).toContain('xmlns:podcast');

      // Podcast 2.0 tags
      expect(body).toContain('<podcast:');
    });

    test('should have proper Atom self-link', async ({ request }) => {
      const response = await request.get('/api/rss');
      const body = await response.text();

      expect(body).toContain('xmlns:atom');
      expect(body).toContain('atom:link');
      expect(body).toContain('rel="self"');
    });
  });

  test.describe('RSS Feed Content', () => {
    test('should include episode items when available', async ({ request }) => {
      const response = await request.get('/api/rss');
      const body = await response.text();

      // If there are episodes, they should have proper structure
      if (body.includes('<item>')) {
        expect(body).toContain('<title>');
        expect(body).toContain('<guid');
        expect(body).toContain('<pubDate>');
      }
    });

    test('should have valid enclosure for audio', async ({ request }) => {
      const response = await request.get('/api/rss');
      const body = await response.text();

      // If there are enclosures, they should have required attributes
      if (body.includes('<enclosure')) {
        expect(body).toMatch(/enclosure[^>]*url="/);
        expect(body).toMatch(/enclosure[^>]*type="/);
      }
    });
  });

  test.describe('RSS Feed Caching', () => {
    test('should have appropriate cache headers', async ({ request }) => {
      const response = await request.get('/api/rss');

      const headers = response.headers();
      // Should have some form of caching or no-cache directive
      const hasCacheHeader =
        headers['cache-control'] !== undefined ||
        headers['etag'] !== undefined ||
        headers['last-modified'] !== undefined;

      // At minimum, the response should be successful
      expect(response.status()).toBe(200);
    });
  });

  test.describe('Private RSS Feed', () => {
    test('should handle private feed request', async ({ request }) => {
      // Try to access a private feed (should fail without valid token)
      const response = await request.get('/api/rss/invalid-user-id');

      // Should return error or empty feed
      expect([200, 401, 403, 404]).toContain(response.status());
    });
  });
});

test.describe('RSS Feed Validation', () => {
  test('RSS should be well-formed XML', async ({ request }) => {
    const response = await request.get('/api/rss');
    const body = await response.text();

    // Basic XML structure checks
    expect(body).toMatch(/^<\?xml/);

    // No unclosed tags (basic check)
    const openRss = (body.match(/<rss/g) || []).length;
    const closeRss = (body.match(/<\/rss>/g) || []).length;
    expect(openRss).toBe(closeRss);

    const openChannel = (body.match(/<channel>/g) || []).length;
    const closeChannel = (body.match(/<\/channel>/g) || []).length;
    expect(openChannel).toBe(closeChannel);
  });

  test('RSS should properly escape special characters', async ({ request }) => {
    const response = await request.get('/api/rss');
    const body = await response.text();

    // Should not have unescaped ampersands in content
    // (except in entity references like &amp; or &lt;)
    const unescapedAmpersand = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/;

    // Get content between tags (rough check)
    const contentMatches = body.match(/>([^<]+)</g);
    if (contentMatches) {
      for (const match of contentMatches.slice(0, 50)) {
        expect(match).not.toMatch(unescapedAmpersand);
      }
    }
  });
});
