"use client";

import { useEffect, useState, useCallback } from 'react';

/**
 * Hook usePWAInstall
 * 
 * Escuta o evento 'beforeinstallprompt' e permite disparar o diálogo 
 * de instalação do navegador sob demanda.
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado (modo standalone)
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: any) => {
      // Prevenir o aviso padrão do Chrome para usarmos nosso Toast
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return;

    // Mostrar o diálogo nativo
    deferredPrompt.prompt();

    // Aguardar a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    installApp,
    isInstalled,
  };
}
