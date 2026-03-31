'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Check } from 'lucide-react';
import { TIMER_PRESETS } from '@/lib/constants';

interface TimerDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (minutes: number) => void;
  currentMinutes: number;
  chakraColor: string;
}

export function TimerDropdown({
  isOpen,
  onClose,
  onSelect,
  currentMinutes,
  chakraColor,
}: TimerDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Transparent Backdrop to detect click outside */}
          <div 
            className="fixed inset-0 z-[100] cursor-default" 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />
          
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full left-0 mt-3 z-[101] w-48 overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl"
          >
            <div className="p-2 space-y-1">
              {TIMER_PRESETS.map((preset) => {
                const minutes = preset.seconds / 60;
                const isSelected = Math.floor(currentMinutes) === minutes;
                
                return (
                  <button
                    key={preset.label}
                    onClick={() => {
                      onSelect(minutes);
                      onClose();
                    }}
                    className={`group relative flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition-all ${
                      isSelected 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/40 hover:bg-white/5 hover:text-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className={`h-3.5 w-3.5 ${isSelected ? 'text-white/80' : 'text-white/20 group-hover:text-white/40'}`} />
                      <span className="font-light tracking-wider">{preset.label}</span>
                    </div>
                    {isSelected && (
                      <motion.div
                        layoutId="active-check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Check className="h-3.5 w-3.5" style={{ color: chakraColor }} />
                      </motion.div>
                    )}
                    
                    {/* Hover Glow */}
                    {!isSelected && (
                      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div 
                           className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full blur-[2px]"
                           style={{ backgroundColor: chakraColor }}
                         />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Bottom Accent */}
            <div 
              className="h-1 w-full opacity-30"
              style={{ backgroundColor: chakraColor }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
