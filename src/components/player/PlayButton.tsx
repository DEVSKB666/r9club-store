'use client';

import { usePlayerStore } from '@/stores/usePlayerStore';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

interface PlayButtonProps {
  track: {
    id: string;
    title: string;
    artist: string;
    coverImage: string;
    sampleAudioUrl: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PlayButton({ track, size = 'md', className = '' }: PlayButtonProps) {
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();

  const isCurrentTrack = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCurrentTrack) {
      togglePlay();
    } else {
      setTrack(track);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        sizeClasses[size],
        'flex items-center justify-center rounded-full',
        'bg-green-500 hover:bg-green-400 text-black',
        'shadow-lg transition-all duration-200 hover:scale-105',
        isCurrentlyPlaying && 'animate-pulse-glow',
        className
      )}
      aria-label={isCurrentlyPlaying ? 'Pause' : 'Play sample'}
    >
      {isCurrentlyPlaying ? (
        <PauseIcon className={iconSizes[size]} />
      ) : (
        <PlayIcon className={cn(iconSizes[size], 'ml-0.5')} />
      )}
    </button>
  );
}
