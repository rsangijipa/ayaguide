import { useEffect, useRef } from 'react';
import { useSessionStore } from '@/lib/store';

// Áudio silencioso mínimo para manter a Media Session ativa no Android/Chrome
const SILENT_AUDIO_BASE64 = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";

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

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Inicializar o elemento de áudio silencioso
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio(SILENT_AUDIO_BASE64);
    audio.loop = true;
    audio.volume = 0.01; // Quase inaudível, mas presente
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // 2. Sincronizar o áudio silencioso com o estado isPlaying
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      // Tentar tocar o áudio silencioso (requer interação prévia do usuário, 
      // o que já acontece ao iniciar a meditação)
      audio.play().catch((err) => {
        console.warn('Erro ao tocar áudio silencioso para Media Session:', err);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // 3. Configurar Metadados e Handlers da Media Session
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    const mediaSession = navigator.mediaSession;

    // Configurar metadados
    try {
      mediaSession.metadata = new MediaMetadata({
        title: `Meditação - ${activeChakra.name}`,
        artist: 'AyaGuide',
        album: 'Portal de Meditação Sonora',
        artwork: [
          { src: '/icon.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon.png', sizes: '192x192', type: 'image/png' },
        ],
      });
    } catch (error) {
      console.warn('Erro ao definir metadados da Media Session:', error);
    }

    // Handlers de ação
    const handlePlay = () => {
      if (!useSessionStore.getState().isPlaying) {
        togglePlay();
      }
    };

    const handlePause = () => {
      if (useSessionStore.getState().isPlaying) {
        togglePlay();
      }
    };

    try {
      mediaSession.setActionHandler('play', handlePlay);
      mediaSession.setActionHandler('pause', handlePause);
      mediaSession.setActionHandler('stop', handlePause);
      
      // Opcional: Adicionar handlers de pular se houver lógica para isso no futuro
      // mediaSession.setActionHandler('previoustrack', null);
      // mediaSession.setActionHandler('nexttrack', null);
    } catch (error) {
      console.warn('Erro ao registrar handlers de Media Session:', error);
    }

    return () => {
      try {
        mediaSession.setActionHandler('play', null);
        mediaSession.setActionHandler('pause', null);
        mediaSession.setActionHandler('stop', null);
      } catch (error) {}
    };
  }, [activeChakra, togglePlay]); // Removido isPlaying e timeLeft para evitar re-registro constante

  // 4. Atualizar Estado de Reprodução e Posição
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    const mediaSession = navigator.mediaSession;
    
    // Atualizar estado de reprodução
    mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    // Atualizar posição de reprodução
    const duration = sessionDuration * 60;
    const position = Math.max(0, Math.min(duration, duration - timeLeft));

    if (!isNaN(duration) && !isNaN(position) && duration > 0) {
      try {
        mediaSession.setPositionState({
          duration: duration,
          playbackRate: 1,
          position: position,
        });
      } catch (error) {
        console.warn('Erro ao definir posição de reprodução:', error);
      }
    }
  }, [isPlaying, sessionDuration, timeLeft]);
}
