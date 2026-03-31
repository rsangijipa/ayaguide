'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { MandalaElegant } from './MandalaElegant';
import { getAudioEngine } from '@/lib/audio';

interface MandalaCardProps {
  hue: number;
  isPlaying: boolean;
  chakraId: string;
  chakraColor: string;
  chakraPalette: {
    primary: string;
    secondary: string;
    accent: string;
    soft: string;
  };
  audioLevel: number;
  ambientVolumes: Record<string, number>;
}

export function MandalaCard({
  chakraId,
  chakraColor,
  audioLevel,
  ambientVolumes,
  isPlaying,
}: MandalaCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const audioDataRef = useRef(new Uint8Array(32));
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const engine = getAudioEngine();
    if (!engine || !containerRef.current) return;

    const updateGlow = () => {
      if (isPlaying && engine) {
        engine.getFrequencyData(audioDataRef.current);
        const average = audioDataRef.current.reduce((a, b) => a + b, 0) / audioDataRef.current.length / 255;
        setGlowIntensity(average);
      } else {
        setGlowIntensity(0);
      }
      rafRef.current = requestAnimationFrame(updateGlow);
    };

    rafRef.current = requestAnimationFrame(updateGlow);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isPlaying]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 255, g: 255, b: 255 };
  };

  const rgb = hexToRgb(chakraColor);
  const rgbString = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

  return (
    <motion.div
      ref={containerRef}
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex-1 w-full relative overflow-hidden flex items-center justify-center p-4 md:p-8 rounded-[40px] border border-white/5 shadow-2xl"
      style={{ background: `linear-gradient(135deg, rgba(${rgbString}, 0.04) 0%, rgba(${rgbString}, 0.01) 50%, rgba(${rgbString}, 0.03) 100%)` }}
    >
      <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} style={{ background: `radial-gradient(circle at 30% 50%, rgba(${rgbString}, 0.1) 0%, transparent 50%)` }} />
      <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: glowIntensity * 0.4 }} transition={{ duration: 0.1 }} style={{ background: `radial-gradient(circle at 50% 50%, rgba(${rgbString}, 0.2) 0%, transparent 60%)`, filter: `blur(${60 + glowIntensity * 40}px)` }} />
      
      <div className="relative w-full h-full max-w-[90vh] aspect-square flex items-center justify-center z-10">
        <MandalaElegant
          chakraId={chakraId}
          ambientVolumes={ambientVolumes}
          audioLevel={audioLevel}
          isPlaying={isPlaying}
        />
        
        <motion.div className="absolute inset-0 blur-[100px] opacity-10 pointer-events-none rounded-full" animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} style={{ backgroundColor: chakraColor }} />
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 z-20 pointer-events-none">
        <motion.div className="flex items-center gap-6 text-[10px] font-bold tracking-[0.5em] uppercase" animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} style={{ color: chakraColor }}>
          <span>Sopro</span><div className="w-1 h-1 rounded-full opacity-50" style={{ backgroundColor: chakraColor }} /><span>Sagrado</span><div className="w-1 h-1 rounded-full opacity-50" style={{ backgroundColor: chakraColor }} /><span>Unidade</span>
        </motion.div>
      </div>

      <motion.div className="absolute inset-0 rounded-[40px] pointer-events-none" animate={{ opacity: glowIntensity * 0.2 }} transition={{ duration: 0.1 }} style={{ border: `1px solid rgba(${rgbString}, 0.1)`, boxShadow: `inset 0 0 50px rgba(${rgbString}, 0.05)` }} />
    </motion.div>
  );
}
