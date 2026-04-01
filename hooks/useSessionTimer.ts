'use client';

import { useEffect, useRef } from 'react';
import { useSessionStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';

/**
 * useSessionTimer
 * Custom hook to manage the meditation session timer accurately.
 * Uses a timestamp-based approach (Date.now()) instead of simple decrements
 * to avoid drift in non-active browser tabs.
 */
export function useSessionTimer() {
  const { isPlaying, timeLeft, tick, sessionDuration } = useSessionStore(
    useShallow((state) => ({
      isPlaying: state.isPlaying,
      timeLeft: state.timeLeft,
      tick: state.tick,
      sessionDuration: state.sessionDuration,
    }))
  );

  const lastTickRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    lastTickRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);

      if (delta >= 1) {
        const newTimeLeft = Math.max(0, timeLeft - delta);
        tick(newTimeLeft);
        lastTickRef.current = now - ((now - lastTickRef.current) % 1000);
      }
    }, 500); // Check every 500ms for responsiveness

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, timeLeft, tick]);

  // Handle session complete (you could add a callback here)
  useEffect(() => {
    if (timeLeft <= 0 && isPlaying) {
      // Session finished logic could go here or in page.tsx
    }
  }, [timeLeft, isPlaying]);

  return { timeLeft, isPlaying, sessionDuration };
}
