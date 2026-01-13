import {
  generatePodcastSeriesJsonLd,
  generatePodcastEpisodeJsonLd,
  generateOrganizationJsonLd,
  generateWebsiteJsonLd,
  generateBreadcrumbJsonLd,
} from '@/lib/utils/json-ld';
import { Show, Episode } from '@prisma/client';

// Note: NEXT_PUBLIC_APP_URL is set to 'http://localhost:3000' in jest.setup.js
// The json-ld module reads this at module load time, so we test with that URL
const BASE_URL = 'http://localhost:3000';

const mockShow: Show = {
  id: 'show-123',
  title: 'Epoch Pod',
  description: 'AI-powered historical storytelling',
  subtitle: 'Journey through history',
  author: 'Epoch Team',
  ownerName: 'Epoch Media',
  ownerEmail: 'contact@epochpod.com',
  language: 'en-US',
  category: 'History',
  subCategory: 'Ancient',
  imageUrl: 'https://epochpod.com/artwork.jpg',
  explicit: false,
  copyright: '© 2024 Epoch Media',
  websiteUrl: 'https://epochpod.com',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
};

const mockEpisode: Episode = {
  id: 'episode-456',
  title: 'The Fall of Rome',
  subtitle: 'An Empire Crumbles',
  description: 'Exploring the decline of the Western Roman Empire',
  type: 'NARRATIVE',
  status: 'PUBLISHED',
  audioUrl: 'https://cdn.epochpod.com/episodes/fall-of-rome.mp3',
  audioBytes: BigInt(15728640), // 15MB
  mimeType: 'audio/mpeg',
  duration: 1200,
  transcript: 'Full transcript of the episode...',
  outline: null,
  script: null,
  sources: [],
  keywords: ['rome', 'history', 'ancient'],
  explicit: false,
  season: 1,
  episode: 5,
  showId: 'show-123',
  userId: 'user-789',
  publishedAt: new Date('2024-01-15T10:00:00Z'),
  createdAt: new Date('2024-01-14'),
  updatedAt: new Date('2024-01-15'),
};

describe('generatePodcastSeriesJsonLd', () => {
  it('generates valid PodcastSeries schema', () => {
    const result = generatePodcastSeriesJsonLd(mockShow);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('PodcastSeries');
    expect(result.name).toBe('Epoch Pod');
  });

  it('includes correct @id', () => {
    const result = generatePodcastSeriesJsonLd(mockShow);
    expect(result['@id']).toBe(`${BASE_URL}/#podcast`);
  });

  it('includes author information', () => {
    const result = generatePodcastSeriesJsonLd(mockShow);

    expect(result.author).toEqual({
      '@type': 'Organization',
      name: 'Epoch Team',
      url: BASE_URL,
    });
  });

  it('includes publisher information', () => {
    const result = generatePodcastSeriesJsonLd(mockShow);

    expect(result.publisher).toEqual({
      '@type': 'Organization',
      name: 'Epoch Media',
      email: 'contact@epochpod.com',
      url: BASE_URL,
    });
  });

  it('includes image when available', () => {
    const result = generatePodcastSeriesJsonLd(mockShow);

    expect(result.image).toEqual({
      '@type': 'ImageObject',
      url: 'https://epochpod.com/artwork.jpg',
      width: 1400,
      height: 1400,
    });
  });

  it('excludes image when not available', () => {
    const showWithoutImage = { ...mockShow, imageUrl: null };
    const result = generatePodcastSeriesJsonLd(showWithoutImage);

    expect(result.image).toBeUndefined();
  });

  it('includes webFeed URL', () => {
    const result = generatePodcastSeriesJsonLd(mockShow);
    expect(result.webFeed).toBe(`${BASE_URL}/api/rss`);
  });

  it('includes language', () => {
    const result = generatePodcastSeriesJsonLd(mockShow);
    expect(result.inLanguage).toBe('en-US');
  });
});

describe('generatePodcastEpisodeJsonLd', () => {
  it('generates valid PodcastEpisode schema', () => {
    const result = generatePodcastEpisodeJsonLd(mockEpisode, mockShow);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('PodcastEpisode');
    expect(result.name).toBe('The Fall of Rome');
  });

  it('includes correct episode URL', () => {
    const result = generatePodcastEpisodeJsonLd(mockEpisode, mockShow);
    expect(result.url).toBe(`${BASE_URL}/episodes/episode-456`);
    expect(result['@id']).toBe(`${BASE_URL}/episodes/episode-456`);
  });

  it('includes description', () => {
    const result = generatePodcastEpisodeJsonLd(mockEpisode, mockShow);
    expect(result.description).toBe('An Empire Crumbles');
  });

  it('uses subtitle as description, falling back to description', () => {
    const episodeWithoutSubtitle = { ...mockEpisode, subtitle: null };
    const result = generatePodcastEpisodeJsonLd(episodeWithoutSubtitle, mockShow);
    expect(result.description).toBe('Exploring the decline of the Western Roman Empire');
  });

  it('uses title as final fallback for description', () => {
    const episodeMinimal = { ...mockEpisode, subtitle: null, description: null };
    const result = generatePodcastEpisodeJsonLd(episodeMinimal, mockShow);
    expect(result.description).toBe('The Fall of Rome');
  });

  it('includes datePublished when available', () => {
    const result = generatePodcastEpisodeJsonLd(mockEpisode, mockShow);
    expect(result.datePublished).toBe('2024-01-15T10:00:00.000Z');
  });

  it('excludes datePublished when not available', () => {
    const episodeUnpublished = { ...mockEpisode, publishedAt: null };
    const result = generatePodcastEpisodeJsonLd(episodeUnpublished, mockShow);
    expect(result.datePublished).toBeUndefined();
  });

  it('includes duration in ISO 8601 format', () => {
    const result = generatePodcastEpisodeJsonLd(mockEpisode, mockShow);
    expect(result.duration).toBe('PT1200S');
  });

  it('excludes duration when not available', () => {
    const episodeNoDuration = { ...mockEpisode, duration: null };
    const result = generatePodcastEpisodeJsonLd(episodeNoDuration, mockShow);
    expect(result.duration).toBeUndefined();
  });

  it('includes associatedMedia when audioUrl available', () => {
    const result = generatePodcastEpisodeJsonLd(mockEpisode, mockShow);

    expect(result.associatedMedia).toEqual({
      '@type': 'MediaObject',
      contentUrl: 'https://cdn.epochpod.com/episodes/fall-of-rome.mp3',
      encodingFormat: 'audio/mpeg',
      contentSize: '15728640',
      duration: 'PT1200S',
    });
  });

  it('excludes associatedMedia when audioUrl not available', () => {
    const episodeNoAudio = { ...mockEpisode, audioUrl: null };
    const result = generatePodcastEpisodeJsonLd(episodeNoAudio, mockShow);
    expect(result.associatedMedia).toBeUndefined();
  });

  it('includes transcript when available', () => {
    const result = generatePodcastEpisodeJsonLd(mockEpisode, mockShow);

    expect(result.transcript).toEqual({
      '@type': 'WebPageElement',
      text: 'Full transcript of the episode...',
    });
  });

  it('excludes transcript when not available', () => {
    const episodeNoTranscript = { ...mockEpisode, transcript: null };
    const result = generatePodcastEpisodeJsonLd(episodeNoTranscript, mockShow);
    expect(result.transcript).toBeUndefined();
  });

  it('includes partOfSeries reference', () => {
    const result = generatePodcastEpisodeJsonLd(mockEpisode, mockShow);

    expect(result.partOfSeries).toEqual({
      '@type': 'PodcastSeries',
      '@id': `${BASE_URL}/#podcast`,
      name: 'Epoch Pod',
      url: BASE_URL,
    });
  });

  it('includes season number when available', () => {
    const result = generatePodcastEpisodeJsonLd(mockEpisode, mockShow);
    expect(result.partOfSeason).toBe(1);
  });

  it('excludes season when not available', () => {
    const episodeNoSeason = { ...mockEpisode, season: null };
    const result = generatePodcastEpisodeJsonLd(episodeNoSeason, mockShow);
    expect(result.partOfSeason).toBeUndefined();
  });

  it('includes episode number when available', () => {
    const result = generatePodcastEpisodeJsonLd(mockEpisode, mockShow);
    expect(result.episodeNumber).toBe(5);
  });

  it('excludes episode number when not available', () => {
    const episodeNoNumber = { ...mockEpisode, episode: null };
    const result = generatePodcastEpisodeJsonLd(episodeNoNumber, mockShow);
    expect(result.episodeNumber).toBeUndefined();
  });

  it('includes date timestamps', () => {
    const result = generatePodcastEpisodeJsonLd(mockEpisode, mockShow);
    expect(result.dateCreated).toBeDefined();
    expect(result.dateModified).toBeDefined();
  });
});

describe('generateOrganizationJsonLd', () => {
  it('generates valid Organization schema', () => {
    const result = generateOrganizationJsonLd(mockShow);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('Organization');
    expect(result.name).toBe('Epoch Media');
  });

  it('includes correct @id', () => {
    const result = generateOrganizationJsonLd(mockShow);
    expect(result['@id']).toBe(`${BASE_URL}/#organization`);
  });

  it('includes email', () => {
    const result = generateOrganizationJsonLd(mockShow);
    expect(result.email).toBe('contact@epochpod.com');
  });

  it('includes logo when imageUrl available', () => {
    const result = generateOrganizationJsonLd(mockShow);

    expect(result.logo).toEqual({
      '@type': 'ImageObject',
      url: 'https://epochpod.com/artwork.jpg',
    });
  });

  it('excludes logo when imageUrl not available', () => {
    const showWithoutImage = { ...mockShow, imageUrl: null };
    const result = generateOrganizationJsonLd(showWithoutImage);
    expect(result.logo).toBeUndefined();
  });

  it('includes empty sameAs array', () => {
    const result = generateOrganizationJsonLd(mockShow);
    expect(result.sameAs).toEqual([]);
  });
});

describe('generateWebsiteJsonLd', () => {
  it('generates valid WebSite schema', () => {
    const result = generateWebsiteJsonLd(mockShow);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('WebSite');
    expect(result.name).toBe('Epoch Pod');
  });

  it('includes correct @id', () => {
    const result = generateWebsiteJsonLd(mockShow);
    expect(result['@id']).toBe(`${BASE_URL}/#website`);
  });

  it('includes publisher reference', () => {
    const result = generateWebsiteJsonLd(mockShow);

    expect(result.publisher).toEqual({
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Epoch Media',
    });
  });

  it('includes search action', () => {
    const result = generateWebsiteJsonLd(mockShow);

    expect(result.potentialAction).toEqual({
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/episodes?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    });
  });

  it('includes language', () => {
    const result = generateWebsiteJsonLd(mockShow);
    expect(result.inLanguage).toBe('en-US');
  });
});

describe('generateBreadcrumbJsonLd', () => {
  it('generates valid BreadcrumbList schema', () => {
    const items = [
      { name: 'Home', url: 'https://epochpod.com' },
      { name: 'Episodes', url: 'https://epochpod.com/episodes' },
    ];

    const result = generateBreadcrumbJsonLd(items);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('BreadcrumbList');
  });

  it('creates list items with correct positions', () => {
    const items = [
      { name: 'Home', url: 'https://epochpod.com' },
      { name: 'Episodes', url: 'https://epochpod.com/episodes' },
      { name: 'The Fall of Rome', url: 'https://epochpod.com/episodes/123' },
    ];

    const result = generateBreadcrumbJsonLd(items);

    expect(result.itemListElement).toHaveLength(3);
    expect(result.itemListElement[0].position).toBe(1);
    expect(result.itemListElement[1].position).toBe(2);
    expect(result.itemListElement[2].position).toBe(3);
  });

  it('includes correct ListItem properties', () => {
    const items = [
      { name: 'Home', url: 'https://epochpod.com' },
    ];

    const result = generateBreadcrumbJsonLd(items);

    expect(result.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://epochpod.com',
    });
  });

  it('handles empty items array', () => {
    const result = generateBreadcrumbJsonLd([]);

    expect(result['@type']).toBe('BreadcrumbList');
    expect(result.itemListElement).toHaveLength(0);
  });

  it('handles single item', () => {
    const items = [
      { name: 'Home', url: 'https://epochpod.com' },
    ];

    const result = generateBreadcrumbJsonLd(items);

    expect(result.itemListElement).toHaveLength(1);
  });

  it('preserves item order', () => {
    const items = [
      { name: 'First', url: 'https://example.com/1' },
      { name: 'Second', url: 'https://example.com/2' },
      { name: 'Third', url: 'https://example.com/3' },
    ];

    const result = generateBreadcrumbJsonLd(items);

    expect(result.itemListElement[0].name).toBe('First');
    expect(result.itemListElement[1].name).toBe('Second');
    expect(result.itemListElement[2].name).toBe('Third');
  });
});
