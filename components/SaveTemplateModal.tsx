'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Sparkles } from 'lucide-react';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  chakraColor: string;
}

export function SaveTemplateModal({ isOpen, onClose, onSave, chakraColor }: SaveTemplateModalProps) {
  const [name, setName] = useState('');
  const titleId = useId();
  const descriptionId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setName('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    if (window.innerWidth >= 768) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [handleClose, isOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = name.trim();
    if (!value) return;

    onSave(value);
    setName('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl [overscroll-behavior:contain]"
          >
            <div
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[80px] opacity-20"
              style={{ backgroundColor: chakraColor }}
            />

            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Sparkles className="h-5 w-5 text-white/70" aria-hidden="true" />
                  </div>
                  <h2 id={titleId} className="text-xl font-light tracking-wide text-white/90">
                    Salvar Mix Sagrado
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Fechar modal de salvamento"
                  className="rounded-full p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-white/60 focus-visible:ring-2 focus-visible:ring-white/30 outline-none"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <p id={descriptionId} className="mb-8 text-sm font-light leading-relaxed tracking-wide text-white/40">
                Dê um nome para o mix atual de chakra e sons da natureza para carregar essa combinacao depois.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="template-name" className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-white/35">
                    Nome do mix
                  </label>
                  <input
                    ref={inputRef}
                    id="template-name"
                    name="templateName"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ex.: Ritual da Manha…"
                    autoComplete="off"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-white/20 outline-none transition-all focus:border-white/20 focus:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/20"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 rounded-2xl border border-white/5 bg-white/5 py-4 text-sm font-light tracking-wider text-white/40 transition-all hover:bg-white/10 hover:text-white/60 focus-visible:ring-2 focus-visible:ring-white/30 outline-none"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="flex flex-[2] items-center justify-center gap-2 rounded-2xl py-4 text-sm font-medium tracking-wider transition-all disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-white/30 outline-none"
                    style={{
                      backgroundColor: `${chakraColor}20`,
                      border: `1px solid ${chakraColor}40`,
                      color: chakraColor,
                    }}
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Salvar Mix
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
