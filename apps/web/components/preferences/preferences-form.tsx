"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PreferencesFormProps {
  userId: string;
  initialPreferences: any;
  userEmail: string;
  feedToken: string | null;
}

export function PreferencesForm({
  userId,
  initialPreferences,
  userEmail,
  feedToken: initialFeedToken,
}: PreferencesFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state
  const [topics, setTopics] = useState<string[]>(
    initialPreferences.topics || []
  );
  const [newTopic, setNewTopic] = useState("");
  const [emailCadence, setEmailCadence] = useState(
    initialPreferences.emailCadence || "weekly"
  );
  const [voiceProvider, setVoiceProvider] = useState(
    initialPreferences.voiceConfig?.provider || "openai"
  );
  const [voiceId, setVoiceId] = useState(
    initialPreferences.voiceConfig?.voiceId || "alloy"
  );
  const [speed, setSpeed] = useState(
    initialPreferences.voiceConfig?.speed || 1.0
  );
  const [episodeDuration, setEpisodeDuration] = useState(
    initialPreferences.episodeDuration || 1200
  );
  const [includeTranscripts, setIncludeTranscripts] = useState(
    initialPreferences.includeTranscripts ?? true
  );
  const [privateFeedEnabled, setPrivateFeedEnabled] = useState(
    initialPreferences.privateFeedEnabled || false
  );
  const [feedToken, setFeedToken] = useState(initialFeedToken);

  const addTopic = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic("");
    }
  };

  const removeTopic = (topic: string) => {
    setTopics(topics.filter((t) => t !== topic));
  };

  const handleGenerateFeedToken = async () => {
    try {
      const response = await fetch("/api/user/generate-feed-token", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setFeedToken(data.token);
        setMessage({
          type: "success",
          text: "Private feed URL generated!",
        });
        router.refresh();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to generate feed token",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics,
          emailCadence,
          voiceConfig: {
            provider: voiceProvider,
            voiceId,
            speed,
          },
          episodeDuration,
          includeTranscripts,
          privateFeedEnabled,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Preferences saved successfully!" });
        router.refresh();
      } else {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to save preferences. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const feedUrl =
    feedToken &&
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/rss/${userId}?token=${feedToken}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Message */}
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Topics */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Topics of Interest
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Tell us what historical topics you&apos;re interested in. We&apos;ll
          generate episodes based on your preferences.
        </p>

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
            placeholder="e.g., Ancient Rome, WWII, Renaissance..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="button"
            onClick={addTopic}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            >
              {topic}
              <button
                type="button"
                onClick={() => removeTopic(topic)}
                className="hover:text-blue-900 dark:hover:text-blue-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Email Settings */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Email Settings
        </h2>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Cadence
          </label>
          <select
            value={emailCadence}
            onChange={(e) => setEmailCadence(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="immediate">Immediate (as episodes are ready)</option>
            <option value="daily">Daily Digest</option>
            <option value="weekly">Weekly Digest</option>
            <option value="biweekly">Bi-weekly Digest</option>
            <option value="monthly">Monthly Digest</option>
            <option value="never">Never (RSS only)</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeTranscripts}
              onChange={(e) => setIncludeTranscripts(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Include transcripts in emails
            </span>
          </label>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Voice Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Voice Provider
            </label>
            <select
              value={voiceProvider}
              onChange={(e) => setVoiceProvider(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="openai">OpenAI</option>
              <option value="elevenlabs">ElevenLabs</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Voice
            </label>
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {voiceProvider === "openai" ? (
                <>
                  <option value="alloy">Alloy (Neutral)</option>
                  <option value="echo">Echo (Male)</option>
                  <option value="fable">Fable (British)</option>
                  <option value="onyx">Onyx (Deep Male)</option>
                  <option value="nova">Nova (Female)</option>
                  <option value="shimmer">Shimmer (Soft Female)</option>
                </>
              ) : (
                <option value="21m00Tcm4TlvDq8ikWAM">Rachel</option>
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Playback Speed: {speed}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.25"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Preferred Episode Duration
            </label>
            <select
              value={episodeDuration}
              onChange={(e) => setEpisodeDuration(parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="600">10 minutes</option>
              <option value="900">15 minutes</option>
              <option value="1200">20 minutes</option>
              <option value="1500">25 minutes</option>
              <option value="1800">30 minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Private RSS Feed */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Private RSS Feed
        </h2>

        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={privateFeedEnabled}
              onChange={(e) => setPrivateFeedEnabled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Enable private RSS feed
            </span>
          </label>
          <p className="ml-6 mt-1 text-xs text-gray-600 dark:text-gray-400">
            Get a private RSS feed URL that only you can access
          </p>
        </div>

        {privateFeedEnabled && (
          <div className="space-y-4">
            {!feedToken ? (
              <button
                type="button"
                onClick={handleGenerateFeedToken}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Generate Feed URL
              </button>
            ) : (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Private Feed URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={feedUrl || ""}
                    readOnly
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(feedUrl || "");
                      setMessage({
                        type: "success",
                        text: "Feed URL copied!",
                      });
                    }}
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Copy
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Add this URL to your podcast app to get your personalized
                  episodes
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </form>
  );
}
