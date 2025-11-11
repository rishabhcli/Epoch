'use client';

import { AudioPlayer } from '@/components/audio/audio-player';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdventurePlayerProps {
  journey: {
    id: string;
    adventureId: string;
    currentNode: {
      id: string;
      title: string;
      nodeType: string;
      endingType?: string | null;
      episode: {
        id: string;
        title: string;
        audioUrl: string;
        duration?: number | null;
      };
      choices: Array<{
        id: string;
        text: string;
        description: string;
        consequences: string;
      }>;
    };
    path: Array<{
      nodeId: string;
      choiceText: string;
      timestamp: string;
    }>;
    isCompleted: boolean;
  };
  adventure: {
    title: string;
    description: string;
    era?: string | null;
  };
}

export function AdventurePlayer({ journey, adventure }: AdventurePlayerProps) {
  const [hasFinishedListening, setHasFinishedListening] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const isDecisionNode = journey.currentNode.nodeType === 'DECISION';
  const isEndingNode = journey.currentNode.nodeType === 'ENDING';

  async function handleChoice(choiceId: string) {
    setIsChoosing(true);
    setError('');

    try {
      const response = await fetch(`/api/adventures/journey/${journey.id}/choose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choiceId }),
      });

      const data = await response.json();

      if (data.success && data.nextEpisode) {
        // Navigate to next episode
        router.push(`/episodes/${data.nextEpisode.id}`);
        router.refresh();
      } else {
        setError(data.error || 'Failed to process choice');
        setIsChoosing(false);
      }
    } catch (err) {
      setError('Failed to submit choice. Please try again.');
      console.error('Choice error:', err);
      setIsChoosing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Adventure Header */}
      <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white shadow-lg">
        <div className="mb-2 text-sm font-medium uppercase tracking-wide opacity-90">
          Choose Your Own Adventure
        </div>
        <h2 className="mb-2 text-2xl font-bold">{adventure.title}</h2>
        {adventure.era && (
          <div className="text-sm opacity-90">{adventure.era}</div>
        )}
      </div>

      {/* Current Progress */}
      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-semibold">Your Journey</h4>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {journey.path.length} {journey.path.length === 1 ? 'choice' : 'choices'} made
          </span>
        </div>

        {journey.path.length > 0 ? (
          <div className="space-y-1 text-sm">
            {journey.path.slice(-3).map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-gray-600 dark:text-gray-300"
              >
                <span className="mt-1 text-gray-400">→</span>
                <span>{step.choiceText}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your journey begins...
          </p>
        )}

        <div className="mt-2 flex items-center gap-2 rounded bg-white px-3 py-2 dark:bg-gray-900">
          <span className="text-indigo-500">●</span>
          <span className="font-medium">{journey.currentNode.title}</span>
          <span className="ml-auto text-xs uppercase text-gray-500 dark:text-gray-400">
            {journey.currentNode.nodeType}
          </span>
        </div>
      </div>

      {/* Audio Player */}
      <AudioPlayer
        src={journey.currentNode.episode.audioUrl}
        title={journey.currentNode.episode.title}
        duration={journey.currentNode.episode.duration || undefined}
      />

      {/* Choices or Ending */}
      {isDecisionNode && !isEndingNode && journey.currentNode.choices.length > 0 && (
        <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 p-6 dark:from-gray-800 dark:to-gray-700">
          <h3 className="mb-4 text-xl font-semibold">What do you do?</h3>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {journey.currentNode.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                disabled={isChoosing}
                className="w-full rounded-lg border-2 border-indigo-200 bg-white p-4 text-left transition hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-indigo-500 dark:hover:bg-gray-700"
              >
                <div className="mb-1 font-semibold text-lg">{choice.text}</div>
                <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                  {choice.description}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  → {choice.consequences}
                </div>
              </button>
            ))}
          </div>

          {!hasFinishedListening && (
            <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Finish listening to see all choices
            </p>
          )}
        </div>
      )}

      {/* Ending */}
      {isEndingNode && (
        <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-6 dark:border-purple-800 dark:bg-purple-900/20">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-3xl">
              {journey.currentNode.endingType === 'victory' && '🏆'}
              {journey.currentNode.endingType === 'defeat' && '💔'}
              {journey.currentNode.endingType === 'neutral' && '⚖️'}
              {journey.currentNode.endingType === 'bittersweet' && '🌓'}
              {!journey.currentNode.endingType && '🎭'}
            </span>
            <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              The End
            </h3>
          </div>

          <p className="mb-4 text-gray-700 dark:text-gray-300">
            You've completed this adventure! Your journey took you through{' '}
            {journey.path.length + 1} episodes, and your choices led you to this{' '}
            {journey.currentNode.endingType || 'unique'} ending.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => router.push(`/adventures/${journey.adventureId}`)}
              className="w-full rounded-lg bg-purple-600 px-6 py-3 text-white transition hover:bg-purple-700"
            >
              Play Again with Different Choices
            </button>
            <button
              onClick={() => router.push('/adventures')}
              className="w-full rounded-lg bg-gray-200 px-6 py-3 transition hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Explore More Adventures
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
