'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Zap,
  Sparkles,
  Moon,
  Palette,
} from 'lucide-react';
import {
  PRESET_TEMPLATES,
  PRESET_TEMPLATES_INFO,
  presetToSavedTemplate,
} from '@/lib/presetTemplates';

interface PresetTemplatesProps {
  onLoadTemplate: (template: any) => void;
  activeChakra?: any;
}

const PRESET_ICONS = {
  'anxiety-relief': Heart,
  'deep-focus': Zap,
  'deep-meditation': Sparkles,
  'restful-sleep': Moon,
  'creative-flow': Palette,
};

export function PresetTemplates({ onLoadTemplate }: PresetTemplatesProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_TEMPLATES.find(t => t.id === presetId);
    if (preset) {
      const savedTemplate = presetToSavedTemplate(preset);
      onLoadTemplate(savedTemplate);
      setSelectedPreset(presetId);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        {PRESET_TEMPLATES.map((preset, idx) => {
          const isSelected = selectedPreset === preset.id;

          return (
            <motion.button
              key={preset.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleLoadPreset(preset.id)}
              className={`w-full group relative overflow-hidden rounded-xl p-3 transition-all border text-left ${
                isSelected
                  ? 'bg-white/10 border-white/30 shadow-lg shadow-white/10'
                  : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
              }`}
            >
              <div className="relative z-10 flex items-start gap-3">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="text-xl">{preset.emoji}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[11px] font-bold text-white/80 group-hover:text-white truncate">
                      {preset.name}
                    </h3>
                  </div>
                  <p className="text-[9px] text-white/40 group-hover:text-white/50 line-clamp-2">
                    {preset.objective}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedPreset && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2"
          >
            {(() => {
              const preset = PRESET_TEMPLATES.find(t => t.id === selectedPreset);
              const info = PRESET_TEMPLATES_INFO[selectedPreset as keyof typeof PRESET_TEMPLATES_INFO];
              
              if (!preset || !info) return null;

              return (
                <>
                  <p className="text-[9px] text-white/50 leading-relaxed font-light italic">
                    &quot;{preset.description}&quot;
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[8px]">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-white/40 uppercase tracking-wider font-bold mb-0.5">Chakra</p>
                      <p className="text-white/70 font-medium">{info.chakra}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-white/40 uppercase tracking-wider font-bold mb-0.5">Frequência</p>
                      <p className="text-white/70 font-medium">{info.frequency}</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-white/40 uppercase tracking-wider font-bold text-[8px] mb-1">Ideal para</p>
                    <p className="text-white/70 text-[9px] leading-relaxed">{info.bestFor}</p>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
