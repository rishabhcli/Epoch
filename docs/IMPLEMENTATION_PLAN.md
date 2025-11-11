# Epoch Pod: Production Readiness Implementation Plan

## Executive Summary

This document outlines critical improvements needed to make Epoch Pod production-ready based on industry best practices, platform requirements, and scalability considerations.

## Critical Issues Identified

### 🚨 Priority 1: Long-Running Tasks (BLOCKING PRODUCTION)

**Problem**: Audio generation happens synchronously in API routes
- Vercel enforces **10-60 second timeouts**
- Interview generation: ~30-90 seconds (multi-segment audio)
- Debate generation: ~60-120 seconds (3 voices, 15+ segments)
- Adventure generation: ~300-600 seconds (8-12 nodes)
- **Result**: Timeouts on production, broken user experience

**Current Flow**:
```
User Request → API Route → Generate Outline → Generate Script → Generate Audio → Upload → Save DB → Return
                          ↑____________ ALL SYNCHRONOUS - WILL TIMEOUT ____________↑
```

**Required Solution**: Background job system

### 🔴 Priority 2: Audio Quality & Podcast Standards Compliance

**Problem**: No MP3 format specifications
- Apple Podcasts/Spotify require specific MP3 encoding
- Current implementation: OpenAI default (unknown bitrate/sample rate)

**Requirements**:
- **Constant Bitrate (CBR)**: 128-320 kbps for podcasts
- **Sample Rate**: 44.1 kHz (CD quality)
- **Channels**: Mono for voice, Stereo for music
- **Format**: MP3 (ISO/IEC 11172-3 MPEG-1 Part 3)

### 🟠 Priority 3: Rate Limiting & Resilience

**Problem**: No retry logic or rate limit handling
- OpenAI TTS: 50 requests/minute
- OpenAI GPT-4: 500 requests/day (tier 1)
- Multi-segment content can easily hit limits
- **Result**: Complete failure with no recovery

**Missing**:
- Exponential backoff retry logic
- Rate limit detection and queuing
- Partial failure recovery

### 🟡 Priority 4: RSS Feed Compliance

**Problem**: Missing required Apple Podcasts fields
- No podcast artwork (required: 1400x1400 - 3000x3000 px)
- Missing `<itunes:author>` field
- No `<itunes:type>` (episodic vs serial)
- `mimeType` field not guaranteed to be "audio/mpeg"

### 🟢 Priority 5: User Experience Enhancements

**Missing Features**:
- Progress tracking during generation
- Generation cost estimation
- Cancellation mechanism
- Playback position memory
- Error recovery UI

---

## Detailed Implementation Plan

## Phase 1: Critical Production Blockers (Week 1)

### 1.1 Implement Background Job System

**Options Analysis**:

| Solution | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **Vercel Cron + Prisma Queue** | Free, simple, uses existing DB | Manual implementation, max 60s per cron | ❌ Too limited |
| **Upstash QStash** | Serverless, pay-per-use, built for Vercel | Additional service, cost per request | ✅ **RECOMMENDED** |
| **Inngest** | Built for Next.js, great DX, durable execution | Paid after free tier (1000 steps/mo) | ✅ **RECOMMENDED** |
| **BullMQ + Redis** | Industry standard, full featured | Requires Redis hosting, more complex | ⚠️ Overkill for now |

**Recommended**: **Inngest**
- Built specifically for Next.js background jobs
- Handles retries, timeouts, monitoring automatically
- Durable execution (survives crashes)
- Free tier: 1,000 function runs/month
- Perfect for audio generation use case

**Implementation Steps**:

```bash
# 1. Install Inngest
npm install inngest

# 2. Create Inngest client
# apps/web/lib/inngest/client.ts

# 3. Create background functions
# apps/web/lib/inngest/functions/generate-interview.ts
# apps/web/lib/inngest/functions/generate-debate.ts
# apps/web/lib/inngest/functions/generate-adventure.ts

# 4. Add Inngest serve API route
# apps/web/app/api/inngest/route.ts

# 5. Update generation routes to trigger jobs instead of running inline
```

**New Flow**:
```
User Request → API Route → Trigger Background Job → Return job ID
                                    ↓
                          Background Worker → Generate → Upload → Save DB → Notify User
```

**Files to Create**:
- `apps/web/lib/inngest/client.ts` - Inngest client configuration
- `apps/web/lib/inngest/functions/generate-interview.ts` - Interview background job
- `apps/web/lib/inngest/functions/generate-debate.ts` - Debate background job
- `apps/web/lib/inngest/functions/generate-adventure.ts` - Adventure background job
- `apps/web/app/api/inngest/route.ts` - Inngest webhook handler

**Files to Modify**:
- `apps/web/app/api/generate/interview/route.ts` - Change to trigger job
- `apps/web/app/api/generate/debate/route.ts` - Change to trigger job
- `apps/web/app/api/generate/adventure/route.ts` - Change to trigger job

**Database Changes**:
```prisma
// Add job tracking to Episode model
model Episode {
  // ... existing fields
  generationStatus  GenerationStatus @default(PENDING)
  generationJobId   String?
  generationError   String?
  generationProgress Int @default(0) // 0-100
}

enum GenerationStatus {
  PENDING
  GENERATING_OUTLINE
  GENERATING_SCRIPT
  GENERATING_AUDIO
  UPLOADING
  COMPLETED
  FAILED
}
```

### 1.2 Add Rate Limiting & Retry Logic

**Implementation**:

```typescript
// apps/web/lib/ai/retry.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      // Check if it's a rate limit error
      if (error.status === 429 || error.code === 'rate_limit_exceeded') {
        if (attempt === maxRetries - 1) throw error;

        const delay = initialDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`Rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; // Non-rate-limit error, fail immediately
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

**Usage**:
```typescript
// Wrap all OpenAI calls
const outline = await retryWithBackoff(() =>
  generateInterviewOutline(guestName, topic, angle)
);

const audio = await retryWithBackoff(() =>
  openai.audio.speech.create({...}),
  5,  // More retries for audio (expensive operation)
  2000 // Start with 2s delay
);
```

**Files to Create**:
- `apps/web/lib/ai/retry.ts` - Retry utility with exponential backoff

**Files to Modify**:
- `apps/web/lib/ai/interview-generator.ts` - Wrap API calls with retry
- `apps/web/lib/ai/debate-generator.ts` - Wrap API calls with retry
- `apps/web/lib/ai/adventure-generator.ts` - Wrap API calls with retry

### 1.3 Fix Audio Quality & MP3 Specifications

**Problem**: OpenAI TTS returns audio but we don't control format specifics

**Solution**: Use ffmpeg to ensure proper MP3 encoding

```bash
npm install fluent-ffmpeg @types/fluent-ffmpeg
```

```typescript
// apps/web/lib/audio/encoder.ts
import ffmpeg from 'fluent-ffmpeg';

export async function ensurePodcastMP3(
  inputBuffer: Buffer,
  options: {
    bitrate?: string;  // '128k', '192k', '320k'
    sampleRate?: number; // 44100 (CD quality)
    channels?: number;   // 1 (mono) or 2 (stereo)
  } = {}
): Promise<Buffer> {
  const {
    bitrate = '128k',    // Good for spoken word
    sampleRate = 44100,  // CD quality (required by podcasts)
    channels = 1,        // Mono for voice content
  } = options;

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    ffmpeg(inputBuffer)
      .audioCodec('libmp3lame')       // MP3 encoder
      .audioBitrate(bitrate)           // Constant bitrate
      .audioFrequency(sampleRate)      // Sample rate
      .audioChannels(channels)         // Mono/stereo
      .format('mp3')                   // Output format
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe()
      .on('data', (chunk) => chunks.push(chunk));
  });
}
```

**Integration**:
```typescript
// In interview-generator.ts
const rawAudio = await generateInterviewAudio(script, guestName);
const podcastMP3 = await ensurePodcastMP3(rawAudio, {
  bitrate: '128k',   // Spoken word quality
  sampleRate: 44100, // Required by Apple/Spotify
  channels: 1,       // Mono for interviews
});
```

**Files to Create**:
- `apps/web/lib/audio/encoder.ts` - MP3 encoding with ffmpeg

**Files to Modify**:
- All generation functions to encode after TTS

**Deployment Note**: ffmpeg must be available in production environment
- Vercel: Requires ffmpeg layer or use @vercel/ffmpeg package
- Alternative: Use AWS Lambda Layer with ffmpeg

---

## Phase 2: RSS Feed & Discovery (Week 2)

### 2.1 Fix RSS Feed Compliance

**Required Changes**:

```typescript
// apps/web/lib/podcast/rss-builder.ts

// Add required fields
export interface RSSFeedOptions {
  show: Show;
  episodes: Episode[];
  feedUrl: string;
  websiteUrl: string;
  imageUrl: string;  // NEW: Required podcast artwork
}

// Update RSS generation
<itunes:type>${show.type || 'episodic'}</itunes:type>
<itunes:image href="${escapeXml(imageUrl)}"/>  <!-- Must be 1400x1400 to 3000x3000 -->
<itunes:author>${escapeXml(show.author || show.ownerName)}</itunes:author>
<itunes:episodeType>${episode.type || 'full'}</itunes:episodeType>

// Ensure proper MIME type
<enclosure
  url="${escapeXml(episode.audioUrl)}"
  length="${episode.audioBytes?.toString() || "0"}"
  type="audio/mpeg"/>  <!-- Always audio/mpeg, never audio/mp3 -->
```

**Database Updates**:
```prisma
model Show {
  // ... existing fields
  imageUrl     String?   // Podcast artwork URL
  author       String?   // Show author (different from owner)
  type         String    @default("episodic") // "episodic" or "serial"
}

model Episode {
  // ... existing fields
  mimeType     String    @default("audio/mpeg") // Always audio/mpeg
  episodeType  String    @default("full")       // "full", "trailer", "bonus"
}
```

**Podcast Artwork Requirements**:
- Dimensions: 1400x1400 to 3000x3000 pixels (square)
- Format: JPG or PNG
- Color space: RGB
- File size: Max 512KB (recommended)

### 2.2 Add Podcast Discovery Metadata

**Schema.org Podcast Markup** (for Google Podcasts):

```typescript
// apps/web/lib/utils/json-ld.ts - ENHANCE

export function generatePodcastEpisodeJsonLd(episode: Episode, show: Show) {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    "url": `${process.env.NEXT_PUBLIC_APP_URL}/episodes/${episode.id}`,
    "name": episode.title,
    "description": episode.description,
    "datePublished": episode.publishedAt?.toISOString(),
    "timeRequired": `PT${episode.duration}S`, // ISO 8601 duration
    "associatedMedia": {
      "@type": "MediaObject",
      "contentUrl": episode.audioUrl,
      "encodingFormat": "audio/mpeg",
      "duration": `PT${episode.duration}S`
    },
    "partOfSeries": {
      "@type": "PodcastSeries",
      "name": show.title,
      "url": process.env.NEXT_PUBLIC_APP_URL
    }
  };
}
```

---

## Phase 3: User Experience (Week 3)

### 3.1 Add Progress Tracking

**Real-time Progress Updates via Server-Sent Events (SSE)**:

```typescript
// apps/web/app/api/generate/interview/status/route.ts
export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get('jobId');

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Poll for job status
      const interval = setInterval(async () => {
        const episode = await prisma.episode.findFirst({
          where: { generationJobId: jobId },
          select: { generationStatus, generationProgress, generationError }
        });

        if (episode) {
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify(episode)}\n\n`
          ));

          if (episode.generationStatus === 'COMPLETED' || episode.generationStatus === 'FAILED') {
            clearInterval(interval);
            controller.close();
          }
        }
      }, 1000);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

**Client Component**:
```typescript
// apps/web/components/generation/progress-tracker.tsx
'use client';

export function ProgressTracker({ jobId }: { jobId: string }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('PENDING');

  useEffect(() => {
    const eventSource = new EventSource(`/api/generate/interview/status?jobId=${jobId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.generationProgress);
      setStatus(data.generationStatus);
    };

    return () => eventSource.close();
  }, [jobId]);

  return (
    <div className="space-y-4">
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-600">{getStatusMessage(status)}</p>
    </div>
  );
}
```

### 3.2 Cost Estimation

**Before generation, show estimated cost**:

```typescript
// apps/web/lib/ai/cost-estimator.ts
export interface GenerationCostEstimate {
  gpt4Tokens: number;
  gpt4Cost: number;     // $0.01 per 1K tokens (input) + $0.03 per 1K (output)
  ttsCharacters: number;
  ttsCost: number;       // $15 per 1M characters (tts-1-hd)
  totalCost: number;
}

export function estimateInterviewCost(
  guestName: string,
  topic?: string
): GenerationCostEstimate {
  // Estimate based on historical averages
  const avgOutlineTokens = 2000;  // ~500 input, ~1500 output
  const avgScriptTokens = 5000;   // ~2000 input, ~3000 output
  const avgAudioCharacters = 12000; // ~10 min interview

  const gpt4Cost =
    (avgOutlineTokens * 0.01 / 1000) +
    (avgScriptTokens * 0.03 / 1000);
  const ttsCost = avgAudioCharacters * 15 / 1000000;

  return {
    gpt4Tokens: avgOutlineTokens + avgScriptTokens,
    gpt4Cost,
    ttsCharacters: avgAudioCharacters,
    ttsCost,
    totalCost: gpt4Cost + ttsCost
  };
}
```

### 3.3 Audio Player Enhancements

**Add Chapter Markers** (Podcasting 2.0):

```typescript
// apps/web/lib/podcast/chapters.ts
export interface Chapter {
  startTime: number; // seconds
  title: string;
  img?: string;      // Optional chapter artwork
  url?: string;      // Optional chapter link
}

export function generateInterviewChapters(script: InterviewScript): Chapter[] {
  return [
    { startTime: 0, title: 'Introduction' },
    ...script.segments.map((seg, i) => ({
      startTime: estimateSegmentStartTime(script, i),
      title: extractQuestionFromSegment(seg)
    })),
    { startTime: estimateOutroStartTime(script), title: 'Closing Thoughts' }
  ];
}
```

**RSS Feed Integration**:
```xml
<podcast:chapters
  url="https://epoch.fm/episodes/123/chapters.json"
  type="application/json+chapters"/>
```

**Player UI**:
- Show current chapter in player
- Click chapter to jump to timestamp
- Highlight current chapter in list

---

## Phase 4: Performance & Scalability (Week 4)

### 4.1 Audio Caching Strategy

**Problem**: Re-generating same episodes wastes money

**Solution**: Content-based caching

```typescript
// apps/web/lib/cache/audio-cache.ts
import crypto from 'crypto';

export function generateAudioCacheKey(
  type: 'interview' | 'debate' | 'adventure',
  params: Record<string, any>
): string {
  // Create deterministic hash from parameters
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {});

  return crypto
    .createHash('sha256')
    .update(JSON.stringify({ type, ...sortedParams }))
    .digest('hex');
}

// Check if audio already exists
const cacheKey = generateAudioCacheKey('interview', {
  guestName: 'Albert Einstein',
  topic: 'Theory of Relativity',
  hostVoice: 'onyx',
  guestVoice: 'fable'
});

const cached = await prisma.audioCache.findUnique({
  where: { cacheKey }
});

if (cached) {
  // Reuse existing audio!
  return cached.audioUrl;
}
```

### 4.2 Batch Generation Optimization

**For Adventures** (8-12 nodes):

Instead of:
```typescript
for (const node of nodes) {
  await generateNodeAudio(node); // Sequential: 8-12 min
}
```

Do:
```typescript
// Generate in parallel batches (respect rate limits)
const BATCH_SIZE = 3; // 3 concurrent requests
for (let i = 0; i < nodes.length; i += BATCH_SIZE) {
  const batch = nodes.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(node => generateNodeAudio(node)));
}
// Completion time: 3-4 min (3x faster)
```

### 4.3 Database Indexing

```prisma
model Episode {
  // ... existing fields

  @@index([status, publishedAt])
  @@index([userId, createdAt])
  @@index([type, status])
  @@index([generationJobId]) // For job lookups
}
```

---

## Phase 5: Monitoring & Observability (Week 5)

### 5.1 Add Error Tracking

**Sentry Integration**:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.server.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Enrich with generation context
    if (event.tags?.jobId) {
      event.contexts = {
        ...event.contexts,
        generation: {
          jobId: event.tags.jobId,
          type: event.tags.type
        }
      };
    }
    return event;
  }
});
```

### 5.2 Cost Tracking

```prisma
model GenerationMetrics {
  id              String   @id @default(cuid())
  episodeId       String
  type            String   // INTERVIEW, DEBATE, ADVENTURE
  gpt4TokensUsed  Int
  ttsCharsUsed    Int
  estimatedCost   Float
  actualDuration  Int      // seconds to generate
  createdAt       DateTime @default(now())

  episode         Episode  @relation(fields: [episodeId], references: [id])
}
```

**Admin Dashboard**:
- Total monthly AI spend
- Cost per episode type
- Most expensive generations
- Rate limit incidents

---

## Testing Checklist

### Before Production Deployment:

- [ ] Test interview generation with 15+ segment script (stress test)
- [ ] Test debate generation with 25+ exchanges
- [ ] Test adventure generation (full 12-node tree)
- [ ] Test OpenAI rate limit handling (simulate 429 errors)
- [ ] Validate RSS feed with [Cast Feed Validator](https://castfeedvalidator.com/)
- [ ] Submit RSS feed to Apple Podcasts Connect
- [ ] Test audio playback on:
  - [ ] iOS Podcasts app
  - [ ] Spotify
  - [ ] Overcast
  - [ ] Pocket Casts
  - [ ] Apple Podcasts (web)
- [ ] Load test: 10 concurrent generations
- [ ] Verify MP3 format with `ffprobe`:
  ```bash
  ffprobe -show_format -show_streams episode.mp3
  # Verify: codec=mp3, sample_rate=44100, bit_rate=128000
  ```

---

## Deployment Strategy

### Environment Variables Required:

```bash
# .env.production
OPENAI_API_KEY=sk-...
BLOB_READ_WRITE_TOKEN=vercel_blob_...
DATABASE_URL=postgresql://...

# NEW:
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...

# Optional:
UPSTASH_REDIS_URL=...  # For caching
FFMPEG_PATH=/opt/bin/ffmpeg  # If using Lambda layer
```

### Deployment Steps:

1. **Deploy Background Workers**:
   ```bash
   # Inngest automatically deploys with Vercel
   # Register functions at: https://app.inngest.com
   ```

2. **Database Migration**:
   ```bash
   cd apps/web
   npx prisma migrate deploy
   npx prisma generate
   ```

3. **Vercel Deployment**:
   ```bash
   # Ensure ffmpeg is available
   # Option 1: Use @vercel/ffmpeg (easier)
   # Option 2: Use Lambda layer

   vercel --prod
   ```

4. **Post-Deployment Verification**:
   - Test one generation of each type
   - Verify job execution in Inngest dashboard
   - Check Sentry for errors
   - Validate RSS feed

---

## Cost Projections

### Per-Episode Cost Estimates:

| Format | GPT-4 Tokens | TTS Characters | Cost per Episode |
|--------|--------------|----------------|------------------|
| Narrative | 7,000 | 2,500 | $0.10 |
| Interview | 8,000 | 12,000 | $0.25 |
| Debate | 10,000 | 18,000 | $0.38 |
| Adventure (per node) | 5,000 | 3,000 | $0.08 |
| Adventure (full) | 60,000 | 36,000 | $0.96 |

### Monthly Projections (100 users, 2 episodes/week):

- Total episodes/month: ~800
- Assuming mix: 40% interviews, 30% narratives, 20% debates, 10% adventures
- **Estimated monthly AI cost: $250-350**

### Infrastructure Costs:

- Vercel Pro: $20/mo (required for longer function timeouts)
- Inngest: Free tier (1,000 runs/mo), then $20/mo for 10K runs
- Upstash Redis (optional): $0.20/100K commands
- **Total infrastructure: $40-60/mo**

---

## Success Metrics

### After Implementation:

1. **Reliability**:
   - [ ] 99%+ generation success rate
   - [ ] 0 timeout errors on production
   - [ ] <5% rate limit incidents

2. **Performance**:
   - [ ] User receives job ID in <2s
   - [ ] Email notification sent within 5 min of completion
   - [ ] RSS feed loads in <500ms

3. **Quality**:
   - [ ] All episodes pass Apple Podcasts validation
   - [ ] Audio plays successfully on 95%+ of podcast apps
   - [ ] MP3 files verified with ffprobe

4. **Cost Efficiency**:
   - [ ] Average cost per episode within projections
   - [ ] <10% wasted generations (caching works)
   - [ ] Monthly AI spend within budget

---

## Future Enhancements (Post-MVP)

1. **Advanced Features**:
   - AI-generated chapter markers (analyze script for topics)
   - Dynamic music and sound effects
   - Multiple language support
   - Voice cloning for specific historical figures (ElevenLabs)

2. **Scalability**:
   - CDN for audio delivery (Cloudflare R2)
   - Distributed job processing (multiple regions)
   - Pre-generation for popular topics

3. **Monetization**:
   - Premium voices (ElevenLabs)
   - Longer episodes
   - Priority generation queue
   - Custom branding

---

## References

- [Apple Podcasts RSS Requirements](https://podcasters.apple.com/support/823-podcast-requirements)
- [Podcasting 2.0 Namespace](https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/1.0.md)
- [OpenAI TTS Documentation](https://platform.openai.com/docs/guides/text-to-speech)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Vercel Function Limits](https://vercel.com/docs/functions/serverless-functions/runtimes#max-duration)
- [MP3 Encoding Standards](https://en.wikipedia.org/wiki/MP3)

---

**Document Version**: 1.0
**Last Updated**: 2025-01-11
**Author**: Claude (Sonnet 4.5)
**Status**: Ready for Implementation
