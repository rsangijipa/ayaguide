'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSessionStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { getJourney } from '@/lib/journeys';
import { CHAKRAS } from '@/lib/constants';
import { showToast } from '@/components/Toast';
import type { Chakra } from '@/lib/types';

export function useJourneyTimer() {
  const { 
    activeJourney, isPlaying, advanceJourneyPhase, 
    journeyPhaseTick, exitJourney 
  } = useSessionStore(
    useShallow((state) => ({
      activeJourney: state.activeJourney,
      isPlaying: state.isPlaying,
      advanceJourneyPhase: state.advanceJourneyPhase,
      journeyPhaseTick: state.journeyPhaseTick,
      exitJourney: state.exitJourney,
    }))
  );

  const lastTickRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleAdvance = useCallback(() => {
    if (!activeJourney) return;
    const journey = getJourney(activeJourney.journeyId);
    if (!journey) return;

    const nextIndex = activeJourney.currentPhaseIndex + 1;
    if (nextIndex >= journey.phases.length) {
      exitJourney();
      showToast('Jornada concluída! Namastê 🙏', '✨');
      return;
    }

    const nextPhase = journey.phases[nextIndex];
    const nextChakra = (CHAKRAS as Chakra[]).find(c => c.id === nextPhase.chakraId) || (CHAKRAS as Chakra[])[3];
    
    advanceJourneyPhase({
      phaseIndex: nextIndex,
      chakra: nextChakra,
      ambientVolumes: nextPhase.ambientVolumes,
      chakraVolume: nextPhase.chakraVolume,
      breathPatternId: nextPhase.breathPatternId,
      phaseTimeLeft: nextPhase.duration,
    });
    showToast(nextPhase.message, journey.emoji);
  }, [activeJourney, exitJourney, advanceJourneyPhase]);

  useEffect(() => {
    if (!activeJourney || !isPlaying) {
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
        const newPhaseTime = Math.max(0, activeJourney.phaseTimeLeft - delta);
        
        if (newPhaseTime <= 0) {
          handleAdvance();
        } else {
          journeyPhaseTick(newPhaseTime);
        }
        
        lastTickRef.current = now - ((now - lastTickRef.current) % 1000);
      }
    }, 500);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeJourney, isPlaying, handleAdvance, journeyPhaseTick]);

  return { activeJourney, handleAdvanceJourneyPhase: handleAdvance };
}
