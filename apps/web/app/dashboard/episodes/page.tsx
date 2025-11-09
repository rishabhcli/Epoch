import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "My Episodes",
  description: "Manage your Epoch Pod episodes",
};

export default async function DashboardEpisodesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const episodes = await prisma.episode.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            My Episodes
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {episodes.length} episode{episodes.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

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
            Generate your first episode to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {episodes.map((episode) => (
            <div
              key={episode.id}
              className="rounded-lg bg-white p-6 shadow dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        episode.status === "PUBLISHED" || episode.status === "READY"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : episode.status === "FAILED"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {episode.status.replace(/_/g, " ")}
                    </span>
                    {episode.duration && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {Math.round(episode.duration / 60)} min
                      </span>
                    )}
                  </div>

                  <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                    {episode.title}
                  </h3>

                  {episode.subtitle && (
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
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
                      {new Date(episode.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {episode.errorMsg && (
                    <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                      <strong>Error:</strong> {episode.errorMsg}
                    </div>
                  )}
                </div>

                {(episode.status === "READY" || episode.status === "PUBLISHED") && (
                  <Link
                    href={`/episodes/${episode.id}`}
                    className="ml-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Listen
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
