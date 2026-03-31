'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BreathingGuideProps {
  isActive: boolean;
  chakraColor: string;
  onToggle: () => void;
}

// Breathing pattern: Inhale 4s → Hold 4s → Exhale 6s = 14s cycle
const INHALE = 4000;
const HOLD = 4000;
const EXHALE = 6000;
const CYCLE = INHALE + HOLD + EXHALE;

export function BreathingGuide({ isActive, chakraColor, onToggle }: BreathingGuideProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [progress, setProgress] = useState(0); // 0-1 within current phase
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    startRef.current = performance.now();

    const tick = () => {
      const elapsed = (performance.now() - startRef.current) % CYCLE;

      if (elapsed < INHALE) {
        setPhase('inhale');
        setProgress(elapsed / INHALE);
      } else if (elapsed < INHALE + HOLD) {
        setPhase('hold');
        setProgress((elapsed - INHALE) / HOLD);
      } else {
        setPhase('exhale');
        setProgress((elapsed - INHALE - HOLD) / EXHALE);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isActive]);

  if (!isActive) return null;

  // Scale: inhale grows, hold stays, exhale shrinks
  const scale = phase === 'inhale'
    ? 0.92 + progress * 0.12
    : phase === 'hold'
      ? 1.04
      : 1.04 - progress * 0.12;

  const opacity = phase === 'hold'
    ? 0.35 + Math.sin(progress * Math.PI * 4) * 0.1
    : 0.25 + (phase === 'inhale' ? progress : 1 - progress) * 0.15;

  const label = phase === 'inhale' ? 'Inspire' : phase === 'hold' ? 'Retenha' : 'Expire';

  return (
    <>
      {/* Breathing ring overlay — positioned absolutely around mandala */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center"
        animate={{ scale }}
        transition={{ duration: 0.1, ease: 'linear' }}
      >
        <div
          className="w-[85%] h-[85%] rounded-full border-2"
          style={{
            borderColor: chakraColor,
            opacity,
            boxShadow: `0 0 ${20 + opacity * 30}px ${chakraColor}40, inset 0 0 ${15 + opacity * 20}px ${chakraColor}20`,
          }}
        />
      </motion.div>

      {/* Phase label */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-lg border border-white/10"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-light">
              {label}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
