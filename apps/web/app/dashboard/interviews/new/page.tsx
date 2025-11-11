'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const VOICE_OPTIONS = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced' },
  { id: 'echo', name: 'Echo', description: 'Warm and engaging' },
  { id: 'fable', name: 'Fable', description: 'Expressive and dramatic' },
  { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative' },
  { id: 'nova', name: 'Nova', description: 'Bright and energetic' },
  { id: 'shimmer', name: 'Shimmer', description: 'Clear and articulate' },
] as const;

const SUGGESTED_GUESTS = [
  {
    name: 'Albert Einstein',
    role: 'Physicist',
    topic: 'Theory of Relativity',
    era: 'Early 20th Century',
  },
  {
    name: 'Cleopatra VII',
    role: 'Pharaoh of Egypt',
    topic: 'Ancient Egyptian Politics',
    era: 'Ancient Egypt',
  },
  {
    name: 'Leonardo da Vinci',
    role: 'Renaissance Polymath',
    topic: 'Art and Innovation',
    era: 'Renaissance',
  },
  {
    name: 'Marie Curie',
    role: 'Physicist and Chemist',
    topic: 'Discovery of Radium',
    era: 'Early 20th Century',
  },
  {
    name: 'Marcus Aurelius',
    role: 'Roman Emperor and Philosopher',
    topic: 'Stoic Philosophy',
    era: 'Ancient Rome',
  },
  {
    name: 'Ada Lovelace',
    role: 'Mathematician',
    topic: 'Computer Programming',
    era: '19th Century',
  },
];

export default function NewInterviewPage() {
  const [guestName, setGuestName] = useState('');
  const [topic, setTopic] = useState('');
  const [angle, setAngle] = useState('');
  const [hostVoice, setHostVoice] = useState('onyx');
  const [guestVoice, setGuestVoice] = useState('echo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const router = useRouter();

  const handleSuggestedGuest = (guest: typeof SUGGESTED_GUESTS[0]) => {
    setGuestName(guest.name);
    setTopic(guest.topic);
    setAngle(`Exploring ${guest.role.toLowerCase()}'s life and contributions during the ${guest.era}`);
  };

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setIsGenerating(true);
    setError('');
    setProgress('Starting interview generation...');

    try {
      const response = await fetch('/api/generate/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName,
          topic: topic || undefined,
          angle: angle || undefined,
          hostVoice,
          guestVoice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate interview');
      }

      if (data.success && data.episode) {
        setProgress('Interview generated successfully! Redirecting...');
        setTimeout(() => {
          router.push(`/episodes/${data.episode.id}`);
        }, 1000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Interview generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate interview');
      setIsGenerating(false);
      setProgress('');
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Create New Interview</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate an AI-powered interview with a historical figure
        </p>
      </div>

      {/* Suggested Guests */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Suggested Guests</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {SUGGESTED_GUESTS.map((guest) => (
            <button
              key={guest.name}
              onClick={() => handleSuggestedGuest(guest)}
              className="rounded-lg border-2 border-gray-200 bg-white p-4 text-left transition hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 dark:hover:bg-gray-700"
            >
              <div className="mb-1 font-semibold">{guest.name}</div>
              <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                {guest.role}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {guest.era}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interview Form */}
      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Guest Name */}
        <div>
          <label
            htmlFor="guestName"
            className="mb-2 block text-sm font-medium"
          >
            Historical Figure <span className="text-red-500">*</span>
          </label>
          <input
            id="guestName"
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="e.g., Marie Curie, Marcus Aurelius, Ada Lovelace"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            required
            disabled={isGenerating}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter the name of any historical figure you'd like to interview
          </p>
        </div>

        {/* Topic */}
        <div>
          <label htmlFor="topic" className="mb-2 block text-sm font-medium">
            Topic Focus (optional)
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Discovery of Radium, Stoic Philosophy, Renaissance Art"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            disabled={isGenerating}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Leave blank for a broad overview of their life and work
          </p>
        </div>

        {/* Angle */}
        <div>
          <label htmlFor="angle" className="mb-2 block text-sm font-medium">
            Interview Angle (optional)
          </label>
          <input
            id="angle"
            type="text"
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
            placeholder="e.g., Personal struggles, Leadership lessons, Modern parallels"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            disabled={isGenerating}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Unique perspective or focus for the conversation
          </p>
        </div>

        {/* Voice Configuration */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Host Voice */}
          <div>
            <label
              htmlFor="hostVoice"
              className="mb-2 block text-sm font-medium"
            >
              Host Voice
            </label>
            <select
              id="hostVoice"
              value={hostVoice}
              onChange={(e) => setHostVoice(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
              disabled={isGenerating}
            >
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} - {voice.description}
                </option>
              ))}
            </select>
          </div>

          {/* Guest Voice */}
          <div>
            <label
              htmlFor="guestVoice"
              className="mb-2 block text-sm font-medium"
            >
              Guest Voice
            </label>
            <select
              id="guestVoice"
              value={guestVoice}
              onChange={(e) => setGuestVoice(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
              disabled={isGenerating}
            >
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} - {voice.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Progress Message */}
        {isGenerating && progress && (
          <div className="rounded-lg bg-blue-50 p-4 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm">{progress}</p>
            </div>
            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              This may take 2-3 minutes. Please don't close this page.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!guestName || isGenerating}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? 'Generating Interview...' : 'Generate Interview'}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Generation typically takes 2-3 minutes and costs ~$0.10 in AI credits
        </p>
      </form>
    </div>
  );
}
