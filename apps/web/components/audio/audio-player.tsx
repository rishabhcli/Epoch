"use client";

import { useRef, useState, useEffect } from "react";

interface AudioPlayerProps {
  src: string;
  title: string;
  duration?: number;
}

export function AudioPlayer({ src, title, duration }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setAudioDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(
      0,
      Math.min(audio.duration, audio.currentTime + seconds)
    );
  };

  const changePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);

    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = nextRate;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          skip(30);
          break;
        case "ArrowDown":
          e.preventDefault();
          skip(-30);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying]);

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Progress bar */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={audioDuration}
          value={currentTime}
          onChange={handleSeek}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
          style={{
            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(currentTime / audioDuration) * 100}%, #e5e7eb ${(currentTime / audioDuration) * 100}%, #e5e7eb 100%)`,
          }}
          aria-label="Seek audio position"
        />
        <div className="mt-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(audioDuration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Skip backward 10s */}
          <button
            onClick={() => skip(-10)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Skip backward 10 seconds"
            title="← Skip backward 10s"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
              />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
            aria-label={isPlaying ? "Pause" : "Play"}
            title="Space to play/pause"
          >
            {isPlaying ? (
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Skip forward 10s */}
          <button
            onClick={() => skip(10)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Skip forward 10 seconds"
            title="→ Skip forward 10s"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
              />
            </svg>
          </button>

          {/* Playback speed */}
          <button
            onClick={changePlaybackRate}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label={`Playback speed: ${playbackRate}x`}
            title="Change playback speed"
          >
            {playbackRate}x
          </button>
        </div>

        {/* Download button */}
        <a
          href={src}
          download={`${title}.mp3`}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          aria-label="Download episode"
          title="Download MP3"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </a>
      </div>

      {/* Keyboard shortcuts help */}
      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <details className="text-sm text-gray-600 dark:text-gray-400">
          <summary className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
            Keyboard shortcuts
          </summary>
          <ul className="mt-2 space-y-1 pl-4">
            <li>
              <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">
                Space
              </kbd>{" "}
              - Play/Pause
            </li>
            <li>
              <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">
                ←
              </kbd>{" "}
              - Skip backward 10s
            </li>
            <li>
              <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">
                →
              </kbd>{" "}
              - Skip forward 10s
            </li>
            <li>
              <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">
                ↑
              </kbd>{" "}
              - Skip forward 30s
            </li>
            <li>
              <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">
                ↓
              </kbd>{" "}
              - Skip backward 30s
            </li>
          </ul>
        </details>
      </div>
    </div>
  );
}
