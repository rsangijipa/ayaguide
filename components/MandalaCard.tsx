'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Mandala } from './Mandala';
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
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export function MandalaCard({
  chakraId,
  chakraColor,
  chakraPalette,
  audioLevel,
  ambientVolumes,
  isPlaying,
  isFullScreen,
  onToggleFullScreen,
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
      className={`flex-1 w-full relative overflow-hidden flex items-center justify-center p-4 md:p-8 rounded-[40px] border border-white/5 shadow-2xl transition-all duration-700 ${isFullScreen ? 'm-0' : ''}`}
      style={{ background: `linear-gradient(135deg, rgba(${rgbString}, 0.04) 0%, rgba(${rgbString}, 0.01) 50%, rgba(${rgbString}, 0.03) 100%)` }}
    >
      <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} style={{ background: `radial-gradient(circle at 30% 50%, rgba(${rgbString}, 0.1) 0%, transparent 50%)` }} />
      <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: glowIntensity * 0.4 }} transition={{ duration: 0.1 }} style={{ background: `radial-gradient(circle at 50% 50%, rgba(${rgbString}, 0.2) 0%, transparent 60%)`, filter: `blur(${60 + glowIntensity * 40}px)` }} />
      
      <div className="relative w-full h-full max-w-[90vh] aspect-square flex items-center justify-center z-10">
        {/* Pulsing Smoky Halo - SOUND REACTIVE */}
        <motion.div 
          className="absolute inset-0 blur-[130px] pointer-events-none rounded-full" 
          animate={{ 
            scale: isPlaying ? [1.1, 1.25, 1.1] : 1.1,
            opacity: isPlaying ? [0.1 + glowIntensity * 0.3, 0.25 + glowIntensity * 0.45, 0.1 + glowIntensity * 0.3] : 0.1
          }} 
          transition={{
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.2 }
          }}
          style={{ background: `radial-gradient(circle, ${chakraColor} 0%, transparent 70%)` }} 
        />

        <Mandala
          chakraId={chakraId}
          chakraPalette={chakraPalette}
          ambientVolumes={ambientVolumes}
          audioLevel={audioLevel}
          isPlaying={isPlaying}
        />
        
        <motion.div className="absolute inset-0 blur-[100px] opacity-10 pointer-events-none rounded-full" animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} style={{ backgroundColor: chakraColor }} />
      </div>

      {/* Full Screen Toggle Button - Discrete & Touch Friendly */}
      <motion.button
        whileHover={{ scale: 1.1, opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleFullScreen}
        className="absolute bottom-6 right-6 w-12 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center z-50 text-white/40 hover:text-white transition-all shadow-xl"
        title={isFullScreen ? "Sair da Tela Cheia" : "Modo Tela Cheia"}
      >
        {isFullScreen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6m0 0v6m0-6L3 21M20 10h-6m0 0V4m0 6l7-7"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6m0 0v6m0-6L14 10M9 21H3m0 0v-6m0 6l7-7"/></svg>
        )}
      </motion.button>

      <motion.div className="absolute inset-0 rounded-[40px] pointer-events-none" animate={{ opacity: glowIntensity * 0.2 }} transition={{ duration: 0.1 }} style={{ border: `1px solid rgba(${rgbString}, 0.1)`, boxShadow: `inset 0 0 50px rgba(${rgbString}, 0.05)` }} />
    </motion.div>
  );
}
