# Epoch Pod API Documentation

Complete API reference for generating multi-format historical podcast content.

## Table of Contents

- [Voice Configuration](#voice-configuration)
- [Interview Generation](#interview-generation)
- [Debate Generation](#debate-generation)
- [Adventure Generation](#adventure-generation)
- [Narrative Podcast Generation](#narrative-podcast-generation)
- [Error Handling](#error-handling)

---

## Voice Configuration

### Available Voices

Epoch Pod uses OpenAI's Text-to-Speech API with 6 distinct voices:

| Voice | Character | Best For |
|-------|-----------|----------|
| `alloy` | Neutral, balanced | General narration, moderators |
| `echo` | Warm, upbeat | Friendly hosts, conversational content |
| `fable` | Articulate, clear | Formal content, educated speakers |
| `onyx` | Smooth, deep | Authoritative narration, male figures |
| `nova` | Expressive | Dramatic content, female figures |
| `shimmer` | Warm, engaging | Storytelling, female figures |

### Voice Presets

Pre-configured voice setups for each episode format:

```typescript
import { VOICE_PRESETS } from '@/lib/ai';

// Narrative Podcasts
VOICE_PRESETS.narrative = {
  narrator: 'onyx',
  speed: 1.0
}

// Interviews
VOICE_PRESETS.interview = {
  host: 'onyx',
  guest: 'echo',
  hostSpeed: 1.0,
  guestSpeed: 0.95
}

// Debates
VOICE_PRESETS.debate = {
  moderator: 'alloy',
  position1: 'fable',
  position2: 'nova',
  moderatorSpeed: 1.0,
  debaterSpeed: 0.98
}

// Adventures
VOICE_PRESETS.adventure = {
  narrator: 'shimmer',
  speed: 0.95
}
```

### Guest Voice Overrides

Specific historical figures are automatically assigned appropriate voices:

```typescript
import { getGuestVoice } from '@/lib/ai';

// Automatically selects 'fable' for Einstein
const voice = getGuestVoice('Albert Einstein');

// Automatically selects 'shimmer' for Cleopatra
const voice = getGuestVoice('Cleopatra VII');
```

---

## Interview Generation

### Generate Interview Outline

Creates a researched interview plan with questions and context.

**Function:** `generateInterviewOutline(guestName, topic?, angle?)`

**Parameters:**
- `guestName` (string, required): Name of the historical figure
- `topic` (string, optional): Specific topic to focus on
- `angle` (string, optional): Specific angle or perspective

**Returns:** `Promise<InterviewOutline>`

**Example:**
```typescript
import { generateInterviewOutline } from '@/lib/ai';

const outline = await generateInterviewOutline(
  'Albert Einstein',
  'Theory of Relativity',
  'Making complex physics accessible to general audiences'
);

// Result includes:
// - guest.name, role, era, biography
// - guest.majorAccomplishments
// - guest.historicalContext
// - questions[] (8-12 insightful questions)
// - sources[] (3+ credible historical sources)
```

### Generate Interview Script

Converts outline into natural dialogue between host and guest.

**Function:** `generateInterviewScript(outline)`

**Parameters:**
- `outline` (InterviewOutline, required): Generated interview outline

**Returns:** `Promise<InterviewScript>`

**Example:**
```typescript
import { generateInterviewScript } from '@/lib/ai';

const script = await generateInterviewScript(outline);

// Result includes:
// - intro (HOST welcome)
// - segments[] (20-60 dialogue exchanges)
// - outro (HOST closing)
// - totalWords (estimated word count)
// - estimatedDuration (in seconds)
```

### Generate Interview Audio

Creates multi-voice audio file from script.

**Function:** `generateInterviewAudio(script, guestName?, hostVoice?, guestVoice?)`

**Parameters:**
- `script` (InterviewScript, required): Generated interview script
- `guestName` (string, optional): Guest name for smart voice selection
- `hostVoice` (string, optional): Override host voice (default: 'onyx')
- `guestVoice` (string, optional): Override guest voice (default: auto-selected)

**Returns:** `Promise<Buffer>`

**Example:**
```typescript
import { generateInterviewAudio } from '@/lib/ai';

// Auto-select voice based on guest name
const audio = await generateInterviewAudio(script, 'Albert Einstein');

// Or manually specify voices
const audio = await generateInterviewAudio(
  script,
  'Albert Einstein',
  'onyx',  // host
  'fable'  // guest
);

// Upload to storage
const result = await put(`interviews/${slug}.mp3`, audio, {
  access: 'public',
  contentType: 'audio/mpeg',
});
```

---

## Debate Generation

### Generate Debate Outline

Creates a balanced debate with two opposing positions.

**Function:** `generateDebateOutline(topic, question, historicalContext)`

**Parameters:**
- `topic` (string, required): The debate topic
- `question` (string, required): The central question being debated
- `historicalContext` (string, required): Historical background and context

**Returns:** `Promise<DebateOutline>`

**Example:**
```typescript
import { generateDebateOutline } from '@/lib/ai';

const outline = await generateDebateOutline(
  'Napoleon Bonaparte',
  'Was Napoleon a tyrant who betrayed the Revolution, or a reformer who modernized Europe?',
  'Post-Revolutionary France, 1799-1815'
);

// Result includes:
// - topic, question
// - position1 (title + arguments)
// - position2 (title + arguments)
// - moderatorNotes
// - sources[]
```

### Generate Debate Script

Converts outline into structured three-voice debate.

**Function:** `generateDebateScript(outline)`

**Parameters:**
- `outline` (DebateOutline, required): Generated debate outline

**Returns:** `Promise<DebateScript>`

**Example:**
```typescript
import { generateDebateScript } from '@/lib/ai';

const script = await generateDebateScript(outline);

// Result includes:
// - intro (MODERATOR opens debate)
// - position1Opening (DEBATER1 opening statement)
// - position2Opening (DEBATER2 opening statement)
// - rebuttals[] (back-and-forth exchanges)
// - closingStatements (final arguments)
// - outro (MODERATOR closes)
```

### Generate Debate Audio

Creates three-voice audio file from debate script.

**Function:** `generateDebateAudio(script, moderatorVoice?, voice1?, voice2?)`

**Parameters:**
- `script` (DebateScript, required): Generated debate script
- `moderatorVoice` (string, optional): Moderator voice (default: 'alloy')
- `voice1` (string, optional): Position 1 voice (default: 'fable')
- `voice2` (string, optional): Position 2 voice (default: 'nova')

**Returns:** `Promise<Buffer>`

**Example:**
```typescript
import { generateDebateAudio } from '@/lib/ai';

// Use default voice presets
const audio = await generateDebateAudio(script);

// Or customize voices
const audio = await generateDebateAudio(
  script,
  'alloy',   // moderator
  'onyx',    // position 1 (tyrant argument)
  'shimmer'  // position 2 (reformer argument)
);
```

---

## Adventure Generation

### Generate Adventure Outline

Creates a branching narrative tree with multiple paths and endings.

**Function:** `generateAdventureOutline(concept, historicalContext)`

**Parameters:**
- `concept` (string, required): The adventure concept
- `historicalContext` (string, required): Historical setting and period

**Returns:** `Promise<AdventureOutline>`

**Example:**
```typescript
import { generateAdventureOutline } from '@/lib/ai';

const outline = await generateAdventureOutline(
  'A Roman Senator during the Ides of March',
  'Rome, March 44 BCE - The conspiracy against Julius Caesar'
);

// Result includes:
// - title, description, era
// - nodes[] (8-12 interconnected episodes)
// - Each node has:
//   - id, title, description, nodeType
//   - choices[] (for DECISION nodes)
//   - endingType (for ENDING nodes)
```

### Validate Adventure Structure

Ensures the branching narrative is logically sound.

**Function:** `validateAdventureStructure(outline)`

**Parameters:**
- `outline` (AdventureOutline, required): Generated adventure outline

**Returns:** `{ valid: boolean; errors: string[] }`

**Example:**
```typescript
import { validateAdventureStructure } from '@/lib/ai';

const validation = validateAdventureStructure(outline);

if (!validation.valid) {
  console.error('Invalid adventure structure:', validation.errors);
  // Example errors:
  // - "Must have exactly 1 START node"
  // - "Node 'node-3' is unreachable from START"
  // - "DECISION node must have at least 1 choice"
}
```

### Generate Node Script

Creates narration script for a single adventure episode.

**Function:** `generateNodeScript(node, adventureContext, pathHistory)`

**Parameters:**
- `node` (AdventureNode, required): The specific node to generate
- `adventureContext` (object, required): Overall adventure context
- `pathHistory` (string[], required): Choices made to reach this node

**Returns:** `Promise<NodeScript>`

**Example:**
```typescript
import { generateNodeScript } from '@/lib/ai';

const script = await generateNodeScript(
  node,
  {
    title: 'The Roman Senator\'s Dilemma',
    era: 'Rome, 44 BCE',
    mainCharacter: 'You, a Roman Senator'
  },
  ['Listened to Cassius', 'Joined the conspiracy']
);

// Result includes:
// - narration (second-person story text)
// - totalWords
// - estimatedDuration
```

### Generate Node Audio

Creates narration audio for an adventure episode.

**Function:** `generateNodeAudio(script, narratorVoice?)`

**Parameters:**
- `script` (NodeScript, required): Generated node script
- `narratorVoice` (string, optional): Narrator voice (default: 'shimmer')

**Returns:** `Promise<Buffer>`

**Example:**
```typescript
import { generateNodeAudio } from '@/lib/ai';

const audio = await generateNodeAudio(script, 'shimmer');
```

---

## Narrative Podcast Generation

### Generate Outline

Creates a 5-act narrative structure with historical research.

**Function:** `generateOutline(topic, era?, angle?)`

**Parameters:**
- `topic` (string, required): The historical topic
- `era` (string, optional): Historical time period
- `angle` (string, optional): Specific perspective or angle

**Returns:** `Promise<Outline>`

**Example:**
```typescript
import { generateOutline } from '@/lib/ai';

const outline = await generateOutline(
  'The Library of Alexandria',
  'Ancient Egypt, 3rd century BCE - 3rd century CE',
  'Focus on the loss of knowledge'
);

// Result includes:
// - topic, era, angle
// - acts[] (5 narrative acts)
// - sources[] (historical sources)
// - keywords[]
```

### Generate Script

Expands outline into full narration.

**Function:** `generateScript(outline)`

**Parameters:**
- `outline` (Outline, required): Generated outline

**Returns:** `Promise<Script>`

**Example:**
```typescript
import { generateScript } from '@/lib/ai';

const script = await generateScript(outline);

// Result includes:
// - narration (1,200-1,800 words)
// - wordCount
// - estimatedDuration
```

### Generate Audio

Creates single-voice narration audio.

**Function:** `generateAudio(script, voice?)`

**Parameters:**
- `script` (Script, required): Generated script
- `voice` (string, optional): Narrator voice (default: 'onyx')

**Returns:** `Promise<Buffer>`

**Example:**
```typescript
import { generateAudio } from '@/lib/ai';

const audio = await generateAudio(script, 'onyx');
```

---

## Error Handling

All generation functions include comprehensive error handling:

```typescript
import { generateInterviewOutline } from '@/lib/ai';

try {
  const outline = await generateInterviewOutline('Albert Einstein');
} catch (error) {
  if (error instanceof Error) {
    // Errors include helpful context
    console.error('Generation failed:', error.message);
    // Example: "Failed to generate interview audio: Invalid voice 'invalid-voice'"
  }
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `OPENAI_API_KEY environment variable is not set` | Missing API key | Set `OPENAI_API_KEY` in `.env.local` |
| `Failed to parse ... from OpenAI response` | Invalid structured output | Check Zod schema compatibility |
| `Invalid voice 'xyz'` | Invalid voice name | Use one of: alloy, echo, fable, onyx, nova, shimmer |
| `Rate limit exceeded` | Too many API calls | Implement exponential backoff retry logic |

---

## Complete Example: Generate an Interview

```typescript
import {
  generateInterviewOutline,
  generateInterviewScript,
  generateInterviewAudio,
  estimateInterviewDuration,
} from '@/lib/ai';
import { put } from '@vercel/blob';

async function createInterview(guestName: string, topic: string) {
  // Step 1: Generate outline with research
  console.log('Researching guest and generating outline...');
  const outline = await generateInterviewOutline(guestName, topic);

  // Step 2: Convert to dialogue script
  console.log('Creating interview dialogue...');
  const script = await generateInterviewScript(outline);

  // Step 3: Generate multi-voice audio
  console.log('Generating audio with multiple voices...');
  const audioBuffer = await generateInterviewAudio(script, guestName);

  // Step 4: Upload to storage
  console.log('Uploading audio...');
  const blob = await put(`interviews/${Date.now()}.mp3`, audioBuffer, {
    access: 'public',
    contentType: 'audio/mpeg',
  });

  // Step 5: Save to database
  const episode = await prisma.episode.create({
    data: {
      title: `Interview with ${outline.guest.name}`,
      subtitle: outline.topic,
      description: outline.guest.biography,
      topic: outline.topic,
      era: outline.guest.era,
      type: 'INTERVIEW',
      status: 'PUBLISHED',
      audioUrl: blob.url,
      duration: estimateInterviewDuration(script.totalWords),
      outline: outline as any,
      script: script as any,
      sources: outline.sources,
      interview: {
        create: {
          hostName: 'The Epoch Host',
          hostVoice: 'onyx',
          guestName: outline.guest.name,
          guestRole: outline.guest.role,
          guestEra: outline.guest.era,
          guestVoice: getGuestVoice(outline.guest.name),
          topic: outline.topic,
          questions: outline.questions,
          dialogue: script as any,
        },
      },
    },
  });

  console.log(`✅ Interview created: ${episode.id}`);
  return episode;
}

// Usage
await createInterview('Cleopatra VII', 'Ancient Egyptian Politics');
```

---

## Rate Limiting & Best Practices

### OpenAI Rate Limits

- **GPT-4 Turbo**: 500 requests/day (tier 1), 10,000 requests/day (tier 5)
- **TTS**: 50 requests/minute

### Best Practices

1. **Cache outlines and scripts** in database before generating audio
2. **Generate audio in batches** for adventures (8-12 nodes)
3. **Use `audioDev` model** (`tts-1`) for development/testing
4. **Implement retry logic** with exponential backoff for rate limits
5. **Monitor usage** via OpenAI dashboard

### Example Retry Logic

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const audio = await retryWithBackoff(() =>
  generateInterviewAudio(script, 'Einstein')
);
```

---

## Additional Resources

- [OpenAI TTS Documentation](https://platform.openai.com/docs/guides/text-to-speech)
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Questions?** Check the [README](../README.md) or create an issue on GitHub.
