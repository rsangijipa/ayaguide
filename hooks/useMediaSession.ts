"use client";

import { useEffect, useCallback } from 'react';
import { useSessionStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { JOURNEYS, getJourney } from '@/lib/journeys';
import { CHAKRAS } from '@/lib/constants';
import type { Chakra } from '@/lib/types';

/**
 * useMediaSession Hook
 * 
 * Sincroniza o estado da meditação com a Media Session API do navegador.
 * Permite que o usuário controle a reprodução e veja metadados (incluindo o chakra ativo)
 * diretamente na central de notificações do sistema (Android/iOS/Desktop).
 */
export function useMediaSession() {
  const {
    isPlaying,
    activeChakra,
    activeJourney,
    togglePlay,
    resetSession,
    advanceJourneyPhase,
    sessionDuration,
    timeLeft,
  } = useSessionStore(
    useShallow((s) => ({
      isPlaying: s.isPlaying,
      activeChakra: s.activeChakra,
      activeJourney: s.activeJourney,
      togglePlay: s.togglePlay,
      resetSession: s.resetSession,
      advanceJourneyPhase: s.advanceJourneyPhase,
      sessionDuration: s.sessionDuration,
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

  // 1. Handlers de Ação e Metadados
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    // Atualizar Metadados
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

    // Handlers de Ações
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => { if (!useSessionStore.getState().isPlaying) togglePlay(); }],
      ['pause', () => { if (useSessionStore.getState().isPlaying) togglePlay(); }],
      ['stop', () => resetSession()],
      ['nexttrack', handleNextPhase],
      ['previoustrack', handlePrevPhase],
    ];

    for (const [action, handler] of handlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {}
    }

    return () => {
      for (const [action] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (error) {}
      }
    };
  }, [
    activeChakra, 
    activeJourney, 
    togglePlay, 
    resetSession, 
    handleNextPhase, 
    handlePrevPhase
  ]);

  // 2. Atualizar Estado de Reprodução e Posição (Timer)
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    const mediaSession = navigator.mediaSession;
    mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    // Atualizar posição de reprodução na notificação
    const durationInSeconds = sessionDuration * 60;
    const positionInSeconds = Math.max(0, Math.min(durationInSeconds, durationInSeconds - timeLeft));

    if (!isNaN(durationInSeconds) && durationInSeconds > 0) {
      try {
        mediaSession.setPositionState({
          duration: durationInSeconds,
          playbackRate: 1,
          position: positionInSeconds,
        });
      } catch (error) {
        // Alguns browsers podem falhar se a duração for inconsistente
      }
    }
  }, [isPlaying, sessionDuration, timeLeft]);

  return null;
}
