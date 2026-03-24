import React, { useEffect, useRef } from 'react';
import { ASSETS } from '../assets';

interface BackgroundMusicProps {
  enabled: boolean;
}

export const BackgroundMusic = ({ enabled }: BackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(ASSETS.sounds.bgm);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.15;
    }

    if (enabled) {
      audioRef.current.play().catch(() => {
        console.log("BGM play failed - user interaction required");
      });
    } else {
      audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [enabled]);

  return null;
};
