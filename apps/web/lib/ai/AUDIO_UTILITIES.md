# Audio Utilities Documentation

## Overview

The audio utilities module provides advanced audio manipulation capabilities for Epoch Pod, specifically designed to handle multi-voice podcast generation with natural-sounding transitions between speakers.

## Features

- **Audio Concatenation with Silence**: Merge multiple audio segments with configurable silence pauses between them
- **Fallback Support**: Gracefully falls back to simple concatenation if ffmpeg processing fails
- **Error Handling**: Comprehensive error handling with detailed logging
- **Format Support**: Optimized for MP3 format at 128kbps bitrate

## Installation

The module requires the following dependencies (already installed):

```bash
npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg @types/fluent-ffmpeg
```

## API Reference

### `concatenateAudioWithSilence(segments, pauseDuration)`

Concatenates multiple audio buffers with silence between them using ffmpeg.

**Parameters:**
- `segments` (Buffer[]): Array of audio buffers in MP3 format
- `pauseDuration` (number): Duration of silence between segments in seconds (default: 0.5)

**Returns:** Promise<Buffer> - Concatenated audio buffer

**Throws:** Error if concatenation fails

**Example:**
```typescript
import { concatenateAudioWithSilence } from './audio-utils';

const segment1 = Buffer.from(...); // First audio segment
const segment2 = Buffer.from(...); // Second audio segment

const result = await concatenateAudioWithSilence(
  [segment1, segment2],
  0.5  // 0.5 seconds of silence
);
```

---

### `concatenateAudioWithSilenceSafe(segments, pauseDuration)`

Safe wrapper around `concatenateAudioWithSilence` with automatic fallback.

**Parameters:**
- `segments` (Buffer[]): Array of audio buffers in MP3 format
- `pauseDuration` (number): Duration of silence between segments in seconds (default: 0.5)

**Returns:** Promise<Buffer> - Concatenated audio buffer

**Behavior:**
- First attempts concatenation with silence using ffmpeg
- On failure, automatically falls back to simple concatenation
- Logs all operations for debugging

**Example:**
```typescript
import { concatenateAudioWithSilenceSafe } from './audio-utils';

// This will always succeed (either with silence or without)
const result = await concatenateAudioWithSilenceSafe(audioSegments, 0.3);
```

---

### `generateSilence(durationSeconds)`

Generates a buffer containing silence of specified duration.

**Parameters:**
- `durationSeconds` (number): Duration of silence to generate

**Returns:** Promise<Buffer> - Buffer containing MP3 audio of silence

**Example:**
```typescript
import { generateSilence } from './audio-utils';

const silence = await generateSilence(1.0); // 1 second of silence
```

---

### `simpleConcatenateAudio(segments)`

Simple concatenation without silence (used as fallback).

**Parameters:**
- `segments` (Buffer[]): Array of audio buffers

**Returns:** Buffer - Concatenated audio buffer

**Example:**
```typescript
import { simpleConcatenateAudio } from './audio-utils';

const result = simpleConcatenateAudio([segment1, segment2]);
```

## Usage in Epoch Pod

### Interview Generation

Interviews use **0.3 seconds** of silence between speakers for natural conversational flow:

```typescript
// From interview-generator.ts
const audioSegments = [introBuffer, ...segmentBuffers, outroBuffer];
const finalAudio = await concatenateAudioWithSilenceSafe(audioSegments, 0.3);
```

### Debate Generation

Debates use **0.5 seconds** of silence between speakers for better clarity:

```typescript
// From debate-generator.ts
const audioSegments = [introBuffer, ...segmentBuffers, outroBuffer];
const finalAudio = await concatenateAudioWithSilenceSafe(audioSegments, 0.5);
```

## Technical Details

### FFmpeg Configuration

The module uses `@ffmpeg-installer/ffmpeg` to bundle ffmpeg binaries for cross-platform compatibility:

```typescript
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path as string);
```

### Concatenation Process

1. **Input Preparation**: Creates alternating sequence of audio segments and silence
2. **Stream Conversion**: Converts Buffer objects to Readable streams for ffmpeg
3. **Filter Complex**: Uses ffmpeg's concat filter to merge all inputs
4. **Output**: Returns concatenated audio as a single Buffer

### Filter Complex Example

For 3 audio segments with silence between them:
```
[0:a][1:a][2:a][3:a][4:a]concat=n=5:v=0:a=1[out]
```

Where:
- `0:a` = First audio segment
- `1:a` = First silence
- `2:a` = Second audio segment
- `3:a` = Second silence
- `4:a` = Third audio segment

## Performance Considerations

### Memory Usage

- Audio segments are held in memory as Buffers
- For large episodes, consider processing in chunks
- Typical episode: 10-15 segments × ~500KB = ~5-7MB in memory

### Processing Time

- Concatenation time depends on:
  - Number of segments
  - Total audio duration
  - System CPU performance
- Typical processing: ~1-3 seconds for 10-15 segments

### Optimization Tips

1. **Batch Processing**: Generate all TTS audio first, then concatenate once
2. **Caching**: Cache generated silence buffers for reuse
3. **Parallel Processing**: Generate multiple segments concurrently

## Error Handling

The module implements comprehensive error handling:

### Common Errors

1. **FFmpeg Not Found**: Falls back to simple concatenation
2. **Invalid Input Format**: Throws descriptive error
3. **Memory Issues**: Throws with memory details

### Logging

All operations are logged for debugging:

```
Concatenating 15 audio segments with 0.3s pauses...
FFmpeg command: ffmpeg -f mp3 -i pipe:0 ...
Audio concatenation with silence successful
```

## Troubleshooting

### Issue: FFmpeg not working

**Symptoms:** Always falls back to simple concatenation

**Solutions:**
1. Verify ffmpeg binary is installed: `console.log(ffmpegInstaller.path)`
2. Check system permissions
3. Ensure @ffmpeg-installer/ffmpeg is properly installed

### Issue: Out of memory errors

**Symptoms:** Process crashes during concatenation

**Solutions:**
1. Reduce number of segments
2. Increase Node.js memory limit: `node --max-old-space-size=4096`
3. Process episodes in smaller batches

### Issue: Poor audio quality

**Symptoms:** Artifacts or distortion in output

**Solutions:**
1. Verify input audio quality (should be 128kbps MP3)
2. Check sample rate consistency (44100 Hz)
3. Ensure all segments use same audio format

## Future Enhancements

Potential improvements to consider:

1. **Dynamic Bitrate**: Support multiple bitrate options
2. **Format Conversion**: Support for other audio formats (AAC, OGG)
3. **Crossfading**: Add crossfade between segments instead of silence
4. **Normalization**: Audio level normalization across segments
5. **Metadata Preservation**: Maintain ID3 tags through concatenation
6. **Streaming Output**: Stream to cloud storage instead of buffering

## Testing

### Manual Testing

See `audio-utils-demo.ts` for a complete testing script.

### Integration Testing

Test the module in context:

```typescript
// Generate a sample interview
const outline = await generateInterviewOutline("Albert Einstein");
const script = await generateInterviewScript(outline);
const audio = await generateInterviewAudio(script);

// Verify audio was generated
console.log(`Generated ${audio.length} bytes of audio`);
```

## Support

For issues or questions:
- Check logs for error messages
- Verify ffmpeg installation
- Review this documentation
- Check the codebase for usage examples

## Changelog

### Version 1.0.0 (Current)

- Initial implementation
- Support for MP3 format
- Configurable pause duration
- Fallback to simple concatenation
- Comprehensive error handling
- Full logging support
- Cross-platform ffmpeg binary bundling

## License

Part of the Epoch Pod project. See main project LICENSE for details.
