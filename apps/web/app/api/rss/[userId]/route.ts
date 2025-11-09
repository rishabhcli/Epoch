import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildRSSFeed } from "@/lib/podcast";

/**
 * Private RSS feed endpoint
 * Returns episodes for a specific user (requires valid token)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return new NextResponse("Missing token parameter", { status: 401 });
    }

    // Verify user and token
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        feedToken: token,
      },
    });

    if (!user) {
      return new NextResponse("Invalid user or token", { status: 401 });
    }

    // Check if private feed is enabled
    const preferences = user.preferences as any;
    if (!preferences?.privateFeedEnabled) {
      return new NextResponse("Private feed not enabled for this user", {
        status: 403,
      });
    }

    // Get or create show metadata
    let show = await prisma.show.findFirst();

    if (!show) {
      show = await prisma.show.create({
        data: {
          title: `${process.env.NEXT_PUBLIC_SITE_NAME || "Epoch Pod"} - ${user.name || user.email}`,
          description:
            "Your personalized history podcast feed. Episodes tailored to your interests.",
          ownerName: "Epoch Pod",
          ownerEmail: process.env.RESEND_FROM_EMAIL || "noreply@epoch.fm",
          language: "en-us",
          category: "History",
          explicit: false,
        },
      });
    }

    // Get user's episodes
    const episodes = await prisma.episode.findMany({
      where: {
        userId: userId,
        status: {
          in: ["READY", "PUBLISHED"],
        },
        audioUrl: { not: null },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const feedUrl = `${baseUrl}/api/rss/${userId}?token=${token}`;

    // Customize show title for private feed
    const privateShow = {
      ...show,
      title: `${show.title} - ${user.name || user.email}`,
      description: `Personalized episodes for ${user.name || user.email}`,
    };

    const xml = buildRSSFeed({
      show: privateShow,
      episodes,
      feedUrl,
      websiteUrl: baseUrl,
    });

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "private, max-age=300, s-maxage=300", // Cache for 5 minutes (private)
      },
    });
  } catch (error) {
    console.error("Private RSS feed error:", error);

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<error>Failed to generate private RSS feed</error>`,
      {
        status: 500,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      }
    );
  }
}
