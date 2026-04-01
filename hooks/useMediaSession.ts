import { useEffect } from 'react';
import { useSessionStore } from '@/lib/store';

interface MediaSessionMetadata {
  title: string;
  artist: string;
  album: string;
  artwork: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
}

export function useMediaSession() {
  const { isPlaying, togglePlay, activeChakra, sessionDuration, timeLeft } = useSessionStore(
    (state) => ({
      isPlaying: state.isPlaying,
      togglePlay: state.togglePlay,
      activeChakra: state.activeChakra,
      sessionDuration: state.sessionDuration,
      timeLeft: state.timeLeft,
    })
  );

  useEffect(() => {
    // Verificar suporte à Media Session API
    if (!('mediaSession' in navigator)) {
      console.warn('Media Session API não é suportada neste navegador');
      return;
    }

    const mediaSession = navigator.mediaSession;

    // Configurar metadados da sessão de mídia
    const metadata: MediaSessionMetadata = {
      title: `Meditação - ${activeChakra.name}`,
      artist: 'AyaGuide',
      album: 'Portal de Meditação Sonora',
      artwork: [
        {
          src: '/icon.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/icon.png',
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    };

    try {
      mediaSession.metadata = new MediaMetadata(metadata);
    } catch (error) {
      console.warn('Erro ao definir metadados da sessão de mídia:', error);
    }

    // Definir estado de reprodução
    mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    // Configurar handlers de ação
    const actionHandlers: Record<MediaSessionAction, () => void> = {
      play: () => {
        if (!isPlaying) {
          togglePlay();
        }
      },
      pause: () => {
        if (isPlaying) {
          togglePlay();
        }
      },
      stop: () => {
        if (isPlaying) {
          togglePlay();
        }
      },
      seekbackward: () => {
        // Opcional: implementar retrocesso
      },
      seekforward: () => {
        // Opcional: implementar avanço
      },
      seekto: () => {
        // Opcional: implementar busca
      },
      previoustrack: () => {
        // Opcional: implementar faixa anterior
      },
      nexttrack: () => {
        // Opcional: implementar próxima faixa
      },
      skipad: () => {
        // Opcional: implementar pular anúncio
      },
      togglecamera: () => {
        // Não aplicável para áudio
      },
      togglemicrophone: () => {
        // Não aplicável para áudio
      },
      hangup: () => {
        // Não aplicável para áudio
      },
    };

    // Registrar handlers
    Object.entries(actionHandlers).forEach(([action, handler]) => {
      try {
        mediaSession.setActionHandler(action as MediaSessionAction, handler);
      } catch (error) {
        // Algumas ações podem não ser suportadas
      }
    });

    // Atualizar posição de reprodução
    const positionState = {
      duration: sessionDuration * 60,
      playbackRate: 1,
      position: (sessionDuration * 60 - timeLeft) || 0,
    };

    try {
      mediaSession.setPositionState(positionState);
    } catch (error) {
      console.warn('Erro ao definir posição de reprodução:', error);
    }

    return () => {
      // Limpar handlers ao desmontar
      Object.keys(actionHandlers).forEach((action) => {
        try {
          mediaSession.setActionHandler(action as MediaSessionAction, null);
        } catch (error) {
          // Silenciar erros ao limpar
        }
      });
    };
  }, [isPlaying, togglePlay, activeChakra, sessionDuration, timeLeft]);
}
