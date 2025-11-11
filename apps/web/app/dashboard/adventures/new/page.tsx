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

const SUGGESTED_ADVENTURES = [
  {
    concept: 'Roman Senator during Caesar\'s Rise',
    historicalContext:
      'You are a Roman senator in 49 BCE as Julius Caesar crosses the Rubicon. The Republic is at a crossroads. Do you support Caesar\'s bid for power, defend the traditional Republic, or try to negotiate peace? Your choices will determine Rome\'s future and your own fate.',
    era: 'Ancient Rome, 49 BCE',
  },
  {
    concept: 'French Revolutionary in 1789',
    historicalContext:
      'Paris, 1789. The Bastille has fallen and revolution sweeps through France. As a citizen caught in the storm, you must navigate between moderate reformers, radical Jacobins, and royalist sympathizers. Each choice could mean glory, exile, or the guillotine.',
    era: 'French Revolution, 1789',
  },
  {
    concept: 'Colonial American During the Revolution',
    historicalContext:
      'It\'s 1775, and tensions between the American colonies and Britain are at a breaking point. As a colonial merchant, you must decide whether to join the Patriots, remain loyal to the Crown, or try to stay neutral in an increasingly divided land.',
    era: 'American Revolution, 1775',
  },
  {
    concept: 'Mongol Warrior in Genghis Khan\'s Army',
    historicalContext:
      'You are a warrior in Genghis Khan\'s army during the early 13th century conquest of Central Asia. Your tactical decisions in battle, treatment of conquered peoples, and loyalty to the Khan will shape your destiny across the steppes of Asia.',
    era: 'Mongol Empire, 1220',
  },
];

export default function NewAdventurePage() {
  const [concept, setConcept] = useState('');
  const [historicalContext, setHistoricalContext] = useState('');
  const [narratorVoice, setNarratorVoice] = useState('nova');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const router = useRouter();

  const handleSuggestedAdventure = (adventure: (typeof SUGGESTED_ADVENTURES)[0]) => {
    setConcept(adventure.concept);
    setHistoricalContext(adventure.historicalContext);
  };

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setIsGenerating(true);
    setError('');
    setProgress('Starting adventure generation...');

    try {
      const response = await fetch('/api/generate/adventure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept,
          historicalContext,
          narratorVoice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate adventure');
      }

      if (data.success && data.adventure) {
        setProgress('Adventure generated successfully! Redirecting...');
        setTimeout(() => {
          router.push(`/adventures/${data.adventure.id}`);
        }, 1000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Adventure generation error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate adventure'
      );
      setIsGenerating(false);
      setProgress('');
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Create New Adventure</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate a branching narrative adventure with multiple paths and endings
        </p>
      </div>

      {/* Warning */}
      <div className="mb-8 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium">Generation takes 5-10 minutes</p>
            <p className="mt-1">
              Creating an adventure generates 8-12 episodes with full scripts and audio.
              This process costs approximately $0.50 in AI credits. Please be patient!
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Adventures */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Suggested Adventures</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {SUGGESTED_ADVENTURES.map((adventure, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestedAdventure(adventure)}
              className="rounded-lg border-2 border-gray-200 bg-white p-4 text-left transition hover:border-indigo-500 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-500 dark:hover:bg-gray-700"
            >
              <div className="mb-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                {adventure.era}
              </div>
              <div className="font-semibold">{adventure.concept}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Adventure Form */}
      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Concept */}
        <div>
          <label htmlFor="concept" className="mb-2 block text-sm font-medium">
            Adventure Concept <span className="text-red-500">*</span>
          </label>
          <input
            id="concept"
            type="text"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="e.g., Roman Senator during Caesar's Rise"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            required
            disabled={isGenerating}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Who is the protagonist and what is their situation?
          </p>
        </div>

        {/* Historical Context */}
        <div>
          <label
            htmlFor="historicalContext"
            className="mb-2 block text-sm font-medium"
          >
            Historical Context <span className="text-red-500">*</span>
          </label>
          <textarea
            id="historicalContext"
            value={historicalContext}
            onChange={(e) => setHistoricalContext(e.target.value)}
            placeholder="Describe the historical setting, key events, major figures, and the stakes of the decisions..."
            rows={6}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            required
            disabled={isGenerating}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Provide historical background and context (50-1000 characters)
          </p>
        </div>

        {/* Narrator Voice */}
        <div>
          <label
            htmlFor="narratorVoice"
            className="mb-2 block text-sm font-medium"
          >
            Narrator Voice
          </label>
          <select
            id="narratorVoice"
            value={narratorVoice}
            onChange={(e) => setNarratorVoice(e.target.value)}
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
              This may take 5-10 minutes as we generate all episodes. Please don't close this page.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!concept || !historicalContext || isGenerating}
          className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? 'Generating Adventure...' : 'Generate Adventure'}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Generation typically takes 5-10 minutes and costs ~$0.50 in AI credits
        </p>
      </form>
    </div>
  );
}
