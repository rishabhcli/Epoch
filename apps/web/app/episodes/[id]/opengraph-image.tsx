import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const runtime = "edge";
export const alt = "Epoch Pod Episode";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const episode = await prisma.episode.findUnique({
      where: { id },
    });

    if (!episode) {
      // Return a default image for not found episodes
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 64,
              background: "linear-gradient(to bottom right, #1e3a8a, #3b82f6)",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Episode Not Found
          </div>
        ),
        {
          ...size,
        }
      );
    }

    // Format duration for display
    const formattedDuration = episode.duration
      ? `${Math.round(episode.duration / 60)} min`
      : "New Episode";

    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(to bottom right, #1e3a8a, #3b82f6, #60a5fa)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "80px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
              }}
            >
              🎙️
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                color: "white",
              }}
            >
              <div style={{ fontSize: "32px", fontWeight: "bold" }}>
                Epoch Pod
              </div>
              <div
                style={{
                  fontSize: "24px",
                  opacity: 0.9,
                  background: "rgba(255, 255, 255, 0.2)",
                  padding: "6px 16px",
                  borderRadius: "8px",
                  marginTop: "8px",
                }}
              >
                {formattedDuration}
              </div>
            </div>
          </div>

          {/* Episode Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxWidth: "100%",
            }}
          >
            <div
              style={{
                fontSize: "56px",
                fontWeight: "bold",
                color: "white",
                lineHeight: 1.2,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {episode.title}
            </div>
            {episode.subtitle && (
              <div
                style={{
                  fontSize: "32px",
                  color: "rgba(255, 255, 255, 0.9)",
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {episode.subtitle}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: "24px",
            }}
          >
            <div>🎧 AI-Generated History Podcast</div>
            {episode.publishedAt && (
              <>
                <div style={{ opacity: 0.5 }}>•</div>
                <div>
                  {new Date(episode.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    // Return a fallback image on error
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 64,
            background: "linear-gradient(to bottom right, #1e3a8a, #3b82f6)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Epoch Pod
        </div>
      ),
      {
        ...size,
      }
    );
  }
}
