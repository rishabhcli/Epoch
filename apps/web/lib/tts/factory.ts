import type { TTSAdapter, TTSProvider } from "./types";
import { OpenAITTSAdapter } from "./openai-adapter";
import { ElevenLabsTTSAdapter } from "./elevenlabs-adapter";

/**
 * Factory for creating TTS adapters
 */
export function createTTSAdapter(provider: TTSProvider): TTSAdapter {
  switch (provider) {
    case "openai":
      return new OpenAITTSAdapter();
    case "elevenlabs":
      return new ElevenLabsTTSAdapter();
    default:
      throw new Error(`Unknown TTS provider: ${provider}`);
  }
}

/**
 * Get the default TTS adapter based on environment configuration
 */
export function getDefaultTTSAdapter(): TTSAdapter {
  const provider =
    (process.env.DEFAULT_TTS_PROVIDER as TTSProvider) || "openai";
  return createTTSAdapter(provider);
}
