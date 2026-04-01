'use client';

import { logger } from './logger';

/**
 * createSafeStorage
 * A robust storage wrapper that avoids crashes on QuotaExceededError
 * and handles SSR gracefully.
 */
export function createSafeStorage(type: 'localStorage' | 'sessionStorage' = 'localStorage') {
  const getStorage = () => {
    if (typeof window === 'undefined') return null;
    try {
      return window[type];
    } catch (e) {
      return null;
    }
  };

  return {
    getItem: (name: string): string | null => {
      const storage = getStorage();
      if (!storage) return null;
      try {
        return storage.getItem(name);
      } catch (e) {
        logger.error(`Error reading from ${type}: ${name}`, e);
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      const storage = getStorage();
      if (!storage) return;
      try {
        storage.setItem(name, value);
      } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          logger.warn(`Storage quota exceeded for ${type}. Could not save ${name}.`);
        } else {
          logger.error(`Error writing to ${type}: ${name}`, e);
        }
      }
    },
    removeItem: (name: string): void => {
      const storage = getStorage();
      if (!storage) return;
      try {
        storage.removeItem(name);
      } catch (e) {
        logger.error(`Error removing from ${type}: ${name}`, e);
      }
    },
  };
}

export const safeLocalStorage = createSafeStorage('localStorage');
