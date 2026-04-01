'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FolderHeart, Plus, Trash2, Sparkles, ChevronDown, Activity, Volume2, Brain, Compass } from 'lucide-react';
import { ChakraCard } from './ChakraCard';
import { ElementCard } from './ElementCard';
import { PresetTemplates } from './PresetTemplates';
import { BinauralPanel } from './BinauralPanel';
import { JourneySelector } from './JourneyPlayer';
import { AMBIENT_ELEMENTS, AMBIENT_CATEGORIES } from '@/lib/ambientElements';
import { BREATHING_PATTERNS } from '@/lib/breathingPatterns';
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
  breathingActive: boolean;
  onBreathingToggle: () => void;
  breathingPatternId: string;
  onBreathingPatternChange: (id: string) => void;
}

type Section = 'chakras' | 'elements' | 'templates' | 'binaural' | 'journeys' | 'breathing' | null;

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
  breathingActive,
  onBreathingToggle,
  breathingPatternId,
  onBreathingPatternChange,
}: SidebarProps) {
  const [expandedSection, setExpandedSection] = useState<Section>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showAllElements, setShowAllElements] = useState(false);

  const activeCount = useMemo(() => {
    const chakraActive = isChakraOn ? 1 : 0;
    const elementsActive = Object.values(ambientVolumes).filter((value) => value > 0).length;
    return chakraActive + elementsActive;
  }, [isChakraOn, ambientVolumes]);

  const categorizedElements = AMBIENT_CATEGORIES.map((category) => ({
    ...category,
    elements: AMBIENT_ELEMENTS.filter((element) => element.category === category.id),
  }));

  const filteredElements = useMemo(
    () => AMBIENT_ELEMENTS.filter((element) => !expandedCategory || element.category === expandedCategory),
    [expandedCategory]
  );
  const visibleElements = showAllElements ? filteredElements : filteredElements.slice(0, 4);

  const toggleSection = (section: Exclude<Section, null>) => {
    setExpandedSection((previous) => (previous === section ? null : section));
  };

  return (
    <aside
      className={`sidebar-scroll relative flex h-full w-full shrink-0 flex-col gap-3 overflow-x-hidden overflow-y-auto transition-all duration-700 ${isMobile ? 'bg-transparent pb-10' : 'glass-sidebar'}`}
      style={{
        background: isMobile ? 'transparent' : undefined,
        fontSize: 'calc(var(--base-scale, 1) * 1rem)',
        padding: isMobile ? '1.5rem 0.75rem' : 'calc(var(--base-scale, 1) * 1.5rem)',
      }}
    >
      {!isMobile && (
        <div className="mb-4 flex flex-col gap-4 px-2">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-light uppercase tracking-widest md:text-2xl">
                Aya<span className="font-bold opacity-60">Guide</span>
              </h1>
              <p className="text-[9px] font-medium uppercase tracking-[0.4em] text-white/40 md:text-[10px]">Portal Sagrado</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Activity className={`h-3.5 w-3.5 ${activeCount > 0 ? 'text-green-400' : 'text-white/20'}`} aria-hidden="true" />
                {activeCount > 0 && <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />}
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">{activeCount > 0 ? 'Sessao Ativa' : 'Sessao Inativa'}</span>
            </div>
          </div>
        </div>
      )}

      <motion.div
        animate={{ borderColor: activeCount > 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)' }}
        className="flex shrink-0 flex-col gap-4 rounded-[24px] border border-white/5 bg-white/5 p-5 backdrop-blur-xl"
      >
        <div className="flex w-full items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/20">Controle Mestre</span>
          {activeCount > 0 && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClearAll}
              data-testid="clear-all-sounds-button"
              className="flex items-center gap-1.5 rounded-lg border border-red-500/10 bg-red-500/10 px-2 py-1 text-[9px] uppercase tracking-widest text-red-400/80 outline-none transition-all hover:bg-red-500/20 focus-visible:ring-2 focus-visible:ring-red-500/40"
              aria-label="Limpar todos os sons ativos"
            >
              <Trash2 className="h-2.5 w-2.5" aria-hidden="true" />
              Limpar Tudo
            </motion.button>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Volume2 className="h-3.5 w-3.5 text-white/30" aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-widest text-white/40">Volume Mestre</span>
              </div>
              <span className="text-[11px] font-mono text-white/50">{Math.round(masterVolume * 100)}%</span>
            </div>
            <div className="group/vol relative flex h-4 items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                onChange={(event) => onMasterVolumeChange(parseFloat(event.target.value))}
                data-testid="master-volume-slider"
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-transparent focus:outline-none"
                style={{ background: `linear-gradient(to right, ${activeChakra.palette.primary} ${masterVolume * 100}%, rgba(255,255,255,0.1) ${masterVolume * 100}%)` }}
                aria-label="Volume mestre"
              />
              <div
                className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-white transition-transform group-hover/vol:scale-110"
                style={{ left: `calc(${masterVolume * 100}% - 7px)`, backgroundColor: activeChakra.palette.primary, boxShadow: `0 0 10px ${activeChakra.palette.primary}` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Brain className="h-3.5 w-3.5 text-white/30" aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-widest text-white/40">Foco Dinamico</span>
              </div>
              <span className="text-[10px] font-mono text-white/30">{Math.round(focusLevel * 100)}%</span>
            </div>
            <div className="group/focus relative flex h-4 items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={focusLevel}
                onChange={(event) => onFocusLevelChange(parseFloat(event.target.value))}
                className="h-0.5 w-full cursor-pointer appearance-none rounded-full bg-white/5 accent-transparent focus:outline-none"
                style={{ background: `linear-gradient(to right, ${activeChakra.palette.primary} ${focusLevel * 100}%, rgba(255,255,255,0.05) ${focusLevel * 100}%)` }}
                aria-label="Filtro de foco"
              />
              <div
                className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-white/60 transition-transform group-hover/focus:scale-125"
                style={{ left: `calc(${focusLevel * 100}% - 6px)`, backgroundColor: activeChakra.palette.primary }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col border-b border-white/5 pb-2">
          <button type="button" onClick={() => toggleSection('chakras')} data-testid="section-toggle-chakras" className={`w-full rounded-2xl p-4 px-5 text-left outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white/20 ${expandedSection === 'chakras' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/60'}`} aria-expanded={expandedSection === 'chakras'} aria-controls="chakras-section">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" />Frequencias Sagradas</h2>
              <ChevronDown className={`h-4 w-4 text-white/20 transition-transform duration-500 ${expandedSection === 'chakras' ? 'rotate-180' : ''}`} aria-hidden="true" />
            </div>
          </button>
          <AnimatePresence initial={false}>
            {expandedSection === 'chakras' && (
              <motion.div id="chakras-section" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }} className="overflow-hidden">
                <div className="grid gap-2.5 px-1 pb-4 pt-4">
                  {chakras.map((chakra, idx) => (
                    <motion.div key={chakra.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                      <ChakraCard
                        chakra={chakra}
                        isActive={isChakraOn && activeChakra.id === chakra.id}
                        volume={activeChakra.id === chakra.id ? chakraVolume : 0}
                        onVolumeChange={(volume: number) => {
                          onChakraVolumeChange(volume);
                          if (volume > 0 && !isChakraOn) onChakraToggle('on');
                        }}
                        onToggle={(type: 'on' | 'off') => {
                          if (type === 'on') {
                            onChakraSelect(chakra);
                            onChakraToggle('on');
                            if (chakraVolume === 0) onChakraVolumeChange(0.5);
                            return;
                          }
                          onChakraToggle('off');
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

        <div className="flex flex-col border-b border-white/5 pb-2">
          <button type="button" onClick={() => toggleSection('elements')} data-testid="section-toggle-elements" className={`w-full rounded-2xl p-4 px-5 text-left outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white/20 ${expandedSection === 'elements' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/60'}`} aria-expanded={expandedSection === 'elements'} aria-controls="elements-section">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50"><span aria-hidden="true">{'\u{1F33F}'}</span>Elementos da Natureza</h2>
              <ChevronDown className={`h-4 w-4 text-white/20 transition-transform duration-500 ${expandedSection === 'elements' ? 'rotate-180' : ''}`} aria-hidden="true" />
            </div>
          </button>
          <AnimatePresence initial={false}>
            {expandedSection === 'elements' && (
              <motion.div id="elements-section" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }} className="overflow-hidden">
                <div className="space-y-4 pb-4 pt-4">
                  <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2 no-scrollbar">
                    {categorizedElements.map((category) => (
                      <motion.button key={category.id} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider outline-none transition-all focus-visible:ring-2 focus-visible:ring-white/20 ${expandedCategory === category.id ? 'bg-white text-black shadow-md' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'}`} aria-pressed={expandedCategory === category.id}>
                        {category.label}
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
                    {!showAllElements && filteredElements.length > 4 && (
                      <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAllElements(true)} className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white/40 outline-none transition-all hover:border-white/20 hover:bg-white/10 hover:text-white/60 focus-visible:ring-2 focus-visible:ring-white/20">
                        Ver Mais ({filteredElements.length - 4})
                      </motion.button>
                    )}
                    {showAllElements && filteredElements.length > 4 && (
                      <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAllElements(false)} className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white/40 outline-none transition-all hover:border-white/20 hover:bg-white/10 hover:text-white/60 focus-visible:ring-2 focus-visible:ring-white/20">
                        Ver Menos
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col border-b border-white/5 pb-2">
          <button type="button" onClick={() => toggleSection('binaural')} className={`w-full rounded-2xl p-4 px-5 text-left outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white/20 ${expandedSection === 'binaural' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/60'}`} aria-expanded={expandedSection === 'binaural'} aria-controls="binaural-section">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50"><Brain className="h-3.5 w-3.5" aria-hidden="true" />Ondas Cerebrais</h2>
              <div className="flex items-center gap-2">
                {binauralState !== 'off' && <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-white/30">{binauralState}</span>}
                <ChevronDown className={`h-4 w-4 text-white/20 transition-transform duration-500 ${expandedSection === 'binaural' ? 'rotate-180' : ''}`} aria-hidden="true" />
              </div>
            </div>
          </button>
          <AnimatePresence initial={false}>
            {expandedSection === 'binaural' && (
              <motion.div id="binaural-section" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }} className="overflow-hidden">
                <div className="px-1 pb-4 pt-4">
                  <BinauralPanel binauralState={binauralState} binauralVolume={binauralVolume} onStateChange={onBinauralStateChange} onVolumeChange={onBinauralVolumeChange} chakraColor={activeChakra.palette.primary} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col border-b border-white/5 pb-2">
          <button type="button" onClick={() => toggleSection('breathing')} className={`w-full rounded-2xl p-4 px-5 text-left outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white/20 ${expandedSection === 'breathing' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/60'}`} aria-expanded={expandedSection === 'breathing'}>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50"><span aria-hidden="true">{'\u{1F32C}\u{FE0F}'}</span>Guia de Respiracao</h2>
              <div className="flex items-center gap-2">
                {breathingActive && <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />}
                <ChevronDown className={`h-4 w-4 text-white/20 transition-transform duration-500 ${expandedSection === 'breathing' ? 'rotate-180' : ''}`} aria-hidden="true" />
              </div>
            </div>
          </button>
          <AnimatePresence initial={false}>
            {expandedSection === 'breathing' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }} className="overflow-hidden">
                <div className="space-y-4 px-1 pb-4 pt-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Ativar Guia</span>
                    <button type="button" onClick={onBreathingToggle} aria-label={breathingActive ? 'Desativar guia de respiracao' : 'Ativar guia de respiracao'} aria-pressed={breathingActive} className={`relative h-5 w-10 rounded-full outline-none transition-all focus-visible:ring-2 focus-visible:ring-white/30 ${breathingActive ? 'bg-green-500/40' : 'bg-white/10'}`}>
                      <motion.div animate={{ x: breathingActive ? 22 : 2 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} className="absolute top-1 h-3 w-3 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">Padrao Selecionado</span>
                      <span className="text-[9px] font-mono text-white/40">{BREATHING_PATTERNS.find((pattern) => pattern.id === breathingPatternId)?.name || 'Calmo'}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {BREATHING_PATTERNS.map((pattern) => (
                        <button key={pattern.id} type="button" onClick={() => onBreathingPatternChange(pattern.id)} aria-pressed={breathingPatternId === pattern.id} className={`flex items-center justify-between rounded-xl border p-3 outline-none transition-all focus-visible:ring-2 focus-visible:ring-white/30 ${breathingPatternId === pattern.id ? 'border-white/20 bg-white/10 text-white' : 'border-transparent bg-white/5 text-white/40 hover:bg-white/10'}`}>
                          <div className="flex items-center gap-3">
                            <span className="text-sm" aria-hidden="true">{pattern.emoji}</span>
                            <div className="flex flex-col items-start">
                              <span className="text-[11px] font-medium">{pattern.name}</span>
                              <span className="text-[8px] uppercase tracking-tighter text-white/20">{pattern.description}</span>
                            </div>
                          </div>
                          {breathingPatternId === pattern.id && <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col border-b border-white/5 pb-2">
          <button type="button" onClick={() => toggleSection('journeys')} className={`w-full rounded-2xl p-4 px-5 text-left outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white/20 ${expandedSection === 'journeys' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/60'}`} aria-expanded={expandedSection === 'journeys'} aria-controls="journeys-section">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50"><Compass className="h-3.5 w-3.5" aria-hidden="true" />Jornadas Guiadas</h2>
              <ChevronDown className={`h-4 w-4 text-white/20 transition-transform duration-500 ${expandedSection === 'journeys' ? 'rotate-180' : ''}`} aria-hidden="true" />
            </div>
          </button>
          <AnimatePresence initial={false}>
            {expandedSection === 'journeys' && (
              <motion.div id="journeys-section" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }} className="overflow-hidden">
                <div className="px-1 pb-4 pt-4">
                  <JourneySelector onStart={onStartJourney} isJourneyActive={isJourneyActive} chakraColor={activeChakra.palette.primary} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-2 flex flex-col">
          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-1">
            <button type="button" onClick={() => toggleSection('templates')} className={`flex-1 rounded-xl p-3 px-4 text-left outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white/20 ${expandedSection === 'templates' ? 'bg-white/5 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/60'}`} aria-expanded={expandedSection === 'templates'} aria-controls="templates-section" aria-label="Abrir biblioteca de mixes">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50"><FolderHeart className="h-3 w-3 text-white/30" aria-hidden="true" />Biblioteca Sagrada</h2>
                <ChevronDown className={`h-4 w-4 text-white/20 transition-transform duration-500 ${expandedSection === 'templates' ? 'rotate-180' : ''}`} aria-hidden="true" />
              </div>
            </button>
            <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(event) => { event.stopPropagation(); onSaveTemplate(); }} className="ml-1 rounded-xl bg-white/5 p-3 text-white/30 outline-none transition-all hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/20" aria-label="Salvar mix atual">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </motion.button>
          </div>
          <AnimatePresence initial={false}>
            {expandedSection === 'templates' && (
              <motion.div id="templates-section" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }} className="overflow-hidden">
                <div className="sidebar-scroll max-h-[400px] space-y-6 overflow-y-auto px-1 pb-4 pr-2 pt-4">
                  <div>
                    <h3 className="mb-3 px-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Sessoes Sugeridas</h3>
                    <PresetTemplates onLoadTemplate={onLoadTemplate} />
                  </div>
                  <div className="mx-2 h-px bg-white/5" />
                  <div>
                    <h3 className="mb-3 px-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Mixes Salvos</h3>
                    <div className="space-y-2">
                      <AnimatePresence mode="popLayout">
                        {savedTemplates.map((template) => (
                          <motion.div key={template.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card group/t flex items-center justify-between rounded-xl border border-white/10 p-3 transition-all hover:border-white/20">
                            <motion.button type="button" whileHover={{ scale: 1.02 }} onClick={() => onLoadTemplate(template)} className="flex-1 rounded-lg text-left outline-none focus-visible:ring-1 focus-visible:ring-white/20" aria-label={`Carregar mix ${template.name}`}>
                              <p className="truncate text-[11px] font-medium text-white/60 transition-colors group-hover/t:text-white">{template.name}</p>
                            </motion.button>
                            <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onDeleteTemplate(String(template.id))} className="rounded-md p-1 text-red-400 opacity-0 outline-none transition-all group-hover/t:opacity-40 hover:!opacity-100 focus-visible:ring-1 focus-visible:ring-red-400/40" aria-label={`Excluir mix ${template.name}`}>
                              <Trash2 className="h-3 w-3" aria-hidden="true" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {savedTemplates.length === 0 && (
                        <div className="rounded-xl border border-dashed border-white/10 py-4 text-center">
                          <p className="text-[10px] uppercase tracking-widest text-white/20">Sem mixes salvos</p>
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
