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

  // 1. Initialize Loop Manager on Mount
  useEffect(() => {
    if (!loopManagerRef.current) {
      loopManagerRef.current = new AudioLoopManager(src, volume, loopDuration, onLoopComplete);
      // Pre-load the buffer for instant playback
      loopManagerRef.current.load();
    }

    return () => {
      if (loopManagerRef.current) {
        loopManagerRef.current.cleanup();
        loopManagerRef.current = null;
      }
    };
  }, [src, loopDuration, onLoopComplete]); // volume handled by dedicated effect

  // 2. Synchronize Volume
  useEffect(() => {
    if (loopManagerRef.current) {
      loopManagerRef.current.setVolume(volume);
    }
  }, [volume]);

  // 3. Synchronize Playback State
  useEffect(() => {
    if (loopManagerRef.current) {
      if (isActive) {
        loopManagerRef.current.start();
      } else {
        loopManagerRef.current.pause();
      }
    }
  }, [isActive]);

  // 4. Synchronize Source
  useEffect(() => {
    if (loopManagerRef.current) {
      loopManagerRef.current.setSrc(src).catch(() => {});
    }
  }, [src]);

  // 5. Progress Monitoring
  useEffect(() => {
    if (!showProgress) return;
    let frameId: number;
    const updateProgress = () => {
      if (loopManagerRef.current) setProgress(loopManagerRef.current.getProgress());
      frameId = requestAnimationFrame(updateProgress);
    };
    frameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(frameId);
  }, [showProgress]);

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
  onLoopComplete 
}: AudioPlayerGroupProps) {
  // CRITICAL: Only render AudioPlayer for elements with volume > 0 
  // This respects browser limits on MediaElementAudioSourceNodes (usually 10)
  return (
    <div className="audio-player-group hidden">
      {elements.map((element: AudioPlayerElement) => {
        const vol = volumes[element.id] || 0;
        if (vol <= 0) return null;
        
        return (
          <AudioPlayer
            key={element.id}
            elementId={element.id}
            elementName={element.name}
            src={element.url}
            volume={vol}
            isActive={isPlaying}
            loopDuration={loopDuration}
            onLoopComplete={() => onLoopComplete && onLoopComplete(element.id)}
          />
        );
      })}
    </div>
  );
}
