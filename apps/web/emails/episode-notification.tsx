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

interface InterviewDetails {
  guestName: string;
  guestRole: string;
  guestEra: string;
  topic: string;
}

interface DebateDetails {
  question: string;
  position1: string;
  position2: string;
}

interface AdventureDetails {
  description: string;
  firstChoice?: string;
}

interface EpisodeNotificationProps {
  episodeTitle: string;
  episodeSubtitle?: string;
  episodeUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  transcript?: string;
  userName?: string;
  episodeType?: EpisodeType;
  interviewDetails?: InterviewDetails;
  debateDetails?: DebateDetails;
  adventureDetails?: AdventureDetails;
}

export default function EpisodeNotification({
  episodeTitle = "The Library of Alexandria",
  episodeSubtitle = "The Rise and Fall of Ancient Knowledge",
  episodeUrl = "https://epoch.fm/episodes/123",
  audioUrl = "https://epoch.fm/audio/123.mp3",
  duration = 1200,
  transcript = "In the bustling harbor of ancient Alexandria...",
  userName = "there",
  episodeType = "NARRATIVE",
  interviewDetails,
  debateDetails,
  adventureDetails,
}: EpisodeNotificationProps) {
  const durationMinutes = Math.round(duration / 60);

  // Format-specific messaging
  const getFormatIcon = () => {
    switch (episodeType) {
      case 'INTERVIEW': return '🎤';
      case 'DEBATE': return '⚖️';
      case 'ADVENTURE': return '🎮';
      default: return '🎧';
    }
  };

  const getFormatLabel = () => {
    switch (episodeType) {
      case 'INTERVIEW': return 'Historical Interview';
      case 'DEBATE': return 'Interactive Debate';
      case 'ADVENTURE': return 'Choose Your Own Adventure';
      default: return 'Narrative Podcast';
    }
  };

  const getMainMessage = () => {
    switch (episodeType) {
      case 'INTERVIEW':
        return `We've created a fascinating interview with ${interviewDetails?.guestName || 'a historical figure'}!`;
      case 'DEBATE':
        return "We've crafted an engaging debate where you'll vote on a controversial historical question!";
      case 'ADVENTURE':
        return "Your interactive adventure awaits! Make choices that will shape history!";
      default:
        return "We've just finished creating a brand new podcast episode tailored to your interests.";
    }
  };

  return (
    <EmailLayout preview={`${getFormatIcon()} New ${getFormatLabel()}: ${episodeTitle}`}>
      {/* Greeting */}
      <Text style={greeting}>Hi {userName},</Text>

      {/* Main message */}
      <Heading style={heading}>
        {getFormatIcon()} Your new {getFormatLabel().toLowerCase()} is ready!
      </Heading>

      <Text style={paragraph}>
        {getMainMessage()}
      </Text>

      {/* Episode details */}
      <Section style={episodeCard}>
        <Heading as="h2" style={episodeTitleStyle}>
          {episodeTitle}
        </Heading>
        {episodeSubtitle && (
          <Text style={episodeSubtitleStyle}>{episodeSubtitle}</Text>
        )}
        <Text style={episodeMeta}>
          <span style={metaBadge}>{durationMinutes} min</span>
          {" · "}
          <span>{getFormatLabel()}</span>
        </Text>

        {/* Format-specific details */}
        {episodeType === 'INTERVIEW' && interviewDetails && (
          <Section style={formatDetails}>
            <Text style={detailsLabel}>Featured Guest:</Text>
            <Text style={detailsValue}>
              <strong>{interviewDetails.guestName}</strong>, {interviewDetails.guestRole}
            </Text>
            <Text style={detailsValue}>{interviewDetails.guestEra}</Text>
            <Text style={detailsLabel} marginTop={12}>Topic:</Text>
            <Text style={detailsValue}>{interviewDetails.topic}</Text>
          </Section>
        )}

        {episodeType === 'DEBATE' && debateDetails && (
          <Section style={formatDetails}>
            <Text style={detailsLabel}>The Question:</Text>
            <Text style={detailsValue}>
              <strong>{debateDetails.question}</strong>
            </Text>
            <Section style={positionsContainer}>
              <Text style={positionLabel}>Position A:</Text>
              <Text style={positionText}>{debateDetails.position1}</Text>
              <Text style={positionLabel} marginTop={8}>Position B:</Text>
              <Text style={positionText}>{debateDetails.position2}</Text>
            </Section>
            <Text style={votePrompt}>
              Listen to both sides, then cast your vote to unlock follow-up content!
            </Text>
          </Section>
        )}

        {episodeType === 'ADVENTURE' && adventureDetails && (
          <Section style={formatDetails}>
            <Text style={detailsLabel}>Your Journey:</Text>
            <Text style={detailsValue}>{adventureDetails.description}</Text>
            {adventureDetails.firstChoice && (
              <>
                <Text style={detailsLabel} marginTop={12}>First Choice:</Text>
                <Text style={choicePreview}>{adventureDetails.firstChoice}</Text>
              </>
            )}
            <Text style={adventurePrompt}>
              Your decisions will shape the outcome. Multiple endings await!
            </Text>
          </Section>
        )}
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

const episodeTitleStyle = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#111111",
  margin: "0 0 8px",
};

const episodeSubtitleStyle = {
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

// Format-specific styles
const formatDetails = {
  marginTop: "20px",
  paddingTop: "20px",
  borderTop: "1px solid #e5e7eb",
};

const detailsLabel = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#666666",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px",
};

const detailsValue = {
  fontSize: "14px",
  color: "#333333",
  margin: "0 0 4px",
  lineHeight: "20px",
};

const positionsContainer = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  padding: "12px",
  margin: "12px 0",
};

const positionLabel = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#2563eb",
  margin: "0 0 4px",
};

const positionText = {
  fontSize: "14px",
  color: "#333333",
  margin: "0",
  lineHeight: "20px",
};

const votePrompt = {
  fontSize: "13px",
  color: "#2563eb",
  fontStyle: "italic" as const,
  margin: "8px 0 0",
  fontWeight: "500",
};

const choicePreview = {
  fontSize: "14px",
  color: "#333333",
  backgroundColor: "#eff6ff",
  padding: "10px 12px",
  borderRadius: "6px",
  borderLeft: "3px solid #2563eb",
  margin: "4px 0 0",
  fontStyle: "italic" as const,
};

const adventurePrompt = {
  fontSize: "13px",
  color: "#7c3aed",
  fontStyle: "italic" as const,
  margin: "12px 0 0",
  fontWeight: "500",
};
