# CLAUDE.md - AI Assistant Guide for Epoch Pod

**Last Updated:** 2025-11-13
**Project Version:** 0.1.0

This document provides comprehensive guidance for AI assistants working on the Epoch Pod codebase. It covers architecture, conventions, workflows, and best practices specific to this project.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Codebase Architecture](#codebase-architecture)
3. [Key Conventions & Patterns](#key-conventions--patterns)
4. [Development Workflows](#development-workflows)
5. [Database Schema Overview](#database-schema-overview)
6. [AI Generation Pipeline](#ai-generation-pipeline)
7. [Testing & Quality Standards](#testing--quality-standards)
8. [Common Tasks & How-Tos](#common-tasks--how-tos)
9. [Important Files Reference](#important-files-reference)
10. [Security Considerations](#security-considerations)
11. [Environment & Configuration](#environment--configuration)

---

## Project Overview

### What is Epoch Pod?

Epoch Pod is an **AI-powered historical storytelling platform** that generates personalized podcast content in multiple immersive formats. It uses OpenAI's GPT-4 and TTS APIs to create:

- **Narrative Podcasts**: Traditional 5-act storytelling with citations
- **Historical Interviews**: AI-powered conversations with historical figures
- **Interactive Debates**: Two-sided arguments with real-time voting
- **Choose Your Own Adventure**: Branching narrative journeys

### Core Features

- Multi-voice audio generation (2-3 voices per episode)
- Zod-validated structured outputs for consistency
- Email delivery with RFC 8058 one-click unsubscribe
- RSS feeds compatible with Apple Podcasts and Podcasting 2.0
- Interactive voting and journey tracking
- SEO optimization with JSON-LD and dynamic OG images

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Auth.js (NextAuth v5)
- **Email**: Resend + React Email
- **Storage**: Vercel Blob
- **AI**: OpenAI (GPT-4 + TTS)
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript + Zod

---

## Codebase Architecture

### Monorepo Structure

```
Epoch/
├── apps/
│   └── web/                    # Main Next.js application
│       ├── app/                # Next.js App Router
│       │   ├── (marketing)/    # Public pages (no auth)
│       │   ├── dashboard/      # Protected user dashboard
│       │   ├── episodes/       # Episode listing and detail pages
│       │   ├── adventures/     # Adventure catalog and detail
│       │   ├── auth/           # Authentication pages
│       │   └── api/            # API routes
│       │       ├── generate/   # AI generation endpoints
│       │       ├── rss/        # RSS feed generation
│       │       ├── webhooks/   # Email webhooks
│       │       ├── debates/    # Debate voting APIs
│       │       └── adventures/ # Adventure journey APIs
│       ├── components/         # React components
│       │   ├── audio/          # Audio players
│       │   ├── interview/      # Interview-specific components
│       │   ├── debate/         # Debate-specific components
│       │   └── adventure/      # Adventure-specific components
│       ├── lib/                # Core libraries
│       │   ├── ai/             # AI generation logic
│       │   ├── tts/            # Text-to-speech adapters
│       │   ├── email/          # Email service
│       │   ├── podcast/        # RSS feed builders
│       │   ├── storage/        # Blob storage
│       │   └── db/             # Database utilities
│       ├── emails/             # React Email templates
│       ├── middleware.ts       # Auth + Security headers
│       ├── auth.config.ts      # NextAuth configuration
│       └── tailwind.config.ts  # Tailwind configuration
│
├── packages/
│   ├── schema/                 # Zod schemas for AI outputs
│   │   └── src/
│   │       ├── outline.ts      # Narrative outline schema
│   │       ├── script.ts       # Script schemas
│   │       ├── interview.ts    # Interview schemas
│   │       ├── debate.ts       # Debate schemas
│   │       └── adventure.ts    # Adventure schemas
│   └── agent/                  # AI agent toolkit (optional)
│
├── prisma/
│   ├── schema.prisma           # Database schema (16 models)
│   ├── migrations/             # Database migrations
│   ├── seed.ts                 # Sample data seeder
│   └── README.md               # Database documentation
│
├── scripts/
│   ├── setup-dev.sh            # Linux/macOS setup script
│   └── setup-dev.bat           # Windows setup script
│
└── docs/
    ├── API.md                  # Complete API documentation
    ├── DATABASE_MIGRATION.md   # Migration guide
    └── IMPLEMENTATION_PLAN.md  # Development roadmap
```

### Next.js App Router Structure

The app uses Next.js 15's App Router with the following conventions:

- **(marketing)/** - Route group for public pages (no auth required)
- **dashboard/** - Protected routes requiring authentication
- **api/** - API routes (Next.js Route Handlers)
- **[id]/** - Dynamic routes
- **layout.tsx** - Shared layouts
- **page.tsx** - Page components
- **route.ts** - API route handlers
- **opengraph-image.tsx** - Dynamic OG image generation

---

## Key Conventions & Patterns

### 1. Type Safety with Zod

**ALL AI-generated content MUST be validated with Zod schemas.**

```typescript
// ✅ CORRECT: Use Zod schemas from @epoch/schema
import { OutlineSchema, ScriptSchema } from '@epoch/schema';

const outline = OutlineSchema.parse(aiResponse);
const script = ScriptSchema.parse(aiResponse);
```

```typescript
// ❌ INCORRECT: Never use unvalidated AI output
const outline = await openai.chat.completions.create(...);
// This is unsafe! No type checking or validation
```

**Location**: All schemas are in `packages/schema/src/`

### 2. Environment Variables

**ALWAYS validate environment variables using the centralized env module.**

```typescript
// ✅ CORRECT: Use validated env variables
import { serverEnv } from '@/lib/env';

const apiKey = serverEnv.OPENAI_API_KEY;
```

```typescript
// ❌ INCORRECT: Direct process.env access
const apiKey = process.env.OPENAI_API_KEY; // Not type-safe!
```

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token
- `RESEND_API_KEY` - Resend email API key
- `NEXTAUTH_SECRET` - NextAuth secret (32+ chars)

### 3. Database Access

**ALWAYS use the singleton Prisma client.**

```typescript
// ✅ CORRECT: Import from lib/db
import { prisma } from '@/lib/db';

const episodes = await prisma.episode.findMany({
  where: { status: 'PUBLISHED' },
  include: { interview: true },
});
```

```typescript
// ❌ INCORRECT: Creating new Prisma instances
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(); // Can cause connection issues!
```

### 4. Error Handling

**Use consistent error patterns with helpful context.**

```typescript
// ✅ CORRECT: Descriptive error messages
try {
  const audio = await generateInterviewAudio(script);
} catch (error) {
  throw new Error(
    `Failed to generate interview audio: ${error instanceof Error ? error.message : 'Unknown error'}`
  );
}
```

### 5. AI Generation Patterns

**All generation follows a consistent pipeline:**

1. **Outline** - AI creates structured plan
2. **Validation** - Zod validates the outline
3. **Script** - AI expands outline to full script
4. **Validation** - Zod validates the script
5. **Audio** - TTS converts script to audio
6. **Storage** - Upload to Vercel Blob
7. **Database** - Save episode metadata

**Example:**
```typescript
// Step 1 & 2: Generate and validate outline
const outline = await generateInterviewOutline(guestName, topic);
// Automatically validated by Zod in the function

// Step 3 & 4: Generate and validate script
const script = await generateInterviewScript(outline);
// Automatically validated by Zod in the function

// Step 5: Generate audio
const audioBuffer = await generateInterviewAudio(script, guestName);

// Step 6: Upload to storage
const blob = await put(`interviews/${slug}.mp3`, audioBuffer, {
  access: 'public',
  contentType: 'audio/mpeg',
});

// Step 7: Save to database
const episode = await prisma.episode.create({
  data: {
    title: outline.topic,
    audioUrl: blob.url,
    audioBytes: BigInt(audioBuffer.length),
    type: 'INTERVIEW',
    status: 'PUBLISHED',
    outline: outline as any,
    script: script as any,
    interview: {
      create: { /* ... */ },
    },
  },
});
```

### 6. Multi-Voice Audio Generation

**Different episode types use different voice configurations:**

```typescript
// Narrative: Single voice
const audio = await generateAudio(script, 'onyx');

// Interview: Two voices (host + guest)
const audio = await generateInterviewAudio(script, guestName);
// Uses: onyx (host) + auto-selected guest voice

// Debate: Three voices (moderator + 2 debaters)
const audio = await generateDebateAudio(script);
// Uses: alloy (moderator) + fable + nova (debaters)

// Adventure: Single narrator
const audio = await generateNodeAudio(script, 'shimmer');
```

### 7. Database Enums

**Always use Prisma enums, not string literals.**

```typescript
// ✅ CORRECT: Use Prisma enums
import { EpisodeType, EpisodeStatus, NodeType } from '@prisma/client';

const episode = await prisma.episode.create({
  data: {
    type: EpisodeType.INTERVIEW,
    status: EpisodeStatus.PUBLISHED,
  },
});
```

```typescript
// ❌ INCORRECT: String literals
const episode = await prisma.episode.create({
  data: {
    type: 'INTERVIEW', // Not type-safe!
    status: 'PUBLISHED', // Not type-safe!
  },
});
```

### 8. API Route Patterns

**Follow these conventions for API routes:**

```typescript
// apps/web/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate (if required)
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    // Use Zod schema if needed

    // 3. Perform operation
    const result = await someOperation(body);

    // 4. Return success response
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API_EXAMPLE]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 9. Component Naming

- **Page Components**: `page.tsx`
- **Layout Components**: `layout.tsx`
- **UI Components**: PascalCase (e.g., `AudioPlayer.tsx`)
- **Utility Functions**: camelCase (e.g., `formatDuration.ts`)
- **API Routes**: `route.ts`

### 10. Import Aliases

**Use TypeScript path aliases consistently:**

```typescript
// ✅ CORRECT: Use @ alias for app root
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';

// ✅ CORRECT: Use package aliases
import { OutlineSchema } from '@epoch/schema';

// ❌ INCORRECT: Relative paths across directories
import { prisma } from '../../../lib/db';
```

---

## Development Workflows

### Getting Started

1. **Clone and Install**:
   ```bash
   git clone https://github.com/risban933/Epoch.git
   cd Epoch
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   # Edit .env.local with your API keys
   ```

3. **Setup Database**:
   ```bash
   cd apps/web
   npx prisma migrate dev
   npx prisma generate
   npx prisma db seed  # Optional: Load sample data
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

### Database Migrations

**When changing the schema:**

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npm run db:migrate

# 3. Generate Prisma Client
cd apps/web
npx prisma generate

# 4. Commit both schema.prisma and migration files
```

**Development shortcuts:**

```bash
# Push schema changes without migration (dev only)
npm run db:push

# Open Prisma Studio to view data
npm run db:studio
```

### Type Checking

```bash
# Check types across all workspaces
npm run type-check

# Check types for web app only
cd apps/web
npm run type-check
```

### Linting

```bash
# Lint all workspaces
npm run lint

# Lint web app only
cd apps/web
npm run lint
```

### Adding New Episode Types

If adding a new episode format:

1. **Add enum to Prisma schema**:
   ```prisma
   enum EpisodeType {
     NARRATIVE
     INTERVIEW
     DEBATE
     ADVENTURE
     NEW_TYPE  // Add here
   }
   ```

2. **Create Zod schemas** in `packages/schema/src/new-type.ts`

3. **Add database model** if needed (e.g., `NewType` relation)

4. **Create generator functions** in `apps/web/lib/ai/new-type-generator.ts`

5. **Add API route** in `apps/web/app/api/generate/new-type/route.ts`

6. **Create player component** in `apps/web/components/new-type/`

7. **Update episode page** to handle new type

### Git Workflow

**Branch naming:**
- Feature: `feature/description`
- Bug fix: `fix/description`
- Docs: `docs/description`
- AI work: `claude/description-sessionid`

**Commit messages:**
```bash
# Good commit messages:
git commit -m "feat: Add debate voting API endpoint"
git commit -m "fix: Resolve audio generation timeout issues"
git commit -m "docs: Update API documentation with examples"
git commit -m "refactor: Extract audio utils to separate module"

# Bad commit messages:
git commit -m "updates"
git commit -m "fix bug"
git commit -m "wip"
```

---

## Database Schema Overview

### Core Models (16 Total)

#### 1. User & Authentication
- **User** - User accounts with preferences and feed tokens
- **Account** - OAuth accounts (NextAuth)
- **Session** - User sessions (NextAuth)
- **VerificationToken** - Email verification tokens

#### 2. Episodes
- **Episode** - Universal episode model for all content types
  - Fields: `type`, `status`, `audioUrl`, `duration`, `outline`, `script`
  - Enums: `EpisodeType`, `EpisodeStatus`

#### 3. Interview Format
- **Interview** - Interview metadata
  - Links to Episode (one-to-one)
  - Fields: `hostName`, `hostVoice`, `guestName`, `guestVoice`, `questions`, `dialogue`

#### 4. Debate Format
- **Debate** - Debate metadata
- **DebateVote** - User votes (authenticated + anonymous)
- **DebateFollowUp** - Follow-up episodes unlocked by votes

#### 5. Adventure Format
- **Adventure** - Adventure series metadata
- **AdventureNode** - Individual episodes in the branching narrative
- **Choice** - Choices connecting nodes
- **UserJourney** - User progress through adventures

#### 6. Podcast & Email
- **Show** - Podcast metadata (title, artwork, RSS info)
- **Subscription** - Email subscription status
- **EmailEvent** - Email tracking (sent, opened, bounced)
- **UnsubscribeToken** - One-click unsubscribe tokens

### Important Indexes

The schema includes indexes for performance:
- `Episode.status`, `Episode.type`, `Episode.publishedAt`
- `User.email`, `User.feedToken`
- `DebateVote.debateId`, `DebateVote.userId`
- `UserJourney.userId`, `UserJourney.adventureId`

### JSON Fields

Several models use JSON fields for structured data:
- `Episode.outline` - Stores Zod-validated outline
- `Episode.script` - Stores Zod-validated script
- `Episode.sources` - Array of citations
- `User.preferences` - User settings
- `UserJourney.path` - Adventure path history

**Accessing JSON fields:**
```typescript
// Read JSON field
const episode = await prisma.episode.findUnique({
  where: { id: episodeId },
});
const outline = episode.outline as Outline;

// Write JSON field
await prisma.episode.update({
  where: { id: episodeId },
  data: {
    outline: outline as any, // Cast to any for Prisma
  },
});
```

---

## AI Generation Pipeline

### OpenAI Integration

All AI generation uses OpenAI's API with structured outputs:

```typescript
import { openai } from '@/lib/ai/openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { OutlineSchema } from '@epoch/schema';

const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ],
  response_format: zodResponseFormat(OutlineSchema, 'outline'),
});

const outline = OutlineSchema.parse(
  JSON.parse(completion.choices[0].message.content)
);
```

### Voice Selection

**Automatic voice selection** based on guest names:

```typescript
import { getGuestVoice } from '@/lib/ai/voices';

// Automatically selects appropriate voice
const voice = getGuestVoice('Albert Einstein'); // Returns 'fable'
const voice = getGuestVoice('Cleopatra VII'); // Returns 'shimmer'
const voice = getGuestVoice('Winston Churchill'); // Returns 'onyx'
```

**Available voices:** `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`

### Audio Utilities

The project includes comprehensive audio utilities in `apps/web/lib/ai/audio-utils.ts`:

- **combineAudioSegments()** - Merge multiple TTS segments
- **normalizeVolume()** - Balance audio levels
- **addSilence()** - Add pauses between segments
- **estimateDuration()** - Calculate expected duration

**Example:**
```typescript
import { combineAudioSegments, addSilence } from '@/lib/ai/audio-utils';

const segments = [
  { buffer: hostAudio, metadata: { speaker: 'host' } },
  { buffer: guestAudio, metadata: { speaker: 'guest' } },
];

// Add 0.5s silence between segments
const finalAudio = await combineAudioSegments(segments, { silenceDuration: 500 });
```

### Cost Estimation

**Estimate generation costs before running:**

```typescript
import { estimateGenerationCost } from '@/lib/ai/cost-estimator';

const cost = estimateGenerationCost({
  type: 'INTERVIEW',
  duration: 1200, // 20 minutes
  includeAudio: true,
});

console.log(`Estimated cost: $${cost.total}`);
// {
//   outline: 0.05,
//   script: 0.10,
//   audio: 0.24,
//   total: 0.39
// }
```

### Retry Logic

**Implement retry logic for API calls:**

```typescript
import { retryWithBackoff } from '@/lib/ai/retry';

const audio = await retryWithBackoff(
  () => generateInterviewAudio(script, guestName),
  3 // max retries
);
```

---

## Testing & Quality Standards

### Current Status

Testing infrastructure is **planned but not yet implemented** (Phase 10).

### Planned Testing Strategy

1. **Unit Tests** - Jest for utility functions
2. **Integration Tests** - API route testing
3. **E2E Tests** - Playwright for user flows
4. **Type Checking** - TypeScript strict mode
5. **Linting** - ESLint + Prettier

### Manual Testing Checklist

When adding new features:

- [ ] Test with valid inputs
- [ ] Test with invalid/malformed inputs
- [ ] Test error handling
- [ ] Test authentication requirements
- [ ] Verify database changes persist
- [ ] Check audio file generation
- [ ] Validate RSS feed output
- [ ] Test email notifications
- [ ] Verify responsive design

### Code Quality Standards

- **Type Safety**: All code must be TypeScript with strict mode
- **Validation**: All external input must be validated (Zod)
- **Error Handling**: All async operations must have try/catch
- **Security**: No SQL injection, XSS, or other OWASP vulnerabilities
- **Performance**: Database queries must use appropriate indexes
- **Documentation**: Complex functions must have JSDoc comments

---

## Common Tasks & How-Tos

### Task 1: Generate a Narrative Episode

```typescript
import { generateEpisode } from '@/lib/ai/episode-generator';

const episode = await generateEpisode({
  topic: 'The Library of Alexandria',
  era: 'Ancient Egypt, 3rd century BCE',
  userId: session.user.id,
});

console.log(`Episode created: ${episode.id}`);
```

### Task 2: Create an Interview

```typescript
import {
  generateInterviewOutline,
  generateInterviewScript,
  generateInterviewAudio,
} from '@/lib/ai/interview-generator';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/db';

// Step 1: Generate outline
const outline = await generateInterviewOutline(
  'Albert Einstein',
  'Theory of Relativity'
);

// Step 2: Generate script
const script = await generateInterviewScript(outline);

// Step 3: Generate audio
const audioBuffer = await generateInterviewAudio(script, 'Albert Einstein');

// Step 4: Upload audio
const blob = await put(`interviews/${Date.now()}.mp3`, audioBuffer, {
  access: 'public',
  contentType: 'audio/mpeg',
});

// Step 5: Save to database
const episode = await prisma.episode.create({
  data: {
    title: `Interview with ${outline.guest.name}`,
    type: 'INTERVIEW',
    status: 'PUBLISHED',
    audioUrl: blob.url,
    outline: outline as any,
    script: script as any,
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
```

### Task 3: Add a New Database Model

```prisma
// 1. Edit prisma/schema.prisma
model NewFeature {
  id        String   @id @default(cuid())
  name      String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())

  @@index([userId])
}

// 2. Add relation to User model
model User {
  // ... existing fields
  newFeatures NewFeature[]
}
```

```bash
# 3. Create migration
npm run db:migrate

# 4. Generate Prisma Client
cd apps/web
npx prisma generate
```

### Task 4: Send Email Notifications

```typescript
import { sendEpisodeNotification } from '@/lib/email';

await sendEpisodeNotification({
  to: user.email,
  episode: {
    id: episode.id,
    title: episode.title,
    description: episode.description,
    audioUrl: episode.audioUrl,
  },
  unsubscribeUrl: `${baseUrl}/api/unsubscribe?token=${token}`,
});
```

### Task 5: Generate RSS Feed

```typescript
import { buildRSSFeed } from '@/lib/podcast/rss-builder';
import { prisma } from '@/lib/db';

// Get published episodes
const episodes = await prisma.episode.findMany({
  where: { status: 'PUBLISHED' },
  orderBy: { publishedAt: 'desc' },
  include: {
    interview: true,
    debate: true,
  },
});

// Generate RSS feed
const rss = await buildRSSFeed({
  episodes,
  showInfo: {
    title: 'Epoch Pod',
    description: 'AI-powered historical storytelling',
    link: 'https://your-domain.com',
  },
});

return new Response(rss, {
  headers: { 'Content-Type': 'application/xml' },
});
```

### Task 6: Implement Debate Voting

```typescript
import { prisma } from '@/lib/db';

// Record vote
await prisma.debateVote.create({
  data: {
    debateId: debateId,
    userId: session?.user?.id, // Optional for anonymous
    sessionId: anonymousSessionId, // For anonymous users
    position: votePosition, // 1 or 2
    reasoning: userReasoning, // Optional
  },
});

// Get vote statistics
const stats = await prisma.debateVote.groupBy({
  by: ['position'],
  where: { debateId },
  _count: true,
});
```

### Task 7: Track Adventure Progress

```typescript
import { prisma } from '@/lib/db';

// Start new journey
const journey = await prisma.userJourney.create({
  data: {
    userId: session.user.id,
    adventureId: adventureId,
    currentNodeId: adventure.startNodeId,
    path: [],
  },
});

// Make a choice
await prisma.userJourney.update({
  where: { id: journeyId },
  data: {
    currentNodeId: nextNodeId,
    path: [
      ...existingPath,
      {
        nodeId: currentNodeId,
        choiceId: choiceId,
        choiceText: choice.text,
        timestamp: new Date().toISOString(),
      },
    ],
  },
});
```

---

## Important Files Reference

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Root workspace configuration |
| `apps/web/package.json` | Web app dependencies |
| `apps/web/tsconfig.json` | TypeScript configuration |
| `apps/web/tailwind.config.ts` | Tailwind CSS configuration |
| `prisma/schema.prisma` | Database schema |
| `apps/web/.env.local` | Environment variables (local) |

### Core Library Files

| File | Purpose |
|------|---------|
| `apps/web/lib/env.ts` | Environment variable validation |
| `apps/web/lib/db/prisma.ts` | Prisma client singleton |
| `apps/web/lib/ai/openai.ts` | OpenAI client configuration |
| `apps/web/lib/ai/episode-generator.ts` | Main episode orchestrator |
| `apps/web/lib/ai/voices.ts` | Voice selection logic |
| `apps/web/lib/ai/audio-utils.ts` | Audio processing utilities |
| `apps/web/lib/tts/factory.ts` | TTS provider factory |
| `apps/web/lib/email/service.ts` | Email sending service |
| `apps/web/lib/podcast/rss-builder.ts` | RSS feed generation |

### API Routes

| Route | Purpose |
|-------|---------|
| `app/api/generate/route.ts` | Narrative episode generation |
| `app/api/generate/interview/route.ts` | Interview generation |
| `app/api/generate/debate/route.ts` | Debate generation |
| `app/api/generate/adventure/route.ts` | Adventure generation |
| `app/api/debates/vote/route.ts` | Debate voting |
| `app/api/adventures/[id]/start/route.ts` | Start adventure journey |
| `app/api/rss/route.ts` | Public RSS feed |
| `app/api/rss/[userId]/route.ts` | Private user feed |
| `app/api/webhooks/resend/route.ts` | Email webhook handler |

### Component Files

| File | Purpose |
|------|---------|
| `components/audio/AudioPlayer.tsx` | Narrative audio player |
| `components/interview/InterviewPlayer.tsx` | Interview player with dialogue |
| `components/debate/DebatePlayer.tsx` | Debate player with voting |
| `components/adventure/AdventurePlayer.tsx` | Adventure player with choices |

---

## Security Considerations

### Authentication

- Uses **Auth.js (NextAuth v5)** with email magic links
- Protected routes use middleware authorization
- Session strategy: JWT (lightweight)
- Email verification required for authentication

### Security Headers

Middleware applies comprehensive security headers:

- **CSP** (Content Security Policy)
- **X-Frame-Options**: DENY (prevent clickjacking)
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: enabled
- **Referrer-Policy**: strict-origin-when-cross-origin
- **HSTS** (Strict-Transport-Security in production)

### Input Validation

- **All user input** must be validated with Zod schemas
- **All AI output** must be validated with Zod schemas
- **SQL injection**: Prevented by Prisma's parameterized queries
- **XSS**: React escapes by default, but be careful with `dangerouslySetInnerHTML`

### API Security

- Rate limiting planned (Phase 10)
- Authentication required for sensitive endpoints
- CORS configured for RSS feeds only
- Environment variables never exposed to client

### Email Security

- **SPF, DKIM, DMARC** authentication via Resend
- **RFC 8058** one-click unsubscribe
- **Bounce handling** via webhooks
- **Complaint handling** via webhooks
- Auto-unsubscribe on hard bounce/complaint

### Best Practices

1. **Never log sensitive data** (API keys, passwords, emails)
2. **Validate all inputs** (user input, AI output, webhook payloads)
3. **Use parameterized queries** (Prisma handles this)
4. **Sanitize output** (React handles this, but be careful)
5. **Implement rate limiting** (planned for Phase 10)
6. **Use HTTPS in production** (enforced by HSTS)
7. **Rotate secrets regularly** (API keys, NextAuth secret)

---

## Environment & Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/epochpod"

# OpenAI
OPENAI_API_KEY="sk-..."

# Vercel Blob
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@your-domain.com"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

### Optional Environment Variables

```bash
# OAuth Providers (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# App Configuration (optional)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Epoch Pod"

# Environment
NODE_ENV="development" # development | production | test
```

### Generate Secrets

```bash
# NextAuth secret (32+ characters)
openssl rand -base64 32

# Feed token (for private RSS feeds)
openssl rand -hex 16
```

### Development vs Production

**Development:**
- Uses `tts-1` model (faster, cheaper)
- Relaxed CSP headers (allows unsafe-eval)
- Verbose error messages
- No HSTS header

**Production:**
- Uses `tts-1-hd` model (better quality)
- Strict CSP headers
- Generic error messages (security)
- HSTS header enabled

---

## Additional Resources

### Documentation

- [API Documentation](./docs/API.md) - Complete API reference
- [Database Schema](./prisma/README.md) - Database documentation
- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Project roadmap
- [Feature Plans](./FEATURE_PLANS.md) - Detailed feature specifications

### External Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Auth.js Documentation](https://authjs.dev)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Zod Documentation](https://zod.dev)
- [React Email](https://react.email)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)

### Quick Links

- **Repository**: https://github.com/risban933/Epoch
- **Issue Tracker**: https://github.com/risban933/Epoch/issues

---

## Working with AI Assistants

### When Making Changes

1. **Always read existing code first** to understand patterns
2. **Follow existing conventions** (don't introduce new patterns)
3. **Validate with Zod** for all external data
4. **Test manually** before committing
5. **Update documentation** if adding new features
6. **Commit with clear messages** explaining the "why"

### Common Pitfalls to Avoid

❌ **Don't:**
- Create new Prisma client instances
- Use `process.env` directly (use `@/lib/env`)
- Skip Zod validation for AI output
- Use string literals for enums
- Create duplicate utility functions
- Ignore error handling
- Use relative imports across directories

✅ **Do:**
- Import singleton instances (`prisma`, `openai`)
- Use centralized env validation
- Validate all AI output with Zod
- Use Prisma enums
- Check for existing utilities first
- Handle errors with context
- Use TypeScript path aliases

### Questions to Ask Before Coding

1. **Does this pattern already exist?** (Check existing code)
2. **Is there a utility function for this?** (Check `lib/` folders)
3. **Do I need Zod validation?** (Yes, if external data)
4. **Should this be a separate model?** (Consider database design)
5. **Is this secure?** (Check for vulnerabilities)
6. **Will this scale?** (Consider performance)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-13 | Initial comprehensive guide for AI assistants |

---

**Happy coding! 🚀**

This guide is maintained for AI assistants working on Epoch Pod. When in doubt, follow the patterns in existing code and prioritize type safety, security, and user experience.
