import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

interface AdventurePageProps {
  params: Promise<{ adventureId: string }>;
}

export default async function AdventurePage({ params }: AdventurePageProps) {
  const { adventureId } = await params;
  const session = await auth();

  const adventure = await prisma.adventure.findUnique({
    where: { id: adventureId },
    include: {
      startNode: {
        include: {
          episode: true,
          choices: true,
        },
      },
      _count: {
        select: {
          nodes: true,
          journeys: true,
        },
      },
    },
  });

  if (!adventure || !adventure.isPublished) {
    notFound();
  }

  // Check if user has an active journey
  let existingJourney = null;
  if (session?.user?.id) {
    existingJourney = await prisma.userJourney.findUnique({
      where: {
        userId_adventureId: {
          userId: session.user.id,
          adventureId,
        },
      },
      include: {
        currentNode: {
          include: {
            episode: true,
          },
        },
      },
    });
  }

  async function startJourney() {
    'use server';

    const session = await auth();
    if (!session?.user?.id) {
      redirect('/auth/signin?callbackUrl=/adventures/' + adventureId);
    }

    // Start journey via API call would happen on client side
    // This is just a redirect action
    redirect(`/adventures/${adventureId}/start`);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/adventures"
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
            Back to Adventures
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Adventure Header */}
        <div className="mb-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 p-8 text-white shadow-lg">
          <div className="mb-2 text-sm font-medium uppercase tracking-wide opacity-90">
            Choose Your Own Adventure
          </div>
          <h1 className="mb-3 text-4xl font-bold">{adventure.title}</h1>
          {adventure.era && (
            <div className="mb-4 text-lg opacity-90">{adventure.era}</div>
          )}
          <p className="text-lg opacity-95">{adventure.description}</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {adventure._count.nodes}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Episodes
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {adventure._count.journeys}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Times Played
            </div>
          </div>
        </div>

        {/* Start/Continue Journey */}
        <div className="mb-8 rounded-lg bg-white p-8 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Your Journey
          </h2>

          {!session ? (
            <div>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Sign in to start your adventure and track your choices.
              </p>
              <Link
                href={`/auth/signin?callbackUrl=/adventures/${adventureId}`}
                className="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700"
              >
                Sign In to Start
              </Link>
            </div>
          ) : existingJourney && !existingJourney.isCompleted ? (
            <div>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                You have an adventure in progress. Continue where you left off!
              </p>
              <div className="mb-4 rounded bg-gray-50 p-4 dark:bg-gray-700">
                <div className="font-medium">
                  Current: {existingJourney.currentNode.episode.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {(existingJourney.path as any[]).length} choices made
                </div>
              </div>
              <Link
                href={`/episodes/${existingJourney.currentNode.episode.id}`}
                className="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700"
              >
                Continue Journey
              </Link>
            </div>
          ) : existingJourney && existingJourney.isCompleted ? (
            <div>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                You've completed this adventure! Play again to explore different paths.
              </p>
              <form action={startJourney}>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition hover:bg-purple-700"
                >
                  Play Again
                </button>
              </form>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Begin your journey through history. Your choices will shape the story.
              </p>
              <Link
                href={`/episodes/${adventure.startNode.episode.id}`}
                className="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700"
              >
                Start Adventure
              </Link>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="rounded-lg bg-gray-50 p-8 dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            How It Works
          </h3>
          <ol className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                1
              </span>
              <span>Listen to each episode to immerse yourself in the story</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                2
              </span>
              <span>Make choices at key decision points that shape your path</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                3
              </span>
              <span>Experience different outcomes based on your decisions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                4
              </span>
              <span>Replay to explore alternate paths and endings</span>
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
