'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderHeart,
  Plus,
  Trash2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { ChakraCard } from './ChakraCard';
import { ElementCard } from './ElementCard_Enhanced';
import { AMBIENT_ELEMENTS, AMBIENT_CATEGORIES } from '@/lib/ambientElements';

interface SidebarProps {
  chakras: any[];
  activeChakra: any;
  isChakraOn: boolean;
  chakraVolume: number;
  onChakraVolumeChange: (vol: number) => void;
  onChakraToggle: (type: 'on' | 'off') => void;
  onChakraSelect: (chakra: any) => void;
  ambientVolumes: Record<string, number>;
  onAmbientVolumeChange: (id: string, vol: number) => void;
  savedTemplates: any[];
  onSaveTemplate: () => void;
  onLoadTemplate: (template: any) => void;
  onDeleteTemplate: (id: number) => void;
}

export function Sidebar({
  chakras,
  activeChakra,
  isChakraOn,
  chakraVolume,
  onChakraVolumeChange,
  onChakraToggle,
  onChakraSelect,
  ambientVolumes,
  onAmbientVolumeChange,
  savedTemplates,
  onSaveTemplate,
  onLoadTemplate,
  onDeleteTemplate,
}: SidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('water');
  const [showAllElements, setShowAllElements] = useState(false);

  const categorizedElements = AMBIENT_CATEGORIES.map((cat) => ({
    ...cat,
    elements: AMBIENT_ELEMENTS.filter((el) => el.category === cat.id),
  }));

  const visibleElements = showAllElements
    ? AMBIENT_ELEMENTS
    : AMBIENT_ELEMENTS.slice(0, 4);

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-96 glass-sidebar rounded-[40px] p-6 flex flex-col gap-6 overflow-y-auto overflow-x-hidden z-10 shrink-0 shadow-2xl relative sidebar-scroll"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 mb-2"
      >
        <h1 className="text-2xl font-light tracking-widest uppercase mb-1">
          Aya<span className="font-bold opacity-60">Guide</span>
        </h1>
        <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-medium">
          Portal de Sessão Sagrada
        </p>
      </motion.div>

      {/* Chakra Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Rede de Chakras
          </h2>
          <span className="text-[9px] opacity-30 uppercase tracking-widest">4h Duração</span>
        </div>

        <div className="grid gap-2.5">
          {chakras.map((chakra, idx) => (
            <motion.div
              key={chakra.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <ChakraCard
                chakra={chakra}
                isActive={isChakraOn && activeChakra.id === chakra.id}
                volume={activeChakra.id === chakra.id ? chakraVolume : 0}
                onVolumeChange={(vol) => {
                  onChakraVolumeChange(vol);
                  if (vol > 0 && !isChakraOn) onChakraToggle('on');
                  if (vol === 0 && isChakraOn) onChakraToggle('off');
                }}
                onToggle={(type) => {
                  if (type === 'on') {
                    onChakraSelect(chakra);
                    onChakraToggle('on');
                    if (chakraVolume === 0) onChakraVolumeChange(0.5);
                  } else {
                    onChakraToggle('off');
                  }
                }}
                activeColor={activeChakra.palette.primary}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-white/0 via-white/10 to-white/0" />

      {/* Ambient Elements Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 flex-1"
      >
        <h2 className="text-[10px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-2">
          <span>🌿</span> Elementos Naturais
        </h2>

        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-2 px-2">
          {categorizedElements.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setExpandedCategory(expandedCategory === cat.id ? null : cat.id)
              }
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                expandedCategory === cat.id
                  ? 'bg-white text-black shadow-md'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Elements Grid */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          <AnimatePresence mode="popLayout">
            {visibleElements.map((element, idx) => (
              <motion.div
                key={element.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.03 }}
              >
                <ElementCard
                  id={element.id}
                  name={element.name}
                  icon={element.icon}
                  volume={ambientVolumes[element.id] || 0}
                  onVolumeChange={onAmbientVolumeChange}
                  activeColor={activeChakra.palette.primary}
                  description={element.description}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Show More Button */}
          {!showAllElements && AMBIENT_ELEMENTS.length > 4 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAllElements(true)}
              className="w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 transition-all border border-white/10 hover:border-white/20"
            >
              Ver Mais ({AMBIENT_ELEMENTS.length - 4})
            </motion.button>
          )}

          {showAllElements && AMBIENT_ELEMENTS.length > 4 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAllElements(false)}
              className="w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 transition-all border border-white/10 hover:border-white/20"
            >
              Ver Menos
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-white/0 via-white/10 to-white/0" />

      {/* Templates Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 mt-auto"
      >
        <div className="flex items-center justify-between group">
          <h2 className="text-[10px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-2">
            <FolderHeart className="w-3 h-3 text-white/30" /> Modelos Sagrados
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onSaveTemplate}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        <div className="space-y-2 max-h-[150px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {savedTemplates.map((template) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card rounded-xl p-3 flex items-center justify-between group/t border border-white/10 hover:border-white/20 transition-all"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onLoadTemplate(template)}
                  className="flex-1 text-left"
                >
                  <span className="text-[11px] font-medium text-white/60 group-hover/t:text-white transition-colors">
                    {template.name}
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDeleteTemplate(template.id)}
                  className="opacity-0 group-hover/t:opacity-40 hover:!opacity-100 p-1 transition-all text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>

          {savedTemplates.length === 0 && (
            <div className="text-center py-4 border border-dashed border-white/10 rounded-xl">
              <p className="text-[10px] text-white/20 uppercase tracking-widest">
                Sem mixes salvos
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.aside>
  );
}
