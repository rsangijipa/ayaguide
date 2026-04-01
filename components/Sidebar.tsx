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
  Brain,
  Compass,
} from 'lucide-react';
import { ChakraCard } from './ChakraCard';
import { ElementCard } from './ElementCard';
import { PresetTemplates } from './PresetTemplates';
import { BinauralPanel } from './BinauralPanel';
import { JourneySelector } from './JourneyPlayer';
import { AMBIENT_ELEMENTS, AMBIENT_CATEGORIES } from '@/lib/ambientElements';
import { CHAKRAS } from '@/lib/constants';
import { useSessionStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';

import type { Chakra, SavedTemplate, BinauralState } from '@/lib/types';

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
  onDeleteTemplate: (id: string) => void;
  isMobile?: boolean;
  binauralState: BinauralState;
  binauralVolume: number;
  onBinauralStateChange: (state: BinauralState) => void;
  onBinauralVolumeChange: (vol: number) => void;
  onStartJourney: (journeyId: string) => void;
  isJourneyActive: boolean;
  focusLevel: number;
  onFocusLevelChange: (level: number) => void;
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
  binauralState,
  binauralVolume,
  onBinauralStateChange,
  onBinauralVolumeChange,
  onStartJourney,
  isJourneyActive,
  focusLevel,
  onFocusLevelChange,
}: SidebarProps) {
  const { qualityMode } = useSessionStore(
    useShallow((s) => ({
      qualityMode: s.qualityMode,
    }))
  );

  const [expandedSection, setExpandedSection] = useState<'chakras' | 'elements' | 'templates' | 'binaural' | 'journeys' | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showAllElements, setShowAllElements] = useState(false);

  const activeCount = useMemo(() => {
    const chakraActive = isChakraOn ? 1 : 0;
    const elementsActive = Object.values(ambientVolumes).filter(v => (v as number) > 0).length;
    return chakraActive + elementsActive;
  }, [isChakraOn, ambientVolumes]);

  const categorizedElements = AMBIENT_CATEGORIES.map((cat) => ({
    ...cat,
    elements: AMBIENT_ELEMENTS.filter((el) => el.category === cat.id),
  }));

  const visibleElements = showAllElements
    ? AMBIENT_ELEMENTS.filter(el => !expandedCategory || el.category === expandedCategory)
    : AMBIENT_ELEMENTS.filter(el => !expandedCategory || el.category === expandedCategory).slice(0, 4);

  const toggleSection = (section: 'chakras' | 'elements' | 'templates' | 'binaural' | 'journeys') => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <aside
      className={`w-full flex flex-col gap-3 overflow-y-auto overflow-x-hidden shrink-0 relative sidebar-scroll h-full transition-all duration-700 ${isMobile ? 'bg-transparent pb-10' : 'glass-sidebar'}`}
      style={{ 
        background: isMobile ? 'transparent' : undefined,
        fontSize: 'calc(var(--base-scale, 1) * 1rem)',
        padding: isMobile ? '1.5rem 0.75rem' : 'calc(var(--base-scale, 1) * 1.5rem)'
      }}
    >
      {!isMobile && (
        <div className="flex flex-col gap-4 mb-4 px-2">
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl md:text-2xl font-light tracking-widest uppercase">
                Aya<span className="font-bold opacity-60">Guide</span>
              </h1>
              <p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-[0.4em] font-medium">Portal Sagrado</p>
            </div>
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
        </div>
      )}

      <motion.div animate={{ borderColor: activeCount > 0 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)' }} className="flex flex-col gap-4 p-5 rounded-[24px] bg-white/5 border border-white/5 backdrop-blur-xl shrink-0">
        <div className="flex items-center justify-between w-full">
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/20">Controle Mestre</span>
          {activeCount > 0 && (
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onClearAll}
              data-testid="clear-all-sounds-button"
              className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 text-[9px] uppercase tracking-widest text-red-400/80 transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-red-500/40 outline-none"
              aria-label="Limpar todos os sons ativos"
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
              data-testid="master-volume-slider"
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-transparent focus:outline-none"
              style={{ background: `linear-gradient(to right, ${activeChakra.palette.primary} ${masterVolume * 100}%, rgba(255,255,255,0.1) ${masterVolume * 100}%)` }}
              aria-label="Volume mestre"
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white pointer-events-none transition-transform group-hover/vol:scale-110"
              style={{ left: `calc(${masterVolume * 100}% - 8px)`, backgroundColor: activeChakra.palette.primary, boxShadow: `0 0 15px ${activeChakra.palette.primary}` }}
            />
          </div>

            <div className="relative group/focus h-4 flex items-center">
              <input
                type="range" min="0" max="1" step="0.01" value={focusLevel}
                onChange={(e) => onFocusLevelChange(parseFloat(e.target.value))}
                className="w-full h-0.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-transparent focus:outline-none"
                style={{ background: `linear-gradient(to right, ${activeChakra.palette.primary} ${focusLevel * 100}%, rgba(255,255,255,0.05) ${focusLevel * 100}%)` }}
                aria-label="Filtro de oclusão"
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-white/60 pointer-events-none transition-transform group-hover/focus:scale-125"
                style={{ left: `calc(${focusLevel * 100}% - 6px)`, backgroundColor: activeChakra.palette.primary }}
              />
            </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-2 flex-1">
        {/* Chakras Section */}
        <div className="flex flex-col border-b border-white/5 pb-2">
          <button
            onClick={() => toggleSection('chakras')}
            data-testid="section-toggle-chakras"
            className={`w-full flex items-center justify-between p-4 px-5 rounded-2xl transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
              expandedSection === 'chakras' 
                ? 'bg-white/10 text-white' 
                : 'text-white/40 hover:bg-white/5 hover:text-white/60'
            }`}
            aria-expanded={expandedSection === 'chakras'}
            aria-controls="chakras-section"
          >
            <h2 className="text-[10px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-2 pointer-events-none text-left">
              <Sparkles className="w-3.5 h-3.5" /> Frequências Sagradas
            </h2>
            <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-500 pointer-events-none ${expandedSection === 'chakras' ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {expandedSection === 'chakras' && (
              <motion.div id="chakras-section" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }} className="overflow-hidden">
                <div className="grid gap-2.5 pt-4 pb-4 px-1">
                  {chakras.map((chakra: any, idx: number) => (
                    <motion.div key={chakra.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                      <ChakraCard 
                        chakra={chakra} 
                        isActive={isChakraOn && activeChakra.id === chakra.id} 
                        volume={activeChakra.id === chakra.id ? chakraVolume : 0} 
                        onVolumeChange={(vol: number) => { onChakraVolumeChange(vol); if (vol > 0 && !isChakraOn) onChakraToggle('on'); }} 
                        onToggle={(type: 'on' | 'off') => { 
                          if (type === 'on') { 
                            onChakraSelect(chakra); onChakraToggle('on'); 
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
            )}
          </AnimatePresence>
        </div>

        {/* Elements Section */}
        <div className="flex flex-col border-b border-white/5 pb-2">
          <button
            onClick={() => toggleSection('elements')}
            data-testid="section-toggle-elements"
            className={`w-full flex items-center justify-between p-4 px-5 rounded-2xl transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
              expandedSection === 'elements' 
                ? 'bg-white/10 text-white' 
                : 'text-white/40 hover:bg-white/5 hover:text-white/60'
            }`}
            aria-expanded={expandedSection === 'elements'}
            aria-controls="elements-section"
          >
            <h2 className="text-[10px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-2 pointer-events-none text-left">
              <span>🌿</span> Elementos da Natureza
            </h2>
            <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-500 pointer-events-none ${expandedSection === 'elements' ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {expandedSection === 'elements' && (
              <motion.div
                id="elements-section"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-4 pb-4">
                  <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
                    {categorizedElements.map((cat) => (
                      <motion.button 
                        key={cat.id} 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }} 
                        onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)} 
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${expandedCategory === cat.id ? 'bg-white text-black shadow-md' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'}`}
                        aria-pressed={expandedCategory === cat.id}
                      >
                        {cat.label}
                      </motion.button>
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
                      <motion.button 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                        onClick={() => setShowAllElements(true)} 
                        className="w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 transition-all border border-white/10 hover:border-white/20 outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                      >
                        Ver Mais ({AMBIENT_ELEMENTS.filter(el => !expandedCategory || el.category === expandedCategory).length - 4})
                      </motion.button>
                    )}
                    {showAllElements && AMBIENT_ELEMENTS.filter(el => !expandedCategory || el.category === expandedCategory).length > 4 && (
                      <motion.button 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                        onClick={() => setShowAllElements(false)} 
                        className="w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 transition-all border border-white/10 hover:border-white/20 outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                      >
                        Ver Menos
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Binaural Beats Section */}
        <div className="flex flex-col border-b border-white/5 pb-2">
          <button
            onClick={() => toggleSection('binaural')}
            className={`w-full flex items-center justify-between p-4 px-5 rounded-2xl transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
              expandedSection === 'binaural' 
                ? 'bg-white/10 text-white' 
                : 'text-white/40 hover:bg-white/5 hover:text-white/60'
            }`}
            aria-expanded={expandedSection === 'binaural'}
            aria-controls="binaural-section"
          >
            <h2 className="text-[10px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-2 pointer-events-none text-left">
              <Brain className="w-3.5 h-3.5" /> Ondas Cerebrais
            </h2>
            <div className="flex items-center gap-2">
              {binauralState !== 'off' && (
                <span className="text-[8px] uppercase tracking-wider text-white/30 px-1.5 py-0.5 rounded bg-white/5">{binauralState}</span>
              )}
              <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-500 pointer-events-none ${expandedSection === 'binaural' ? 'rotate-180' : ''}`} />
            </div>
          </button>
          <AnimatePresence initial={false}>
            {expandedSection === 'binaural' && (
              <motion.div id="binaural-section" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }} className="overflow-hidden">
                <div className="pt-4 pb-4 px-1">
                  <BinauralPanel
                    binauralState={binauralState}
                    binauralVolume={binauralVolume}
                    onStateChange={onBinauralStateChange}
                    onVolumeChange={onBinauralVolumeChange}
                    chakraColor={activeChakra.palette.primary}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Guided Journeys Section */}
        <div className="flex flex-col border-b border-white/5 pb-2">
          <button
            onClick={() => toggleSection('journeys')}
            className={`w-full flex items-center justify-between p-4 px-5 rounded-2xl transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
              expandedSection === 'journeys' 
                ? 'bg-white/10 text-white' 
                : 'text-white/40 hover:bg-white/5 hover:text-white/60'
            }`}
            aria-expanded={expandedSection === 'journeys'}
            aria-controls="journeys-section"
          >
            <h2 className="text-[10px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-2 pointer-events-none text-left">
              <Compass className="w-3.5 h-3.5" /> Jornadas Guiadas
            </h2>
            <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-500 pointer-events-none ${expandedSection === 'journeys' ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {expandedSection === 'journeys' && (
              <motion.div id="journeys-section" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }} className="overflow-hidden">
                <div className="pt-4 pb-4 px-1">
                  <JourneySelector
                    onStart={onStartJourney}
                    isJourneyActive={isJourneyActive}
                    chakraColor={activeChakra.palette.primary}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Templates Section */}
        <div className="flex flex-col mt-2">
          <div className="flex items-center justify-between p-1 bg-white/[0.02] rounded-2xl border border-white/5">
            <button
              onClick={() => toggleSection('templates')}
              className={`flex-1 flex items-center justify-between p-3 px-4 rounded-xl transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
                expandedSection === 'templates' 
                  ? 'bg-white/5 text-white' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white/60'
              }`}
              aria-expanded={expandedSection === 'templates'}
              aria-controls="templates-section"
              aria-label="Abrir Biblioteca de Templates"
            >
              <h2 className="text-[10px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-2 pointer-events-none text-left">
                <FolderHeart className="w-3 h-3 text-white/30" /> Biblioteca Sagrada
              </h2>
              <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-500 pointer-events-none ${expandedSection === 'templates' ? 'rotate-180' : ''}`} />
            </button>
            <motion.button 
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} 
              onClick={(e: any) => { e.stopPropagation(); onSaveTemplate(); }} 
              className="p-3 ml-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              aria-label="Salvar mix atual como modelo"
            >
              <Plus className="w-3.5 h-3.5" />
            </motion.button>
          </div>
          
          <AnimatePresence initial={false}>
            {expandedSection === 'templates' && (
              <motion.div id="templates-section" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }} className="overflow-hidden">
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
                        {savedTemplates.map((template: any) => (
                          <motion.div key={template.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card rounded-xl p-3 flex items-center justify-between group/t border border-white/10 hover:border-white/20 transition-all">
                            <motion.button 
                              whileHover={{ scale: 1.02 }} 
                              onClick={() => onLoadTemplate(template)} 
                              className="flex-1 text-left outline-none focus-visible:ring-1 focus-visible:ring-white/20 rounded-lg"
                              aria-label={`Carregar modelo ${template.name}`}
                            >
                              <p className="text-[11px] font-medium text-white/60 group-hover/t:text-white transition-colors truncate">{template.name}</p>
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.1 }} 
                              whileTap={{ scale: 0.9 }} 
                              onClick={() => onDeleteTemplate(template.id)} 
                              className="opacity-0 group-hover/t:opacity-40 hover:!opacity-100 p-1 transition-all text-red-400 outline-none focus-visible:ring-1 focus-visible:ring-red-400/40 rounded-md"
                              aria-label={`Excluir modelo ${template.name}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </motion.button>
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
