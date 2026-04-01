import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdating: boolean;
  error: string | null;
}

export function useServiceWorker(): ServiceWorkerState {
  const [state, setState] = useState<ServiceWorkerState>(() => ({
    isSupported: typeof window !== 'undefined' && 'serviceWorker' in navigator,
    isRegistered: false,
    isUpdating: false,
    error: null,
  }));

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker nao e suportado neste navegador');
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;
    let updateInterval: ReturnType<typeof setInterval> | null = null;

    const registerServiceWorker = async () => {
      try {
        setState((prev) => ({ ...prev, isUpdating: true }));

        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[useServiceWorker] Service Worker registrado com sucesso:', registration);

        setState((prev) => ({
          ...prev,
          isRegistered: true,
          isUpdating: false,
          error: null,
        }));

        registration.addEventListener('updatefound', () => {
          const newWorker = registration?.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[useServiceWorker] Nova versao do Service Worker disponivel');
            }
          });
        });

        updateInterval = setInterval(() => {
          registration?.update();
        }, 60 * 60 * 1000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error('[useServiceWorker] Erro ao registrar Service Worker:', errorMessage);
        setState((prev) => ({
          ...prev,
          isRegistered: false,
          isUpdating: false,
          error: errorMessage,
        }));
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', registerServiceWorker);
    } else {
      registerServiceWorker();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', registerServiceWorker);
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, []);

  return state;
}
