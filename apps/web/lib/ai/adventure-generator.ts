/**
 * Adventure Generation Service
 * Generates branching "Choose Your Own Adventure" style episodes
 */

import { openai, DEFAULT_MODEL, DEFAULT_TTS_MODEL } from './openai';
import { VOICE_PRESETS, getVoiceOrDefault } from './voices';
import {
  AdventureOutlineSchema,
  AdventureScriptSchema,
  type AdventureOutline,
  type AdventureScript,
  type AdventureNode,
  type Choice,
} from '@epoch/schema';
import zodToJsonSchema from 'zod-to-json-schema';

/**
 * Generate a complete adventure outline with branching paths
 */
export async function generateAdventureOutline(
  concept: string,
  historicalContext: string
): Promise<AdventureOutline> {
  const jsonSchema = zodToJsonSchema(AdventureOutlineSchema, 'adventureOutline');

  const completion = await openai.beta.chat.completions.parse({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a historical fiction writer and game designer. Create a branching narrative adventure set in a historically accurate period.

Requirements:
- 8-12 total nodes (episodes) creating a decision tree
- 1 START node (beginning of adventure)
- 4-6 DECISION nodes (each with 2-3 choices)
- 2-3 STORY nodes (linear progression)
- 3-4 ENDING nodes (different outcomes)
- Each path from START to an ENDING should be 4-5 episodes long
- Choices should be meaningful and historically plausible
- No "game over" dead ends - all paths lead to endings
- Maintain historical accuracy while allowing alternate scenarios
- Second-person narration: "You are..." not "The character..."

Path Design:
- Create multiple viable paths through the adventure
- Choices should lead to genuinely different experiences
- Endings should reflect the cumulative impact of choices
- Balance historical determinism with player agency

The listener should feel like their choices matter while learning real history.`,
      },
      {
        role: 'user',
        content: `Create a branching adventure:
Concept: ${concept}
Historical Context: ${historicalContext}

Design a complete adventure outline with branching paths that allow the listener to experience history through their choices.`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'adventure_outline',
        strict: true,
        schema: jsonSchema.definitions!.adventureOutline,
      },
    },
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) {
    throw new Error('Failed to parse adventure outline from OpenAI response');
  }

  return AdventureOutlineSchema.parse(parsed);
}

/**
 * Path history entry
 */
interface PathHistoryEntry {
  nodeId: string;
  choiceId?: string;
  choiceText?: string;
  timestamp: string;
}

/**
 * Adventure context for node generation
 */
interface AdventureContext {
  title: string;
  description: string;
  historicalContext: string;
  era?: string;
}

/**
 * Generate script for a single node with context awareness
 */
export async function generateNodeScript(
  node: AdventureNode,
  adventureContext: AdventureContext,
  pathHistory?: PathHistoryEntry[]
): Promise<AdventureScript> {
  const jsonSchema = zodToJsonSchema(AdventureScriptSchema, 'nodeScript');

  const pathContext = pathHistory && pathHistory.length > 0
    ? `Previous choices made by the listener:\n${pathHistory.map((p, i) => `${i + 1}. ${p.choiceText}`).join('\n')}`
    : 'This is the start of the adventure.';

  const completion = await openai.beta.chat.completions.parse({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a historical storyteller creating an immersive audio experience. Write an engaging podcast episode for this adventure node.

Format:
- Second-person narration ("You are...", "You see...", "You decide...")
- Vivid sensory details (sights, sounds, smells, textures)
- Historical accuracy in details, language, and customs
- 800-1,500 words per node
- Build tension and engagement
- If DECISION node: end with clear presentation of choices
- If STORY node: smooth transition to next episode
- If ENDING node: satisfying conclusion reflecting prior choices
- Reference previous choices to create continuity

The listener should feel immersed in the historical moment.`,
      },
      {
        role: 'user',
        content: `Write script for this adventure node:

Node Details: ${JSON.stringify(node, null, 2)}

Adventure Context: ${JSON.stringify(adventureContext, null, 2)}

${pathContext}

Create an immersive, historically accurate episode that makes the listener feel present in this moment of history.`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'node_script',
        strict: true,
        schema: jsonSchema.definitions!.nodeScript,
      },
    },
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) {
    throw new Error('Failed to parse node script from OpenAI response');
  }

  return AdventureScriptSchema.parse(parsed);
}

/**
 * Generate audio for an adventure node
 */
export async function generateNodeAudio(
  script: AdventureScript,
  narratorVoice?: string
): Promise<Buffer> {
  // Use centralized voice configuration with smart defaults
  const finalNarratorVoice = getVoiceOrDefault(narratorVoice, VOICE_PRESETS.adventure.narrator);

  try {
    const fullText = [
      script.intro,
      script.narrative,
      script.decisionPrompt || '',
      script.outro,
    ]
      .filter(Boolean)
      .join(' ');

    console.log(`Generating audio for node ${script.nodeId} (${script.totalWords} words) with voice: ${finalNarratorVoice}...`);

    const response = await openai.audio.speech.create({
      model: DEFAULT_TTS_MODEL,
      voice: finalNarratorVoice as any,
      input: fullText,
      speed: VOICE_PRESETS.adventure.speed,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    console.log(`Audio generated for node ${script.nodeId} (${buffer.length} bytes)`);

    return buffer;
  } catch (error) {
    console.error(`Error generating audio for node ${script.nodeId}:`, error);
    throw new Error('Failed to generate node audio');
  }
}

/**
 * Validate adventure structure for logical consistency
 */
export function validateAdventureStructure(outline: AdventureOutline): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for required node types
  const startNodes = outline.nodes.filter((n) => n.nodeType === 'START');
  if (startNodes.length !== 1) {
    errors.push(`Must have exactly 1 START node, found ${startNodes.length}`);
  }

  const endingNodes = outline.nodes.filter((n) => n.nodeType === 'ENDING');
  if (endingNodes.length < 3) {
    errors.push(`Should have at least 3 ENDING nodes, found ${endingNodes.length}`);
  }

  // Validate choices reference valid nodes
  for (const node of outline.nodes) {
    if (node.choices) {
      for (const choice of node.choices) {
        const targetNode = outline.nodes.find((n) => n.id === choice.nextNodeId);
        if (!targetNode) {
          errors.push(`Node "${node.id}" has choice pointing to non-existent node "${choice.nextNodeId}"`);
        }
      }
    }
  }

  // Check that all non-START nodes are reachable
  const nodeIds = new Set(outline.nodes.map((n) => n.id));
  const reachableIds = new Set<string>();
  const queue = [startNodes[0]?.id].filter(Boolean);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (reachableIds.has(currentId)) continue;
    reachableIds.add(currentId);

    const currentNode = outline.nodes.find((n) => n.id === currentId);
    if (currentNode?.choices) {
      for (const choice of currentNode.choices) {
        queue.push(choice.nextNodeId);
      }
    }
  }

  const unreachableNodes = [...nodeIds].filter((id) => !reachableIds.has(id));
  if (unreachableNodes.length > 0) {
    errors.push(`Unreachable nodes: ${unreachableNodes.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Estimate duration based on word count
 */
export function estimateNodeDuration(wordCount: number): number {
  const WORDS_PER_MINUTE = 150;
  return Math.round((wordCount / WORDS_PER_MINUTE) * 60);
}
