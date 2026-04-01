'use client';

import React from 'react';

/**
 * HeroDecoration: CSS-only decorative elements for the landing page.
 * Provides depth and visual identity without JS overhead.
 */
export function HeroDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Heavy Animated Sacred Geometry Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="landing-ring absolute w-[500px] h-[500px] rounded-full border border-purple-400/15" />
        <div className="landing-ring-reverse absolute w-[380px] h-[380px] rounded-full border border-indigo-400/10" style={{ animationDelay: '-3s' }} />
        <div className="landing-ring absolute w-[650px] h-[650px] rounded-full border border-purple-300/8" style={{ animationDuration: '30s' }} />
        <div className="landing-ring-reverse absolute w-[280px] h-[280px] rounded-full border-2 border-violet-400/10" style={{ animationDelay: '-7s', animationDuration: '18s' }} />
      </div>

      {/* Pulsing Central Glow */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40">
        <div className="w-[400px] h-[400px] rounded-full bg-purple-500/20 blur-[120px] animate-pulse" />
        <div className="w-[300px] h-[300px] rounded-full bg-indigo-400/15 blur-[100px] animate-pulse delay-700" />
      </div>

      {/* Floating Particle Dust */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="landing-particle"
            style={{
              left: `${5 + ((i * 31 + 7) % 90)}%`,
              bottom: `${-5 - (i % 10)}%`,
              animationDelay: `${(i * 1.7) % 8}s`,
              animationDuration: `${12 + (i * 1.3) % 6}s`,
              width: `${1 + (i % 2)}px`,
              height: `${1 + (i % 2)}px`,
              opacity: 0.1 + ((i * 17) % 30) / 100,
            }}
          />
        ))}
      </div>
    </div>
  );
}
