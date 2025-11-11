import Link from 'next/link';
import { prisma } from '@/lib/db';

export const metadata = {
  title: 'Choose Your Own Adventure | Epoch Pod',
  description: 'Explore branching historical adventures where your choices shape the story',
};

export default async function AdventuresPage() {
  const adventures = await prisma.adventure.findMany({
    where: { isPublished: true },
    include: {
      startNode: {
        include: {
          episode: {
            select: {
              id: true,
              title: true,
              duration: true,
            },
          },
        },
      },
      _count: {
        select: {
          nodes: true,
          journeys: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="mb-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                ← Back to Home
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Choose Your Own Adventure
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Shape history through your choices in branching narrative adventures
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {adventures.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No adventures available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {adventures.map((adventure) => (
              <Link
                key={adventure.id}
                href={`/adventures/${adventure.id}`}
                className="group block"
              >
                <div className="h-full rounded-lg border-2 border-gray-200 bg-white p-6 shadow transition hover:border-indigo-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-500">
                  {/* Header */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                        Adventure
                      </span>
                      {adventure.era && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {adventure.era}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                      {adventure.title}
                    </h2>
                  </div>

                  {/* Description */}
                  <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                    {adventure.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>{adventure._count.nodes} episodes</span>
                      </div>
                      <div className="flex items-center gap-1">
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
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        <span>{adventure._count.journeys} played</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-4">
                    <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-700 dark:text-indigo-400 dark:group-hover:text-indigo-300">
                      Start Your Journey →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
