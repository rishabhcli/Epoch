import { z } from "zod";

/**
 * Citation schema for sources
 */
export const CitationSchema = z.object({
  title: z.string().describe("Title of the source"),
  author: z.string().optional().describe("Author of the source"),
  url: z.string().url().optional().describe("URL to the source"),
  year: z.number().optional().describe("Publication year"),
  type: z
    .enum(["book", "article", "website", "paper", "archive"])
    .describe("Type of source"),
});

export type Citation = z.infer<typeof CitationSchema>;

/**
 * Section beat schema - individual narrative beat within a section
 */
export const SectionBeatSchema = z.object({
  beat: z.string().describe("Key narrative point or moment"),
  context: z.string().describe("Historical context or significance"),
  citations: z
    .array(CitationSchema)
    .describe("Sources supporting this beat")
    .optional(),
});

export type SectionBeat = z.infer<typeof SectionBeatSchema>;

/**
 * Outline section schema - one of the 5 narrative acts
 */
export const OutlineSectionSchema = z.object({
  title: z.string().describe("Section title"),
  act: z
    .enum(["hook", "context", "conflict", "breakthrough", "legacy"])
    .describe("Narrative act type"),
  beats: z
    .array(SectionBeatSchema)
    .min(2)
    .max(5)
    .describe("Key narrative beats in this section"),
  estimatedDuration: z
    .number()
    .describe("Estimated duration in seconds for this section"),
});

export type OutlineSection = z.infer<typeof OutlineSectionSchema>;

/**
 * Complete episode outline schema
 */
export const OutlineSchema = z.object({
  title: z.string().describe("Episode title"),
  subtitle: z.string().optional().describe("Optional subtitle or tagline"),
  topic: z.string().describe("Main topic or theme"),
  era: z.string().describe("Historical era or time period"),
  hook: z
    .string()
    .describe("Opening hook to capture listener attention (1-2 sentences)"),
  sections: z
    .array(OutlineSectionSchema)
    .length(5)
    .describe("Five-act narrative structure"),
  totalEstimatedDuration: z
    .number()
    .min(600)
    .max(1800)
    .describe("Total estimated duration in seconds (10-30 minutes)"),
  keyThemes: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe("Key themes explored in the episode"),
  targetAudience: z
    .string()
    .describe("Description of the target audience for this episode"),
});

export type Outline = z.infer<typeof OutlineSchema>;
