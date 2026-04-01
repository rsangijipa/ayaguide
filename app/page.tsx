"use client";

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import { AuroraBackground } from '@/components/AuroraBackground';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { HeroDecoration } from '@/components/HeroDecoration';
import { LandingHero } from '@/components/LandingHero';
import { LoadingMandala } from '@/components/LoadingMandala';
import { ToastContainer, showToast } from '@/components/Toast';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { getAudioMixer } from '@/lib/audioMixer';
import { CHAKRAS } from '@/lib/constants';
import { getJourney } from '@/lib/journeys';
import { useSessionStore } from '@/lib/store';
import type { Chakra } from '@/lib/types';

// Heavy active session components - defer everything.
const SessionActive = dynamic(() => import('@/components/SessionActive').then((m) => m.SessionActive), {
  loading: () => <LoadingMandala />,
  ssr: false,
});

export default function App() {
  // Register the Service Worker for PWA support.
  useServiceWorker();

  return (
    <ErrorBoundary>
      <AyahuascaSession />
    </ErrorBoundary>
  );
}

function AyahuascaSession() {
  const { activeChakra, hasStarted } = useSessionStore(
    useShallow((s) => ({
      activeChakra: s.activeChakra,
      hasStarted: s.hasStarted,
    }))
  );

  const {
    togglePlay,
    startExperience,
    resetSession,
    addSavedTemplate,
    toggleSaveModal,
    startJourney,
    advanceJourneyPhase,
    setBreathingActive,
    setDuration,
  } = useSessionStore(
    useShallow((s) => ({
      togglePlay: s.togglePlay,
      startExperience: s.startExperience,
      resetSession: s.resetSession,
      addSavedTemplate: s.addSavedTemplate,
      toggleSaveModal: s.toggleSaveModal,
      startJourney: s.startJourney,
      advanceJourneyPhase: s.advanceJourneyPhase,
      setBreathingActive: s.setBreathingActive,
      setDuration: s.setDuration,
    }))
  );

  const triggerHaptic = useCallback((pattern: number | number[] = 10) => {
    if (typeof window !== 'undefined' && 'navigator' in window && window.navigator.vibrate) {
      try {
        // Some browsers require explicit user activation or a specific context.
        window.navigator.vibrate(pattern);
      } catch {
        // Ignore haptics silently in unsupported environments.
      }
    }
  }, []);

  const handleStartExperience = useCallback(() => {
    const mixer = getAudioMixer();
    if (mixer) {
      mixer.init();
      mixer.resume();
    }
    triggerHaptic([15, 50, 15]);
    startExperience();
  }, [startExperience, triggerHaptic]);

  const handleStartJourney = useCallback((journeyId: string) => {
    const journey = getJourney(journeyId);
    if (!journey) return;

    const firstPhase = journey.phases[0];
    const firstChakra =
      (CHAKRAS as Chakra[]).find((chakra) => chakra.id === firstPhase.chakraId) || (CHAKRAS as Chakra[])[3];

    setDuration(Math.ceil(journey.totalDuration / 60));
    startJourney({
      journeyId,
      currentPhaseIndex: 0,
      phaseTimeLeft: firstPhase.duration,
      totalPhasesCount: journey.phases.length,
    });

    advanceJourneyPhase({
      phaseIndex: 0,
      chakra: firstChakra,
      ambientVolumes: firstPhase.ambientVolumes,
      chakraVolume: firstPhase.chakraVolume,
      breathPatternId: firstPhase.breathPatternId,
      phaseTimeLeft: firstPhase.duration,
    });

    setBreathingActive(Boolean(firstPhase.breathPatternId));
    if (!useSessionStore.getState().isPlaying) {
      togglePlay();
    }

    triggerHaptic(20);
    showToast(`Jornada "${journey.name}" iniciada`, journey.emoji);
  }, [advanceJourneyPhase, setBreathingActive, setDuration, startJourney, togglePlay, triggerHaptic]);

  const handleExitExperience = useCallback(() => {
    const mixer = getAudioMixer();
    if (mixer) {
      mixer.stopChakra();
      mixer.stopBinaural();
      mixer.stopAll();
    }
    resetSession();
    showToast('Ate a proxima jornada. Namaste.', '\u{1F311}');
  }, [resetSession]);

  const handleSaveTemplate = useCallback((name: string) => {
    if (!activeChakra) return;

    addSavedTemplate({
      id: Date.now(),
      name,
      chakraId: activeChakra.id,
      ambientVolumes: useSessionStore.getState().ambientVolumes,
      chakraVolume: useSessionStore.getState().chakraVolume,
    });
    toggleSaveModal();
    showToast('Modelo salvo com sucesso', '\u{1F4BE}');
  }, [activeChakra, addSavedTemplate, toggleSaveModal]);

  if (!activeChakra) return null;

  return (
    <div className="relative min-h-screen h-screen overflow-hidden bg-[#020202] font-sans text-white selection:bg-white/10">
      <AuroraBackground
        activeChakraHue={activeChakra.hue}
        ambientVolumes={useSessionStore.getState().ambientVolumes}
        isPlaying={useSessionStore.getState().isPlaying}
      />

      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <motion.div
            key="landing"
            exit={{ opacity: 0, filter: 'blur(20px)', transition: { duration: 1.2 } }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="absolute inset-x-0 bottom-0 top-0 z-[2] bg-gradient-to-t from-[#020202] via-transparent to-transparent" />
            <HeroDecoration />
            <LandingHero onStart={handleStartExperience} />
          </motion.div>
        ) : (
          <SessionActive
            key="active-session"
            onExit={handleExitExperience}
            handleStartJourney={handleStartJourney}
            handleSaveTemplate={handleSaveTemplate}
          />
        )}
      </AnimatePresence>

      <ToastContainer />
    </div>
  );
}
