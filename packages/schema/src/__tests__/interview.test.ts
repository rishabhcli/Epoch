import {
  InterviewQuestionSchema,
  InterviewSourceSchema,
  InterviewOutlineSchema,
  DialogueSegmentSchema,
  InterviewScriptSchema,
  type InterviewQuestion,
  type InterviewSource,
  type InterviewOutline,
  type DialogueSegment,
  type InterviewScript,
} from '../interview';

describe('InterviewQuestionSchema', () => {
  const validQuestion: InterviewQuestion = {
    question: 'What inspired you to pursue physics at such a young age?',
    category: 'background',
    researchNotes: 'Einstein showed early aptitude for mathematics and physics, reportedly teaching himself Euclidean geometry at age 12.',
  };

  it('validates a complete question', () => {
    const result = InterviewQuestionSchema.safeParse(validQuestion);
    expect(result.success).toBe(true);
  });

  it('validates all question categories', () => {
    const categories = ['background', 'achievement', 'controversy', 'personal', 'legacy', 'hypothetical'] as const;
    categories.forEach((category) => {
      const question = { ...validQuestion, category };
      const result = InterviewQuestionSchema.safeParse(question);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid category', () => {
    const invalidQuestion = {
      ...validQuestion,
      category: 'invalid_category',
    };
    const result = InterviewQuestionSchema.safeParse(invalidQuestion);
    expect(result.success).toBe(false);
  });

  it('rejects question shorter than 10 characters', () => {
    const invalidQuestion = {
      ...validQuestion,
      question: 'Too short',
    };
    const result = InterviewQuestionSchema.safeParse(invalidQuestion);
    expect(result.success).toBe(false);
  });

  it('rejects question longer than 300 characters', () => {
    const invalidQuestion = {
      ...validQuestion,
      question: 'A'.repeat(301),
    };
    const result = InterviewQuestionSchema.safeParse(invalidQuestion);
    expect(result.success).toBe(false);
  });

  it('accepts question at minimum length (10 characters)', () => {
    const question = {
      ...validQuestion,
      question: 'A'.repeat(10),
    };
    const result = InterviewQuestionSchema.safeParse(question);
    expect(result.success).toBe(true);
  });

  it('accepts question at maximum length (300 characters)', () => {
    const question = {
      ...validQuestion,
      question: 'A'.repeat(300),
    };
    const result = InterviewQuestionSchema.safeParse(question);
    expect(result.success).toBe(true);
  });
});

describe('InterviewSourceSchema', () => {
  const validSource: InterviewSource = {
    title: 'Einstein: His Life and Universe',
    author: 'Walter Isaacson',
    type: 'book',
    url: 'https://example.com/book',
    year: 2007,
  };

  it('validates a complete source', () => {
    const result = InterviewSourceSchema.safeParse(validSource);
    expect(result.success).toBe(true);
  });

  it('validates source with only required fields', () => {
    const minimalSource = {
      title: 'Source Title',
      type: 'article',
    };
    const result = InterviewSourceSchema.safeParse(minimalSource);
    expect(result.success).toBe(true);
  });

  it('validates all source types', () => {
    const types = ['book', 'article', 'primary_source', 'academic_paper'] as const;
    types.forEach((type) => {
      const source = { title: 'Test', type };
      const result = InterviewSourceSchema.safeParse(source);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid source type', () => {
    const invalidSource = {
      title: 'Test',
      type: 'invalid_type',
    };
    const result = InterviewSourceSchema.safeParse(invalidSource);
    expect(result.success).toBe(false);
  });

  it('rejects invalid URL format', () => {
    const invalidSource = {
      ...validSource,
      url: 'not-a-url',
    };
    const result = InterviewSourceSchema.safeParse(invalidSource);
    expect(result.success).toBe(false);
  });
});

describe('InterviewOutlineSchema', () => {
  const createValidQuestions = (count: number): InterviewQuestion[] => {
    return Array(count).fill(null).map((_, i) => ({
      question: `Question ${i + 1} about the historical figure's life and work?`,
      category: 'background' as const,
      researchNotes: `Research notes for question ${i + 1}`,
    }));
  };

  const validOutline: InterviewOutline = {
    guest: {
      name: 'Albert Einstein',
      role: 'Theoretical Physicist',
      era: '20th Century',
      biography: 'Albert Einstein was a German-born theoretical physicist who developed the theory of relativity. He is widely acknowledged to be one of the greatest and most influential physicists of all time. He received the 1921 Nobel Prize in Physics.',
      majorAccomplishments: [
        'Theory of Special Relativity',
        'Theory of General Relativity',
        'Photoelectric Effect explanation',
      ],
      historicalContext: 'Einstein lived during a period of tremendous scientific advancement and political upheaval. His work revolutionized our understanding of space, time, and gravity.',
    },
    topic: 'The Development of Relativity',
    angle: 'Focusing on the thought experiments that led to breakthrough insights',
    questions: createValidQuestions(8),
    sources: [
      { title: 'Source 1', type: 'book' },
      { title: 'Source 2', type: 'article' },
      { title: 'Source 3', type: 'academic_paper' },
    ],
  };

  it('validates a complete outline', () => {
    const result = InterviewOutlineSchema.safeParse(validOutline);
    expect(result.success).toBe(true);
  });

  it('rejects biography shorter than 200 characters', () => {
    const invalidOutline = {
      ...validOutline,
      guest: {
        ...validOutline.guest,
        biography: 'Too short biography.',
      },
    };
    const result = InterviewOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects biography longer than 400 characters', () => {
    const invalidOutline = {
      ...validOutline,
      guest: {
        ...validOutline.guest,
        biography: 'A'.repeat(401),
      },
    };
    const result = InterviewOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects fewer than 8 questions', () => {
    const invalidOutline = {
      ...validOutline,
      questions: createValidQuestions(7),
    };
    const result = InterviewOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects more than 12 questions', () => {
    const invalidOutline = {
      ...validOutline,
      questions: createValidQuestions(13),
    };
    const result = InterviewOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('accepts exactly 8 questions (minimum)', () => {
    const outline = {
      ...validOutline,
      questions: createValidQuestions(8),
    };
    const result = InterviewOutlineSchema.safeParse(outline);
    expect(result.success).toBe(true);
  });

  it('accepts exactly 12 questions (maximum)', () => {
    const outline = {
      ...validOutline,
      questions: createValidQuestions(12),
    };
    const result = InterviewOutlineSchema.safeParse(outline);
    expect(result.success).toBe(true);
  });

  it('rejects fewer than 3 sources', () => {
    const invalidOutline = {
      ...validOutline,
      sources: [
        { title: 'Source 1', type: 'book' as const },
        { title: 'Source 2', type: 'article' as const },
      ],
    };
    const result = InterviewOutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('accepts exactly 3 sources (minimum)', () => {
    const outline = {
      ...validOutline,
      sources: [
        { title: 'Source 1', type: 'book' as const },
        { title: 'Source 2', type: 'article' as const },
        { title: 'Source 3', type: 'primary_source' as const },
      ],
    };
    const result = InterviewOutlineSchema.safeParse(outline);
    expect(result.success).toBe(true);
  });
});

describe('DialogueSegmentSchema', () => {
  const validSegment: DialogueSegment = {
    speaker: 'HOST',
    text: 'Welcome to the show, Professor Einstein. It is an honor to have you here today to discuss your groundbreaking work.',
    emotion: 'enthusiastic',
  };

  it('validates a complete segment', () => {
    const result = DialogueSegmentSchema.safeParse(validSegment);
    expect(result.success).toBe(true);
  });

  it('validates segment without emotion', () => {
    const { emotion, ...segmentWithoutEmotion } = validSegment;
    const result = DialogueSegmentSchema.safeParse(segmentWithoutEmotion);
    expect(result.success).toBe(true);
  });

  it('validates HOST speaker', () => {
    const segment = { ...validSegment, speaker: 'HOST' };
    const result = DialogueSegmentSchema.safeParse(segment);
    expect(result.success).toBe(true);
  });

  it('validates GUEST speaker', () => {
    const segment = { ...validSegment, speaker: 'GUEST' };
    const result = DialogueSegmentSchema.safeParse(segment);
    expect(result.success).toBe(true);
  });

  it('rejects invalid speaker', () => {
    const invalidSegment = {
      ...validSegment,
      speaker: 'NARRATOR',
    };
    const result = DialogueSegmentSchema.safeParse(invalidSegment);
    expect(result.success).toBe(false);
  });

  it('validates all emotion types', () => {
    const emotions = ['neutral', 'enthusiastic', 'thoughtful', 'somber', 'excited'] as const;
    emotions.forEach((emotion) => {
      const segment = { ...validSegment, emotion };
      const result = DialogueSegmentSchema.safeParse(segment);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid emotion', () => {
    const invalidSegment = {
      ...validSegment,
      emotion: 'angry',
    };
    const result = DialogueSegmentSchema.safeParse(invalidSegment);
    expect(result.success).toBe(false);
  });

  it('rejects text shorter than 50 characters', () => {
    const invalidSegment = {
      ...validSegment,
      text: 'Too short text.',
    };
    const result = DialogueSegmentSchema.safeParse(invalidSegment);
    expect(result.success).toBe(false);
  });

  it('rejects text longer than 400 characters', () => {
    const invalidSegment = {
      ...validSegment,
      text: 'A'.repeat(401),
    };
    const result = DialogueSegmentSchema.safeParse(invalidSegment);
    expect(result.success).toBe(false);
  });
});

describe('InterviewScriptSchema', () => {
  const createValidSegments = (count: number): DialogueSegment[] => {
    return Array(count).fill(null).map((_, i) => ({
      speaker: i % 2 === 0 ? 'HOST' as const : 'GUEST' as const,
      text: `This is segment ${i + 1} with enough text to meet the minimum requirement of fifty characters.`,
    }));
  };

  const validScript: InterviewScript = {
    intro: {
      speaker: 'HOST',
      text: 'Welcome to Epoch Pod. Today we have a very special guest - one of the greatest minds in human history. Please welcome Albert Einstein to discuss the nature of space, time, and reality.',
    },
    segments: createValidSegments(20),
    outro: {
      speaker: 'HOST',
      text: 'Thank you so much for joining us today, Professor Einstein. Your insights have been truly illuminating.',
    },
    totalWords: 2500,
    estimatedDuration: 900,
  };

  it('validates a complete script', () => {
    const result = InterviewScriptSchema.safeParse(validScript);
    expect(result.success).toBe(true);
  });

  it('rejects intro speaker that is not HOST', () => {
    const invalidScript = {
      ...validScript,
      intro: {
        speaker: 'GUEST',
        text: validScript.intro.text,
      },
    };
    const result = InterviewScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects outro speaker that is not HOST', () => {
    const invalidScript = {
      ...validScript,
      outro: {
        speaker: 'GUEST',
        text: validScript.outro.text,
      },
    };
    const result = InterviewScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects intro text shorter than 150 characters', () => {
    const invalidScript = {
      ...validScript,
      intro: {
        speaker: 'HOST' as const,
        text: 'A'.repeat(149),
      },
    };
    const result = InterviewScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects intro text longer than 300 characters', () => {
    const invalidScript = {
      ...validScript,
      intro: {
        speaker: 'HOST' as const,
        text: 'A'.repeat(301),
      },
    };
    const result = InterviewScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects fewer than 20 segments', () => {
    const invalidScript = {
      ...validScript,
      segments: createValidSegments(19),
    };
    const result = InterviewScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects more than 60 segments', () => {
    const invalidScript = {
      ...validScript,
      segments: createValidSegments(61),
    };
    const result = InterviewScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('accepts exactly 20 segments (minimum)', () => {
    const script = {
      ...validScript,
      segments: createValidSegments(20),
    };
    const result = InterviewScriptSchema.safeParse(script);
    expect(result.success).toBe(true);
  });

  it('accepts exactly 60 segments (maximum)', () => {
    const script = {
      ...validScript,
      segments: createValidSegments(60),
    };
    const result = InterviewScriptSchema.safeParse(script);
    expect(result.success).toBe(true);
  });

  it('rejects outro text shorter than 100 characters', () => {
    const invalidScript = {
      ...validScript,
      outro: {
        speaker: 'HOST' as const,
        text: 'A'.repeat(99),
      },
    };
    const result = InterviewScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects outro text longer than 200 characters', () => {
    const invalidScript = {
      ...validScript,
      outro: {
        speaker: 'HOST' as const,
        text: 'A'.repeat(201),
      },
    };
    const result = InterviewScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });
});
