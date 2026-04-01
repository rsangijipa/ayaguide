'use client';

import React, { useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { BREATHING_PATTERNS, type BreathingPattern } from '@/lib/breathingPatterns';

interface BreathingPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pattern: BreathingPattern) => void;
  currentPatternId: string;
  chakraColor: string;
}

export function BreathingPicker({ isOpen, onClose, onSelect, currentPatternId, chakraColor }: BreathingPickerProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-[81] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2"
          >
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0f]/95 shadow-2xl backdrop-blur-3xl">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
                <div>
                  <h2 id={titleId} className="text-base font-light uppercase tracking-[0.2em] text-white/80">
                    Tecnica de Respiracao
                  </h2>
                  <p id={descriptionId} className="mt-1 text-[10px] uppercase tracking-wider text-white/30">
                    Escolha o padrao ideal para o momento
                  </p>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  aria-label="Fechar seletor de respiracao"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white/80 focus-visible:ring-2 focus-visible:ring-white/30 outline-none"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </motion.button>
              </div>

              <div className="sidebar-scroll max-h-[60vh] space-y-2 overflow-y-auto p-4 [overscroll-behavior:contain]">
                {BREATHING_PATTERNS.map((pattern, idx) => {
                  const isActive = pattern.id === currentPatternId;
                  return (
                    <motion.button
                      key={pattern.id}
                      type="button"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      onClick={() => {
                        onSelect(pattern);
                        onClose();
                      }}
                      aria-pressed={isActive}
                      className={`group w-full rounded-2xl border p-4 text-left outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white/30 ${
                        isActive
                          ? 'border-white/20 bg-white/[0.08]'
                          : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-all ${
                            isActive ? 'bg-white/10 shadow-lg' : 'bg-white/5 group-hover:bg-white/8'
                          }`}
                          style={isActive ? { boxShadow: `0 0 20px ${chakraColor}30` } : undefined}
                          aria-hidden="true"
                        >
                          {pattern.emoji}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium tracking-wide transition-colors ${
                              isActive ? 'text-white/90' : 'text-white/60 group-hover:text-white/80'
                            }`}>
                              {pattern.name}
                            </span>
                            {isActive && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: chakraColor, boxShadow: `0 0 8px ${chakraColor}` }}
                              />
                            )}
                          </div>
                          <p className="mt-0.5 text-[10px] tracking-wider text-white/30">{pattern.description}</p>

                          <div className="mt-2 flex items-center gap-1">
                            {pattern.phases.map((phase, phaseIndex) => (
                              <React.Fragment key={phaseIndex}>
                                <div
                                  className="h-1 rounded-full transition-all"
                                  style={{
                                    width: `${Math.max(12, (phase.duration / pattern.cycleDuration) * 160)}px`,
                                    backgroundColor: isActive ? chakraColor : 'rgba(255,255,255,0.15)',
                                    opacity: isActive ? 0.7 : 0.4,
                                  }}
                                />
                                {phaseIndex < pattern.phases.length - 1 && <div className="h-0.5 w-0.5 rounded-full bg-white/10" />}
                              </React.Fragment>
                            ))}
                          </div>

                          <div className="mt-2">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest ${
                              isActive ? 'bg-white/10 text-white/50' : 'bg-white/5 text-white/25'
                            }`}>
                              {pattern.indication}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
