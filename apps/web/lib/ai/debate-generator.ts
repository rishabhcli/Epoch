/**
 * Debate Generation Service
 * Generates AI-powered debate episodes with two opposing positions
 */

import { openai, DEFAULT_MODEL, DEFAULT_TTS_MODEL } from './openai';
import {
  DebateOutlineSchema,
  DebateScriptSchema,
  type DebateOutline,
  type DebateScript,
} from '@epoch/schema';
import zodToJsonSchema from 'zod-to-json-schema';

/**
 * Generate a debate outline with two balanced positions
 */
export async function generateDebateOutline(
  topic: string,
  question: string
): Promise<DebateOutline> {
  const jsonSchema = zodToJsonSchema(DebateOutlineSchema, 'debateOutline');

  const completion = await openai.beta.chat.completions.parse({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a historian and debate coordinator. Generate a balanced, historically accurate debate outline.

Requirements:
- Both positions must be supported by credible historical evidence
- Arguments should be intellectually honest, not strawmen
- Include primary and secondary source citations
- Maintain academic rigor while being accessible to general audiences
- Each side should have 3 strong key points and 2 rebuttals
- Total debate should be 12-15 minutes when spoken
- Present the strongest possible case for BOTH sides
- Avoid presentism - judge historical figures by their era's standards
- Include nuance and complexity, not simplistic good vs evil

The goal is enlightening discourse, not winning. Both positions should be compelling.`,
      },
      {
        role: 'user',
        content: `Generate a debate outline for:
Topic: ${topic}
Question: ${question}

Provide two well-researched, balanced positions with evidence.
Each position should be argued as strongly and fairly as possible.`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'debate_outline',
        strict: true,
        schema: jsonSchema.definitions!.debateOutline,
      },
    },
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) {
    throw new Error('Failed to parse debate outline from OpenAI response');
  }

  return DebateOutlineSchema.parse(parsed);
}

/**
 * Generate the debate script from the outline
 */
export async function generateDebateScript(
  outline: DebateOutline
): Promise<DebateScript> {
  const jsonSchema = zodToJsonSchema(DebateScriptSchema, 'debateScript');

  const completion = await openai.beta.chat.completions.parse({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a professional debate scriptwriter. Convert the debate outline into a natural, engaging debate script.

Format:
- MODERATOR introduces the topic and both positions (neutral, professional)
- Alternating segments between Position 1 and Position 2
- Each debater gets 2-3 segments to present their case
- MODERATOR provides transitions between speakers
- No direct cross-examination (parallel arguments, not a back-and-forth)
- MODERATOR concludes by summarizing both positions and asking listeners to vote

Voice assignments:
- MODERATOR: neutral, professional host (voice: "onyx")
- POSITION_1: passionate advocate for their position (voice: "echo")
- POSITION_2: passionate advocate for their position (voice: "fable")

Style guidelines:
- Each debater should speak passionately but respectfully
- Use rhetorical devices: questions, analogies, historical parallels
- Reference specific historical evidence and sources
- Make each position genuinely compelling
- Total: 2,400-3,000 words (12-15 min audio)

Example flow:
MODERATOR: "Welcome to Epoch Pod. Today we examine a fascinating historical question: [question]. To help us explore this, we have two expert advocates presenting opposing views..."
POSITION_1: "Thank you. When we look at the historical evidence, it becomes clear that [opening statement with evidence]..."
MODERATOR: "A compelling argument. Now let's hear the opposing view."
POSITION_2: "I appreciate that perspective, but the historical record tells a different story. Consider [counterargument with evidence]..."
[Continue alternating]
MODERATOR: "We've heard two thoroughly researched perspectives. The question remains open for you to decide. Visit our website to cast your vote and explore this topic further."`,
      },
      {
        role: 'user',
        content: `Convert this outline into a debate script:\n\n${JSON.stringify(outline, null, 2)}`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'debate_script',
        strict: true,
        schema: jsonSchema.definitions!.debateScript,
      },
    },
  });

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) {
    throw new Error('Failed to parse debate script from OpenAI response');
  }

  return DebateScriptSchema.parse(parsed);
}

/**
 * Generate audio for the debate using multi-voice TTS
 */
export async function generateDebateAudio(
  script: DebateScript,
  moderatorVoice: string = 'onyx',
  position1Voice: string = 'echo',
  position2Voice: string = 'fable'
): Promise<Buffer> {
  const audioSegments: Buffer[] = [];

  try {
    // Generate intro audio (moderator)
    console.log('Generating moderator intro audio...');
    const introResponse = await openai.audio.speech.create({
      model: DEFAULT_TTS_MODEL,
      voice: moderatorVoice as any,
      input: script.intro,
      speed: 1.0,
    });
    const introBuffer = Buffer.from(await introResponse.arrayBuffer());
    audioSegments.push(introBuffer);

    // Generate debate segments
    console.log(`Generating ${script.segments.length} debate segments...`);
    for (let i = 0; i < script.segments.length; i++) {
      const segment = script.segments[i];

      // Select voice based on speaker
      let voice: string;
      let speed: number;

      switch (segment.speaker) {
        case 'MODERATOR':
          voice = moderatorVoice;
          speed = 1.0;
          break;
        case 'POSITION_1':
          voice = position1Voice;
          speed = 0.98; // Slightly slower for emphasis
          break;
        case 'POSITION_2':
          voice = position2Voice;
          speed = 0.98; // Slightly slower for emphasis
          break;
        default:
          voice = moderatorVoice;
          speed = 1.0;
      }

      const response = await openai.audio.speech.create({
        model: DEFAULT_TTS_MODEL,
        voice: voice as any,
        input: segment.text,
        speed,
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      audioSegments.push(buffer);

      if ((i + 1) % 10 === 0) {
        console.log(`Generated ${i + 1}/${script.segments.length} segments...`);
      }
    }

    // Generate outro audio (moderator)
    console.log('Generating moderator outro audio...');
    const outroResponse = await openai.audio.speech.create({
      model: DEFAULT_TTS_MODEL,
      voice: moderatorVoice as any,
      input: script.outro,
      speed: 1.0,
    });
    const outroBuffer = Buffer.from(await outroResponse.arrayBuffer());
    audioSegments.push(outroBuffer);

    console.log('Concatenating debate audio segments...');
    // For now, simple concatenation
    // TODO: Use ffmpeg to add 0.5s silence between speakers for natural pacing
    return Buffer.concat(audioSegments);
  } catch (error) {
    console.error('Error generating debate audio:', error);
    throw new Error('Failed to generate debate audio');
  }
}

/**
 * Estimate the duration of the debate in seconds based on word count
 * Average speaking rate: 150 words per minute
 */
export function estimateDebateDuration(wordCount: number): number {
  const WORDS_PER_MINUTE = 150;
  return Math.round((wordCount / WORDS_PER_MINUTE) * 60);
}
