'use client';

import React from 'react';
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
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-[81] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg"
          >
            <div className="rounded-3xl bg-[#0a0a0f]/95 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <div>
                  <h2 className="text-base font-light tracking-[0.2em] uppercase text-white/80">
                    Técnica de Respiração
                  </h2>
                  <p className="text-[10px] text-white/30 tracking-wider mt-1 uppercase">
                    Escolha o padrão ideal para seu momento
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Pattern List */}
              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto sidebar-scroll">
                {BREATHING_PATTERNS.map((pattern, idx) => {
                  const isActive = pattern.id === currentPatternId;
                  return (
                    <motion.button
                      key={pattern.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      onClick={() => { onSelect(pattern); onClose(); }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group ${
                        isActive
                          ? 'border-white/20 bg-white/[0.08]'
                          : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Emoji */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all ${
                          isActive ? 'bg-white/10 shadow-lg' : 'bg-white/5 group-hover:bg-white/8'
                        }`}
                          style={isActive ? { boxShadow: `0 0 20px ${chakraColor}30` } : undefined}
                        >
                          {pattern.emoji}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
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
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: chakraColor, boxShadow: `0 0 8px ${chakraColor}` }}
                              />
                            )}
                          </div>
                          <p className="text-[10px] text-white/30 mt-0.5 tracking-wider">
                            {pattern.description}
                          </p>

                          {/* Phase Visual */}
                          <div className="flex items-center gap-1 mt-2">
                            {pattern.phases.map((phase, pi) => (
                              <React.Fragment key={pi}>
                                <div
                                  className="h-1 rounded-full transition-all"
                                  style={{
                                    width: `${Math.max(12, (phase.duration / pattern.cycleDuration) * 160)}px`,
                                    backgroundColor: isActive
                                      ? chakraColor
                                      : 'rgba(255,255,255,0.15)',
                                    opacity: isActive ? 0.7 : 0.4,
                                  }}
                                />
                                {pi < pattern.phases.length - 1 && (
                                  <div className="w-0.5 h-0.5 rounded-full bg-white/10" />
                                )}
                              </React.Fragment>
                            ))}
                          </div>

                          {/* Indication Tag */}
                          <div className="mt-2">
                            <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest ${
                              isActive
                                ? 'bg-white/10 text-white/50'
                                : 'bg-white/5 text-white/25'
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
