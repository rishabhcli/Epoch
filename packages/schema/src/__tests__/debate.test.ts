import {
  DebateEvidenceSchema,
  DebateKeyPointSchema,
  DebateRebuttalSchema,
  DebateArgumentSchema,
  DebateOutlineSchema,
  DebateSegmentSchema,
  DebateScriptSchema,
  type DebateEvidence,
  type DebateKeyPoint,
  type DebateRebuttal,
  type DebateArgument,
  type DebateOutline,
  type DebateSegment,
  type DebateScript,
} from '../debate';

describe('DebateEvidenceSchema', () => {
  const validEvidence: DebateEvidence = {
    fact: 'The Roman Empire fell in 476 CE',
    source: 'Historical Records',
    year: 476,
  };

  it('validates complete evidence', () => {
    const result = DebateEvidenceSchema.safeParse(validEvidence);
    expect(result.success).toBe(true);
  });

  it('validates evidence without year', () => {
    const { year, ...evidenceWithoutYear } = validEvidence;
    const result = DebateEvidenceSchema.safeParse(evidenceWithoutYear);
    expect(result.success).toBe(true);
  });

  it('rejects evidence without fact', () => {
    const { fact, ...evidenceWithoutFact } = validEvidence;
    const result = DebateEvidenceSchema.safeParse(evidenceWithoutFact);
    expect(result.success).toBe(false);
  });

  it('rejects evidence without source', () => {
    const { source, ...evidenceWithoutSource } = validEvidence;
    const result = DebateEvidenceSchema.safeParse(evidenceWithoutSource);
    expect(result.success).toBe(false);
  });
});

describe('DebateKeyPointSchema', () => {
  const validKeyPoint: DebateKeyPoint = {
    claim: 'The fall of Rome was primarily caused by economic decline and military overextension.',
    evidence: [
      { fact: 'Military spending increased dramatically', source: 'Roman Treasury Records' },
      { fact: 'Currency devaluation occurred', source: 'Archaeological evidence' },
    ],
    reasoning: 'The combination of unsustainable military spending and economic instability created conditions that made the empire vulnerable to external threats.',
  };

  it('validates a complete key point', () => {
    const result = DebateKeyPointSchema.safeParse(validKeyPoint);
    expect(result.success).toBe(true);
  });

  it('rejects claim shorter than 20 characters', () => {
    const invalidKeyPoint = {
      ...validKeyPoint,
      claim: 'Too short claim.',
    };
    const result = DebateKeyPointSchema.safeParse(invalidKeyPoint);
    expect(result.success).toBe(false);
  });

  it('rejects claim longer than 200 characters', () => {
    const invalidKeyPoint = {
      ...validKeyPoint,
      claim: 'A'.repeat(201),
    };
    const result = DebateKeyPointSchema.safeParse(invalidKeyPoint);
    expect(result.success).toBe(false);
  });

  it('rejects fewer than 1 evidence item', () => {
    const invalidKeyPoint = {
      ...validKeyPoint,
      evidence: [],
    };
    const result = DebateKeyPointSchema.safeParse(invalidKeyPoint);
    expect(result.success).toBe(false);
  });

  it('rejects more than 3 evidence items', () => {
    const invalidKeyPoint = {
      ...validKeyPoint,
      evidence: Array(4).fill({ fact: 'Fact', source: 'Source' }),
    };
    const result = DebateKeyPointSchema.safeParse(invalidKeyPoint);
    expect(result.success).toBe(false);
  });

  it('accepts exactly 1 evidence item (minimum)', () => {
    const keyPoint = {
      ...validKeyPoint,
      evidence: [{ fact: 'Single fact', source: 'Source' }],
    };
    const result = DebateKeyPointSchema.safeParse(keyPoint);
    expect(result.success).toBe(true);
  });

  it('accepts exactly 3 evidence items (maximum)', () => {
    const keyPoint = {
      ...validKeyPoint,
      evidence: Array(3).fill({ fact: 'Fact', source: 'Source' }),
    };
    const result = DebateKeyPointSchema.safeParse(keyPoint);
    expect(result.success).toBe(true);
  });

  it('rejects reasoning shorter than 50 characters', () => {
    const invalidKeyPoint = {
      ...validKeyPoint,
      reasoning: 'Too short reasoning.',
    };
    const result = DebateKeyPointSchema.safeParse(invalidKeyPoint);
    expect(result.success).toBe(false);
  });

  it('rejects reasoning longer than 300 characters', () => {
    const invalidKeyPoint = {
      ...validKeyPoint,
      reasoning: 'A'.repeat(301),
    };
    const result = DebateKeyPointSchema.safeParse(invalidKeyPoint);
    expect(result.success).toBe(false);
  });
});

describe('DebateRebuttalSchema', () => {
  const validRebuttal: DebateRebuttal = {
    anticipatedCounterArgument: 'Some argue that barbarian invasions were the primary cause',
    response: 'While invasions were significant, they were successful largely because the empire was already weakened by internal factors.',
    evidence: 'Earlier invasions were repelled when the empire was stronger',
  };

  it('validates a complete rebuttal', () => {
    const result = DebateRebuttalSchema.safeParse(validRebuttal);
    expect(result.success).toBe(true);
  });

  it('rejects response shorter than 50 characters', () => {
    const invalidRebuttal = {
      ...validRebuttal,
      response: 'Too short.',
    };
    const result = DebateRebuttalSchema.safeParse(invalidRebuttal);
    expect(result.success).toBe(false);
  });

  it('rejects response longer than 300 characters', () => {
    const invalidRebuttal = {
      ...validRebuttal,
      response: 'A'.repeat(301),
    };
    const result = DebateRebuttalSchema.safeParse(invalidRebuttal);
    expect(result.success).toBe(false);
  });

  it('rejects missing anticipatedCounterArgument', () => {
    const { anticipatedCounterArgument, ...rebuttalWithout } = validRebuttal;
    const result = DebateRebuttalSchema.safeParse(rebuttalWithout);
    expect(result.success).toBe(false);
  });
});

describe('DebateArgumentSchema', () => {
  const createValidKeyPoint = (): DebateKeyPoint => ({
    claim: 'This is a valid claim that meets the minimum length requirement.',
    evidence: [{ fact: 'Supporting fact', source: 'Historical source' }],
    reasoning: 'This reasoning explains why the claim is valid and connects the evidence to the broader argument being made.',
  });

  const createValidRebuttal = (): DebateRebuttal => ({
    anticipatedCounterArgument: 'A possible counter-argument',
    response: 'A detailed response that addresses the counter-argument and provides evidence to support our position.',
    evidence: 'Supporting evidence for the rebuttal',
  });

  const validArgument: DebateArgument = {
    position: 'Internal factors caused the fall of Rome',
    openingStatement: 'The Western Roman Empire did not fall due to a single catastrophic event, but rather from a gradual decline driven by internal factors. Economic instability, political corruption, and military overextension weakened the empire from within, making it vulnerable to external pressures.',
    keyPoints: [createValidKeyPoint(), createValidKeyPoint(), createValidKeyPoint()],
    rebuttals: [createValidRebuttal(), createValidRebuttal()],
    closingStatement: 'In conclusion, while external invasions delivered the final blow, the true causes of Roman decline were internal. The lessons of Rome remain relevant today: no empire, no matter how powerful, can survive sustained economic mismanagement and political dysfunction.',
  };

  it('validates a complete argument', () => {
    const result = DebateArgumentSchema.safeParse(validArgument);
    expect(result.success).toBe(true);
  });

  it('rejects opening statement shorter than 200 characters', () => {
    const invalidArgument = {
      ...validArgument,
      openingStatement: 'A'.repeat(199),
    };
    const result = DebateArgumentSchema.safeParse(invalidArgument);
    expect(result.success).toBe(false);
  });

  it('rejects opening statement longer than 400 characters', () => {
    const invalidArgument = {
      ...validArgument,
      openingStatement: 'A'.repeat(401),
    };
    const result = DebateArgumentSchema.safeParse(invalidArgument);
    expect(result.success).toBe(false);
  });

  it('rejects fewer than 3 key points', () => {
    const invalidArgument = {
      ...validArgument,
      keyPoints: [createValidKeyPoint(), createValidKeyPoint()],
    };
    const result = DebateArgumentSchema.safeParse(invalidArgument);
    expect(result.success).toBe(false);
  });

  it('rejects more than 3 key points', () => {
    const invalidArgument = {
      ...validArgument,
      keyPoints: [createValidKeyPoint(), createValidKeyPoint(), createValidKeyPoint(), createValidKeyPoint()],
    };
    const result = DebateArgumentSchema.safeParse(invalidArgument);
    expect(result.success).toBe(false);
  });

  it('rejects fewer than 2 rebuttals', () => {
    const invalidArgument = {
      ...validArgument,
      rebuttals: [createValidRebuttal()],
    };
    const result = DebateArgumentSchema.safeParse(invalidArgument);
    expect(result.success).toBe(false);
  });

  it('rejects more than 2 rebuttals', () => {
    const invalidArgument = {
      ...validArgument,
      rebuttals: [createValidRebuttal(), createValidRebuttal(), createValidRebuttal()],
    };
    const result = DebateArgumentSchema.safeParse(invalidArgument);
    expect(result.success).toBe(false);
  });

  it('rejects closing statement shorter than 200 characters', () => {
    const invalidArgument = {
      ...validArgument,
      closingStatement: 'A'.repeat(199),
    };
    const result = DebateArgumentSchema.safeParse(invalidArgument);
    expect(result.success).toBe(false);
  });

  it('rejects closing statement longer than 400 characters', () => {
    const invalidArgument = {
      ...validArgument,
      closingStatement: 'A'.repeat(401),
    };
    const result = DebateArgumentSchema.safeParse(invalidArgument);
    expect(result.success).toBe(false);
  });
});

describe('DebateSegmentSchema', () => {
  const validSegment: DebateSegment = {
    speaker: 'MODERATOR',
    voice: 'alloy',
    text: 'Welcome to today\'s debate. We have two distinguished historians here to discuss the fall of Rome.',
    duration: 15,
  };

  it('validates a complete segment', () => {
    const result = DebateSegmentSchema.safeParse(validSegment);
    expect(result.success).toBe(true);
  });

  it('validates segment without duration', () => {
    const { duration, ...segmentWithoutDuration } = validSegment;
    const result = DebateSegmentSchema.safeParse(segmentWithoutDuration);
    expect(result.success).toBe(true);
  });

  it('validates all speaker types', () => {
    const speakers = ['MODERATOR', 'POSITION_1', 'POSITION_2'] as const;
    speakers.forEach((speaker) => {
      const segment = { ...validSegment, speaker };
      const result = DebateSegmentSchema.safeParse(segment);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid speaker', () => {
    const invalidSegment = {
      ...validSegment,
      speaker: 'HOST',
    };
    const result = DebateSegmentSchema.safeParse(invalidSegment);
    expect(result.success).toBe(false);
  });

  it('rejects text shorter than 50 characters', () => {
    const invalidSegment = {
      ...validSegment,
      text: 'Too short.',
    };
    const result = DebateSegmentSchema.safeParse(invalidSegment);
    expect(result.success).toBe(false);
  });

  it('rejects text longer than 400 characters', () => {
    const invalidSegment = {
      ...validSegment,
      text: 'A'.repeat(401),
    };
    const result = DebateSegmentSchema.safeParse(invalidSegment);
    expect(result.success).toBe(false);
  });
});

describe('DebateScriptSchema', () => {
  const createValidSegments = (count: number): DebateSegment[] => {
    const speakers = ['MODERATOR', 'POSITION_1', 'POSITION_2'] as const;
    return Array(count).fill(null).map((_, i) => ({
      speaker: speakers[i % 3],
      voice: 'alloy',
      text: `This is segment ${i + 1} with enough text to meet the minimum requirement of fifty characters.`,
    }));
  };

  const validScript: DebateScript = {
    intro: 'Welcome to today\'s debate on the fall of the Roman Empire. We have two distinguished scholars presenting opposing viewpoints.',
    segments: createValidSegments(20),
    outro: 'Thank you to both debaters for their compelling arguments. Now it is time for our audience to vote.',
    totalWords: 3000,
    estimatedDuration: 1080,
  };

  it('validates a complete script', () => {
    const result = DebateScriptSchema.safeParse(validScript);
    expect(result.success).toBe(true);
  });

  it('rejects fewer than 20 segments', () => {
    const invalidScript = {
      ...validScript,
      segments: createValidSegments(19),
    };
    const result = DebateScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects more than 60 segments', () => {
    const invalidScript = {
      ...validScript,
      segments: createValidSegments(61),
    };
    const result = DebateScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('accepts exactly 20 segments (minimum)', () => {
    const script = {
      ...validScript,
      segments: createValidSegments(20),
    };
    const result = DebateScriptSchema.safeParse(script);
    expect(result.success).toBe(true);
  });

  it('accepts exactly 60 segments (maximum)', () => {
    const script = {
      ...validScript,
      segments: createValidSegments(60),
    };
    const result = DebateScriptSchema.safeParse(script);
    expect(result.success).toBe(true);
  });

  it('rejects missing intro', () => {
    const { intro, ...scriptWithoutIntro } = validScript;
    const result = DebateScriptSchema.safeParse(scriptWithoutIntro);
    expect(result.success).toBe(false);
  });

  it('rejects missing outro', () => {
    const { outro, ...scriptWithoutOutro } = validScript;
    const result = DebateScriptSchema.safeParse(scriptWithoutOutro);
    expect(result.success).toBe(false);
  });

  it('rejects missing totalWords', () => {
    const { totalWords, ...scriptWithoutWords } = validScript;
    const result = DebateScriptSchema.safeParse(scriptWithoutWords);
    expect(result.success).toBe(false);
  });

  it('rejects missing estimatedDuration', () => {
    const { estimatedDuration, ...scriptWithoutDuration } = validScript;
    const result = DebateScriptSchema.safeParse(scriptWithoutDuration);
    expect(result.success).toBe(false);
  });
});
