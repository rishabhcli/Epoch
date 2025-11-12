import type {
  TTSAdapter,
  TTSOptions,
  AudioResult,
  Voice,
} from "./types";

/**
 * ElevenLabs TTS adapter
 * Docs: https://elevenlabs.io/docs/api-reference/text-to-speech
 */
export class ElevenLabsTTSAdapter implements TTSAdapter {
  private apiKey: string;
  private baseUrl = "https://api.elevenlabs.io/v1";

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ELEVENLABS_API_KEY;
    // Explicitly check for empty string and undefined/null
    if (!key || key.trim() === "") {
      throw new Error(
        "ElevenLabs API key is required. Set ELEVENLABS_API_KEY environment variable."
      );
    }
    this.apiKey = key.trim();
  }

  async generateAudio(
    text: string,
    options: TTSOptions = {}
  ): Promise<AudioResult> {
    const {
      voice = "21m00Tcm4TlvDq8ikWAM", // Default: Rachel voice
      model = "eleven_monolingual_v1",
      speed = 1.0,
    } = options;

    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voice}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            model_id: model,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true,
              speed,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return {
        buffer,
        mimeType: "audio/mpeg",
        estimatedDuration: this.estimateDuration(text),
        provider: "elevenlabs",
      };
    } catch (error) {
      console.error("ElevenLabs TTS error:", error);
      throw new Error(
        `Failed to generate audio with ElevenLabs: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAvailableVoices(): Promise<Voice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          "xi-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data || !Array.isArray(data.voices)) {
        console.error("Invalid voices API response format");
        return [];
      }

      return data.voices.map((v: any) => ({
        id: v.voice_id,
        name: v.name,
        description: v.description || v.labels?.description,
        previewUrl: v.preview_url,
      }));
    } catch (error) {
      console.error("Failed to fetch ElevenLabs voices:", error);
      // Return empty array if fetch fails (degraded mode)
      return [];
    }
  }

  estimateDuration(text: string): number {
    // ElevenLabs averages ~160 words per minute
    // This is roughly 2.67 words per second
    const wordCount = text.split(/\s+/).length;
    return Math.round(wordCount / 2.67);
  }
}
