import { openai, DEFAULT_TTS_MODEL, DEFAULT_TTS_VOICE } from "../ai/openai";
import type {
  TTSAdapter,
  TTSOptions,
  AudioResult,
  Voice,
} from "./types";

/**
 * OpenAI TTS adapter
 * Docs: https://platform.openai.com/docs/guides/text-to-speech
 */
export class OpenAITTSAdapter implements TTSAdapter {
  async generateAudio(
    text: string,
    options: TTSOptions = {}
  ): Promise<AudioResult> {
    const {
      voice = DEFAULT_TTS_VOICE,
      model = DEFAULT_TTS_MODEL,
      speed = 1.0,
    } = options;

    try {
      const mp3 = await openai.audio.speech.create({
        model,
        voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
        input: text,
        speed,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());

      return {
        buffer,
        mimeType: "audio/mpeg",
        estimatedDuration: this.estimateDuration(text),
        provider: "openai",
      };
    } catch (error) {
      console.error("OpenAI TTS error:", error);
      throw new Error(
        `Failed to generate audio with OpenAI: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAvailableVoices(): Promise<Voice[]> {
    // OpenAI has 6 preset voices
    return [
      {
        id: "alloy",
        name: "Alloy",
        description: "Neutral and balanced",
      },
      {
        id: "echo",
        name: "Echo",
        description: "Male voice",
      },
      {
        id: "fable",
        name: "Fable",
        description: "Expressive British accent",
      },
      {
        id: "onyx",
        name: "Onyx",
        description: "Deep male voice",
      },
      {
        id: "nova",
        name: "Nova",
        description: "Female voice",
      },
      {
        id: "shimmer",
        name: "Shimmer",
        description: "Soft female voice",
      },
    ];
  }

  estimateDuration(text: string): number {
    // OpenAI TTS averages ~150 words per minute at 1.0 speed
    // This is roughly 2.5 words per second
    const wordCount = text.split(/\s+/).length;
    return Math.round(wordCount / 2.5);
  }
}
