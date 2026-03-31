"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Music, Wind, CloudRain, Bird, Bell, ChevronRight, Settings2, Sparkles, LayoutGrid, Timer } from 'lucide-react';
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
  
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);

  const freqDataRef = useRef(new Uint8Array(32));

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

  const startExperience = () => {
    const engine = getAudioEngine();
    if (engine) {
      engine.init();
      engine.resume();
    }
    setHasStarted(true);
    // Optionally start playing immediately
    setIsPlaying(true);
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
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="aurora-layer w-[80vw] h-[80vw] -top-[40%] -left-[20%]" style={{ background: `radial-gradient(circle, hsla(${activeChakra.hue}, 100%, 50%, 0.15) 0%, transparent 70%)` }} />
        <div className="aurora-layer w-[60vw] h-[60vw] -bottom-[30%] -right-[10%]" style={{ background: `radial-gradient(circle, hsla(${(activeChakra.hue + 180) % 360}, 100%, 50%, 0.1) 0%, transparent 70%)`, animationDelay: '-5s' }} />
        <div className="aurora-layer w-[100vw] h-[100vw] top-[10%] left-[10%]" style={{ background: `radial-gradient(circle, hsla(${activeChakra.hue}, 100%, 30%, 0.05 + ${audioLevel * 0.1}) 0%, transparent 80%)`, animationDuration: '30s' }} />
      </div>

      <AmbienceCanvas volumes={ambientVolumes} chakraColor={activeChakra.palette.primary} />

      {/* Audio Loop System Integration */}
      <AudioPlayerGroup 
        elements={LOOP_ELEMENTS}
        volumes={ambientVolumes}
        isPlaying={isPlaying}
        loopDuration={14400}
      />

      <audio ref={bellAudioRef} src="https://cdn.freesound.org/previews/15/15402_45941-lq.mp3" crossOrigin="anonymous" />

      {/* 1. Left Sidebar Card */}
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
        savedTemplates={savedTemplates}
        onSaveTemplate={saveCurrentTemplate}
        onLoadTemplate={loadTemplate}
        onDeleteTemplate={deleteTemplate}
      />

      {/* 2. Main Area (Timer Top + Mandala Stage) */}
      <div className="flex-1 flex flex-col gap-4 md:gap-6">
        
        {/* 2a. Top Timer Card */}
        <motion.header 
          initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="h-20 w-full glass rounded-[24px] flex items-center justify-between px-8 shrink-0 border border-white/5 shadow-xl relative overflow-hidden"
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
          
          <div className="absolute inset-0 bg-white/[0.02] -z-10" />
        </motion.header>

        {/* 2b. Central Mandala Card */}
        <MandalaCard
          hue={activeChakra.hue}
          isPlaying={isPlaying}
          chakraId={activeChakra.id}
          chakraColor={activeChakra.palette.primary}
          chakraPalette={activeChakra.palette}
          audioLevel={audioLevel}
          ambientVolumes={ambientVolumes}
        />

      </div>

      {/* 4. Start Overlay */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="text-center p-12 max-w-lg"
            >
              <div className="mb-8 relative inline-block">
                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <Sparkles className="w-16 h-16 text-white relative z-10 mx-auto opacity-80" />
              </div>
              
              <h1 className="text-5xl font-extralight tracking-[0.2em] mb-4 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                AYAGUIDE
              </h1>
              <p className="text-white/40 text-sm tracking-[0.3em] font-light mb-12 uppercase">
                Portal de Meditação Sonora
              </p>
              
              <button
                onClick={startExperience}
                className="group relative px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative text-sm tracking-[0.4em] font-light uppercase group-hover:text-white transition-colors">
                  Entrar na Jornada
                </span>
              </button>
              
              <p className="mt-8 text-white/20 text-[10px] tracking-widest uppercase font-light">
                O áudio será iniciado ao entrar
              </p>
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
