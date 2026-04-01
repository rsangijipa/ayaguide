"use client";

/**
 * AudioPlayer.tsx
 * Componente React para o sistema de loop contínuo AyaGuide.
 */

import { useEffect, useRef, useState } from "react";
import { AudioLoopManager } from "@/lib/audioLoop";

export interface AudioPlayerElement {
  id: string;
  name: string;
  url: string;
}

export interface AudioPlayerProps {
  src: string;
  elementId: string;
  elementName: string;
  volume: number;
  isActive: boolean;
  loopDuration?: number; // em segundos
  onLoopComplete?: () => void;
  showProgress?: boolean;
}

export function AudioPlayer({
  src,
  elementId,
  elementName,
  volume,
  isActive,
  loopDuration = 14400, // 4 horas
  onLoopComplete,
  showProgress = false,
}: AudioPlayerProps) {
  const loopManagerRef = useRef<AudioLoopManager | null>(null);
  const [progress, setProgress] = useState(0);

  // Inicializar motor de áudio quando o componente monta
  useEffect(() => {
    if (!loopManagerRef.current) {
      loopManagerRef.current = new AudioLoopManager(
        src,
        volume,
        loopDuration,
        onLoopComplete
      );
    }

    return () => {
      if (loopManagerRef.current) {
        loopManagerRef.current.cleanup();
        loopManagerRef.current = null;
      }
    };
  }, [src, volume, loopDuration, onLoopComplete]);

  // Sincronizar volume
  useEffect(() => {
    if (loopManagerRef.current) {
      loopManagerRef.current.setVolume(volume);
      
      // Conexão preguiçosa: Só conecta ao motor de áudio Web se o som estiver sendo usado
      // Isso resolve a limitação de 'um som por vez' em alguns navegadores (Chrome/Edge)
      if (volume > 0.01) {
        loopManagerRef.current.connectToEngine();
      }
    }
  }, [volume]);

  // Sincronizar fonte (caso mude dinamicamente)
  useEffect(() => {
    if (loopManagerRef.current) {
      loopManagerRef.current.setSrc(src);
    }
  }, [src]);

  // Sincronizar estado de ativação (Play/Pause)
  useEffect(() => {
    if (loopManagerRef.current) {
      if (isActive && volume > 0) {
        loopManagerRef.current.start();
      } else {
        loopManagerRef.current.pause();
      }
    }
  }, [isActive, volume]);

  // Monitorar progresso caso a UI precise exibir
  useEffect(() => {
    if (!showProgress) return;
    
    let frameId: number;
    const updateProgress = () => {
      if (loopManagerRef.current) {
        setProgress(loopManagerRef.current.getProgress());
      }
      frameId = requestAnimationFrame(updateProgress);
    };

    frameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(frameId);
  }, [showProgress]);

  // Componente invisível (apenas gerenciador de áudio)
  if (!showProgress) return null;

  return (
    <div className="audio-player-status p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">{elementName}</span>
        <span className="text-[9px] font-mono text-white/50">{Math.floor(progress * 100)}%</span>
      </div>
      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white/30 transition-all duration-300" 
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// AudioPlayerGroup
// --------------------------------------------------------------------------------

export interface AudioPlayerGroupProps {
  elements: AudioPlayerElement[];
  volumes: Record<string, number>;
  isPlaying: boolean;
  loopDuration?: number;
  onLoopComplete?: (elementId: string) => void;
}

export function AudioPlayerGroup({
  elements,
  volumes,
  isPlaying,
  loopDuration = 14400,
  onLoopComplete,
}: AudioPlayerGroupProps) {
  return (
    <div className="audio-player-group hidden">
      {elements.map((element) => (
        <AudioPlayer
          key={element.id}
          elementId={element.id}
          elementName={element.name}
          src={element.url}
          volume={volumes[element.id] || 0}
          isActive={isPlaying}
          loopDuration={loopDuration}
          onLoopComplete={() => onLoopComplete && onLoopComplete(element.id)}
        />
      ))}
    </div>
  );
}
