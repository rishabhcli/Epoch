import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { z } from 'zod';
import {
  interactionRateLimit,
  getClientIdentifier,
  getUserIdentifier,
  withRateLimit,
  rateLimitResponse
} from '@/lib/rate-limit';

const VoteRequestSchema = z.object({
  debateId: z.string(),
  position: z.number().int().min(1).max(2),
  reasoning: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  // Apply rate limiting (20 requests per minute)
  const session = await auth();
  const identifier = getUserIdentifier(req, session?.user?.id);
  const rateLimit = await withRateLimit(req, interactionRateLimit, {
    identifier,
    fallbackLimit: 20,
    fallbackWindow: 60000, // 1 minute
  });

  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.headers);
  }

  try {
    const body = await req.json();

    const validation = VoteRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { debateId, position, reasoning } = validation.data;

    // Check if debate exists
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
    });

    if (!debate) {
      return NextResponse.json({ error: 'Debate not found' }, { status: 404 });
    }

    // For anonymous users, use session ID from cookies or create one
    let sessionId = req.cookies.get('debate_session')?.value;
    const ipAddress = getClientIdentifier(req);

    // Generate a session ID for anonymous users if they don't have one
    if (!session?.user?.id && !sessionId) {
      // Generate a cryptographically secure session ID
      sessionId = crypto.randomUUID();
    }

    // Ensure we always have either userId or sessionId (never both null)
    if (!session?.user?.id && !sessionId) {
      return NextResponse.json(
        { error: 'Unable to track vote. Please enable cookies.' },
        { status: 400 }
      );
    }

    // Create or update vote
    let vote;
    let response;

    if (session?.user?.id) {
      // Authenticated user
      vote = await prisma.debateVote.upsert({
        where: {
          debateId_userId: {
            debateId,
            userId: session.user.id,
          },
        },
        create: {
          debateId,
          userId: session.user.id,
          position,
          reasoning,
          ipAddress,
        },
        update: {
          position,
          reasoning,
        },
      });
    } else if (sessionId) {
      // Anonymous user with session
      vote = await prisma.debateVote.upsert({
        where: {
          debateId_sessionId: {
            debateId,
            sessionId,
          },
        },
        create: {
          debateId,
          position,
          reasoning,
          sessionId,
          ipAddress,
        },
        update: {
          position,
          reasoning,
        },
      });
    } else {
      // This should never happen due to check above, but TypeScript needs it
      return NextResponse.json(
        { error: 'Unable to track vote' },
        { status: 400 }
      );
    }

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

    const responseData = {
      success: true,
      vote: {
        position: vote.position,
        createdAt: vote.createdAt,
      },
      unlockedEpisodes: followUps.map((f) => ({
        id: f.episode.id,
        title: f.episode.title,
        description: f.episode.description,
      })),
      message: followUps.length > 0 ? 'Vote recorded and new episodes unlocked!' : 'Vote recorded successfully',
    };

    const jsonResponse = NextResponse.json(responseData);

    // Add rate limit headers
    Object.entries(rateLimit.headers).forEach(([key, value]) => {
      jsonResponse.headers.set(key, value);
    });

    // Set session cookie for anonymous users
    if (!session?.user?.id && sessionId) {
      jsonResponse.cookies.set('debate_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    return jsonResponse;
  } catch (error) {
    console.error('Vote API error:', error);

    // Handle unique constraint violations
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'You have already voted on this debate' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to record vote',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
