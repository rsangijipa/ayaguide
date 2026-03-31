'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Toast {
  id: number;
  message: string;
  icon?: string;
}

let toastId = 0;
let addToastFn: ((message: string, icon?: string) => void) | null = null;

export function showToast(message: string, icon?: string) {
  if (addToastFn) addToastFn(message, icon);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, icon?: string) => {
    const id = ++toastId;
    setToasts(prev => [...prev.slice(-3), { id, message, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="px-5 py-3 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center gap-2.5"
          >
            {toast.icon && <span className="text-sm">{toast.icon}</span>}
            <span className="text-xs text-white/80 tracking-wider font-light whitespace-nowrap">
              {toast.message}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
