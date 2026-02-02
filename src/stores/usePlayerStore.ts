import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Track {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  sampleAudioUrl: string;
}

interface PlayerState {
  // State
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;

  // Actions
  setTrack: (track: Track) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentTrack: null,
      isPlaying: false,
      volume: 0.7,
      currentTime: 0,
      duration: 0,

      // Actions
      setTrack: (track) => {
        const { currentTrack } = get();
        // If same track, just toggle play
        if (currentTrack?.id === track.id) {
          set({ isPlaying: true });
        } else {
          // New track
          set({
            currentTrack: track,
            isPlaying: true,
            currentTime: 0,
            duration: 0,
          });
        }
      },

      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),

      reset: () =>
        set({
          currentTrack: null,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
        }),
    }),
    {
      name: 'r9club-player',
      partialize: (state) => ({
        volume: state.volume,
      }),
    }
  )
);
