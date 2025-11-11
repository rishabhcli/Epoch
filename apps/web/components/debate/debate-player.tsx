'use client';

import { AudioPlayer } from '@/components/audio/audio-player';
import { useState, useEffect } from 'react';

interface DebatePlayerProps {
  episode: {
    id: string;
    title: string;
    description: string;
    audioUrl: string;
    duration?: number;
    debate: {
      id: string;
      question: string;
      position1: string;
      position2: string;
      topic: string;
    };
  };
}

interface VoteStats {
  debate: {
    question: string;
    topic: string;
  };
  results: {
    position1: {
      name: string;
      votes: number;
      percentage: number;
    };
    position2: {
      name: string;
      votes: number;
      percentage: number;
    };
    totalVotes: number;
  };
}

export function DebatePlayer({ episode }: DebatePlayerProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<1 | 2 | null>(null);
  const [stats, setStats] = useState<VoteStats | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState('');

  // Load stats on mount
  useEffect(() => {
    fetchStats();
  }, [episode.debate.id]);

  async function fetchStats() {
    try {
      const response = await fetch(`/api/debates/${episode.debate.id}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }

  async function handleVote(position: 1 | 2) {
    setIsVoting(true);
    setError('');

    try {
      const response = await fetch('/api/debates/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          debateId: episode.debate.id,
          position,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setHasVoted(true);
        setSelectedPosition(position);

        // Fetch updated stats
        await fetchStats();

        // Show unlocked episodes if any
        if (data.unlockedEpisodes?.length > 0) {
          // TODO: Show toast notification about unlocked episodes
          console.log('Unlocked episodes:', data.unlockedEpisodes);
        }
      } else {
        setError(data.error || 'Failed to record vote');
      }
    } catch (err) {
      setError('Failed to submit vote. Please try again.');
      console.error('Vote error:', err);
    } finally {
      setIsVoting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Debate Header */}
      <div className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-lg">
        <div className="mb-2 text-sm font-medium uppercase tracking-wide opacity-90">
          Historical Debate
        </div>
        <h2 className="mb-4 text-2xl font-bold">{episode.debate.question}</h2>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 rounded-lg bg-white/20 p-3 backdrop-blur-sm">
            <div className="text-xs uppercase opacity-75">Position 1</div>
            <div className="text-lg font-semibold">{episode.debate.position1}</div>
          </div>
          <div className="text-2xl font-bold opacity-75">VS</div>
          <div className="flex-1 rounded-lg bg-white/20 p-3 backdrop-blur-sm">
            <div className="text-xs uppercase opacity-75">Position 2</div>
            <div className="text-lg font-semibold">{episode.debate.position2}</div>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      <AudioPlayer
        src={episode.audioUrl}
        title={episode.title}
        duration={episode.duration}
      />

      {/* Voting Section */}
      <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
        <h3 className="mb-4 text-xl font-semibold">
          Which argument do you find more convincing?
        </h3>

        {!hasVoted ? (
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                onClick={() => handleVote(1)}
                disabled={isVoting}
                className="rounded-lg border-2 border-blue-500 bg-blue-500 px-6 py-4 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="mb-1 text-sm font-medium opacity-90">
                  Vote for Position 1
                </div>
                <div className="text-lg font-bold">{episode.debate.position1}</div>
              </button>

              <button
                onClick={() => handleVote(2)}
                disabled={isVoting}
                className="rounded-lg border-2 border-purple-500 bg-purple-500 px-6 py-4 text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="mb-1 text-sm font-medium opacity-90">
                  Vote for Position 2
                </div>
                <div className="text-lg font-bold">{episode.debate.position2}</div>
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Your vote helps other listeners explore different perspectives
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <p className="font-medium">✓ Vote Recorded</p>
              <p className="text-sm">
                You voted for:{' '}
                {selectedPosition === 1
                  ? episode.debate.position1
                  : episode.debate.position2}
              </p>
            </div>

            {stats && stats.results.totalVotes > 0 && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.results.totalVotes}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Votes
                  </p>
                </div>

                {/* Position 1 Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{episode.debate.position1}</span>
                    <span className="text-sm">
                      {stats.results.position1.votes} votes (
                      {stats.results.position1.percentage}%)
                    </span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{
                        width: `${stats.results.position1.percentage}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Position 2 Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{episode.debate.position2}</span>
                    <span className="text-sm">
                      {stats.results.position2.votes} votes (
                      {stats.results.position2.percentage}%)
                    </span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-purple-500 transition-all duration-500"
                      style={{
                        width: `${stats.results.position2.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-3 text-lg font-semibold">About This Debate</h3>
        <p className="text-gray-700 dark:text-gray-300">{episode.description}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600">
          Share Debate
        </button>
        <button className="flex-1 rounded-lg bg-gray-200 px-4 py-2 transition hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
          Suggest a Topic
        </button>
      </div>
    </div>
  );
}
