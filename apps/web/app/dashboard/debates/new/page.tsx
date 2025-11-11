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

const SUGGESTED_DEBATES = [
  {
    topic: 'French Revolution',
    question: 'Was the French Revolution ultimately worth its cost in human life?',
    position1: 'Yes - Revolutionary Change',
    position2: 'No - Excessive Violence',
  },
  {
    topic: 'Roman Empire',
    question: 'Was Julius Caesar a defender of the people or a tyrant?',
    position1: 'Defender of the People',
    position2: 'Power-Hungry Tyrant',
  },
  {
    topic: 'Industrial Revolution',
    question: 'Did the Industrial Revolution improve quality of life for workers?',
    position1: 'Yes - Economic Progress',
    position2: 'No - Worker Exploitation',
  },
  {
    topic: 'Cold War',
    question: 'Was the Cold War inevitable after World War II?',
    position1: 'Yes - Ideological Conflict',
    position2: 'No - Avoidable Tensions',
  },
  {
    topic: 'Colonialism',
    question: 'Did colonialism bring more benefit or harm to colonized nations?',
    position1: 'Development Benefits',
    position2: 'Exploitation and Harm',
  },
  {
    topic: 'American Revolution',
    question: 'Were the American colonists justified in rebelling against Britain?',
    position1: 'Yes - Fight for Freedom',
    position2: 'No - Unlawful Rebellion',
  },
];

export default function NewDebatePage() {
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [moderatorVoice, setModeratorVoice] = useState('onyx');
  const [position1Voice, setPosition1Voice] = useState('echo');
  const [position2Voice, setPosition2Voice] = useState('fable');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const router = useRouter();

  const handleSuggestedDebate = (debate: (typeof SUGGESTED_DEBATES)[0]) => {
    setTopic(debate.topic);
    setQuestion(debate.question);
  };

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setIsGenerating(true);
    setError('');
    setProgress('Starting debate generation...');

    try {
      const response = await fetch('/api/generate/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          question,
          moderatorVoice,
          position1Voice,
          position2Voice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate debate');
      }

      if (data.success && data.episode) {
        setProgress('Debate generated successfully! Redirecting...');
        setTimeout(() => {
          router.push(`/episodes/${data.episode.id}`);
        }, 1000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Debate generation error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate debate'
      );
      setIsGenerating(false);
      setProgress('');
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Create New Debate</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate an AI-powered debate exploring two sides of a historical
          question
        </p>
      </div>

      {/* Suggested Debates */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Suggested Debate Topics</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {SUGGESTED_DEBATES.map((debate, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestedDebate(debate)}
              className="rounded-lg border-2 border-gray-200 bg-white p-4 text-left transition hover:border-orange-500 hover:bg-orange-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-500 dark:hover:bg-gray-700"
            >
              <div className="mb-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                {debate.topic}
              </div>
              <div className="mb-2 font-semibold">{debate.question}</div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="rounded bg-blue-100 px-2 py-1 dark:bg-blue-900">
                  {debate.position1}
                </span>
                <span>vs</span>
                <span className="rounded bg-purple-100 px-2 py-1 dark:bg-purple-900">
                  {debate.position2}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Debate Form */}
      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Topic */}
        <div>
          <label htmlFor="topic" className="mb-2 block text-sm font-medium">
            Historical Topic <span className="text-red-500">*</span>
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., French Revolution, Industrial Revolution, Cold War"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            required
            disabled={isGenerating}
          />
        </div>

        {/* Question */}
        <div>
          <label htmlFor="question" className="mb-2 block text-sm font-medium">
            Debate Question <span className="text-red-500">*</span>
          </label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., Was Napoleon a tyrant or a reformer?"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            required
            disabled={isGenerating}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Frame as a question with two defensible positions
          </p>
        </div>

        {/* Voice Configuration */}
        <div className="space-y-4">
          <h3 className="font-semibold">Voice Configuration</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Moderator Voice */}
            <div>
              <label
                htmlFor="moderatorVoice"
                className="mb-2 block text-sm font-medium"
              >
                Moderator
              </label>
              <select
                id="moderatorVoice"
                value={moderatorVoice}
                onChange={(e) => setModeratorVoice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                disabled={isGenerating}
              >
                {VOICE_OPTIONS.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Neutral host
              </p>
            </div>

            {/* Position 1 Voice */}
            <div>
              <label
                htmlFor="position1Voice"
                className="mb-2 block text-sm font-medium"
              >
                Position 1
              </label>
              <select
                id="position1Voice"
                value={position1Voice}
                onChange={(e) => setPosition1Voice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                disabled={isGenerating}
              >
                {VOICE_OPTIONS.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                First advocate
              </p>
            </div>

            {/* Position 2 Voice */}
            <div>
              <label
                htmlFor="position2Voice"
                className="mb-2 block text-sm font-medium"
              >
                Position 2
              </label>
              <select
                id="position2Voice"
                value={position2Voice}
                onChange={(e) => setPosition2Voice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                disabled={isGenerating}
              >
                {VOICE_OPTIONS.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Second advocate
              </p>
            </div>
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
          disabled={!topic || !question || isGenerating}
          className="w-full rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? 'Generating Debate...' : 'Generate Debate'}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Generation typically takes 2-3 minutes and costs ~$0.11 in AI credits
        </p>
      </form>
    </div>
  );
}
