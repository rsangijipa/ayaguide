'use client';

import React, { useState } from 'react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl"
          >
            {/* Background Glow */}
            <div 
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[80px] opacity-20"
              style={{ backgroundColor: chakraColor }}
            />

            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Sparkles className="h-5 w-5 text-white/70" />
                  </div>
                  <h2 className="text-xl font-light tracking-wide text-white/90">Salvar Modelo Sagrado</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="rounded-full p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mb-8 text-sm font-light leading-relaxed text-white/40 tracking-wide">
                Dê um nome para as configurações atuais de chakra e sons da natureza para carregar esta jornada futuramente.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Meditação da Manhã..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-white/20 outline-none transition-all focus:border-white/20 focus:bg-white/10"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-2xl border border-white/5 bg-white/5 py-4 text-sm font-light tracking-wider text-white/40 transition-all hover:bg-white/10 hover:text-white/60"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="flex flex-[2] items-center justify-center gap-2 rounded-2xl py-4 text-sm font-medium tracking-wider text-white transition-all disabled:opacity-30"
                    style={{ 
                      backgroundColor: `${chakraColor}20`,
                      border: `1px solid ${chakraColor}40`,
                      color: chakraColor 
                    }}
                  >
                    <Save className="h-4 w-4" />
                    Salvar Jornada
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
