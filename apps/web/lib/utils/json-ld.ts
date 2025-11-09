import { Episode, Show } from "@prisma/client";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Generate JSON-LD structured data for PodcastSeries
 * Schema.org spec: https://schema.org/PodcastSeries
 */
export function generatePodcastSeriesJsonLd(show: Show) {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    "@id": `${BASE_URL}/#podcast`,
    name: show.title,
    description: show.description,
    url: BASE_URL,
    author: {
      "@type": "Organization",
      name: show.author,
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: show.ownerName,
      email: show.ownerEmail,
      url: BASE_URL,
    },
    inLanguage: show.language,
    ...(show.imageUrl && {
      image: {
        "@type": "ImageObject",
        url: show.imageUrl,
        width: 1400,
        height: 1400,
      },
    }),
    webFeed: `${BASE_URL}/api/rss`,
  };
}

/**
 * Generate JSON-LD structured data for PodcastEpisode
 * Schema.org spec: https://schema.org/PodcastEpisode
 */
export function generatePodcastEpisodeJsonLd(
  episode: Episode,
  show: Show
) {
  const episodeUrl = `${BASE_URL}/episodes/${episode.id}`;

  return {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    "@id": episodeUrl,
    url: episodeUrl,
    name: episode.title,
    description: episode.subtitle || episode.description || episode.title,
    ...(episode.publishedAt && {
      datePublished: episode.publishedAt.toISOString(),
    }),
    dateCreated: episode.createdAt.toISOString(),
    dateModified: episode.updatedAt.toISOString(),
    ...(episode.duration && {
      duration: `PT${episode.duration}S`, // ISO 8601 duration format
    }),
    ...(episode.audioUrl && {
      associatedMedia: {
        "@type": "MediaObject",
        contentUrl: episode.audioUrl,
        encodingFormat: episode.mimeType,
        ...(episode.audioBytes && {
          contentSize: episode.audioBytes.toString(),
        }),
        ...(episode.duration && {
          duration: `PT${episode.duration}S`,
        }),
      },
    }),
    ...(episode.transcript && {
      transcript: {
        "@type": "WebPageElement",
        text: episode.transcript,
      },
    }),
    partOfSeries: {
      "@type": "PodcastSeries",
      "@id": `${BASE_URL}/#podcast`,
      name: show.title,
      url: BASE_URL,
    },
    ...(episode.season && { partOfSeason: episode.season }),
    ...(episode.episode && { episodeNumber: episode.episode }),
  };
}

/**
 * Generate JSON-LD for Organization (About page)
 * Schema.org spec: https://schema.org/Organization
 */
export function generateOrganizationJsonLd(show: Show) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: show.ownerName,
    url: BASE_URL,
    email: show.ownerEmail,
    description: show.description,
    ...(show.imageUrl && {
      logo: {
        "@type": "ImageObject",
        url: show.imageUrl,
      },
    }),
    sameAs: [],
  };
}

/**
 * Generate JSON-LD for Website
 * Schema.org spec: https://schema.org/WebSite
 */
export function generateWebsiteJsonLd(show: Show) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: show.title,
    description: show.description,
    inLanguage: show.language,
    publisher: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: show.ownerName,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/episodes?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate breadcrumb JSON-LD
 * Schema.org spec: https://schema.org/BreadcrumbList
 */
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
