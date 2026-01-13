import {
  VoiceProviderSchema,
  VoiceConfigSchema,
  EmailCadenceSchema,
  UserPreferencesSchema,
  UserRoleSchema,
  type VoiceProvider,
  type VoiceConfig,
  type EmailCadence,
  type UserPreferences,
  type UserRole,
} from '../user';

describe('VoiceProviderSchema', () => {
  it('validates valid voice providers', () => {
    const validProviders = ['openai', 'elevenlabs'];

    validProviders.forEach((provider) => {
      const result = VoiceProviderSchema.safeParse(provider);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid voice providers', () => {
    const invalidProviders = ['google', 'amazon', 'azure', 'OPENAI'];

    invalidProviders.forEach((provider) => {
      const result = VoiceProviderSchema.safeParse(provider);
      expect(result.success).toBe(false);
    });
  });
});

describe('VoiceConfigSchema', () => {
  const validConfig: VoiceConfig = {
    provider: 'openai',
    voiceId: 'alloy',
    model: 'tts-1-hd',
    speed: 1.0,
  };

  it('validates a complete voice config', () => {
    const result = VoiceConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('validates config with only required fields', () => {
    const minimalConfig = {
      voiceId: 'alloy',
    };
    const result = VoiceConfigSchema.safeParse(minimalConfig);
    expect(result.success).toBe(true);
  });

  it('applies default provider (openai)', () => {
    const configWithoutProvider = {
      voiceId: 'alloy',
    };
    const result = VoiceConfigSchema.parse(configWithoutProvider);
    expect(result.provider).toBe('openai');
  });

  it('applies default speed (1.0)', () => {
    const configWithoutSpeed = {
      voiceId: 'alloy',
    };
    const result = VoiceConfigSchema.parse(configWithoutSpeed);
    expect(result.speed).toBe(1.0);
  });

  it('rejects speed below 0.25', () => {
    const invalidConfig = {
      ...validConfig,
      speed: 0.24,
    };
    const result = VoiceConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('rejects speed above 4.0', () => {
    const invalidConfig = {
      ...validConfig,
      speed: 4.1,
    };
    const result = VoiceConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('accepts minimum speed (0.25)', () => {
    const config = {
      ...validConfig,
      speed: 0.25,
    };
    const result = VoiceConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('accepts maximum speed (4.0)', () => {
    const config = {
      ...validConfig,
      speed: 4.0,
    };
    const result = VoiceConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('accepts elevenlabs provider', () => {
    const config = {
      ...validConfig,
      provider: 'elevenlabs' as const,
    };
    const result = VoiceConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('validates without model', () => {
    const { model, ...configWithoutModel } = validConfig;
    const result = VoiceConfigSchema.safeParse(configWithoutModel);
    expect(result.success).toBe(true);
  });
});

describe('EmailCadenceSchema', () => {
  it('validates all valid cadence values', () => {
    const validCadences = [
      'immediate',
      'daily',
      'weekly',
      'biweekly',
      'monthly',
      'never',
    ];

    validCadences.forEach((cadence) => {
      const result = EmailCadenceSchema.safeParse(cadence);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid cadence values', () => {
    const invalidCadences = ['hourly', 'yearly', 'WEEKLY', 'Daily', 'once'];

    invalidCadences.forEach((cadence) => {
      const result = EmailCadenceSchema.safeParse(cadence);
      expect(result.success).toBe(false);
    });
  });
});

describe('UserPreferencesSchema', () => {
  const validPreferences: UserPreferences = {
    topics: ['Ancient Rome', 'World War II', 'Renaissance'],
    eras: ['Ancient', 'Medieval', 'Modern'],
    emailCadence: 'weekly',
    voiceConfig: {
      provider: 'openai',
      voiceId: 'alloy',
      model: 'tts-1-hd',
      speed: 1.0,
    },
    episodeDuration: 1200,
    includeTranscripts: true,
    privateFeedEnabled: false,
  };

  it('validates complete preferences', () => {
    const result = UserPreferencesSchema.safeParse(validPreferences);
    expect(result.success).toBe(true);
  });

  it('validates preferences with only required fields', () => {
    const minimalPreferences = {
      topics: ['History'],
    };
    const result = UserPreferencesSchema.safeParse(minimalPreferences);
    expect(result.success).toBe(true);
  });

  it('applies default email cadence (weekly)', () => {
    const preferencesWithoutCadence = {
      topics: ['History'],
    };
    const result = UserPreferencesSchema.parse(preferencesWithoutCadence);
    expect(result.emailCadence).toBe('weekly');
  });

  it('applies default episode duration (1200)', () => {
    const preferencesWithoutDuration = {
      topics: ['History'],
    };
    const result = UserPreferencesSchema.parse(preferencesWithoutDuration);
    expect(result.episodeDuration).toBe(1200);
  });

  it('applies default includeTranscripts (true)', () => {
    const preferencesWithoutTranscripts = {
      topics: ['History'],
    };
    const result = UserPreferencesSchema.parse(preferencesWithoutTranscripts);
    expect(result.includeTranscripts).toBe(true);
  });

  it('applies default privateFeedEnabled (false)', () => {
    const preferencesWithoutPrivateFeed = {
      topics: ['History'],
    };
    const result = UserPreferencesSchema.parse(preferencesWithoutPrivateFeed);
    expect(result.privateFeedEnabled).toBe(false);
  });

  it('rejects fewer than 1 topic', () => {
    const invalidPreferences = {
      ...validPreferences,
      topics: [],
    };
    const result = UserPreferencesSchema.safeParse(invalidPreferences);
    expect(result.success).toBe(false);
  });

  it('rejects more than 10 topics', () => {
    const invalidPreferences = {
      ...validPreferences,
      topics: Array(11).fill('Topic'),
    };
    const result = UserPreferencesSchema.safeParse(invalidPreferences);
    expect(result.success).toBe(false);
  });

  it('accepts exactly 1 topic (minimum)', () => {
    const preferences = {
      ...validPreferences,
      topics: ['Single Topic'],
    };
    const result = UserPreferencesSchema.safeParse(preferences);
    expect(result.success).toBe(true);
  });

  it('accepts exactly 10 topics (maximum)', () => {
    const preferences = {
      ...validPreferences,
      topics: Array(10).fill('Topic'),
    };
    const result = UserPreferencesSchema.safeParse(preferences);
    expect(result.success).toBe(true);
  });

  it('rejects episode duration below 600 seconds', () => {
    const invalidPreferences = {
      ...validPreferences,
      episodeDuration: 599,
    };
    const result = UserPreferencesSchema.safeParse(invalidPreferences);
    expect(result.success).toBe(false);
  });

  it('rejects episode duration above 1800 seconds', () => {
    const invalidPreferences = {
      ...validPreferences,
      episodeDuration: 1801,
    };
    const result = UserPreferencesSchema.safeParse(invalidPreferences);
    expect(result.success).toBe(false);
  });

  it('accepts minimum episode duration (600 seconds)', () => {
    const preferences = {
      ...validPreferences,
      episodeDuration: 600,
    };
    const result = UserPreferencesSchema.safeParse(preferences);
    expect(result.success).toBe(true);
  });

  it('accepts maximum episode duration (1800 seconds)', () => {
    const preferences = {
      ...validPreferences,
      episodeDuration: 1800,
    };
    const result = UserPreferencesSchema.safeParse(preferences);
    expect(result.success).toBe(true);
  });

  it('validates without eras', () => {
    const { eras, ...preferencesWithoutEras } = validPreferences;
    const result = UserPreferencesSchema.safeParse(preferencesWithoutEras);
    expect(result.success).toBe(true);
  });

  it('accepts empty eras array', () => {
    const preferences = {
      ...validPreferences,
      eras: [],
    };
    const result = UserPreferencesSchema.safeParse(preferences);
    expect(result.success).toBe(true);
  });

  it('validates voice config within preferences', () => {
    const preferences = {
      ...validPreferences,
      voiceConfig: {
        provider: 'elevenlabs' as const,
        voiceId: 'custom-voice-id',
        speed: 0.9,
      },
    };
    const result = UserPreferencesSchema.safeParse(preferences);
    expect(result.success).toBe(true);
  });

  it('rejects invalid voice config', () => {
    const invalidPreferences = {
      ...validPreferences,
      voiceConfig: {
        provider: 'invalid-provider',
        voiceId: 'alloy',
      },
    };
    const result = UserPreferencesSchema.safeParse(invalidPreferences);
    expect(result.success).toBe(false);
  });
});

describe('UserRoleSchema', () => {
  it('validates valid user roles', () => {
    const validRoles = ['user', 'admin'];

    validRoles.forEach((role) => {
      const result = UserRoleSchema.safeParse(role);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid user roles', () => {
    const invalidRoles = ['moderator', 'superuser', 'USER', 'Admin', 'guest'];

    invalidRoles.forEach((role) => {
      const result = UserRoleSchema.safeParse(role);
      expect(result.success).toBe(false);
    });
  });
});
