'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Mandala } from './Mandala_Enhanced';
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
}

export function MandalaCard({
  hue,
  isPlaying,
  chakraId,
  chakraColor,
  chakraPalette,
  audioLevel,
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
        const average =
          audioDataRef.current.reduce((a, b) => a + b, 0) / audioDataRef.current.length / 255;
        setGlowIntensity(average);
      } else {
        setGlowIntensity(0);
      }

      rafRef.current = requestAnimationFrame(updateGlow);
    };

    rafRef.current = requestAnimationFrame(updateGlow);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  // Parse hex color to RGB for gradient calculations
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 255, g: 255, b: 255 };
  };

  const rgb = hexToRgb(chakraColor);
  const rgbString = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

  return (
    <motion.div
      ref={containerRef}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'circOut' }}
      className="flex-1 w-full relative overflow-hidden flex items-center justify-center p-8 rounded-[40px] border border-white/5 shadow-2xl"
      style={{
        background: `linear-gradient(135deg, rgba(${rgbString}, 0.08) 0%, rgba(${rgbString}, 0.02) 50%, rgba(${rgbString}, 0.05) 100%)`,
      }}
    >
      {/* Immersive Background Layers */}

      {/* Layer 1: Animated Gradient Background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: `radial-gradient(circle at 30% 50%, rgba(${rgbString}, 0.15) 0%, transparent 50%)`,
        }}
      />

      {/* Layer 2: Secondary Gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
        style={{
          background: `radial-gradient(circle at 70% 50%, rgba(${rgbString}, 0.1) 0%, transparent 50%)`,
        }}
      />

      {/* Layer 3: Reactive Glow based on Audio */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: glowIntensity * 0.6,
        }}
        transition={{
          duration: 0.1,
        }}
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(${rgbString}, 0.3) 0%, transparent 70%)`,
          filter: `blur(${40 + glowIntensity * 60}px)`,
        }}
      />

      {/* Layer 4: Particle Effect Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: 2 + Math.random() * 4,
              height: 2 + Math.random() * 4,
              backgroundColor: chakraColor,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.1 + Math.random() * 0.2,
            }}
            animate={{
              y: [0, -100 - Math.random() * 200],
              x: [-50 + Math.random() * 100, 50 + Math.random() * 100],
              opacity: [0.1, 0.3, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeOut',
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Mandala Container */}
      <div className="relative w-full max-w-[85vh] aspect-square flex items-center justify-center translate-y-[-2vh] z-10">
        <motion.div
          animate={{
            scale: 1 + audioLevel * 0.12,
            opacity: 0.85 + audioLevel * 0.15,
          }}
          transition={{ duration: 0.15 }}
          className="w-full"
        >
          <Mandala hue={hue} isPlaying={isPlaying} chakraId={chakraId} />
        </motion.div>

        {/* Mandala Outer Aura */}
        <motion.div
          className="absolute inset-0 blur-[120px] opacity-20 pointer-events-none rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            backgroundColor: chakraColor,
          }}
        />

        {/* Audio-Reactive Aura */}
        <motion.div
          className="absolute inset-0 blur-[80px] pointer-events-none rounded-full"
          animate={{
            opacity: glowIntensity * 0.4,
            scale: 1 + glowIntensity * 0.3,
          }}
          transition={{
            duration: 0.1,
          }}
          style={{
            backgroundColor: chakraColor,
          }}
        />
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none opacity-20">
        <motion.div
          className="w-full h-full rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: `radial-gradient(circle, ${chakraColor}, transparent)`,
          }}
        />
      </div>

      <div className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none opacity-15">
        <motion.div
          className="w-full h-full rounded-full"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          style={{
            background: `radial-gradient(circle, ${chakraColor}, transparent)`,
          }}
        />
      </div>

      {/* Playback Focus Controls Overlay */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 z-20 pointer-events-none">
        <motion.div
          className="flex items-center gap-6 text-[10px] font-bold tracking-[0.4em] uppercase"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            color: chakraColor,
          }}
        >
          <span>Sopro</span>
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: chakraColor }} />
          <span>Sagrado</span>
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: chakraColor }} />
          <span>Unidade</span>
        </motion.div>
      </div>

      {/* Subtle Border Glow */}
      <motion.div
        className="absolute inset-0 rounded-[40px] pointer-events-none"
        animate={{
          opacity: glowIntensity * 0.3,
        }}
        transition={{
          duration: 0.1,
        }}
        style={{
          border: `2px solid ${chakraColor}`,
          boxShadow: `inset 0 0 40px ${chakraColor}40, 0 0 60px ${chakraColor}30`,
        }}
      />

      {/* Overlay for depth */}
      <div className="absolute inset-0 bg-white/[0.01] -z-10 rounded-[40px]" />
    </motion.div>
  );
}
