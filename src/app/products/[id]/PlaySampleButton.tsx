'use client';

import { usePlayerStore } from '@/stores/usePlayerStore';
import { Button } from '@/components/ui/Button';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

interface PlaySampleButtonProps {
  track: {
    id: string;
    title: string;
    artist: string;
    coverImage: string;
    sampleAudioUrl: string;
  };
}

export function PlaySampleButton({ track }: PlaySampleButtonProps) {
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();
  
  const isCurrentTrack = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const handleClick = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      setTrack(track);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="lg"
      className="flex-1 md:flex-none"
    >
      {isCurrentlyPlaying ? (
        <>
          <PauseIcon className="w-5 h-5 mr-2" />
          หยุดฟัง
        </>
      ) : (
        <>
          <PlayIcon className="w-5 h-5 mr-2" />
          ฟังตัวอย่าง
        </>
      )}
    </Button>
  );
}
