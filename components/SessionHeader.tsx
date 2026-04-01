'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, Clock, Maximize2, Minimize2, Wind as WindIcon, LogOut, ChevronDown, AlertTriangle, X } from 'lucide-react';
import { TimerDropdown } from '@/components/TimerDropdown';
import type { Chakra } from '@/lib/types';

const formatTimeSeconds = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface SessionHeaderProps {
  activeChakra: Chakra;
  isFullScreen: boolean;
  isPlaying: boolean;
  timeLeft: number;
  sessionDuration: number;
  showTimerPicker: boolean;
  breathingActive: boolean;
  onToggleTimerPicker: () => void;
  onSelectDuration: (minutes: number) => void;
  onToggleFullscreen: () => void;
  onToggleBreathingGuide: () => void;
  onToggleBreathingPicker: () => void;
  onTogglePlay: () => void;
  onExit: () => void;
}

export function SessionHeader({
  activeChakra,
  isFullScreen,
  isPlaying,
  timeLeft,
  sessionDuration,
  showTimerPicker,
  breathingActive,
  onToggleTimerPicker,
  onSelectDuration,
  onToggleFullscreen,
  onToggleBreathingGuide,
  onToggleBreathingPicker,
  onTogglePlay,
  onExit,
}: SessionHeaderProps) {
  const [confirmExit, setConfirmExit] = useState(false);

  const openExitConfirmation = () => {
    setConfirmExit(true);
  };

  const closeExitConfirmation = () => {
    setConfirmExit(false);
  };

  const handleConfirmExit = () => {
    setConfirmExit(false);
    onExit();
  };

  return (
    <motion.header
      className={`glass relative flex w-full items-center justify-between rounded-[24px] border border-white/5 px-4 shadow-xl backdrop-blur-2xl transition-all duration-700 md:px-8 ${
        isFullScreen ? 'mt-2 h-14 md:h-16' : 'h-full'
      }`}
    >
      <div className="relative">
        <button
          type="button"
          className="group flex cursor-pointer items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white/30 md:gap-4"
          onClick={onToggleTimerPicker}
          aria-label="Abrir seletor de duracao"
          aria-expanded={showTimerPicker}
          aria-haspopup="dialog"
        >
          <motion.div whileHover={{ scale: 1.05 }} className="rounded-xl bg-white/5 p-2 md:p-3">
            <Clock className="h-5 w-5" aria-hidden="true" />
          </motion.div>
          <div className="hidden md:block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Duracao</p>
            <p className="text-xs font-light text-white/60">Ajustar tempo</p>
          </div>
        </button>
        <TimerDropdown
          isOpen={showTimerPicker}
          onClose={onToggleTimerPicker}
          onSelect={onSelectDuration}
          currentMinutes={sessionDuration}
          chakraColor={activeChakra.palette.primary}
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-2xl px-2 py-1 font-mono text-xl font-extralight tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-white/30 md:text-3xl"
          onClick={onToggleTimerPicker}
          aria-label="Alterar duracao da sessao"
        >
          {formatTimeSeconds(timeLeft)}
        </button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleFullscreen}
          className="glass relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          aria-label={isFullScreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
        >
          {isFullScreen ? (
            <Minimize2 className="h-4 w-4 text-white/70" aria-hidden="true" />
          ) : (
            <Maximize2 className="h-4 w-4 text-white/70" aria-hidden="true" />
          )}
        </motion.button>
      </div>

      <div className="relative flex items-center gap-2 md:gap-6">
        <div className="flex items-center gap-1.5 md:gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleBreathingGuide}
            aria-label={breathingActive ? 'Desativar guia de respiracao' : 'Ativar guia de respiracao'}
            aria-pressed={breathingActive}
            className={`flex h-9 w-9 items-center justify-center rounded-2xl border outline-none transition-all focus-visible:ring-2 focus-visible:ring-white/30 md:h-11 md:w-11 ${
              breathingActive
                ? 'border-white/30 bg-white/10 text-white/80'
                : 'border-white/10 bg-white/5 text-white/30 hover:text-white/60'
            }`}
          >
            <WindIcon className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleBreathingPicker}
            aria-label="Abrir tecnicas de respiracao"
            className="flex h-9 w-6 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/20 outline-none transition-all hover:bg-white/10 hover:text-white/50 focus-visible:ring-2 focus-visible:ring-white/30 md:h-11 md:w-7"
          >
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </motion.button>
        </div>

        <div className="mx-1 hidden h-8 w-px bg-white/10 md:block" />

        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.94 }}
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pausar sessao' : 'Iniciar sessao'}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl outline-none transition-all focus-visible:ring-2 focus-visible:ring-white/30 md:h-14 md:w-14 ${
            isPlaying ? 'bg-white/10' : 'bg-white text-black'
          }`}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 fill-white" aria-hidden="true" />
          ) : (
            <Play className="ml-0.5 h-5 w-5 fill-black" aria-hidden="true" />
          )}
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.94 }}
          onClick={openExitConfirmation}
          aria-label="Encerrar sessao"
          aria-expanded={confirmExit}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-white/20 outline-none transition-all hover:text-red-400 focus-visible:ring-2 focus-visible:ring-red-400/40"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </motion.button>

        <AnimatePresence>
          {confirmExit && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-[calc(100%+0.75rem)] z-[140] w-[min(92vw,20rem)] overflow-hidden rounded-2xl border border-red-400/20 bg-black/80 p-3 shadow-2xl backdrop-blur-3xl right-0 md:right-0 max-md:left-1/2 max-md:-translate-x-1/2"
              role="dialog"
              aria-modal="false"
              aria-label="Confirmar encerramento da sessao"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl bg-red-500/10 p-2 text-red-300">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Encerrar Sessao</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/45">
                    A sessao atual sera finalizada e o mix em andamento sera interrompido.
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeExitConfirmation}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-white/60 outline-none transition-all hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-red-300 outline-none transition-all hover:bg-red-500/20 focus-visible:ring-2 focus-visible:ring-red-400/40"
                >
                  Encerrar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
