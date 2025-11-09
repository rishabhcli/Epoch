import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/episodes", "/episodes/*"],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/auth/*",
          "/api/*",
          "/_next/*",
        ],
      },
      // Allow podcast crawlers to access RSS feeds
      {
        userAgent: [
          "Googlebot",
          "AppleBot",
          "Podcastindex",
          "PodcastAddict",
        ],
        allow: ["/api/rss", "/api/rss/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
