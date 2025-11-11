/**
 * Zod schemas for Adventure (Choose Your Own Adventure) content generation
 */

import { z } from 'zod';

/**
 * Schema for a single choice in a decision node
 */
export const AdventureChoiceSchema = z.object({
  text: z.string().min(10).max(100),
  description: z.string().min(20).max(200),
  nextNodeId: z.string(),
  consequences: z.string().min(20).max(150).describe('Preview of what this choice leads to'),
});

/**
 * Schema for a single adventure node (episode)
 */
export const AdventureNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  nodeType: z.enum(['START', 'DECISION', 'STORY', 'ENDING']),
  narrative: z.string().min(400).max(800).describe('Second-person narration for this node'),
  choices: z.array(AdventureChoiceSchema).min(2).max(3).optional().describe('Choices available at this node (for DECISION nodes)'),
  endingType: z.enum(['victory', 'defeat', 'neutral', 'bittersweet']).optional().describe('Type of ending (for ENDING nodes)'),
});

/**
 * Schema for the complete adventure outline (all nodes and paths)
 */
export const AdventureOutlineSchema = z.object({
  title: z.string(),
  description: z.string().min(200).max(500),
  historicalSetting: z.object({
    era: z.string(),
    location: z.string(),
    context: z.string().min(300).max(600),
    keyFigures: z.array(z.string()).min(2).max(5),
  }),
  storyline: z.object({
    premise: z.string().min(100).max(300),
    protagonist: z.string().describe('Who the listener plays as'),
    stakes: z.string().min(50).max(200),
  }),
  nodes: z.array(AdventureNodeSchema).min(8).max(12).describe('8-12 total nodes creating multiple paths'),
  flowMap: z.record(z.string(), z.array(z.string())).describe('nodeId -> [childNodeIds] for path validation'),
});

/**
 * Schema for a single node's full script
 */
export const AdventureScriptSchema = z.object({
  nodeId: z.string(),
  intro: z.string().min(100).max(200).describe('Scene setting'),
  narrative: z.string().min(800).max(1500).describe('Main story content in second person'),
  decisionPrompt: z.string().min(50).max(150).optional().describe('Prompt for decision (if DECISION node)'),
  choices: z.array(z.object({
    text: z.string(),
    description: z.string(),
  })).optional(),
  outro: z.string().min(50).max(150).describe('Closing/transition'),
  totalWords: z.number(),
});

// Type exports
export type AdventureChoice = z.infer<typeof AdventureChoiceSchema>;
export type AdventureNode = z.infer<typeof AdventureNodeSchema>;
export type AdventureOutline = z.infer<typeof AdventureOutlineSchema>;
export type AdventureScript = z.infer<typeof AdventureScriptSchema>;
