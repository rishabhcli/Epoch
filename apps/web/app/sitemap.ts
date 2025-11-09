import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Get all published public episodes
  const episodes = await prisma.episode.findMany({
    where: {
      status: "PUBLISHED",
      userId: null, // Only public episodes
      audioUrl: { not: null },
    },
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/episodes`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Episode pages
  const episodePages: MetadataRoute.Sitemap = episodes.map((episode) => ({
    url: `${baseUrl}/episodes/${episode.id}`,
    lastModified: episode.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...episodePages];
}
