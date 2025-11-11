/**
 * Zod schemas for Debate content generation
 */

import { z } from 'zod';

/**
 * Schema for a source/evidence citation
 */
export const DebateEvidenceSchema = z.object({
  fact: z.string(),
  source: z.string(),
  year: z.number().optional(),
});

/**
 * Schema for a single key point in an argument
 */
export const DebateKeyPointSchema = z.object({
  claim: z.string().min(20).max(200),
  evidence: z
    .array(DebateEvidenceSchema)
    .min(1)
    .max(3)
    .describe('Historical evidence supporting this claim'),
  reasoning: z.string().min(50).max(300),
});

/**
 * Schema for a rebuttal to anticipated counterarguments
 */
export const DebateRebuttalSchema = z.object({
  anticipatedCounterArgument: z.string(),
  response: z.string().min(50).max(300),
  evidence: z.string(),
});

/**
 * Schema for one side's complete argument
 */
export const DebateArgumentSchema = z.object({
  position: z.string(),
  openingStatement: z.string().min(200).max(400),
  keyPoints: z
    .array(DebateKeyPointSchema)
    .length(3)
    .describe('Three main arguments supporting this position'),
  rebuttals: z
    .array(DebateRebuttalSchema)
    .length(2)
    .describe('Two rebuttals to opposing arguments'),
  closingStatement: z.string().min(200).max(400),
});

/**
 * Schema for the debate outline (research + argument planning)
 */
export const DebateOutlineSchema = z.object({
  topic: z.string(),
  question: z.string().describe('The central debate question'),
  historicalContext: z
    .string()
    .min(300)
    .max(600)
    .describe('Historical background for the debate'),
  position1: z.string().describe('First position/stance'),
  position2: z.string().describe('Second position/stance'),
  argument1: DebateArgumentSchema,
  argument2: DebateArgumentSchema,
  moderatorIntro: z
    .string()
    .min(100)
    .max(300)
    .describe('Moderator introduction of the debate'),
  moderatorOutro: z
    .string()
    .min(100)
    .max(300)
    .describe('Moderator closing and call to vote'),
});

/**
 * Schema for a single dialogue segment in the debate
 */
export const DebateSegmentSchema = z.object({
  speaker: z.enum(['MODERATOR', 'POSITION_1', 'POSITION_2']),
  voice: z.string().describe('Voice ID for TTS generation'),
  text: z.string().min(50).max(400),
  duration: z.number().optional().describe('Estimated duration in seconds'),
});

/**
 * Schema for the complete debate script (dialogue)
 */
export const DebateScriptSchema = z.object({
  intro: z.string().describe('Moderator introduction'),
  segments: z
    .array(DebateSegmentSchema)
    .min(20)
    .max(60)
    .describe('Alternating debate segments'),
  outro: z.string().describe('Moderator conclusion and voting prompt'),
  totalWords: z.number(),
  estimatedDuration: z.number().describe('Estimated duration in seconds'),
});

// Type exports
export type DebateEvidence = z.infer<typeof DebateEvidenceSchema>;
export type DebateKeyPoint = z.infer<typeof DebateKeyPointSchema>;
export type DebateRebuttal = z.infer<typeof DebateRebuttalSchema>;
export type DebateArgument = z.infer<typeof DebateArgumentSchema>;
export type DebateOutline = z.infer<typeof DebateOutlineSchema>;
export type DebateSegment = z.infer<typeof DebateSegmentSchema>;
export type DebateScript = z.infer<typeof DebateScriptSchema>;
