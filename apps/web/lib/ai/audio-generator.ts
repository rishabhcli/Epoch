import type { Script } from "@epoch/schema";
import type { TTSAdapter, AudioResult, TTSOptions } from "../tts/types";
import { getDefaultTTSAdapter, createTTSAdapter } from "../tts/factory";

export interface AudioGenerationParams {
  script: Script;
  ttsProvider?: "openai" | "elevenlabs";
  ttsOptions?: TTSOptions;
}

/**
 * Generate audio from a script using the specified TTS provider
 */
export async function generateAudio(
  params: AudioGenerationParams
): Promise<AudioResult> {
  const { script, ttsProvider, ttsOptions } = params;

  // Get the appropriate TTS adapter
  const adapter: TTSAdapter = ttsProvider
    ? createTTSAdapter(ttsProvider)
    : getDefaultTTSAdapter();

  // Use the clean transcript for TTS (no stage directions)
  const text = script.transcript;

  if (!text || text.length === 0) {
    throw new Error("Script transcript is empty");
  }

  try {
    const result = await adapter.generateAudio(text, ttsOptions);
    return result;
  } catch (error) {
    console.error("Audio generation error:", error);
    throw new Error(
      `Failed to generate audio: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Estimate audio file size based on duration and bitrate
 * @param durationSeconds Duration in seconds
 * @param bitrateKbps Bitrate in kbps (default: 128 for MP3)
 * @returns Estimated file size in bytes
 */
export function estimateAudioFileSize(
  durationSeconds: number,
  bitrateKbps: number = 128
): number {
  // File size (bytes) = (bitrate in kbps * 1000 / 8) * duration in seconds
  return Math.round((bitrateKbps * 1000 * durationSeconds) / 8);
}
