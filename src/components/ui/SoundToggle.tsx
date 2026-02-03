'use client';

import { useState, useEffect } from 'react';
import { soundEffects } from '@/lib/sounds';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';

interface SoundToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function SoundToggle({ className = '', showLabel = true }: SoundToggleProps) {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(0.3);

  useEffect(() => {
    // Load saved settings
    setEnabled(soundEffects.isEnabled());
    setVolume(soundEffects.getVolume());
  }, []);

  const toggleSound = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    soundEffects.setEnabled(newEnabled);
    
    // Play a test sound when enabling
    if (newEnabled) {
      soundEffects.play('click');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundEffects.setVolume(newVolume);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={toggleSound}
        className={`p-2 rounded-lg transition-all ${
          enabled 
            ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30' 
            : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
        }`}
        title={enabled ? 'ปิดเสียง' : 'เปิดเสียง'}
      >
        {enabled ? (
          <SpeakerWaveIcon className="w-5 h-5" />
        ) : (
          <SpeakerXMarkIcon className="w-5 h-5" />
        )}
      </button>

      {showLabel && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {enabled ? 'เปิดเสียง' : 'ปิดเสียง'}
          </span>
          
          {enabled && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          )}
        </div>
      )}
    </div>
  );
}
