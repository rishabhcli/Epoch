import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildRSSFeed } from "@/lib/podcast";

/**
 * Public RSS feed endpoint
 * Returns all published public episodes
 */
export async function GET(request: NextRequest) {
  try {
    // Get or create the default show metadata (using upsert to prevent race conditions)
    // We use a fixed ID to ensure only one show record exists
    const SHOW_ID = "default-show";

    const show = await prisma.show.upsert({
      where: { id: SHOW_ID },
      update: {}, // Don't update if it exists
      create: {
        id: SHOW_ID,
        title: process.env.NEXT_PUBLIC_SITE_NAME || "Epoch Pod",
        description:
          "Personalized history podcasts delivered to your inbox. Explore any era, topic, or moment in time with AI-generated episodes.",
        ownerName: "Epoch Pod",
        ownerEmail: process.env.RESEND_FROM_EMAIL || "noreply@epoch.fm",
        language: "en-us",
        category: "History",
        explicit: false,
      },
    });

    // Get all published public episodes (userId is null)
    const episodes = await prisma.episode.findMany({
      where: {
        status: "PUBLISHED",
        userId: null,
        audioUrl: { not: null },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 50, // Limit to most recent 50 episodes
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const feedUrl = `${baseUrl}/api/rss`;

    const xml = buildRSSFeed({
      show,
      episodes,
      feedUrl,
      websiteUrl: baseUrl,
    });

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("RSS feed generation error:", error);

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<error>Failed to generate RSS feed</error>`,
      {
        status: 500,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      }
    );
  }
}
