import React, { useEffect } from 'react';

interface BackgroundMusicProps {
  playing: boolean;
  volume: number;
}

export const BackgroundMusic = ({ playing, volume }: BackgroundMusicProps) => {
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (playing) {
        audioRef.current.play().catch(err => {
          console.log("Audio play failed:", err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing, volume]);

  return (
    <audio
      ref={audioRef}
      src="https://ik.imagekit.io/foefnjeua/%EA%B0%9C%EB%85%90%EC%86%A1%20(Remastered).mp3"
      loop
    />
  );
};
