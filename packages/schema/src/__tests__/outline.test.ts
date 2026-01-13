import {
  CitationSchema,
  SectionBeatSchema,
  OutlineSectionSchema,
  OutlineSchema,
  type Citation,
  type SectionBeat,
  type OutlineSection,
  type Outline,
} from '../outline';

describe('CitationSchema', () => {
  const validCitation: Citation = {
    title: 'The History of Rome',
    author: 'Edward Gibbon',
    url: 'https://example.com/rome',
    year: 1776,
    type: 'book',
  };

  it('validates a complete citation', () => {
    const result = CitationSchema.safeParse(validCitation);
    expect(result.success).toBe(true);
  });

  it('validates citation with only required fields', () => {
    const minimalCitation = {
      title: 'A Brief History',
      type: 'article',
    };
    const result = CitationSchema.safeParse(minimalCitation);
    expect(result.success).toBe(true);
  });

  it('rejects citation without title', () => {
    const invalidCitation = {
      type: 'book',
    };
    const result = CitationSchema.safeParse(invalidCitation);
    expect(result.success).toBe(false);
  });

  it('rejects citation without type', () => {
    const invalidCitation = {
      title: 'Some Title',
    };
    const result = CitationSchema.safeParse(invalidCitation);
    expect(result.success).toBe(false);
  });

  it('rejects invalid citation type', () => {
    const invalidCitation = {
      title: 'Some Title',
      type: 'invalid_type',
    };
    const result = CitationSchema.safeParse(invalidCitation);
    expect(result.success).toBe(false);
  });

  it('validates all citation types', () => {
    const types = ['book', 'article', 'website', 'paper', 'archive'] as const;
    types.forEach((type) => {
      const citation = { title: 'Test', type };
      const result = CitationSchema.safeParse(citation);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid URL format', () => {
    const invalidCitation = {
      title: 'Test',
      type: 'website',
      url: 'not-a-valid-url',
    };
    const result = CitationSchema.safeParse(invalidCitation);
    expect(result.success).toBe(false);
  });

  it('accepts valid URL format', () => {
    const validUrls = [
      'https://example.com',
      'http://example.org/path',
      'https://sub.domain.com/path?query=1',
    ];
    validUrls.forEach((url) => {
      const citation = { title: 'Test', type: 'website' as const, url };
      const result = CitationSchema.safeParse(citation);
      expect(result.success).toBe(true);
    });
  });
});

describe('SectionBeatSchema', () => {
  const validBeat: SectionBeat = {
    beat: 'Caesar crosses the Rubicon',
    context: 'This moment marked the beginning of the civil war that would transform Rome',
    citations: [
      { title: 'Life of Caesar', type: 'book', author: 'Plutarch' },
    ],
  };

  it('validates a complete section beat', () => {
    const result = SectionBeatSchema.safeParse(validBeat);
    expect(result.success).toBe(true);
  });

  it('validates beat without citations', () => {
    const beatWithoutCitations = {
      beat: 'Caesar crosses the Rubicon',
      context: 'This moment marked the beginning of the civil war',
    };
    const result = SectionBeatSchema.safeParse(beatWithoutCitations);
    expect(result.success).toBe(true);
  });

  it('rejects beat without beat field', () => {
    const invalidBeat = {
      context: 'Some context',
    };
    const result = SectionBeatSchema.safeParse(invalidBeat);
    expect(result.success).toBe(false);
  });

  it('rejects beat without context', () => {
    const invalidBeat = {
      beat: 'Some beat',
    };
    const result = SectionBeatSchema.safeParse(invalidBeat);
    expect(result.success).toBe(false);
  });
});

describe('OutlineSectionSchema', () => {
  const validSection: OutlineSection = {
    title: 'The Hook',
    act: 'hook',
    beats: [
      { beat: 'Beat 1', context: 'Context 1' },
      { beat: 'Beat 2', context: 'Context 2' },
    ],
    estimatedDuration: 120,
  };

  it('validates a complete section', () => {
    const result = OutlineSectionSchema.safeParse(validSection);
    expect(result.success).toBe(true);
  });

  it('validates all act types', () => {
    const acts = ['hook', 'context', 'conflict', 'breakthrough', 'legacy'] as const;
    acts.forEach((act) => {
      const section = { ...validSection, act };
      const result = OutlineSectionSchema.safeParse(section);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid act type', () => {
    const invalidSection = {
      ...validSection,
      act: 'invalid_act',
    };
    const result = OutlineSectionSchema.safeParse(invalidSection);
    expect(result.success).toBe(false);
  });

  it('rejects section with fewer than 2 beats', () => {
    const invalidSection = {
      ...validSection,
      beats: [{ beat: 'Only one', context: 'Context' }],
    };
    const result = OutlineSectionSchema.safeParse(invalidSection);
    expect(result.success).toBe(false);
  });

  it('rejects section with more than 5 beats', () => {
    const invalidSection = {
      ...validSection,
      beats: Array(6).fill({ beat: 'Beat', context: 'Context' }),
    };
    const result = OutlineSectionSchema.safeParse(invalidSection);
    expect(result.success).toBe(false);
  });

  it('accepts section with exactly 2 beats (minimum)', () => {
    const section = {
      ...validSection,
      beats: [
        { beat: 'Beat 1', context: 'Context 1' },
        { beat: 'Beat 2', context: 'Context 2' },
      ],
    };
    const result = OutlineSectionSchema.safeParse(section);
    expect(result.success).toBe(true);
  });

  it('accepts section with exactly 5 beats (maximum)', () => {
    const section = {
      ...validSection,
      beats: Array(5).fill({ beat: 'Beat', context: 'Context' }),
    };
    const result = OutlineSectionSchema.safeParse(section);
    expect(result.success).toBe(true);
  });
});

describe('OutlineSchema', () => {
  const createValidSection = (act: 'hook' | 'context' | 'conflict' | 'breakthrough' | 'legacy'): OutlineSection => ({
    title: `Section ${act}`,
    act,
    beats: [
      { beat: 'Beat 1', context: 'Context 1' },
      { beat: 'Beat 2', context: 'Context 2' },
    ],
    estimatedDuration: 180,
  });

  const validOutline: Outline = {
    title: 'The Fall of Rome',
    subtitle: 'How an Empire Crumbled',
    topic: 'The decline and fall of the Western Roman Empire',
    era: '5th century CE',
    hook: 'In 476 CE, a young barbarian king deposed the last Roman emperor, ending over a thousand years of history.',
    sections: [
      createValidSection('hook'),
      createValidSection('context'),
      createValidSection('conflict'),
      createValidSection('breakthrough'),
      createValidSection('legacy'),
    ],
    totalEstimatedDuration: 900,
    keyThemes: ['decline', 'transformation', 'legacy'],
    targetAudience: 'History enthusiasts interested in Roman history',
  };

  it('validates a complete outline', () => {
    const result = OutlineSchema.safeParse(validOutline);
    expect(result.success).toBe(true);
  });

  it('validates outline without subtitle', () => {
    const { subtitle, ...outlineWithoutSubtitle } = validOutline;
    const result = OutlineSchema.safeParse(outlineWithoutSubtitle);
    expect(result.success).toBe(true);
  });

  it('rejects outline with fewer than 5 sections', () => {
    const invalidOutline = {
      ...validOutline,
      sections: validOutline.sections.slice(0, 4),
    };
    const result = OutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects outline with more than 5 sections', () => {
    const invalidOutline = {
      ...validOutline,
      sections: [...validOutline.sections, createValidSection('hook')],
    };
    const result = OutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects duration below 600 seconds (10 minutes)', () => {
    const invalidOutline = {
      ...validOutline,
      totalEstimatedDuration: 599,
    };
    const result = OutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects duration above 1800 seconds (30 minutes)', () => {
    const invalidOutline = {
      ...validOutline,
      totalEstimatedDuration: 1801,
    };
    const result = OutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('accepts minimum valid duration (600 seconds)', () => {
    const outline = {
      ...validOutline,
      totalEstimatedDuration: 600,
    };
    const result = OutlineSchema.safeParse(outline);
    expect(result.success).toBe(true);
  });

  it('accepts maximum valid duration (1800 seconds)', () => {
    const outline = {
      ...validOutline,
      totalEstimatedDuration: 1800,
    };
    const result = OutlineSchema.safeParse(outline);
    expect(result.success).toBe(true);
  });

  it('rejects fewer than 2 key themes', () => {
    const invalidOutline = {
      ...validOutline,
      keyThemes: ['only one'],
    };
    const result = OutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('rejects more than 5 key themes', () => {
    const invalidOutline = {
      ...validOutline,
      keyThemes: ['one', 'two', 'three', 'four', 'five', 'six'],
    };
    const result = OutlineSchema.safeParse(invalidOutline);
    expect(result.success).toBe(false);
  });

  it('accepts exactly 2 key themes (minimum)', () => {
    const outline = {
      ...validOutline,
      keyThemes: ['theme1', 'theme2'],
    };
    const result = OutlineSchema.safeParse(outline);
    expect(result.success).toBe(true);
  });

  it('accepts exactly 5 key themes (maximum)', () => {
    const outline = {
      ...validOutline,
      keyThemes: ['one', 'two', 'three', 'four', 'five'],
    };
    const result = OutlineSchema.safeParse(outline);
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const requiredFields = ['title', 'topic', 'era', 'hook', 'sections', 'totalEstimatedDuration', 'keyThemes', 'targetAudience'];

    requiredFields.forEach((field) => {
      const invalidOutline = { ...validOutline };
      delete (invalidOutline as Record<string, unknown>)[field];
      const result = OutlineSchema.safeParse(invalidOutline);
      expect(result.success).toBe(false);
    });
  });
});
