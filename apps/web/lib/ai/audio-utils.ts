/**
 * Audio Utilities
 * Utilities for audio manipulation including concatenation with silence
 */

import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import { Buffer } from 'buffer';

// Dynamically import ffmpeg binary path
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

// Configure ffmpeg to use the bundled binary
ffmpeg.setFfmpegPath(ffmpegInstaller.path as string);

/**
 * Generate silence audio buffer of specified duration
 * @param durationSeconds Duration of silence in seconds
 * @returns Buffer containing MP3 audio of silence
 */
export async function generateSilence(durationSeconds: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    const stream = ffmpeg()
      .input('anullsrc=r=44100:cl=stereo')
      .inputFormat('lavfi')
      .duration(durationSeconds)
      .audioCodec('libmp3lame')
      .audioBitrate('128k')
      .format('mp3')
      .on('error', (err) => {
        reject(new Error(`Failed to generate silence: ${err.message}`));
      })
      .on('end', () => {
        resolve(Buffer.concat(chunks));
      });

    const outputStream = stream.pipe() as Readable;

    outputStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    outputStream.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Concatenate multiple audio buffers with silence between them
 * @param segments Array of audio buffers (MP3 format)
 * @param pauseDuration Duration of silence between segments in seconds (default: 0.5)
 * @returns Buffer containing the concatenated audio
 */
export async function concatenateAudioWithSilence(
  segments: Buffer[],
  pauseDuration: number = 0.5
): Promise<Buffer> {
  if (segments.length === 0) {
    throw new Error('No audio segments provided');
  }

  if (segments.length === 1) {
    // No concatenation needed
    return segments[0];
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const command = ffmpeg();

    try {
      // Create a list of inputs: segment1, silence, segment2, silence, ..., lastSegment
      const inputs: Array<{ type: 'audio' | 'silence'; buffer?: Buffer }> = [];

      for (let i = 0; i < segments.length; i++) {
        inputs.push({ type: 'audio', buffer: segments[i] });

        // Add silence between segments (but not after the last one)
        if (i < segments.length - 1) {
          inputs.push({ type: 'silence' });
        }
      }

      // Add all inputs to the ffmpeg command
      inputs.forEach((input) => {
        if (input.type === 'audio' && input.buffer) {
          // Create a readable stream from the buffer
          const bufferStream = new Readable();
          bufferStream.push(input.buffer);
          bufferStream.push(null);

          command.input(bufferStream).inputFormat('mp3');
        } else if (input.type === 'silence') {
          command
            .input('anullsrc=r=44100:cl=stereo')
            .inputFormat('lavfi')
            .duration(pauseDuration);
        }
      });

      // Build the filter complex to concatenate all inputs
      const filterParts: string[] = [];
      for (let i = 0; i < inputs.length; i++) {
        filterParts.push(`[${i}:a]`);
      }
      const filterComplex = `${filterParts.join('')}concat=n=${inputs.length}:v=0:a=1[out]`;

      command
        .complexFilter([filterComplex])
        .map('[out]')
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .format('mp3')
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('error', (err) => {
          reject(new Error(`Failed to concatenate audio: ${err.message}`));
        })
        .on('end', () => {
          resolve(Buffer.concat(chunks));
        });

      const outputStream = command.pipe() as Readable;

      outputStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      outputStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Simple concatenation of audio buffers without silence (fallback method)
 * This is used as a fallback if ffmpeg fails
 * @param segments Array of audio buffers
 * @returns Buffer containing the concatenated audio
 */
export function simpleConcatenateAudio(segments: Buffer[]): Buffer {
  return Buffer.concat(segments);
}

/**
 * Concatenate audio buffers with silence, with fallback to simple concatenation
 * @param segments Array of audio buffers (MP3 format)
 * @param pauseDuration Duration of silence between segments in seconds
 * @returns Buffer containing the concatenated audio
 */
export async function concatenateAudioWithSilenceSafe(
  segments: Buffer[],
  pauseDuration: number = 0.5
): Promise<Buffer> {
  try {
    console.log(`Concatenating ${segments.length} audio segments with ${pauseDuration}s pauses...`);
    const result = await concatenateAudioWithSilence(segments, pauseDuration);
    console.log('Audio concatenation with silence successful');
    return result;
  } catch (error) {
    console.error('Failed to concatenate with silence, falling back to simple concatenation:', error);
    console.log('Using simple concatenation without pauses');
    return simpleConcatenateAudio(segments);
  }
}
