import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import {
  generateInterviewOutline,
  generateInterviewScript,
  generateInterviewAudio,
  estimateInterviewDuration,
} from '@/lib/ai/interview-generator';
import { uploadAudio } from '@/lib/storage';
import { z } from 'zod';

const GenerateInterviewRequestSchema = z.object({
  guestName: z.string().min(1).max(200),
  topic: z.string().max(500).optional(),
  angle: z.string().max(500).optional(),
  hostVoice: z
    .enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'])
    .default('onyx'),
  guestVoice: z
    .enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'])
    .default('echo'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = GenerateInterviewRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { guestName, topic, angle, hostVoice, guestVoice } = validation.data;

    console.log(`[Interview Generation] Starting for guest: ${guestName}`);

    // Step 1: Generate interview outline (10% progress)
    console.log('[Interview Generation] Step 1/5: Generating outline...');
    const outline = await generateInterviewOutline(guestName, topic, angle);
    console.log(`[Interview Generation] Outline generated with ${outline.questions.length} questions`);

    // Step 2: Generate interview script (40% progress)
    console.log('[Interview Generation] Step 2/5: Generating script...');
    const script = await generateInterviewScript(outline);
    console.log(`[Interview Generation] Script generated with ${script.segments.length} segments (${script.totalWords} words)`);

    // Calculate estimated duration
    const estimatedDuration = estimateInterviewDuration(script.totalWords);

    // Step 3: Generate audio (70% progress)
    console.log('[Interview Generation] Step 3/5: Generating audio...');
    const audioBuffer = await generateInterviewAudio(
      script,
      hostVoice,
      guestVoice
    );
    console.log(`[Interview Generation] Audio generated (${audioBuffer.length} bytes)`);

    // Step 4: Upload audio (85% progress)
    console.log('[Interview Generation] Step 4/5: Uploading audio...');
    const guestSlug = guestName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const uploadResult = await uploadAudio(audioBuffer, {
      filename: `interview-${guestSlug}-${Date.now()}.mp3`,
      contentType: 'audio/mpeg',
    });
    console.log(`[Interview Generation] Audio uploaded to: ${uploadResult.url}`);

    // Step 5: Create episode and interview records (95% progress)
    console.log('[Interview Generation] Step 5/5: Creating database records...');

    // Create transcript from dialogue segments
    const transcript = [
      `${script.intro.speaker}: ${script.intro.text}`,
      ...script.segments.map((s) => `${s.speaker}: ${s.text}`),
      `${script.outro.speaker}: ${script.outro.text}`,
    ].join('\n\n');

    const episode = await prisma.episode.create({
      data: {
        title: `Interview with ${outline.guest.name}: ${outline.topic}`,
        subtitle: outline.angle,
        description: `A fascinating conversation with ${outline.guest.name}, ${outline.guest.role}, about ${outline.topic}. ${outline.guest.biography}`,
        topic: outline.topic,
        era: outline.guest.era,
        audioUrl: uploadResult.url,
        audioBytes: BigInt(uploadResult.bytes),
        transcript,
        duration: estimatedDuration,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        type: 'INTERVIEW',
        userId: session.user.id,
        sources: outline.sources,
        keywords: [
          outline.guest.name,
          outline.guest.role,
          outline.guest.era,
          outline.topic,
        ],
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

    console.log(`[Interview Generation] Complete! Episode ID: ${episode.id}`);

    return NextResponse.json({
      success: true,
      episode: {
        id: episode.id,
        title: episode.title,
        description: episode.description,
        audioUrl: episode.audioUrl,
        duration: episode.duration,
        interview: episode.interview,
      },
      message: 'Interview generated successfully',
    });
  } catch (error) {
    console.error('[Interview Generation] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate interview',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
