import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import {
  generateAdventureOutline,
  generateNodeScript,
  generateNodeAudio,
  validateAdventureStructure,
  estimateNodeDuration,
} from '@/lib/ai/adventure-generator';
import { uploadAudio } from '@/lib/storage';
import { z } from 'zod';

const GenerateAdventureRequestSchema = z.object({
  concept: z.string().min(10).max(500),
  historicalContext: z.string().min(50).max(1000),
  narratorVoice: z
    .enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'])
    .default('nova'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = GenerateAdventureRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { concept, historicalContext, narratorVoice } = validation.data;

    console.log(`[Adventure Generation] Starting for concept: ${concept}`);

    // Step 1: Generate adventure outline (10% progress)
    console.log('[Adventure Generation] Step 1/6: Generating outline...');
    const outline = await generateAdventureOutline(concept, historicalContext);
    console.log(
      `[Adventure Generation] Outline generated with ${outline.nodes.length} nodes`
    );

    // Validate adventure structure
    const validation_result = validateAdventureStructure(outline);
    if (!validation_result.valid) {
      console.error('[Adventure Generation] Invalid structure:', validation_result.errors);
      return NextResponse.json(
        {
          error: 'Generated adventure has invalid structure',
          details: validation_result.errors,
        },
        { status: 500 }
      );
    }

    // Step 2: Generate scripts for all nodes (20-40% progress)
    console.log('[Adventure Generation] Step 2/6: Generating scripts...');
    const scripts = [];
    for (let i = 0; i < outline.nodes.length; i++) {
      const node = outline.nodes[i];
      console.log(`  Generating script for node ${i + 1}/${outline.nodes.length}: ${node.title}`);

      const script = await generateNodeScript(
        node,
        {
          title: outline.title,
          setting: outline.historicalSetting,
          storyline: outline.storyline,
        },
        [] // No path history for outline generation
      );

      scripts.push({ nodeId: node.id, script });
    }
    console.log(`[Adventure Generation] Generated ${scripts.length} scripts`);

    // Step 3: Generate audio for all nodes (40-70% progress)
    console.log('[Adventure Generation] Step 3/6: Generating audio...');
    const audioBuffers = [];
    for (let i = 0; i < scripts.length; i++) {
      const { nodeId, script } = scripts[i];
      console.log(`  Generating audio for node ${i + 1}/${scripts.length}`);

      const audioBuffer = await generateNodeAudio(script, narratorVoice);
      audioBuffers.push({ nodeId, buffer: audioBuffer, wordCount: script.totalWords });
    }
    console.log(`[Adventure Generation] Generated ${audioBuffers.length} audio files`);

    // Step 4: Upload all audio files (70-80% progress)
    console.log('[Adventure Generation] Step 4/6: Uploading audio files...');
    const uploads = [];
    for (let i = 0; i < audioBuffers.length; i++) {
      const { nodeId, buffer, wordCount } = audioBuffers[i];
      const node = outline.nodes.find((n) => n.id === nodeId);

      const slug = node!.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const uploadResult = await uploadAudio(buffer, {
        filename: `adventure-${slug}-${Date.now()}.mp3`,
        contentType: 'audio/mpeg',
      });

      uploads.push({
        nodeId,
        audioUrl: uploadResult.url,
        audioBytes: uploadResult.bytes,
        duration: estimateNodeDuration(wordCount),
      });

      console.log(`  Uploaded ${i + 1}/${audioBuffers.length}: ${uploadResult.url}`);
    }

    // Step 5: Create database records (80-95% progress)
    console.log('[Adventure Generation] Step 5/6: Creating database records...');

    // First, create all episodes (without nodes referencing them yet)
    const episodeRecords = [];
    for (let i = 0; i < outline.nodes.length; i++) {
      const node = outline.nodes[i];
      const nodeScript = scripts.find((s) => s.nodeId === node.id)!.script;
      const upload = uploads.find((u) => u.nodeId === node.id)!;

      const episode = await prisma.episode.create({
        data: {
          title: node.title,
          description: node.narrative,
          topic: outline.title,
          era: outline.historicalSetting.era,
          audioUrl: upload.audioUrl,
          audioBytes: BigInt(upload.audioBytes),
          transcript: nodeScript.narrative,
          duration: upload.duration,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          type: 'ADVENTURE',
          userId: session.user.id,
          keywords: [
            outline.title,
            outline.historicalSetting.era,
            node.nodeType,
          ],
        },
      });

      episodeRecords.push({ nodeId: node.id, episodeId: episode.id });
    }

    // Create adventure (without startNodeId yet)
    const adventure = await prisma.adventure.create({
      data: {
        title: outline.title,
        description: outline.description,
        era: outline.historicalSetting.era,
        startNodeId: 'temp', // Temporary, will update
        isPublished: true,
      },
    });

    // Create adventure nodes
    const nodeRecords = [];
    for (const node of outline.nodes) {
      const episodeId = episodeRecords.find((e) => e.nodeId === node.id)!.episodeId;

      const adventureNode = await prisma.adventureNode.create({
        data: {
          adventureId: adventure.id,
          episodeId,
          title: node.title,
          description: node.narrative,
          nodeType: node.nodeType,
          decisionPrompt: node.choices ? 'What do you do?' : null,
          endingType: node.endingType || null,
        },
      });

      nodeRecords.push({ nodeId: node.id, dbNodeId: adventureNode.id });
    }

    // Create choices
    for (const node of outline.nodes) {
      if (node.choices) {
        const dbNodeId = nodeRecords.find((n) => n.nodeId === node.id)!.dbNodeId;

        for (const choice of node.choices) {
          const nextDbNodeId = nodeRecords.find((n) => n.nodeId === choice.nextNodeId)!.dbNodeId;

          await prisma.choice.create({
            data: {
              nodeId: dbNodeId,
              text: choice.text,
              description: choice.description,
              nextNodeId: nextDbNodeId,
              consequences: choice.consequences,
            },
          });
        }
      }
    }

    // Update adventure with correct startNodeId
    const startNode = outline.nodes.find((n) => n.nodeType === 'START');
    if (startNode) {
      const startDbNodeId = nodeRecords.find((n) => n.nodeId === startNode.id)!.dbNodeId;

      await prisma.adventure.update({
        where: { id: adventure.id },
        data: { startNodeId: startDbNodeId },
      });
    }

    console.log(`[Adventure Generation] Complete! Adventure ID: ${adventure.id}`);

    // Step 6: Return result (100% progress)
    return NextResponse.json({
      success: true,
      adventure: {
        id: adventure.id,
        title: adventure.title,
        description: adventure.description,
        nodesCount: outline.nodes.length,
      },
      message: 'Adventure generated successfully',
    });
  } catch (error) {
    console.error('[Adventure Generation] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate adventure',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
