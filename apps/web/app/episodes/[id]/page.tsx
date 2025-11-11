import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { AudioPlayer } from "@/components/audio/audio-player";
import { InterviewPlayer } from "@/components/interview/interview-player";
import { generatePodcastEpisodeJsonLd, generateBreadcrumbJsonLd } from "@/lib/utils/json-ld";

interface EpisodePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EpisodePageProps): Promise<Metadata> {
  const { id } = await params;
  const episode = await prisma.episode.findUnique({
    where: { id },
    include: {
      interview: true,
    },
  });

  if (!episode) {
    return {
      title: "Episode Not Found",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const episodeUrl = `${baseUrl}/episodes/${id}`;

  return {
    title: episode.title,
    description: episode.subtitle || episode.description || episode.title,
    openGraph: {
      title: episode.title,
      description: episode.subtitle || episode.description || episode.title,
      type: "music.song",
      url: episodeUrl,
      ...(episode.audioUrl && {
        audio: episode.audioUrl,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: episode.title,
      description: episode.subtitle || episode.description || episode.title,
    },
  };
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { id } = await params;
  const session = await auth();

  const episode = await prisma.episode.findUnique({
    where: { id },
    include: {
      interview: true,
    },
  });

  if (!episode) {
    notFound();
  }

  // Check access permissions
  if (episode.userId && episode.userId !== session?.user?.id) {
    notFound(); // Hide private episodes from other users
  }

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

  // Parse sources from JSON
  const sources = (episode.sources as any) || [];

  // Generate JSON-LD structured data
  const episodeJsonLd = generatePodcastEpisodeJsonLd(episode, show);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: baseUrl },
    { name: "Episodes", url: `${baseUrl}/episodes` },
    { name: episode.title, url: `${baseUrl}/episodes/${id}` },
  ]);

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(episodeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/episodes"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Episodes
            </Link>
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              Epoch Pod
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Episode header */}
        <div className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {episode.duration
                ? `${Math.round(episode.duration / 60)} min`
                : "New"}
            </span>
            {episode.userId && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                Private
              </span>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {episode.publishedAt
                ? new Date(episode.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Just added"}
            </span>
          </div>

          <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {episode.title}
          </h1>

          {episode.subtitle && (
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {episode.subtitle}
            </p>
          )}
        </div>

        {/* Audio player / Interview player */}
        {episode.type === 'INTERVIEW' && episode.interview && episode.audioUrl ? (
          <div className="mb-12">
            <InterviewPlayer
              episode={{
                id: episode.id,
                title: episode.title,
                description: episode.description || '',
                audioUrl: episode.audioUrl,
                duration: episode.duration || undefined,
                interview: {
                  guestName: episode.interview.guestName,
                  guestRole: episode.interview.guestRole,
                  guestEra: episode.interview.guestEra,
                  topic: episode.interview.topic,
                  questions: episode.interview.questions as any[],
                },
              }}
            />
          </div>
        ) : episode.audioUrl ? (
          <div className="mb-12">
            <AudioPlayer
              src={episode.audioUrl}
              title={episode.title}
              duration={episode.duration || undefined}
            />
          </div>
        ) : null}

        {/* Transcript */}
        {episode.transcript && (
          <div
            id="transcript"
            className="mb-12 rounded-lg bg-white p-8 shadow dark:bg-gray-800"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Transcript
              </h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(episode.transcript || "");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Copy
              </button>
            </div>
            <div className="prose prose-gray max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap leading-relaxed">
                {episode.transcript}
              </p>
            </div>
          </div>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <div className="rounded-lg bg-white p-8 shadow dark:bg-gray-800">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Sources & Citations
            </h2>
            <ul className="space-y-4">
              {sources.map((source: any, index: number) => (
                <li
                  key={index}
                  className="border-l-4 border-blue-500 pl-4 text-gray-700 dark:text-gray-300"
                >
                  <div className="font-semibold">{source.title}</div>
                  {source.author && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {source.author}
                      {source.year && ` (${source.year})`}
                    </div>
                  )}
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      View source →
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
    </>
  );
}
