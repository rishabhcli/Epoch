import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateEpisode } from "@/lib/ai/episode-generator";
import { z } from "zod";
import { VoiceConfigSchema } from "@epoch/schema";

const GenerateRequestSchema = z.object({
  topic: z.string().min(1).max(500),
  era: z.string().optional(),
  targetDuration: z.number().min(300).max(3600).optional(),
  voiceConfig: VoiceConfigSchema.optional(),
  additionalContext: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = GenerateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { topic, era, targetDuration, voiceConfig, additionalContext } =
      validation.data;

    // Start episode generation (async process)
    const episode = await generateEpisode({
      topic,
      era,
      userId: session.user.id,
      targetDuration,
      voiceConfig,
      additionalContext,
    });

    return NextResponse.json({
      success: true,
      episodeId: episode.id,
      message: "Episode generation completed successfully",
    });
  } catch (error) {
    console.error("Generation API error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate episode",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
