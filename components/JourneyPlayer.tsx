'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, SkipForward, Compass } from 'lucide-react';
import { CHAKRAS } from '@/lib/constants';
import { getJourney, JOURNEYS, formatJourneyDuration } from '@/lib/journeys';
import type { Chakra, ActiveJourney } from '@/lib/types';

interface JourneyPlayerProps {
  activeJourney: ActiveJourney | null;
  isPlaying: boolean;
  onStartJourney: (journeyId: string) => void;
  onAdvancePhase: () => void;
  onExit: () => void;
}

export const JourneyPlayer = memo(function JourneyPlayer({
  activeJourney,
  isPlaying,
  onAdvancePhase,
  onExit,
}: JourneyPlayerProps) {
  if (!activeJourney) return null;

  const journey = getJourney(activeJourney.journeyId);
  if (!journey) return null;

  const currentPhase = journey.phases[activeJourney.currentPhaseIndex];
  const chakra = (CHAKRAS as Chakra[]).find((item) => item.id === currentPhase.chakraId);
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
      className="relative z-30 w-full"
    >
      <div className="glass-card overflow-hidden rounded-[28px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-3xl">
        <div className="relative flex h-[3px] w-full overflow-hidden bg-white/5">
          {journey.phases.map((phase, index) => (
            <div
              key={index}
              className="relative h-full transition-all duration-700"
              style={{ width: `${(phase.duration / journey.totalDuration) * 100}%` }}
            >
              <div
                className="h-full shadow-[0_0_10px_currentColor] transition-all duration-1000 ease-linear"
                style={{
                  width:
                    index < activeJourney.currentPhaseIndex
                      ? '100%'
                      : index === activeJourney.currentPhaseIndex
                        ? `${phaseProgress}%`
                        : '0%',
                  backgroundColor:
                    (CHAKRAS as Chakra[]).find((item) => item.id === phase.chakraId)?.palette.primary || 'white',
                  color: (CHAKRAS as Chakra[]).find((item) => item.id === phase.chakraId)?.palette.primary || 'white',
                  opacity: index <= activeJourney.currentPhaseIndex ? 0.8 : 0.1,
                }}
              />
              {index < journey.phases.length - 1 && (
                <div className="absolute right-0 top-0 z-10 h-full w-[1px] bg-white/10" />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 p-4 md:gap-6 md:p-5">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="relative shrink-0">
              <motion.div
                animate={{
                  scale: isPlaying ? [1, 1.2, 1] : 1,
                  opacity: isPlaying ? [0.2, 0.4, 0.2] : 0.1,
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 rounded-full blur-xl"
                style={{ backgroundColor: chakra?.palette.primary || 'white' }}
              />
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl shadow-inner">
                {journey.emoji}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <span className="truncate text-[10px] font-bold uppercase tracking-[0.25em] text-white/80 md:text-[11px]">
                  {journey.name}
                </span>
                <span className="shrink-0 rounded-full border border-white/5 bg-white/5 px-2 py-0.5 font-mono text-[9px] font-medium text-white/30 md:text-[10px]">
                  {activeJourney.currentPhaseIndex + 1} / {journey.phases.length}
                </span>
              </div>

              <div className="mt-1.5 h-4 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeJourney.currentPhaseIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="truncate text-[10px] font-light italic tracking-wider text-white/40"
                  >
                    &quot;{currentPhase.message}&quot;
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 border-l border-white/5 pl-4 md:gap-4">
            <div className="flex flex-col items-center">
              <span className="tabular-nums text-xs font-light text-white/60 md:text-sm">
                {phaseMinLeft}:{phaseSecLeft.toString().padStart(2, '0')}
              </span>
              {chakra && (
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mt-1 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: chakra.palette.primary, boxShadow: `0 0 8px ${chakra.palette.primary}` }}
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.9 }}
                onClick={onAdvancePhase}
                className="glass flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/40 outline-none transition-all hover:text-white focus-visible:ring-2 focus-visible:ring-white/20"
                title="Proxima fase"
                aria-label="Pular fase da jornada"
              >
                <SkipForward className="h-4 w-4" />
              </motion.button>

              <motion.button
                whileHover={{
                  scale: 1.1,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                }}
                whileTap={{ scale: 0.9 }}
                onClick={onExit}
                className="glass flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/30 outline-none transition-all hover:text-red-400 focus-visible:ring-2 focus-visible:ring-red-400/40"
                title="Encerrar jornada"
                aria-label="Sair da jornada guiada"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

interface JourneySelectorProps {
  onStart: (journeyId: string) => void;
  isJourneyActive: boolean;
  chakraColor: string;
}

export const JourneySelector = memo(function JourneySelector({
  onStart,
  isJourneyActive,
  chakraColor,
}: JourneySelectorProps) {
  return (
    <div className="grid gap-3">
      {JOURNEYS.map((journey, index) => (
        <motion.button
          key={journey.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onStart(journey.id)}
          disabled={isJourneyActive}
          className={`group relative w-full overflow-hidden rounded-[20px] border p-4 text-left transition-all duration-500 ${
            isJourneyActive
              ? 'cursor-not-allowed border-white/5 bg-white/[0.01] opacity-40'
              : 'border-white/5 bg-white/[0.03] shadow-lg hover:border-white/20 hover:bg-white/[0.08]'
          }`}
          style={!isJourneyActive ? { boxShadow: `0 8px 32px ${chakraColor}10` } : undefined}
        >
          <div className="relative z-10 flex h-full items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-xl shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:bg-white/10">
              {journey.emoji}
            </div>
            <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 transition-colors group-hover:text-white/90 md:text-[11px]">
                    {journey.name}
                  </span>
                  <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-2 py-0.5">
                    <Compass className="h-2.5 w-2.5 text-white/20" />
                    <span className="shrink-0 font-mono text-[9px] font-medium text-white/30">
                      {formatJourneyDuration(journey.totalDuration)}
                    </span>
                  </div>
                </div>
                <p className="line-clamp-2 text-[10px] font-light leading-relaxed tracking-wide text-white/25 transition-colors group-hover:text-white/40">
                  {journey.description}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1.5 border-t border-white/5 pt-3">
                {journey.phases.map((phase, phaseIndex) => {
                  const phaseChakra = (CHAKRAS as Chakra[]).find((item) => item.id === phase.chakraId);
                  return (
                    <motion.div
                      key={phaseIndex}
                      className="h-1.5 w-1.5 rounded-full opacity-30 transition-all group-hover:opacity-100"
                      style={{
                        backgroundColor: phaseChakra?.palette.primary || 'white',
                        boxShadow: `0 0 5px ${phaseChakra?.palette.primary}60`,
                      }}
                      title={phaseChakra?.name || phase.chakraId}
                    />
                  );
                })}
                <span className="ml-auto font-mono text-[8px] uppercase tracking-widest text-white/10 group-hover:text-white/20">
                  {journey.phases.length} Estagios
                </span>
              </div>
            </div>
          </div>

          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-white/5 opacity-0 blur-[50px] transition-opacity group-hover:opacity-100" />
        </motion.button>
      ))}
    </div>
  );
});
