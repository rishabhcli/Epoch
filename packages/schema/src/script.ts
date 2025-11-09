import { z } from "zod";
import { CitationSchema } from "./outline";

/**
 * Script paragraph schema - a single paragraph with optional citations
 */
export const ScriptParagraphSchema = z.object({
  text: z.string().describe("Paragraph text for narration"),
  citations: z
    .array(CitationSchema)
    .optional()
    .describe("Citations referenced in this paragraph"),
  footnote: z
    .string()
    .optional()
    .describe("Optional footnote or additional context"),
});

export type ScriptParagraph = z.infer<typeof ScriptParagraphSchema>;

/**
 * Script section schema - corresponds to outline sections
 */
export const ScriptSectionSchema = z.object({
  title: z.string().describe("Section title"),
  act: z
    .enum(["hook", "context", "conflict", "breakthrough", "legacy"])
    .describe("Narrative act type"),
  paragraphs: z
    .array(ScriptParagraphSchema)
    .min(3)
    .max(10)
    .describe("Paragraphs in this section"),
  estimatedDuration: z
    .number()
    .describe("Estimated duration in seconds for this section"),
});

export type ScriptSection = z.infer<typeof ScriptSectionSchema>;

/**
 * Complete episode script schema
 */
export const ScriptSchema = z.object({
  title: z.string().describe("Episode title"),
  subtitle: z.string().optional().describe("Optional subtitle"),
  introduction: z
    .string()
    .describe("Opening introduction (the hook, spoken verbatim)"),
  sections: z
    .array(ScriptSectionSchema)
    .length(5)
    .describe("Five-act narrative structure"),
  conclusion: z
    .string()
    .describe("Closing conclusion that ties themes together"),
  transcript: z
    .string()
    .describe("Clean transcript without stage directions for accessibility"),
  wordCount: z
    .number()
    .min(1200)
    .max(1800)
    .describe("Total word count (target 1200-1800 words)"),
  estimatedDuration: z
    .number()
    .min(600)
    .max(1800)
    .describe("Estimated total duration in seconds"),
  allCitations: z
    .array(CitationSchema)
    .describe("All citations used in the episode"),
});

export type Script = z.infer<typeof ScriptSchema>;
