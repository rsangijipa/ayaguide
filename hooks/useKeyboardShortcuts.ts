'use client';

import { useEffect, useRef } from 'react';

interface ShortcutHandlers {
  onTogglePlay: () => void;
  onToggleFullscreen: () => void;
  onToggleMute: () => void;
  onToggleBreathing: () => void;
  onToggleSidebar: () => void;
}

export function useKeyboardShortcuts(hasStarted: boolean, handlers: ShortcutHandlers) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!hasStarted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcut if focused in input (like template search or save)
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlersRef.current.onTogglePlay();
          break;
        case 'KeyF':
          e.preventDefault();
          handlersRef.current.onToggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          handlersRef.current.onToggleMute();
          break;
        case 'KeyB':
          e.preventDefault();
          handlersRef.current.onToggleBreathing();
          break;
        case 'KeyP': // Sidebar Toggle (Picker)
          e.preventDefault();
          handlersRef.current.onToggleSidebar();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted]);
}
