import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import {
  generateDebateOutline,
  generateDebateScript,
  generateDebateAudio,
  estimateDebateDuration,
} from '@/lib/ai/debate-generator';
import { uploadAudio } from '@/lib/storage';
import { z } from 'zod';

const GenerateDebateRequestSchema = z.object({
  topic: z.string().min(1).max(500),
  question: z.string().min(10).max(500),
  moderatorVoice: z
    .enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'])
    .default('onyx'),
  position1Voice: z
    .enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'])
    .default('echo'),
  position2Voice: z
    .enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'])
    .default('fable'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = GenerateDebateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { topic, question, moderatorVoice, position1Voice, position2Voice } =
      validation.data;

    console.log(`[Debate Generation] Starting for topic: ${topic}`);
    console.log(`[Debate Generation] Question: ${question}`);

    // Step 1: Generate debate outline (10% progress)
    console.log('[Debate Generation] Step 1/5: Generating outline...');
    const outline = await generateDebateOutline(topic, question);
    console.log(
      `[Debate Generation] Outline generated. Position 1: ${outline.position1}, Position 2: ${outline.position2}`
    );

    // Step 2: Generate debate script (40% progress)
    console.log('[Debate Generation] Step 2/5: Generating script...');
    const script = await generateDebateScript(outline);
    console.log(
      `[Debate Generation] Script generated with ${script.segments.length} segments (${script.totalWords} words)`
    );

    // Calculate estimated duration
    const estimatedDuration = estimateDebateDuration(script.totalWords);

    // Step 3: Generate audio (70% progress)
    console.log('[Debate Generation] Step 3/5: Generating audio...');
    const audioBuffer = await generateDebateAudio(
      script,
      moderatorVoice,
      position1Voice,
      position2Voice
    );
    console.log(
      `[Debate Generation] Audio generated (${audioBuffer.length} bytes)`
    );

    // Step 4: Upload audio (85% progress)
    console.log('[Debate Generation] Step 4/5: Uploading audio...');
    const topicSlug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const uploadResult = await uploadAudio(audioBuffer, {
      filename: `debate-${topicSlug}-${Date.now()}.mp3`,
      contentType: 'audio/mpeg',
    });
    console.log(`[Debate Generation] Audio uploaded to: ${uploadResult.url}`);

    // Step 5: Create episode and debate records (95% progress)
    console.log('[Debate Generation] Step 5/5: Creating database records...');

    // Create transcript from script segments
    const transcript = [
      `MODERATOR: ${script.intro}`,
      ...script.segments.map((s) => `${s.speaker}: ${s.text}`),
      `MODERATOR: ${script.outro}`,
    ].join('\n\n');

    const episode = await prisma.episode.create({
      data: {
        title: `Debate: ${question}`,
        subtitle: `${outline.position1} vs ${outline.position2}`,
        description: `A thought-provoking debate exploring: ${question}. Two expert advocates present compelling arguments on both sides of this historical controversy. ${outline.historicalContext}`,
        topic,
        audioUrl: uploadResult.url,
        audioBytes: BigInt(uploadResult.bytes),
        transcript,
        duration: estimatedDuration,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        type: 'DEBATE',
        userId: session.user.id,
        sources: [], // Sources are embedded in arguments
        keywords: [topic, outline.position1, outline.position2, 'debate'],
        debate: {
          create: {
            topic,
            question: outline.question,
            position1: outline.position1,
            position2: outline.position2,
            argument1: outline.argument1,
            argument2: outline.argument2,
          },
        },
      },
      include: { debate: true },
    });

    console.log(`[Debate Generation] Complete! Episode ID: ${episode.id}`);

    return NextResponse.json({
      success: true,
      episode: {
        id: episode.id,
        title: episode.title,
        description: episode.description,
        audioUrl: episode.audioUrl,
        duration: episode.duration,
        debate: episode.debate,
      },
      message: 'Debate generated successfully',
    });
  } catch (error) {
    console.error('[Debate Generation] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate debate',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
