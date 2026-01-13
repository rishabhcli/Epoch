import {
  estimateNarrativeCost,
  estimateInterviewCost,
  estimateDebateCost,
  estimateAdventureNodeCost,
  estimateAdventureCost,
  formatCostEstimate,
  getCostEstimate,
  type GenerationCostEstimate,
} from '@/lib/ai/cost-estimator';

describe('estimateNarrativeCost', () => {
  let estimate: GenerationCostEstimate;

  beforeEach(() => {
    estimate = estimateNarrativeCost();
  });

  it('returns a valid cost estimate object', () => {
    expect(estimate).toHaveProperty('gpt4Tokens');
    expect(estimate).toHaveProperty('gpt4Cost');
    expect(estimate).toHaveProperty('ttsCharacters');
    expect(estimate).toHaveProperty('ttsCost');
    expect(estimate).toHaveProperty('totalCost');
    expect(estimate).toHaveProperty('estimatedDuration');
  });

  it('calculates positive token count', () => {
    expect(estimate.gpt4Tokens).toBeGreaterThan(0);
  });

  it('calculates positive costs', () => {
    expect(estimate.gpt4Cost).toBeGreaterThan(0);
    expect(estimate.ttsCost).toBeGreaterThan(0);
    expect(estimate.totalCost).toBeGreaterThan(0);
  });

  it('total cost equals sum of gpt4 and tts costs', () => {
    expect(estimate.totalCost).toBeCloseTo(estimate.gpt4Cost + estimate.ttsCost, 4);
  });

  it('estimates approximately 10 minutes duration', () => {
    expect(estimate.estimatedDuration).toBe(600);
  });

  it('estimates TTS characters around 2500', () => {
    expect(estimate.ttsCharacters).toBe(2500);
  });
});

describe('estimateInterviewCost', () => {
  let estimate: GenerationCostEstimate;

  beforeEach(() => {
    estimate = estimateInterviewCost();
  });

  it('returns a valid cost estimate object', () => {
    expect(estimate).toHaveProperty('gpt4Tokens');
    expect(estimate).toHaveProperty('gpt4Cost');
    expect(estimate).toHaveProperty('ttsCharacters');
    expect(estimate).toHaveProperty('ttsCost');
    expect(estimate).toHaveProperty('totalCost');
    expect(estimate).toHaveProperty('estimatedDuration');
  });

  it('has higher or equal token count than narrative (more complex)', () => {
    const narrativeEstimate = estimateNarrativeCost();
    expect(estimate.gpt4Tokens).toBeGreaterThanOrEqual(narrativeEstimate.gpt4Tokens);
  });

  it('has higher TTS characters than narrative (multi-voice)', () => {
    const narrativeEstimate = estimateNarrativeCost();
    expect(estimate.ttsCharacters).toBeGreaterThan(narrativeEstimate.ttsCharacters);
  });

  it('estimates approximately 15 minutes duration', () => {
    expect(estimate.estimatedDuration).toBe(900);
  });

  it('estimates TTS characters around 12000', () => {
    expect(estimate.ttsCharacters).toBe(12000);
  });

  it('total cost is reasonable for interview', () => {
    expect(estimate.totalCost).toBeGreaterThan(0.1); // At least $0.10
    expect(estimate.totalCost).toBeLessThan(1.0); // Less than $1.00
  });
});

describe('estimateDebateCost', () => {
  let estimate: GenerationCostEstimate;

  beforeEach(() => {
    estimate = estimateDebateCost();
  });

  it('returns a valid cost estimate object', () => {
    expect(estimate).toHaveProperty('gpt4Tokens');
    expect(estimate).toHaveProperty('gpt4Cost');
    expect(estimate).toHaveProperty('ttsCharacters');
    expect(estimate).toHaveProperty('ttsCost');
    expect(estimate).toHaveProperty('totalCost');
    expect(estimate).toHaveProperty('estimatedDuration');
  });

  it('has highest token count (most complex)', () => {
    const narrativeEstimate = estimateNarrativeCost();
    const interviewEstimate = estimateInterviewCost();
    expect(estimate.gpt4Tokens).toBeGreaterThan(narrativeEstimate.gpt4Tokens);
    expect(estimate.gpt4Tokens).toBeGreaterThan(interviewEstimate.gpt4Tokens);
  });

  it('has highest TTS characters (three voices)', () => {
    const narrativeEstimate = estimateNarrativeCost();
    const interviewEstimate = estimateInterviewCost();
    expect(estimate.ttsCharacters).toBeGreaterThan(narrativeEstimate.ttsCharacters);
    expect(estimate.ttsCharacters).toBeGreaterThan(interviewEstimate.ttsCharacters);
  });

  it('estimates approximately 18 minutes duration', () => {
    expect(estimate.estimatedDuration).toBe(1080);
  });

  it('estimates TTS characters around 18000', () => {
    expect(estimate.ttsCharacters).toBe(18000);
  });
});

describe('estimateAdventureNodeCost', () => {
  let estimate: GenerationCostEstimate;

  beforeEach(() => {
    estimate = estimateAdventureNodeCost();
  });

  it('returns a valid cost estimate object', () => {
    expect(estimate).toHaveProperty('gpt4Tokens');
    expect(estimate).toHaveProperty('gpt4Cost');
    expect(estimate).toHaveProperty('ttsCharacters');
    expect(estimate).toHaveProperty('ttsCost');
    expect(estimate).toHaveProperty('totalCost');
    expect(estimate).toHaveProperty('estimatedDuration');
  });

  it('estimates approximately 4 minutes duration per node', () => {
    expect(estimate.estimatedDuration).toBe(240);
  });

  it('estimates TTS characters around 3000 per node', () => {
    expect(estimate.ttsCharacters).toBe(3000);
  });

  it('is cheaper than full episode types', () => {
    const narrativeEstimate = estimateNarrativeCost();
    expect(estimate.totalCost).toBeLessThan(narrativeEstimate.totalCost);
  });
});

describe('estimateAdventureCost', () => {
  it('returns valid cost estimate with default 10 nodes', () => {
    const estimate = estimateAdventureCost();
    expect(estimate.gpt4Tokens).toBeGreaterThan(0);
    expect(estimate.totalCost).toBeGreaterThan(0);
  });

  it('scales cost with node count', () => {
    const estimate5 = estimateAdventureCost(5);
    const estimate10 = estimateAdventureCost(10);
    const estimate15 = estimateAdventureCost(15);

    expect(estimate10.totalCost).toBeGreaterThan(estimate5.totalCost);
    expect(estimate15.totalCost).toBeGreaterThan(estimate10.totalCost);
  });

  it('scales duration with node count', () => {
    const estimate5 = estimateAdventureCost(5);
    const estimate10 = estimateAdventureCost(10);
    const estimate15 = estimateAdventureCost(15);

    expect(estimate10.estimatedDuration).toBeGreaterThan(estimate5.estimatedDuration);
    expect(estimate15.estimatedDuration).toBeGreaterThan(estimate10.estimatedDuration);
  });

  it('duration is approximately 4 minutes per node', () => {
    const nodeCount = 10;
    const estimate = estimateAdventureCost(nodeCount);
    expect(estimate.estimatedDuration).toBe(nodeCount * 240);
  });

  it('includes outline generation cost', () => {
    const nodeCount = 10;
    const estimate = estimateAdventureCost(nodeCount);
    const nodeEstimate = estimateAdventureNodeCost();

    // Total should be more than just node costs (outline adds to it)
    expect(estimate.gpt4Tokens).toBeGreaterThan(nodeEstimate.gpt4Tokens * nodeCount);
  });

  it('handles single node', () => {
    const estimate = estimateAdventureCost(1);
    expect(estimate.totalCost).toBeGreaterThan(0);
    expect(estimate.estimatedDuration).toBe(240);
  });

  it('handles large node counts', () => {
    const estimate = estimateAdventureCost(20);
    expect(estimate.totalCost).toBeGreaterThan(0);
    expect(estimate.estimatedDuration).toBe(20 * 240);
  });
});

describe('formatCostEstimate', () => {
  it('formats cost with dollar sign and two decimal places', () => {
    const estimate: GenerationCostEstimate = {
      gpt4Tokens: 1000,
      gpt4Cost: 0.05,
      ttsCharacters: 5000,
      ttsCost: 0.075,
      totalCost: 0.125,
      estimatedDuration: 600,
    };

    const formatted = formatCostEstimate(estimate);
    expect(formatted).toMatch(/^\$\d+\.\d{2}/);
  });

  it('includes duration in minutes', () => {
    const estimate: GenerationCostEstimate = {
      gpt4Tokens: 1000,
      gpt4Cost: 0.05,
      ttsCharacters: 5000,
      ttsCost: 0.075,
      totalCost: 0.125,
      estimatedDuration: 600, // 10 minutes
    };

    const formatted = formatCostEstimate(estimate);
    expect(formatted).toContain('10 min');
  });

  it('rounds duration up to nearest minute', () => {
    const estimate: GenerationCostEstimate = {
      gpt4Tokens: 1000,
      gpt4Cost: 0.05,
      ttsCharacters: 5000,
      ttsCost: 0.075,
      totalCost: 0.125,
      estimatedDuration: 601, // Just over 10 minutes
    };

    const formatted = formatCostEstimate(estimate);
    expect(formatted).toContain('11 min');
  });

  it('formats small costs correctly', () => {
    const estimate: GenerationCostEstimate = {
      gpt4Tokens: 100,
      gpt4Cost: 0.001,
      ttsCharacters: 500,
      ttsCost: 0.007,
      totalCost: 0.008,
      estimatedDuration: 60,
    };

    const formatted = formatCostEstimate(estimate);
    expect(formatted).toBe('$0.01 (~1 min)');
  });

  it('formats larger costs correctly', () => {
    const estimate: GenerationCostEstimate = {
      gpt4Tokens: 10000,
      gpt4Cost: 0.50,
      ttsCharacters: 50000,
      ttsCost: 0.75,
      totalCost: 1.25,
      estimatedDuration: 1800,
    };

    const formatted = formatCostEstimate(estimate);
    expect(formatted).toBe('$1.25 (~30 min)');
  });
});

describe('getCostEstimate', () => {
  it('returns narrative estimate for NARRATIVE type', () => {
    const estimate = getCostEstimate('NARRATIVE');
    const directEstimate = estimateNarrativeCost();

    expect(estimate.totalCost).toBe(directEstimate.totalCost);
    expect(estimate.estimatedDuration).toBe(directEstimate.estimatedDuration);
  });

  it('returns interview estimate for INTERVIEW type', () => {
    const estimate = getCostEstimate('INTERVIEW');
    const directEstimate = estimateInterviewCost();

    expect(estimate.totalCost).toBe(directEstimate.totalCost);
    expect(estimate.estimatedDuration).toBe(directEstimate.estimatedDuration);
  });

  it('returns debate estimate for DEBATE type', () => {
    const estimate = getCostEstimate('DEBATE');
    const directEstimate = estimateDebateCost();

    expect(estimate.totalCost).toBe(directEstimate.totalCost);
    expect(estimate.estimatedDuration).toBe(directEstimate.estimatedDuration);
  });

  it('returns adventure estimate for ADVENTURE type', () => {
    const estimate = getCostEstimate('ADVENTURE');
    const directEstimate = estimateAdventureCost();

    expect(estimate.totalCost).toBe(directEstimate.totalCost);
    expect(estimate.estimatedDuration).toBe(directEstimate.estimatedDuration);
  });

  it('passes node count to adventure estimate', () => {
    const estimate5 = getCostEstimate('ADVENTURE', 5);
    const estimate10 = getCostEstimate('ADVENTURE', 10);

    expect(estimate5.totalCost).toBeLessThan(estimate10.totalCost);
    expect(estimate5.estimatedDuration).toBeLessThan(estimate10.estimatedDuration);
  });

  it('ignores node count for non-adventure types', () => {
    const estimate = getCostEstimate('NARRATIVE', 100);
    const directEstimate = estimateNarrativeCost();

    expect(estimate.totalCost).toBe(directEstimate.totalCost);
  });

  it('throws error for unknown episode type', () => {
    expect(() => {
      getCostEstimate('UNKNOWN' as any);
    }).toThrow('Unknown episode type: UNKNOWN');
  });
});

describe('cost estimate comparisons', () => {
  it('ranks costs correctly: narrative < interview < debate', () => {
    const narrative = estimateNarrativeCost();
    const interview = estimateInterviewCost();
    const debate = estimateDebateCost();

    expect(narrative.totalCost).toBeLessThan(interview.totalCost);
    expect(interview.totalCost).toBeLessThan(debate.totalCost);
  });

  it('ranks durations correctly: narrative < interview < debate', () => {
    const narrative = estimateNarrativeCost();
    const interview = estimateInterviewCost();
    const debate = estimateDebateCost();

    expect(narrative.estimatedDuration).toBeLessThan(interview.estimatedDuration);
    expect(interview.estimatedDuration).toBeLessThan(debate.estimatedDuration);
  });

  it('adventure cost scales appropriately', () => {
    const narrative = estimateNarrativeCost();
    const adventure10 = estimateAdventureCost(10);

    // 10-node adventure should cost more than a narrative
    expect(adventure10.totalCost).toBeGreaterThan(narrative.totalCost);
  });
});
