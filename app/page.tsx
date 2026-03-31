"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Music, Wind, CloudRain, Bird, Bell, ChevronRight, Settings2, Sparkles, LayoutGrid, Timer, LogOut } from 'lucide-react';
import { getAudioEngine } from '@/lib/audio';
import { MandalaCard } from '@/components/MandalaCard';
import { AmbienceCanvas } from '@/components/AmbienceCanvas';
import { ChakraCard } from '@/components/ChakraCard';
import { Sidebar } from '@/components/Sidebar';
import { AudioPlayerGroup, AudioPlayerElement } from '@/components/AudioPlayer';
import { AMBIENT_ELEMENTS } from '@/lib/ambientElements';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Save, Trash2, FolderHeart } from 'lucide-react';

const CHAKRAS = [
  { 
    id: 'root', 
    name: 'Básico (Muladhara)', 
    frequency: 396, 
    hue: 0, 
    color: 'bg-red-500',
    palette: { primary: '#ef4444', secondary: '#f87171', accent: '#fca5a5', soft: 'rgba(239, 68, 68, 0.15)' }
  },
  { 
    id: 'sacral', 
    name: 'Sacral (Svadhisthana)', 
    frequency: 417, 
    hue: 30, 
    color: 'bg-orange-400',
    palette: { primary: '#fb923c', secondary: '#fdba74', accent: '#fed7aa', soft: 'rgba(251, 146, 60, 0.15)' }
  },
  { 
    id: 'solar', 
    name: 'Plexo Solar (Manipura)', 
    frequency: 528, 
    hue: 60, 
    color: 'bg-yellow-400',
    palette: { primary: '#facc15', secondary: '#fde047', accent: '#fef3c7', soft: 'rgba(250, 204, 21, 0.15)' }
  },
  { 
    id: 'heart', 
    name: 'Cardíaco (Anahata)', 
    frequency: 639, 
    hue: 120, 
    color: 'bg-green-400',
    palette: { primary: '#4ade80', secondary: '#86efac', accent: '#bbf7d0', soft: 'rgba(74, 222, 128, 0.15)' }
  },
  { 
    id: 'throat', 
    name: 'Laríngeo (Vishuddha)', 
    frequency: 741, 
    hue: 210, 
    color: 'bg-blue-400',
    palette: { primary: '#60a5fa', secondary: '#93c5fd', accent: '#bfdbfe', soft: 'rgba(96, 165, 250, 0.15)' }
  },
  { 
    id: 'thirdeye', 
    name: 'Frontal (Ajna)', 
    frequency: 260, 
    hue: 260, 
    color: 'bg-indigo-400',
    palette: { primary: '#818cf8', secondary: '#a5b4fc', accent: '#c7d2fe', soft: 'rgba(129, 140, 248, 0.15)' }
  },
  { 
    id: 'crown', 
    name: 'Coronário (Sahasrara)', 
    frequency: 963, 
    hue: 280, 
    color: 'bg-purple-400',
    palette: { primary: '#c084fc', secondary: '#d8b4fe', accent: '#e9d5ff', soft: 'rgba(192, 132, 252, 0.15)' }
  },
];

const AMBIENT_SOUNDS = AMBIENT_ELEMENTS;

// Map AMBIENT_ELEMENTS to AudioPlayerElement format for the loop system
const LOOP_ELEMENTS: AudioPlayerElement[] = AMBIENT_ELEMENTS.map(el => ({
  id: el.id,
  name: el.name,
  url: el.url
}));

export default function AyahuascaSession() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(14400); // 4 hours
  const [activeChakra, setActiveChakra] = useState(CHAKRAS[3]); // Default Heart
  const [isChakraOn, setIsChakraOn] = useState(false);
  const [chakraVolume, setChakraVolume] = useState(0.5);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const [ambientVolumes, setAmbientVolumes] = useState<Record<string, number>>(
    Object.fromEntries(AMBIENT_SOUNDS.map(s => [s.id, 0]))
  );
  
  const [masterVolume, setMasterVolume] = useState(0.7);
  
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const freqDataRef = useRef(new Uint8Array(32));

  // Sync Master Volume with Audio Engine
  useEffect(() => {
    const engine = getAudioEngine();
    if (engine) engine.setMasterVolume(masterVolume);
  }, [masterVolume]);

  // Persistence logic
  useEffect(() => {
    const saved = localStorage.getItem('ayaguide-templates');
    if (saved) setSavedTemplates(JSON.parse(saved));
  }, []);

  const saveCurrentTemplate = () => {
    const name = prompt('Nome do Modelo Sagrado:');
    if (!name) return;
    const newTemplate = {
      id: Date.now(),
      name,
      chakraId: activeChakra.id,
      ambientVolumes,
      chakraVolume
    };
    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem('ayaguide-templates', JSON.stringify(updated));
  };

  const loadTemplate = (template: any) => {
    const chakra = CHAKRAS.find(c => c.id === template.chakraId) || CHAKRAS[3];
    setActiveChakra(chakra);
    setAmbientVolumes(template.ambientVolumes);
    if (template.chakraVolume !== undefined) setChakraVolume(template.chakraVolume);
    setTimeLeft(14400); 
    setIsPlaying(true);
    setIsChakraOn(true);
  };

  const deleteTemplate = (id: number) => {
    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem('ayaguide-templates', JSON.stringify(updated));
  };

  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => {
          const newTime = t - 1;
          const elapsed = 14400 - newTime;
          if (elapsed > 0 && elapsed % 900 === 0 && bellAudioRef.current) {
             bellAudioRef.current.currentTime = 0;
             bellAudioRef.current.volume = 0.6;
             bellAudioRef.current.play().catch(console.error);
          }
          if (newTime <= 0) { setIsPlaying(false); return 0; }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

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
    
    const getLevels = () => {
      engine.getFrequencyData(freqDataRef.current);
      setAudioLevel(freqDataRef.current.reduce((a, b) => a + b, 0) / 32 / 255);
      requestAnimationFrame(getLevels);
    };
    if (isChakraOn || Object.values(ambientVolumes).some(v => v > 0)) {
        requestAnimationFrame(getLevels);
    }
  }, [isChakraOn, activeChakra, chakraVolume, ambientVolumes, isPlaying]);

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
    // Visual feedback
    if (bellAudioRef.current) {
      bellAudioRef.current.volume = 0.1;
      bellAudioRef.current.play().catch(() => {});
    }
  };

  const startExperience = () => {
    const engine = getAudioEngine();
    if (engine) {
      engine.init();
      engine.resume();
      engine.setMasterVolume(masterVolume);
    }
    setHasStarted(true);
    setIsPlaying(true);
  };

  const exitExperience = () => {
    const engine = getAudioEngine();
    if (engine) {
      engine.stopChakra();
    }
    setIsPlaying(false);
    setIsChakraOn(false);
    setChakraVolume(0.5);
    setAmbientVolumes(Object.fromEntries(AMBIENT_SOUNDS.map(s => [s.id, 0])));
    setTimeLeft(14400);
    setIsFullScreen(false);
    setHasStarted(false);
  };

  return (
    <div 
      className="min-h-screen h-screen bg-[#020202] text-white flex p-4 md:p-6 gap-4 md:gap-6 overflow-hidden font-sans selection:bg-white/10 relative"
      style={{
           // @ts-ignore
           "--chakra-primary": activeChakra.palette.primary,
           "--chakra-secondary": activeChakra.palette.secondary,
           "--chakra-accent": activeChakra.palette.accent,
           "--chakra-soft": activeChakra.palette.soft,
      } as any}
    >
      <div className="fixed inset-0 pointer-events-none z-[0] bg-[#020202]">
        <div className="aurora-layer w-[80vw] h-[80vw] -top-[40%] -left-[20%]" style={{ background: `radial-gradient(circle, hsla(${activeChakra.hue}, 100%, 50%, 0.15) 0%, transparent 70%)` }} />
        <div className="aurora-layer w-[60vw] h-[60vw] -bottom-[30%] -right-[10%]" style={{ background: `radial-gradient(circle, hsla(${(activeChakra.hue + 180) % 360}, 100%, 50%, 0.1) 0%, transparent 70%)`, animationDelay: '-5s' }} />
        <div className="aurora-layer w-[100vw] h-[100vw] top-[10%] left-[10%]" style={{ background: `radial-gradient(circle, hsla(${activeChakra.hue}, 100%, 30%, 0.05 + ${audioLevel * 0.1}) 0%, transparent 80%)`, animationDuration: '30s' }} />
      </div>

      {/* Immersive Background Effects Rendering for all 16 elements - Increased visibility */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <AmbienceCanvas volumes={ambientVolumes} chakraColor={activeChakra.palette.primary} />
      </div>

      {/* Audio Loop System Integration */}
      <AudioPlayerGroup 
        elements={LOOP_ELEMENTS}
        volumes={ambientVolumes}
        isPlaying={isPlaying}
        loopDuration={14400}
      />

      <audio ref={bellAudioRef} src="https://cdn.freesound.org/previews/15/15402_45941-lq.mp3" crossOrigin="anonymous" />

      {/* 1. Left Sidebar Card */}
      <AnimatePresence mode="wait">
        {!isFullScreen && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            <Sidebar
              chakras={CHAKRAS}
              activeChakra={activeChakra}
              isChakraOn={isChakraOn}
              chakraVolume={chakraVolume}
              onChakraVolumeChange={setChakraVolume}
              onChakraToggle={(type) => {
                if (type === 'on') {
                  setIsChakraOn(true);
                } else {
                  setIsChakraOn(false);
                }
              }}
              onChakraSelect={setActiveChakra}
              ambientVolumes={ambientVolumes}
              onAmbientVolumeChange={handleAmbientVolumeChange}
              onClearAll={handleClearAll}
              masterVolume={masterVolume}
              onMasterVolumeChange={setMasterVolume}
              savedTemplates={savedTemplates}
              onSaveTemplate={saveCurrentTemplate}
              onLoadTemplate={loadTemplate}
              onDeleteTemplate={deleteTemplate}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Area (Timer Top + Mandala Stage) */}
      <div className="flex-1 flex flex-col gap-4 md:gap-6 relative z-10 transition-all duration-700">
        
        {/* 2a. Top Timer Card */}
        <AnimatePresence>
          {!isFullScreen && (
            <motion.header 
              initial={{ y: -100, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-20 w-full glass rounded-[24px] flex items-center justify-between px-8 shrink-0 border border-white/5 shadow-xl relative overflow-hidden backdrop-blur-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10"><Timer className="w-5 h-5 text-white/60" /></div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Presença na Sessão</p>
                  <p className="text-xs font-light text-white/60 tracking-wider">Continuidade Observada</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                 <div className="text-3xl font-extralight tracking-[0.2em] text-white/90 font-mono">
                   {formatTime(timeLeft)}
                 </div>

                 <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <AnimatePresence mode="wait">
                    {isPlaying ? (
                      <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Pause className="w-5 h-5 text-white fill-white" /></motion.div>
                    ) : (
                      <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Play className="w-5 h-5 text-white fill-white ml-0.5" /></motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              <div className="flex items-center gap-3 text-right">
                 <div className="text-xs font-light text-white/60 tracking-wide">
                   {activeChakra.name.split(' (')[0]}
                 </div>
                 <div className={`w-3 h-3 rounded-full ${activeChakra.color} shadow-[0_0_15px_currentColor]`} />
              </div>

              {/* Exit Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={exitExperience}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all"
                title="Sair da Sessão"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
              
              <div className="absolute inset-0 bg-white/[0.02] -z-10" />
            </motion.header>
          )}
        </AnimatePresence>

        {/* 2b. Central Mandala Card */}
        <MandalaCard
          hue={activeChakra.hue}
          isPlaying={isPlaying}
          chakraId={activeChakra.id}
          chakraColor={activeChakra.palette.primary}
          chakraPalette={activeChakra.palette}
          audioLevel={audioLevel}
          ambientVolumes={ambientVolumes}
          isFullScreen={isFullScreen}
          onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
        />

      </div>

      {/* Exit button floating (fullscreen mode) */}
      <AnimatePresence>
        {isFullScreen && hasStarted && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={exitExperience}
            className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/30 hover:text-red-400 hover:border-red-400/30 transition-all"
            title="Sair da Sessão"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 4. Start Overlay — Premium Landing */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.2 } }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          >
            {/* Deep Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#030108] via-[#0a0318] to-[#020202]" />

            {/* Animated Sacred Geometry Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="landing-ring absolute w-[500px] h-[500px] rounded-full border border-purple-400/15" />
              <div className="landing-ring-reverse absolute w-[380px] h-[380px] rounded-full border border-indigo-400/10" style={{ animationDelay: '-3s' }} />
              <div className="landing-ring absolute w-[650px] h-[650px] rounded-full border border-purple-300/8" style={{ animationDuration: '30s' }} />
              <div className="landing-ring-reverse absolute w-[280px] h-[280px] rounded-full border-2 border-violet-400/10" style={{ animationDelay: '-7s', animationDuration: '18s' }} />
              <div className="landing-ring absolute w-[800px] h-[800px] rounded-full border border-purple-500/5" style={{ animationDuration: '35s', animationDelay: '-12s' }} />
            </div>

            {/* Pulsing Central Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-[400px] h-[400px] rounded-full bg-purple-500/20 blur-[120px]"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="w-[300px] h-[300px] rounded-full bg-indigo-400/15 blur-[100px]"
              />
            </div>

            {/* Floating Particle Dust — client-only to avoid hydration mismatch */}
            {isMounted && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="landing-particle"
                    style={{
                      left: `${5 + ((i * 31 + 7) % 90)}%`,
                      bottom: `${-5 - (i % 10)}%`,
                      animationDelay: `${(i * 1.7) % 8}s`,
                      animationDuration: `${6 + (i * 1.3) % 6}s`,
                      width: `${1 + (i % 3)}px`,
                      height: `${1 + ((i + 1) % 3)}px`,
                      opacity: 0.3 + ((i * 17) % 50) / 100,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Main Content */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
              className="relative z-10 text-center px-8 max-w-2xl"
            >
              {/* Sacred Mandala Icon */}
              <div className="mb-10 relative inline-block landing-float">
                <div className="absolute inset-0 bg-purple-400/20 blur-[60px] rounded-full scale-[2.5]" />
                <div className="relative">
                  <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto text-white/80">
                    <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                    <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
                    <circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                    <circle cx="40" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
                    <circle cx="40" cy="40" r="5" fill="currentColor" opacity="0.8" />
                    {/* Petal shapes */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      const angle = (i / 8) * Math.PI * 2;
                      const x = 40 + Math.cos(angle) * 24;
                      const y = 40 + Math.sin(angle) * 24;
                      return <circle key={i} cx={x} cy={y} r="2" fill="currentColor" opacity="0.4" />;
                    })}
                    {Array.from({ length: 12 }).map((_, i) => {
                      const angle = (i / 12) * Math.PI * 2;
                      const x = 40 + Math.cos(angle) * 34;
                      const y = 40 + Math.sin(angle) * 34;
                      return <circle key={i} cx={x} cy={y} r="1.5" fill="currentColor" opacity="0.25" />;
                    })}
                  </svg>
                </div>
              </div>
              
              {/* Title */}
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-6xl md:text-7xl font-extralight tracking-[0.25em] mb-3"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(192,132,252,0.6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                AYAGUIDE
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-white/35 text-sm tracking-[0.4em] font-light uppercase mb-8"
              >
                Portal de Meditação Sonora
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="text-white/25 text-sm font-light leading-relaxed max-w-md mx-auto mb-10 tracking-wide"
              >
                Uma experiência imersiva que combina frequências dos chakras, sons da natureza e mandalas dinâmicas para guiar sua jornada de meditação profunda.
              </motion.p>

              {/* Feature Pills */}
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="flex flex-wrap justify-center gap-3 mb-14"
              >
                {[
                  { icon: '🎵', text: '7 Frequências dos Chakras' },
                  { icon: '🌿', text: '16 Sons da Natureza' },
                  { icon: '🔮', text: 'Mandalas Reativas ao Som' },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm"
                  >
                    <span className="text-sm">{feature.icon}</span>
                    <span className="text-[11px] text-white/40 tracking-wider font-light">{feature.text}</span>
                  </div>
                ))}
              </motion.div>
              
              {/* Glowing CTA Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.8 }}
                className="relative inline-block"
              >
                {/* Pulsing Outer Ring */}
                <div className="absolute inset-0 rounded-full btn-glow-ring border-2 border-purple-400/20" style={{ margin: '-8px' }} />
                <div className="absolute inset-0 rounded-full btn-glow-ring border border-purple-300/10" style={{ margin: '-16px', animationDelay: '0.5s' }} />
                
                <button
                  onClick={startExperience}
                  className="relative group px-14 py-5 rounded-full overflow-hidden btn-glow transition-all duration-500 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(192, 132, 252, 0.1) 50%, rgba(139, 92, 246, 0.15) 100%)', border: '1px solid rgba(192, 132, 252, 0.25)' }}
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent" style={{ animation: 'shimmer-slide 2s infinite' }} />
                  </div>
                  
                  <span className="relative flex items-center gap-3">
                    <Play className="w-5 h-5 text-purple-300/80 fill-purple-300/60" />
                    <span className="text-sm tracking-[0.4em] font-light uppercase text-white/80 group-hover:text-white transition-colors">
                      Entrar na Jornada
                    </span>
                  </span>
                </button>
              </motion.div>
              
              {/* Bottom Attribution */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 1 }}
                className="mt-12 text-white/15 text-[10px] tracking-[0.4em] uppercase font-light"
              >
                Desenvolvido para sessões de meditação profunda
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
