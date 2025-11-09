import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generatePodcastSeriesJsonLd, generateWebsiteJsonLd } from "@/lib/utils/json-ld";

export async function generateMetadata() {
  const show = await prisma.show.findFirst();

  return {
    title: show?.title || "Epoch Pod - AI-Generated History Podcasts",
    description: show?.description || "Personalized history podcasts delivered to your inbox. Explore any era, topic, or moment in time with AI-generated episodes.",
    openGraph: {
      title: show?.title || "Epoch Pod",
      description: show?.description || "Personalized history podcasts delivered to your inbox",
      type: "website",
      siteName: "Epoch Pod",
    },
    twitter: {
      card: "summary_large_image",
      title: show?.title || "Epoch Pod",
      description: show?.description || "Personalized history podcasts delivered to your inbox",
    },
  };
}

export default async function Home() {
  const session = await auth();

  // Get or create the default show metadata
  let show = await prisma.show.findFirst();

  if (!show) {
    show = await prisma.show.create({
      data: {
        title: process.env.NEXT_PUBLIC_SITE_NAME || "Epoch Pod",
        description:
          "Personalized history podcasts delivered to your inbox. Explore any era, topic, or moment in time with AI-generated episodes.",
        ownerName: "Epoch Pod",
        ownerEmail: process.env.RESEND_FROM_EMAIL || "noreply@epoch.fm",
        language: "en-us",
        category: "History",
        explicit: false,
      },
    });
  }

  const podcastSeriesJsonLd = generatePodcastSeriesJsonLd(show);
  const websiteJsonLd = generateWebsiteJsonLd(show);

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(podcastSeriesJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <main className="flex flex-col items-center gap-8 text-center">
          <h1 className="text-6xl font-bold">Epoch Pod</h1>
        <p className="max-w-2xl text-xl text-gray-600 dark:text-gray-400">
          Personalized history podcasts, delivered to your inbox. Explore any
          era, topic, or moment in time with AI-generated episodes.
        </p>
        <div className="flex gap-4">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Get Started
            </Link>
          )}
          <Link
            href="/episodes"
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Listen to Episodes
          </Link>
        </div>

        <div className="mt-12 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">AI-Powered</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Advanced AI generates engaging narratives with accurate historical
              context and citations.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Email & RSS</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get episodes in your inbox or subscribe via your favorite podcast
              app.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Personalized</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose your topics, era preferences, and narration voice for a
              tailored experience.
            </p>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
