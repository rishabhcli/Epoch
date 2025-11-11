import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ debateId: string }> }
) {
  try {
    const { debateId } = await params;

    // Get debate info
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      select: {
        question: true,
        position1: true,
        position2: true,
        topic: true,
      },
    });

    if (!debate) {
      return NextResponse.json({ error: 'Debate not found' }, { status: 404 });
    }

    // Get vote counts grouped by position
    const voteStats = await prisma.debateVote.groupBy({
      by: ['position'],
      where: { debateId },
      _count: true,
    });

    const position1Votes = voteStats.find((s) => s.position === 1)?._count || 0;
    const position2Votes = voteStats.find((s) => s.position === 2)?._count || 0;
    const totalVotes = position1Votes + position2Votes;

    // Calculate percentages
    const position1Percentage = totalVotes > 0 ? (position1Votes / totalVotes) * 100 : 0;
    const position2Percentage = totalVotes > 0 ? (position2Votes / totalVotes) * 100 : 0;

    return NextResponse.json({
      debate: {
        question: debate.question,
        topic: debate.topic,
      },
      results: {
        position1: {
          name: debate.position1,
          votes: position1Votes,
          percentage: Math.round(position1Percentage * 10) / 10,
        },
        position2: {
          name: debate.position2,
          votes: position2Votes,
          percentage: Math.round(position2Percentage * 10) / 10,
        },
        totalVotes,
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch debate stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
