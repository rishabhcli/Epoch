import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Model Configuration
 * Using latest stable models for optimal performance
 */

// For content generation (outlines, scripts, structured outputs)
export const DEFAULT_MODEL = "gpt-4-turbo-preview";

// For Text-to-Speech
export const DEFAULT_TTS_MODEL = "tts-1-hd";

// Default voice (can be overridden per use case)
export const DEFAULT_TTS_VOICE = "alloy";

/**
 * Model options for different use cases
 */
export const MODEL_OPTIONS = {
  // For complex historical research and structured content
  creative: "gpt-4-turbo-preview",
  // For faster, less complex tasks
  fast: "gpt-3.5-turbo",
  // For production audio quality
  audio: "tts-1-hd",
  // For development/testing (faster, cheaper)
  audioDev: "tts-1",
} as const;
