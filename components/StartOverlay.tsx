'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Play } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StartOverlayProps {
  hasStarted: boolean;
  onStart: () => void;
  isMounted: boolean;
}

export function StartOverlay({ hasStarted, onStart, isMounted }: StartOverlayProps) {
  return (
    <AnimatePresence>
      {!hasStarted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.2 } }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        >
          {/* Deep Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#030108] via-[#0a0318] to-[#020202]" />

          {/* Animated Sacred Geometry Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="landing-ring absolute w-[500px] h-[500px] rounded-full border border-purple-400/15" />
            <div className="landing-ring-reverse absolute w-[380px] h-[380px] rounded-full border border-indigo-400/10" style={{ animationDelay: '-3s' }} />
            <div className="landing-ring absolute w-[650px] h-[650px] rounded-full border border-purple-300/8" style={{ animationDuration: '30s' }} />
            <div className="landing-ring-reverse absolute w-[280px] h-[280px] rounded-full border-2 border-violet-400/10" style={{ animationDelay: '-7s', animationDuration: '18s' }} />
            <div className="landing-ring absolute w-[800px] h-[800px] rounded-full border border-purple-500/5" style={{ animationDuration: '35s', animationDelay: '-12s' }} />
          </div>

          {/* Pulsing Central Glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-[400px] h-[400px] rounded-full bg-purple-500/20 blur-[120px]"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="w-[300px] h-[300px] rounded-full bg-indigo-400/15 blur-[100px]"
            />
          </div>

          {/* Floating Particle Dust — client-only to avoid hydration mismatch */}
          {isMounted && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="landing-particle"
                  style={{
                    left: `${5 + ((i * 31 + 7) % 90)}%`,
                    bottom: `${-5 - (i % 10)}%`,
                    animationDelay: `${(i * 1.7) % 8}s`,
                    animationDuration: `${6 + (i * 1.3) % 6}s`,
                    width: `${1 + (i % 3)}px`,
                    height: `${1 + ((i + 1) % 3)}px`,
                    opacity: 0.3 + ((i * 17) % 50) / 100,
                  }}
                />
              ))}
            </div>
          )}

          {/* Main Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            className="relative z-10 text-center px-8 max-w-2xl"
          >
            {/* Sacred Mandala Icon */}
            <div className="mb-10 relative inline-block landing-float">
              <div className="absolute inset-0 bg-purple-400/20 blur-[60px] rounded-full scale-[2.5]" />
              <div className="relative">
                {isMounted && (
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
                    {Array.from({ length: 12 }).map((_, i) => {
                      const angle = (i / 12) * Math.PI * 2;
                      const x = (40 + Math.cos(angle) * 34).toFixed(3);
                      const y = (40 + Math.sin(angle) * 34).toFixed(3);
                      return <circle key={i} cx={x} cy={y} r="1.5" fill="currentColor" opacity="0.25" />;
                    })}
                  </svg>
                )}
              </div>
            </div>
            
            {/* Title */}
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-6xl md:text-7xl font-extralight tracking-[0.25em] mb-3"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(192,132,252,0.6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              AYAGUIDE
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-white/35 text-sm tracking-[0.4em] font-light uppercase mb-8"
            >
              Portal de Meditação Sonora
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-white/25 text-sm font-light leading-relaxed max-w-md mx-auto mb-10 tracking-wide"
            >
              Uma experiência imersiva que combina frequências dos chakras, sons da natureza e mandalas dinâmicas para guiar sua jornada de meditação profunda.
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-3 mb-14"
            >
              {[
                { icon: '🎵', text: '7 Frequências dos Chakras' },
                { icon: '🌿', text: '16 Sons da Natureza' },
                { icon: '🔮', text: 'Mandalas Reativas ao Som' },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm"
                >
                  <span className="text-sm">{feature.icon}</span>
                  <span className="text-[11px] text-white/40 tracking-wider font-light">{feature.text}</span>
                </div>
              ))}
            </motion.div>
            
            {/* Glowing CTA Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.8 }}
              className="relative inline-block"
            >
              {/* Pulsing Outer Ring */}
              <div className="absolute inset-0 rounded-full btn-glow-ring border-2 border-purple-400/20" style={{ margin: '-8px' }} />
              <div className="absolute inset-0 rounded-full btn-glow-ring border border-purple-300/10" style={{ margin: '-16px', animationDelay: '0.5s' }} />
              
              <button
                onClick={onStart}
                data-testid="start-session-button"
                className="relative group px-14 py-5 rounded-full overflow-hidden btn-glow transition-all duration-500 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(192, 132, 252, 0.1) 50%, rgba(139, 92, 246, 0.15) 100%)', border: '1px solid rgba(192, 132, 252, 0.25)' }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent" style={{ animation: 'shimmer-slide 2s infinite' }} />
                </div>
                
                <span className="relative flex items-center gap-3">
                  <Play className="w-5 h-5 text-purple-300/80 fill-purple-300/60" />
                  <span className="text-sm tracking-[0.4em] font-light uppercase text-white/80 group-hover:text-white transition-colors">
                    Entrar na Jornada
                  </span>
                </span>
              </button>
            </motion.div>
            
            {/* Bottom Attribution */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 1 }}
              className="mt-12 text-white/15 text-[10px] tracking-[0.4em] uppercase font-light"
            >
              Desenvolvido para sessões de meditação profunda
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
