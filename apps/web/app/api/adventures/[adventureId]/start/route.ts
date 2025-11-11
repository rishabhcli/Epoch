import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ adventureId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { adventureId } = await params;

    // Get adventure with start node
    const adventure = await prisma.adventure.findUnique({
      where: { id: adventureId },
      include: {
        startNode: {
          include: {
            episode: true,
            choices: {
              include: {
                nextNode: {
                  include: {
                    episode: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!adventure) {
      return NextResponse.json({ error: 'Adventure not found' }, { status: 404 });
    }

    if (!adventure.isPublished) {
      return NextResponse.json({ error: 'Adventure not published' }, { status: 403 });
    }

    // Check if journey already exists
    const existingJourney = await prisma.userJourney.findUnique({
      where: {
        userId_adventureId: {
          userId: session.user.id,
          adventureId,
        },
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

    // If journey exists and is not completed, return it
    if (existingJourney && !existingJourney.isCompleted) {
      return NextResponse.json({
        journey: {
          id: existingJourney.id,
          adventureId: existingJourney.adventureId,
          currentNode: existingJourney.currentNode,
          path: existingJourney.path,
          isCompleted: existingJourney.isCompleted,
        },
        currentEpisode: existingJourney.currentNode.episode,
        choices: existingJourney.currentNode.choices,
        message: 'Continuing existing journey',
      });
    }

    // If journey exists but is completed, offer to restart
    if (existingJourney && existingJourney.isCompleted) {
      return NextResponse.json(
        {
          error: 'Journey already completed',
          message: 'You have already completed this adventure. Delete the old journey to start over.',
          journeyId: existingJourney.id,
        },
        { status: 409 }
      );
    }

    // Create new journey
    const journey = await prisma.userJourney.create({
      data: {
        userId: session.user.id,
        adventureId,
        currentNodeId: adventure.startNodeId,
        path: [],
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

    return NextResponse.json({
      success: true,
      journey: {
        id: journey.id,
        adventureId: journey.adventureId,
        currentNode: journey.currentNode,
        path: journey.path,
        isCompleted: journey.isCompleted,
      },
      currentEpisode: journey.currentNode.episode,
      choices: journey.currentNode.choices,
      message: 'Journey started successfully',
    });
  } catch (error) {
    console.error('Start journey error:', error);

    return NextResponse.json(
      {
        error: 'Failed to start journey',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
