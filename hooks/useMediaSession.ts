"use client";

import { useEffect, useCallback } from 'react';
import { useSessionStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { JOURNEYS, getJourney } from '@/lib/journeys';
import { CHAKRAS } from '@/lib/constants';
import type { Chakra } from '@/lib/types';

export function useMediaSession() {
  const {
    isPlaying,
    activeChakra,
    activeJourney,
    togglePlay,
    resetSession,
    advanceJourneyPhase,
    timeLeft,
  } = useSessionStore(
    useShallow((s) => ({
      isPlaying: s.isPlaying,
      activeChakra: s.activeChakra,
      activeJourney: s.activeJourney,
      togglePlay: s.togglePlay,
      resetSession: s.resetSession,
      advanceJourneyPhase: s.advanceJourneyPhase,
      timeLeft: s.timeLeft,
    }))
  );

  const handleNextPhase = useCallback(() => {
    if (!activeJourney) return;
    const journey = getJourney(activeJourney.journeyId);
    if (!journey) return;

    const nextIndex = activeJourney.currentPhaseIndex + 1;
    if (nextIndex < journey.phases.length) {
      const nextPhase = journey.phases[nextIndex];
      const nextChakra = (CHAKRAS as Chakra[]).find(c => c.id === nextPhase.chakraId) || activeChakra;
      
      advanceJourneyPhase({
        phaseIndex: nextIndex,
        chakra: nextChakra,
        ambientVolumes: nextPhase.ambientVolumes,
        chakraVolume: nextPhase.chakraVolume,
        breathPatternId: nextPhase.breathPatternId,
        phaseTimeLeft: nextPhase.duration,
      });
    } else {
      // End of journey or just restart? Let's say stop.
      resetSession();
    }
  }, [activeJourney, activeChakra, advanceJourneyPhase, resetSession]);

  const handlePrevPhase = useCallback(() => {
    if (!activeJourney) return;
    const journey = getJourney(activeJourney.journeyId);
    if (!journey) return;

    const prevIndex = activeJourney.currentPhaseIndex - 1;
    if (prevIndex >= 0) {
      const prevPhase = journey.phases[prevIndex];
      const prevChakra = (CHAKRAS as Chakra[]).find(c => c.id === prevPhase.chakraId) || activeChakra;
      
      advanceJourneyPhase({
        phaseIndex: prevIndex,
        chakra: prevChakra,
        ambientVolumes: prevPhase.ambientVolumes,
        chakraVolume: prevPhase.chakraVolume,
        breathPatternId: prevPhase.breathPatternId,
        phaseTimeLeft: prevPhase.duration,
      });
    } else {
      // Re-start current phase if it's the first one
      const currentPhase = journey.phases[0];
      const currentChakra = (CHAKRAS as Chakra[]).find(c => c.id === currentPhase.chakraId) || activeChakra;
      advanceJourneyPhase({
        phaseIndex: 0,
        chakra: currentChakra,
        ambientVolumes: currentPhase.ambientVolumes,
        chakraVolume: currentPhase.chakraVolume,
        breathPatternId: currentPhase.breathPatternId,
        phaseTimeLeft: currentPhase.duration,
      });
    }
  }, [activeJourney, activeChakra, advanceJourneyPhase]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    // 1. Update Playback State
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    // 2. Update Metadata
    let title = "Meditação Livre";
    let album = activeChakra?.name || "Chakra";
    let artworkUrl = `/images/chakras/${activeChakra?.id || 'root'}.png`;

    if (activeJourney) {
      const journey = getJourney(activeJourney.journeyId);
      if (journey) {
        title = journey.name;
        album = `Fase ${activeJourney.currentPhaseIndex + 1}/${activeJourney.totalPhasesCount} — ${activeChakra?.name}`;
      }
    }

    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: title,
      artist: 'AyaGuide',
      album: album,
      artwork: [
        { src: artworkUrl, sizes: '512x512', type: 'image/png' },
        { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      ]
    });

    // 3. Action Handlers
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => { if (!isPlaying) togglePlay(); }],
      ['pause', () => { if (isPlaying) togglePlay(); }],
      ['stop', () => resetSession()],
      ['nexttrack', handleNextPhase],
      ['previoustrack', handlePrevPhase],
      ['seekbackward', () => { /* Optional: Skip 10s if we want to handle internal timer */ }],
      ['seekforward', () => { /* Optional: Skip 10s */ }],
    ];

    for (const [action, handler] of handlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        console.warn(`The media session action "${action}" is not supported yet.`);
      }
    }

    // Cleanup handlers (important to avoid leaks or multiple registrations)
    return () => {
      for (const [action] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (error) {}
      }
    };
  }, [
    isPlaying, 
    activeChakra, 
    activeJourney, 
    togglePlay, 
    resetSession, 
    handleNextPhase, 
    handlePrevPhase
  ]);

  return null;
}
