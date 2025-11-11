'use client';

import { AudioPlayer } from '@/components/audio/audio-player';
import { useState } from 'react';

interface InterviewPlayerProps {
  episode: {
    id: string;
    title: string;
    description: string;
    audioUrl: string;
    duration?: number;
    interview: {
      guestName: string;
      guestRole: string;
      guestEra: string;
      topic: string;
      questions: Array<{
        question: string;
        category: string;
      }>;
    };
  };
}

export function InterviewPlayer({ episode }: InterviewPlayerProps) {
  const [showQuestions, setShowQuestions] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <div className="space-y-6">
      {/* Guest Card */}
      <div className="rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 text-sm opacity-90">Interview with</div>
            <h2 className="mb-2 text-3xl font-bold">
              {episode.interview.guestName}
            </h2>
            <div className="text-lg opacity-90">{episode.interview.guestRole}</div>
            <div className="mt-1 text-sm opacity-75">
              {episode.interview.guestEra}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Topic</div>
            <div className="text-lg font-semibold">{episode.interview.topic}</div>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      <AudioPlayer
        src={episode.audioUrl}
        title={episode.title}
        duration={episode.duration}
      />

      {/* Interview Questions Preview */}
      <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
        <button
          onClick={() => setShowQuestions(!showQuestions)}
          className="flex w-full items-center justify-between text-left"
        >
          <h3 className="text-lg font-semibold">
            Interview Questions ({episode.interview.questions.length})
          </h3>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${showQuestions ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showQuestions && (
          <div className="mt-4 space-y-3">
            {episode.interview.questions.map((q, i) => (
              <div
                key={i}
                className="border-l-4 border-blue-500 bg-white py-2 pl-4 pr-2 dark:bg-gray-900"
              >
                <div className="mb-1 text-xs uppercase text-gray-500 dark:text-gray-400">
                  {q.category.replace('_', ' ')}
                </div>
                <div className="text-gray-700 dark:text-gray-200">
                  {q.question}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 className="mb-3 text-lg font-semibold">About This Interview</h3>
        <p className="text-gray-700 dark:text-gray-300">
          {episode.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600">
          Share Interview
        </button>
        <button className="flex-1 rounded-lg bg-gray-200 px-4 py-2 transition hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
          Request Another Guest
        </button>
      </div>
    </div>
  );
}
