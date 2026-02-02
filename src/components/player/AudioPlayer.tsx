'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { formatDuration } from '@/lib/utils';

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    togglePlay,
    setVolume,
    setCurrentTime,
    setDuration,
    reset,
    pause,
  } = usePlayerStore();

  // Sync audio element with state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle loaded metadata
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Handle track end
  const handleEnded = () => {
    pause();
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // Don't render if no track
  if (!currentTrack) return null;

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentTrack.sampleAudioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Persistent player bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-none md:w-64">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                <Image
                  src={currentTrack.coverImage}
                  alt={currentTrack.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="flex gap-0.5">
                      <span className="w-1 h-4 bg-white rounded-full animate-pulse" />
                      <span className="w-1 h-4 bg-white rounded-full animate-pulse delay-75" style={{ animationDelay: '0.1s' }} />
                      <span className="w-1 h-4 bg-white rounded-full animate-pulse delay-150" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-white font-medium truncate text-sm">
                  {currentTrack.title}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            {/* Controls - Center */}
            <div className="hidden md:flex flex-col items-center gap-1 flex-1 max-w-xl">
              {/* Play/Pause button */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform shadow-lg"
              >
                {isPlaying ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5 ml-0.5" />
                )}
              </button>

              {/* Progress bar */}
              <div className="flex items-center gap-2 w-full">
                <span className="text-xs text-gray-400 w-10 text-right tabular-nums">
                  {formatDuration(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 cursor-pointer"
                />
                <span className="text-xs text-gray-400 w-10 tabular-nums">
                  {formatDuration(duration)}
                </span>
              </div>
            </div>

            {/* Mobile Play Button */}
            <button
              onClick={togglePlay}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform shadow-lg"
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5 ml-0.5" />
              )}
            </button>

            {/* Volume & Close */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Volume - Desktop only */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {volume === 0 ? (
                    <SpeakerXMarkIcon className="w-5 h-5" />
                  ) : (
                    <SpeakerWaveIcon className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 cursor-pointer"
                />
              </div>

              {/* Close button */}
              <button
                onClick={reset}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
