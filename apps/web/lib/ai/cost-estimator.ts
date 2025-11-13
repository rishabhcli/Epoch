/**
 * Cost Estimation for AI Generation
 * Provides cost estimates for different episode types before generation
 */

export interface GenerationCostEstimate {
  gpt4Tokens: number;
  gpt4Cost: number;          // GPT-4 cost in USD
  ttsCharacters: number;
  ttsCost: number;            // TTS cost in USD
  totalCost: number;          // Total cost in USD
  estimatedDuration: number;  // Estimated duration in seconds
}

/**
 * OpenAI Pricing (as of 2025)
 */
const PRICING = {
  // GPT-4 Turbo pricing (per 1K tokens)
  gpt4InputPer1K: 0.01,
  gpt4OutputPer1K: 0.03,

  // TTS pricing (per 1M characters)
  ttsHDPer1M: 15.00,          // tts-1-hd
  ttsStandardPer1M: 7.50,     // tts-1

  // Average tokens for different operations
  avgOutlineInputTokens: 500,
  avgOutlineOutputTokens: 1500,
  avgScriptInputTokens: 2000,
  avgScriptOutputTokens: 3000,
} as const;

/**
 * Estimate cost for generating a narrative podcast
 */
export function estimateNarrativeCost(): GenerationCostEstimate {
  const gpt4Tokens = PRICING.avgOutlineInputTokens + PRICING.avgOutlineOutputTokens +
                     PRICING.avgScriptInputTokens + PRICING.avgScriptOutputTokens;

  const gpt4Cost =
    (PRICING.avgOutlineInputTokens * PRICING.gpt4InputPer1K / 1000) +
    (PRICING.avgOutlineOutputTokens * PRICING.gpt4OutputPer1K / 1000) +
    (PRICING.avgScriptInputTokens * PRICING.gpt4InputPer1K / 1000) +
    (PRICING.avgScriptOutputTokens * PRICING.gpt4OutputPer1K / 1000);

  // Average narrative: 1,500 words = ~2,500 characters
  const ttsCharacters = 2500;
  const ttsCost = ttsCharacters * PRICING.ttsHDPer1M / 1000000;

  return {
    gpt4Tokens,
    gpt4Cost,
    ttsCharacters,
    ttsCost,
    totalCost: gpt4Cost + ttsCost,
    estimatedDuration: 600, // ~10 minutes
  };
}

/**
 * Estimate cost for generating an interview
 */
export function estimateInterviewCost(): GenerationCostEstimate {
  // Interviews typically have longer scripts
  const gpt4Tokens = 2000 + 5000; // outline + script

  const gpt4Cost =
    (500 * PRICING.gpt4InputPer1K / 1000) +
    (1500 * PRICING.gpt4OutputPer1K / 1000) +
    (2500 * PRICING.gpt4InputPer1K / 1000) +
    (4000 * PRICING.gpt4OutputPer1K / 1000);

  // Average interview: 2,500 words = ~12,000 characters (multi-voice)
  const ttsCharacters = 12000;
  const ttsCost = ttsCharacters * PRICING.ttsHDPer1M / 1000000;

  return {
    gpt4Tokens,
    gpt4Cost,
    ttsCharacters,
    ttsCost,
    totalCost: gpt4Cost + ttsCost,
    estimatedDuration: 900, // ~15 minutes
  };
}

/**
 * Estimate cost for generating a debate
 */
export function estimateDebateCost(): GenerationCostEstimate {
  // Debates have the most complex scripts
  const gpt4Tokens = 3000 + 7000; // outline + script

  const gpt4Cost =
    (800 * PRICING.gpt4InputPer1K / 1000) +
    (2200 * PRICING.gpt4OutputPer1K / 1000) +
    (3000 * PRICING.gpt4InputPer1K / 1000) +
    (5000 * PRICING.gpt4OutputPer1K / 1000);

  // Average debate: 3,000 words = ~18,000 characters (three voices)
  const ttsCharacters = 18000;
  const ttsCost = ttsCharacters * PRICING.ttsHDPer1M / 1000000;

  return {
    gpt4Tokens,
    gpt4Cost,
    ttsCharacters,
    ttsCost,
    totalCost: gpt4Cost + ttsCost,
    estimatedDuration: 1080, // ~18 minutes
  };
}

/**
 * Estimate cost for generating a single adventure node
 */
export function estimateAdventureNodeCost(): GenerationCostEstimate {
  const gpt4Tokens = 1500 + 3500; // per node

  const gpt4Cost =
    (400 * PRICING.gpt4InputPer1K / 1000) +
    (1100 * PRICING.gpt4OutputPer1K / 1000) +
    (1500 * PRICING.gpt4InputPer1K / 1000) +
    (2500 * PRICING.gpt4OutputPer1K / 1000);

  // Average node: 800 words = ~3,000 characters
  const ttsCharacters = 3000;
  const ttsCost = ttsCharacters * PRICING.ttsHDPer1M / 1000000;

  return {
    gpt4Tokens,
    gpt4Cost,
    ttsCharacters,
    ttsCost,
    totalCost: gpt4Cost + ttsCost,
    estimatedDuration: 240, // ~4 minutes per node
  };
}

/**
 * Estimate cost for generating a complete adventure (outline + all nodes)
 */
export function estimateAdventureCost(nodeCount: number = 10): GenerationCostEstimate {
  // Outline generation
  const outlineGpt4Cost =
    (1000 * PRICING.gpt4InputPer1K / 1000) +
    (3000 * PRICING.gpt4OutputPer1K / 1000);

  // Per-node costs
  const nodeEstimate = estimateAdventureNodeCost();
  const totalNodeCost = nodeEstimate.totalCost * nodeCount;
  const totalNodeTokens = nodeEstimate.gpt4Tokens * nodeCount;
  const totalNodeCharacters = nodeEstimate.ttsCharacters * nodeCount;

  return {
    gpt4Tokens: 4000 + totalNodeTokens,
    gpt4Cost: outlineGpt4Cost + (nodeEstimate.gpt4Cost * nodeCount),
    ttsCharacters: totalNodeCharacters,
    ttsCost: nodeEstimate.ttsCost * nodeCount,
    totalCost: outlineGpt4Cost + totalNodeCost,
    estimatedDuration: nodeEstimate.estimatedDuration * nodeCount,
  };
}

/**
 * Format cost estimate for display
 */
export function formatCostEstimate(estimate: GenerationCostEstimate): string {
  return `$${estimate.totalCost.toFixed(2)} (~${Math.ceil(estimate.estimatedDuration / 60)} min)`;
}

/**
 * Get cost estimate by episode type
 */
export function getCostEstimate(type: 'NARRATIVE' | 'INTERVIEW' | 'DEBATE' | 'ADVENTURE', nodeCount?: number): GenerationCostEstimate {
  switch (type) {
    case 'NARRATIVE':
      return estimateNarrativeCost();
    case 'INTERVIEW':
      return estimateInterviewCost();
    case 'DEBATE':
      return estimateDebateCost();
    case 'ADVENTURE':
      return estimateAdventureCost(nodeCount);
    default:
      throw new Error(`Unknown episode type: ${type}`);
  }
}
