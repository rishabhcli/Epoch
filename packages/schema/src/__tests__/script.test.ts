import {
  ScriptParagraphSchema,
  ScriptSectionSchema,
  ScriptSchema,
  type ScriptParagraph,
  type ScriptSection,
  type Script,
} from '../script';

describe('ScriptParagraphSchema', () => {
  const validParagraph: ScriptParagraph = {
    text: 'In the year 476 CE, the Western Roman Empire fell to Germanic invaders.',
    citations: [
      { title: 'The Decline and Fall', type: 'book', author: 'Edward Gibbon' },
    ],
    footnote: 'Some scholars debate the exact date.',
  };

  it('validates a complete paragraph', () => {
    const result = ScriptParagraphSchema.safeParse(validParagraph);
    expect(result.success).toBe(true);
  });

  it('validates paragraph with only text', () => {
    const minimalParagraph = {
      text: 'Just the text, nothing more.',
    };
    const result = ScriptParagraphSchema.safeParse(minimalParagraph);
    expect(result.success).toBe(true);
  });

  it('rejects paragraph without text', () => {
    const invalidParagraph = {
      citations: [{ title: 'Test', type: 'book' }],
    };
    const result = ScriptParagraphSchema.safeParse(invalidParagraph);
    expect(result.success).toBe(false);
  });

  it('validates paragraph with empty citations array', () => {
    const paragraph = {
      text: 'Some text',
      citations: [],
    };
    const result = ScriptParagraphSchema.safeParse(paragraph);
    expect(result.success).toBe(true);
  });

  it('validates paragraph with footnote only', () => {
    const paragraph = {
      text: 'Main text here',
      footnote: 'Additional context for the listener',
    };
    const result = ScriptParagraphSchema.safeParse(paragraph);
    expect(result.success).toBe(true);
  });
});

describe('ScriptSectionSchema', () => {
  const createValidParagraphs = (count: number): ScriptParagraph[] => {
    return Array(count).fill(null).map((_, i) => ({
      text: `Paragraph ${i + 1} text content that describes historical events.`,
    }));
  };

  const validSection: ScriptSection = {
    title: 'The Beginning of the End',
    act: 'hook',
    paragraphs: createValidParagraphs(3),
    estimatedDuration: 180,
  };

  it('validates a complete section', () => {
    const result = ScriptSectionSchema.safeParse(validSection);
    expect(result.success).toBe(true);
  });

  it('validates all act types', () => {
    const acts = ['hook', 'context', 'conflict', 'breakthrough', 'legacy'] as const;
    acts.forEach((act) => {
      const section = { ...validSection, act };
      const result = ScriptSectionSchema.safeParse(section);
      expect(result.success).toBe(true);
    });
  });

  it('rejects section with fewer than 3 paragraphs', () => {
    const invalidSection = {
      ...validSection,
      paragraphs: createValidParagraphs(2),
    };
    const result = ScriptSectionSchema.safeParse(invalidSection);
    expect(result.success).toBe(false);
  });

  it('rejects section with more than 10 paragraphs', () => {
    const invalidSection = {
      ...validSection,
      paragraphs: createValidParagraphs(11),
    };
    const result = ScriptSectionSchema.safeParse(invalidSection);
    expect(result.success).toBe(false);
  });

  it('accepts section with exactly 3 paragraphs (minimum)', () => {
    const section = {
      ...validSection,
      paragraphs: createValidParagraphs(3),
    };
    const result = ScriptSectionSchema.safeParse(section);
    expect(result.success).toBe(true);
  });

  it('accepts section with exactly 10 paragraphs (maximum)', () => {
    const section = {
      ...validSection,
      paragraphs: createValidParagraphs(10),
    };
    const result = ScriptSectionSchema.safeParse(section);
    expect(result.success).toBe(true);
  });

  it('rejects invalid act type', () => {
    const invalidSection = {
      ...validSection,
      act: 'introduction',
    };
    const result = ScriptSectionSchema.safeParse(invalidSection);
    expect(result.success).toBe(false);
  });

  it('rejects section without title', () => {
    const { title, ...sectionWithoutTitle } = validSection;
    const result = ScriptSectionSchema.safeParse(sectionWithoutTitle);
    expect(result.success).toBe(false);
  });

  it('rejects section without estimatedDuration', () => {
    const { estimatedDuration, ...sectionWithoutDuration } = validSection;
    const result = ScriptSectionSchema.safeParse(sectionWithoutDuration);
    expect(result.success).toBe(false);
  });
});

describe('ScriptSchema', () => {
  const createValidSection = (act: 'hook' | 'context' | 'conflict' | 'breakthrough' | 'legacy'): ScriptSection => ({
    title: `Section ${act}`,
    act,
    paragraphs: [
      { text: 'First paragraph with historical content.' },
      { text: 'Second paragraph continuing the narrative.' },
      { text: 'Third paragraph wrapping up this section.' },
    ],
    estimatedDuration: 180,
  });

  const validScript: Script = {
    title: 'The Fall of Rome',
    subtitle: 'An Empire Crumbles',
    introduction: 'Welcome to Epoch Pod. Today we explore one of the most pivotal moments in human history.',
    sections: [
      createValidSection('hook'),
      createValidSection('context'),
      createValidSection('conflict'),
      createValidSection('breakthrough'),
      createValidSection('legacy'),
    ],
    conclusion: 'And so the Western Roman Empire passed into history, but its legacy lives on.',
    transcript: 'Full clean transcript of the episode without any stage directions or markers.',
    wordCount: 1500,
    estimatedDuration: 900,
    allCitations: [
      { title: 'The Decline and Fall', type: 'book', author: 'Gibbon' },
    ],
  };

  it('validates a complete script', () => {
    const result = ScriptSchema.safeParse(validScript);
    expect(result.success).toBe(true);
  });

  it('validates script without subtitle', () => {
    const { subtitle, ...scriptWithoutSubtitle } = validScript;
    const result = ScriptSchema.safeParse(scriptWithoutSubtitle);
    expect(result.success).toBe(true);
  });

  it('rejects script with fewer than 5 sections', () => {
    const invalidScript = {
      ...validScript,
      sections: validScript.sections.slice(0, 4),
    };
    const result = ScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects script with more than 5 sections', () => {
    const invalidScript = {
      ...validScript,
      sections: [...validScript.sections, createValidSection('hook')],
    };
    const result = ScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects word count below 1200', () => {
    const invalidScript = {
      ...validScript,
      wordCount: 1199,
    };
    const result = ScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects word count above 1800', () => {
    const invalidScript = {
      ...validScript,
      wordCount: 1801,
    };
    const result = ScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('accepts minimum word count (1200)', () => {
    const script = {
      ...validScript,
      wordCount: 1200,
    };
    const result = ScriptSchema.safeParse(script);
    expect(result.success).toBe(true);
  });

  it('accepts maximum word count (1800)', () => {
    const script = {
      ...validScript,
      wordCount: 1800,
    };
    const result = ScriptSchema.safeParse(script);
    expect(result.success).toBe(true);
  });

  it('rejects duration below 600 seconds', () => {
    const invalidScript = {
      ...validScript,
      estimatedDuration: 599,
    };
    const result = ScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('rejects duration above 1800 seconds', () => {
    const invalidScript = {
      ...validScript,
      estimatedDuration: 1801,
    };
    const result = ScriptSchema.safeParse(invalidScript);
    expect(result.success).toBe(false);
  });

  it('accepts minimum duration (600 seconds)', () => {
    const script = {
      ...validScript,
      estimatedDuration: 600,
    };
    const result = ScriptSchema.safeParse(script);
    expect(result.success).toBe(true);
  });

  it('accepts maximum duration (1800 seconds)', () => {
    const script = {
      ...validScript,
      estimatedDuration: 1800,
    };
    const result = ScriptSchema.safeParse(script);
    expect(result.success).toBe(true);
  });

  it('rejects script without introduction', () => {
    const { introduction, ...scriptWithoutIntro } = validScript;
    const result = ScriptSchema.safeParse(scriptWithoutIntro);
    expect(result.success).toBe(false);
  });

  it('rejects script without conclusion', () => {
    const { conclusion, ...scriptWithoutConclusion } = validScript;
    const result = ScriptSchema.safeParse(scriptWithoutConclusion);
    expect(result.success).toBe(false);
  });

  it('rejects script without transcript', () => {
    const { transcript, ...scriptWithoutTranscript } = validScript;
    const result = ScriptSchema.safeParse(scriptWithoutTranscript);
    expect(result.success).toBe(false);
  });

  it('validates script with empty citations array', () => {
    const script = {
      ...validScript,
      allCitations: [],
    };
    const result = ScriptSchema.safeParse(script);
    expect(result.success).toBe(true);
  });

  it('validates citations within the script', () => {
    const script = {
      ...validScript,
      allCitations: [
        { title: 'Source 1', type: 'book' as const },
        { title: 'Source 2', type: 'article' as const, author: 'Author' },
        { title: 'Source 3', type: 'website' as const, url: 'https://example.com' },
      ],
    };
    const result = ScriptSchema.safeParse(script);
    expect(result.success).toBe(true);
  });
});
