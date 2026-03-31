"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  getAudioEngine 
} from '@/lib/audio';
import { MandalaCard } from '@/components/MandalaCard';
import { AmbienceCanvas } from '@/components/AmbienceCanvas';
import { Sidebar } from '@/components/Sidebar';
import { AudioPlayerGroup } from '@/components/AudioPlayer';
import { ToastContainer, showToast } from '@/components/Toast';
import { BreathingGuide } from '@/components/BreathingGuide';
import { TimerDropdown } from '@/components/TimerDropdown';
import { SessionLayout } from '@/components/SessionLayout';
import { StartOverlay } from '@/components/StartOverlay';
import { AuroraBackground } from '@/components/AuroraBackground';
import { SaveTemplateModal } from '@/components/SaveTemplateModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CHAKRAS, AMBIENT_SOUNDS, LOOP_ELEMENTS, TIMER_PRESETS } from '@/lib/constants';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Save, Trash2, FolderHeart, Play, Pause, Clock, Maximize2, Minimize2, Wind as WindIcon, LogOut 
} from 'lucide-react';

export default function App() {
  return (
    <ErrorBoundary>
      <AyahuascaSession />
    </ErrorBoundary>
  );
}

function AyahuascaSession() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(3600); // default 1h
  const [timeLeft, setTimeLeft] = useState(3600);
  const [activeChakra, setActiveChakra] = useState(CHAKRAS[3]); // Default Heart
  const [isChakraOn, setIsChakraOn] = useState(false);
  const [chakraVolume, setChakraVolume] = useState(0.5);
  
  const [ambientVolumes, setAmbientVolumes] = useState<Record<string, number>>(
    Object.fromEntries(AMBIENT_SOUNDS.map(s => [s.id, 0]))
  );
  
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const prevVolumeRef = useRef(0.7);
  
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => { 
    setIsMounted(true); 
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    if (!hasStarted) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPlaying(p => !p);
          break;
        case 'f':
        case 'F':
          setIsFullScreen(p => !p);
          break;
        case 'Escape':
          if (isFullScreen) setIsFullScreen(false);
          break;
        case 'm':
        case 'M':
          setIsMuted(prev => {
            if (!prev) {
              prevVolumeRef.current = masterVolume;
              setMasterVolume(0);
              showToast('Volume silenciado', '🔇');
            } else {
              setMasterVolume(prevVolumeRef.current || 0.7);
              showToast('Volume restaurado', '🔊');
            }
            return !prev;
          });
          break;
        case 'b':
        case 'B':
          setBreathingActive(p => !p);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hasStarted, isFullScreen, masterVolume]);

  // Sync Master Volume with Audio Engine
  useEffect(() => {
    const engine = getAudioEngine();
    if (engine) engine.setMasterVolume(masterVolume);
  }, [masterVolume]);

  // Persistence logic
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ayaguide-templates');
      if (saved) setSavedTemplates(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load templates from localStorage", e);
    }
  }, []);

  const handleSaveTemplate = (name: string) => {
    const newTemplate = {
      id: Date.now(),
      name,
      chakraId: activeChakra.id,
      ambientVolumes,
      chakraVolume
    };
    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    try {
      localStorage.setItem('ayaguide-templates', JSON.stringify(updated));
      showToast('Modelo salvo com sucesso', '💾');
    } catch (e) {
      console.error("Failed to save to localStorage", e);
      showToast('Erro ao salvar no dispositivo', '❌');
    }
  };

  const loadTemplate = (template: any) => {
    const chakra = CHAKRAS.find(c => c.id === template.chakraId) || CHAKRAS[3];
    setActiveChakra(chakra);
    setAmbientVolumes(template.ambientVolumes);
    if (template.chakraVolume !== undefined) setChakraVolume(template.chakraVolume);
    setTimeLeft(sessionDuration); 
    setIsPlaying(true);
    setIsChakraOn(true);
    showToast(`Sessão "${template.name}" carregada`, '✨');
  };

  const deleteTemplate = (id: number) => {
    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    try {
      localStorage.setItem('ayaguide-templates', JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to update localStorage", e);
    }
  };

  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => {
          const newTime = t - 1;
          const elapsed = sessionDuration - newTime;
          // Bell every 15 minutes
          if (elapsed > 0 && elapsed % 900 === 0 && bellAudioRef.current) {
             bellAudioRef.current.currentTime = 0;
             bellAudioRef.current.volume = 0.6;
             bellAudioRef.current.play().catch(console.error);
          }
          if (newTime <= 0) {
            setIsPlaying(false);
            showToast('Sessão concluída. Namastê 🙏', '🔔');
            if (bellAudioRef.current) {
              bellAudioRef.current.currentTime = 0;
              bellAudioRef.current.volume = 0.8;
              bellAudioRef.current.play().catch(console.error);
            }
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, sessionDuration]);

  useEffect(() => {
    const engine = getAudioEngine();
    if (!engine) return;

    if (!hasStarted) return;
    
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

  const handleAmbientVolumeChange = (id: string, vol: number) => {
    setAmbientVolumes(prev => ({ ...prev, [id]: vol }));
  };

  const handleClearAll = () => {
    setIsChakraOn(false);
    setChakraVolume(0);
    setAmbientVolumes(prev => {
      const reset = { ...prev };
      Object.keys(reset).forEach(id => reset[id] = 0);
      return reset;
    });
    showToast('Ambiente limpo', '🧹');
  };

  const startExperience = () => {
    const engine = getAudioEngine();
    if (engine) {
      engine.init();
      engine.resume();
      engine.setMasterVolume(masterVolume);
    }
    setHasStarted(true);
  };

  const exitExperience = () => {
    const engine = getAudioEngine();
    if (engine) engine.stopChakra();
    setIsPlaying(false);
    setIsChakraOn(false);
    setChakraVolume(0.5);
    setAmbientVolumes(Object.fromEntries(AMBIENT_SOUNDS.map(s => [s.id, 0])));
    setTimeLeft(sessionDuration);
    setIsFullScreen(false);
    setHasStarted(false);
    setBreathingActive(false);
  };

  const activeElementIcons = AMBIENT_SOUNDS.filter(el => (ambientVolumes[el.id] || 0) > 0);

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

      <audio ref={bellAudioRef} src="https://cdn.freesound.org/previews/15/15402_45941-lq.mp3" crossOrigin="anonymous" />

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
            onChakraToggle={(type) => setIsChakraOn(type === 'on')}
            onChakraSelect={setActiveChakra}
            ambientVolumes={ambientVolumes}
            onAmbientVolumeChange={handleAmbientVolumeChange}
            onClearAll={handleClearAll}
            masterVolume={masterVolume}
            onMasterVolumeChange={setMasterVolume}
            savedTemplates={savedTemplates}
            onSaveTemplate={() => setShowSaveModal(true)}
            onLoadTemplate={loadTemplate}
            onDeleteTemplate={deleteTemplate}
            isMobile={isMobile}
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
                   setShowTimerPicker(!showTimerPicker);
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
                onClose={() => setShowTimerPicker(false)}
                onSelect={(mins) => {
                  const newSeconds = mins * 60;
                  console.log("Setting new session duration:", newSeconds, "seconds");
                  setSessionDuration(newSeconds);
                  setTimeLeft(newSeconds);
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
                    setShowTimerPicker(!showTimerPicker);
                  }}
                >
                  {formatTime(timeLeft)}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full glass border border-white/10 flex items-center justify-center group relative overflow-hidden"
                  title={isFullScreen ? "Sair da Tela Cheia" : "Modo Tela Cheia"}
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {isFullScreen ? (
                    <Minimize2 className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
                  ) : (
                    <Maximize2 className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
                  )}
                </motion.button>

                <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full glass border border-white/10 flex items-center justify-center group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <AnimatePresence mode="wait">
                  {isPlaying ? (
                    <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Pause className="w-4 h-4 md:w-5 md:h-5 text-white fill-white" /></motion.div>
                  ) : (
                    <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Play className="w-4 h-4 md:w-5 md:h-5 text-white fill-white ml-0.5" /></motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <div className="flex items-center gap-3">
               <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => {
                   setBreathingActive(!breathingActive);
                   showToast(breathingActive ? 'Guia de respiração desativado' : 'Guia de respiração ativado (4-4-6)', breathingActive ? '💨' : '🌬️');
                 }}
                 className={`hidden md:flex w-10 h-10 rounded-full border items-center justify-center transition-all ${
                   breathingActive
                     ? 'bg-white/10 border-white/30 text-white/80'
                     : 'bg-white/5 border-white/10 text-white/30 hover:text-white/60'
                 }`}
                 title="Guia de Respiração (B)"
               >
                 <WindIcon className="w-4 h-4" />
               </motion.button>

               <div className="hidden md:flex items-center gap-2 text-right">
                 <div className="text-xs font-light text-white/60 tracking-wide">
                   {activeChakra.name.split(' (')[0]}
                 </div>
                 <div className={`w-3 h-3 rounded-full ${activeChakra.color} shadow-[0_0_15px_currentColor]`} />
               </div>

               <motion.button
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.9 }}
                 onClick={exitExperience}
                 className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all"
                 title="Sair da Sessão (Esc)"
               >
                 <LogOut className="w-4 h-4" />
               </motion.button>
            </div>
            
            <div className="absolute inset-0 bg-white/[0.02] -z-10" />
          </motion.header>
        }
        content={
          <div className="w-full h-full flex items-center justify-center relative">
            <MandalaCard
              hue={activeChakra.hue}
              isPlaying={isPlaying}
              chakraId={activeChakra.id}
              chakraColor={activeChakra.palette.primary}
              chakraPalette={activeChakra.palette}
              ambientVolumes={ambientVolumes}
              isFullScreen={isFullScreen}
              onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
            />
            <BreathingGuide
              isActive={breathingActive}
              chakraColor={activeChakra.palette.primary}
              onToggle={() => setBreathingActive(!breathingActive)}
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
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
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
              onClick={() => setBreathingActive(!breathingActive)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${breathingActive ? 'bg-white/15 text-white/70' : 'bg-white/5 text-white/25'}`}
            >
              <WindIcon className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setIsFullScreen(false)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={exitExperience}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/25 hover:text-red-400 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <StartOverlay hasStarted={hasStarted} onStart={startExperience} isMounted={isMounted} />
      
      <SaveTemplateModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveTemplate}
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
