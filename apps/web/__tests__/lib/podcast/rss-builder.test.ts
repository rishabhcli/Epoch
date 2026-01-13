import { buildRSSFeed, type RSSFeedOptions } from '@/lib/podcast/rss-builder';
import { Show, Episode } from '@prisma/client';

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
  audioBytes: BigInt(15728640),
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

describe('buildRSSFeed', () => {
  const defaultOptions: RSSFeedOptions = {
    show: mockShow,
    episodes: [mockEpisode],
    feedUrl: 'https://epochpod.com/api/rss',
    websiteUrl: 'https://epochpod.com',
  };

  it('generates valid XML structure', () => {
    const rss = buildRSSFeed(defaultOptions);

    expect(rss).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(rss).toContain('<rss version="2.0"');
    expect(rss).toContain('</rss>');
  });

  it('includes required RSS namespaces', () => {
    const rss = buildRSSFeed(defaultOptions);

    expect(rss).toContain('xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"');
    expect(rss).toContain('xmlns:podcast="https://podcastindex.org/namespace/1.0"');
    expect(rss).toContain('xmlns:content="http://purl.org/rss/1.0/modules/content/"');
    expect(rss).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
  });

  it('includes channel information', () => {
    const rss = buildRSSFeed(defaultOptions);

    expect(rss).toContain('<title>Epoch Pod</title>');
    expect(rss).toContain('<link>https://epochpod.com</link>');
    expect(rss).toContain('<language>en-US</language>');
    expect(rss).toContain('<description>AI-powered historical storytelling</description>');
  });

  it('includes Atom self-link', () => {
    const rss = buildRSSFeed(defaultOptions);

    expect(rss).toContain('atom:link href="https://epochpod.com/api/rss" rel="self" type="application/rss+xml"');
  });

  it('includes iTunes tags', () => {
    const rss = buildRSSFeed(defaultOptions);

    expect(rss).toContain('<itunes:author>Epoch Team</itunes:author>');
    expect(rss).toContain('<itunes:explicit>no</itunes:explicit>');
    expect(rss).toContain('<itunes:type>episodic</itunes:type>');
    expect(rss).toContain('<itunes:owner>');
    expect(rss).toContain('<itunes:name>Epoch Media</itunes:name>');
    expect(rss).toContain('<itunes:email>contact@epochpod.com</itunes:email>');
  });

  it('includes iTunes category with subcategory', () => {
    const rss = buildRSSFeed(defaultOptions);

    expect(rss).toContain('<itunes:category text="History">');
    expect(rss).toContain('<itunes:category text="Ancient"/>');
  });

  it('handles show without subcategory', () => {
    const showWithoutSubcat = { ...mockShow, subCategory: null };
    const options = { ...defaultOptions, show: showWithoutSubcat };

    const rss = buildRSSFeed(options);

    expect(rss).toContain('<itunes:category text="History">');
    expect(rss).not.toContain('text="Ancient"');
  });

  it('includes image when available', () => {
    const rss = buildRSSFeed(defaultOptions);

    expect(rss).toContain('<itunes:image href="https://epochpod.com/artwork.jpg"/>');
    expect(rss).toContain('<image>');
    expect(rss).toContain('<url>https://epochpod.com/artwork.jpg</url>');
  });

  it('excludes image when not available', () => {
    const showWithoutImage = { ...mockShow, imageUrl: null };
    const options = { ...defaultOptions, show: showWithoutImage };

    const rss = buildRSSFeed(options);

    expect(rss).not.toContain('<itunes:image');
    expect(rss).not.toContain('<image>');
  });

  it('includes Podcasting 2.0 tags', () => {
    const rss = buildRSSFeed(defaultOptions);

    expect(rss).toContain('<podcast:locked>no</podcast:locked>');
    expect(rss).toContain('<podcast:guid>show-123</podcast:guid>');
  });

  it('includes episode item', () => {
    const rss = buildRSSFeed(defaultOptions);

    expect(rss).toContain('<item>');
    expect(rss).toContain('<title>The Fall of Rome</title>');
    expect(rss).toContain('</item>');
  });

  it('includes episode enclosure', () => {
    const rss = buildRSSFeed(defaultOptions);

    expect(rss).toContain('<enclosure');
    expect(rss).toContain('url="https://cdn.epochpod.com/episodes/fall-of-rome.mp3"');
    expect(rss).toContain('length="15728640"');
    expect(rss).toContain('type="audio/mpeg"');
  });

  it('includes episode iTunes tags', () => {
    const rss = buildRSSFeed(defaultOptions);

    expect(rss).toContain('<itunes:title>The Fall of Rome</itunes:title>');
    expect(rss).toContain('<itunes:subtitle>An Empire Crumbles</itunes:subtitle>');
    expect(rss).toContain('<itunes:duration>1200</itunes:duration>');
    expect(rss).toContain('<itunes:explicit>no</itunes:explicit>');
    expect(rss).toContain('<itunes:episodeType>full</itunes:episodeType>');
    expect(rss).toContain('<itunes:season>1</itunes:season>');
    expect(rss).toContain('<itunes:episode>5</itunes:episode>');
  });

  it('includes transcript tag for Podcasting 2.0', () => {
    const rss = buildRSSFeed(defaultOptions);

    expect(rss).toContain('<podcast:transcript');
    expect(rss).toContain('type="text/html"');
    expect(rss).toContain('language="en"');
  });

  it('excludes transcript tag when not available', () => {
    const episodeNoTranscript = { ...mockEpisode, transcript: null };
    const options = { ...defaultOptions, episodes: [episodeNoTranscript] };

    const rss = buildRSSFeed(options);

    expect(rss).not.toContain('<podcast:transcript');
  });

  it('includes keywords', () => {
    const rss = buildRSSFeed(defaultOptions);

    expect(rss).toContain('<itunes:keywords>rome, history, ancient</itunes:keywords>');
  });

  it('excludes keywords when empty', () => {
    const episodeNoKeywords = { ...mockEpisode, keywords: [] };
    const options = { ...defaultOptions, episodes: [episodeNoKeywords] };

    const rss = buildRSSFeed(options);

    expect(rss).not.toContain('<itunes:keywords>');
  });

  it('uses publishedAt for pubDate', () => {
    const rss = buildRSSFeed(defaultOptions);

    // RFC 822 format
    expect(rss).toContain('Mon, 15 Jan 2024');
  });

  it('uses createdAt when publishedAt not available', () => {
    const episodeUnpublished = { ...mockEpisode, publishedAt: null };
    const options = { ...defaultOptions, episodes: [episodeUnpublished] };

    const rss = buildRSSFeed(options);

    expect(rss).toContain('Sun, 14 Jan 2024');
  });

  it('generates valid GUID', () => {
    const rss = buildRSSFeed(defaultOptions);

    expect(rss).toContain('<guid isPermaLink="true">https://epochpod.com/episodes/episode-456</guid>');
  });

  it('handles multiple episodes', () => {
    const episode2: Episode = {
      ...mockEpisode,
      id: 'episode-789',
      title: 'The Rise of Empires',
    };
    const options = { ...defaultOptions, episodes: [mockEpisode, episode2] };

    const rss = buildRSSFeed(options);

    expect(rss).toContain('<title>The Fall of Rome</title>');
    expect(rss).toContain('<title>The Rise of Empires</title>');
    expect((rss.match(/<item>/g) || []).length).toBe(2);
  });

  it('handles empty episodes array', () => {
    const options = { ...defaultOptions, episodes: [] };

    const rss = buildRSSFeed(options);

    expect(rss).toContain('<channel>');
    expect(rss).toContain('</channel>');
    expect(rss).not.toContain('<item>');
  });

  it('escapes special XML characters in content', () => {
    const showWithSpecialChars = {
      ...mockShow,
      title: 'History & Stories <Epoch>',
      description: 'Stories about "ancient" times',
    };
    const options = { ...defaultOptions, show: showWithSpecialChars };

    const rss = buildRSSFeed(options);

    expect(rss).toContain('History &amp; Stories &lt;Epoch&gt;');
    expect(rss).toContain('Stories about &quot;ancient&quot; times');
  });

  it('escapes apostrophes', () => {
    const showWithApostrophe = {
      ...mockShow,
      title: "History's Greatest",
    };
    const options = { ...defaultOptions, show: showWithApostrophe };

    const rss = buildRSSFeed(options);

    expect(rss).toContain('History&apos;s Greatest');
  });

  it('includes copyright', () => {
    const rss = buildRSSFeed(defaultOptions);

    expect(rss).toContain('<copyright>© 2024 Epoch Media</copyright>');
  });

  it('generates copyright when not provided', () => {
    const showNoCopyright = { ...mockShow, copyright: null };
    const options = { ...defaultOptions, show: showNoCopyright };

    const rss = buildRSSFeed(options);

    // Should contain auto-generated copyright
    expect(rss).toContain('<copyright>');
    expect(rss).toContain('Epoch Pod');
  });

  it('handles explicit show', () => {
    const explicitShow = { ...mockShow, explicit: true };
    const options = { ...defaultOptions, show: explicitShow };

    const rss = buildRSSFeed(options);

    expect(rss).toContain('<itunes:explicit>yes</itunes:explicit>');
  });

  it('handles explicit episode', () => {
    const explicitEpisode = { ...mockEpisode, explicit: true };
    const options = { ...defaultOptions, episodes: [explicitEpisode] };

    const rss = buildRSSFeed(options);

    // The episode should have explicit: yes
    const episodeSection = rss.split('<item>')[1];
    expect(episodeSection).toContain('<itunes:explicit>yes</itunes:explicit>');
  });
});

describe('RFC 822 date formatting', () => {
  it('formats dates correctly', () => {
    const episode = {
      ...mockEpisode,
      publishedAt: new Date('2024-06-15T14:30:00Z'),
    };
    const options: RSSFeedOptions = {
      show: mockShow,
      episodes: [episode],
      feedUrl: 'https://epochpod.com/api/rss',
      websiteUrl: 'https://epochpod.com',
    };

    const rss = buildRSSFeed(options);

    // Should be: Sat, 15 Jun 2024 14:30:00 GMT
    expect(rss).toContain('Sat, 15 Jun 2024 14:30:00 GMT');
  });

  it('pads single-digit days correctly', () => {
    const episode = {
      ...mockEpisode,
      publishedAt: new Date('2024-01-05T08:00:00Z'),
    };
    const options: RSSFeedOptions = {
      show: mockShow,
      episodes: [episode],
      feedUrl: 'https://epochpod.com/api/rss',
      websiteUrl: 'https://epochpod.com',
    };

    const rss = buildRSSFeed(options);

    expect(rss).toContain('05 Jan 2024');
  });
});
