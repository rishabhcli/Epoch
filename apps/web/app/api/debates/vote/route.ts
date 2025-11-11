import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { z } from 'zod';

const VoteRequestSchema = z.object({
  debateId: z.string(),
  position: z.number().int().min(1).max(2),
  reasoning: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
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
    const sessionId = req.cookies.get('debate_session')?.value || undefined;
    const ipAddress = req.headers.get('x-forwarded-for') || undefined;

    // Create or update vote
    let vote;
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
      return NextResponse.json(
        { error: 'Unable to track vote. Please enable cookies.' },
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

    return NextResponse.json({
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
    });
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
