# Inngest Setup Guide for Background Jobs

## Overview

Inngest is a durable execution engine that allows us to run long-running audio generation tasks in the background without hitting Vercel's timeout limits.

## Why Inngest?

- ✅ Built specifically for Next.js and serverless
- ✅ Handles retries, timeouts, and error recovery automatically
- ✅ Durable execution (survives crashes and restarts)
- ✅ Real-time monitoring dashboard
- ✅ Free tier: 1,000 function runs/month
- ✅ No infrastructure to manage

## Installation

### 1. Install Inngest SDK

```bash
npm install inngest
```

### 2. Sign Up for Inngest

1. Go to [https://app.inngest.com/sign-up](https://app.inngest.com/sign-up)
2. Create an account (free tier available)
3. Create a new app for "Epoch Pod"
4. Get your Event Key and Signing Key

### 3. Add Environment Variables

Add to `.env.local` and production environment:

```bash
# Inngest Configuration
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=your_signing_key_here
```

## Project Structure

```
apps/web/
├── lib/
│   └── inngest/
│       ├── client.ts           # Inngest client setup
│       ├── index.ts             # Export all functions
│       └── functions/
│           ├── generate-interview.ts
│           ├── generate-debate.ts
│           └── generate-adventure.ts
└── app/
    └── api/
        └── inngest/
            └── route.ts         # Inngest webhook handler
```

## Implementation Steps

### Step 1: Create Inngest Client

**File**: `apps/web/lib/inngest/client.ts`

```typescript
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'epoch-pod',
  name: 'Epoch Pod',
});
```

### Step 2: Create Background Function Template

**File**: `apps/web/lib/inngest/functions/generate-interview.ts`

```typescript
import { inngest } from '../client';
import { prisma } from '@/lib/db';
import {
  generateInterviewOutline,
  generateInterviewScript,
  generateInterviewAudio,
  estimateInterviewDuration,
} from '@/lib/ai';
import { uploadAudio } from '@/lib/storage';

export const generateInterviewJob = inngest.createFunction(
  {
    id: 'generate-interview',
    name: 'Generate Interview Episode',
    retries: 1, // Retry once on failure
  },
  { event: 'episode/generate.interview' },
  async ({ event, step }) => {
    const { episodeId, guestName, topic, angle, hostVoice, guestVoice } = event.data;

    // Step 1: Update status
    await step.run('update-status-outline', async () => {
      await prisma.episode.update({
        where: { id: episodeId },
        data: {
          generationStatus: 'GENERATING_OUTLINE',
          generationProgress: 10,
          generationStartedAt: new Date(),
        },
      });
    });

    // Step 2: Generate outline
    const outline = await step.run('generate-outline', async () => {
      return await generateInterviewOutline(guestName, topic, angle);
    });

    // Step 3: Update status
    await step.run('update-status-script', async () => {
      await prisma.episode.update({
        where: { id: episodeId },
        data: {
          generationStatus: 'GENERATING_SCRIPT',
          generationProgress: 40,
        },
      });
    });

    // Step 4: Generate script
    const script = await step.run('generate-script', async () => {
      return await generateInterviewScript(outline);
    });

    // Step 5: Update status
    await step.run('update-status-audio', async () => {
      await prisma.episode.update({
        where: { id: episodeId },
        data: {
          generationStatus: 'GENERATING_AUDIO',
          generationProgress: 70,
        },
      });
    });

    // Step 6: Generate audio
    const audioBuffer = await step.run('generate-audio', async () => {
      return await generateInterviewAudio(script, guestName, hostVoice, guestVoice);
    });

    // Step 7: Upload audio
    await step.run('update-status-upload', async () => {
      await prisma.episode.update({
        where: { id: episodeId },
        data: {
          generationStatus: 'UPLOADING',
          generationProgress: 90,
        },
      });
    });

    const uploadResult = await step.run('upload-audio', async () => {
      const slug = guestName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return await uploadAudio(audioBuffer, {
        filename: `interview-${slug}-${Date.now()}.mp3`,
        contentType: 'audio/mpeg',
      });
    });

    // Step 8: Complete episode
    await step.run('complete-episode', async () => {
      // Create transcript
      const transcript = [
        `${script.intro.speaker}: ${script.intro.text}`,
        ...script.segments.map((s) => `${s.speaker}: ${s.text}`),
        `${script.outro.speaker}: ${script.outro.text}`,
      ].join('\n\n');

      await prisma.episode.update({
        where: { id: episodeId },
        data: {
          title: `Interview with ${outline.guest.name}: ${outline.topic}`,
          subtitle: outline.angle,
          description: `A fascinating conversation with ${outline.guest.name}, ${outline.guest.role}, about ${outline.topic}.`,
          topic: outline.topic,
          era: outline.guest.era,
          audioUrl: uploadResult.url,
          audioBytes: BigInt(uploadResult.bytes),
          transcript,
          duration: estimateInterviewDuration(script.totalWords),
          status: 'PUBLISHED',
          publishedAt: new Date(),
          sources: outline.sources,
          generationStatus: 'COMPLETED',
          generationProgress: 100,
          generationCompletedAt: new Date(),
          interview: {
            create: {
              hostName: 'The Epoch Host',
              hostVoice,
              guestName: outline.guest.name,
              guestRole: outline.guest.role,
              guestEra: outline.guest.era,
              guestVoice,
              topic: outline.topic,
              questions: outline.questions,
              dialogue: script.segments,
            },
          },
        },
        include: { interview: true },
      });
    });

    return { success: true, episodeId };
  }
);
```

### Step 3: Create Inngest API Route

**File**: `apps/web/app/api/inngest/route.ts`

```typescript
import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { generateInterviewJob } from '@/lib/inngest/functions/generate-interview';
import { generateDebateJob } from '@/lib/inngest/functions/generate-debate';
import { generateAdventureJob } from '@/lib/inngest/functions/generate-adventure';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateInterviewJob,
    generateDebateJob,
    generateAdventureJob,
  ],
});
```

### Step 4: Update API Routes to Trigger Jobs

**File**: `apps/web/app/api/generate/interview/route.ts`

```typescript
import { inngest } from '@/lib/inngest/client';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { guestName, topic, angle, hostVoice, guestVoice } = body;

    // Create episode record immediately
    const episode = await prisma.episode.create({
      data: {
        title: `Generating interview with ${guestName}...`,
        topic: topic || guestName,
        type: 'INTERVIEW',
        status: 'DRAFT',
        userId: session.user.id,
        generationStatus: 'PENDING',
        generationProgress: 0,
      },
    });

    // Trigger background job
    const jobId = await inngest.send({
      name: 'episode/generate.interview',
      data: {
        episodeId: episode.id,
        guestName,
        topic,
        angle,
        hostVoice: hostVoice || 'onyx',
        guestVoice: guestVoice || 'echo',
      },
    });

    // Update episode with job ID
    await prisma.episode.update({
      where: { id: episode.id },
      data: { generationJobId: jobId },
    });

    // Return immediately
    return NextResponse.json({
      success: true,
      episodeId: episode.id,
      jobId,
      message: 'Interview generation started. You will be notified when complete.',
    });
  } catch (error) {
    console.error('[Interview Generation] Error:', error);
    return NextResponse.json(
      { error: 'Failed to start interview generation' },
      { status: 500 }
    );
  }
}
```

## Testing

### Local Development

1. Run Inngest Dev Server:
   ```bash
   npx inngest-cli@latest dev
   ```

2. Start Next.js:
   ```bash
   npm run dev
   ```

3. Visit Inngest Dev UI:
   ```
   http://localhost:8288
   ```

### Trigger a Test Job

```typescript
// In your Next.js app or via API
await inngest.send({
  name: 'episode/generate.interview',
  data: {
    episodeId: 'test-123',
    guestName: 'Albert Einstein',
    topic: 'Theory of Relativity',
  },
});
```

### Monitor Execution

1. Go to [https://app.inngest.com](https://app.inngest.com)
2. Click on your app
3. View "Functions" tab to see all executions
4. Click on a specific run to see step-by-step progress

## Production Deployment

### 1. Set Environment Variables in Vercel

```bash
vercel env add INNGEST_EVENT_KEY
vercel env add INNGEST_SIGNING_KEY
```

### 2. Deploy

```bash
vercel --prod
```

### 3. Register Functions with Inngest

Inngest will automatically discover your functions at:
```
https://your-domain.com/api/inngest
```

## Error Handling

Inngest automatically handles:
- ✅ Retries (configurable)
- ✅ Timeouts
- ✅ Error logging
- ✅ Dead letter queue

To handle errors in your function:

```typescript
export const generateInterviewJob = inngest.createFunction(
  {
    id: 'generate-interview',
    retries: 1,
    onFailure: async ({ event, error }) => {
      // Update episode with error
      await prisma.episode.update({
        where: { id: event.data.episodeId },
        data: {
          generationStatus: 'FAILED',
          generationError: error.message,
        },
      });

      // Send error notification
      // await sendErrorEmail(event.data.userId, error);
    },
  },
  // ... rest of function
);
```

## Monitoring & Alerts

### Set Up Alerts in Inngest Dashboard

1. Go to Settings → Notifications
2. Configure:
   - Function failures
   - Slow executions
   - Rate limit warnings

### Track Costs

```typescript
// Log metrics after each generation
await prisma.generationMetrics.create({
  data: {
    episodeId: episode.id,
    type: 'INTERVIEW',
    gpt4TokensUsed: /* track from API response */,
    ttsCharsUsed: script.totalWords * 6, // estimate
    estimatedCost: 0.25,
    actualDuration: Date.now() - startTime,
  },
});
```

## Troubleshooting

### Job Not Starting

- Check environment variables are set
- Verify Inngest Dev Server is running (local)
- Check function is registered in `/api/inngest/route.ts`

### Job Fails Immediately

- Check function name matches event name
- Verify event data structure matches function expectations
- Review error logs in Inngest dashboard

### Timeouts

- Increase timeout in function config:
  ```typescript
  {
    id: 'generate-interview',
    timeout: '10m', // Default is 5 minutes
  }
  ```

## Cost Optimization

### Batch Audio Generation

For adventures with multiple nodes:

```typescript
// Generate in parallel batches
const BATCH_SIZE = 3;
for (let i = 0; i < nodes.length; i += BATCH_SIZE) {
  await step.run(`generate-batch-${i}`, async () => {
    const batch = nodes.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(node => generateNodeAudio(node)));
  });
}
```

## Resources

- [Inngest Documentation](https://www.inngest.com/docs)
- [Inngest Next.js Guide](https://www.inngest.com/docs/sdk/serve#framework-next-js)
- [Inngest Pricing](https://www.inngest.com/pricing)
- [Step Functions](https://www.inngest.com/docs/functions/multi-step)

## Next Steps

1. ✅ Install Inngest SDK
2. ✅ Create Inngest account and get API keys
3. ✅ Create background job functions
4. ✅ Update API routes to trigger jobs
5. ✅ Test locally with Inngest Dev Server
6. ✅ Deploy to production
7. ✅ Monitor first few generations
8. ✅ Set up alerts for failures
