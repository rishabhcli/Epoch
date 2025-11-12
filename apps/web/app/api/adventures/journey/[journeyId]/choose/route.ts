import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { z } from 'zod';

const ChoiceRequestSchema = z.object({
  choiceId: z.string(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ journeyId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { journeyId } = await params;
    const body = await req.json();

    const validation = ChoiceRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { choiceId } = validation.data;

    // Get journey with current node
    const journey = await prisma.userJourney.findUnique({
      where: { id: journeyId },
      include: {
        currentNode: {
          include: {
            choices: true,
          },
        },
      },
    });

    if (!journey) {
      return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
    }

    if (journey.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (journey.isCompleted) {
      return NextResponse.json(
        { error: 'Journey already completed' },
        { status: 409 }
      );
    }

    // Verify choice belongs to current node
    const choice = await prisma.choice.findUnique({
      where: { id: choiceId },
      include: {
        nextNode: {
          include: {
            episode: true,
            choices: true,
          },
        },
      },
    });

    if (!choice) {
      return NextResponse.json({ error: 'Choice not found' }, { status: 404 });
    }

    if (!choice.nextNode) {
      return NextResponse.json(
        { error: 'Invalid choice: next node not found' },
        { status: 500 }
      );
    }

    if (choice.nodeId !== journey.currentNodeId) {
      return NextResponse.json(
        { error: 'Invalid choice for current node' },
        { status: 400 }
      );
    }

    // Update journey with new node and path
    const updatedPath = [
      ...(Array.isArray(journey.path) ? journey.path : []),
      {
        nodeId: journey.currentNodeId,
        choiceId: choice.id,
        choiceText: choice.text,
        timestamp: new Date().toISOString(),
      },
    ];

    const isEnding = choice.nextNode.nodeType === 'ENDING';

    const updatedJourney = await prisma.userJourney.update({
      where: { id: journeyId },
      data: {
        currentNodeId: choice.nextNodeId,
        path: updatedPath,
        isCompleted: isEnding,
        completedAt: isEnding ? new Date() : null,
      },
      include: {
        currentNode: {
          include: {
            episode: true,
            choices: true,
          },
        },
      },
    });

    // TODO: Send email notification with next episode

    return NextResponse.json({
      success: true,
      journey: {
        id: updatedJourney.id,
        currentNode: updatedJourney.currentNode,
        path: updatedJourney.path,
        isCompleted: updatedJourney.isCompleted,
      },
      nextEpisode: updatedJourney.currentNode.episode,
      choices: updatedJourney.currentNode.choices,
      isEnding,
      message: isEnding
        ? 'Journey completed! You have reached an ending.'
        : 'Choice recorded. Continue to the next episode.',
    });
  } catch (error) {
    console.error('Choose action error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process choice',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
