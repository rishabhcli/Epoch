# Feature Implementation Plans

## Overview
This document outlines detailed implementation plans for three major features to expand Epoch Pod's capabilities beyond standard podcast narration.

---

## Feature 1: Interactive Historical Debates

### Concept
Two AI-generated perspectives debate controversial historical topics. Users vote on arguments and unlock follow-up episodes based on their engagement.

### Architecture

#### Database Schema Changes

```prisma
model Debate {
  id          String   @id @default(cuid())
  episodeId   String   @unique
  episode     Episode  @relation(fields: [episodeId], references: [id], onDelete: Cascade)
  topic       String
  question    String   // "Was Napoleon a tyrant or a reformer?"
  position1   String   // "Tyrant"
  position2   String   // "Reformer"
  argument1   Json     // Full argument for position 1
  argument2   Json     // Full argument for position 2

  votes       DebateVote[]
  followUps   DebateFollowUp[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model DebateVote {
  id          String   @id @default(cuid())
  debateId    String
  debate      Debate   @relation(fields: [debateId], references: [id], onDelete: Cascade)
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])

  position    Int      // 1 or 2
  reasoning   String?  // Optional: why they chose this side

  ipAddress   String?  // For anonymous voting
  sessionId   String?  // Track anonymous users

  createdAt   DateTime @default(now())

  @@unique([debateId, userId])
  @@index([debateId])
}

model DebateFollowUp {
  id          String   @id @default(cuid())
  debateId    String
  debate      Debate   @relation(fields: [debateId], references: [id], onDelete: Cascade)

  triggerPosition Int  // Follow-up for voters of position 1 or 2
  episodeId   String
  episode     Episode  @relation(fields: [episodeId], references: [id])

  unlockThreshold Int  @default(0) // Min votes needed to unlock

  createdAt   DateTime @default(now())

  @@index([debateId])
}

// Update Episode model
model Episode {
  // ... existing fields ...
  type        EpisodeType @default(NARRATIVE)
  debate      Debate?
  debateFollowUps DebateFollowUp[]
}

enum EpisodeType {
  NARRATIVE      // Original single-voice narration
  DEBATE         // Two-voice debate format
  INTERVIEW      // Host + guest interview
  ADVENTURE      // Choose-your-own-adventure
}
```

#### AI Content Generation Pipeline

```typescript
// packages/schema/src/debate.ts
import { z } from 'zod';

export const DebateArgumentSchema = z.object({
  position: z.string(),
  openingStatement: z.string().min(200).max(400),
  keyPoints: z.array(z.object({
    claim: z.string(),
    evidence: z.array(z.object({
      fact: z.string(),
      source: z.string(),
    })),
    reasoning: z.string(),
  })).length(3),
  rebuttals: z.array(z.object({
    anticipatedCounterArgument: z.string(),
    response: z.string(),
    evidence: z.string(),
  })).length(2),
  closingStatement: z.string().min(200).max(400),
});

export const DebateOutlineSchema = z.object({
  topic: z.string(),
  question: z.string(),
  historicalContext: z.string().min(300).max(600),
  position1: z.string(),
  position2: z.string(),
  argument1: DebateArgumentSchema,
  argument2: DebateArgumentSchema,
  moderatorIntro: z.string().min(100).max(300),
  moderatorOutro: z.string().min(100).max(300),
});

export const DebateScriptSchema = z.object({
  intro: z.string(),
  segments: z.array(z.object({
    speaker: z.enum(['MODERATOR', 'POSITION_1', 'POSITION_2']),
    voice: z.string(), // Voice ID for TTS
    text: z.string(),
    duration: z.number().optional(),
  })),
  outro: z.string(),
  totalWords: z.number(),
  estimatedDuration: z.number(), // seconds
});
```

```typescript
// apps/web/lib/ai/debate-generator.ts
import { openai } from './openai';
import { DebateOutlineSchema, DebateScriptSchema } from '@epoch/schema';

export async function generateDebateOutline(topic: string, question: string) {
  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are a historian and debate coordinator. Generate a balanced, historically accurate debate outline.

Rules:
- Both positions must be supported by credible historical evidence
- Arguments should be intellectually honest, not strawmen
- Include primary and secondary source citations
- Maintain academic rigor while being accessible
- Each side should have 3 strong points and 2 rebuttals
- Total debate should be 12-15 minutes when spoken`
      },
      {
        role: 'user',
        content: `Generate a debate outline for:
Topic: ${topic}
Question: ${question}

Provide two well-researched, balanced positions with evidence.`
      }
    ],
    response_format: { type: 'json_schema', json_schema: {
      name: 'debate_outline',
      strict: true,
      schema: DebateOutlineSchema,
    }},
  });

  return completion.choices[0].message.parsed;
}

export async function generateDebateScript(outline: z.infer<typeof DebateOutlineSchema>) {
  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are a professional debate scriptwriter. Convert the debate outline into a natural, engaging conversational script.

Format:
- Moderator introduces topic and debaters
- Alternating segments between Position 1 and Position 2
- Each speaker gets 2-3 segments
- Moderator interjects with transitions
- No actual rebuttals between speakers (parallel arguments, not direct debate)
- Moderator concludes asking listeners to vote

Voice assignments:
- MODERATOR: neutral, professional (voice: "onyx")
- POSITION_1: passionate advocate (voice: "echo")
- POSITION_2: passionate advocate (voice: "fable")

Target: 2,400-3,000 words total (12-15 min audio)`
      },
      {
        role: 'user',
        content: `Convert this outline into a debate script:\n\n${JSON.stringify(outline, null, 2)}`
      }
    ],
    response_format: { type: 'json_schema', json_schema: {
      name: 'debate_script',
      strict: true,
      schema: DebateScriptSchema,
    }},
  });

  return completion.choices[0].message.parsed;
}

export async function generateDebateAudio(script: z.infer<typeof DebateScriptSchema>) {
  const audioSegments: Buffer[] = [];

  // Generate audio for each segment
  for (const segment of script.segments) {
    const response = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: segment.voice,
      input: segment.text,
      speed: 1.0,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    audioSegments.push(buffer);
  }

  // Concatenate audio segments with brief pauses
  // COMPLETED: Using fluent-ffmpeg to properly merge audio with 0.5s silence between segments
  return concatenateAudioWithSilenceSafe(audioSegments, 0.5);
}

// Audio concatenation implemented in apps/web/lib/ai/audio-utils.ts
// See AUDIO_UTILITIES.md for full documentation
```

#### API Endpoints

```typescript
// apps/web/app/api/debates/vote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  const { debateId, position, reasoning } = await req.json();

  // Validate
  if (!debateId || ![1, 2].includes(position)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Create or update vote
  const vote = await prisma.debateVote.upsert({
    where: {
      debateId_userId: {
        debateId,
        userId: session?.user?.id || null,
      }
    },
    create: {
      debateId,
      userId: session?.user?.id,
      position,
      reasoning,
      ipAddress: req.headers.get('x-forwarded-for'),
      sessionId: !session ? req.cookies.get('session_id')?.value : null,
    },
    update: {
      position,
      reasoning,
    },
  });

  // Check if follow-up episodes should be unlocked
  const voteCount = await prisma.debateVote.count({
    where: { debateId, position },
  });

  const followUps = await prisma.debateFollowUp.findMany({
    where: {
      debateId,
      triggerPosition: position,
      unlockThreshold: { lte: voteCount },
    },
    include: { episode: true },
  });

  return NextResponse.json({
    success: true,
    vote,
    unlockedEpisodes: followUps.map(f => f.episode),
  });
}

// apps/web/app/api/debates/[debateId]/stats/route.ts
export async function GET(
  req: NextRequest,
  { params }: { params: { debateId: string } }
) {
  const stats = await prisma.debateVote.groupBy({
    by: ['position'],
    where: { debateId: params.debateId },
    _count: true,
  });

  const debate = await prisma.debate.findUnique({
    where: { id: params.debateId },
    select: { position1: true, position2: true, question: true },
  });

  return NextResponse.json({
    question: debate?.question,
    results: {
      position1: {
        name: debate?.position1,
        votes: stats.find(s => s.position === 1)?._count || 0,
      },
      position2: {
        name: debate?.position2,
        votes: stats.find(s => s.position === 2)?._count || 0,
      },
    },
  });
}
```

#### Frontend Components

```typescript
// apps/web/components/debate/DebatePlayer.tsx
'use client';

import { useState } from 'react';
import { AudioPlayer } from '@/components/audio/AudioPlayer';

interface DebatePlayerProps {
  episode: {
    id: string;
    title: string;
    audioUrl: string;
    debate: {
      id: string;
      question: string;
      position1: string;
      position2: string;
    };
  };
}

export function DebatePlayer({ episode }: DebatePlayerProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<1 | 2 | null>(null);
  const [stats, setStats] = useState<any>(null);

  async function handleVote(position: 1 | 2) {
    const response = await fetch('/api/debates/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        debateId: episode.debate.id,
        position,
      }),
    });

    const data = await response.json();

    if (data.success) {
      setHasVoted(true);
      setSelectedPosition(position);

      // Fetch updated stats
      const statsRes = await fetch(`/api/debates/${episode.debate.id}/stats`);
      setStats(await statsRes.json());

      // Show unlocked episodes if any
      if (data.unlockedEpisodes?.length > 0) {
        // TODO: Show toast notification
      }
    }
  }

  return (
    <div className="space-y-6">
      <AudioPlayer audioUrl={episode.audioUrl} />

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">
          {episode.debate.question}
        </h3>

        {!hasVoted ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Which argument do you find more convincing?
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleVote(1)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition"
              >
                {episode.debate.position1}
              </button>

              <button
                onClick={() => handleVote(2)}
                className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg transition"
              >
                {episode.debate.position2}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-green-600 dark:text-green-400 font-medium">
              ✓ You voted for: {selectedPosition === 1 ? episode.debate.position1 : episode.debate.position2}
            </p>

            {stats && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>{episode.debate.position1}</span>
                  <span className="font-medium">{stats.results.position1.votes} votes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${(stats.results.position1.votes / (stats.results.position1.votes + stats.results.position2.votes)) * 100}%`
                    }}
                  />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span>{episode.debate.position2}</span>
                  <span className="font-medium">{stats.results.position2.votes} votes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${(stats.results.position2.votes / (stats.results.position1.votes + stats.results.position2.votes)) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Implementation Phases

**Phase 1: Core Infrastructure (2 weeks)**
- Database schema migration
- Zod schemas for debate content
- AI prompt engineering and testing
- Multi-voice TTS generation pipeline

**Phase 2: Content Generation (2 weeks)**
- Debate outline generator
- Debate script generator
- Audio concatenation with speaker transitions
- Test with 3-5 debate topics

**Phase 3: Voting & Stats (1 week)**
- Vote API endpoints
- Anonymous voting support (IP/session tracking)
- Real-time stats aggregation
- Vote persistence and validation

**Phase 4: Frontend (2 weeks)**
- Debate player component
- Voting UI
- Stats visualization
- Follow-up episode unlocking
- Responsive design

**Phase 5: Follow-up Episodes (2 weeks)**
- Follow-up episode generator (position-specific deep dives)
- Unlock logic based on vote thresholds
- Email notifications for unlocked content
- Dashboard showing unlocked episodes

**Phase 6: Polish & Launch (1 week)**
- Email templates for debate episodes
- RSS feed support for debate episodes
- SEO metadata for debates
- Analytics tracking
- User testing and refinement

**Total: 10 weeks**

---

## Feature 2: Choose Your Own Adventure History

### Concept
Branching narrative episodes where listeners make decisions at key historical moments, creating personalized storylines tracked in their RSS feed.

### Architecture

#### Database Schema Changes

```prisma
model Adventure {
  id          String   @id @default(cuid())
  title       String
  description String
  era         String?

  startNodeId String
  startNode   AdventureNode @relation("StartNode", fields: [startNodeId], references: [id])

  nodes       AdventureNode[]
  journeys    UserJourney[]

  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model AdventureNode {
  id          String   @id @default(cuid())
  adventureId String
  adventure   Adventure @relation(fields: [adventureId], references: [id], onDelete: Cascade)

  episodeId   String   @unique
  episode     Episode  @relation(fields: [episodeId], references: [id], onDelete: Cascade)

  title       String
  description String
  nodeType    NodeType

  // For decision nodes
  decisionPrompt String?
  choices     Choice[]

  // For ending nodes
  endingType  String?  // "victory", "defeat", "neutral"

  // Navigation
  parentChoices Choice[] @relation("ChoiceDestination")

  createdAt   DateTime @default(now())

  @@index([adventureId])
}

model Choice {
  id          String   @id @default(cuid())
  nodeId      String
  node        AdventureNode @relation(fields: [nodeId], references: [id], onDelete: Cascade)

  text        String   // "Support Caesar" or "Defend the Republic"
  description String   // Brief explanation of consequences

  nextNodeId  String
  nextNode    AdventureNode @relation("ChoiceDestination", fields: [nextNodeId], references: [id])

  consequences String  // What this choice leads to (for email preview)

  createdAt   DateTime @default(now())

  @@index([nodeId])
}

model UserJourney {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  adventureId String
  adventure   Adventure @relation(fields: [adventureId], references: [id], onDelete: Cascade)

  currentNodeId String
  currentNode   AdventureNode @relation(fields: [currentNodeId], references: [id])

  path        Json     // Array of {nodeId, choiceId, timestamp}

  isCompleted Boolean  @default(false)
  completedAt DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, adventureId])
  @@index([userId])
}

enum NodeType {
  START      // Beginning of adventure
  DECISION   // User makes a choice
  STORY      // Story continuation (no choice)
  ENDING     // Terminal node
}

// Update Episode model
model Episode {
  // ... existing fields ...
  type           EpisodeType @default(NARRATIVE)
  adventureNode  AdventureNode?
}
```

#### AI Content Generation Pipeline

```typescript
// packages/schema/src/adventure.ts
import { z } from 'zod';

export const AdventureOutlineSchema = z.object({
  title: z.string(),
  description: z.string(),
  historicalSetting: z.object({
    era: z.string(),
    location: z.string(),
    context: z.string().min(300),
    keyFigures: z.array(z.string()),
  }),
  storyline: z.object({
    premise: z.string(),
    protagonist: z.string(), // Who the listener plays as
    stakes: z.string(),
  }),
  nodes: z.array(z.object({
    id: z.string(),
    title: z.string(),
    nodeType: z.enum(['START', 'DECISION', 'STORY', 'ENDING']),
    narrative: z.string().min(400).max(800),
    choices: z.array(z.object({
      text: z.string(),
      description: z.string(),
      nextNodeId: z.string(),
      consequences: z.string(),
    })).optional(),
    endingType: z.string().optional(),
  })),
  flowMap: z.record(z.string(), z.array(z.string())), // nodeId -> [childNodeIds]
});

export const AdventureScriptSchema = z.object({
  nodeId: z.string(),
  intro: z.string(),
  narrative: z.string().min(800).max(1500),
  decisionPrompt: z.string().optional(),
  choices: z.array(z.object({
    text: z.string(),
    description: z.string(),
  })).optional(),
  outro: z.string(),
  totalWords: z.number(),
});
```

```typescript
// apps/web/lib/ai/adventure-generator.ts
import { openai } from './openai';
import { AdventureOutlineSchema, AdventureScriptSchema } from '@epoch/schema';

export async function generateAdventureOutline(
  concept: string,
  historicalContext: string
) {
  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are a historical fiction writer and game designer. Create a branching narrative adventure set in a historically accurate period.

Requirements:
- 8-12 total nodes (episodes)
- 1 START node
- 4-6 DECISION nodes (each with 2-3 choices)
- 2-3 STORY nodes (linear progression)
- 3-4 ENDING nodes (different outcomes)
- Each path from START to an ENDING should be 4-5 episodes
- Choices should be meaningful and historically plausible
- No "game over" dead ends - all paths lead to endings
- Maintain historical accuracy while allowing alternate scenarios`
      },
      {
        role: 'user',
        content: `Create a branching adventure:
Concept: ${concept}
Historical Context: ${historicalContext}

Design a complete adventure outline with branching paths.`
      }
    ],
    response_format: { type: 'json_schema', json_schema: {
      name: 'adventure_outline',
      strict: true,
      schema: AdventureOutlineSchema,
    }},
  });

  return completion.choices[0].message.parsed;
}

export async function generateNodeScript(
  node: any,
  adventureContext: any,
  pathHistory?: any[]
) {
  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are a historical storyteller. Write an engaging podcast episode for this adventure node.

Format:
- Second-person narration ("You are...")
- Vivid sensory details
- Historical accuracy
- 800-1,500 words
- If DECISION node: end with clear choice presentation
- Build tension and engagement
- Reference previous choices if applicable`
      },
      {
        role: 'user',
        content: `Write script for this adventure node:

Node: ${JSON.stringify(node, null, 2)}
Adventure Context: ${JSON.stringify(adventureContext, null, 2)}
Previous Choices: ${pathHistory ? JSON.stringify(pathHistory, null, 2) : 'None (first episode)'}

Create an immersive episode script.`
      }
    ],
    response_format: { type: 'json_schema', json_schema: {
      name: 'node_script',
      strict: true,
      schema: AdventureScriptSchema,
    }},
  });

  return completion.choices[0].message.parsed;
}
```

#### API Endpoints

```typescript
// apps/web/app/api/adventures/[adventureId]/start/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { adventureId: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adventure = await prisma.adventure.findUnique({
    where: { id: params.adventureId },
    include: { startNode: { include: { episode: true, choices: true } } },
  });

  if (!adventure) {
    return NextResponse.json({ error: 'Adventure not found' }, { status: 404 });
  }

  // Create or get existing journey
  const journey = await prisma.userJourney.upsert({
    where: {
      userId_adventureId: {
        userId: session.user.id,
        adventureId: params.adventureId,
      }
    },
    create: {
      userId: session.user.id,
      adventureId: params.adventureId,
      currentNodeId: adventure.startNodeId,
      path: [],
    },
    update: {},
    include: {
      currentNode: {
        include: { episode: true, choices: true },
      },
    },
  });

  return NextResponse.json({
    journey,
    currentEpisode: journey.currentNode.episode,
    choices: journey.currentNode.choices,
  });
}

// apps/web/app/api/adventures/journey/[journeyId]/choose/route.ts
export async function POST(
  req: NextRequest,
  { params }: { params: { journeyId: string } }
) {
  const session = await auth();
  const { choiceId } = await req.json();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const journey = await prisma.userJourney.findUnique({
    where: { id: params.journeyId },
    include: { currentNode: true },
  });

  if (!journey || journey.userId !== session.user.id) {
    return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
  }

  const choice = await prisma.choice.findUnique({
    where: { id: choiceId },
    include: { nextNode: { include: { episode: true, choices: true } } },
  });

  if (!choice || choice.nodeId !== journey.currentNodeId) {
    return NextResponse.json({ error: 'Invalid choice' }, { status: 400 });
  }

  // Update journey
  const updatedPath = [
    ...(journey.path as any[]),
    {
      nodeId: journey.currentNodeId,
      choiceId: choice.id,
      choiceText: choice.text,
      timestamp: new Date().toISOString(),
    },
  ];

  const isEnding = choice.nextNode.nodeType === 'ENDING';

  const updatedJourney = await prisma.userJourney.update({
    where: { id: params.journeyId },
    data: {
      currentNodeId: choice.nextNodeId,
      path: updatedPath,
      isCompleted: isEnding,
      completedAt: isEnding ? new Date() : null,
    },
    include: {
      currentNode: {
        include: { episode: true, choices: true },
      },
    },
  });

  // Send email with next episode
  // TODO: Queue email notification

  return NextResponse.json({
    journey: updatedJourney,
    nextEpisode: updatedJourney.currentNode.episode,
    choices: updatedJourney.currentNode.choices,
    isEnding,
  });
}
```

#### Frontend Components

```typescript
// apps/web/components/adventure/AdventurePlayer.tsx
'use client';

import { useState, useEffect } from 'react';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { useRouter } from 'next/navigation';

interface AdventurePlayerProps {
  journey: {
    id: string;
    currentNode: {
      episode: {
        id: string;
        title: string;
        audioUrl: string;
      };
      choices: Array<{
        id: string;
        text: string;
        description: string;
        consequences: string;
      }>;
      nodeType: string;
    };
    path: Array<any>;
  };
}

export function AdventurePlayer({ journey }: AdventurePlayerProps) {
  const [hasFinishedListening, setHasFinishedListening] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const router = useRouter();

  const isDecisionNode = journey.currentNode.nodeType === 'DECISION';
  const isEndingNode = journey.currentNode.nodeType === 'ENDING';

  async function handleChoice(choiceId: string) {
    setIsChoosing(true);

    const response = await fetch(`/api/adventures/journey/${journey.id}/choose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choiceId }),
    });

    const data = await response.json();

    if (data.nextEpisode) {
      // Navigate to next episode
      router.push(`/episodes/${data.nextEpisode.id}`);
    }
  }

  return (
    <div className="space-y-6">
      <AudioPlayer
        audioUrl={journey.currentNode.episode.audioUrl}
        onEnded={() => setHasFinishedListening(true)}
      />

      {/* Journey Path Visualization */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Your Journey</h4>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
          {journey.path.map((step: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-gray-400">→</span>
              <span>{step.choiceText}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 font-medium text-blue-600">
            <span className="text-blue-400">●</span>
            <span>Current: {journey.currentNode.episode.title}</span>
          </div>
        </div>
      </div>

      {/* Choices */}
      {isDecisionNode && hasFinishedListening && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">What do you do?</h3>

          <div className="space-y-4">
            {journey.currentNode.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                disabled={isChoosing}
                className="w-full text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 transition disabled:opacity-50"
              >
                <div className="font-semibold text-lg mb-1">{choice.text}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {choice.description}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  → {choice.consequences}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ending */}
      {isEndingNode && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
            The End
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You've completed this adventure! Your choices led you down a unique path through history.
          </p>
          <button
            onClick={() => router.push('/adventures')}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition"
          >
            Explore More Adventures
          </button>
        </div>
      )}
    </div>
  );
}
```

#### Email Integration

```typescript
// apps/web/emails/AdventureChoiceEmail.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface AdventureChoiceEmailProps {
  userName: string;
  adventureTitle: string;
  currentEpisodeTitle: string;
  choices: Array<{
    id: string;
    text: string;
    description: string;
  }>;
  journeyId: string;
}

export default function AdventureChoiceEmail({
  userName,
  adventureTitle,
  currentEpisodeTitle,
  choices,
  journeyId,
}: AdventureChoiceEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>What happens next in {adventureTitle}?</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>What do you do, {userName}?</Heading>

          <Text style={text}>
            You've just finished <strong>{currentEpisodeTitle}</strong> in <strong>{adventureTitle}</strong>.
          </Text>

          <Text style={text}>
            The story continues based on your choice:
          </Text>

          <Section style={choicesContainer}>
            {choices.map((choice) => (
              <Section key={choice.id} style={choiceBox}>
                <Heading as="h3" style={choiceTitle}>
                  {choice.text}
                </Heading>
                <Text style={choiceDescription}>{choice.description}</Text>
                <Link
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/api/adventures/journey/${journeyId}/choose?choiceId=${choice.id}&email=true`}
                  style={button}
                >
                  Choose This Path →
                </Link>
              </Section>
            ))}
          </Section>

          <Text style={footer}>
            Your choice will determine the next chapter in your historical adventure.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px' };
const h1 = { color: '#333', fontSize: '24px', fontWeight: 'bold', margin: '40px 0', padding: '0' };
const text = { color: '#333', fontSize: '16px', lineHeight: '26px' };
const choicesContainer = { margin: '32px 0' };
const choiceBox = { backgroundColor: '#f8f9fa', border: '2px solid #e9ecef', borderRadius: '8px', padding: '20px', marginBottom: '16px' };
const choiceTitle = { fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0' };
const choiceDescription = { fontSize: '14px', color: '#666', margin: '0 0 16px 0' };
const button = { backgroundColor: '#5469d4', borderRadius: '4px', color: '#fff', fontSize: '16px', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '12px 24px' };
const footer = { color: '#8898aa', fontSize: '12px', lineHeight: '16px', marginTop: '32px' };
```

### Implementation Phases

**Phase 1: Core Infrastructure (2 weeks)**
- Database schema migration
- Zod schemas for adventure content
- Adventure outline generator
- Decision tree validation logic

**Phase 2: Content Generation (3 weeks)**
- Node script generator with context awareness
- Audio generation for all node types
- Test complete adventure (8-12 nodes)
- Path validation and testing

**Phase 3: User Journey Tracking (2 weeks)**
- Journey API endpoints
- Choice selection and path recording
- State management for adventures
- Progress persistence

**Phase 4: Frontend (2 weeks)**
- Adventure browser/catalog
- Adventure player component
- Choice selection UI
- Journey visualization
- Episode navigation

**Phase 5: Email Integration (1 week)**
- Choice email templates
- Email-based choice selection
- Webhook handlers for email clicks
- Next episode notifications

**Phase 6: Polish & Launch (2 weeks)**
- RSS feed integration (personalized feeds with user's path)
- Adventure completion badges/stats
- Replay functionality
- Multiple concurrent journeys support
- User testing

**Total: 12 weeks**

---

## Feature 3: Historical Figure "Interviews"

### Concept
Conversational podcast format where an AI host interviews AI-generated historical figures, creating engaging dialogue-driven episodes.

### Architecture

#### Database Schema Changes

```prisma
model Interview {
  id          String   @id @default(cuid())
  episodeId   String   @unique
  episode     Episode  @relation(fields: [episodeId], references: [id], onDelete: Cascade)

  hostName    String   @default("The Epoch Host")
  hostVoice   String   @default("onyx")

  guestName   String   // "Albert Einstein"
  guestRole   String   // "Physicist"
  guestEra    String   // "Early 20th Century"
  guestVoice  String   // "echo"

  topic       String   // "Theory of Relativity"

  questions   Json     // Array of prepared questions
  dialogue    Json     // Full interview dialogue

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Update Episode model
model Episode {
  // ... existing fields ...
  type        EpisodeType @default(NARRATIVE)
  interview   Interview?
}
```

#### AI Content Generation Pipeline

```typescript
// packages/schema/src/interview.ts
import { z } from 'zod';

export const InterviewOutlineSchema = z.object({
  guest: z.object({
    name: z.string(),
    role: z.string(),
    era: z.string(),
    biography: z.string().min(200).max(400),
    majorAccomplishments: z.array(z.string()),
    historicalContext: z.string(),
  }),
  topic: z.string(),
  angle: z.string(), // Unique angle for this interview
  questions: z.array(z.object({
    question: z.string(),
    category: z.enum(['background', 'achievement', 'controversy', 'personal', 'legacy', 'hypothetical']),
    researchNotes: z.string(), // Context for guest's response
  })).min(8).max(12),
  sources: z.array(z.object({
    title: z.string(),
    author: z.string().optional(),
    type: z.enum(['book', 'article', 'primary_source', 'academic_paper']),
  })),
});

export const InterviewScriptSchema = z.object({
  intro: z.object({
    speaker: z.literal('HOST'),
    text: z.string().min(150).max(300),
  }),
  segments: z.array(z.object({
    speaker: z.enum(['HOST', 'GUEST']),
    text: z.string().min(50).max(400),
    emotion: z.enum(['neutral', 'enthusiastic', 'thoughtful', 'somber', 'excited']).optional(),
  })),
  outro: z.object({
    speaker: z.literal('HOST'),
    text: z.string().min(100).max(200),
  }),
  totalWords: z.number(),
  estimatedDuration: z.number(),
});
```

```typescript
// apps/web/lib/ai/interview-generator.ts
import { openai } from './openai';
import { InterviewOutlineSchema, InterviewScriptSchema } from '@epoch/schema';

export async function generateInterviewOutline(
  guestName: string,
  topic?: string,
  angle?: string
) {
  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are a historical researcher and podcast producer. Create an outline for an interview with a historical figure.

Requirements:
- Research the guest's life, work, and historical context
- Develop 8-12 insightful questions
- Mix question types: background, achievements, controversies, personal reflections, legacy
- Include "what if" hypothetical questions
- Ensure questions are respectful but probing
- Provide research notes for authentic responses
- Cite sources for historical accuracy

The interview should feel like a modern podcast - conversational, engaging, insightful.`
      },
      {
        role: 'user',
        content: `Create an interview outline:
Guest: ${guestName}
${topic ? `Topic focus: ${topic}` : 'Topic: Broad career/life overview'}
${angle ? `Angle: ${angle}` : ''}

Design a compelling interview that brings this historical figure to life.`
      }
    ],
    response_format: { type: 'json_schema', json_schema: {
      name: 'interview_outline',
      strict: true,
      schema: InterviewOutlineSchema,
    }},
  });

  return completion.choices[0].message.parsed;
}

export async function generateInterviewScript(
  outline: z.infer<typeof InterviewOutlineSchema>
) {
  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are a master dialogue writer for historical podcasts. Convert the interview outline into natural, engaging conversation.

Style guidelines:
- HOST: Professional but warm, curious, asks follow-up questions
- GUEST: Speaks authentically in character, references their era and experiences
- Natural flow: interruptions, "hmm", "you know", thinking pauses
- GUEST should speak as if they're actually from their time period (language, references, worldview)
- Balance education with entertainment
- 2,000-2,800 words total (10-14 minutes)
- End segments naturally, not abruptly

Example dialogue:
HOST: "So, Dr. Einstein, when you published your theory of relativity, did you expect the controversy?"
GUEST: "Well, you know, in 1905, we physicists were grappling with some rather troubling inconsistencies in our understanding of light and motion. I didn't set out to be controversial - I simply followed the mathematics where it led me."
HOST: "But the idea that time itself could be relative must have seemed radical."
GUEST: "Oh, absolutely! My colleagues thought I'd gone mad. [laughs] But the beauty of physics is that nature doesn't care about our intuitions."`
      },
      {
        role: 'user',
        content: `Convert this outline into an interview script:\n\n${JSON.stringify(outline, null, 2)}`
      }
    ],
    response_format: { type: 'json_schema', json_schema: {
      name: 'interview_script',
      strict: true,
      schema: InterviewScriptSchema,
    }},
  });

  return completion.choices[0].message.parsed;
}

export async function generateInterviewAudio(
  script: z.infer<typeof InterviewScriptSchema>,
  hostVoice: string = 'onyx',
  guestVoice: string = 'echo'
) {
  const audioSegments: Buffer[] = [];

  // Generate intro
  const introAudio = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice: hostVoice,
    input: script.intro.text,
    speed: 1.0,
  });
  audioSegments.push(Buffer.from(await introAudio.arrayBuffer()));

  // Generate dialogue segments
  for (const segment of script.segments) {
    const voice = segment.speaker === 'HOST' ? hostVoice : guestVoice;

    const audio = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: voice,
      input: segment.text,
      speed: segment.speaker === 'GUEST' ? 0.95 : 1.0, // Slightly slower for guest (more thoughtful)
    });

    audioSegments.push(Buffer.from(await audio.arrayBuffer()));
  }

  // Generate outro
  const outroAudio = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice: hostVoice,
    input: script.outro.text,
    speed: 1.0,
  });
  audioSegments.push(Buffer.from(await outroAudio.arrayBuffer()));

  // Concatenate with brief pauses between speakers
  return concatenateAudioWithPauses(audioSegments, 0.3);
}

// Audio concatenation with silence is now fully implemented
// See apps/web/lib/ai/audio-utils.ts for the complete implementation
// Documentation: apps/web/lib/ai/AUDIO_UTILITIES.md
// Demo script: apps/web/lib/ai/audio-utils-demo.ts
```

#### API Endpoints

```typescript
// apps/web/app/api/generate/interview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { generateInterviewOutline, generateInterviewScript, generateInterviewAudio } from '@/lib/ai/interview-generator';
import { uploadToBlob } from '@/lib/storage';

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { guestName, topic, angle, hostVoice = 'onyx', guestVoice = 'echo' } = await req.json();

  if (!guestName) {
    return NextResponse.json({ error: 'Guest name required' }, { status: 400 });
  }

  try {
    // Step 1: Generate outline (10% progress)
    const outline = await generateInterviewOutline(guestName, topic, angle);

    // Step 2: Generate script (40% progress)
    const script = await generateInterviewScript(outline);

    // Step 3: Generate audio (70% progress)
    const audioBuffer = await generateInterviewAudio(script, hostVoice, guestVoice);

    // Step 4: Upload audio (85% progress)
    const audioUrl = await uploadToBlob(audioBuffer, `interviews/${guestName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.mp3`);

    // Step 5: Create episode and interview (95% progress)
    const episode = await prisma.episode.create({
      data: {
        title: `Interview with ${outline.guest.name}: ${outline.topic}`,
        description: `A fascinating conversation with ${outline.guest.name}, ${outline.guest.role}, about ${outline.topic}. ${outline.guest.biography}`,
        audioUrl,
        transcript: script.segments.map(s => `${s.speaker}: ${s.text}`).join('\n\n'),
        duration: script.estimatedDuration,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        type: 'INTERVIEW',
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

    return NextResponse.json({ success: true, episode });
  } catch (error) {
    console.error('Interview generation failed:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}

// apps/web/app/api/interviews/suggestions/route.ts
export async function GET(req: NextRequest) {
  // Suggest interview guests based on popular topics, user preferences, etc.
  const suggestions = [
    {
      name: 'Albert Einstein',
      role: 'Physicist',
      era: '20th Century',
      topics: ['Relativity', 'Quantum Mechanics', 'Philosophy of Science'],
      tagline: 'Unlock the secrets of spacetime',
    },
    {
      name: 'Cleopatra VII',
      role: 'Pharaoh of Egypt',
      era: 'Ancient Egypt',
      topics: ['Roman Politics', 'Ancient Egypt', 'Leadership'],
      tagline: 'The last pharaoh speaks',
    },
    {
      name: 'Leonardo da Vinci',
      role: 'Polymath',
      era: 'Renaissance',
      topics: ['Art', 'Engineering', 'Innovation'],
      tagline: 'Inside the mind of a genius',
    },
    // Add 20-30 more suggestions
  ];

  return NextResponse.json({ suggestions });
}
```

#### Frontend Components

```typescript
// apps/web/components/interview/InterviewPlayer.tsx
'use client';

import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { useState } from 'react';

interface InterviewPlayerProps {
  episode: {
    id: string;
    title: string;
    description: string;
    audioUrl: string;
    interview: {
      guestName: string;
      guestRole: string;
      guestEra: string;
      topic: string;
      questions: Array<{
        question: string;
        category: string;
      }>;
    };
  };
}

export function InterviewPlayer({ episode }: InterviewPlayerProps) {
  const [showQuestions, setShowQuestions] = useState(false);

  return (
    <div className="space-y-6">
      {/* Guest Card */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm opacity-90 mb-1">Interview with</div>
            <h2 className="text-3xl font-bold mb-2">{episode.interview.guestName}</h2>
            <div className="text-lg opacity-90">{episode.interview.guestRole}</div>
            <div className="text-sm opacity-75 mt-1">{episode.interview.guestEra}</div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Topic</div>
            <div className="text-lg font-semibold">{episode.interview.topic}</div>
          </div>
        </div>
      </div>

      <AudioPlayer audioUrl={episode.audioUrl} />

      {/* Interview Questions Preview */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <button
          onClick={() => setShowQuestions(!showQuestions)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-lg font-semibold">Interview Questions</h3>
          <span className="text-gray-400">{showQuestions ? '−' : '+'}</span>
        </button>

        {showQuestions && (
          <div className="mt-4 space-y-3">
            {episode.interview.questions.map((q, i) => (
              <div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                  {q.category}
                </div>
                <div className="text-gray-700 dark:text-gray-200">{q.question}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Interview */}
      <div className="flex gap-3">
        <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition">
          Share Interview
        </button>
        <button className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 py-2 px-4 rounded-lg transition">
          Request Another Guest
        </button>
      </div>
    </div>
  );
}
```

```typescript
// apps/web/app/interviews/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewInterviewPage() {
  const [guestName, setGuestName] = useState('');
  const [topic, setTopic] = useState('');
  const [angle, setAngle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  async function handleGenerate() {
    setIsGenerating(true);

    const response = await fetch('/api/generate/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestName, topic, angle }),
    });

    const data = await response.json();

    if (data.success) {
      router.push(`/episodes/${data.episode.id}`);
    } else {
      alert('Failed to generate interview');
      setIsGenerating(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Interview</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Historical Figure *
          </label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="e.g., Marie Curie, Marcus Aurelius, Ada Lovelace"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Topic (optional)
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Discovery of Radium, Stoic Philosophy"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Angle (optional)
          </label>
          <input
            type="text"
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
            placeholder="e.g., Personal struggles, Leadership lessons, Modern parallels"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!guestName || isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isGenerating ? 'Generating Interview...' : 'Generate Interview'}
        </button>
      </div>
    </div>
  );
}
```

### Implementation Phases

**Phase 1: Core Infrastructure (1 week)**
- Database schema migration
- Zod schemas for interview content
- Interview outline generator
- Historical research prompting

**Phase 2: Content Generation (2 weeks)**
- Interview script generator
- Dialogue quality testing
- Multi-voice audio generation
- Voice pairing optimization
- Test with 5-10 historical figures

**Phase 3: API Development (1 week)**
- Interview generation endpoint
- Guest suggestions API
- Interview metadata endpoints

**Phase 4: Frontend (2 weeks)**
- Interview player component
- Guest card design
- Interview creation form
- Interview catalog/browse page
- Search and filtering

**Phase 5: User Engagement (1 week)**
- User-requested interview queue
- Voting on next guests
- Interview sharing
- Email notifications for new interviews

**Phase 6: Polish & Launch (1 week)**
- Voice fine-tuning
- Dialogue natural-ness improvements
- SEO optimization for interviews
- Launch with 20-30 pre-generated interviews

**Total: 8 weeks**

---

## Cross-Feature Considerations

### Technical Infrastructure

All three features share:
- Multi-voice TTS audio generation
- Complex AI prompting strategies
- Advanced episode type handling
- Enhanced email templates
- Extended RSS feed support

### Database Migrations

```bash
# Migration order
1. Add EpisodeType enum
2. Add type field to Episode model
3. Create Debate, Interview, Adventure schemas
4. Run migration
```

### Voice Management

```typescript
// apps/web/lib/tts/voice-config.ts
export const VOICE_PROFILES = {
  // Existing
  narrator: { provider: 'openai', voice: 'alloy' },

  // Debate voices
  debateModerator: { provider: 'openai', voice: 'onyx' },
  debatePosition1: { provider: 'openai', voice: 'echo' },
  debatePosition2: { provider: 'openai', voice: 'fable' },

  // Interview voices
  interviewHost: { provider: 'openai', voice: 'onyx' },
  interviewGuest: { provider: 'openai', voice: 'echo' }, // Configurable per guest

  // Adventure narrator
  adventureNarrator: { provider: 'openai', voice: 'nova' },
};
```

### Cost Estimation

Per episode costs (approximate):

**Debates:**
- GPT-4: 2 calls × $0.03 = $0.06
- TTS: 3,000 words × $0.015/1K = $0.045
- Storage: ~15MB × $0.15/GB = $0.002
- **Total: ~$0.11 per debate episode**

**Adventures:**
- GPT-4: 1 outline + 10 nodes × $0.03 = $0.33
- TTS: 10 × 1,200 words × $0.015/1K = $0.18
- Storage: 10 × 8MB × $0.15/GB = $0.012
- **Total: ~$0.52 per adventure (all nodes)**

**Interviews:**
- GPT-4: 2 calls × $0.03 = $0.06
- TTS: 2,500 words × $0.015/1K = $0.0375
- Storage: ~12MB × $0.15/GB = $0.002
- **Total: ~$0.10 per interview**

### Launch Strategy

**Week 1-2: Interviews** (fastest to implement, immediate value)
- Launch with 20 pre-generated interviews
- Enable user requests
- Build hype

**Week 3-6: Debates** (unique format, viral potential)
- Launch with 10 debates
- Community voting drives next topics
- Social media engagement

**Week 7-12: Adventures** (most complex, highest engagement)
- Launch with 2-3 complete adventures
- Email-driven engagement
- Premium feature potential

---

## Success Metrics

### Interviews
- Completion rate (% who finish episode)
- Request volume (user-requested guests)
- Share rate
- Average rating

### Debates
- Vote participation rate
- Follow-up episode unlock rate
- Social sharing of results
- Return visitor rate

### Adventures
- Path completion rate
- Average nodes per journey
- Replay rate (different paths)
- Email click-through rate on choices

---

## Next Steps

1. Review and approve one feature to start with
2. Set up development environment
3. Create database migrations
4. Begin Phase 1 implementation
5. Test AI generation quality
6. Iterate based on results

**Recommendation: Start with Interviews** - Quickest to implement, easiest to test, provides immediate value, and establishes the multi-voice audio pipeline needed for the other two features.
