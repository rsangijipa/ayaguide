'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se o app já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setShowPrompt(true);
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      console.log('PWA foi instalado com sucesso!');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Usuário aceitou a instalação');
        setIsInstalled(true);
      } else {
        console.log('Usuário recusou a instalação');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  // Não mostrar nada se o app já está instalado ou não há prompt disponível
  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-2xl p-4 max-w-sm border border-purple-400/30 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-white flex-shrink-0" />
            <h3 className="font-semibold text-white">Instalar AyaGuide</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors p-1 -m-1"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-white/90 text-sm mb-4">
          Instale nosso aplicativo para uma experiência melhor e acesso offline.
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-white text-purple-600 font-semibold py-2 px-4 rounded-lg hover:bg-white/90 transition-colors"
          >
            Instalar
          </button>
          <button
            onClick={handleClose}
            className="flex-1 bg-white/20 text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors"
          >
            Depois
          </button>
        </div>
      </div>
    </div>
  );
}
