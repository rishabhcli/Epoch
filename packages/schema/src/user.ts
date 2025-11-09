import { z } from "zod";

/**
 * Voice provider options
 */
export const VoiceProviderSchema = z.enum(["openai", "elevenlabs"]);

export type VoiceProvider = z.infer<typeof VoiceProviderSchema>;

/**
 * Voice configuration schema
 */
export const VoiceConfigSchema = z.object({
  provider: VoiceProviderSchema.default("openai"),
  voiceId: z
    .string()
    .describe("Voice ID (e.g., 'alloy' for OpenAI, voice ID for ElevenLabs)"),
  model: z
    .string()
    .optional()
    .describe("Model version (e.g., 'tts-1' or 'tts-1-hd' for OpenAI)"),
  speed: z
    .number()
    .min(0.25)
    .max(4.0)
    .default(1.0)
    .describe("Playback speed multiplier"),
});

export type VoiceConfig = z.infer<typeof VoiceConfigSchema>;

/**
 * Email cadence options
 */
export const EmailCadenceSchema = z.enum([
  "immediate", // Send as soon as episode is ready
  "daily", // Daily digest
  "weekly", // Weekly digest
  "biweekly", // Bi-weekly digest
  "monthly", // Monthly digest
  "never", // No emails (RSS only)
]);

export type EmailCadence = z.infer<typeof EmailCadenceSchema>;

/**
 * User preferences schema
 */
export const UserPreferencesSchema = z.object({
  topics: z
    .array(z.string())
    .min(1)
    .max(10)
    .describe("Topics of interest (e.g., 'Ancient Rome', 'WWII', 'Renaissance')"),
  eras: z
    .array(z.string())
    .optional()
    .describe("Preferred historical eras"),
  emailCadence: EmailCadenceSchema.default("weekly"),
  voiceConfig: VoiceConfigSchema.default({
    provider: "openai",
    voiceId: "alloy",
    model: "tts-1-hd",
    speed: 1.0,
  }),
  episodeDuration: z
    .number()
    .min(600)
    .max(1800)
    .default(1200)
    .describe("Preferred episode duration in seconds (10-30 minutes)"),
  includeTranscripts: z
    .boolean()
    .default(true)
    .describe("Include transcripts in emails"),
  privateFeedEnabled: z
    .boolean()
    .default(false)
    .describe("Enable private RSS feed"),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

/**
 * User role enum
 */
export const UserRoleSchema = z.enum(["user", "admin"]);

export type UserRole = z.infer<typeof UserRoleSchema>;
