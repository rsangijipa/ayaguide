'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, X } from 'lucide-react';

interface TimerRadialMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (minutes: number) => void;
  currentMinutes: number;
  chakraColor: string;
}

const PRESETS = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '1h', value: 60 },
  { label: '2h', value: 120 },
  { label: '4h', value: 240 },
];

export function TimerRadialMenu({
  isOpen,
  onClose,
  onSelect,
  currentMinutes,
  chakraColor,
}: TimerRadialMenuProps) {
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
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />

          {/* Radial Menu Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[320px] h-[320px] flex items-center justify-center"
          >
            {/* Pizza Background */}
            <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl overflow-hidden">
               {/* Decorative radial lines */}
               {[0, 72, 144, 216, 288].map((angle) => (
                 <div 
                   key={angle}
                   className="absolute top-1/2 left-1/2 w-[50%] h-[1px] bg-white/10 origin-left"
                   style={{ transform: `rotate(${angle-90}deg)` }}
                 />
               ))}
            </div>

            {/* Slices / Buttons */}
            {PRESETS.map((preset, i) => {
              const angle = (i * 72) - 90; // Start from top
              const distance = 95;
              const x = Math.cos((angle * Math.PI) / 180) * distance;
              const y = Math.sin((angle * Math.PI) / 180) * distance;

              const isSelected = Math.floor(currentMinutes) === preset.value;

              return (
                <motion.button
                  key={preset.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    onSelect(preset.value);
                    onClose();
                  }}
                  className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all duration-300 border ${
                    isSelected 
                      ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                      : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                  style={{ 
                    transform: `translate(${x}px, ${y}px)`,
                    boxShadow: isSelected ? `0 0 30px ${chakraColor}44` : 'none'
                  }}
                >
                  <span className="text-xs font-bold uppercase tracking-widest">{preset.label}</span>
                </motion.button>
              );
            })}

            {/* Center Close / Icon */}
            <motion.div 
               className="w-20 h-20 rounded-full bg-black/60 border border-white/20 flex flex-col items-center justify-center shadow-inner relative z-10"
               style={{ boxShadow: `inset 0 0 20px ${chakraColor}22` }}
            >
               <Clock className="w-6 h-6 text-white/40 mb-1" />
               <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4 text-white/20 hover:text-white/60" />
               </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
