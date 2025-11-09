/**
 * TTS adapter interface
 */
export interface TTSAdapter {
  /**
   * Generate audio from text
   * @returns Buffer containing the audio data
   */
  generateAudio(text: string, options?: TTSOptions): Promise<AudioResult>;

  /**
   * Get available voices for this provider
   */
  getAvailableVoices(): Promise<Voice[]>;

  /**
   * Estimate audio duration based on text length (in seconds)
   */
  estimateDuration(text: string): number;
}

export interface TTSOptions {
  voice?: string;
  model?: string;
  speed?: number; // 0.25 to 4.0
}

export interface AudioResult {
  buffer: Buffer;
  mimeType: string;
  estimatedDuration: number; // in seconds
  provider: "openai" | "elevenlabs";
}

export interface Voice {
  id: string;
  name: string;
  description?: string;
  previewUrl?: string;
}

export type TTSProvider = "openai" | "elevenlabs";
