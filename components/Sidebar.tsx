'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderHeart,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  Activity,
  Volume2,
} from 'lucide-react';
import { ChakraCard } from './ChakraCard';
import { ElementCard } from './ElementCard';
import { PresetTemplates } from './PresetTemplates';
import { AMBIENT_ELEMENTS, AMBIENT_CATEGORIES } from '@/lib/ambientElements';

import type { Chakra, SavedTemplate } from '@/lib/types';

interface SidebarProps {
  chakras: Chakra[];
  activeChakra: Chakra;
  isChakraOn: boolean;
  chakraVolume: number;
  onChakraVolumeChange: (vol: number) => void;
  onChakraToggle: (type: 'on' | 'off') => void;
  onChakraSelect: (chakra: Chakra) => void;
  ambientVolumes: Record<string, number>;
  onAmbientVolumeChange: (id: string, vol: number) => void;
  onClearAll: () => void;
  masterVolume: number;
  onMasterVolumeChange: (vol: number) => void;
  savedTemplates: SavedTemplate[];
  onSaveTemplate: () => void;
  onLoadTemplate: (template: SavedTemplate) => void;
  onDeleteTemplate: (id: string | number) => void;
  isMobile?: boolean;
}

export const Sidebar = React.memo(function Sidebar({
  chakras,
  activeChakra,
  isChakraOn,
  chakraVolume,
  onChakraVolumeChange,
  onChakraToggle,
  onChakraSelect,
  ambientVolumes,
  onAmbientVolumeChange,
  onClearAll,
  masterVolume,
  onMasterVolumeChange,
  savedTemplates,
  onSaveTemplate,
  onLoadTemplate,
  onDeleteTemplate,
  isMobile = false,
}: SidebarProps) {
  const [expandedSection, setExpandedSection] = useState<'chakras' | 'elements' | 'templates' | null>('chakras');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('water');
  const [showAllElements, setShowAllElements] = useState(false);


  const activeCount = useMemo(() => {
    const chakraActive = isChakraOn ? 1 : 0;
    const elementsActive = Object.values(ambientVolumes).filter(v => v > 0).length;
    return chakraActive + elementsActive;
  }, [isChakraOn, ambientVolumes]);

  const categorizedElements = AMBIENT_CATEGORIES.map((cat) => ({
    ...cat,
    elements: AMBIENT_ELEMENTS.filter((el) => el.category === cat.id),
  }));

  const visibleElements = showAllElements
    ? AMBIENT_ELEMENTS.filter(el => !expandedCategory || el.category === expandedCategory)
    : AMBIENT_ELEMENTS.filter(el => !expandedCategory || el.category === expandedCategory).slice(0, 4);

  const toggleSection = (section: 'chakras' | 'elements' | 'templates') => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <aside
      className={`w-full flex flex-col gap-3 overflow-y-auto overflow-x-hidden shrink-0 relative sidebar-scroll h-full transition-all duration-700 ${isMobile ? 'bg-transparent pb-10' : 'glass-sidebar'}`}
      style={{ 
        background: isMobile ? 'transparent' : undefined,
        fontSize: 'calc(var(--base-scale, 1) * 1rem)',
        padding: isMobile ? '1rem 0.5rem' : 'calc(var(--base-scale, 1) * 1.5rem)'
      }}
    >

      <div className={`flex flex-col gap-4 mb-2 ${isMobile ? 'px-4' : ''}`}>
        <div className="flex items-center justify-between gap-4 w-full px-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl md:text-2xl font-light tracking-widest uppercase">
              Aya<span className="font-bold opacity-60">Guide</span>
            </h1>
            <p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-[0.4em] font-medium">Portal Sagrado</p>
          </div>
          <div className="h-4 w-px bg-white/10 mx-1 hidden md:block" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
               <div className="relative">
                  <Activity className={`w-3.5 h-3.5 ${activeCount > 0 ? 'text-green-400' : 'text-white/20'}`} />
                  {activeCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
               </div>
               <span className="text-[10px] font-medium tracking-wider uppercase text-white/40">{activeCount > 0 ? 'Sessão Ativa' : 'Sessão Inativa'}</span>
            </div>
          </div>
        </div>

        <motion.div animate={{ borderColor: activeCount > 0 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)' }} className="flex flex-col gap-4 p-5 rounded-[24px] bg-white/5 border border-white/5 backdrop-blur-xl">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/20">Controle Mestre</span>
            {activeCount > 0 && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={onClearAll}
                className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 text-[9px] uppercase tracking-widest text-red-400/80 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-2.5 h-2.5" /> Limpar Todos
              </motion.button>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                 <Volume2 className="w-4 h-4 text-white/30" />
                 <span className="text-[11px] font-mono text-white/50">{Math.round(masterVolume * 100)}%</span>
              </div>
              <span className="text-[9px] text-white/20 uppercase tracking-widest font-mono mt-0.5">{activeCount} canais</span>
            </div>
            <div className="relative group/vol h-6 flex items-center">
              <input
                type="range" min="0" max="1" step="0.01" value={masterVolume}
                onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-transparent focus:outline-none"
                style={{ background: `linear-gradient(to right, ${activeChakra.palette.primary} ${masterVolume * 100}%, rgba(255,255,255,0.1) ${masterVolume * 100}%)` }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white pointer-events-none transition-transform group-hover/vol:scale-110"
                style={{ left: `calc(${masterVolume * 100}% - 8px)`, backgroundColor: activeChakra.palette.primary, boxShadow: `0 0 15px ${activeChakra.palette.primary}` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <div className="flex flex-col border-b border-white/5 pb-2">
          <div 
            onClick={() => toggleSection('chakras')} 
            className="flex items-center justify-between w-full py-2 group cursor-pointer hover:opacity-80 transition-opacity"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('chakras'); } }}
          >
            <h2 className="text-[10px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-2 pointer-events-none">
              <Sparkles className="w-3.5 h-3.5" /> Frequências Sagradas
            </h2>
            <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-500 pointer-events-none ${expandedSection === 'chakras' ? 'rotate-180' : ''}`} />
          </div>
          <AnimatePresence initial={false}>
            {expandedSection === 'chakras' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }} className="overflow-hidden">
                <div className="grid gap-2.5 pt-4 pb-4 px-1">
                  {chakras.map((chakra, idx) => (
                    <motion.div key={chakra.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                      <ChakraCard chakra={chakra} isActive={isChakraOn && activeChakra.id === chakra.id} volume={activeChakra.id === chakra.id ? chakraVolume : 0} onVolumeChange={(vol) => { onChakraVolumeChange(vol); if (vol > 0 && !isChakraOn) onChakraToggle('on'); }} onToggle={(type) => { if (type === 'on') { onChakraSelect(chakra); onChakraToggle('on'); if (chakraVolume === 0) onChakraVolumeChange(0.5); } else { onChakraToggle('off'); } }} activeColor={activeChakra.palette.primary} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col border-b border-white/5 pb-2">
          <div 
            onClick={() => toggleSection('elements')} 
            className="flex items-center justify-between w-full py-2 group cursor-pointer hover:opacity-80 transition-opacity"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('elements'); } }}
          >
            <h2 className="text-[10px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-2 pointer-events-none"><span>🌿</span> Elementos da Natureza</h2>
            <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-500 pointer-events-none ${expandedSection === 'elements' ? 'rotate-180' : ''}`} />
          </div>
          <AnimatePresence initial={false}>
            {expandedSection === 'elements' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }} className="overflow-hidden">
                <div className="space-y-4 pt-4 pb-4">
                  <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
                    {categorizedElements.map((cat) => (
                      <motion.button key={cat.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${expandedCategory === cat.id ? 'bg-white text-black shadow-md' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'}`}>{cat.label}</motion.button>
                    ))}
                  </div>
                  <div className="space-y-3 px-1">
                    <AnimatePresence mode="popLayout">
                      {visibleElements.map((element, idx) => (
                        <motion.div key={element.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: idx * 0.03 }}>
                          <ElementCard id={element.id} name={element.name} icon={element.icon} volume={ambientVolumes[element.id] || 0} onVolumeChange={onAmbientVolumeChange} activeColor={activeChakra.palette.primary} description={element.description} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {!showAllElements && AMBIENT_ELEMENTS.filter(el => !expandedCategory || el.category === expandedCategory).length > 4 && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAllElements(true)} className="w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 transition-all border border-white/10 hover:border-white/20">Ver Mais ({AMBIENT_ELEMENTS.filter(el => !expandedCategory || el.category === expandedCategory).length - 4})</motion.button>
                    )}
                    {showAllElements && AMBIENT_ELEMENTS.filter(el => !expandedCategory || el.category === expandedCategory).length > 4 && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAllElements(false)} className="w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 transition-all border border-white/10 hover:border-white/20">Ver Menos</motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col mt-2">
          <div 
            onClick={() => toggleSection('templates')} 
            className="flex items-center justify-between w-full py-2 group cursor-pointer hover:opacity-80 transition-opacity"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('templates'); } }}
          >
            <h2 className="text-[10px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-2 pointer-events-none">
              <FolderHeart className="w-3 h-3 text-white/30" /> Biblioteca Sagrada
            </h2>
            <div className="flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onSaveTemplate(); }} className="p-1 rounded-md hover:bg-white/10 text-white/30 hover:text-white transition-all mr-2"><Plus className="w-3.5 h-3.5" /></motion.button>
              <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-500 pointer-events-none ${expandedSection === 'templates' ? 'rotate-180' : ''}`} />
            </div>
          </div>
          <AnimatePresence initial={false}>
            {expandedSection === 'templates' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }} className="overflow-hidden">
                <div className="pt-4 pb-4 px-1 pr-2 max-h-[400px] overflow-y-auto sidebar-scroll space-y-6">
                  <div>
                    <h3 className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-3 font-bold px-2">Sessões Sugeridas</h3>
                    <PresetTemplates onLoadTemplate={onLoadTemplate} />
                  </div>
                  <div className="h-px bg-white/5 mx-2" />
                  <div>
                    <h3 className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-3 font-bold px-2">Modelos Salvos</h3>
                    <div className="space-y-2">
                      <AnimatePresence mode="popLayout">
                        {savedTemplates.map((template) => (
                          <motion.div key={template.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card rounded-xl p-3 flex items-center justify-between group/t border border-white/10 hover:border-white/20 transition-all">
                            <motion.button whileHover={{ scale: 1.02 }} onClick={() => onLoadTemplate(template)} className="flex-1 text-left"><p className="text-[11px] font-medium text-white/60 group-hover/t:text-white transition-colors truncate">{template.name}</p></motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onDeleteTemplate(template.id)} className="opacity-0 group-hover/t:opacity-40 hover:!opacity-100 p-1 transition-all text-red-400"><Trash2 className="w-3 h-3" /></motion.button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {savedTemplates.length === 0 && (
                        <div className="text-center py-4 border border-dashed border-white/10 rounded-xl">
                          <p className="text-[10px] text-white/20 uppercase tracking-widest">Sem mixes salvos</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
});
