/**
 * Agent tools (Phase 14)
 * Tools for researching and generating content
 */

import type { Citation } from "@epoch/schema";

/**
 * Research query interface
 */
export interface ResearchQuery {
  topic: string;
  era?: string;
  focus?: string;
  depth?: "shallow" | "moderate" | "deep";
}

/**
 * Research result interface
 */
export interface ResearchResult {
  summary: string;
  keyFacts: string[];
  suggestedCitations: Citation[];
  relatedTopics: string[];
  confidence: number; // 0-1
}

/**
 * Research agent tool for gathering historical information
 * In production, this would integrate with:
 * - Web search APIs (e.g., Google Scholar, JSTOR)
 * - Historical databases
 * - Wikipedia API
 * - Archive.org
 */
export async function research(query: ResearchQuery): Promise<ResearchResult> {
  // TODO: In production, integrate with real research APIs
  // For now, return structured placeholder that follows the expected interface

  const { topic, era, focus, depth = "moderate" } = query;

  // Simulate research based on depth
  const factCount = depth === "shallow" ? 3 : depth === "moderate" ? 5 : 8;
  const citationCount = depth === "shallow" ? 2 : depth === "moderate" ? 3 : 5;

  return {
    summary: `Research summary for ${topic}${era ? ` during ${era}` : ""}${focus ? ` focusing on ${focus}` : ""}`,
    keyFacts: Array.from({ length: factCount }, (_, i) =>
      `Key historical fact ${i + 1} about ${topic}`
    ),
    suggestedCitations: Array.from({ length: citationCount }, (_, i) => ({
      title: `Source ${i + 1}: ${topic}`,
      author: `Historian ${i + 1}`,
      year: 1900 + i * 20,
      type: "book" as const,
      url: `https://example.com/source-${i + 1}`,
    })),
    relatedTopics: [
      `${topic} - Related topic 1`,
      `${topic} - Related topic 2`,
      `${topic} - Related topic 3`,
    ],
    confidence: 0.75,
  };
}

/**
 * Citation validation tool
 * Validates that citations follow proper format and are accessible
 */
export function validateCitation(citation: Citation): {
  valid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check required fields
  if (!citation.title || citation.title.trim().length === 0) {
    issues.push("Citation missing title");
  }

  // Check URL format if provided
  if (citation.url) {
    try {
      new URL(citation.url);
    } catch {
      issues.push("Invalid URL format");
      suggestions.push("Ensure URL is complete and properly formatted");
    }
  }

  // Check year reasonableness
  if (citation.year) {
    const currentYear = new Date().getFullYear();
    if (citation.year < 0 || citation.year > currentYear) {
      issues.push(`Year ${citation.year} is outside reasonable range`);
    }
  }

  // Check type
  const validTypes = ["book", "article", "website", "paper", "archive"];
  if (!validTypes.includes(citation.type)) {
    issues.push(`Invalid citation type: ${citation.type}`);
  }

  // Suggestions for improvement
  if (!citation.author) {
    suggestions.push("Consider adding author information if available");
  }
  if (!citation.year) {
    suggestions.push("Consider adding publication year");
  }
  if (!citation.url && citation.type !== "book") {
    suggestions.push("Consider adding URL for online accessibility");
  }

  return {
    valid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Citation deduplication tool
 * Removes duplicate citations and merges similar ones
 */
export function deduplicateCitations(citations: Citation[]): Citation[] {
  const uniqueCitations = new Map<string, Citation>();

  for (const citation of citations) {
    // Create a key based on title and author (case-insensitive)
    const key = `${citation.title.toLowerCase().trim()}_${citation.author?.toLowerCase().trim() || "unknown"}`;

    if (!uniqueCitations.has(key)) {
      uniqueCitations.set(key, citation);
    } else {
      // Merge: prefer citations with more complete information
      const existing = uniqueCitations.get(key)!;
      uniqueCitations.set(key, {
        ...existing,
        url: existing.url || citation.url,
        year: existing.year || citation.year,
        author: existing.author || citation.author,
      });
    }
  }

  return Array.from(uniqueCitations.values());
}

/**
 * Topic analysis tool
 * Analyzes a topic and suggests research directions
 */
export interface TopicAnalysis {
  mainThemes: string[];
  suggestedEra: string;
  complexity: "beginner" | "intermediate" | "advanced";
  estimatedResearchTime: number; // minutes
  keyQuestions: string[];
  potentialChallenges: string[];
}

export function analyzeTopic(topic: string): TopicAnalysis {
  const wordCount = topic.split(/\s+/).length;

  // Determine complexity based on topic specificity
  const complexity: "beginner" | "intermediate" | "advanced" =
    wordCount <= 3 ? "beginner" :
    wordCount <= 6 ? "intermediate" :
    "advanced";

  // Estimate research time
  const baseTime = 15; // minutes
  const complexityMultiplier = complexity === "beginner" ? 1 : complexity === "intermediate" ? 1.5 : 2;
  const estimatedResearchTime = Math.round(baseTime * complexityMultiplier);

  return {
    mainThemes: [
      `Historical context of ${topic}`,
      `Key figures in ${topic}`,
      `Impact and legacy of ${topic}`,
    ],
    suggestedEra: "To be determined from research",
    complexity,
    estimatedResearchTime,
    keyQuestions: [
      `What were the causes of ${topic}?`,
      `Who were the key participants?`,
      `What was the historical impact?`,
      `How is ${topic} remembered today?`,
    ],
    potentialChallenges: [
      "Finding reliable primary sources",
      "Balancing multiple perspectives",
      "Maintaining historical accuracy",
    ],
  };
}

/**
 * Content enrichment tool
 * Suggests ways to enhance content with additional context
 */
export interface EnrichmentSuggestion {
  type: "context" | "comparison" | "quote" | "statistic" | "anecdote";
  description: string;
  priority: "low" | "medium" | "high";
}

export function suggestEnrichments(
  topic: string,
  existingContent: string
): EnrichmentSuggestion[] {
  const suggestions: EnrichmentSuggestion[] = [];

  // Check for missing elements
  if (!existingContent.includes("context")) {
    suggestions.push({
      type: "context",
      description: "Add historical context to set the scene",
      priority: "high",
    });
  }

  if (!existingContent.includes("quote") && !existingContent.includes('"')) {
    suggestions.push({
      type: "quote",
      description: "Include a compelling quote from a primary source",
      priority: "medium",
    });
  }

  if (!/\d{4}/.test(existingContent)) {
    suggestions.push({
      type: "statistic",
      description: "Add specific dates or statistics for concreteness",
      priority: "medium",
    });
  }

  suggestions.push({
    type: "comparison",
    description: `Compare ${topic} to similar historical events`,
    priority: "low",
  });

  suggestions.push({
    type: "anecdote",
    description: "Include a personal story or anecdote to humanize the narrative",
    priority: "medium",
  });

  return suggestions;
}

/**
 * Keyword extraction tool
 * Extracts relevant keywords from content for tagging and SEO
 */
export function extractKeywords(
  content: string,
  maxKeywords: number = 10
): string[] {
  // Simple keyword extraction based on word frequency
  // In production, use NLP libraries like natural or compromise

  // Remove common words
  const commonWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
    "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "can", "this", "that", "these", "those",
  ]);

  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  // Count frequency
  const frequency = new Map<string, number>();
  for (const word of words) {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  }

  // Sort by frequency and return top keywords
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Export all tools
 */
export const tools = {
  research,
  validateCitation,
  deduplicateCitations,
  analyzeTopic,
  suggestEnrichments,
  extractKeywords,
};

export default tools;
