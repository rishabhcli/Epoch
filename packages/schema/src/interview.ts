/**
 * Zod schemas for Interview content generation
 */

import { z } from 'zod';

/**
 * Schema for a single interview question with research context
 */
export const InterviewQuestionSchema = z.object({
  question: z.string().min(10).max(300),
  category: z.enum([
    'background',
    'achievement',
    'controversy',
    'personal',
    'legacy',
    'hypothetical',
  ]),
  researchNotes: z
    .string()
    .describe('Historical context and facts to inform the guest response'),
});

/**
 * Schema for source citations used in the interview
 */
export const InterviewSourceSchema = z.object({
  title: z.string(),
  author: z.string().optional(),
  type: z.enum(['book', 'article', 'primary_source', 'academic_paper']),
  url: z.string().url().optional(),
  year: z.number().optional(),
});

/**
 * Schema for the interview outline (research + question planning)
 */
export const InterviewOutlineSchema = z.object({
  guest: z.object({
    name: z.string(),
    role: z.string(),
    era: z.string(),
    biography: z.string().min(200).max(400),
    majorAccomplishments: z.array(z.string()),
    historicalContext: z.string().min(100).max(500),
  }),
  topic: z.string(),
  angle: z.string().describe('Unique angle or focus for this interview'),
  questions: z
    .array(InterviewQuestionSchema)
    .min(8)
    .max(12)
    .describe('8-12 questions covering different aspects of the guest life/work'),
  sources: z
    .array(InterviewSourceSchema)
    .min(3)
    .describe('Historical sources used for research'),
});

/**
 * Schema for a single dialogue segment in the interview
 */
export const DialogueSegmentSchema = z.object({
  speaker: z.enum(['HOST', 'GUEST']),
  text: z.string().min(50).max(400),
  emotion: z
    .enum(['neutral', 'enthusiastic', 'thoughtful', 'somber', 'excited'])
    .optional()
    .describe('Emotional tone for TTS generation'),
});

/**
 * Schema for the complete interview script (dialogue)
 */
export const InterviewScriptSchema = z.object({
  intro: z.object({
    speaker: z.literal('HOST'),
    text: z
      .string()
      .min(150)
      .max(300)
      .describe('Host introduction of guest and topic'),
  }),
  segments: z
    .array(DialogueSegmentSchema)
    .min(20)
    .max(60)
    .describe('Main interview dialogue'),
  outro: z.object({
    speaker: z.literal('HOST'),
    text: z
      .string()
      .min(100)
      .max(200)
      .describe('Host closing remarks and thanks'),
  }),
  totalWords: z.number(),
  estimatedDuration: z.number().describe('Estimated duration in seconds'),
});

// Type exports
export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>;
export type InterviewSource = z.infer<typeof InterviewSourceSchema>;
export type InterviewOutline = z.infer<typeof InterviewOutlineSchema>;
export type DialogueSegment = z.infer<typeof DialogueSegmentSchema>;
export type InterviewScript = z.infer<typeof InterviewScriptSchema>;
