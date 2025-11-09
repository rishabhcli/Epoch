import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Epoch Pod - Personalized History Podcasts",
    template: "%s | Epoch Pod",
  },
  description:
    "AI-generated history podcasts delivered to your inbox. Explore any era, topic, or moment in time.",
  keywords: ["podcast", "history", "AI", "personalized", "education"],
  authors: [{ name: "Epoch Pod" }],
  creator: "Epoch Pod",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Epoch Pod - Personalized History Podcasts",
    description:
      "AI-generated history podcasts delivered to your inbox. Explore any era, topic, or moment in time.",
    siteName: "Epoch Pod",
  },
  twitter: {
    card: "summary_large_image",
    title: "Epoch Pod - Personalized History Podcasts",
    description:
      "AI-generated history podcasts delivered to your inbox. Explore any era, topic, or moment in time.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
