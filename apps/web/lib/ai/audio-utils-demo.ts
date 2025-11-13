/**
 * Audio Utilities Demo Script
 *
 * This script demonstrates the audio concatenation functionality
 * and can be used to test the audio utilities module.
 *
 * Run with: npx tsx apps/web/lib/ai/audio-utils-demo.ts
 */

import {
  concatenateAudioWithSilence,
  concatenateAudioWithSilenceSafe,
  generateSilence,
  simpleConcatenateAudio,
} from './audio-utils';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Demo 1: Generate silence audio
 */
async function demoGenerateSilence() {
  console.log('\n=== Demo 1: Generate Silence ===');
  console.log('Generating 1 second of silence...');

  try {
    const silence = await generateSilence(1.0);
    console.log(`✓ Successfully generated ${silence.length} bytes of silence`);

    // Save to file for testing
    const outputPath = join(__dirname, 'demo-silence.mp3');
    writeFileSync(outputPath, silence);
    console.log(`✓ Saved to: ${outputPath}`);

    return silence;
  } catch (error) {
    console.error('✗ Failed to generate silence:', error);
    throw error;
  }
}

/**
 * Demo 2: Create sample audio segments
 * In a real scenario, these would come from TTS generation
 */
function createSampleAudioSegments(count: number = 3): Buffer[] {
  console.log(`\n=== Demo 2: Create Sample Audio Segments ===`);
  console.log(`Creating ${count} sample audio segments...`);

  // Create dummy MP3 buffers for demonstration
  // In production, these would be actual MP3 audio from TTS
  const segments = Array.from({ length: count }, (_, i) => {
    const dummyMp3Header = Buffer.from([
      0xFF, 0xFB, 0x90, 0x00, // MP3 frame sync and header
      ...Buffer.alloc(1024).fill(i + 1), // Dummy audio data
    ]);
    console.log(`  ✓ Segment ${i + 1}: ${dummyMp3Header.length} bytes`);
    return dummyMp3Header;
  });

  console.log(`✓ Created ${segments.length} sample segments`);
  return segments;
}

/**
 * Demo 3: Simple concatenation (no silence)
 */
function demoSimpleConcatenation(segments: Buffer[]) {
  console.log('\n=== Demo 3: Simple Concatenation (No Silence) ===');
  console.log('Concatenating segments without silence...');

  try {
    const result = simpleConcatenateAudio(segments);
    console.log(`✓ Successfully concatenated ${segments.length} segments`);
    console.log(`✓ Total size: ${result.length} bytes`);

    // Save to file
    const outputPath = join(__dirname, 'demo-simple-concat.mp3');
    writeFileSync(outputPath, result);
    console.log(`✓ Saved to: ${outputPath}`);

    return result;
  } catch (error) {
    console.error('✗ Failed simple concatenation:', error);
    throw error;
  }
}

/**
 * Demo 4: Concatenation with silence (using ffmpeg)
 */
async function demoConcatenationWithSilence(segments: Buffer[], pauseDuration: number = 0.5) {
  console.log('\n=== Demo 4: Concatenation with Silence (FFmpeg) ===');
  console.log(`Concatenating ${segments.length} segments with ${pauseDuration}s pauses...`);

  try {
    const result = await concatenateAudioWithSilence(segments, pauseDuration);
    console.log(`✓ Successfully concatenated with silence`);
    console.log(`✓ Total size: ${result.length} bytes`);
    console.log(`✓ Added ${segments.length - 1} silence segments of ${pauseDuration}s each`);

    // Save to file
    const outputPath = join(__dirname, 'demo-concat-with-silence.mp3');
    writeFileSync(outputPath, result);
    console.log(`✓ Saved to: ${outputPath}`);

    return result;
  } catch (error) {
    console.error('✗ Failed concatenation with silence:', error);
    throw error;
  }
}

/**
 * Demo 5: Safe concatenation with fallback
 */
async function demoSafeConcatenation(segments: Buffer[], pauseDuration: number = 0.3) {
  console.log('\n=== Demo 5: Safe Concatenation with Fallback ===');
  console.log(`Using safe concatenation (with automatic fallback)...`);

  try {
    const result = await concatenateAudioWithSilenceSafe(segments, pauseDuration);
    console.log(`✓ Successfully concatenated (either with silence or fallback)`);
    console.log(`✓ Total size: ${result.length} bytes`);

    // Save to file
    const outputPath = join(__dirname, 'demo-safe-concat.mp3');
    writeFileSync(outputPath, result);
    console.log(`✓ Saved to: ${outputPath}`);

    return result;
  } catch (error) {
    console.error('✗ Failed safe concatenation:', error);
    throw error;
  }
}

/**
 * Demo 6: Simulating interview audio generation
 */
async function demoInterviewAudioGeneration() {
  console.log('\n=== Demo 6: Simulating Interview Audio Generation ===');
  console.log('This simulates how interviews use the audio utilities...');

  // Simulate interview segments
  console.log('Creating interview segments:');
  console.log('  - Intro (Host)');
  console.log('  - Segment 1 (Host question)');
  console.log('  - Segment 2 (Guest response)');
  console.log('  - Segment 3 (Host follow-up)');
  console.log('  - Segment 4 (Guest response)');
  console.log('  - Outro (Host)');

  const segments = createSampleAudioSegments(6);

  console.log('\nApplying 0.3s pauses between speakers (interview style)...');
  const result = await concatenateAudioWithSilenceSafe(segments, 0.3);

  console.log(`✓ Interview audio generated: ${result.length} bytes`);
  const outputPath = join(__dirname, 'demo-interview.mp3');
  writeFileSync(outputPath, result);
  console.log(`✓ Saved to: ${outputPath}`);

  return result;
}

/**
 * Demo 7: Simulating debate audio generation
 */
async function demoDebateAudioGeneration() {
  console.log('\n=== Demo 7: Simulating Debate Audio Generation ===');
  console.log('This simulates how debates use the audio utilities...');

  // Simulate debate segments
  console.log('Creating debate segments:');
  console.log('  - Intro (Moderator)');
  console.log('  - Segment 1 (Position 1)');
  console.log('  - Segment 2 (Position 2)');
  console.log('  - Segment 3 (Position 1)');
  console.log('  - Segment 4 (Position 2)');
  console.log('  - Outro (Moderator)');

  const segments = createSampleAudioSegments(6);

  console.log('\nApplying 0.5s pauses between speakers (debate style)...');
  const result = await concatenateAudioWithSilenceSafe(segments, 0.5);

  console.log(`✓ Debate audio generated: ${result.length} bytes`);
  const outputPath = join(__dirname, 'demo-debate.mp3');
  writeFileSync(outputPath, result);
  console.log(`✓ Saved to: ${outputPath}`);

  return result;
}

/**
 * Demo 8: Performance testing
 */
async function demoPerformanceTesting() {
  console.log('\n=== Demo 8: Performance Testing ===');

  const segmentCounts = [5, 10, 20];

  for (const count of segmentCounts) {
    console.log(`\nTesting with ${count} segments...`);
    const segments = createSampleAudioSegments(count);

    // Test simple concatenation
    const simpleStart = Date.now();
    simpleConcatenateAudio(segments);
    const simpleTime = Date.now() - simpleStart;
    console.log(`  Simple concatenation: ${simpleTime}ms`);

    // Test concatenation with silence
    try {
      const silenceStart = Date.now();
      await concatenateAudioWithSilence(segments, 0.5);
      const silenceTime = Date.now() - silenceStart;
      console.log(`  With silence (ffmpeg): ${silenceTime}ms`);
      console.log(`  Overhead: +${silenceTime - simpleTime}ms`);
    } catch (error) {
      console.log(`  With silence: Failed (ffmpeg not available)`);
    }
  }
}

/**
 * Demo 9: Error handling demonstration
 */
async function demoErrorHandling() {
  console.log('\n=== Demo 9: Error Handling ===');

  // Test with empty array
  console.log('\nTest 1: Empty segments array');
  try {
    await concatenateAudioWithSilence([], 0.5);
    console.log('  ✗ Should have thrown an error');
  } catch (error) {
    console.log('  ✓ Correctly threw error:', (error as Error).message);
  }

  // Test with single segment (should work)
  console.log('\nTest 2: Single segment (should work)');
  try {
    const segments = createSampleAudioSegments(1);
    const result = await concatenateAudioWithSilence(segments, 0.5);
    console.log(`  ✓ Successfully handled single segment: ${result.length} bytes`);
  } catch (error) {
    console.log('  ✗ Unexpected error:', (error as Error).message);
  }

  // Test safe concatenation (should always work)
  console.log('\nTest 3: Safe concatenation with potential ffmpeg failure');
  try {
    const segments = createSampleAudioSegments(3);
    const result = await concatenateAudioWithSilenceSafe(segments, 0.5);
    console.log(`  ✓ Safe concatenation succeeded: ${result.length} bytes`);
  } catch (error) {
    console.log('  ✗ Even safe concatenation failed:', (error as Error).message);
  }
}

/**
 * Main demo execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       Audio Utilities Demo Script                         ║');
  console.log('║       Testing audio concatenation functionality           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    // Run all demos
    await demoGenerateSilence();

    const segments = createSampleAudioSegments(5);

    demoSimpleConcatenation(segments);

    try {
      await demoConcatenationWithSilence(segments, 0.5);
    } catch (error) {
      console.log('Note: FFmpeg concatenation not available, continuing with other demos...');
    }

    await demoSafeConcatenation(segments, 0.3);
    await demoInterviewAudioGeneration();
    await demoDebateAudioGeneration();
    await demoPerformanceTesting();
    await demoErrorHandling();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    All Demos Complete!                    ║');
    console.log('║                                                            ║');
    console.log('║  Demo audio files have been created in this directory.    ║');
    console.log('║  Check the *.mp3 files to test playback.                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════════════════╗');
    console.error('║                    Demo Failed!                            ║');
    console.error('╚════════════════════════════════════════════════════════════╝');
    console.error('\nError:', error);
    process.exit(1);
  }
}

// Run the demo if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export for use in other scripts
export {
  demoGenerateSilence,
  demoSimpleConcatenation,
  demoConcatenationWithSilence,
  demoSafeConcatenation,
  demoInterviewAudioGeneration,
  demoDebateAudioGeneration,
  demoPerformanceTesting,
  demoErrorHandling,
};
