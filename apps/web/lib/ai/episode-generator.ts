import { prisma } from "../db";
import { generateOutline, type OutlineGenerationParams } from "./outline-generator";
import { generateScript } from "./script-generator";
import { generateAudio } from "./audio-generator";
import { uploadAudio } from "../storage";
import type { VoiceConfig } from "@epoch/schema";
import { nanoid } from "nanoid";

export interface EpisodeGenerationParams {
  topic: string;
  era?: string;
  userId?: string; // If null, it's a public episode
  targetDuration?: number;
  voiceConfig?: VoiceConfig;
  additionalContext?: string;
}

export interface EpisodeGenerationProgress {
  status:
    | "generating_outline"
    | "generating_script"
    | "generating_audio"
    | "uploading"
    | "completed"
    | "failed";
  message: string;
  progress: number; // 0-100
}

/**
 * Main episode generation orchestrator
 * Handles the full pipeline: outline → script → audio → storage → database
 */
export async function generateEpisode(
  params: EpisodeGenerationParams,
  onProgress?: (progress: EpisodeGenerationProgress) => void
) {
  const {
    topic,
    era,
    userId,
    targetDuration = 1200,
    voiceConfig = {
      provider: "openai",
      voiceId: "alloy",
      model: "tts-1-hd",
      speed: 1.0,
    },
    additionalContext,
  } = params;

  // Create episode record in database
  const episode = await prisma.episode.create({
    data: {
      topic,
      era,
      userId,
      status: "GENERATING_OUTLINE",
      guid: nanoid(),
    },
  });

  try {
    // Step 1: Generate outline
    onProgress?.({
      status: "generating_outline",
      message: "Generating episode outline...",
      progress: 10,
    });

    await prisma.episode.update({
      where: { id: episode.id },
      data: { status: "GENERATING_OUTLINE" },
    });

    const outlineParams: OutlineGenerationParams = {
      topic,
      era,
      targetDuration,
      additionalContext,
    };

    const outline = await generateOutline(outlineParams);

    await prisma.episode.update({
      where: { id: episode.id },
      data: {
        title: outline.title,
        subtitle: outline.subtitle,
        outline: outline as any, // JSON
      },
    });

    // Step 2: Generate script
    onProgress?.({
      status: "generating_script",
      message: "Writing podcast script...",
      progress: 35,
    });

    await prisma.episode.update({
      where: { id: episode.id },
      data: { status: "GENERATING_SCRIPT" },
    });

    const script = await generateScript({ outline });

    await prisma.episode.update({
      where: { id: episode.id },
      data: {
        script: script as any, // JSON
        transcript: script.transcript,
        sources: script.allCitations as any, // JSON
      },
    });

    // Step 3: Generate audio
    onProgress?.({
      status: "generating_audio",
      message: "Generating audio narration...",
      progress: 60,
    });

    await prisma.episode.update({
      where: { id: episode.id },
      data: { status: "GENERATING_AUDIO" },
    });

    const audioResult = await generateAudio({
      script,
      ttsProvider: voiceConfig.provider,
      ttsOptions: {
        voice: voiceConfig.voiceId,
        model: voiceConfig.model,
        speed: voiceConfig.speed,
      },
    });

    // Step 4: Upload to storage
    onProgress?.({
      status: "uploading",
      message: "Uploading audio file...",
      progress: 85,
    });

    await prisma.episode.update({
      where: { id: episode.id },
      data: { status: "PROCESSING" },
    });

    const uploadResult = await uploadAudio(audioResult.buffer, {
      filename: `${episode.guid}.mp3`,
      contentType: audioResult.mimeType,
    });

    // Step 5: Update episode with final data
    const updatedEpisode = await prisma.episode.update({
      where: { id: episode.id },
      data: {
        audioUrl: uploadResult.url,
        audioBytes: BigInt(uploadResult.bytes),
        mimeType: uploadResult.contentType,
        duration: audioResult.estimatedDuration,
        status: "READY",
        publishedAt: new Date(),
      },
    });

    onProgress?.({
      status: "completed",
      message: "Episode generation complete!",
      progress: 100,
    });

    return updatedEpisode;
  } catch (error) {
    console.error("Episode generation failed:", error);

    await prisma.episode.update({
      where: { id: episode.id },
      data: {
        status: "FAILED",
        errorMsg: error instanceof Error ? error.message : "Unknown error",
      },
    });

    onProgress?.({
      status: "failed",
      message: error instanceof Error ? error.message : "Generation failed",
      progress: 0,
    });

    throw error;
  }
}
