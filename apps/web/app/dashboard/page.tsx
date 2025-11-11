import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Epoch Pod dashboard",
};

export default async function DashboardPage() {
  const session = await auth();

  // Get user's episode counts by type
  const episodeCounts = await prisma.episode.groupBy({
    by: ['type'],
    where: {
      userId: session?.user?.id,
    },
    _count: true,
  });

  const totalEpisodes = episodeCounts.reduce((sum, group) => sum + group._count, 0);

  // Get active adventures (if any)
  const activeJourneys = session?.user?.id
    ? await prisma.userJourney.count({
        where: {
          userId: session.user.id,
          isCompleted: false,
        },
      })
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Welcome back, {session?.user?.name || session?.user?.email}!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-blue-600"
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
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Episodes
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {totalEpisodes}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    Active Adventures
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    {activeJourneys}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    Debates Voted
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    0
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-orange-600"
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
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    Minutes Listened
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                    0
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Content Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Create New Content
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Narrative Podcast */}
          <Link
            href="/dashboard/episodes"
            className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-blue-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
          >
            <div className="mb-4 text-5xl">🎧</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Narrative Podcast
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Traditional storytelling with 5-act structure and citations
            </p>
            <div className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
              Create episode →
            </div>
          </Link>

          {/* Historical Interview */}
          <Link
            href="/dashboard/interviews/new"
            className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-purple-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-500"
          >
            <div className="mb-4 text-5xl">🎤</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Historical Interview
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Conversations with figures like Einstein and Cleopatra
            </p>
            <div className="text-sm font-medium text-purple-600 group-hover:text-purple-700">
              Create interview →
            </div>
          </Link>

          {/* Interactive Debate */}
          <Link
            href="/dashboard/debates/new"
            className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-green-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-500"
          >
            <div className="mb-4 text-5xl">⚖️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Interactive Debate
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Two-sided debates where listeners vote on positions
            </p>
            <div className="text-sm font-medium text-green-600 group-hover:text-green-700">
              Create debate →
            </div>
          </Link>

          {/* Choose Your Own Adventure */}
          <Link
            href="/dashboard/adventures/new"
            className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-500"
          >
            <div className="mb-4 text-5xl">🎮</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Choose Your Adventure
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Branching narratives with multiple endings
            </p>
            <div className="text-sm font-medium text-orange-600 group-hover:text-orange-700">
              Create adventure →
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Browse Content
          </h2>
          <div className="space-y-3">
            <Link
              href="/episodes"
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                All Episodes
              </span>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/adventures"
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Active Adventures
              </span>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/dashboard/episodes"
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                My Episodes
              </span>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Settings & Preferences
          </h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/preferences"
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Voice & Topics
              </span>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/dashboard/preferences#rss"
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                RSS Feed
              </span>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/dashboard/preferences#email"
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Email Delivery
              </span>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
