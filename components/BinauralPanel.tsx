'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Volume2 } from 'lucide-react';
import { BINAURAL_DELTAS } from '@/lib/audioMixer';
import type { BinauralState } from '@/lib/types';

interface BinauralPanelProps {
  binauralState: BinauralState;
  binauralVolume: number;
  onStateChange: (state: BinauralState) => void;
  onVolumeChange: (vol: number) => void;
  chakraColor: string;
}

const WAVE_STATES: { id: BinauralState; label: string; emoji: string; color: string; desc: string }[] = [
  { id: 'delta', label: 'Delta', emoji: '🌙', color: '#818cf8', desc: 'Sono Profundo' },
  { id: 'theta', label: 'Theta', emoji: '🧘', color: '#c084fc', desc: 'Meditação' },
  { id: 'alpha', label: 'Alpha', emoji: '🍃', color: '#4ade80', desc: 'Relaxamento' },
  { id: 'beta', label: 'Beta', emoji: '🎯', color: '#facc15', desc: 'Foco' },
  { id: 'gamma', label: 'Gamma', emoji: '⚡', color: '#f97316', desc: 'Percepção' },
];

const WaveVisualization = memo(function WaveVisualization({ stateId, isActive, color }: { stateId: BinauralState; isActive: boolean; color: string }) {
  const config = BINAURAL_DELTAS[stateId];
  if (!config) return null;

  // Generate wave path based on delta frequency
  const frequency = config.delta;
  const points = 60;
  const amplitude = isActive ? 8 : 4;
  
  let d = '';
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * 100;
    const y = 12 + Math.sin((i / points) * Math.PI * 2 * (frequency / 4)) * amplitude;
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }

  return (
    <svg viewBox="0 0 100 24" className="w-full h-6" preserveAspectRatio="none">
      <motion.path
        d={d}
        fill="none"
        stroke={isActive ? color : 'rgba(255,255,255,0.15)'}
        strokeWidth={isActive ? 1.5 : 0.8}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: isActive ? 0.8 : 0.3 }}
        transition={{ duration: 0.6 }}
      />
    </svg>
  );
});

export const BinauralPanel = memo(function BinauralPanel({ binauralState, binauralVolume, onStateChange, onVolumeChange, chakraColor }: BinauralPanelProps) {
  const isActive = binauralState !== 'off';
  const activeWave = WAVE_STATES.find(w => w.id === binauralState);

  return (
    <div className="space-y-3">
      {/* Active Indicator & Legend */}
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">Modulação</span>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10"
          >
            <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
            <span className="text-[8px] uppercase tracking-widest text-white/60 font-medium">Sincronizado</span>
          </motion.div>
        )}
      </div>

      {/* Wave State Selector */}
      <div className="space-y-1.5">
        {WAVE_STATES.map((wave, idx) => {
          const selected = binauralState === wave.id;
          return (
            <motion.button
              key={wave.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => onStateChange(selected ? 'off' : wave.id)}
              className={`w-full rounded-xl p-3 border transition-all duration-300 group text-left ${
                selected
                  ? 'border-white/20 bg-white/[0.08]'
                  : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 transition-all ${
                  selected ? 'bg-white/10' : 'bg-white/5'
                }`}
                  style={selected ? { boxShadow: `0 0 12px ${wave.color}30` } : undefined}
                >
                  {wave.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-medium tracking-wider uppercase transition-colors ${
                      selected ? 'text-white/80' : 'text-white/40 group-hover:text-white/60'
                    }`}>
                      {wave.label}
                    </span>
                    <span className={`text-[9px] tracking-wider ${
                      selected ? 'text-white/40' : 'text-white/20'
                    }`}>
                      {wave.desc}
                    </span>
                    {selected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-1.5 h-1.5 rounded-full ml-auto"
                        style={{ backgroundColor: wave.color, boxShadow: `0 0 8px ${wave.color}` }}
                      />
                    )}
                  </div>
                  <WaveVisualization stateId={wave.id} isActive={selected} color={wave.color} />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Volume control — only when active */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 px-2 pt-2">
              <Volume2 className="w-3.5 h-3.5 text-white/30 shrink-0" />
              <div className="relative group/vol h-6 flex items-center flex-1">
                <input
                  type="range" min="0" max="1" step="0.01" value={binauralVolume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-transparent focus:outline-none"
                  style={{ background: `linear-gradient(to right, ${activeWave?.color || chakraColor} ${binauralVolume * 100}%, rgba(255,255,255,0.1) ${binauralVolume * 100}%)` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white pointer-events-none transition-transform group-hover/vol:scale-110"
                  style={{ left: `calc(${binauralVolume * 100}% - 6px)`, backgroundColor: activeWave?.color || chakraColor, boxShadow: `0 0 10px ${activeWave?.color || chakraColor}` }}
                />
              </div>
              <span className="text-[10px] font-mono text-white/30 w-8 text-right">{Math.round(binauralVolume * 100)}%</span>
            </div>

            {/* Headphone notice */}
            <div className="flex items-center justify-center gap-1.5 mt-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-[9px] text-white/20 tracking-wider uppercase">🎧 Use fones de ouvido para melhor efeito</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
