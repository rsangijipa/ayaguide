'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles, Activity } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useSessionStore } from '@/lib/store';

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
    if (window.innerWidth < 768) {
      setQualityMode('minimal');
    }
  }, [setQualityMode]);

  const chakraHues = [0, 30, 60, 120, 200, 260, 280];

  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-12">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{
            background: chakraHues.map(
              (hue) => `radial-gradient(circle at 50% 50%, hsla(${hue}, 65%, 60%, 0.2) 0%, transparent 70%)`
            ),
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0 scale-125 opacity-70 blur-3xl"
        />

        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05]">
          <svg viewBox="0 0 100 100" className="h-[120vh] w-[120vh] animate-spin-slow duration-[150s]">
            <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="0.05" />
            {[...Array(12)].map((_, index) => (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="white"
                strokeWidth="0.02"
                transform={`rotate(${index * 30} 50 50)`}
              />
            ))}
          </svg>
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center space-y-12 text-center">
        <div className="animate-in slide-in-from-bottom-8 fade-in space-y-6 duration-1000 ease-out">
          <div className="flex flex-col items-center">
            <div className="group relative mb-6 cursor-default">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/5 bg-white/[0.02] shadow-xl backdrop-blur-2xl transition-all duration-700 group-hover:scale-105 group-hover:border-white/10">
                <Play className="h-5 w-5 fill-white/5 text-white/30 transition-colors group-hover:text-white/60" />
              </div>
            </div>

            <h1 className="mb-2 text-4xl font-light uppercase tracking-[0.4em] text-white/90 drop-shadow-xl md:text-5xl">
              Aya<span className="font-bold opacity-30">Guide</span>
            </h1>

            <div className="my-4 h-px w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <p className="text-[10px] font-medium uppercase leading-relaxed tracking-[0.6em] text-white/20 md:text-[11px]">
              Portal de Expansao Lunar
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid w-full max-w-2xl grid-cols-1 gap-6 md:grid-cols-2"
          >
            <button
              onClick={() => setQualityMode('full')}
              className={`group relative overflow-hidden rounded-[32px] border p-6 text-left transition-all duration-500 touch-manipulation md:p-8 ${
                qualityMode === 'full'
                  ? 'scale-[1.02] border-white/15 bg-white/[0.04] shadow-[0_20px_60px_-15px_rgba(255,255,255,0.05)]'
                  : 'border-white/5 bg-white/[0.01] opacity-50 hover:border-white/10 hover:opacity-100'
              }`}
            >
              <div className="relative z-10 space-y-5">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500 ${
                    qualityMode === 'full' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/20'
                  }`}
                >
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-medium tracking-wide text-white/80">Imersao Divina</h3>
                  <p className="text-[11px] font-light leading-relaxed text-white/20">
                    Experiencia completa com audio espacial e visual reativo.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setQualityMode('minimal')}
              className={`group relative overflow-hidden rounded-[32px] border p-6 text-left transition-all duration-500 touch-manipulation md:p-8 ${
                qualityMode === 'minimal'
                  ? 'scale-[1.02] border-white/15 bg-white/[0.04] shadow-[0_20px_60px_-15px_rgba(255,255,255,0.05)]'
                  : 'border-white/5 bg-white/[0.01] opacity-50 hover:border-white/10 hover:opacity-100'
              }`}
            >
              <div className="relative z-10 space-y-5">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500 ${
                    qualityMode === 'minimal' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/20'
                  }`}
                >
                  <Activity className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-medium tracking-wide text-white/80">Silencio Puro</h3>
                  <p className="text-[11px] font-light leading-relaxed text-white/20">
                    Foco em performance. Visual minimalista e audio preservado.
                  </p>
                </div>
              </div>
            </button>
          </motion.div>
        </AnimatePresence>

        <div className="animate-in zoom-in-95 fade-in flex w-full justify-center duration-1000 delay-700">
          <button
            onClick={onStart}
            className="group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.03] px-12 py-5 backdrop-blur-3xl transition-all duration-500 hover:border-white/20 hover:bg-white/[0.06] touch-manipulation active:scale-[0.98]"
          >
            <span className="relative flex items-center gap-4 text-white">
              <span className="ml-2 text-[11px] font-light uppercase tracking-[0.6em] transition-all group-hover:tracking-[0.7em]">
                Transcender
              </span>
              <Play className="h-4 w-4 fill-white/5 text-white/30 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        </div>

        <p className="animate-in fade-in text-[9px] font-light uppercase tracking-[0.8em] text-white/5 duration-1000 delay-1000">
          Encontre seu Centro
        </p>
      </div>
    </div>
  );
}
