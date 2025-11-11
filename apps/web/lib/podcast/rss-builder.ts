import { Episode, Show } from "@prisma/client";

export interface RSSFeedOptions {
  show: Show;
  episodes: Episode[];
  feedUrl: string;
  websiteUrl: string;
}

/**
 * Build an RSS 2.0 feed with iTunes and Podcasting 2.0 tags
 * Spec: https://podcasters.apple.com/support/823-podcast-requirements
 * Podcasting 2.0: https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/1.0.md
 */
export function buildRSSFeed(options: RSSFeedOptions): string {
  const { show, episodes, feedUrl, websiteUrl } = options;

  const rssItems = episodes.map((episode) => buildRSSItem(episode, websiteUrl));

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:podcast="https://podcastindex.org/namespace/1.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(show.title)}</title>
    <link>${escapeXml(websiteUrl)}</link>
    <language>${escapeXml(show.language)}</language>
    <copyright>${escapeXml(show.copyright || `© ${new Date().getFullYear()} ${show.title}`)}</copyright>
    <description>${escapeXml(show.description)}</description>

    <!-- Atom self-referencing link (recommended) -->
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>

    <!-- iTunes tags -->
    <itunes:author>${escapeXml(show.author || show.ownerName)}</itunes:author>
    <itunes:subtitle>${escapeXml(show.subtitle || show.description.substring(0, 255))}</itunes:subtitle>
    <itunes:summary>${escapeXml(show.description)}</itunes:summary>
    <itunes:owner>
      <itunes:name>${escapeXml(show.ownerName)}</itunes:name>
      <itunes:email>${escapeXml(show.ownerEmail)}</itunes:email>
    </itunes:owner>
    <itunes:explicit>${show.explicit ? "yes" : "no"}</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    <itunes:category text="${escapeXml(show.category)}">
      ${show.subCategory ? `<itunes:category text="${escapeXml(show.subCategory)}"/>` : ""}
    </itunes:category>
    ${show.imageUrl ? `<itunes:image href="${escapeXml(show.imageUrl)}"/>` : ""}
    ${show.imageUrl ? `<image>
      <url>${escapeXml(show.imageUrl)}</url>
      <title>${escapeXml(show.title)}</title>
      <link>${escapeXml(websiteUrl)}</link>
    </image>` : ""}

    <!-- Podcasting 2.0 tags -->
    <podcast:locked>no</podcast:locked>
    <podcast:guid>${show.id}</podcast:guid>

    ${rssItems.join("\n    ")}
  </channel>
</rss>`;
}

/**
 * Build a single RSS item for an episode
 */
function buildRSSItem(episode: Episode, websiteUrl: string): string {
  const episodeUrl = `${websiteUrl}/episodes/${episode.id}`;
  const transcriptUrl = `${episodeUrl}#transcript`;
  const pubDate = episode.publishedAt
    ? formatRFC822Date(episode.publishedAt)
    : formatRFC822Date(episode.createdAt);

  return `<item>
      <title>${escapeXml(episode.title)}</title>
      <link>${escapeXml(episodeUrl)}</link>
      <guid isPermaLink="true">${escapeXml(episodeUrl)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(episode.description || episode.title)}</description>

      ${episode.audioUrl ? `<enclosure
        url="${escapeXml(episode.audioUrl)}"
        length="${episode.audioBytes?.toString() || "0"}"
        type="audio/mpeg"/>` : ""}

      <!-- iTunes tags -->
      <itunes:title>${escapeXml(episode.title)}</itunes:title>
      ${episode.subtitle ? `<itunes:subtitle>${escapeXml(episode.subtitle)}</itunes:subtitle>` : ""}
      ${episode.duration ? `<itunes:duration>${episode.duration}</itunes:duration>` : ""}
      <itunes:explicit>${episode.explicit ? "yes" : "no"}</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>
      ${episode.season ? `<itunes:season>${episode.season}</itunes:season>` : ""}
      ${episode.episode ? `<itunes:episode>${episode.episode}</itunes:episode>` : ""}

      <!-- Podcasting 2.0 transcript tag -->
      ${episode.transcript ? `<podcast:transcript url="${escapeXml(transcriptUrl)}" type="text/html" language="en"/>` : ""}

      <!-- Keywords -->
      ${episode.keywords.length > 0 ? `<itunes:keywords>${escapeXml(episode.keywords.join(", "))}</itunes:keywords>` : ""}
    </item>`;
}

/**
 * Format a Date object as RFC 822 (required by RSS 2.0)
 * Example: "Mon, 02 Jan 2006 15:04:05 GMT"
 */
function formatRFC822Date(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayName = days[date.getUTCDay()];
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");

  return `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}:${seconds} GMT`;
}

/**
 * Escape special XML characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
