import { z } from "zod";

/**
 * Episode status enum
 */
export const EpisodeStatusSchema = z.enum([
  "draft",
  "generating_outline",
  "generating_script",
  "generating_audio",
  "processing",
  "ready",
  "published",
  "failed",
]);

export type EpisodeStatus = z.infer<typeof EpisodeStatusSchema>;

/**
 * Audio metadata schema
 */
export const AudioMetadataSchema = z.object({
  url: z.string().url().describe("URL to the audio file"),
  bytes: z.number().int().positive().describe("File size in bytes"),
  mimeType: z
    .string()
    .default("audio/mpeg")
    .describe("MIME type (e.g., audio/mpeg)"),
  duration: z.number().positive().describe("Duration in seconds"),
  sampleRate: z.number().optional().describe("Sample rate in Hz"),
  bitrate: z.number().optional().describe("Bitrate in kbps"),
});

export type AudioMetadata = z.infer<typeof AudioMetadataSchema>;

/**
 * Episode metadata for RSS/SEO
 */
export const EpisodeMetadataSchema = z.object({
  guid: z.string().describe("Unique identifier for RSS"),
  pubDate: z.date().describe("Publication date"),
  keywords: z.array(z.string()).describe("Keywords/tags for the episode"),
  explicit: z.boolean().default(false).describe("Explicit content flag"),
  season: z.number().int().optional().describe("Season number (if applicable)"),
  episode: z
    .number()
    .int()
    .optional()
    .describe("Episode number (if applicable)"),
});

export type EpisodeMetadata = z.infer<typeof EpisodeMetadataSchema>;
