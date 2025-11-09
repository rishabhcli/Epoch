import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
} from "@react-email/components";
import * as React from "react";

interface EmailLayoutProps {
  children: React.ReactNode;
  preview: string;
}

export function EmailLayout({ children, preview }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Preview text (visible in inbox, not in email body) */}
          <Text style={previewText}>{preview}</Text>

          {/* Header */}
          <Section style={header}>
            <Text style={headerTitle}>Epoch Pod</Text>
            <Text style={headerSubtitle}>
              Personalized History Podcasts
            </Text>
          </Section>

          {/* Main content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you subscribed to Epoch Pod.
            </Text>
            <Text style={footerText}>
              <Link href="{{unsubscribeUrl}}" style={footerLink}>
                Unsubscribe
              </Link>
              {" · "}
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/preferences`}
                style={footerLink}
              >
                Manage Preferences
              </Link>
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} Epoch Pod. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0",
  maxWidth: "600px",
};

const previewText = {
  display: "none",
  fontSize: "1px",
  lineHeight: "1px",
  maxHeight: "0px",
  maxWidth: "0px",
  opacity: 0,
  overflow: "hidden",
};

const header = {
  backgroundColor: "#2563eb",
  padding: "40px 30px",
  textAlign: "center" as const,
  borderRadius: "8px 8px 0 0",
};

const headerTitle = {
  margin: "0",
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
};

const headerSubtitle = {
  margin: "8px 0 0",
  color: "#ffffff",
  fontSize: "14px",
  opacity: 0.9,
};

const content = {
  backgroundColor: "#ffffff",
  padding: "40px 30px",
};

const footer = {
  backgroundColor: "#f6f6f6",
  padding: "20px 30px",
  textAlign: "center" as const,
  borderRadius: "0 0 8px 8px",
};

const footerText = {
  margin: "8px 0",
  color: "#666666",
  fontSize: "12px",
  lineHeight: "16px",
};

const footerLink = {
  color: "#2563eb",
  textDecoration: "underline",
};

const footerCopyright = {
  margin: "16px 0 0",
  color: "#999999",
  fontSize: "11px",
};
