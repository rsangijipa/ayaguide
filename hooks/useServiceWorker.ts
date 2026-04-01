import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdating: boolean;
  error: string | null;
}

export function useServiceWorker(): ServiceWorkerState {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isUpdating: false,
    error: null,
  });

  useEffect(() => {
    // Verificar suporte a Service Worker
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker não é suportado neste navegador');
      setState((prev) => ({ ...prev, isSupported: false }));
      return;
    }

    setState((prev) => ({ ...prev, isSupported: true }));

    let registration: ServiceWorkerRegistration | null = null;

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

        // Verificar atualizações periodicamente
        registration.addEventListener('updatefound', () => {
          const newWorker = registration!.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[useServiceWorker] Nova versão do Service Worker disponível');
              // Aqui você pode notificar o usuário sobre uma atualização
            }
          });
        });

        // Verificar atualizações a cada hora
        setInterval(() => {
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

    // Aguardar o carregamento completo da página antes de registrar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', registerServiceWorker);
    } else {
      registerServiceWorker();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', registerServiceWorker);
    };
  }, []);

  return state;
}
