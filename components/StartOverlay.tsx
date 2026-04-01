'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Play } from 'lucide-react';

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
          <div className="absolute inset-0 bg-gradient-to-b from-[#030108] via-[#0a0318] to-[#020202]" />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="landing-ring absolute h-[500px] w-[500px] rounded-full border border-purple-400/15" />
            <div className="landing-ring-reverse absolute h-[380px] w-[380px] rounded-full border border-indigo-400/10" style={{ animationDelay: '-3s' }} />
            <div className="landing-ring absolute h-[650px] w-[650px] rounded-full border border-purple-300/8" style={{ animationDuration: '30s' }} />
            <div className="landing-ring-reverse absolute h-[280px] w-[280px] rounded-full border-2 border-violet-400/10" style={{ animationDelay: '-7s', animationDuration: '18s' }} />
            <div className="landing-ring absolute h-[800px] w-[800px] rounded-full border border-purple-500/5" style={{ animationDuration: '35s', animationDelay: '-12s' }} />
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="h-[400px] w-[400px] rounded-full bg-purple-500/20 blur-[120px]"
            />
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="h-[300px] w-[300px] rounded-full bg-indigo-400/15 blur-[100px]"
            />
          </div>

          {isMounted && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
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

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
            className="relative z-10 max-w-2xl px-8 text-center"
          >
            <div className="landing-float relative mb-10 inline-block">
              <div className="absolute inset-0 scale-[2.5] rounded-full bg-purple-400/20 blur-[60px]" />
              <div className="relative">
                {isMounted && (
                  <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto text-white/80" aria-hidden="true">
                    <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                    <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
                    <circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                    <circle cx="40" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
                    <circle cx="40" cy="40" r="5" fill="currentColor" opacity="0.8" />
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

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-3 text-6xl font-extralight tracking-[0.25em] text-balance md:text-7xl"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(192,132,252,0.6) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AYAGUIDE
            </motion.h1>

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mb-8 text-sm font-light uppercase tracking-[0.4em] text-white/35"
            >
              Portal de Meditacao Sonora
            </motion.p>

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="mx-auto mb-10 max-w-md text-sm font-light leading-relaxed tracking-wide text-white/25"
            >
              Uma experiencia imersiva que combina frequencias dos chakras, sons da natureza e mandalas dinamicas para guiar uma meditacao profunda.
            </motion.p>

            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="mb-14 flex flex-wrap justify-center gap-3"
            >
              {[
                { icon: '\u{1F3B5}', text: '7 Frequencias dos Chakras' },
                { icon: '\u{1F33F}', text: '16 Sons da Natureza' },
                { icon: '\u{1F52E}', text: 'Mandalas Reativas ao Som' },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-4 py-2 backdrop-blur-sm"
                >
                  <span className="text-sm" aria-hidden="true">{feature.icon}</span>
                  <span className="text-[11px] font-light tracking-wider text-white/40">{feature.text}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.8 }}
              className="relative inline-block"
            >
              <div className="btn-glow-ring absolute inset-0 rounded-full border-2 border-purple-400/20" style={{ margin: '-8px' }} />
              <div className="btn-glow-ring absolute inset-0 rounded-full border border-purple-300/10" style={{ margin: '-16px', animationDelay: '0.5s' }} />

              <button
                type="button"
                onClick={onStart}
                data-testid="start-session-button"
                className="btn-glow group relative overflow-hidden rounded-full px-14 py-5 transition-all duration-500 hover:scale-105 focus-visible:ring-2 focus-visible:ring-purple-300/60 outline-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(192, 132, 252, 0.1) 50%, rgba(139, 92, 246, 0.15) 100%)',
                  border: '1px solid rgba(192, 132, 252, 0.25)',
                }}
              >
                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent" style={{ animation: 'shimmer-slide 2s infinite' }} />
                </div>

                <span className="relative flex items-center gap-3">
                  <Play className="h-5 w-5 fill-purple-300/60 text-purple-300/80" aria-hidden="true" />
                  <span className="text-sm font-light uppercase tracking-[0.4em] text-white/80 transition-colors group-hover:text-white">
                    Entrar na Jornada
                  </span>
                </span>
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 1 }}
              className="mt-12 text-[10px] font-light uppercase tracking-[0.4em] text-white/15"
            >
              Desenvolvido para sessoes de meditacao profunda
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
