import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get published adventures with node count
    const adventures = await prisma.adventure.findMany({
      where: { isPublished: true },
      include: {
        startNode: {
          include: {
            episode: {
              select: {
                id: true,
                title: true,
                audioUrl: true,
                duration: true,
              },
            },
          },
        },
        _count: {
          select: {
            nodes: true,
            journeys: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.adventure.count({
      where: { isPublished: true },
    });

    return NextResponse.json({
      adventures: adventures.map((adventure) => ({
        id: adventure.id,
        title: adventure.title,
        description: adventure.description,
        era: adventure.era,
        nodesCount: adventure._count.nodes,
        journeysCount: adventure._count.journeys,
        startEpisode: adventure.startNode.episode,
        createdAt: adventure.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List adventures error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch adventures',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
