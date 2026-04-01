'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useSessionStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { SessionLayout } from '@/components/SessionLayout';
import { CHAKRAS, LOOP_ELEMENTS } from '@/lib/constants';
import { AmbientPlayerGroup } from '@/components/AmbientPlayer';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useJourneyTimer } from '@/hooks/useJourneyTimer';
import { AnimatePresence, motion } from 'motion/react';
import { Pause, Play, Clock, Maximize2, Minimize2, Wind as WindIcon, LogOut, ChevronDown } from 'lucide-react';
import { ToastContainer, showToast } from '@/components/Toast';
import { TimerDropdown } from '@/components/TimerDropdown';
import { getAudioMixer } from '@/lib/audioMixer';
import { useMediaSession } from '@/hooks/useMediaSession';

// Heavy components lazily loaded inside the active session
const MandalaCard = dynamic(() => import('@/components/MandalaCard').then(m => m.MandalaCard), { ssr: false });
const AmbienceCanvas = dynamic(() => import('@/components/AmbienceCanvas').then(m => m.AmbienceCanvas), { ssr: false });
const Sidebar = dynamic(() => import('@/components/Sidebar').then(m => m.Sidebar), { ssr: false });
const BreathingGuide = dynamic(() => import('@/components/BreathingGuide').then(m => m.BreathingGuide), { ssr: false });
const BreathingPicker = dynamic(() => import('@/components/BreathingPicker').then(m => m.BreathingPicker), { ssr: false });
const SaveTemplateModal = dynamic(() => import('@/components/SaveTemplateModal').then(m => m.SaveTemplateModal), { ssr: false });
const JourneyPlayer = dynamic(() => import('@/components/JourneyPlayer').then(m => m.JourneyPlayer), { ssr: false });

// Shared Small Components
// Helper for time formatting
const formatTimeSeconds = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface SessionActiveProps {
  onExit: () => void;
  handleStartJourney: (id: string) => void;
  handleSaveTemplate: (name: string) => void;
}

/**
 * SessionIntegrator: Handles background side-effects for the active session.
 */
function SessionIntegrator() {
  const { isPlaying, sessionDuration, timeLeft, togglePlay } = useSessionStore(useShallow(s => ({
    isPlaying: s.isPlaying,
    sessionDuration: s.sessionDuration,
    timeLeft: s.timeLeft,
    togglePlay: s.togglePlay
  })));

  // Registrar controles de mídia para notificações do sistema
  useMediaSession();

  // Import hooks for side effects
  const { handleAdvanceJourneyPhase } = useJourneyTimer();
  
  // 1. Session Timer Logic (Ticking - Drift Corrected)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = React.useRef<number | null>(null);
  const initialTimeLeftRef = React.useRef<number | null>(null);
  const tick = useSessionStore(s => s.tick);

  React.useEffect(() => {
    // If timeLeft was changed manually (diff > 2s while NOT playing), reset references
    if (!isPlaying && initialTimeLeftRef.current !== null && Math.abs(initialTimeLeftRef.current - timeLeft) > 2) {
      startTimeRef.current = null;
      initialTimeLeftRef.current = null;
    }

    if (isPlaying && timeLeft > 0) {
      // Initialize reference points for the current "play" segment
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
        initialTimeLeftRef.current = timeLeft;
      }

      timerRef.current = setInterval(() => {
        if (startTimeRef.current !== null && initialTimeLeftRef.current !== null) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const newTimeLeft = Math.max(0, initialTimeLeftRef.current - elapsed);
          
          // Only update if value actually changed to prevent redundant renders
          if (newTimeLeft !== timeLeft) {
            tick(newTimeLeft);
          }
        }
      }, 500); // Check more frequently but only tick on change
    } else {
      // Reset reference points on pause/stop
      startTimeRef.current = null;
      initialTimeLeftRef.current = null;
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, timeLeft, tick]);

  // 2. Bell Logic (Session completion / progress)
  const bellAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const lastChimeRef = React.useRef(0);

  React.useEffect(() => {
    if (!isPlaying) return;
    
    // Ensure audio context is resumed on play
    const mixer = getAudioMixer();
    if (mixer) mixer.resume();

    const elapsed = sessionDuration * 60 - timeLeft;
    
    if (elapsed > 0 && elapsed % 900 === 0 && elapsed !== lastChimeRef.current && bellAudioRef.current) {
        lastChimeRef.current = elapsed;
        bellAudioRef.current.currentTime = 0;
        bellAudioRef.current.volume = 0.6;
        bellAudioRef.current.play().catch(console.error);
    }

    if (timeLeft <= 0 && isPlaying) {
      togglePlay();
      showToast('Sessão concluída. Namastê 🙏', '🔔');
      if (bellAudioRef.current) {
        bellAudioRef.current.currentTime = 0;
        bellAudioRef.current.volume = 0.8;
        bellAudioRef.current.play().catch(console.error);
      }
    }
  }, [timeLeft, isPlaying, sessionDuration, togglePlay]);

  return <audio ref={bellAudioRef} src="/sounds/mystical/singing_bowl.mp3" crossOrigin="anonymous" preload="auto" />;
}

/**
 * SessionActive: The main, heavy UI for the meditation experience.
 * Only loaded/mounted after the user clicks "Enter".
 */
export function SessionActive({ onExit, handleStartJourney, handleSaveTemplate }: SessionActiveProps) {
  // Direct selectors for high-frequency/critical state
  const isPlaying = useSessionStore(s => s.isPlaying);
  const timeLeft = useSessionStore(s => s.timeLeft);
  const sessionDuration = useSessionStore(s => s.sessionDuration);
  
  // Shallow group for the rest of the state
  const state = useSessionStore(useShallow(s => ({
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
  })));

  const {
    togglePlay,
    toggleFullscreen,
    setMasterVolume,
    setDuration,
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
  } = useSessionStore(useShallow(s => ({
    togglePlay: s.togglePlay,
    toggleFullscreen: s.toggleFullscreen,
    setMasterVolume: s.setMasterVolume,
    setDuration: s.setDuration,
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
  })));

  const {
    activeChakra, isChakraOn, chakraVolume, ambientVolumes, masterVolume, isFullScreen,
    showTimerPicker, showSaveModal, breathingActive, savedTemplates, breathingPatternId,
    showBreathingPicker, binauralState, binauralVolume, activeJourney, focusLevel
  } = state;

  const isMobile = useIsMobile(1024);
  const { handleAdvanceJourneyPhase } = useJourneyTimer();

  // ── Audio Sync Effects (all via AudioMixer) ─────────────────────────────────

  React.useEffect(() => {
    const mixer = getAudioMixer();
    if (!mixer || !activeChakra) return;
    if (isChakraOn && isPlaying) {
      mixer.resume();
      mixer.playChakra(activeChakra.id);
      mixer.setChakraVolume(chakraVolume);
    } else {
      mixer.stopChakra();
    }
  }, [isChakraOn, activeChakra, chakraVolume, isPlaying]);

  React.useEffect(() => {
    const mixer = getAudioMixer();
    if (!mixer) return;
    if (binauralState === 'off') {
      mixer.stopBinaural();
    } else if (isPlaying) {
      mixer.resume();
      mixer.playBinaural(binauralState, binauralVolume);
    } else {
      mixer.stopBinaural();
    }
  }, [binauralState, binauralVolume, isPlaying]);

  React.useEffect(() => {
    const mixer = getAudioMixer();
    if (mixer) mixer.setMasterVolume(masterVolume);
  }, [masterVolume]);

  if (!activeChakra) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="absolute inset-0 flex"
      style={{
        "--chakra-primary": activeChakra.palette.primary,
        "--chakra-secondary": activeChakra.palette.secondary,
        "--chakra-accent": activeChakra.palette.accent,
        "--chakra-soft": activeChakra.palette.soft,
      } as any}
    >
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <AmbienceCanvas />
      </div>

      <AmbientPlayerGroup
        elements={LOOP_ELEMENTS}
        volumes={ambientVolumes}
        isPlaying={isPlaying}
      />

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
            onChakraToggle={(type: 'on'|'off') => { if ((type === 'on') !== isChakraOn) toggleChakra() }}
            onChakraSelect={setChakra}
            ambientVolumes={ambientVolumes}
            onAmbientVolumeChange={setAmbientVolume}
            onClearAll={() => { clearAllAmbients(); showToast('Ambiente limpo', '🧹'); }}
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
            isJourneyActive={state.activeJourney !== null}
            focusLevel={state.focusLevel}
            onFocusLevelChange={setFocusLevel}
            breathingActive={state.breathingActive}
            onBreathingToggle={toggleBreathingGuide}
            breathingPatternId={state.breathingPatternId}
            onBreathingPatternChange={setBreathingPattern}
          />
        }
        header={
          <motion.header 
            className={`w-full glass rounded-[24px] flex items-center justify-between px-4 md:px-8 relative backdrop-blur-2xl border border-white/5 shadow-xl transition-all duration-700 ${
              isFullScreen ? 'h-14 md:h-16 mt-2' : 'h-full'
            }`}
          >
            <div className="relative">
              <button className="flex items-center gap-3 md:gap-4 group cursor-pointer" onClick={() => toggleTimerPicker()}>
                <motion.div whileHover={{ scale: 1.05 }} className="p-2 md:p-3 rounded-xl bg-white/5"><Clock className="w-5 h-5" /></motion.div>
                <div className="hidden md:block">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/30">Duração</p>
                  <p className="text-xs font-light text-white/60">Ajustar</p>
                </div>
              </button>
              <TimerDropdown
                isOpen={showTimerPicker}
                onClose={toggleTimerPicker}
                onSelect={(mins) => { 
                  // Use atomic state update to ensure UI and Logic sync instantly
                  useSessionStore.setState({ 
                    sessionDuration: Math.round(mins), 
                    timeLeft: Math.round(mins) * 60,
                    isPlaying: false
                  });
                  toggleTimerPicker();
                  showToast(`Duração alterada para ${mins} min`, '⏳');
                }}
                currentMinutes={sessionDuration}
                chakraColor={activeChakra.palette.primary}
              />
            </div>

            <div className="flex items-center gap-4">
              <button 
                className="text-xl md:text-3xl font-extralight tracking-widest font-mono" 
                onClick={() => toggleTimerPicker()}
              >
                {formatTimeSeconds(timeLeft)}
              </button>
              
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => toggleFullscreen()}
                className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center group relative overflow-hidden"
              >
                {isFullScreen ? (
                  <Minimize2 className="w-4 h-4 text-white/70" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-white/70" />
                )}
              </motion.button>
            </div>

            <div className="flex items-center gap-2 md:gap-6">
              <div className="flex items-center gap-1.5 md:gap-2">
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => toggleBreathingGuide()}
                   className={`flex w-9 h-9 md:w-11 md:h-11 rounded-2xl border items-center justify-center transition-all ${
                     breathingActive
                       ? 'bg-white/10 border-white/30 text-white/80'
                       : 'bg-white/5 border-white/10 text-white/30 hover:text-white/60'
                   }`}
                 >
                   <WindIcon className="w-4 h-4 md:w-5 md:h-5" />
                 </motion.button>

                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={toggleBreathingPicker}
                   className={`flex w-6 h-9 md:w-7 md:h-11 rounded-xl border items-center justify-center transition-all bg-white/5 border-white/10 text-white/20 hover:text-white/50 hover:bg-white/10`}
                 >
                   <ChevronDown className="w-3.5 h-3.5" />
                 </motion.button>
              </div>

              <div className="w-px h-8 bg-white/10 hidden md:block mx-1" />

              <motion.button whileHover={{ scale: 1.1 }} onClick={togglePlay} className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all ${isPlaying ? 'bg-white/10' : 'bg-white text-black'}`}>
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={onExit} className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 text-white/20 hover:text-red-400">
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.header>
        }
        content={
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <MandalaCard 
              hue={activeChakra.hue} isPlaying={isPlaying} chakraId={activeChakra.id}
              chakraColor={activeChakra.palette.primary} chakraPalette={activeChakra.palette}
              ambientVolumes={ambientVolumes} isFullScreen={isFullScreen} onToggleFullScreen={toggleFullscreen}
            >
              <AnimatePresence>
                {activeJourney && (
                  <JourneyPlayer
                    activeJourney={activeJourney} isPlaying={isPlaying}
                    onStartJourney={handleStartJourney} onAdvancePhase={handleAdvanceJourneyPhase} onExit={exitJourney}
                  />
                )}
              </AnimatePresence>
            </MandalaCard>
            <BreathingGuide isActive={breathingActive} chakraColor={activeChakra.palette.primary} onToggle={toggleBreathingGuide} patternId={breathingPatternId} />
          </div>
        }
      />
      
      <SaveTemplateModal isOpen={showSaveModal} onClose={toggleSaveModal} onSave={handleSaveTemplate} chakraColor={activeChakra.palette.primary} />
      <BreathingPicker isOpen={showBreathingPicker} onClose={toggleBreathingPicker} onSelect={(pattern) => setBreathingPattern(pattern.id)} currentPatternId={breathingPatternId} chakraColor={activeChakra.palette.primary} />
      <SessionIntegrator />
      <ToastContainer />
    </motion.div>
  );
}
