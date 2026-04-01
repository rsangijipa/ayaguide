"use client";

import { useEffect, useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { showToast } from '@/components/Toast';

/**
 * PWAInstaller
 * 
 * Este componente aguarda 5 segundos após o carregamento da página
 * e, se o navegador puder ser instalado na tela inicial, dispara um Toast.
 */
export function PWAInstaller() {
  const { canInstall, installApp } = usePWAInstall();
  const [toastShown, setToastShown] = useState(false);

  useEffect(() => {
    // Se o app já estiver instalado ou não puder ser instalado, não faz nada
    if (!canInstall || toastShown) return;

    // Aguarda 5 segundos antes de mostrar o convite
    const delay = 5000;
    const timeoutId = setTimeout(() => {
      showToast(
        "Instale o AyaGuide para uma melhor experiência.",
        "📱",
        "Instalar",
        () => {
          installApp();
        }
      );
      setToastShown(true);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [canInstall, toastShown, installApp]);

  return null;
}
