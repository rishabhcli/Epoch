import { Resend } from "resend";
import { render } from "@react-email/components";
import { prisma } from "../db";
import { nanoid } from "nanoid";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@epoch.fm";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
  userId?: string;
}

/**
 * Send an email with proper RFC 8058 one-click unsubscribe headers
 * Docs: https://resend.com/docs/send-with-nodejs
 * RFC 8058: https://www.rfc-editor.org/rfc/rfc8058.html
 */
export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, react, userId } = options;

  // Generate unsubscribe token
  const unsubscribeToken = nanoid(32);

  // Store unsubscribe token if userId is provided
  if (userId) {
    // Create unsubscribe token with 30-day expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.unsubscribeToken.create({
      data: {
        token: unsubscribeToken,
        userId,
        email: to,
        expiresAt,
      },
    });
  }

  // Build unsubscribe URLs
  const unsubscribeUrl = `${APP_URL}/api/unsubscribe?token=${unsubscribeToken}`;
  const unsubscribeOneClickUrl = `${APP_URL}/api/unsubscribe/one-click`;

  // Render email HTML
  const htmlContent = await render(react, {
    // Replace placeholder with actual URL
    pretty: false,
  });
  const html = htmlContent.replace("{{unsubscribeUrl}}", unsubscribeUrl);

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      headers: {
        // RFC 2369: List-Unsubscribe header (traditional)
        "List-Unsubscribe": `<${unsubscribeUrl}>, <mailto:unsubscribe@epoch.fm?subject=unsubscribe>`,

        // RFC 8058: List-Unsubscribe-Post header (one-click)
        // This allows mail clients to show a prominent "Unsubscribe" button
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",

        // Optional: Add List-ID for better organization
        "List-ID": "<epoch-pod.epoch.fm>",
      },
    });

    // Log email event
    if (userId && response.data?.id) {
      await prisma.emailEvent.create({
        data: {
          messageId: response.data.id,
          email: to,
          type: "SENT",
          data: {
            subject,
            unsubscribeToken,
          },
        },
      });
    }

    return response;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error(
      `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Send episode notification email
 */
export async function sendEpisodeNotification(params: {
  userId: string;
  episodeId: string;
}) {
  const { userId, episodeId } = params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
  });

  if (!user || !episode) {
    throw new Error("User or episode not found");
  }

  // Import the email component dynamically to avoid build issues
  const EpisodeNotification = (
    await import("../../emails/episode-notification")
  ).default;

  const episodeUrl = `${APP_URL}/episodes/${episode.id}`;

  await sendEmail({
    to: user.email,
    subject: `New episode: ${episode.title}`,
    react: EpisodeNotification({
      episodeTitle: episode.title,
      episodeSubtitle: episode.subtitle || undefined,
      episodeUrl,
      audioUrl: episode.audioUrl || "",
      duration: episode.duration || 0,
      transcript: episode.transcript || undefined,
      userName: user.name || user.email.split("@")[0],
    }),
    userId: user.id,
  });
}

/**
 * Send digest email with multiple episodes
 */
export async function sendDigestEmail(params: {
  userId: string;
  episodeIds: string[];
  periodLabel: string;
}) {
  const { userId, episodeIds, periodLabel } = params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const episodes = await prisma.episode.findMany({
    where: { id: { in: episodeIds } },
    orderBy: { publishedAt: "desc" },
  });

  if (!user || episodes.length === 0) {
    throw new Error("User or episodes not found");
  }

  // Import the email component
  const DigestEmail = (await import("../../emails/digest")).default;

  const digestEpisodes = episodes.map((ep) => ({
    id: ep.id,
    title: ep.title,
    subtitle: ep.subtitle || undefined,
    url: `${APP_URL}/episodes/${ep.id}`,
    duration: ep.duration || 0,
    publishedAt: ep.publishedAt || ep.createdAt,
  }));

  await sendEmail({
    to: user.email,
    subject: `${episodes.length} new episodes ${periodLabel.toLowerCase()}`,
    react: DigestEmail({
      userName: user.name || user.email.split("@")[0],
      episodes: digestEpisodes,
      periodLabel,
    }),
    userId: user.id,
  });

  // Update subscription last sent date
  await prisma.subscription.update({
    where: { userId: user.id },
    data: { lastSentAt: new Date() },
  });
}
