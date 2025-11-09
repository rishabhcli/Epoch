import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { generatePodcastSeriesJsonLd } from "@/lib/utils/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const show = await prisma.show.findFirst();

  return {
    title: `Episodes - ${show?.title || "Epoch Pod"}`,
    description: show?.description || "Browse all Epoch Pod history podcast episodes",
    openGraph: {
      title: "Episodes",
      description: show?.description || "Browse all Epoch Pod history podcast episodes",
      type: "website",
    },
  };
}

export default async function EpisodesPage() {
  const session = await auth();

  // Get show metadata for JSON-LD
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

  // Get published episodes (public + user's private episodes if logged in)
  const episodes = await prisma.episode.findMany({
    where: {
      status: {
        in: ["READY", "PUBLISHED"],
      },
      audioUrl: { not: null },
      OR: [
        { userId: null }, // Public episodes
        ...(session?.user?.id ? [{ userId: session.user.id }] : []), // User's episodes
      ],
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 50,
  });

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(podcastSeriesJsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                Epoch Pod
              </Link>
            </div>
            <div className="flex gap-4">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            All Episodes
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Explore our collection of history podcasts
          </p>
        </div>

        {/* Episodes grid */}
        {episodes.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              No episodes yet
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {session?.user
                ? "Generate your first episode to get started!"
                : "Sign in to start generating personalized episodes."}
            </p>
            {session?.user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {episodes.map((episode) => (
              <Link
                key={episode.id}
                href={`/episodes/${episode.id}`}
                className="group"
              >
                <article className="h-full overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-lg dark:bg-gray-800">
                  {/* Episode content */}
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {episode.duration
                          ? `${Math.round(episode.duration / 60)} min`
                          : "New"}
                      </span>
                      {episode.userId && (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                          Private
                        </span>
                      )}
                    </div>

                    <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {episode.title}
                    </h3>

                    {episode.subtitle && (
                      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                        {episode.subtitle}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        {episode.publishedAt
                          ? new Date(episode.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "Just added"}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
    </>
  );
}
