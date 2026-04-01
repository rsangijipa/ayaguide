'use client';

import { Play } from 'lucide-react';
import React from 'react';

interface LandingHeroProps {
  onStart: () => void;
}

/**
 * LandingHero: SSR-Friendly Hero Section
 * 
 * Optimized for LCP (Largest Contentful Paint).
 * - Uses pure CSS for initial animations to avoid JS execution delay.
 * - Minimal initial HTML footprint.
 * - Immediate visibility (no opacity: 0 on mount).
 */
export function LandingHero({ onStart }: LandingHeroProps) {
  return (
    <div className="relative z-10 text-center px-8 max-w-2xl animate-in fade-in duration-1000">
      {/* Sacred Mandala Icon */}
      <div className="mb-10 relative inline-block animate-float">
        <div className="absolute inset-0 bg-purple-400/20 blur-[60px] rounded-full scale-[2.5]" />
        <div className="relative">
          <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto text-white/80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            <circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
            <circle cx="40" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
            <circle cx="40" cy="40" r="5" fill="currentColor" opacity="0.8" />
            {/* Petal shapes */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const x = (40 + Math.cos(angle) * 24).toFixed(3);
              const y = (40 + Math.sin(angle) * 24).toFixed(3);
              return <circle key={i} cx={x} cy={y} r="2" fill="currentColor" opacity="0.4" />;
            })}
          </svg>
        </div>
      </div>
      
      {/* Title */}
      <h1 
        className="text-6xl md:text-7xl font-extralight tracking-[0.25em] mb-3 animate-in slide-in-from-bottom-5 duration-700 delay-200"
        style={{ 
          background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(192,132,252,0.6) 100%)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent' 
        }}
      >
        AYAGUIDE
      </h1>

      {/* Subtitle */}
      <p className="text-white/35 text-sm tracking-[0.4em] font-light uppercase mb-8 animate-in fade-in duration-1000 delay-500">
        Portal de Meditação Sonora
      </p>

      {/* Feature Pills */}
      <div className="flex flex-wrap justify-center gap-3 mb-14 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-700">
        {[
          { icon: '🎵', text: '7 Frequências' },
          { icon: '🌿', text: '16 Sons Natureza' },
          { icon: '🔮', text: 'Mandalas Reativas' },
        ].map((feature, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm"
          >
            <span className="text-sm">{feature.icon}</span>
            <span className="text-[11px] text-white/40 tracking-wider font-light">{feature.text}</span>
          </div>
        ))}
      </div>
      
      {/* CTA Button */}
      <div className="relative inline-block animate-in zoom-in-95 fade-in duration-700 delay-1000">
        <div className="absolute inset-0 rounded-full btn-glow-ring border-2 border-purple-400/20" style={{ margin: '-8px' }} />
        <button
          onClick={onStart}
          className="relative group px-14 py-5 rounded-full overflow-hidden btn-glow transition-all duration-500 hover:scale-105"
          style={{ 
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(192, 132, 252, 0.1) 50%, rgba(139, 92, 246, 0.15) 100%)', 
            border: '1px solid rgba(192, 132, 252, 0.25)' 
          }}
        >
          <span className="relative flex items-center gap-3 text-white">
            <Play className="w-5 h-5 text-purple-300/80 fill-purple-300/60" />
            <span className="text-sm tracking-[0.4em] font-light uppercase text-white/80 group-hover:text-white transition-colors">
              Entrar na Jornada
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
