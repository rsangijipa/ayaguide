'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Toast {
  id: number;
  message: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

let toastId = 0;
let addToastFn: ((message: string, icon?: string, actionLabel?: string, onAction?: () => void) => void) | null = null;

export function showToast(message: string, icon?: string, actionLabel?: string, onAction?: () => void) {
  if (addToastFn) addToastFn(message, icon, actionLabel, onAction);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutIdsRef = useRef<number[]>([]);

  const addToast = useCallback((message: string, icon?: string, actionLabel?: string, onAction?: () => void) => {
    const id = ++toastId;
    setToasts(prev => [...prev.slice(-3), { id, message, icon, actionLabel, onAction }]);
    
    // Auto-remove if no action (actions need user interaction usually)
    const timeout = actionLabel ? 8000 : 3500;
    const timeoutId = window.setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, timeout);
    timeoutIdsRef.current.push(timeoutId);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => {
      addToastFn = null;
      timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutIdsRef.current = [];
    };
  }, [addToast]);

  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
      aria-relevant="additions text"
    >
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="px-4 py-2.5 rounded-xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center gap-3 pointer-events-auto"
            role="status"
          >
            <div className="flex items-center gap-2">
              {toast.icon && <span className="text-sm">{toast.icon}</span>}
              <span className="text-[11px] text-white/90 tracking-wide font-light whitespace-nowrap">
                {toast.message}
              </span>
            </div>
            
            {toast.actionLabel && toast.onAction && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  setToasts(prev => prev.filter(t => t.id !== toast.id));
                }}
                className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80 outline-none transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/30"
              >
                {toast.actionLabel}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
