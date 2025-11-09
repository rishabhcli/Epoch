export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-6xl font-bold">Epoch Pod</h1>
        <p className="max-w-2xl text-xl text-gray-600 dark:text-gray-400">
          Personalized history podcasts, delivered to your inbox. Explore any
          era, topic, or moment in time with AI-generated episodes.
        </p>
        <div className="flex gap-4">
          <button className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
            Get Started
          </button>
          <button className="rounded-lg border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
            Listen to Episodes
          </button>
        </div>
      </main>
    </div>
  );
}
