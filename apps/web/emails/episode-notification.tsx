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

interface EpisodeNotificationProps {
  episodeTitle: string;
  episodeSubtitle?: string;
  episodeUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  transcript?: string;
  userName?: string;
}

export default function EpisodeNotification({
  episodeTitle = "The Library of Alexandria",
  episodeSubtitle = "The Rise and Fall of Ancient Knowledge",
  episodeUrl = "https://epoch.fm/episodes/123",
  audioUrl = "https://epoch.fm/audio/123.mp3",
  duration = 1200,
  transcript = "In the bustling harbor of ancient Alexandria...",
  userName = "there",
}: EpisodeNotificationProps) {
  const durationMinutes = Math.round(duration / 60);

  return (
    <EmailLayout preview={`New episode: ${episodeTitle}`}>
      {/* Greeting */}
      <Text style={greeting}>Hi {userName},</Text>

      {/* Main message */}
      <Heading style={heading}>Your new episode is ready!</Heading>

      <Text style={paragraph}>
        We&apos;ve just finished creating a brand new podcast episode tailored
        to your interests.
      </Text>

      {/* Episode details */}
      <Section style={episodeCard}>
        <Heading as="h2" style={episodeTitle}>
          {episodeTitle}
        </Heading>
        {episodeSubtitle && (
          <Text style={episodeSubtitle}>{episodeSubtitle}</Text>
        )}
        <Text style={episodeMeta}>
          <span style={metaBadge}>{durationMinutes} min</span>
          {" · "}
          <span>Just added</span>
        </Text>
      </Section>

      {/* Call to action */}
      <Section style={ctaSection}>
        <Button href={episodeUrl} style={button}>
          Listen Now
        </Button>
        <Text style={altLink}>
          Or{" "}
          <Link href={audioUrl} style={link}>
            download the MP3
          </Link>
        </Text>
      </Section>

      {/* Transcript preview */}
      {transcript && (
        <>
          <Hr style={divider} />
          <Section style={transcriptSection}>
            <Heading as="h3" style={transcriptHeading}>
              Transcript Preview
            </Heading>
            <Text style={transcriptText}>
              {transcript.substring(0, 300)}
              {transcript.length > 300 ? "..." : ""}
            </Text>
            <Link href={`${episodeUrl}#transcript`} style={link}>
              Read full transcript →
            </Link>
          </Section>
        </>
      )}

      {/* Additional info */}
      <Hr style={divider} />
      <Text style={infoText}>
        This episode was generated based on your preferences. You can adjust
        your topics, voice settings, and delivery schedule in your{" "}
        <Link
          href={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/preferences`}
          style={link}
        >
          preferences
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
  marginBottom: "24px",
};

const episodeTitle = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#111111",
  margin: "0 0 8px",
};

const episodeSubtitle = {
  fontSize: "16px",
  color: "#666666",
  margin: "0 0 12px",
  fontStyle: "italic",
};

const episodeMeta = {
  fontSize: "14px",
  color: "#666666",
  margin: "0",
};

const metaBadge = {
  backgroundColor: "#2563eb",
  color: "#ffffff",
  padding: "2px 8px",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: "600",
};

const ctaSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  margin: "0 0 12px",
};

const altLink = {
  fontSize: "14px",
  color: "#666666",
  margin: "0",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const transcriptSection = {
  marginBottom: "24px",
};

const transcriptHeading = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#111111",
  margin: "0 0 12px",
};

const transcriptText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#666666",
  margin: "0 0 12px",
  fontStyle: "italic",
  backgroundColor: "#f9fafb",
  padding: "16px",
  borderRadius: "6px",
  borderLeft: "3px solid #2563eb",
};

const infoText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#666666",
};
