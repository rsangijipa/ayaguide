import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Power, Volume2 } from 'lucide-react';

import type { Chakra } from '@/lib/types';

interface ChakraCardProps {
  chakra: Chakra;
  isActive: boolean;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onToggle: (type: 'on' | 'off') => void;
  activeColor: string;
}

export const ChakraCard = memo(function ChakraCard({ chakra, isActive, volume, onVolumeChange, onToggle, activeColor }: ChakraCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group w-full flex flex-col rounded-[28px] border transition-all duration-500 overflow-hidden relative ${
        isActive 
          ? 'glass-light border-white/40 text-white shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-[1.02]' 
          : 'glass-card border-white/10 text-white/50 hover:text-white/80'
      }`}
    >
      <div className="flex items-center justify-between px-5 py-4 relative z-10">
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-3 h-3 rounded-full transition-all duration-700 ${chakra.color} ${
            isActive 
              ? 'scale-125 shadow-[0_0_15px_white]' 
              : 'opacity-40 shadow-[0_0_8px_currentColor] group-hover:opacity-100 group-hover:scale-110'
          }`} />
          <div className="flex flex-col items-start leading-tight">
            <span className={`text-[13px] tracking-wide uppercase transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>
              {chakra.name.split(' (')[0]}
            </span>
            <span className="text-[10px] font-light tracking-[0.2em] opacity-40 uppercase">
              {chakra.name.match(/\(([^)]+)\)/)?.[1] || ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isActive && (
            <div className="text-[10px] font-mono opacity-30 group-hover:opacity-60 transition-opacity">
              {chakra.frequency}Hz
            </div>
          )}
          
          <button 
             onClick={() => onToggle(isActive ? 'off' : 'on')}
             className={`p-2.5 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-white/40 outline-none ${
               isActive 
                 ? 'bg-white text-black shadow-lg scale-110' 
                 : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/20'
             }`}
             aria-label={isActive ? `Desativar chakra ${chakra.name}` : `Ativar chakra ${chakra.name}`}
             aria-pressed={isActive}
          >
            <Power className={`w-3.5 h-3.5 ${isActive ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="px-5 pb-5 pt-1 relative z-10 border-t border-white/10 mx-5 mt-[-2px]"
          >
            <div className="flex flex-col gap-3 py-3">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-white/40">
                <span className="flex items-center gap-2"><Volume2 className="w-3 h-3" /> Volume</span>
                <span className="font-mono text-white/60">{Math.round(volume * 100)}%</span>
              </div>
              
              <div className="relative h-1.5 w-full bg-white/10 rounded-full group/slider">
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="absolute inset-x-0 w-full opacity-0 z-20 cursor-pointer h-5 -top-2"
                  aria-label={`Volume do chakra ${chakra.name}`}
                />
                <motion.div 
                  initial={false}
                  animate={{ width: `${volume * 100}%` }}
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{ backgroundColor: activeColor }}
                />
                <div 
                   className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 bg-white border border-black/20 rounded-full shadow-xl transition-transform group-hover/slider:scale-125" 
                   style={{ left: `${volume * 100}%`, transform: `translate(-50%, -50%)`, pointerEvents: 'none' }} 
                />
              </div>

              <div className="flex justify-between items-center mt-1">
                 <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">Frequência Sagrada</span>
                 <span className="text-[10px] font-mono text-white/60">{chakra.frequency}Hz</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isActive && (
        <div className="absolute inset-0 bg-white/[0.02] -z-10" />
      )}
    </motion.div>
  );
});
