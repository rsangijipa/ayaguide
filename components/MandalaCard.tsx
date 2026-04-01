'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Mandala } from './Mandala';

import { useAudioLevel } from '@/hooks/useAudioLevel';

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
  ambientVolumes: Record<string, number>;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  children?: React.ReactNode;
}

export const MandalaCard = React.memo(function MandalaCard({
  chakraId,
  chakraColor,
  chakraPalette,
  ambientVolumes,
  isPlaying,
  isFullScreen,
  onToggleFullScreen,
  children,
}: MandalaCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowIntensity = useAudioLevel(isPlaying);

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
      className={`flex-1 w-full h-full relative flex items-center justify-center p-4 md:p-8 rounded-[40px] border border-white/5 shadow-2xl transition-all duration-700 ${isFullScreen ? 'm-0 rounded-none z-10' : 'z-10'}`}
      style={{ background: `linear-gradient(135deg, rgba(${rgbString}, 0.04) 0%, rgba(${rgbString}, 0.01) 50%, rgba(${rgbString}, 0.03) 100%)` }}
    >
      <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} style={{ background: `radial-gradient(circle at 30% 50%, rgba(${rgbString}, 0.1) 0%, transparent 50%)` }} />
      <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: glowIntensity * 0.4 }} transition={{ duration: 0.1 }} style={{ background: `radial-gradient(circle at 50% 50%, rgba(${rgbString}, 0.2) 0%, transparent 60%)`, filter: `blur(${60 + glowIntensity * 40}px)` }} />
      
      <div 
        className="relative flex items-center justify-center z-10 w-full h-full max-w-full max-h-full"
      >
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
          isPlaying={isPlaying}
        />
        
        <motion.div className="absolute inset-0 blur-[100px] opacity-10 pointer-events-none rounded-full" animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} style={{ backgroundColor: chakraColor }} />
      </div>

      <motion.div className="absolute inset-0 rounded-[40px] pointer-events-none" animate={{ opacity: glowIntensity * 0.2 }} transition={{ duration: 0.1 }} style={{ border: `1px solid rgba(${rgbString}, 0.1)`, boxShadow: `inset 0 0 50px rgba(${rgbString}, 0.05)` }} />
      
      {children && (
        <div className="absolute inset-x-0 top-8 z-20 flex justify-center px-6 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-xl">
            {children}
          </div>
        </div>
      )}
    </motion.div>
  );
});
