"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useSessionStore } from '@/lib/store';
import dynamic from 'next/dynamic';
import { 
  Pause, Play, Clock, Maximize2, Minimize2, Wind as WindIcon, LogOut, ChevronDown 
} from 'lucide-react';
import { CHAKRAS, AMBIENT_SOUNDS, LOOP_ELEMENTS } from '@/lib/constants';
import { getJourney } from '@/lib/journeys';
import { getBreathingPattern } from '@/lib/breathingPatterns';
import { motion, AnimatePresence } from 'motion/react';
import { ToastContainer, showToast } from '@/components/Toast';
import { TimerDropdown } from '@/components/TimerDropdown';
import { SessionLayout } from '@/components/SessionLayout';
import { AuroraBackground } from '@/components/AuroraBackground';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { getAudioEngine } from '@/lib/audio';
import { AudioPlayerGroup } from '@/components/AudioPlayer';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { Chakra } from '@/lib/types';

// Dynamic imports for heavy components
const MandalaCard = dynamic(() => import('@/components/MandalaCard').then(m => m.MandalaCard), { ssr: false });
const AmbienceCanvas = dynamic(() => import('@/components/AmbienceCanvas').then(m => m.AmbienceCanvas), { ssr: false });
const Sidebar = dynamic(() => import('@/components/Sidebar').then(m => m.Sidebar), { ssr: false });
const BreathingGuide = dynamic(() => import('@/components/BreathingGuide').then(m => m.BreathingGuide), { ssr: false });
const BreathingPicker = dynamic(() => import('@/components/BreathingPicker').then(m => m.BreathingPicker), { ssr: false });
const SaveTemplateModal = dynamic(() => import('@/components/SaveTemplateModal').then(m => m.SaveTemplateModal), { ssr: false });
const JourneyPlayer = dynamic(() => import('@/components/JourneyPlayer').then(m => m.JourneyPlayer), { ssr: false });
const StartOverlay = dynamic(() => import('@/components/StartOverlay').then(m => m.StartOverlay), { ssr: false });

export default function App() {
  return (
    <ErrorBoundary>
      <AyahuascaSession />
    </ErrorBoundary>
  );
}

function AyahuascaSession() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const store = useSessionStore();

  // Handle Hydration for Persisted State
  useEffect(() => {
    // Check if already hydrated
    if (useSessionStore.persist.hasHydrated()) {
      setHasHydrated(true);
    } else {
      const unsub = useSessionStore.persist.onFinishHydration(() => {
        setHasHydrated(true);
      });
      return () => unsub();
    }
  }, []);

  const {
    isPlaying, sessionDuration, timeLeft, activeChakra, isChakraOn,
    chakraVolume, ambientVolumes, masterVolume, isMuted, hasStarted,
    isFullScreen, showTimerPicker, showSaveModal, breathingActive,
    savedTemplates, breathingPatternId, showBreathingPicker, 
    binauralState, binauralVolume, activeJourney, isSidebarExpanded,

    togglePlay, toggleFullscreen, setMasterVolume, toggleMute, 
    setDuration, tick, setChakra, toggleChakra, setChakraVolume, 
    setAmbientVolume, clearAllAmbients, toggleTimerPicker, 
    toggleSaveModal, toggleBreathingGuide, setBreathingPattern, 
    toggleBreathingPicker, setBinauralState, setBinauralVolume, 
    startJourney, advanceJourneyPhase, journeyPhaseTick, exitJourney,
    startExperience, addSavedTemplate, removeSavedTemplate, loadTemplate,
    setSidebarExpanded
  } = store;

  const prevVolumeRef = useRef(0.7);
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);

  // Return Loading Shell until hydrated to prevent flickering
  if (!hasHydrated) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/60">
        <motion.div 
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-bold"
        >
          Sincronizando Estado Sagrado...
        </motion.div>
      </div>
    );
  }
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile(1024);

  // Auto-collapse sidebar on mobile when session starts
  useEffect(() => {
    if (isMobile && isPlaying && isSidebarExpanded) {
      setSidebarExpanded(false);
    }
  }, [isPlaying, isMobile, isSidebarExpanded, setSidebarExpanded]);

  useEffect(() => { setIsMounted(true); }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    if (!hasStarted) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ': e.preventDefault(); togglePlay(); break;
        case 'f':
        case 'F': toggleFullscreen(); break;
        case 'Escape': if (isFullScreen) toggleFullscreen(); break;
        case 'm':
        case 'M':
          if (!isMuted) {
            prevVolumeRef.current = masterVolume;
            setMasterVolume(0);
            toggleMute();
            showToast('Volume silenciado', '🔇');
          } else {
            setMasterVolume(prevVolumeRef.current || 0.7);
            toggleMute();
            showToast('Volume restaurado', '🔊');
          }
          break;
        case 'b':
        case 'B': toggleBreathingGuide(); break;
        case 'p':
        case 'P': toggleBreathingPicker(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hasStarted, isFullScreen, isMuted, masterVolume, togglePlay, toggleFullscreen, setMasterVolume, toggleMute, toggleBreathingGuide, toggleBreathingPicker]);

  // Sync Master Volume with Audio Engine
  useEffect(() => {
    const engine = getAudioEngine();
    if (engine) engine.setMasterVolume(masterVolume);
  }, [masterVolume]);

  // Main Session Timer
  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        const newTime = timeLeft - 1;
        tick(newTime);
        const elapsed = sessionDuration - newTime;
        
        if (elapsed > 0 && elapsed % 900 === 0 && bellAudioRef.current) {
           bellAudioRef.current.currentTime = 0;
           bellAudioRef.current.volume = 0.6;
           bellAudioRef.current.play().catch(console.error);
        }

        if (newTime <= 0) {
          togglePlay();
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
  }, [isPlaying, timeLeft, sessionDuration, tick, togglePlay]);

  // Audio Engine Control
  useEffect(() => {
    const engine = getAudioEngine();
    if (!engine || !hasStarted || !activeChakra) return;
    
    if (isChakraOn || Object.values(ambientVolumes).some(v => (v as number) > 0)) {
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

  // Binaural Beats Sync
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

  // Journey Phase Timer
  useEffect(() => {
    if (!activeJourney || !isPlaying) return;

    const journey = getJourney(activeJourney.journeyId);
    if (!journey) return;

    const timer = setInterval(() => {
      const newPhaseTime = activeJourney.phaseTimeLeft - 1;

      if (newPhaseTime <= 0) {
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
      } else {
        journeyPhaseTick(newPhaseTime);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeJourney, isPlaying, exitJourney, advanceJourneyPhase, journeyPhaseTick]);

  const handleStartExperience = useCallback(() => {
    const engine = getAudioEngine();
    if (engine) {
      engine.init();
      engine.resume();
      engine.setMasterVolume(masterVolume);
    }
    startExperience();
  }, [masterVolume, startExperience]);

  const handleStartJourney = useCallback((journeyId: string) => {
    const journey = getJourney(journeyId);
    if (!journey) return;
    const firstPhase = journey.phases[0];
    const firstChakra = (CHAKRAS as Chakra[]).find(c => c.id === firstPhase.chakraId) || (CHAKRAS as Chakra[])[3];

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

    if (firstPhase.breathPatternId && !breathingActive) toggleBreathingGuide();
    if (!isPlaying) togglePlay();
    showToast(`Jornada "${journey.name}" iniciada`, journey.emoji);
  }, [breathingActive, isPlaying, setDuration, startJourney, advanceJourneyPhase, toggleBreathingGuide, togglePlay]);

  const handleAdvanceJourneyPhase = useCallback(() => {
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

  const handleExitExperience = useCallback(() => {
    const engine = getAudioEngine();
    if (engine) {
      engine.stopChakra();
      engine.stopBinaural();
    }
    if (isPlaying) togglePlay();
    clearAllAmbients();
    exitJourney();
    setBinauralState('off');
    setDuration(sessionDuration / 60);
    if (isFullScreen) toggleFullscreen();
    if (breathingActive) toggleBreathingGuide();
    window.location.reload();
  }, [isPlaying, isFullScreen, breathingActive, sessionDuration, togglePlay, clearAllAmbients, exitJourney, setBinauralState, setDuration, toggleFullscreen, toggleBreathingGuide]);

  const handleSaveTemplate = useCallback((name: string) => {
    if (!activeChakra) return;
    addSavedTemplate({
      id: Date.now(),
      name,
      chakraId: activeChakra.id,
      ambientVolumes,
      chakraVolume
    });
    toggleSaveModal();
    showToast('Modelo salvo com sucesso', '💾');
  }, [activeChakra, ambientVolumes, chakraVolume, addSavedTemplate, toggleSaveModal]);

  const activeElementIcons = useMemo(() => 
    AMBIENT_SOUNDS.filter(el => (ambientVolumes[el.id] || 0) > 0),
    [ambientVolumes]
  );

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!activeChakra) return null;

  return (
    <div 
      className="min-h-screen h-screen bg-[#020202] text-white flex overflow-hidden font-sans selection:bg-white/10 relative"
      style={{
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
        <AmbienceCanvas />
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
            isJourneyActive={activeJourney !== null}
          />
        }
        header={
          <motion.header 
            className="h-full w-full glass rounded-[24px] flex items-center justify-between px-4 md:px-8 relative backdrop-blur-2xl border border-white/5 shadow-xl"
          >
            <div className="relative">
              <button 
                 className="flex items-center gap-3 md:gap-4 group cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-2xl p-1" 
                 onClick={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   toggleTimerPicker();
                 }}
                 aria-label="Configurações de duração da sessão"
                 aria-expanded={showTimerPicker}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all flex items-center justify-center text-white/40 group-hover:text-white/80"
                >
                  <Clock className="w-5 h-5 md:w-6 md:h-6" />
                </motion.div>
                <div className="hidden md:block text-left">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 group-hover:text-white/50 transition-colors">Ciclo de Sessão</p>
                  <p className="text-xs font-light text-white/60 tracking-wider group-hover:text-white/80 transition-colors">Ajustar Duração</p>
                </div>
              </button>

              <TimerDropdown
                isOpen={showTimerPicker}
                onClose={toggleTimerPicker}
                onSelect={(mins) => {
                  setDuration(mins);
                  toggleTimerPicker();
                  showToast(`Sessão definida: ${mins}m`, '⏲️');
                }}
                currentMinutes={sessionDuration / 60}
                chakraColor={activeChakra.palette.primary}
              />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <button 
                  className="text-xl md:text-3xl font-extralight tracking-[0.2em] text-white/90 font-mono cursor-pointer hover:text-white transition-colors mr-2 select-none outline-none focus-visible:text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleTimerPicker();
                  }}
                  aria-label={`Tempo restante: ${formatTime(timeLeft)}`}
                >
                  {formatTime(timeLeft)}
                </button>

                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => toggleFullscreen()}
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full glass border border-white/10 flex items-center justify-center group relative overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-white/40"
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
                     toggleBreathingGuide();
                     const pattern = getBreathingPattern(breathingPatternId);
                     showToast(!breathingActive ? `${pattern.emoji} ${pattern.name} ativado` : 'Guia desativado', !breathingActive ? '🌬️' : '💨');
                   }}
                   className={`flex w-9 h-9 md:w-11 md:h-11 rounded-2xl border items-center justify-center transition-all outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                     breathingActive
                       ? 'bg-white/10 border-white/30 text-white/80'
                       : 'bg-white/5 border-white/10 text-white/30 hover:text-white/60'
                   }`}
                   title="Alternar Guia de Respiração (B)"
                   aria-label="Alternar Guia de Respiração"
                   aria-pressed={breathingActive}
                 >
                   <WindIcon className="w-4 h-4 md:w-5 md:h-5" />
                 </motion.button>

                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={toggleBreathingPicker}
                   className={`flex w-6 h-9 md:w-7 md:h-11 rounded-xl border items-center justify-center transition-all bg-white/5 border-white/10 text-white/20 hover:text-white/50 hover:bg-white/10 outline-none focus-visible:ring-2 focus-visible:ring-white/20`}
                   title="Escolher técnica de respiração"
                 >
                   <ChevronDown className="w-3.5 h-3.5" />
                 </motion.button>
              </div>

              <div className="w-px h-8 bg-white/10 hidden md:block mx-1" />

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg outline-none focus-visible:ring-4 focus-visible:ring-white/20 ${
                  isPlaying 
                    ? 'bg-white/10 border border-white/20' 
                    : 'bg-white text-black border border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                }`}
                aria-label={isPlaying ? 'Pausar meditação' : 'Iniciar meditação'}
              >
                <AnimatePresence mode="wait">
                  {isPlaying ? (
                    <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Pause className="w-5 md:w-6 h-5 md:h-6 text-white fill-white" /></motion.div>
                  ) : (
                    <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Play className="w-5 md:w-6 h-5 md:h-6 text-black fill-black ml-0.5" /></motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <div className="w-px h-8 bg-white/10 hidden md:block mx-1" />

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleExitExperience}
                className="w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center transition-all bg-white/5 border border-white/10 text-white/20 hover:text-red-400 hover:bg-white/10 hover:border-red-400/30 outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
                title="Sair da Sessão"
                aria-label="Sair da Sessão"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
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
            <BreathingGuide
              isActive={breathingActive}
              chakraColor={activeChakra.palette.primary}
              onToggle={toggleBreathingGuide}
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
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              aria-label={isPlaying ? "Pausar sessão" : "Iniciar sessão"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-white fill-white" /> : <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />}
            </motion.button>
            {activeElementIcons.length > 0 && (
              <div className="flex items-center gap-1 pl-2 border-l border-white/10">
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
              onClick={toggleBreathingGuide}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${breathingActive ? 'bg-white/15 text-white/70' : 'bg-white/5 text-white/25'}`}
              aria-label="Alternar Guia de Respiração"
            >
              <WindIcon className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70"
              aria-label="Sair da Tela Cheia"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handleExitExperience}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/25 hover:text-red-400 transition-all"
              aria-label="Sair da Sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <StartOverlay hasStarted={hasStarted} onStart={handleStartExperience} isMounted={isMounted} />
      
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

      <ToastContainer />
    </div>
  );
}
