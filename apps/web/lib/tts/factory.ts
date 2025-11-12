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
  const configuredProvider = process.env.DEFAULT_TTS_PROVIDER;

  // Validate provider if configured
  if (configuredProvider) {
    const validProviders: TTSProvider[] = ["openai", "elevenlabs"];
    if (!validProviders.includes(configuredProvider as TTSProvider)) {
      console.warn(
        `Invalid DEFAULT_TTS_PROVIDER "${configuredProvider}". ` +
        `Falling back to "openai". Valid options: ${validProviders.join(", ")}`
      );
      return createTTSAdapter("openai");
    }
    return createTTSAdapter(configuredProvider as TTSProvider);
  }

  // Default to OpenAI if not configured
  return createTTSAdapter("openai");
}
