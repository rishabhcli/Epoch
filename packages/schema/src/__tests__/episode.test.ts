import {
  EpisodeStatusSchema,
  AudioMetadataSchema,
  EpisodeMetadataSchema,
  type EpisodeStatus,
  type AudioMetadata,
  type EpisodeMetadata,
} from '../episode';

describe('EpisodeStatusSchema', () => {
  it('validates all valid status values', () => {
    const validStatuses = [
      'draft',
      'generating_outline',
      'generating_script',
      'generating_audio',
      'processing',
      'ready',
      'published',
      'failed',
    ];

    validStatuses.forEach((status) => {
      const result = EpisodeStatusSchema.safeParse(status);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid status values', () => {
    const invalidStatuses = ['pending', 'completed', 'archived', 'DRAFT', 'Published'];

    invalidStatuses.forEach((status) => {
      const result = EpisodeStatusSchema.safeParse(status);
      expect(result.success).toBe(false);
    });
  });

  it('rejects non-string values', () => {
    const invalidValues = [1, true, null, undefined, {}, []];

    invalidValues.forEach((value) => {
      const result = EpisodeStatusSchema.safeParse(value);
      expect(result.success).toBe(false);
    });
  });
});

describe('AudioMetadataSchema', () => {
  const validAudioMetadata: AudioMetadata = {
    url: 'https://example.com/audio/episode-1.mp3',
    bytes: 5242880,
    mimeType: 'audio/mpeg',
    duration: 900,
    sampleRate: 44100,
    bitrate: 128,
  };

  it('validates complete audio metadata', () => {
    const result = AudioMetadataSchema.safeParse(validAudioMetadata);
    expect(result.success).toBe(true);
  });

  it('validates audio metadata with only required fields', () => {
    const minimalMetadata = {
      url: 'https://example.com/audio.mp3',
      bytes: 1024,
      duration: 60,
    };
    const result = AudioMetadataSchema.safeParse(minimalMetadata);
    expect(result.success).toBe(true);
  });

  it('applies default mimeType when not provided', () => {
    const metadataWithoutMimeType = {
      url: 'https://example.com/audio.mp3',
      bytes: 1024,
      duration: 60,
    };
    const result = AudioMetadataSchema.parse(metadataWithoutMimeType);
    expect(result.mimeType).toBe('audio/mpeg');
  });

  it('rejects invalid URL format', () => {
    const invalidMetadata = {
      ...validAudioMetadata,
      url: 'not-a-valid-url',
    };
    const result = AudioMetadataSchema.safeParse(invalidMetadata);
    expect(result.success).toBe(false);
  });

  it('rejects non-positive bytes', () => {
    const invalidMetadata = {
      ...validAudioMetadata,
      bytes: 0,
    };
    const result = AudioMetadataSchema.safeParse(invalidMetadata);
    expect(result.success).toBe(false);
  });

  it('rejects negative bytes', () => {
    const invalidMetadata = {
      ...validAudioMetadata,
      bytes: -1024,
    };
    const result = AudioMetadataSchema.safeParse(invalidMetadata);
    expect(result.success).toBe(false);
  });

  it('rejects non-integer bytes', () => {
    const invalidMetadata = {
      ...validAudioMetadata,
      bytes: 1024.5,
    };
    const result = AudioMetadataSchema.safeParse(invalidMetadata);
    expect(result.success).toBe(false);
  });

  it('rejects non-positive duration', () => {
    const invalidMetadata = {
      ...validAudioMetadata,
      duration: 0,
    };
    const result = AudioMetadataSchema.safeParse(invalidMetadata);
    expect(result.success).toBe(false);
  });

  it('rejects negative duration', () => {
    const invalidMetadata = {
      ...validAudioMetadata,
      duration: -60,
    };
    const result = AudioMetadataSchema.safeParse(invalidMetadata);
    expect(result.success).toBe(false);
  });

  it('accepts various valid URL formats', () => {
    const validUrls = [
      'https://example.com/audio.mp3',
      'https://cdn.example.com/podcasts/episode-1.mp3',
      'http://localhost:3000/audio.mp3',
      'https://storage.example.com/path/to/file.mp3?token=abc123',
    ];

    validUrls.forEach((url) => {
      const metadata = { ...validAudioMetadata, url };
      const result = AudioMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(true);
    });
  });
});

describe('EpisodeMetadataSchema', () => {
  const validEpisodeMetadata: EpisodeMetadata = {
    guid: 'episode-123-abc',
    pubDate: new Date('2024-01-15T10:00:00Z'),
    keywords: ['history', 'rome', 'ancient'],
    explicit: false,
    season: 1,
    episode: 5,
  };

  it('validates complete episode metadata', () => {
    const result = EpisodeMetadataSchema.safeParse(validEpisodeMetadata);
    expect(result.success).toBe(true);
  });

  it('validates episode metadata without optional fields', () => {
    const minimalMetadata = {
      guid: 'episode-123',
      pubDate: new Date(),
      keywords: ['history'],
    };
    const result = EpisodeMetadataSchema.safeParse(minimalMetadata);
    expect(result.success).toBe(true);
  });

  it('applies default explicit value (false)', () => {
    const metadataWithoutExplicit = {
      guid: 'episode-123',
      pubDate: new Date(),
      keywords: ['history'],
    };
    const result = EpisodeMetadataSchema.parse(metadataWithoutExplicit);
    expect(result.explicit).toBe(false);
  });

  it('accepts explicit: true', () => {
    const metadata = {
      ...validEpisodeMetadata,
      explicit: true,
    };
    const result = EpisodeMetadataSchema.safeParse(metadata);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.explicit).toBe(true);
    }
  });

  it('rejects missing guid', () => {
    const { guid, ...metadataWithoutGuid } = validEpisodeMetadata;
    const result = EpisodeMetadataSchema.safeParse(metadataWithoutGuid);
    expect(result.success).toBe(false);
  });

  it('rejects missing pubDate', () => {
    const { pubDate, ...metadataWithoutPubDate } = validEpisodeMetadata;
    const result = EpisodeMetadataSchema.safeParse(metadataWithoutPubDate);
    expect(result.success).toBe(false);
  });

  it('rejects missing keywords', () => {
    const { keywords, ...metadataWithoutKeywords } = validEpisodeMetadata;
    const result = EpisodeMetadataSchema.safeParse(metadataWithoutKeywords);
    expect(result.success).toBe(false);
  });

  it('accepts empty keywords array', () => {
    const metadata = {
      ...validEpisodeMetadata,
      keywords: [],
    };
    const result = EpisodeMetadataSchema.safeParse(metadata);
    expect(result.success).toBe(true);
  });

  it('accepts multiple keywords', () => {
    const metadata = {
      ...validEpisodeMetadata,
      keywords: ['history', 'ancient', 'rome', 'empire', 'fall'],
    };
    const result = EpisodeMetadataSchema.safeParse(metadata);
    expect(result.success).toBe(true);
  });

  it('rejects non-integer season number', () => {
    const metadata = {
      ...validEpisodeMetadata,
      season: 1.5,
    };
    const result = EpisodeMetadataSchema.safeParse(metadata);
    expect(result.success).toBe(false);
  });

  it('rejects non-integer episode number', () => {
    const metadata = {
      ...validEpisodeMetadata,
      episode: 5.5,
    };
    const result = EpisodeMetadataSchema.safeParse(metadata);
    expect(result.success).toBe(false);
  });

  it('validates without season', () => {
    const { season, ...metadataWithoutSeason } = validEpisodeMetadata;
    const result = EpisodeMetadataSchema.safeParse(metadataWithoutSeason);
    expect(result.success).toBe(true);
  });

  it('validates without episode number', () => {
    const { episode, ...metadataWithoutEpisode } = validEpisodeMetadata;
    const result = EpisodeMetadataSchema.safeParse(metadataWithoutEpisode);
    expect(result.success).toBe(true);
  });

  it('accepts Date object for pubDate', () => {
    const metadata = {
      ...validEpisodeMetadata,
      pubDate: new Date(),
    };
    const result = EpisodeMetadataSchema.safeParse(metadata);
    expect(result.success).toBe(true);
  });
});
