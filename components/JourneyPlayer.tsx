'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, SkipForward, Compass } from 'lucide-react';
import { getJourney, JOURNEYS, formatJourneyDuration } from '@/lib/journeys';
import { CHAKRAS } from '@/lib/constants';
import type { Chakra, ActiveJourney } from '@/lib/types';

interface JourneyPlayerProps {
  activeJourney: ActiveJourney | null;
  isPlaying: boolean;
  onStartJourney: (journeyId: string) => void;
  onAdvancePhase: () => void;
  onExit: () => void;
}

export const JourneyPlayer = memo(function JourneyPlayer({ activeJourney, isPlaying, onAdvancePhase, onExit }: JourneyPlayerProps) {
  if (!activeJourney) return null;
  
  const journey = getJourney(activeJourney.journeyId);
  if (!journey) return null;

  const currentPhase = journey.phases[activeJourney.currentPhaseIndex];
  const chakra = (CHAKRAS as Chakra[]).find(c => c.id === currentPhase.chakraId);
  
  const phaseProgress = currentPhase
    ? ((currentPhase.duration - activeJourney.phaseTimeLeft) / currentPhase.duration) * 100
    : 0;

  const phaseMinLeft = Math.floor(activeJourney.phaseTimeLeft / 60);
  const phaseSecLeft = activeJourney.phaseTimeLeft % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="w-full relative z-30"
    >
      <div className="glass-card rounded-[28px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden backdrop-blur-3xl">
        {/* Phase Progress Bar */}
        <div className="flex h-[3px] w-full bg-white/5 relative overflow-hidden">
          {journey.phases.map((phase, i) => (
            <div
              key={i}
              className="h-full relative transition-all duration-700"
              style={{ width: `${(phase.duration / journey.totalDuration) * 100}%` }}
            >
              <div
                className="h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_currentColor]"
                style={{
                  width: i < activeJourney.currentPhaseIndex ? '100%'
                    : i === activeJourney.currentPhaseIndex ? `${phaseProgress}%`
                    : '0%',
                  backgroundColor: (CHAKRAS as Chakra[]).find(c => c.id === phase.chakraId)?.palette.primary || 'white',
                  color: (CHAKRAS as Chakra[]).find(c => c.id === phase.chakraId)?.palette.primary || 'white',
                  opacity: i <= activeJourney.currentPhaseIndex ? 0.8 : 0.1,
                }}
              />
              {/* Phase separator */}
              {i < journey.phases.length - 1 && (
                <div className="absolute right-0 top-0 w-[1px] h-full bg-white/10 z-10" />
              )}
            </div>
          ))}
        </div>

        <div className="p-4 md:p-5 flex items-center gap-4 md:gap-6">
          {/* Journey icon + info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative group shrink-0">
              {/* Dynamic Aura */}
              <motion.div 
                animate={{ 
                    scale: isPlaying ? [1, 1.2, 1] : 1,
                    opacity: isPlaying ? [0.2, 0.4, 0.2] : 0.1 
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 blur-xl rounded-full"
                style={{ backgroundColor: chakra?.palette.primary || 'white' }}
              />
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl relative z-10 shadow-inner">
                {journey.emoji}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <span className="text-[10px] md:text-[11px] font-bold text-white/80 tracking-[0.25em] uppercase truncate">
                  {journey.name}
                </span>
                <span className="text-[9px] md:text-[10px] text-white/30 font-mono font-medium bg-white/5 px-2 py-0.5 rounded-full border border-white/5 shrink-0">
                  {activeJourney.currentPhaseIndex + 1} / {journey.phases.length}
                </span>
              </div>
              
              {/* Phase message with Smooth AnimatePresence */}
              <div className="h-4 overflow-hidden mt-1.5">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeJourney.currentPhaseIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="text-[10px] text-white/40 tracking-wider font-light italic truncate"
                  >
                    &quot;{currentPhase.message}&quot;
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Phase timer & Controls */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0 pl-4 border-l border-white/5">
            <div className="flex flex-col items-center">
                <span className="text-xs md:text-sm font-mono font-light text-white/60 tabular-nums">
                {phaseMinLeft}:{phaseSecLeft.toString().padStart(2, '0')}
                </span>
                {chakra && (
                <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full mt-1"
                    style={{ backgroundColor: chakra.palette.primary, boxShadow: `0 0 8px ${chakra.palette.primary}` }}
                />
                )}
            </div>

            <div className="flex items-center gap-2">
                <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.9 }}
                onClick={onAdvancePhase}
                className="w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                title="Próxima fase"
                aria-label="Pular fase da jornada"
                >
                <SkipForward className="w-4 h-4" />
                </motion.button>

                <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                whileTap={{ scale: 0.9 }}
                onClick={onExit}
                className="w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center text-white/30 hover:text-red-400 transition-all outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
                title="Encerrar jornada"
                aria-label="Sair da jornada guiada"
                >
                <X className="w-4 h-4" />
                </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// ===================== Journey Selector (for Sidebar) =====================

interface JourneySelectorProps {
  onStart: (journeyId: string) => void;
  isJourneyActive: boolean;
  chakraColor: string;
}

export const JourneySelector = memo(function JourneySelector({ onStart, isJourneyActive, chakraColor }: JourneySelectorProps) {
  return (
    <div className="grid gap-3">
      {JOURNEYS.map((journey, idx) => (
        <motion.button
          key={journey.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          onClick={() => onStart(journey.id)}
          disabled={isJourneyActive}
          className={`w-full text-left p-4 rounded-[20px] border transition-all duration-500 group relative overflow-hidden ${
            isJourneyActive
              ? 'opacity-40 cursor-not-allowed border-white/5 bg-white/[0.01]'
              : 'border-white/5 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.08] shadow-lg'
          }`}
        >
          <div className="flex items-start gap-4 h-full relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-white/5 group-hover:bg-white/10 border border-white/5 flex items-center justify-center text-xl shrink-0 transition-all duration-500 group-hover:scale-110 shadow-inner">
              {journey.emoji}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] md:text-[11px] font-bold text-white/50 group-hover:text-white/90 tracking-[0.2em] uppercase transition-colors">
                    {journey.name}
                  </span>
                  <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                    <Compass className="w-2.5 h-2.5 text-white/20" />
                    <span className="text-[9px] font-mono font-medium text-white/30 shrink-0">
                      {formatJourneyDuration(journey.totalDuration)}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-white/25 group-hover:text-white/40 leading-relaxed font-light tracking-wide line-clamp-2 transition-colors">
                  {journey.description}
                </p>
              </div>

              {/* Phase Indicators */}
              <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/5">
                {journey.phases.map((phase, pi) => {
                  const pChakra = (CHAKRAS as Chakra[]).find(c => c.id === phase.chakraId);
                  return (
                    <motion.div
                      key={pi}
                      className="w-1.5 h-1.5 rounded-full transition-all opacity-30 group-hover:opacity-100"
                      style={{ 
                        backgroundColor: pChakra?.palette.primary || 'white',
                        boxShadow: `0 0 5px ${pChakra?.palette.primary}60`
                      }}
                      title={pChakra?.name || phase.chakraId}
                    />
                  );
                })}
                <span className="text-[8px] text-white/10 group-hover:text-white/20 ml-auto font-mono uppercase tracking-widest">
                  {journey.phases.length} Estágios
                </span>
              </div>
            </div>
          </div>
          
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] -mr-16 -mt-16 rounded-full transition-opacity opacity-0 group-hover:opacity-100" />
        </motion.button>
      ))}
    </div>
  );
});
