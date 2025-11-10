/**
 * Agent verifier (Phase 14)
 * Verifier for fact-checking and quality assurance
 */

import type { Outline, Script, Citation } from "@epoch/schema";
import { validateCitation } from "../tools";

/**
 * Verification result interface
 */
export interface VerificationResult {
  passed: boolean;
  score: number; // 0-100
  issues: VerificationIssue[];
  warnings: VerificationWarning[];
  suggestions: string[];
  summary: string;
}

/**
 * Verification issue (blocking problems)
 */
export interface VerificationIssue {
  severity: "critical" | "high" | "medium";
  category:
    | "citation"
    | "structure"
    | "content"
    | "duration"
    | "accuracy"
    | "quality";
  description: string;
  location?: string;
  fix?: string;
}

/**
 * Verification warning (non-blocking issues)
 */
export interface VerificationWarning {
  category:
    | "citation"
    | "structure"
    | "content"
    | "duration"
    | "style"
    | "accessibility";
  description: string;
  location?: string;
  suggestion?: string;
}

/**
 * Verifies an outline for quality and completeness
 */
export function verifyOutline(outline: Outline): VerificationResult {
  const issues: VerificationIssue[] = [];
  const warnings: VerificationWarning[] = [];
  const suggestions: string[] = [];

  // Check structure
  if (outline.sections.length !== 5) {
    issues.push({
      severity: "critical",
      category: "structure",
      description: `Expected 5 sections (five-act structure), found ${outline.sections.length}`,
      fix: "Ensure outline has exactly 5 sections: hook, context, conflict, breakthrough, legacy",
    });
  }

  // Check that all required acts are present
  const actTypes = outline.sections.map((s) => s.act);
  const expectedActs = ["hook", "context", "conflict", "breakthrough", "legacy"];
  const missingActs = expectedActs.filter((act) => !actTypes.includes(act as any));

  if (missingActs.length > 0) {
    issues.push({
      severity: "high",
      category: "structure",
      description: `Missing required acts: ${missingActs.join(", ")}`,
      fix: "Add sections for all five acts",
    });
  }

  // Check duration
  if (outline.totalEstimatedDuration < 600) {
    warnings.push({
      category: "duration",
      description: `Episode duration ${outline.totalEstimatedDuration}s is shorter than recommended minimum (600s)`,
      suggestion: "Consider adding more content to reach 10-30 minute target",
    });
  } else if (outline.totalEstimatedDuration > 1800) {
    warnings.push({
      category: "duration",
      description: `Episode duration ${outline.totalEstimatedDuration}s exceeds recommended maximum (1800s)`,
      suggestion: "Consider condensing content to stay within 30 minute target",
    });
  }

  // Check citations
  let totalCitations = 0;
  outline.sections.forEach((section, sectionIndex) => {
    section.beats.forEach((beat, beatIndex) => {
      if (beat.citations && beat.citations.length > 0) {
        totalCitations += beat.citations.length;

        // Validate each citation
        beat.citations.forEach((citation) => {
          const validation = validateCitation(citation);
          if (!validation.valid) {
            issues.push({
              severity: "medium",
              category: "citation",
              description: `Invalid citation in ${section.act} section: ${validation.issues.join(", ")}`,
              location: `Section ${sectionIndex + 1}, Beat ${beatIndex + 1}`,
              fix: validation.suggestions.join("; "),
            });
          }
        });
      }
    });
  });

  if (totalCitations === 0) {
    issues.push({
      severity: "high",
      category: "citation",
      description: "No citations found in outline",
      fix: "Add citations to support historical claims",
    });
  } else if (totalCitations < 3) {
    warnings.push({
      category: "citation",
      description: `Only ${totalCitations} citations found. More sources recommended for credibility`,
      suggestion: "Aim for at least 5-10 quality sources",
    });
  }

  // Check content quality
  if (!outline.hook || outline.hook.length < 50) {
    warnings.push({
      category: "content",
      description: "Hook is too short or missing",
      suggestion: "Create a compelling 1-2 sentence hook to draw listeners in",
    });
  }

  if (outline.keyThemes.length < 2) {
    warnings.push({
      category: "content",
      description: "Few key themes identified",
      suggestion: "Identify 2-5 key themes for narrative coherence",
    });
  }

  // Check each section has adequate beats
  outline.sections.forEach((section, index) => {
    if (section.beats.length < 2) {
      warnings.push({
        category: "structure",
        description: `Section "${section.title}" has only ${section.beats.length} beat(s)`,
        location: `Section ${index + 1}`,
        suggestion: "Each section should have 2-5 beats for narrative depth",
      });
    }
  });

  // Generate suggestions
  if (totalCitations > 0 && totalCitations < 5) {
    suggestions.push("Add more diverse sources to strengthen credibility");
  }
  if (outline.totalEstimatedDuration < 900) {
    suggestions.push("Consider expanding sections for fuller narrative");
  }
  suggestions.push("Review hook for maximum impact");
  suggestions.push("Ensure smooth transitions between acts");

  // Calculate score
  const score = calculateScore(issues, warnings);

  // Generate summary
  const summary = generateSummary(issues, warnings, score);

  return {
    passed: issues.filter((i) => i.severity === "critical" || i.severity === "high").length === 0,
    score,
    issues,
    warnings,
    suggestions,
    summary,
  };
}

/**
 * Verifies a script for quality and completeness
 */
export function verifyScript(script: Script): VerificationResult {
  const issues: VerificationIssue[] = [];
  const warnings: VerificationWarning[] = [];
  const suggestions: string[] = [];

  // Check structure
  if (script.sections.length !== 5) {
    issues.push({
      severity: "critical",
      category: "structure",
      description: `Expected 5 sections, found ${script.sections.length}`,
      fix: "Ensure script has exactly 5 sections matching the outline",
    });
  }

  // Check word count
  if (script.wordCount < 1200) {
    issues.push({
      severity: "high",
      category: "content",
      description: `Word count ${script.wordCount} is below minimum (1200 words)`,
      fix: "Expand content to meet minimum word count",
    });
  } else if (script.wordCount > 1800) {
    warnings.push({
      category: "content",
      description: `Word count ${script.wordCount} exceeds recommended maximum (1800 words)`,
      suggestion: "Consider condensing to improve pacing",
    });
  }

  // Check duration
  if (script.estimatedDuration < 600) {
    warnings.push({
      category: "duration",
      description: `Duration ${script.estimatedDuration}s is shorter than recommended (600s minimum)`,
      suggestion: "Expand content to reach 10-minute minimum",
    });
  } else if (script.estimatedDuration > 1800) {
    warnings.push({
      category: "duration",
      description: `Duration ${script.estimatedDuration}s exceeds recommended maximum (1800s)`,
      suggestion: "Consider condensing for better engagement",
    });
  }

  // Check introduction and conclusion
  if (!script.introduction || script.introduction.length < 100) {
    issues.push({
      severity: "medium",
      category: "content",
      description: "Introduction is too short or missing",
      fix: "Write a compelling 60-90 second introduction",
    });
  }

  if (!script.conclusion || script.conclusion.length < 100) {
    issues.push({
      severity: "medium",
      category: "content",
      description: "Conclusion is too short or missing",
      fix: "Write a thoughtful 45-60 second conclusion",
    });
  }

  // Check transcript
  if (!script.transcript || script.transcript.length < 1000) {
    issues.push({
      severity: "critical",
      category: "content",
      description: "Transcript is missing or too short",
      fix: "Generate complete transcript from script sections",
    });
  }

  // Verify citations
  if (script.allCitations.length === 0) {
    issues.push({
      severity: "high",
      category: "citation",
      description: "No citations provided",
      fix: "Add sources to support historical claims",
    });
  } else {
    // Validate each citation
    script.allCitations.forEach((citation, index) => {
      const validation = validateCitation(citation);
      if (!validation.valid) {
        issues.push({
          severity: "medium",
          category: "citation",
          description: `Citation ${index + 1} is invalid: ${validation.issues.join(", ")}`,
          location: `Citation ${index + 1}`,
          fix: validation.suggestions.join("; "),
        });
      }
    });
  }

  // Check for readability issues
  const readabilityIssues = checkReadability(script.transcript);
  warnings.push(...readabilityIssues);

  // Check for accessibility
  if (!script.transcript) {
    issues.push({
      severity: "high",
      category: "accessibility",
      description: "Missing transcript for accessibility",
      fix: "Provide full transcript for hearing-impaired users",
    });
  }

  // Check sections
  script.sections.forEach((section, index) => {
    if (section.paragraphs.length < 3) {
      warnings.push({
        category: "content",
        description: `Section "${section.title}" has only ${section.paragraphs.length} paragraph(s)`,
        location: `Section ${index + 1}`,
        suggestion: "Each section should have 3-10 paragraphs for depth",
      });
    }
  });

  // Generate suggestions
  if (script.wordCount < 1500) {
    suggestions.push("Consider adding more narrative detail to reach optimal word count");
  }
  if (script.allCitations.length < 5) {
    suggestions.push("Add more diverse sources to strengthen credibility");
  }
  suggestions.push("Review for smooth transitions between sections");
  suggestions.push("Ensure consistent tone and pacing throughout");

  // Calculate score
  const score = calculateScore(issues, warnings);

  // Generate summary
  const summary = generateSummary(issues, warnings, score);

  return {
    passed: issues.filter((i) => i.severity === "critical" || i.severity === "high").length === 0,
    score,
    issues,
    warnings,
    suggestions,
    summary,
  };
}

/**
 * Checks readability of text
 */
function checkReadability(text: string): VerificationWarning[] {
  const warnings: VerificationWarning[] = [];

  if (!text) return warnings;

  // Check for very long sentences (over 40 words)
  const sentences = text.split(/[.!?]+/);
  const longSentences = sentences.filter(
    (s) => s.split(/\s+/).length > 40
  );

  if (longSentences.length > 0) {
    warnings.push({
      category: "style",
      description: `Found ${longSentences.length} very long sentence(s) (>40 words)`,
      suggestion: "Break up long sentences for better comprehension",
    });
  }

  // Check for repeated words
  const words = text.toLowerCase().split(/\s+/);
  const wordFreq = new Map<string, number>();

  for (const word of words) {
    if (word.length > 4) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  }

  const overusedWords = Array.from(wordFreq.entries())
    .filter(([word, count]) => count > 20)
    .map(([word]) => word);

  if (overusedWords.length > 0) {
    warnings.push({
      category: "style",
      description: `Some words are used very frequently: ${overusedWords.slice(0, 3).join(", ")}`,
      suggestion: "Consider using synonyms for variety",
    });
  }

  // Check for passive voice (simplified check)
  const passiveIndicators = /\b(was|were|been|being)\s+\w+ed\b/gi;
  const passiveMatches = text.match(passiveIndicators);

  if (passiveMatches && passiveMatches.length > 10) {
    warnings.push({
      category: "style",
      description: `Detected ${passiveMatches.length} possible passive voice constructions`,
      suggestion: "Consider using more active voice for engagement",
    });
  }

  return warnings;
}

/**
 * Verifies citation quality and consistency
 */
export function verifyCitations(citations: Citation[]): VerificationResult {
  const issues: VerificationIssue[] = [];
  const warnings: VerificationWarning[] = [];
  const suggestions: string[] = [];

  if (citations.length === 0) {
    issues.push({
      severity: "critical",
      category: "citation",
      description: "No citations provided",
      fix: "Add sources to support claims",
    });
  }

  // Validate each citation
  citations.forEach((citation, index) => {
    const validation = validateCitation(citation);

    if (!validation.valid) {
      issues.push({
        severity: "medium",
        category: "citation",
        description: `Citation ${index + 1}: ${validation.issues.join(", ")}`,
        location: `Citation ${index + 1}`,
        fix: validation.suggestions.join("; "),
      });
    }

    if (validation.suggestions.length > 0) {
      warnings.push({
        category: "citation",
        description: `Citation ${index + 1} could be improved`,
        location: `Citation ${index + 1}`,
        suggestion: validation.suggestions.join("; "),
      });
    }
  });

  // Check for citation diversity
  const types = new Set(citations.map((c) => c.type));
  if (types.size === 1 && citations.length > 3) {
    warnings.push({
      category: "citation",
      description: "All citations are of the same type",
      suggestion: "Include diverse source types (books, articles, archives, etc.)",
    });
  }

  // Check for recent sources
  const currentYear = new Date().getFullYear();
  const recentSources = citations.filter(
    (c) => c.year && c.year >= currentYear - 10
  );

  if (recentSources.length === 0 && citations.length > 0) {
    suggestions.push("Consider including some recent scholarship or sources");
  }

  // Check for URL accessibility
  const citationsWithUrls = citations.filter((c) => c.url);
  if (citationsWithUrls.length === 0 && citations.length > 3) {
    suggestions.push("Add URLs where possible for easy source verification");
  }

  const score = calculateScore(issues, warnings);
  const summary = generateSummary(issues, warnings, score);

  return {
    passed: issues.filter((i) => i.severity === "critical" || i.severity === "high").length === 0,
    score,
    issues,
    warnings,
    suggestions,
    summary,
  };
}

/**
 * Performs comprehensive quality check on complete episode
 */
export function verifyEpisode(
  outline: Outline,
  script: Script
): VerificationResult {
  const outlineResult = verifyOutline(outline);
  const scriptResult = verifyScript(script);

  // Combine results
  const issues = [...outlineResult.issues, ...scriptResult.issues];
  const warnings = [...outlineResult.warnings, ...scriptResult.warnings];
  const suggestions = [
    ...new Set([...outlineResult.suggestions, ...scriptResult.suggestions]),
  ];

  // Check consistency between outline and script
  if (outline.title !== script.title) {
    warnings.push({
      category: "content",
      description: "Outline and script titles don't match",
      suggestion: "Ensure title consistency across outline and script",
    });
  }

  if (outline.sections.length === script.sections.length) {
    outline.sections.forEach((outlineSection, i) => {
      if (outlineSection.act !== script.sections[i]?.act) {
        issues.push({
          severity: "medium",
          category: "structure",
          description: `Act mismatch at section ${i + 1}: outline has "${outlineSection.act}", script has "${script.sections[i]?.act}"`,
          location: `Section ${i + 1}`,
          fix: "Ensure outline and script have matching act structure",
        });
      }
    });
  }

  const score = calculateScore(issues, warnings);
  const summary = generateSummary(issues, warnings, score);

  return {
    passed: issues.filter((i) => i.severity === "critical" || i.severity === "high").length === 0,
    score,
    issues,
    warnings,
    suggestions,
    summary,
  };
}

/**
 * Calculates overall quality score
 */
function calculateScore(
  issues: VerificationIssue[],
  warnings: VerificationWarning[]
): number {
  let score = 100;

  // Deduct points for issues
  issues.forEach((issue) => {
    switch (issue.severity) {
      case "critical":
        score -= 20;
        break;
      case "high":
        score -= 10;
        break;
      case "medium":
        score -= 5;
        break;
    }
  });

  // Deduct points for warnings
  score -= warnings.length * 2;

  return Math.max(0, Math.min(100, score));
}

/**
 * Generates human-readable summary
 */
function generateSummary(
  issues: VerificationIssue[],
  warnings: VerificationWarning[],
  score: number
): string {
  const criticalIssues = issues.filter((i) => i.severity === "critical").length;
  const highIssues = issues.filter((i) => i.severity === "high").length;

  if (score >= 90) {
    return `Excellent quality (${score}/100). ${issues.length} issue(s), ${warnings.length} warning(s).`;
  } else if (score >= 75) {
    return `Good quality (${score}/100). ${issues.length} issue(s), ${warnings.length} warning(s). Minor improvements needed.`;
  } else if (score >= 60) {
    return `Fair quality (${score}/100). ${issues.length} issue(s), ${warnings.length} warning(s). Several improvements recommended.`;
  } else {
    return `Poor quality (${score}/100). ${criticalIssues} critical, ${highIssues} high priority issue(s). Significant revisions needed.`;
  }
}

/**
 * Export main verifier object
 */
export const verifier = {
  verifyOutline,
  verifyScript,
  verifyCitations,
  verifyEpisode,
};

export default verifier;
