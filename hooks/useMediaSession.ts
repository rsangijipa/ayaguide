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

    // Configurar handlers de ação para controles de áudio
    const handlePlay = () => {
      if (!isPlaying) {
        togglePlay();
      }
    };

    const handlePause = () => {
      if (isPlaying) {
        togglePlay();
      }
    };

    // Registrar handlers de ação
    try {
      mediaSession.setActionHandler('play', handlePlay);
      mediaSession.setActionHandler('pause', handlePause);
      mediaSession.setActionHandler('stop', handlePause);
    } catch (error) {
      console.warn('Erro ao registrar handlers de Media Session:', error);
    }

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
      try {
        mediaSession.setActionHandler('play', null);
        mediaSession.setActionHandler('pause', null);
        mediaSession.setActionHandler('stop', null);
      } catch (error) {
        // Silenciar erros ao limpar
      }
    };
  }, [isPlaying, togglePlay, activeChakra, sessionDuration, timeLeft]);
}
