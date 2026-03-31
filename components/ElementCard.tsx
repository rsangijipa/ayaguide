'use client';

import { motion } from 'motion/react';
import { LucideIcon, Power, Volume2 } from 'lucide-react';

interface ElementCardProps {
  id: string;
  name: string;
  icon: LucideIcon;
  volume: number;
  onVolumeChange: (id: string, vol: number) => void;
  activeColor: string;
  description?: string;
}

export function ElementCard({
  id,
  name,
  icon: Icon,
  volume,
  onVolumeChange,
  activeColor,
  description,
}: ElementCardProps) {
  const isActive = volume > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`group relative rounded-[20px] overflow-hidden transition-all duration-500 border backdrop-blur-md ${
        isActive
          ? 'glass-light border-white/30 shadow-lg scale-[1.01]'
          : 'border-white/5 opacity-70 hover:opacity-100'
      }`}
      style={{
        backgroundColor: isActive ? `${activeColor}15` : 'rgba(255, 255, 255, 0.03)',
      }}
    >
      {/* Background Gradient Overlay */}
      {isActive && (
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${activeColor}20 0%, transparent 100%)`,
          }}
        />
      )}

      <div className="relative z-10 p-4 space-y-3">
        {/* Header: Icon + Name + Toggle Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`p-2.5 rounded-xl transition-all duration-500 flex-shrink-0 ${
                isActive ? 'shadow-md' : 'opacity-50'
              }`}
              style={{
                backgroundColor: isActive ? `${activeColor}30` : 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-white' : 'text-white/40'
                }`}
              />
            </div>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <span
                className={`text-xs uppercase tracking-widest font-bold transition-colors truncate ${
                  isActive ? 'text-white' : 'text-white/40'
                }`}
              >
                {name}
              </span>
              {description && (
                <span className="text-[10px] text-white/30 line-clamp-1">
                  {description}
                </span>
              )}
            </div>
          </div>

          {/* Power Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onVolumeChange(id, isActive ? 0 : 0.5)}
            className={`p-2 rounded-lg transition-all flex-shrink-0 ${
              isActive
                ? 'bg-white text-black shadow-md'
                : 'bg-white/5 text-white/30 hover:text-white hover:bg-white/10'
            }`}
            aria-label={`Toggle ${name}`}
          >
            <Power className={`w-3.5 h-3.5 ${isActive ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Volume Control Section */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 pt-2 border-t border-white/10"
          >
            {/* Volume Label and Percentage */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-white/50" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/50">
                  Volume
                </span>
              </div>
              <span className="text-xs font-mono text-white/70 font-semibold">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Volume Slider */}
            <div className="relative group/slider">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onVolumeChange(id, parseFloat(e.target.value))}
                className="absolute inset-x-0 w-full opacity-0 z-20 cursor-pointer h-6 -top-1"
                aria-label={`Volume control for ${name}`}
              />

              {/* Slider Background */}
              <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                {/* Filled Progress */}
                <motion.div
                  initial={false}
                  animate={{ width: `${volume * 100}%` }}
                  className="absolute top-0 left-0 h-full rounded-full transition-all"
                  style={{
                    backgroundColor: activeColor,
                    boxShadow: `0 0 10px ${activeColor}80`,
                  }}
                />

                {/* Slider Thumb */}
                <motion.div
                  initial={false}
                  animate={{ left: `${volume * 100}%` }}
                  className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white border-2 border-black/20 rounded-full shadow-lg transition-all group-hover/slider:scale-125 pointer-events-none"
                  style={{
                    boxShadow: `0 0 12px ${activeColor}60`,
                  }}
                />
              </div>
            </div>

            {/* Quick Volume Presets */}
            <div className="flex gap-1.5 pt-1">
              {[
                { label: 'Low', value: 0.25 },
                { label: 'Mid', value: 0.5 },
                { label: 'High', value: 0.75 },
              ].map((preset) => (
                <motion.button
                  key={preset.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onVolumeChange(id, preset.value)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                    Math.abs(volume - preset.value) < 0.05
                      ? 'bg-white text-black shadow-md'
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                  }`}
                >
                  {preset.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Active Indicator Glow */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-[20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: `radial-gradient(circle at top right, ${activeColor}20, transparent 70%)`,
          }}
        />
      )}
    </motion.div>
  );
}
