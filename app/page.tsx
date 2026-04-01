"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { getAudioEngine } from '@/lib/audio';
import { MandalaCard } from '@/components/MandalaCard';
import { AmbienceCanvas } from '@/components/AmbienceCanvas';
import { Sidebar } from '@/components/Sidebar';
import { AudioPlayerGroup } from '@/components/AudioPlayer';
import { ToastContainer, showToast } from '@/components/Toast';
import { BreathingGuide } from '@/components/BreathingGuide';
import { BreathingPicker } from '@/components/BreathingPicker';
import { TimerDropdown } from '@/components/TimerDropdown';
import { SessionLayout } from '@/components/SessionLayout';
import { StartOverlay } from '@/components/StartOverlay';
import { AuroraBackground } from '@/components/AuroraBackground';
import { SaveTemplateModal } from '@/components/SaveTemplateModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { JourneyPlayer } from '@/components/JourneyPlayer';
import { CHAKRAS, AMBIENT_SOUNDS, LOOP_ELEMENTS } from '@/lib/constants';
import { getJourney } from '@/lib/journeys';
import { getBreathingPattern } from '@/lib/breathingPatterns';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pause, Play, Clock, Maximize2, Minimize2, Wind as WindIcon, LogOut, ChevronDown 
} from 'lucide-react';
import { SessionProvider, useSession } from '@/lib/sessionContext';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { Chakra } from '@/lib/types';

export default function App() {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <AyahuascaSession />
      </SessionProvider>
    </ErrorBoundary>
  );
}

function AyahuascaSession() {
  const { state, dispatch } = useSession();
  const {
    isPlaying,
    sessionDuration,
    timeLeft,
    activeChakra,
    isChakraOn,
    chakraVolume,
    ambientVolumes,
    masterVolume,
    isMuted,
    hasStarted,
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
  } = state;

  const prevVolumeRef = useRef(0.7);
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile(1024);

  useEffect(() => { 
    setIsMounted(true); 
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    if (!hasStarted) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          dispatch({ type: 'TOGGLE_PLAY' });
          break;
        case 'f':
        case 'F':
          dispatch({ type: 'TOGGLE_FULLSCREEN' });
          break;
        case 'Escape':
          if (isFullScreen) dispatch({ type: 'TOGGLE_FULLSCREEN' });
          break;
        case 'm':
        case 'M':
          if (!isMuted) {
            prevVolumeRef.current = masterVolume;
            dispatch({ type: 'SET_MASTER_VOLUME', payload: 0 });
            dispatch({ type: 'TOGGLE_MUTE' });
            showToast('Volume silenciado', '🔇');
          } else {
            dispatch({ type: 'SET_MASTER_VOLUME', payload: prevVolumeRef.current || 0.7 });
            dispatch({ type: 'TOGGLE_MUTE' });
            showToast('Volume restaurado', '🔊');
          }
          break;
        case 'b':
        case 'B':
          dispatch({ type: 'TOGGLE_BREATHING_GUIDE' });
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hasStarted, isFullScreen, masterVolume, isMuted, dispatch]);

  // Sync Master Volume with Audio Engine
  useEffect(() => {
    const engine = getAudioEngine();
    if (engine) engine.setMasterVolume(masterVolume);
  }, [masterVolume]);

  const handleSaveTemplate = (name: string) => {
    if (!activeChakra) return;
    dispatch({
      type: 'ADD_SAVED_TEMPLATE',
      payload: {
        id: Date.now(),
        name,
        chakraId: activeChakra.id,
        ambientVolumes,
        chakraVolume
      }
    });
    showToast('Modelo salvo com sucesso', '💾');
  };

  const loadTemplate = (template: import('@/lib/types').SavedTemplate) => {
    dispatch({ type: 'LOAD_TEMPLATE', payload: template });
    dispatch({ type: 'SET_DURATION', payload: sessionDuration / 60 });
    if (!isPlaying) dispatch({ type: 'TOGGLE_PLAY' });
    showToast(`Sessão "${template.name}" carregada`, '✨');
  };

  const deleteTemplate = (id: number | string) => {
    dispatch({ type: 'REMOVE_SAVED_TEMPLATE', payload: String(id) });
  };

  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        const newTime = timeLeft - 1;
        dispatch({ type: 'TICK', payload: newTime });

        const elapsed = sessionDuration - newTime;
        // Bell every 15 minutes
        if (elapsed > 0 && elapsed % 900 === 0 && bellAudioRef.current) {
           bellAudioRef.current.currentTime = 0;
           bellAudioRef.current.volume = 0.6;
           bellAudioRef.current.play().catch(console.error);
        }

        if (newTime <= 0) {
          dispatch({ type: 'TOGGLE_PLAY' });
          showToast('Sessão concluída. Namastê 🙏', '🔔');
          if (bellAudioRef.current) {
            bellAudioRef.current.currentTime = 0;
            bellAudioRef.current.volume = 0.8;
            bellAudioRef.current.play().catch(console.error);
          }
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, sessionDuration, dispatch]);

  useEffect(() => {
    const engine = getAudioEngine();
    if (!engine || !hasStarted || !activeChakra) return;
    
    if (isChakraOn || Object.values(ambientVolumes).some(v => v > 0)) {
      engine.init();
      engine.resume();
    }

    if (isChakraOn && isPlaying) {
      engine.playChakra(activeChakra.id);
      engine.setChakraVolume(chakraVolume);
    } else {
      engine.stopChakra();
    }
  }, [isChakraOn, activeChakra, chakraVolume, ambientVolumes, isPlaying, hasStarted]);

  // ===== Binaural Beats Sync =====
  useEffect(() => {
    const engine = getAudioEngine();
    if (!engine || !hasStarted) return;
    if (binauralState === 'off') {
      engine.stopBinaural();
    } else if (isPlaying) {
      engine.playBinaural(binauralState, binauralVolume);
    } else {
      engine.stopBinaural();
    }
  }, [binauralState, binauralVolume, isPlaying, hasStarted]);

  // ===== Journey Phase Timer =====
  useEffect(() => {
    if (!activeJourney || !isPlaying) return;

    const journey = getJourney(activeJourney.journeyId);
    if (!journey) return;

    const timer = setInterval(() => {
      const newPhaseTime = activeJourney.phaseTimeLeft - 1;

      if (newPhaseTime <= 0) {
        // Advance to next phase
        const nextIndex = activeJourney.currentPhaseIndex + 1;
        if (nextIndex >= journey.phases.length) {
          // Journey complete
          dispatch({ type: 'EXIT_JOURNEY' });
          showToast('Jornada concluída! Namastê 🙏', '✨');
          return;
        }

        const nextPhase = journey.phases[nextIndex];
        const nextChakra = (CHAKRAS as Chakra[]).find(c => c.id === nextPhase.chakraId);
        if (nextChakra) {
          dispatch({
            type: 'ADVANCE_JOURNEY_PHASE',
            payload: {
              phaseIndex: nextIndex,
              chakra: nextChakra,
              ambientVolumes: nextPhase.ambientVolumes,
              chakraVolume: nextPhase.chakraVolume,
              breathPatternId: nextPhase.breathPatternId,
              phaseTimeLeft: nextPhase.duration,
            }
          });
          showToast(nextPhase.message, journey.emoji);
        }
      } else {
        dispatch({ type: 'JOURNEY_PHASE_TICK', payload: newPhaseTime });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeJourney, isPlaying, dispatch]);

  // ===== Journey Start Handler =====
  const handleStartJourney = useCallback((journeyId: string) => {
    const journey = getJourney(journeyId);
    if (!journey) return;

    const firstPhase = journey.phases[0];
    const firstChakra = (CHAKRAS as Chakra[]).find(c => c.id === firstPhase.chakraId);
    if (!firstChakra) return;

    // Set the session duration to match journey total
    dispatch({ type: 'SET_DURATION', payload: Math.ceil(journey.totalDuration / 60) });

    // Start journey tracking
    dispatch({
      type: 'START_JOURNEY',
      payload: {
        journeyId,
        currentPhaseIndex: 0,
        phaseTimeLeft: firstPhase.duration,
        totalPhasesCount: journey.phases.length,
      }
    });

    // Apply first phase
    dispatch({
      type: 'ADVANCE_JOURNEY_PHASE',
      payload: {
        phaseIndex: 0,
        chakra: firstChakra,
        ambientVolumes: firstPhase.ambientVolumes,
        chakraVolume: firstPhase.chakraVolume,
        breathPatternId: firstPhase.breathPatternId,
        phaseTimeLeft: firstPhase.duration,
      }
    });

    // Enable breathing if pattern set
    if (firstPhase.breathPatternId && !breathingActive) {
      dispatch({ type: 'TOGGLE_BREATHING_GUIDE' });
    }

    // Start playing
    if (!isPlaying) dispatch({ type: 'TOGGLE_PLAY' });

    showToast(`Jornada "${journey.name}" iniciada`, journey.emoji);
  }, [dispatch, breathingActive, isPlaying]);

  const handleAdvanceJourneyPhase = useCallback(() => {
    if (!activeJourney) return;
    const journey = getJourney(activeJourney.journeyId);
    if (!journey) return;

    const nextIndex = activeJourney.currentPhaseIndex + 1;
    if (nextIndex >= journey.phases.length) {
      dispatch({ type: 'EXIT_JOURNEY' });
      showToast('Jornada concluída! Namastê 🙏', '✨');
      return;
    }

    const nextPhase = journey.phases[nextIndex];
    const nextChakra = (CHAKRAS as Chakra[]).find(c => c.id === nextPhase.chakraId);
    if (nextChakra) {
      dispatch({
        type: 'ADVANCE_JOURNEY_PHASE',
        payload: {
          phaseIndex: nextIndex,
          chakra: nextChakra,
          ambientVolumes: nextPhase.ambientVolumes,
          chakraVolume: nextPhase.chakraVolume,
          breathPatternId: nextPhase.breathPatternId,
          phaseTimeLeft: nextPhase.duration,
        }
      });
      showToast(nextPhase.message, journey.emoji);
    }
  }, [activeJourney, dispatch]);

  const handleExitJourney = useCallback(() => {
    dispatch({ type: 'EXIT_JOURNEY' });
    showToast('Jornada encerrada', '🛑');
  }, [dispatch]);

  const startExperience = () => {
    const engine = getAudioEngine();
    if (engine) {
      engine.init();
      engine.resume();
      engine.setMasterVolume(masterVolume);
    }
    dispatch({ type: 'START_EXPERIENCE' });
  };

  const exitExperience = () => {
    const engine = getAudioEngine();
    if (engine) {
      engine.stopChakra();
      engine.stopBinaural();
    }
    if (isPlaying) dispatch({ type: 'TOGGLE_PLAY' });
    dispatch({ type: 'CLEAR_ALL_AMBIENTS' });
    dispatch({ type: 'EXIT_JOURNEY' });
    dispatch({ type: 'SET_BINAURAL_STATE', payload: 'off' });
    dispatch({ type: 'SET_DURATION', payload: sessionDuration / 60 });
    if (isFullScreen) dispatch({ type: 'TOGGLE_FULLSCREEN' });
    if (breathingActive) dispatch({ type: 'TOGGLE_BREATHING_GUIDE' });
    window.location.reload();
  };

  const activeElementIcons = AMBIENT_SOUNDS.filter(el => (ambientVolumes[el.id] || 0) > 0);

  if (!activeChakra) return null;

  return (
    <div 
      className="min-h-screen h-screen bg-[#020202] text-white flex overflow-hidden font-sans selection:bg-white/10 relative"
      style={{
           // @ts-ignore
           "--chakra-primary": activeChakra.palette.primary,
           "--chakra-secondary": activeChakra.palette.secondary,
           "--chakra-accent": activeChakra.palette.accent,
           "--chakra-soft": activeChakra.palette.soft,
      } as any}
    >
      <AuroraBackground 
        activeChakraHue={activeChakra.hue} 
        ambientVolumes={ambientVolumes} 
        isPlaying={isPlaying} 
      />

      <div className="fixed inset-0 pointer-events-none z-[1]">
        <AmbienceCanvas volumes={ambientVolumes} chakraColor={activeChakra.palette.primary} />
      </div>

      <AudioPlayerGroup 
        elements={LOOP_ELEMENTS}
        volumes={ambientVolumes}
        isPlaying={isPlaying}
        loopDuration={14400}
      />

      <audio ref={bellAudioRef} src="/sounds/mystical/singing_bowl.mp3" crossOrigin="anonymous" />

      <SessionLayout
        isFullScreen={isFullScreen}
        isMobileProp={isMobile}
        sidebar={
          <Sidebar
            chakras={CHAKRAS}
            activeChakra={activeChakra}
            isChakraOn={isChakraOn}
            chakraVolume={chakraVolume}
            onChakraVolumeChange={(v) => dispatch({ type: 'SET_CHAKRA_VOLUME', payload: v })}
            onChakraToggle={(type) => { if ((type === 'on') !== isChakraOn) dispatch({ type: 'TOGGLE_CHAKRA' }) }}
            onChakraSelect={(c) => dispatch({ type: 'SET_CHAKRA', payload: c })}
            ambientVolumes={ambientVolumes}
            onAmbientVolumeChange={(id, vol) => dispatch({ type: 'SET_AMBIENT_VOLUME', payload: { id, volume: vol } })}
            onClearAll={() => { dispatch({ type: 'CLEAR_ALL_AMBIENTS' }); showToast('Ambiente limpo', '🧹'); }}
            masterVolume={masterVolume}
            onMasterVolumeChange={(v) => dispatch({ type: 'SET_MASTER_VOLUME', payload: v })}
            savedTemplates={savedTemplates}
            onSaveTemplate={() => dispatch({ type: 'TOGGLE_SAVE_MODAL' })}
            onLoadTemplate={loadTemplate}
            onDeleteTemplate={deleteTemplate}
            isMobile={isMobile}
            binauralState={binauralState}
            binauralVolume={binauralVolume}
            onBinauralStateChange={(s) => dispatch({ type: 'SET_BINAURAL_STATE', payload: s })}
            onBinauralVolumeChange={(v) => dispatch({ type: 'SET_BINAURAL_VOLUME', payload: v })}
            onStartJourney={handleStartJourney}
            isJourneyActive={activeJourney !== null}
          />
        }
        header={
          <motion.header 
            className="h-full w-full glass rounded-[24px] flex items-center justify-between px-4 md:px-8 relative backdrop-blur-2xl border border-white/5 shadow-xl"
          >
            <div className="relative">
              <div 
                 className="flex items-center gap-3 md:gap-4 group cursor-pointer select-none" 
                 onClick={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   dispatch({ type: 'TOGGLE_TIMER_PICKER' });
                 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all flex items-center justify-center text-white/40 group-hover:text-white/80"
                >
                  <Clock className="w-5 h-5 md:w-6 md:h-6" />
                </motion.div>
                <div className="hidden md:block">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 group-hover:text-white/50 transition-colors">Ciclo de Sessão</p>
                  <p className="text-xs font-light text-white/60 tracking-wider group-hover:text-white/80 transition-colors">Ajustar Duração</p>
                </div>
              </div>

              <TimerDropdown
                isOpen={showTimerPicker}
                onClose={() => dispatch({ type: 'TOGGLE_TIMER_PICKER' })}
                onSelect={(mins) => {
                  dispatch({ type: 'SET_DURATION', payload: mins });
                  dispatch({ type: 'TOGGLE_TIMER_PICKER' });
                  showToast(`Sessão definida: ${mins}m`, '⏲️');
                }}
                currentMinutes={sessionDuration / 60}
                chakraColor={activeChakra.palette.primary}
              />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div 
                  className="text-xl md:text-3xl font-extralight tracking-[0.2em] text-white/90 font-mono cursor-pointer hover:text-white transition-colors mr-2 select-none"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dispatch({ type: 'TOGGLE_TIMER_PICKER' });
                  }}
                >
                  {formatTime(timeLeft)}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => dispatch({ type: 'TOGGLE_FULLSCREEN' })}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full glass border border-white/10 flex items-center justify-center group relative overflow-hidden"
                  title={isFullScreen ? "Sair da Tela Cheia" : "Modo Tela Cheia"}
                  aria-label={isFullScreen ? "Sair da Tela Cheia" : "Modo Tela Cheia"}
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {isFullScreen ? (
                    <Minimize2 className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
                  ) : (
                    <Maximize2 className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
                  )}
                </motion.button>
            </div>

            <div className="flex items-center gap-2 md:gap-6">
              <div className="flex items-center gap-1.5 md:gap-2">
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => {
                     dispatch({ type: 'TOGGLE_BREATHING_GUIDE' });
                     const pattern = getBreathingPattern(breathingPatternId);
                     showToast(!breathingActive ? `${pattern.emoji} ${pattern.name} ativado` : 'Guia desativado', !breathingActive ? '🌬️' : '💨');
                   }}
                   className={`flex w-9 h-9 md:w-11 md:h-11 rounded-2xl border items-center justify-center transition-all ${
                     breathingActive
                       ? 'bg-white/10 border-white/30 text-white/80'
                       : 'bg-white/5 border-white/10 text-white/30 hover:text-white/60'
                   }`}
                   title="Alternar Guia de Respiração (B)"
                   aria-label="Alternar Guia de Respiração"
                 >
                   <WindIcon className="w-4 h-4 md:w-5 md:h-5" />
                 </motion.button>

                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => dispatch({ type: 'TOGGLE_BREATHING_PICKER' })}
                   className={`flex w-6 h-9 md:w-7 md:h-11 rounded-xl border items-center justify-center transition-all bg-white/5 border-white/10 text-white/20 hover:text-white/50 hover:bg-white/10`}
                   title="Escolher técnica de respiração"
                 >
                   <ChevronDown className="w-3.5 h-3.5" />
                 </motion.button>
              </div>

              <div className="w-px h-8 bg-white/10 hidden md:block mx-1" />

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => dispatch({ type: 'TOGGLE_PLAY' })}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                  isPlaying 
                    ? 'bg-white/10 border border-white/20' 
                    : 'bg-white text-black border border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                }`}
                aria-label={isPlaying ? 'Pausar' : 'Iniciar'}
              >
                <AnimatePresence mode="wait">
                  {isPlaying ? (
                    <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Pause className="w-5 md:w-6 h-5 md:h-6 text-white fill-white" /></motion.div>
                  ) : (
                    <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Play className="w-5 md:w-6 h-5 md:h-6 text-black fill-black ml-0.5" /></motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.header>
        }
        content={
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <MandalaCard 
              hue={activeChakra.hue}
              isPlaying={isPlaying}
              chakraId={activeChakra.id}
              chakraColor={activeChakra.palette.primary}
              chakraPalette={activeChakra.palette}
              ambientVolumes={ambientVolumes}
              isFullScreen={isFullScreen}
              onToggleFullScreen={() => dispatch({ type: 'TOGGLE_FULLSCREEN' })}
            >
              <AnimatePresence>
                {activeJourney && (
                  <JourneyPlayer
                    activeJourney={activeJourney}
                    isPlaying={isPlaying}
                    onStartJourney={handleStartJourney}
                    onAdvancePhase={handleAdvanceJourneyPhase}
                    onExit={handleExitJourney}
                  />
                )}
              </AnimatePresence>
            </MandalaCard>
            <BreathingGuide
              isActive={breathingActive}
              chakraColor={activeChakra.palette.primary}
              onToggle={() => dispatch({ type: 'TOGGLE_BREATHING_GUIDE' })}
              patternId={breathingPatternId}
            />
          </div>
        }
      />

      <AnimatePresence>
        {isFullScreen && hasStarted && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10"
          >
            <span className="text-lg font-extralight tracking-[0.15em] text-white/70 font-mono">
              {formatTime(timeLeft)}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => dispatch({ type: 'TOGGLE_PLAY' })}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              aria-label={isPlaying ? "Pausar sessão" : "Iniciar sessão"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-white fill-white" /> : <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />}
            </motion.button>
            {activeElementIcons.length > 0 && (
              <div className="flex items-center gap-1 pl-2 border-l border-white/10">
                {/* @ts-ignore */}
                {activeElementIcons.slice(0, 5).map(el => {
                  const Icon = el.icon;
                  return <Icon key={el.id} className="w-3.5 h-3.5 text-white/40" />;
                })}
                {activeElementIcons.length > 5 && (
                  <span className="text-[9px] text-white/30 font-mono ml-1">+{activeElementIcons.length - 5}</span>
                )}
              </div>
            )}
            <div className={`w-2.5 h-2.5 rounded-full ${activeChakra.color} shadow-[0_0_8px_currentColor] ml-1`} />
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => dispatch({ type: 'TOGGLE_BREATHING_GUIDE' })}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${breathingActive ? 'bg-white/15 text-white/70' : 'bg-white/5 text-white/25'}`}
              aria-label="Alternar Guia de Respiração"
            >
              <WindIcon className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => dispatch({ type: 'TOGGLE_FULLSCREEN' })}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70"
              aria-label="Sair da Tela Cheia"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={exitExperience}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/25 hover:text-red-400 transition-all"
              aria-label="Sair da Sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <StartOverlay hasStarted={hasStarted} onStart={startExperience} isMounted={isMounted} />
      
      <SaveTemplateModal
        isOpen={showSaveModal}
        onClose={() => dispatch({ type: 'TOGGLE_SAVE_MODAL' })}
        onSave={handleSaveTemplate}
        chakraColor={activeChakra.palette.primary}
      />
      
      <BreathingPicker
        isOpen={showBreathingPicker}
        onClose={() => dispatch({ type: 'TOGGLE_BREATHING_PICKER' })}
        onSelect={(pattern) => dispatch({ type: 'SET_BREATHING_PATTERN', payload: pattern.id })}
        currentPatternId={breathingPatternId}
        chakraColor={activeChakra.palette.primary}
      />

      <ToastContainer />
    </div>
  );
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
