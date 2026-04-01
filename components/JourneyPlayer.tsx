'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, SkipForward } from 'lucide-react';
import { type Journey, getJourney, JOURNEYS, formatJourneyDuration } from '@/lib/journeys';
import { CHAKRAS } from '@/lib/constants';
import type { Chakra, ActiveJourney } from '@/lib/types';
import { showToast } from '@/components/Toast';

interface JourneyPlayerProps {
  activeJourney: ActiveJourney | null;
  isPlaying: boolean;
  onStartJourney: (journeyId: string) => void;
  onAdvancePhase: () => void;
  onExit: () => void;
}

export function JourneyPlayer({ activeJourney, isPlaying, onStartJourney, onAdvancePhase, onExit }: JourneyPlayerProps) {
  if (!activeJourney) return null;
  
  const journey = getJourney(activeJourney.journeyId);
  if (!journey) return null;

  const currentPhase = journey.phases[activeJourney.currentPhaseIndex];
  const chakra = (CHAKRAS as Chakra[]).find(c => c.id === currentPhase.chakraId);
  const progress = ((activeJourney.currentPhaseIndex) / journey.phases.length) * 100;
  const phaseProgress = currentPhase
    ? ((currentPhase.duration - activeJourney.phaseTimeLeft) / currentPhase.duration) * 100
    : 0;

  const phaseMinLeft = Math.floor(activeJourney.phaseTimeLeft / 60);
  const phaseSecLeft = activeJourney.phaseTimeLeft % 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full"
    >
      <div className="rounded-2xl bg-[#0a0a0f]/90 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Phase Progress Bar */}
        <div className="flex h-1 w-full bg-white/5">
          {journey.phases.map((phase, i) => (
            <div
              key={i}
              className="h-full relative"
              style={{ width: `${(phase.duration / journey.totalDuration) * 100}%` }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: i < activeJourney.currentPhaseIndex ? '100%'
                    : i === activeJourney.currentPhaseIndex ? `${phaseProgress}%`
                    : '0%',
                  backgroundColor: (CHAKRAS as Chakra[]).find(c => c.id === phase.chakraId)?.palette.primary || 'white',
                  opacity: 0.8,
                }}
              />
              {/* Phase separator */}
              {i < journey.phases.length - 1 && (
                <div className="absolute right-0 top-0 w-px h-full bg-white/10" />
              )}
            </div>
          ))}
        </div>

        <div className="p-4 flex items-center gap-4">
          {/* Journey icon + info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg shrink-0"
              style={chakra ? { boxShadow: `0 0 15px ${chakra.palette.primary}20` } : undefined}
            >
              {journey.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-white/70 tracking-wider uppercase truncate">
                  {journey.name}
                </span>
                <span className="text-[9px] text-white/25 font-mono shrink-0">
                  {activeJourney.currentPhaseIndex + 1}/{journey.phases.length}
                </span>
              </div>
              {/* Phase message */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeJourney.currentPhaseIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-[10px] text-white/35 mt-0.5 truncate font-light tracking-wide"
                >
                  {currentPhase.message}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Phase timer */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-white/40">
              {phaseMinLeft}:{phaseSecLeft.toString().padStart(2, '0')}
            </span>

            {/* Active chakra indicator */}
            {chakra && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: chakra.palette.primary, boxShadow: `0 0 8px ${chakra.palette.primary}` }}
              />
            )}

            {/* Skip phase */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onAdvancePhase}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-all"
              title="Próxima fase"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </motion.button>

            {/* Exit journey */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onExit}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/25 hover:text-red-400 hover:border-red-400/30 transition-all"
              title="Sair da jornada"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ===================== Journey Selector (for Sidebar) =====================

interface JourneySelectorProps {
  onStart: (journeyId: string) => void;
  isJourneyActive: boolean;
  chakraColor: string;
}

export function JourneySelector({ onStart, isJourneyActive, chakraColor }: JourneySelectorProps) {
  return (
    <div className="space-y-2">
      {JOURNEYS.map((journey, idx) => (
        <motion.button
          key={journey.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          onClick={() => onStart(journey.id)}
          disabled={isJourneyActive}
          className={`w-full text-left p-3 rounded-xl border transition-all duration-300 group ${
            isJourneyActive
              ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/[0.01]'
              : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/5 group-hover:bg-white/8 flex items-center justify-center text-base shrink-0 transition-all">
              {journey.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-white/50 group-hover:text-white/80 tracking-wider uppercase transition-colors">
                  {journey.name}
                </span>
                <span className="text-[9px] font-mono text-white/20 shrink-0">
                  {formatJourneyDuration(journey.totalDuration)}
                </span>
              </div>
              <p className="text-[9px] text-white/25 mt-0.5 tracking-wider line-clamp-2">
                {journey.description}
              </p>
              {/* Phase dots */}
              <div className="flex items-center gap-1 mt-2">
                {journey.phases.map((phase, pi) => {
                  const pChakra = (CHAKRAS as Chakra[]).find(c => c.id === phase.chakraId);
                  return (
                    <div
                      key={pi}
                      className="w-2 h-2 rounded-full transition-all opacity-40 group-hover:opacity-80"
                      style={{ backgroundColor: pChakra?.palette.primary || 'white' }}
                      title={pChakra?.name || phase.chakraId}
                    />
                  );
                })}
                <span className="text-[8px] text-white/15 ml-1 font-mono">
                  {journey.phases.length} fases
                </span>
              </div>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
