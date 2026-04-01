'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getPhaseAtTime, type BreathingPattern, BREATHING_PATTERNS } from '@/lib/breathingPatterns';

interface BreathingGuideProps {
  isActive: boolean;
  chakraColor: string;
  onToggle: () => void;
  patternId?: string;
}

export function BreathingGuide({ isActive, chakraColor, onToggle, patternId = 'calm' }: BreathingGuideProps) {
  const [currentLabel, setCurrentLabel] = useState('');
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(0.3);
  const [cycleCount, setCycleCount] = useState(0);
  const [rapidBeat, setRapidBeat] = useState<number | undefined>();

  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const patternRef = useRef<BreathingPattern>(BREATHING_PATTERNS[0]);
  const lastCycleRef = useRef(-1);

  // Keep pattern ref synced
  useEffect(() => {
    const found = BREATHING_PATTERNS.find(p => p.id === patternId);
    if (found) patternRef.current = found;
  }, [patternId]);

  useEffect(() => {
    if (!isActive) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setCycleCount(0);
      lastCycleRef.current = -1;
      return;
    }

    startRef.current = performance.now();
    lastCycleRef.current = -1;

    const tick = () => {
      const pattern = patternRef.current;
      const totalElapsed = performance.now() - startRef.current;
      const cycleNum = Math.floor(totalElapsed / pattern.cycleDuration);
      const elapsedInCycle = totalElapsed % pattern.cycleDuration;

      // Detect new cycle
      if (cycleNum !== lastCycleRef.current) {
        lastCycleRef.current = cycleNum;
        if (cycleNum > 0) {
          setCycleCount(cycleNum);
        }
      }

      const { phase, progress, rapidBeat: beat } = getPhaseAtTime(pattern, elapsedInCycle);

      setCurrentLabel(phase.label);
      setRapidBeat(beat);

      // Calculate visual scale based on phase type
      switch (phase.visual) {
        case 'grow':
          setScale(0.92 + progress * 0.12);
          setOpacity(0.25 + progress * 0.15);
          break;
        case 'hold':
          setScale(1.04);
          setOpacity(0.35 + Math.sin(progress * Math.PI * 4) * 0.1);
          break;
        case 'shrink':
          setScale(1.04 - progress * 0.12);
          setOpacity(0.40 - progress * 0.15);
          break;
        case 'rapid': {
          // Fast pulsing for Wim Hof
          const beatPhase = (progress * (pattern.rapidCount || 30)) % 1;
          setScale(0.95 + Math.sin(beatPhase * Math.PI) * 0.08);
          setOpacity(0.3 + Math.sin(beatPhase * Math.PI) * 0.2);
          break;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isActive, patternId]);

  if (!isActive) return null;

  const pattern = BREATHING_PATTERNS.find(p => p.id === patternId) || BREATHING_PATTERNS[0];

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

      {/* Phase label + cycle counter */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLabel + (rapidBeat ? `-${rapidBeat}` : '')}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-lg border border-white/10 flex items-center gap-2"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-light">
              {currentLabel}
            </span>
            {rapidBeat !== undefined && (
              <span className="text-[10px] font-mono text-white/40">
                {rapidBeat}/{pattern.rapidCount || 30}
              </span>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Cycle counter + pattern name */}
        <div className="flex items-center gap-3">
          <span className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-light">
            {pattern.emoji} {pattern.name}
          </span>
          {cycleCount > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30"
            >
              {cycleCount} {cycleCount === 1 ? 'ciclo' : 'ciclos'}
            </motion.span>
          )}
        </div>
      </div>
    </>
  );
}
