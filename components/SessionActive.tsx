'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import { AmbientPlayerGroup } from '@/components/AmbientPlayer';
import { SessionHeader } from '@/components/SessionHeader';
import { SessionLayout } from '@/components/SessionLayout';
import { SessionRuntime } from '@/components/SessionRuntime';
import { ToastContainer, showToast } from '@/components/Toast';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useJourneyTimer } from '@/hooks/useJourneyTimer';
import { CHAKRAS, LOOP_ELEMENTS } from '@/lib/constants';
import { useSessionStore } from '@/lib/store';

const MandalaCard = dynamic(() => import('@/components/MandalaCard').then((m) => m.MandalaCard), { ssr: false });
const AmbienceCanvas = dynamic(() => import('@/components/AmbienceCanvas').then((m) => m.AmbienceCanvas), { ssr: false });
const Sidebar = dynamic(() => import('@/components/Sidebar').then((m) => m.Sidebar), { ssr: false });
const BreathingGuide = dynamic(() => import('@/components/BreathingGuide').then((m) => m.BreathingGuide), { ssr: false });
const BreathingPicker = dynamic(() => import('@/components/BreathingPicker').then((m) => m.BreathingPicker), { ssr: false });
const SaveTemplateModal = dynamic(() => import('@/components/SaveTemplateModal').then((m) => m.SaveTemplateModal), { ssr: false });
const JourneyPlayer = dynamic(() => import('@/components/JourneyPlayer').then((m) => m.JourneyPlayer), { ssr: false });

interface SessionActiveProps {
  onExit: () => void;
  handleStartJourney: (id: string) => void;
  handleSaveTemplate: (name: string) => void;
}

export function SessionActive({ onExit, handleStartJourney, handleSaveTemplate }: SessionActiveProps) {
  const isPlaying = useSessionStore((state) => state.isPlaying);
  const timeLeft = useSessionStore((state) => state.timeLeft);
  const sessionDuration = useSessionStore((state) => state.sessionDuration);

  const state = useSessionStore(
    useShallow((s) => ({
      activeChakra: s.activeChakra,
      isChakraOn: s.isChakraOn,
      chakraVolume: s.chakraVolume,
      ambientVolumes: s.ambientVolumes,
      masterVolume: s.masterVolume,
      isFullScreen: s.isFullScreen,
      showTimerPicker: s.showTimerPicker,
      showSaveModal: s.showSaveModal,
      breathingActive: s.breathingActive,
      savedTemplates: s.savedTemplates,
      breathingPatternId: s.breathingPatternId,
      showBreathingPicker: s.showBreathingPicker,
      focusLevel: s.focusLevel,
      activeJourney: s.activeJourney,
      binauralState: s.binauralState,
      binauralVolume: s.binauralVolume,
    }))
  );

  const actions = useSessionStore(
    useShallow((s) => ({
      togglePlay: s.togglePlay,
      toggleFullscreen: s.toggleFullscreen,
      setFullscreen: s.setFullscreen,
      setMasterVolume: s.setMasterVolume,
      setChakra: s.setChakra,
      toggleChakra: s.toggleChakra,
      setChakraVolume: s.setChakraVolume,
      setAmbientVolume: s.setAmbientVolume,
      clearAllAmbients: s.clearAllAmbients,
      toggleTimerPicker: s.toggleTimerPicker,
      toggleSaveModal: s.toggleSaveModal,
      toggleBreathingGuide: s.toggleBreathingGuide,
      setBreathingPattern: s.setBreathingPattern,
      toggleBreathingPicker: s.toggleBreathingPicker,
      setBinauralState: s.setBinauralState,
      setBinauralVolume: s.setBinauralVolume,
      exitJourney: s.exitJourney,
      removeSavedTemplate: s.removeSavedTemplate,
      loadTemplate: s.loadTemplate,
      setFocusLevel: s.setFocusLevel,
    }))
  );

  const {
    activeChakra,
    isChakraOn,
    chakraVolume,
    ambientVolumes,
    masterVolume,
    isFullScreen,
    showTimerPicker,
    showSaveModal,
    breathingActive,
    savedTemplates,
    breathingPatternId,
    showBreathingPicker,
    binauralState,
    binauralVolume,
    activeJourney,
    focusLevel,
  } = state;

  const {
    togglePlay,
    toggleFullscreen,
    setFullscreen,
    setMasterVolume,
    setChakra,
    toggleChakra,
    setChakraVolume,
    setAmbientVolume,
    clearAllAmbients,
    toggleTimerPicker,
    toggleSaveModal,
    toggleBreathingGuide,
    setBreathingPattern,
    toggleBreathingPicker,
    setBinauralState,
    setBinauralVolume,
    exitJourney,
    removeSavedTemplate,
    loadTemplate,
    setFocusLevel,
  } = actions;

  const isMobile = useIsMobile(1024);
  const { handleAdvanceJourneyPhase } = useJourneyTimer();

  if (!activeChakra) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="absolute inset-0 flex"
      style={{
        '--chakra-primary': activeChakra.palette.primary,
        '--chakra-secondary': activeChakra.palette.secondary,
        '--chakra-accent': activeChakra.palette.accent,
        '--chakra-soft': activeChakra.palette.soft,
      } as React.CSSProperties}
    >
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <AmbienceCanvas />
      </div>

      <AmbientPlayerGroup elements={LOOP_ELEMENTS} volumes={ambientVolumes} isPlaying={isPlaying} />

      <SessionLayout
        isFullScreen={isFullScreen}
        isMobileProp={isMobile}
        sidebar={
          <Sidebar
            chakras={CHAKRAS}
            activeChakra={activeChakra}
            isChakraOn={isChakraOn}
            chakraVolume={chakraVolume}
            onChakraVolumeChange={setChakraVolume}
            onChakraToggle={(type: 'on' | 'off') => {
              if ((type === 'on') !== isChakraOn) {
                toggleChakra();
              }
            }}
            onChakraSelect={setChakra}
            ambientVolumes={ambientVolumes}
            onAmbientVolumeChange={setAmbientVolume}
            onClearAll={() => {
              clearAllAmbients();
              showToast('Ambiente limpo', '\u{1F9F9}');
            }}
            masterVolume={masterVolume}
            onMasterVolumeChange={setMasterVolume}
            savedTemplates={savedTemplates}
            onSaveTemplate={toggleSaveModal}
            onLoadTemplate={loadTemplate}
            onDeleteTemplate={(id: string) => removeSavedTemplate(String(id))}
            isMobile={isMobile}
            binauralState={binauralState}
            binauralVolume={binauralVolume}
            onBinauralStateChange={setBinauralState}
            onBinauralVolumeChange={setBinauralVolume}
            onStartJourney={handleStartJourney}
            isJourneyActive={activeJourney !== null}
            focusLevel={focusLevel}
            onFocusLevelChange={setFocusLevel}
            breathingActive={breathingActive}
            onBreathingToggle={toggleBreathingGuide}
            breathingPatternId={breathingPatternId}
            onBreathingPatternChange={setBreathingPattern}
          />
        }
        header={
          <SessionHeader
            activeChakra={activeChakra}
            isFullScreen={isFullScreen}
            isPlaying={isPlaying}
            timeLeft={timeLeft}
            sessionDuration={sessionDuration}
            showTimerPicker={showTimerPicker}
            breathingActive={breathingActive}
            onToggleTimerPicker={toggleTimerPicker}
            onSelectDuration={(mins) => {
              useSessionStore.setState({
                sessionDuration: Math.round(mins),
                timeLeft: Math.round(mins) * 60,
                isPlaying: false,
              });
              toggleTimerPicker();
              showToast(`Duracao ajustada para ${mins} min`, '\u{23F3}');
            }}
            onToggleFullscreen={toggleFullscreen}
            onToggleBreathingGuide={toggleBreathingGuide}
            onToggleBreathingPicker={toggleBreathingPicker}
            onTogglePlay={togglePlay}
            onExit={onExit}
          />
        }
        content={
          <div className="relative flex h-full w-full flex-col items-center justify-center">
            <MandalaCard
              hue={activeChakra.hue}
              isPlaying={isPlaying}
              chakraId={activeChakra.id}
              chakraColor={activeChakra.palette.primary}
              chakraPalette={activeChakra.palette}
              ambientVolumes={ambientVolumes}
              isFullScreen={isFullScreen}
              onToggleFullScreen={toggleFullscreen}
            >
              <AnimatePresence>
                {activeJourney && (
                  <JourneyPlayer
                    activeJourney={activeJourney}
                    isPlaying={isPlaying}
                    onStartJourney={handleStartJourney}
                    onAdvancePhase={handleAdvanceJourneyPhase}
                    onExit={exitJourney}
                  />
                )}
              </AnimatePresence>
            </MandalaCard>

            {breathingActive && (
              <BreathingGuide
                isActive={breathingActive}
                chakraColor={activeChakra.palette.primary}
                onToggle={toggleBreathingGuide}
                patternId={breathingPatternId}
              />
            )}
          </div>
        }
      />

      <SaveTemplateModal
        isOpen={showSaveModal}
        onClose={toggleSaveModal}
        onSave={handleSaveTemplate}
        chakraColor={activeChakra.palette.primary}
      />

      <BreathingPicker
        isOpen={showBreathingPicker}
        onClose={toggleBreathingPicker}
        onSelect={(pattern) => setBreathingPattern(pattern.id)}
        currentPatternId={breathingPatternId}
        chakraColor={activeChakra.palette.primary}
      />

      <SessionRuntime
        isPlaying={isPlaying}
        timeLeft={timeLeft}
        sessionDuration={sessionDuration}
        isChakraOn={isChakraOn}
        activeChakraId={activeChakra.id}
        chakraVolume={chakraVolume}
        binauralState={binauralState}
        binauralVolume={binauralVolume}
        masterVolume={masterVolume}
        isFullScreen={isFullScreen}
        togglePlay={togglePlay}
        setFullscreen={setFullscreen}
      />

      <ToastContainer />
    </motion.div>
  );
}
