'use client';

import { Play, Sparkles, Activity } from 'lucide-react';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSessionStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';

interface LandingHeroProps {
  onStart: () => void;
}

export function LandingHero({ onStart }: LandingHeroProps) {
  const { qualityMode, setQualityMode } = useSessionStore(
    useShallow((s) => ({
      qualityMode: s.qualityMode,
      setQualityMode: s.setQualityMode,
    }))
  );

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setQualityMode('minimal');
    }
  }, [setQualityMode]);

  // Hues for the 7 Chakras: Root (0), Sacral (30), Solar (60), Heart (120), Throat (200), ThirdEye (260), Crown (280)
  const chakraHues = [0, 30, 60, 120, 200, 260, 280];

  return (
    <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
      {/* Premium Animated Background (Chakra Cycles) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{
            background: chakraHues.map(hue => `radial-gradient(circle at 50% 50%, hsla(${hue}, 65%, 60%, 0.2) 0%, transparent 70%)`),
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 opacity-70 blur-3xl scale-125"
        />
        
        {/* Floating Sacred Geometric Layer */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05]">
          <svg viewBox="0 0 100 100" className="w-[120vh] h-[120vh] animate-spin-slow duration-[150s]">
            <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="0.05" />
            {[...Array(12)].map((_, i) => (
              <circle key={i} cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="0.02" transform={`rotate(${i * 30} 50 50)`} />
            ))}
          </svg>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-4xl w-full text-center space-y-12">
        {/* Header Section */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
          <div className="flex flex-col items-center">
            {/* Small Elegant Icon */}
            <div className="relative mb-6 group cursor-default">
              <div className="relative w-16 h-16 rounded-[24px] bg-white/[0.02] border border-white/5 flex items-center justify-center backdrop-blur-2xl shadow-xl transition-all duration-700 group-hover:scale-105 group-hover:border-white/10">
                <Play className="w-5 h-5 text-white/30 fill-white/5 group-hover:text-white/60 transition-colors" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-light tracking-[0.4em] uppercase text-white/90 drop-shadow-xl mb-2">
              Aya<span className="font-bold opacity-30">Guide</span>
            </h1>
            
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />
            
            <p className="text-[10px] md:text-[11px] text-white/20 uppercase tracking-[0.6em] font-medium leading-relaxed">
              Portal de Expansão Lunar
            </p>
          </div>
        </div>

        {/* Compact Mode Selection Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl"
          >
            {/* Full Experience Card */}
            <button
              onClick={() => setQualityMode('full')}
              className={`relative group p-6 md:p-8 rounded-[32px] border transition-all duration-500 text-left overflow-hidden touch-manipulation ${
                qualityMode === 'full'
                  ? 'bg-white/[0.04] border-white/15 shadow-[0_20px_60px_-15px_rgba(255,255,255,0.05)] scale-[1.02]'
                  : 'bg-white/[0.01] border-white/5 hover:border-white/10 opacity-50 hover:opacity-100'
              }`}
            >
              <div className="relative z-10 space-y-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  qualityMode === 'full' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/20'
                }`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-medium tracking-wide text-white/80">Imersão Divina</h3>
                  <p className="text-[11px] text-white/20 leading-relaxed font-light">Experiência completa com áudio espacial e visual reativo.</p>
                </div>
              </div>
            </button>

            {/* Minimal Mode Card */}
            <button
              onClick={() => setQualityMode('minimal')}
              className={`relative group p-6 md:p-8 rounded-[32px] border transition-all duration-500 text-left overflow-hidden touch-manipulation ${
                qualityMode === 'minimal'
                  ? 'bg-white/[0.04] border-white/15 shadow-[0_20px_60px_-15px_rgba(255,255,255,0.05)] scale-[1.02]'
                  : 'bg-white/[0.01] border-white/5 hover:border-white/10 opacity-50 hover:opacity-100'
              }`}
            >
              <div className="relative z-10 space-y-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  qualityMode === 'minimal' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/20'
                }`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-medium tracking-wide text-white/80">Silêncio Puro</h3>
                  <p className="text-[11px] text-white/20 leading-relaxed font-light">Foco em performance. Visual minimalista e áudio preservado.</p>
                </div>
              </div>
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Action Button */}
        <div className="animate-in fade-in zoom-in-95 duration-1000 delay-700 w-full flex justify-center">
          <button
            onClick={onStart}
            className="relative px-12 py-5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-3xl hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500 group overflow-hidden touch-manipulation active:scale-[0.98]"
          >
            <span className="relative flex items-center gap-4 text-white">
              <span className="text-[11px] tracking-[0.6em] font-light uppercase group-hover:tracking-[0.7em] transition-all ml-2">
                Transcender
              </span>
              <Play className="w-4 h-4 text-white/30 fill-white/5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>

        {/* Minimalist Footer */}
        <p className="text-[9px] text-white/5 uppercase tracking-[0.8em] font-light animate-in fade-in duration-1000 delay-1000">
          Encontre seu Centro
        </p>
      </div>
    </div>
  );
}
