/**
 * Agent planner (Phase 14)
 * Planning logic for episode generation
 */

import type { Outline, OutlineSection } from "@epoch/schema";
import { analyzeTopic, research, type ResearchQuery } from "../tools";

/**
 * Episode planning parameters
 */
export interface EpisodePlanningParams {
  topic: string;
  era?: string;
  targetDuration?: number;
  additionalContext?: string;
  researchDepth?: "shallow" | "moderate" | "deep";
}

/**
 * Episode plan structure
 */
export interface EpisodePlan {
  topic: string;
  era: string;
  analysis: {
    complexity: "beginner" | "intermediate" | "advanced";
    estimatedResearchTime: number;
    mainThemes: string[];
    keyQuestions: string[];
  };
  researchStrategy: {
    primaryFocus: string;
    secondaryTopics: string[];
    suggestedSources: string[];
    researchSteps: ResearchStep[];
  };
  narrativeApproach: {
    structure: "chronological" | "thematic" | "character-driven" | "mystery";
    hook: string;
    acts: ActPlan[];
    targetAudience: string;
  };
  estimatedTimeline: {
    research: number; // minutes
    outline: number;
    script: number;
    total: number;
  };
  potentialChallenges: string[];
  qualityChecks: string[];
}

/**
 * Research step interface
 */
export interface ResearchStep {
  order: number;
  description: string;
  estimatedTime: number; // minutes
  outputType: "facts" | "citations" | "context" | "quotes";
}

/**
 * Act plan interface
 */
export interface ActPlan {
  act: "hook" | "context" | "conflict" | "breakthrough" | "legacy";
  title: string;
  focus: string;
  keyPoints: string[];
  estimatedDuration: number; // seconds
}

/**
 * Plans an episode generation workflow
 * Analyzes the topic and creates a comprehensive plan for research and content creation
 */
export async function planEpisode(
  params: EpisodePlanningParams
): Promise<EpisodePlan> {
  const {
    topic,
    era,
    targetDuration = 1200,
    additionalContext,
    researchDepth = "moderate",
  } = params;

  // Step 1: Analyze the topic
  const topicAnalysis = analyzeTopic(topic);

  // Step 2: Conduct preliminary research to inform planning
  const researchQuery: ResearchQuery = {
    topic,
    era,
    focus: additionalContext,
    depth: researchDepth,
  };
  const preliminaryResearch = await research(researchQuery);

  // Step 3: Determine narrative approach based on topic characteristics
  const narrativeStructure = determineNarrativeStructure(
    topic,
    topicAnalysis.complexity
  );

  // Step 4: Create research strategy
  const researchStrategy = {
    primaryFocus: topic,
    secondaryTopics: preliminaryResearch.relatedTopics,
    suggestedSources: preliminaryResearch.suggestedCitations.map(
      (c) => c.title
    ),
    researchSteps: createResearchSteps(topic, researchDepth),
  };

  // Step 5: Plan the five-act structure
  const acts = planNarrativeActs(
    topic,
    era || preliminaryResearch.summary,
    targetDuration
  );

  // Step 6: Estimate timeline
  const estimatedTimeline = {
    research: topicAnalysis.estimatedResearchTime,
    outline: researchDepth === "shallow" ? 5 : researchDepth === "moderate" ? 10 : 15,
    script: Math.round(targetDuration / 60 / 2), // Roughly half a minute per minute of content
    total: 0,
  };
  estimatedTimeline.total =
    estimatedTimeline.research +
    estimatedTimeline.outline +
    estimatedTimeline.script;

  // Step 7: Identify potential challenges and quality checks
  const potentialChallenges = [
    ...topicAnalysis.potentialChallenges,
    "Maintaining narrative tension throughout",
    "Balancing historical detail with accessibility",
  ];

  const qualityChecks = [
    "All citations are valid and accessible",
    "Narrative follows the planned five-act structure",
    "Duration matches target (+/- 10%)",
    "Content is appropriate for target audience",
    "Historical accuracy verified",
    "No anachronisms or factual errors",
  ];

  return {
    topic,
    era: era || "To be determined",
    analysis: {
      complexity: topicAnalysis.complexity,
      estimatedResearchTime: topicAnalysis.estimatedResearchTime,
      mainThemes: topicAnalysis.mainThemes,
      keyQuestions: topicAnalysis.keyQuestions,
    },
    researchStrategy,
    narrativeApproach: {
      structure: narrativeStructure,
      hook: generateHookSuggestion(topic, narrativeStructure),
      acts,
      targetAudience: determineTargetAudience(topicAnalysis.complexity),
    },
    estimatedTimeline,
    potentialChallenges,
    qualityChecks,
  };
}

/**
 * Determines the best narrative structure for the topic
 */
function determineNarrativeStructure(
  topic: string,
  complexity: "beginner" | "intermediate" | "advanced"
): "chronological" | "thematic" | "character-driven" | "mystery" {
  const topicLower = topic.toLowerCase();

  // Character-driven for biographical topics
  if (
    topicLower.includes("life of") ||
    topicLower.includes("biography") ||
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/.test(topic)
  ) {
    return "character-driven";
  }

  // Mystery structure for unsolved or controversial topics
  if (
    topicLower.includes("mystery") ||
    topicLower.includes("unsolved") ||
    topicLower.includes("controversy")
  ) {
    return "mystery";
  }

  // Thematic for complex, advanced topics
  if (complexity === "advanced") {
    return "thematic";
  }

  // Default to chronological for most historical topics
  return "chronological";
}

/**
 * Generates a hook suggestion based on topic and structure
 */
function generateHookSuggestion(
  topic: string,
  structure: "chronological" | "thematic" | "character-driven" | "mystery"
): string {
  switch (structure) {
    case "character-driven":
      return `Open with a pivotal moment in the subject's life that captures their essence`;
    case "mystery":
      return `Begin with the central question or mystery that will drive the narrative`;
    case "thematic":
      return `Start with a thought-provoking statement about the main theme`;
    case "chronological":
    default:
      return `Open with a dramatic scene that sets the stage for ${topic}`;
  }
}

/**
 * Determines target audience based on complexity
 */
function determineTargetAudience(
  complexity: "beginner" | "intermediate" | "advanced"
): string {
  switch (complexity) {
    case "beginner":
      return "General audience with casual interest in history";
    case "intermediate":
      return "History enthusiasts seeking deeper understanding";
    case "advanced":
      return "Well-informed listeners interested in nuanced analysis";
  }
}

/**
 * Creates a step-by-step research plan
 */
function createResearchSteps(
  topic: string,
  depth: "shallow" | "moderate" | "deep"
): ResearchStep[] {
  const baseSteps: ResearchStep[] = [
    {
      order: 1,
      description: `Gather basic facts and timeline for ${topic}`,
      estimatedTime: 5,
      outputType: "facts",
    },
    {
      order: 2,
      description: "Identify primary and secondary sources",
      estimatedTime: 5,
      outputType: "citations",
    },
    {
      order: 3,
      description: "Research historical context and background",
      estimatedTime: 5,
      outputType: "context",
    },
  ];

  if (depth === "moderate" || depth === "deep") {
    baseSteps.push({
      order: 4,
      description: "Find compelling quotes and anecdotes",
      estimatedTime: 5,
      outputType: "quotes",
    });
  }

  if (depth === "deep") {
    baseSteps.push(
      {
        order: 5,
        description: "Explore multiple perspectives and interpretations",
        estimatedTime: 10,
        outputType: "context",
      },
      {
        order: 6,
        description: "Verify facts and cross-reference sources",
        estimatedTime: 10,
        outputType: "facts",
      }
    );
  }

  return baseSteps;
}

/**
 * Plans the five-act narrative structure
 */
function planNarrativeActs(
  topic: string,
  era: string,
  targetDuration: number
): ActPlan[] {
  // Distribute duration across acts (Hook: 15%, Context: 20%, Conflict: 30%, Breakthrough: 25%, Legacy: 10%)
  const durations = {
    hook: Math.round(targetDuration * 0.15),
    context: Math.round(targetDuration * 0.2),
    conflict: Math.round(targetDuration * 0.3),
    breakthrough: Math.round(targetDuration * 0.25),
    legacy: Math.round(targetDuration * 0.1),
  };

  return [
    {
      act: "hook",
      title: "Opening Hook",
      focus: `Capture attention with the most compelling aspect of ${topic}`,
      keyPoints: [
        "Present a dramatic moment or intriguing question",
        "Establish why this topic matters",
        "Set the scene and time period",
      ],
      estimatedDuration: durations.hook,
    },
    {
      act: "context",
      title: "Historical Context",
      focus: `Provide essential background about ${era} and the circumstances`,
      keyPoints: [
        "Explain the historical setting",
        "Introduce key figures and institutions",
        "Establish the status quo before the main events",
      ],
      estimatedDuration: durations.context,
    },
    {
      act: "conflict",
      title: "Central Conflict",
      focus: "Explore the main tension, challenge, or turning point",
      keyPoints: [
        "Present the core problem or question",
        "Show the stakes involved",
        "Build narrative tension",
        "Introduce complications",
      ],
      estimatedDuration: durations.conflict,
    },
    {
      act: "breakthrough",
      title: "Breakthrough",
      focus: "Reveal the resolution, climax, or key insight",
      keyPoints: [
        "Show how the conflict was resolved or transformed",
        "Highlight decisive moments and decisions",
        "Explain the outcome and immediate impact",
      ],
      estimatedDuration: durations.breakthrough,
    },
    {
      act: "legacy",
      title: "Legacy",
      focus: `Explore the lasting impact and significance of ${topic}`,
      keyPoints: [
        "Connect to present-day relevance",
        "Discuss how this shaped future events",
        "Offer final reflections",
      ],
      estimatedDuration: durations.legacy,
    },
  ];
}

/**
 * Validates that a generated outline follows the plan
 */
export function validateOutlineAgainstPlan(
  outline: Outline,
  plan: EpisodePlan
): {
  valid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check duration alignment
  const durationDiff = Math.abs(
    outline.totalEstimatedDuration - (plan.estimatedTimeline.total * 60 || 1200)
  );
  const durationTolerance = 120; // 2 minutes tolerance
  if (durationDiff > durationTolerance) {
    issues.push(
      `Duration ${outline.totalEstimatedDuration}s differs significantly from planned duration`
    );
  }

  // Check that all five acts are present
  const actTypes = outline.sections.map((s) => s.act);
  const expectedActs = ["hook", "context", "conflict", "breakthrough", "legacy"];
  const missingActs = expectedActs.filter((act) => !actTypes.includes(act as any));
  if (missingActs.length > 0) {
    issues.push(`Missing acts: ${missingActs.join(", ")}`);
  }

  // Check that topic matches
  if (!outline.topic.toLowerCase().includes(plan.topic.toLowerCase().split(" ")[0])) {
    suggestions.push("Ensure outline topic closely matches the planned topic");
  }

  // Check for citations
  const hasCitations = outline.sections.some(
    (section) => section.beats.some((beat) => beat.citations && beat.citations.length > 0)
  );
  if (!hasCitations) {
    issues.push("Outline should include citations for credibility");
  }

  return {
    valid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Export main planner object
 */
export const planner = {
  planEpisode,
  validateOutlineAgainstPlan,
  determineNarrativeStructure,
};

export default planner;
