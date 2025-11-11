import {
  Heading,
  Text,
  Button,
  Hr,
  Section,
  Link,
} from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/layout";

type EpisodeType = 'NARRATIVE' | 'INTERVIEW' | 'DEBATE' | 'ADVENTURE';

interface DigestEpisode {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  duration: number;
  publishedAt: Date;
  type?: EpisodeType;
}

interface DigestEmailProps {
  userName?: string;
  episodes: DigestEpisode[];
  periodLabel: string; // e.g., "This Week", "This Month"
}

export default function DigestEmail({
  userName = "there",
  episodes = [
    {
      id: "1",
      title: "The Library of Alexandria",
      subtitle: "The Rise and Fall of Ancient Knowledge",
      url: "https://epoch.fm/episodes/1",
      duration: 1200,
      publishedAt: new Date(),
      type: "NARRATIVE" as EpisodeType,
    },
    {
      id: "2",
      title: "The Silk Road",
      subtitle: "Trade Routes that Changed the World",
      url: "https://epoch.fm/episodes/2",
      duration: 1380,
      publishedAt: new Date(),
      type: "NARRATIVE" as EpisodeType,
    },
  ],
  periodLabel = "This Week",
}: DigestEmailProps) {
  const totalDuration = episodes.reduce((sum, ep) => sum + ep.duration, 0);
  const totalMinutes = Math.round(totalDuration / 60);

  const getFormatIcon = (type?: EpisodeType) => {
    switch (type) {
      case 'INTERVIEW': return '🎤';
      case 'DEBATE': return '⚖️';
      case 'ADVENTURE': return '🎮';
      default: return '🎧';
    }
  };

  const getFormatLabel = (type?: EpisodeType) => {
    switch (type) {
      case 'INTERVIEW': return 'Interview';
      case 'DEBATE': return 'Debate';
      case 'ADVENTURE': return 'Adventure';
      default: return 'Podcast';
    }
  };

  return (
    <EmailLayout preview={`${episodes.length} new episodes ${periodLabel.toLowerCase()}`}>
      {/* Greeting */}
      <Text style={greeting}>Hi {userName},</Text>

      {/* Main message */}
      <Heading style={heading}>
        {episodes.length} New Episode{episodes.length !== 1 ? "s" : ""}{" "}
        {periodLabel}
      </Heading>

      <Text style={paragraph}>
        Here&apos;s your curated selection of history podcasts. You have{" "}
        <strong>{totalMinutes} minutes</strong> of engaging content waiting for
        you.
      </Text>

      {/* Episodes list */}
      {episodes.map((episode, index) => (
        <React.Fragment key={episode.id}>
          <Section style={episodeCard}>
            <Text style={typeLabel}>
              {getFormatIcon(episode.type)} {getFormatLabel(episode.type)}
            </Text>
            <Heading as="h3" style={episodeTitle}>
              {episode.title}
            </Heading>
            {episode.subtitle && (
              <Text style={episodeSubtitle}>{episode.subtitle}</Text>
            )}
            <Text style={episodeMeta}>
              <span style={metaBadge}>
                {Math.round(episode.duration / 60)} min
              </span>
              {" · "}
              <span>
                {new Date(episode.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </Text>
            <Button href={episode.url} style={button}>
              Listen Now
            </Button>
          </Section>

          {index < episodes.length - 1 && <Hr style={divider} />}
        </React.Fragment>
      ))}

      {/* View all link */}
      <Section style={ctaSection}>
        <Text style={viewAllText}>
          <Link
            href={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/episodes`}
            style={link}
          >
            View all episodes →
          </Link>
        </Text>
      </Section>

      {/* Additional info */}
      <Hr style={divider} />
      <Text style={infoText}>
        You&apos;re receiving this digest based on your delivery preferences.
        Want to change your schedule or topics?{" "}
        <Link
          href={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/preferences`}
          style={link}
        >
          Update your preferences
        </Link>
        .
      </Text>
    </EmailLayout>
  );
}

// Styles
const greeting = {
  fontSize: "16px",
  color: "#333333",
  marginBottom: "8px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#111111",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333333",
  margin: "0 0 24px",
};

const episodeCard = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "24px",
  marginBottom: "8px",
};

const typeLabel = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#666666",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 12px",
};

const episodeTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#111111",
  margin: "0 0 8px",
};

const episodeSubtitle = {
  fontSize: "14px",
  color: "#666666",
  margin: "0 0 12px",
  fontStyle: "italic",
};

const episodeMeta = {
  fontSize: "14px",
  color: "#666666",
  margin: "0 0 16px",
};

const metaBadge = {
  backgroundColor: "#2563eb",
  color: "#ffffff",
  padding: "2px 8px",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: "600",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "10px 24px",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "16px 0",
};

const ctaSection = {
  textAlign: "center" as const,
  marginTop: "24px",
  marginBottom: "24px",
};

const viewAllText = {
  fontSize: "16px",
  margin: "0",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
  fontWeight: "600",
};

const infoText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#666666",
};
