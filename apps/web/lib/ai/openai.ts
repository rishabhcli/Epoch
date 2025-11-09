import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const DEFAULT_MODEL = "gpt-4-turbo-preview";
export const DEFAULT_TTS_MODEL = "tts-1-hd";
export const DEFAULT_TTS_VOICE = "alloy";
