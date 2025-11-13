/**
 * Debate Generation Service
 * Generates AI-powered debate episodes with two opposing positions
 */

import { openai, DEFAULT_MODEL, DEFAULT_TTS_MODEL } from './openai';
import { VOICE_PRESETS, getVoiceOrDefault } from './voices';
import { retryGPTCompletion, retryTTSGeneration } from './retry';
import {
  DebateOutlineSchema,
  DebateScriptSchema,
  type DebateOutline,
  type DebateScript,
} from '@epoch/schema';
import zodToJsonSchema from 'zod-to-json-schema';
import { concatenateAudioWithSilenceSafe } from './audio-utils';

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
- MODERATOR: neutral, professional host (voice: "alloy")
- POSITION_1: passionate advocate for their position (voice: "fable")
- POSITION_2: passionate advocate for their position (voice: "nova")

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
  moderatorVoice?: string,
  position1Voice?: string,
  position2Voice?: string
): Promise<Buffer> {
  const audioSegments: Buffer[] = [];

  // Use centralized voice configuration with smart defaults
  const finalModeratorVoice = getVoiceOrDefault(moderatorVoice, VOICE_PRESETS.debate.moderator);
  const finalPosition1Voice = getVoiceOrDefault(position1Voice, VOICE_PRESETS.debate.position1);
  const finalPosition2Voice = getVoiceOrDefault(position2Voice, VOICE_PRESETS.debate.position2);

  try {
    // Generate intro audio (moderator)
    console.log(`Generating moderator intro audio with voice: ${finalModeratorVoice}...`);
    const introResponse = await openai.audio.speech.create({
      model: DEFAULT_TTS_MODEL,
      voice: finalModeratorVoice as any,
      input: script.intro,
      speed: VOICE_PRESETS.debate.moderatorSpeed,
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
          voice = finalModeratorVoice;
          speed = VOICE_PRESETS.debate.moderatorSpeed;
          break;
        case 'POSITION_1':
          voice = finalPosition1Voice;
          speed = VOICE_PRESETS.debate.debaterSpeed;
          break;
        case 'POSITION_2':
          voice = finalPosition2Voice;
          speed = VOICE_PRESETS.debate.debaterSpeed;
          break;
        default:
          voice = finalModeratorVoice;
          speed = VOICE_PRESETS.debate.moderatorSpeed;
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
      voice: finalModeratorVoice as any,
      input: script.outro,
      speed: VOICE_PRESETS.debate.moderatorSpeed,
    });
    const outroBuffer = Buffer.from(await outroResponse.arrayBuffer());
    audioSegments.push(outroBuffer);

    console.log('Concatenating debate audio segments with 0.5s pauses...');
    // Use ffmpeg to add 0.5s silence between speakers for natural pacing
    return await concatenateAudioWithSilenceSafe(audioSegments, 0.5);
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
