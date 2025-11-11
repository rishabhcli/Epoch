/**
 * Voice Configuration for Text-to-Speech
 * Centralized configuration for all OpenAI TTS voices used across the platform
 */

/**
 * Available OpenAI TTS Voices
 * @see https://platform.openai.com/docs/guides/text-to-speech/voice-options
 */
export const OPENAI_VOICES = {
  // Neutral, balanced voice - good for general narration
  alloy: 'alloy',

  // Warm, upbeat voice - good for friendly hosts
  echo: 'echo',

  // Articulate, clear voice - good for formal content
  fable: 'fable',

  // Smooth, deep voice - good for authoritative narration
  onyx: 'onyx',

  // Expressive voice - good for dramatic content
  nova: 'nova',

  // Warm, engaging voice - good for conversational content
  shimmer: 'shimmer',
} as const;

export type OpenAIVoice = typeof OPENAI_VOICES[keyof typeof OPENAI_VOICES];

/**
 * Voice configurations for different episode formats
 */
export const VOICE_PRESETS = {
  // Narrative Podcasts - Single authoritative narrator
  narrative: {
    narrator: OPENAI_VOICES.onyx,
    speed: 1.0,
  },

  // Historical Interviews - Host + Guest
  interview: {
    host: OPENAI_VOICES.onyx,      // Deep, authoritative host voice
    guest: OPENAI_VOICES.echo,     // Distinct guest voice (can be overridden)
    hostSpeed: 1.0,
    guestSpeed: 0.95,               // Slightly slower for gravitas
  },

  // Interactive Debates - Moderator + Two Debaters
  debate: {
    moderator: OPENAI_VOICES.alloy, // Neutral moderator
    position1: OPENAI_VOICES.fable, // Clear, articulate voice for position 1
    position2: OPENAI_VOICES.nova,  // Expressive voice for position 2
    moderatorSpeed: 1.0,
    debaterSpeed: 0.98,              // Slightly slower for clarity
  },

  // Adventures - Single narrator for immersive storytelling
  adventure: {
    narrator: OPENAI_VOICES.shimmer, // Engaging, warm voice for storytelling
    speed: 0.95,                      // Slightly slower for dramatic effect
  },
} as const;

/**
 * Guest-specific voice mappings
 * Override default guest voices for specific historical figures to match their characteristics
 */
export const GUEST_VOICE_OVERRIDES: Record<string, OpenAIVoice> = {
  // Male historical figures - deeper voices
  'Albert Einstein': OPENAI_VOICES.fable,
  'Leonardo da Vinci': OPENAI_VOICES.onyx,
  'Benjamin Franklin': OPENAI_VOICES.echo,
  'Nikola Tesla': OPENAI_VOICES.fable,
  'Charles Darwin': OPENAI_VOICES.onyx,
  'Isaac Newton': OPENAI_VOICES.fable,
  'Galileo Galilei': OPENAI_VOICES.echo,
  'Napoleon Bonaparte': OPENAI_VOICES.onyx,
  'Abraham Lincoln': OPENAI_VOICES.onyx,
  'Martin Luther King Jr.': OPENAI_VOICES.onyx,
  'Winston Churchill': OPENAI_VOICES.fable,
  'Mahatma Gandhi': OPENAI_VOICES.echo,

  // Female historical figures - varied voices
  'Cleopatra VII': OPENAI_VOICES.shimmer,
  'Marie Curie': OPENAI_VOICES.nova,
  'Ada Lovelace': OPENAI_VOICES.shimmer,
  'Florence Nightingale': OPENAI_VOICES.nova,
  'Harriet Tubman': OPENAI_VOICES.shimmer,
  'Rosa Parks': OPENAI_VOICES.nova,
  'Eleanor Roosevelt': OPENAI_VOICES.shimmer,
  'Amelia Earhart': OPENAI_VOICES.nova,
  'Joan of Arc': OPENAI_VOICES.shimmer,
  'Queen Elizabeth I': OPENAI_VOICES.nova,
};

/**
 * Get the appropriate voice for a historical figure
 */
export function getGuestVoice(guestName: string): OpenAIVoice {
  return GUEST_VOICE_OVERRIDES[guestName] || VOICE_PRESETS.interview.guest;
}

/**
 * Validate that a voice string is a valid OpenAI voice
 */
export function isValidVoice(voice: string): voice is OpenAIVoice {
  return Object.values(OPENAI_VOICES).includes(voice as OpenAIVoice);
}

/**
 * Get voice with fallback to default if invalid
 */
export function getVoiceOrDefault(voice: string | undefined, defaultVoice: OpenAIVoice): OpenAIVoice {
  if (!voice) return defaultVoice;
  return isValidVoice(voice) ? voice : defaultVoice;
}
