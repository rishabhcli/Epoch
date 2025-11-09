import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Epoch Pod - AI-Generated History Podcasts";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "40px",
            width: "120px",
            height: "120px",
            borderRadius: "30px",
            background: "rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "60px",
          }}
        >
          🎙️
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "96px",
              fontWeight: "bold",
              color: "white",
              letterSpacing: "-2px",
            }}
          >
            Epoch Pod
          </div>

          <div
            style={{
              fontSize: "40px",
              color: "rgba(255, 255, 255, 0.95)",
              maxWidth: "900px",
              lineHeight: 1.4,
            }}
          >
            Personalized history podcasts delivered to your inbox
          </div>

          <div
            style={{
              display: "flex",
              gap: "24px",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                padding: "16px 32px",
                borderRadius: "16px",
                fontSize: "28px",
                color: "white",
                fontWeight: "600",
              }}
            >
              🤖 AI-Powered
            </div>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                padding: "16px 32px",
                borderRadius: "16px",
                fontSize: "28px",
                color: "white",
                fontWeight: "600",
              }}
            >
              📧 Email & RSS
            </div>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                padding: "16px 32px",
                borderRadius: "16px",
                fontSize: "28px",
                color: "white",
                fontWeight: "600",
              }}
            >
              🎨 Personalized
            </div>
          </div>
        </div>

        {/* Footer tagline */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            fontSize: "28px",
            color: "rgba(255, 255, 255, 0.8)",
          }}
        >
          Explore any era, topic, or moment in time
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
