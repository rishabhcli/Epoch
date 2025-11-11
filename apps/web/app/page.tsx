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

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="flex min-h-screen flex-col items-center justify-center px-4 py-24">
          <div className="max-w-5xl text-center">
            <h1 className="mb-6 text-6xl font-bold">Epoch Pod</h1>
            <p className="mb-4 text-2xl font-medium text-gray-700 dark:text-gray-300">
              AI-Powered Historical Storytelling
            </p>
            <p className="mx-auto mb-12 max-w-3xl text-xl text-gray-600 dark:text-gray-400">
              Experience history through multiple immersive formats: narrative podcasts, interviews with historical figures, interactive debates, and choose-your-own-adventure stories.
            </p>
            <div className="flex justify-center gap-4">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700"
                >
                  Get Started
                </Link>
              )}
              <Link
                href="/episodes"
                className="rounded-lg border border-gray-300 px-8 py-4 text-lg font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Browse Episodes
              </Link>
            </div>
          </div>
        </section>

        {/* Episode Formats Section */}
        <section className="bg-gray-50 px-4 py-24 dark:bg-gray-900">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-center text-4xl font-bold">Four Unique Formats</h2>
            <p className="mx-auto mb-16 max-w-2xl text-center text-lg text-gray-600 dark:text-gray-400">
              Choose how you want to experience history
            </p>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Narrative Podcasts */}
              <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                <div className="mb-4 text-5xl">🎧</div>
                <h3 className="mb-3 text-2xl font-bold">Narrative Podcasts</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Traditional 5-act storytelling with rich historical context, citations, and sources. Perfect for deep dives into historical events and periods.
                </p>
                <ul className="mb-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600">✓</span>
                    <span>Structured narrative with beginning, middle, and end</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600">✓</span>
                    <span>Historical accuracy with citations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600">✓</span>
                    <span>15-30 minute episodes</span>
                  </li>
                </ul>
              </div>

              {/* Historical Interviews */}
              <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                <div className="mb-4 text-5xl">🎤</div>
                <h3 className="mb-3 text-2xl font-bold">Historical Interviews</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  AI-powered conversations with historical figures like Einstein, Cleopatra, and Ada Lovelace. Two distinct voices bring these interviews to life.
                </p>
                <ul className="mb-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600">✓</span>
                    <span>Dialogue between host and historical guest</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600">✓</span>
                    <span>Multi-voice audio generation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600">✓</span>
                    <span>Explore guest's life, work, and era</span>
                  </li>
                </ul>
                <Link
                  href="/dashboard/interviews/new"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Create an interview →
                </Link>
              </div>

              {/* Interactive Debates */}
              <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                <div className="mb-4 text-5xl">⚖️</div>
                <h3 className="mb-3 text-2xl font-bold">Interactive Debates</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Hear both sides of controversial historical questions, then vote on your position. Your votes can unlock special follow-up episodes!
                </p>
                <ul className="mb-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600">✓</span>
                    <span>Three-voice debates with moderator</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600">✓</span>
                    <span>Vote for the position you support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600">✓</span>
                    <span>Unlock follow-up content through voting</span>
                  </li>
                </ul>
                <Link
                  href="/dashboard/debates/new"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Create a debate →
                </Link>
              </div>

              {/* Choose Your Own Adventure */}
              <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                <div className="mb-4 text-5xl">🎮</div>
                <h3 className="mb-3 text-2xl font-bold">Choose Your Own Adventure</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Make choices that shape history! Navigate branching narratives with multiple endings based on your decisions. Your journey is remembered across sessions.
                </p>
                <ul className="mb-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600">✓</span>
                    <span>8-12 interconnected episodes per adventure</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600">✓</span>
                    <span>Multiple endings (victory, defeat, bittersweet)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-600">✓</span>
                    <span>Journey tracking across sessions</span>
                  </li>
                </ul>
                <Link
                  href="/adventures"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Browse adventures →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-16 text-center text-4xl font-bold">Powerful Features</h2>

            <div className="grid gap-12 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold">AI-Powered Generation</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Advanced AI creates engaging content with accurate historical context, multiple voices, and proper citations.
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold">Email & RSS Delivery</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get episodes in your inbox or subscribe via Apple Podcasts and your favorite podcast apps.
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold">Fully Personalized</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose your topics, era preferences, voice settings, and delivery cadence for a tailored experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 px-4 py-24 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-4xl font-bold">Ready to Explore History?</h2>
            <p className="mb-8 text-xl text-blue-100">
              Start your journey through time with AI-powered historical content
            </p>
            {session?.user ? (
              <Link
                href="/dashboard"
                className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 hover:bg-blue-50"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 hover:bg-blue-50"
              >
                Get Started Free
              </Link>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
