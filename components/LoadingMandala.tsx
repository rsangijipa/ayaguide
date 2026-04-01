'use client';

import React from 'react';

/**
 * LoadingMandala: A lightweight SVG pulsing indicator.
 * Used as a fallback while the heavy SessionUI JS bundles are downloading.
 */
export function LoadingMandala() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#020202]/60 backdrop-blur-3xl z-[200] animate-in fade-in duration-700">
      <div className="relative">
        {/* Pulsing Outer Glow */}
        <div className="absolute inset-0 bg-purple-500/20 blur-[60px] rounded-full scale-[2.5] animate-pulse" />
        
        {/* Simple SVG Mandala */}
        <svg width="120" height="120" viewBox="0 0 100 100" className="relative text-purple-400/60 animate-spin-slow">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1" />
          
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const x = 50 + Math.cos(angle) * 35;
            const y = 50 + Math.sin(angle) * 35;
            return <circle key={i} cx={x} cy={y} r="1.5" fill="currentColor" />;
          })}
          
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const x = 50 + Math.cos(angle) * 15;
            const y = 50 + Math.sin(angle) * 15;
            return <circle key={i} cx={x} cy={y} r="3" fill="currentColor" className="opacity-80" />;
          })}
          
          <circle cx="50" cy="50" r="6" fill="currentColor" className="animate-pulse" />
        </svg>
        
        <p className="absolute top-full left-1/2 -translate-x-1/2 mt-8 text-white/20 text-[10px] tracking-[0.5em] uppercase whitespace-nowrap animate-pulse">
          Iniciando Jornada...
        </p>
      </div>
    </div>
  );
}
