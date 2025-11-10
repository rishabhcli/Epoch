/**
 * Agent builder (Phase 14)
 * Builder for constructing episode content
 */

import type {
  Outline,
  OutlineSection,
  Script,
  ScriptSection,
  Citation,
} from "@epoch/schema";
import { deduplicateCitations, extractKeywords } from "../tools";

/**
 * Content assembly options
 */
export interface ContentAssemblyOptions {
  includeIntroduction?: boolean;
  includeConclusion?: boolean;
  citationStyle?: "inline" | "endnotes" | "none";
  wordCountTarget?: number;
}

/**
 * Assembled content structure
 */
export interface AssembledContent {
  fullText: string;
  wordCount: number;
  estimatedDuration: number; // seconds
  sections: string[];
  citations: Citation[];
  keywords: string[];
  metadata: {
    hasIntroduction: boolean;
    hasConclusion: boolean;
    sectionCount: number;
    citationCount: number;
  };
}

/**
 * Transcript formatting options
 */
export interface TranscriptFormatOptions {
  includeTimestamps?: boolean;
  includeSpeakerLabels?: boolean;
  format?: "plain" | "srt" | "vtt" | "json";
}

/**
 * Formatted transcript
 */
export interface FormattedTranscript {
  content: string;
  format: string;
  wordCount: number;
  duration: number;
}

/**
 * Assembles script sections into complete episode content
 */
export function assembleContent(
  script: Script,
  options: ContentAssemblyOptions = {}
): AssembledContent {
  const {
    includeIntroduction = true,
    includeConclusion = true,
    citationStyle = "none",
    wordCountTarget,
  } = options;

  const sections: string[] = [];
  let fullText = "";

  // Add introduction
  if (includeIntroduction && script.introduction) {
    sections.push(script.introduction);
    fullText += script.introduction + "\n\n";
  }

  // Add main sections
  for (const section of script.sections) {
    let sectionText = "";

    // Add section title (optional, for reference)
    // sectionText += `# ${section.title}\n\n`;

    // Add paragraphs
    for (const paragraph of section.paragraphs) {
      sectionText += paragraph.text;

      // Add inline citations if requested
      if (citationStyle === "inline" && paragraph.citations?.length) {
        const citationNumbers = paragraph.citations
          .map((_, i) => `[${i + 1}]`)
          .join("");
        sectionText += ` ${citationNumbers}`;
      }

      sectionText += "\n\n";
    }

    sections.push(sectionText.trim());
    fullText += sectionText;
  }

  // Add conclusion
  if (includeConclusion && script.conclusion) {
    sections.push(script.conclusion);
    fullText += script.conclusion + "\n\n";
  }

  // Process citations
  const allCitations = deduplicateCitations(script.allCitations);

  // Add endnotes if requested
  if (citationStyle === "endnotes" && allCitations.length > 0) {
    fullText += "\n## Sources\n\n";
    allCitations.forEach((citation, i) => {
      fullText += `[${i + 1}] ${formatCitation(citation)}\n`;
    });
  }

  // Extract keywords
  const keywords = extractKeywords(fullText, 10);

  // Calculate word count and duration
  const wordCount = countWords(fullText);
  const estimatedDuration = estimateDuration(wordCount);

  return {
    fullText: fullText.trim(),
    wordCount,
    estimatedDuration,
    sections,
    citations: allCitations,
    keywords,
    metadata: {
      hasIntroduction: includeIntroduction && !!script.introduction,
      hasConclusion: includeConclusion && !!script.conclusion,
      sectionCount: sections.length,
      citationCount: allCitations.length,
    },
  };
}

/**
 * Formats a citation in a standard style
 */
export function formatCitation(citation: Citation): string {
  const parts: string[] = [];

  // Author
  if (citation.author) {
    parts.push(citation.author);
  }

  // Title (in italics or quotes depending on type)
  if (citation.type === "book") {
    parts.push(`*${citation.title}*`);
  } else {
    parts.push(`"${citation.title}"`);
  }

  // Year
  if (citation.year) {
    parts.push(`(${citation.year})`);
  }

  // URL
  if (citation.url) {
    parts.push(citation.url);
  }

  return parts.join(". ");
}

/**
 * Builds a transcript from script with various formatting options
 */
export function buildTranscript(
  script: Script,
  options: TranscriptFormatOptions = {}
): FormattedTranscript {
  const {
    includeTimestamps = false,
    includeSpeakerLabels = false,
    format = "plain",
  } = options;

  let content = "";
  const wordCount = script.wordCount;
  const duration = script.estimatedDuration;

  switch (format) {
    case "plain":
      content = buildPlainTranscript(script);
      break;
    case "srt":
      content = buildSRTTranscript(script, duration);
      break;
    case "vtt":
      content = buildVTTTranscript(script, duration);
      break;
    case "json":
      content = buildJSONTranscript(script);
      break;
    default:
      content = script.transcript;
  }

  return {
    content,
    format,
    wordCount,
    duration,
  };
}

/**
 * Builds a plain text transcript
 */
function buildPlainTranscript(script: Script): string {
  return script.transcript;
}

/**
 * Builds an SRT (SubRip) format transcript with timestamps
 */
function buildSRTTranscript(script: Script, totalDuration: number): string {
  const lines = script.transcript.split(/\.\s+/);
  const srt: string[] = [];
  let currentTime = 0;
  const timePerLine = totalDuration / lines.length;

  lines.forEach((line, index) => {
    if (!line.trim()) return;

    const startTime = currentTime;
    const endTime = currentTime + timePerLine;

    srt.push(
      `${index + 1}`,
      `${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}`,
      line.trim(),
      ""
    );

    currentTime = endTime;
  });

  return srt.join("\n");
}

/**
 * Builds a WebVTT format transcript
 */
function buildVTTTranscript(script: Script, totalDuration: number): string {
  const srt = buildSRTTranscript(script, totalDuration);
  return `WEBVTT\n\n${srt}`;
}

/**
 * Builds a JSON format transcript
 */
function buildJSONTranscript(script: Script): string {
  return JSON.stringify(
    {
      title: script.title,
      subtitle: script.subtitle,
      transcript: script.transcript,
      wordCount: script.wordCount,
      estimatedDuration: script.estimatedDuration,
      sections: script.sections.map((section) => ({
        title: section.title,
        act: section.act,
        text: section.paragraphs.map((p) => p.text).join(" "),
      })),
    },
    null,
    2
  );
}

/**
 * Formats time in SRT format (HH:MM:SS,mmm)
 */
function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
}

/**
 * Counts words in text
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Estimates audio duration from word count
 * Average speaking rate: 150 words per minute
 */
function estimateDuration(wordCount: number): number {
  const wordsPerMinute = 150;
  return Math.round((wordCount / wordsPerMinute) * 60);
}

/**
 * Builds episode metadata for RSS and SEO
 */
export interface EpisodeMetadataInput {
  title: string;
  subtitle?: string;
  description: string;
  keywords: string[];
  citations: Citation[];
  duration: number;
  audioUrl?: string;
  audioBytes?: number;
  publishDate?: Date;
}

export interface EpisodeMetadata {
  title: string;
  subtitle?: string;
  description: string;
  summary: string; // shortened description
  keywords: string[];
  author: string;
  sources: string[];
  duration: number;
  audioUrl?: string;
  audioBytes?: number;
  publishDate: string;
  guid: string;
}

export function buildEpisodeMetadata(
  input: EpisodeMetadataInput,
  guid: string
): EpisodeMetadata {
  const {
    title,
    subtitle,
    description,
    keywords,
    citations,
    duration,
    audioUrl,
    audioBytes,
    publishDate = new Date(),
  } = input;

  // Create a summary (first 200 characters)
  const summary =
    description.length > 200
      ? description.substring(0, 197) + "..."
      : description;

  // Format citations as source strings
  const sources = citations.map((c) => formatCitation(c));

  return {
    title,
    subtitle,
    description,
    summary,
    keywords,
    author: "Epoch Pod",
    sources,
    duration,
    audioUrl,
    audioBytes,
    publishDate: publishDate.toISOString(),
    guid,
  };
}

/**
 * Merges multiple outlines into a single comprehensive outline
 * Useful for combining research from multiple sources
 */
export function mergeOutlines(outlines: Outline[]): Outline {
  if (outlines.length === 0) {
    throw new Error("Cannot merge empty array of outlines");
  }

  if (outlines.length === 1) {
    return outlines[0];
  }

  const [first, ...rest] = outlines;

  // Combine key themes
  const allThemes = new Set<string>();
  outlines.forEach((outline) => {
    outline.keyThemes.forEach((theme) => allThemes.add(theme));
  });

  // Combine citations
  const allCitations: Citation[] = [];
  outlines.forEach((outline) => {
    outline.sections.forEach((section) => {
      section.beats.forEach((beat) => {
        if (beat.citations) {
          allCitations.push(...beat.citations);
        }
      });
    });
  });

  const uniqueCitations = deduplicateCitations(allCitations);

  // Use the first outline as base and enhance it
  return {
    ...first,
    keyThemes: Array.from(allThemes).slice(0, 5),
    sections: first.sections.map((section, i) => ({
      ...section,
      beats: section.beats.map((beat) => ({
        ...beat,
        // Add citations from other outlines if available
        citations: beat.citations || [],
      })),
    })),
  };
}

/**
 * Splits long content into chunks for processing
 * Useful for handling content that exceeds token limits
 */
export interface ContentChunk {
  index: number;
  content: string;
  wordCount: number;
  estimatedTokens: number;
}

export function chunkContent(
  content: string,
  maxWordsPerChunk: number = 500
): ContentChunk[] {
  const sentences = content.split(/(?<=[.!?])\s+/);
  const chunks: ContentChunk[] = [];
  let currentChunk: string[] = [];
  let currentWordCount = 0;

  for (const sentence of sentences) {
    const sentenceWordCount = countWords(sentence);

    if (currentWordCount + sentenceWordCount > maxWordsPerChunk && currentChunk.length > 0) {
      // Save current chunk
      const chunkContent = currentChunk.join(" ");
      chunks.push({
        index: chunks.length,
        content: chunkContent,
        wordCount: currentWordCount,
        estimatedTokens: Math.ceil(currentWordCount * 1.3), // rough estimate
      });

      // Start new chunk
      currentChunk = [sentence];
      currentWordCount = sentenceWordCount;
    } else {
      currentChunk.push(sentence);
      currentWordCount += sentenceWordCount;
    }
  }

  // Add the last chunk if it has content
  if (currentChunk.length > 0) {
    const chunkContent = currentChunk.join(" ");
    chunks.push({
      index: chunks.length,
      content: chunkContent,
      wordCount: currentWordCount,
      estimatedTokens: Math.ceil(currentWordCount * 1.3),
    });
  }

  return chunks;
}

/**
 * Export main builder object
 */
export const builder = {
  assembleContent,
  buildTranscript,
  buildEpisodeMetadata,
  formatCitation,
  mergeOutlines,
  chunkContent,
};

export default builder;
