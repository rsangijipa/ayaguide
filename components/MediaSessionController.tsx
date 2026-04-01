"use client";

import { useEffect, useRef } from 'react';
import { useMediaSession } from '@/hooks/useMediaSession';
import { useSessionStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';

/**
 * MediaSessionController
 * 
 * Este componente não renderiza nada visível, mas é crucial para:
 * 1. Ativar o hook useMediaSession.
 * 2. Manter um elemento <audio> "fantasma" que permite que o Chrome no Android 
 *    exiba os controles de mídia, mesmo usando Web Audio API.
 */
export function MediaSessionController() {
  // Ativa o hook de sincronização de metadados e ações
  useMediaSession();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isPlaying } = useSessionStore(useShallow(s => ({ isPlaying: s.isPlaying })));

  // Sincroniza o play/pause do áudio silencioso com o estado global
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      // Tentativa de play (pode falhar se não houver interação prévia, 
      // mas o mixer principal já lida com o desbloqueio do áudio)
      audioRef.current.play().catch(() => {
        // Falha silenciosa é esperada em alguns casos
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <audio
      ref={audioRef}
      id="silent-media-session-anchor"
      className="hidden"
      loop
      muted={false} // Deve estar desmutado para o browser considerar como "mídia ativa"
      playsInline
      /* 
         Data URI de 1 segundo de silêncio absoluto (WAV) 
         Isso garante que o browser detecte uma fonte de áudio real.
      */
      src="data:audio/wav;base64,UklGRigAAABXQVZFRm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAADw/w8A"
    />
  );
}
