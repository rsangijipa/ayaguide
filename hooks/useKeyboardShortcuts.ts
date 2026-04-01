'use client';

import { useEffect } from 'react';

interface ShortcutHandlers {
  onTogglePlay: () => void;
  onToggleFullscreen: () => void;
  onToggleMute: () => void;
  onToggleBreathing: () => void;
  onToggleSidebar: () => void;
}

export function useKeyboardShortcuts(hasStarted: boolean, handlers: ShortcutHandlers) {
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
          handlers.onTogglePlay();
          break;
        case 'KeyF':
          e.preventDefault();
          handlers.onToggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          handlers.onToggleMute();
          break;
        case 'KeyB':
          e.preventDefault();
          handlers.onToggleBreathing();
          break;
        case 'KeyP': // Sidebar Toggle (Picker)
          e.preventDefault();
          handlers.onToggleSidebar();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, handlers]);
}
