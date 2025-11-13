/**
 * Interview Generation Service
 * Generates AI-powered interviews with historical figures
 */

import { openai, DEFAULT_MODEL, DEFAULT_TTS_MODEL } from './openai';
import { VOICE_PRESETS, getGuestVoice, getVoiceOrDefault, type OpenAIVoice } from './voices';
import { retryGPTCompletion, retryTTSGeneration } from './retry';
import {
  InterviewOutlineSchema,
  InterviewScriptSchema,
  type InterviewOutline,
  type InterviewScript,
} from '@epoch/schema';
import zodToJsonSchema from 'zod-to-json-schema';
import { concatenateAudioWithSilenceSafe } from './audio-utils';

/**
 * Generate an interview outline with research and questions
 */
export async function generateInterviewOutline(
  guestName: string,
  topic?: string,
  angle?: string
): Promise<InterviewOutline> {
  const jsonSchema = zodToJsonSchema(InterviewOutlineSchema, 'interviewOutline');

  const completion = await retryGPTCompletion(() =>
    openai.beta.chat.completions.parse({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a historical researcher and podcast producer. Create an outline for an interview with a historical figure.

Requirements:
- Research the guest's life, work, and historical context thoroughly
- Develop 8-12 insightful questions that would make for engaging conversation
- Mix question types: background, achievements, controversies, personal reflections, legacy, and hypothetical "what if" scenarios
- Include research notes with historical facts that will help generate authentic responses
- Ensure questions are respectful but probing - avoid softball questions
- Cite credible historical sources (books, academic papers, primary sources)
- Make the interview accessible to general audiences while maintaining accuracy

The interview should feel like a modern podcast - conversational, engaging, and insightful - while being historically accurate.`,
        },
        {
          role: 'user',
          content: `Create an interview outline:
Guest: ${guestName}
${topic ? `Topic focus: ${topic}` : 'Topic: Broad overview of their life and major contributions'}
${angle ? `Angle: ${angle}` : 'Angle: Comprehensive exploration of their life and work'}

Design a compelling interview that brings this historical figure to life for modern listeners.`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'interview_outline',
          strict: true,
          schema: jsonSchema.definitions!.interviewOutline,
        },
      },
    })
  );

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) {
    throw new Error('Failed to parse interview outline from OpenAI response');
  }

  return InterviewOutlineSchema.parse(parsed);
}

/**
 * Generate the interview script from the outline
 */
export async function generateInterviewScript(
  outline: InterviewOutline
): Promise<InterviewScript> {
  const jsonSchema = zodToJsonSchema(InterviewScriptSchema, 'interviewScript');

  const completion = await retryGPTCompletion(() =>
    openai.beta.chat.completions.parse({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a master dialogue writer for historical podcasts. Convert the interview outline into natural, engaging conversation.

Style guidelines:
- HOST: Professional but warm, curious, asks insightful questions and follow-ups
- GUEST: Speaks authentically in character based on their historical era, personality, and experiences
- Natural conversational flow: include "hmm", "you know", "well", thinking pauses, and natural speech patterns
- GUEST should speak as if they're actually from their time period - use period-appropriate language, references, and worldview
- Balance education with entertainment - make complex topics accessible
- Create a narrative arc: introduction → exploration → deeper insights → reflection
- Total length: 2,000-2,800 words (approximately 10-14 minutes of audio)
- End segments naturally with good transitions

Example dialogue style:
HOST: "Dr. Einstein, when you published your theory of relativity in 1905, did you expect the controversy it would create?"
GUEST: "Well, you know, in 1905, we physicists were grappling with some rather troubling inconsistencies in our understanding of light and motion. I didn't set out to be controversial - I simply followed the mathematics where it led me."
HOST: "But the idea that time itself could be relative must have seemed radical, even revolutionary."
GUEST: "Oh, absolutely! My colleagues thought I'd gone mad. [chuckles] But the beauty of physics is that nature doesn't care about our intuitions. The experimental evidence was undeniable."

Remember: The guest is speaking FROM their historical perspective, not looking back on history.`,
      },
      {
        role: 'user',
        content: `Convert this interview outline into a natural, engaging script:

${JSON.stringify(outline, null, 2)}

Create a compelling dialogue that feels like a real conversation between a modern podcast host and this historical figure.`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'interview_script',
        strict: true,
        schema: jsonSchema.definitions!.interviewScript,
      },
    },
    })
  );

  const parsed = completion.choices[0].message.parsed;
  if (!parsed) {
    throw new Error('Failed to parse interview script from OpenAI response');
  }

  return InterviewScriptSchema.parse(parsed);
}

/**
 * Generate audio for the interview using multi-voice TTS
 * @param script The interview script to convert to audio
 * @param guestName The name of the guest (for voice selection)
 * @param hostVoice Optional override for host voice
 * @param guestVoice Optional override for guest voice
 */
export async function generateInterviewAudio(
  script: InterviewScript,
  guestName?: string,
  hostVoice?: string,
  guestVoice?: string
): Promise<Buffer> {
  const audioSegments: Buffer[] = [];

  // Use centralized voice configuration with smart defaults
  const finalHostVoice = getVoiceOrDefault(hostVoice, VOICE_PRESETS.interview.host);
  const finalGuestVoice = guestVoice
    ? getVoiceOrDefault(guestVoice, VOICE_PRESETS.interview.guest)
    : guestName
      ? getGuestVoice(guestName)
      : VOICE_PRESETS.interview.guest;

  try {
    // Generate intro audio
    console.log(`Generating intro with voice: ${finalHostVoice}`);
    const introResponse = await retryTTSGeneration(() =>
      openai.audio.speech.create({
        model: DEFAULT_TTS_MODEL,
        voice: finalHostVoice as any,
        input: script.intro.text,
        speed: VOICE_PRESETS.interview.hostSpeed,
      })
    );
    const introBuffer = Buffer.from(await introResponse.arrayBuffer());
    audioSegments.push(introBuffer);

    // Generate dialogue segments
    console.log(`Generating ${script.segments.length} dialogue segments...`);
    console.log(`Host voice: ${finalHostVoice}, Guest voice: ${finalGuestVoice}`);

    for (let i = 0; i < script.segments.length; i++) {
      const segment = script.segments[i];
      const voice = segment.speaker === 'HOST' ? finalHostVoice : finalGuestVoice;
      const speed = segment.speaker === 'GUEST'
        ? VOICE_PRESETS.interview.guestSpeed
        : VOICE_PRESETS.interview.hostSpeed;

      const response = await retryTTSGeneration(() =>
        openai.audio.speech.create({
          model: DEFAULT_TTS_MODEL,
          voice: voice as any,
          input: segment.text,
          speed,
        })
      );

      const buffer = Buffer.from(await response.arrayBuffer());
      audioSegments.push(buffer);

      if ((i + 1) % 10 === 0) {
        console.log(`Generated ${i + 1}/${script.segments.length} segments...`);
      }
    }

    // Generate outro audio
    console.log('Generating outro audio...');
    const outroResponse = await retryTTSGeneration(() =>
      openai.audio.speech.create({
        model: DEFAULT_TTS_MODEL,
        voice: finalHostVoice as any,
        input: script.outro.text,
        speed: VOICE_PRESETS.interview.hostSpeed,
      })
    );
    const outroBuffer = Buffer.from(await outroResponse.arrayBuffer());
    audioSegments.push(outroBuffer);

    console.log('Concatenating audio segments with 0.3s pauses...');
    console.log(`Total segments: ${audioSegments.length}`);

    // Use ffmpeg to add 0.3s silence between speakers for more natural pacing
    return await concatenateAudioWithSilenceSafe(audioSegments, 0.3);
  } catch (error) {
    console.error('Error generating interview audio:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate interview audio: ${error.message}`);
    }
    throw new Error('Failed to generate interview audio');
  }
}

/**
 * Estimate the duration of the interview in seconds based on word count
 * Average speaking rate: 150 words per minute
 */
export function estimateInterviewDuration(wordCount: number): number {
  const WORDS_PER_MINUTE = 150;
  return Math.round((wordCount / WORDS_PER_MINUTE) * 60);
}
