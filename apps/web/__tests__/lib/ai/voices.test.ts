import {
  OPENAI_VOICES,
  VOICE_PRESETS,
  GUEST_VOICE_OVERRIDES,
  getGuestVoice,
  isValidVoice,
  getVoiceOrDefault,
  type OpenAIVoice,
} from '@/lib/ai/voices';

describe('OPENAI_VOICES', () => {
  it('contains all expected voice options', () => {
    expect(OPENAI_VOICES).toEqual({
      alloy: 'alloy',
      echo: 'echo',
      fable: 'fable',
      onyx: 'onyx',
      nova: 'nova',
      shimmer: 'shimmer',
    });
  });

  it('has exactly 6 voice options', () => {
    expect(Object.keys(OPENAI_VOICES)).toHaveLength(6);
  });
});

describe('VOICE_PRESETS', () => {
  describe('narrative preset', () => {
    it('uses onyx as narrator voice', () => {
      expect(VOICE_PRESETS.narrative.narrator).toBe('onyx');
    });

    it('has default speed of 1.0', () => {
      expect(VOICE_PRESETS.narrative.speed).toBe(1.0);
    });
  });

  describe('interview preset', () => {
    it('uses onyx as host voice', () => {
      expect(VOICE_PRESETS.interview.host).toBe('onyx');
    });

    it('uses echo as default guest voice', () => {
      expect(VOICE_PRESETS.interview.guest).toBe('echo');
    });

    it('has host speed of 1.0', () => {
      expect(VOICE_PRESETS.interview.hostSpeed).toBe(1.0);
    });

    it('has guest speed of 0.95', () => {
      expect(VOICE_PRESETS.interview.guestSpeed).toBe(0.95);
    });
  });

  describe('debate preset', () => {
    it('uses alloy as moderator voice', () => {
      expect(VOICE_PRESETS.debate.moderator).toBe('alloy');
    });

    it('uses fable for position 1', () => {
      expect(VOICE_PRESETS.debate.position1).toBe('fable');
    });

    it('uses nova for position 2', () => {
      expect(VOICE_PRESETS.debate.position2).toBe('nova');
    });

    it('has moderator speed of 1.0', () => {
      expect(VOICE_PRESETS.debate.moderatorSpeed).toBe(1.0);
    });

    it('has debater speed of 0.98', () => {
      expect(VOICE_PRESETS.debate.debaterSpeed).toBe(0.98);
    });
  });

  describe('adventure preset', () => {
    it('uses shimmer as narrator voice', () => {
      expect(VOICE_PRESETS.adventure.narrator).toBe('shimmer');
    });

    it('has speed of 0.95', () => {
      expect(VOICE_PRESETS.adventure.speed).toBe(0.95);
    });
  });
});

describe('GUEST_VOICE_OVERRIDES', () => {
  it('has overrides for male historical figures', () => {
    const maleOverrides = [
      'Albert Einstein',
      'Leonardo da Vinci',
      'Benjamin Franklin',
      'Nikola Tesla',
      'Charles Darwin',
      'Isaac Newton',
      'Galileo Galilei',
      'Napoleon Bonaparte',
      'Abraham Lincoln',
      'Martin Luther King Jr.',
      'Winston Churchill',
      'Mahatma Gandhi',
    ];

    maleOverrides.forEach((name) => {
      expect(GUEST_VOICE_OVERRIDES[name]).toBeDefined();
    });
  });

  it('has overrides for female historical figures', () => {
    const femaleOverrides = [
      'Cleopatra VII',
      'Marie Curie',
      'Ada Lovelace',
      'Florence Nightingale',
      'Harriet Tubman',
      'Rosa Parks',
      'Eleanor Roosevelt',
      'Amelia Earhart',
      'Joan of Arc',
      'Queen Elizabeth I',
    ];

    femaleOverrides.forEach((name) => {
      expect(GUEST_VOICE_OVERRIDES[name]).toBeDefined();
    });
  });

  it('maps Einstein to fable', () => {
    expect(GUEST_VOICE_OVERRIDES['Albert Einstein']).toBe('fable');
  });

  it('maps Cleopatra to shimmer', () => {
    expect(GUEST_VOICE_OVERRIDES['Cleopatra VII']).toBe('shimmer');
  });

  it('maps Marie Curie to nova', () => {
    expect(GUEST_VOICE_OVERRIDES['Marie Curie']).toBe('nova');
  });

  it('maps Winston Churchill to fable', () => {
    expect(GUEST_VOICE_OVERRIDES['Winston Churchill']).toBe('fable');
  });
});

describe('getGuestVoice', () => {
  it('returns correct voice for known historical figures', () => {
    expect(getGuestVoice('Albert Einstein')).toBe('fable');
    expect(getGuestVoice('Cleopatra VII')).toBe('shimmer');
    expect(getGuestVoice('Marie Curie')).toBe('nova');
    expect(getGuestVoice('Leonardo da Vinci')).toBe('onyx');
    expect(getGuestVoice('Benjamin Franklin')).toBe('echo');
  });

  it('returns default guest voice for unknown figures', () => {
    expect(getGuestVoice('Unknown Person')).toBe(VOICE_PRESETS.interview.guest);
    expect(getGuestVoice('Random Name')).toBe('echo');
  });

  it('is case-sensitive', () => {
    expect(getGuestVoice('albert einstein')).toBe('echo'); // Falls back to default
    expect(getGuestVoice('ALBERT EINSTEIN')).toBe('echo'); // Falls back to default
    expect(getGuestVoice('Albert Einstein')).toBe('fable'); // Exact match
  });

  it('returns default for empty string', () => {
    expect(getGuestVoice('')).toBe('echo');
  });

  it('handles names with special characters', () => {
    expect(getGuestVoice("Joan of Arc")).toBe('shimmer');
    expect(getGuestVoice('Martin Luther King Jr.')).toBe('onyx');
  });

  it('returns default for names with typos', () => {
    expect(getGuestVoice('Albrt Einstein')).toBe('echo');
    expect(getGuestVoice('Cleopatra')).toBe('echo'); // Missing "VII"
  });
});

describe('isValidVoice', () => {
  it('returns true for all valid OpenAI voices', () => {
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    validVoices.forEach((voice) => {
      expect(isValidVoice(voice)).toBe(true);
    });
  });

  it('returns false for invalid voice strings', () => {
    const invalidVoices = ['invalid', 'test', 'voice', 'ALLOY', 'Echo', 'FABLE'];
    invalidVoices.forEach((voice) => {
      expect(isValidVoice(voice)).toBe(false);
    });
  });

  it('returns false for empty string', () => {
    expect(isValidVoice('')).toBe(false);
  });

  it('returns false for similar but incorrect strings', () => {
    expect(isValidVoice('Alloy')).toBe(false);
    expect(isValidVoice('ONYX')).toBe(false);
    expect(isValidVoice('shimer')).toBe(false); // Typo
  });

  it('provides type guard narrowing', () => {
    const voice = 'alloy';
    if (isValidVoice(voice)) {
      // TypeScript should recognize voice as OpenAIVoice here
      const typedVoice: OpenAIVoice = voice;
      expect(typedVoice).toBe('alloy');
    }
  });
});

describe('getVoiceOrDefault', () => {
  it('returns the voice if it is valid', () => {
    expect(getVoiceOrDefault('alloy', 'onyx')).toBe('alloy');
    expect(getVoiceOrDefault('echo', 'onyx')).toBe('echo');
    expect(getVoiceOrDefault('shimmer', 'onyx')).toBe('shimmer');
  });

  it('returns default for invalid voice', () => {
    expect(getVoiceOrDefault('invalid', 'onyx')).toBe('onyx');
    expect(getVoiceOrDefault('test', 'shimmer')).toBe('shimmer');
  });

  it('returns default for undefined', () => {
    expect(getVoiceOrDefault(undefined, 'onyx')).toBe('onyx');
    expect(getVoiceOrDefault(undefined, 'alloy')).toBe('alloy');
  });

  it('returns default for empty string', () => {
    expect(getVoiceOrDefault('', 'onyx')).toBe('onyx');
  });

  it('handles case sensitivity', () => {
    expect(getVoiceOrDefault('ALLOY', 'onyx')).toBe('onyx');
    expect(getVoiceOrDefault('Shimmer', 'onyx')).toBe('onyx');
  });

  it('allows any default voice', () => {
    const voices: OpenAIVoice[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    voices.forEach((defaultVoice) => {
      expect(getVoiceOrDefault('invalid', defaultVoice)).toBe(defaultVoice);
    });
  });
});
