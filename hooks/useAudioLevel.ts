'use client';

import { useState, useEffect, useRef } from 'react';
import { getAudioMixer } from '@/lib/audioMixer';

/**
 * Hook to share the getFrequencyData loop between multiple visual components.
 * By unifying this, we prevent multiple overlapping RequestAnimationFrame loops.
 */
export function useAudioLevel(isPlaying: boolean) {
  const [audioLevel, setAudioLevel] = useState(0);
  const freqDataRef = useRef(new Uint8Array(32));
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const engine = getAudioMixer();
    if (!engine) return;

    const getLevels = () => {
      if (isPlaying) {
        engine.getFrequencyData(freqDataRef.current);
        const level = freqDataRef.current.reduce((a, b) => a + b, 0) / 32 / 255;
        setAudioLevel(level);
      } else {
        setAudioLevel(0);
      }
      rafId.current = requestAnimationFrame(getLevels);
    };

    rafId.current = requestAnimationFrame(getLevels);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isPlaying]);

  return audioLevel;
}
