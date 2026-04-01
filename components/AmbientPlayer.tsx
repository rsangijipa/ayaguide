/**
 * AmbientPlayer.tsx
 * Componente que delega toda mixagem ao AudioMixer centralizado.
 * Ao invés de N instâncias de HTMLAudioElement, usa um único AudioContext
 * com um GainNode por canal — mixagem simultânea ilimitada.
 */

"use client";

import { useEffect, useRef } from "react";
import { getAudioMixer } from "@/lib/audioMixer";
import { useSessionStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

export interface AmbientElement {
  id: string;
  name: string;
  url: string;
}

interface AmbientPlayerGroupProps {
  elements: AmbientElement[];
  volumes: Record<string, number>;   // 0–1 per element id
  isPlaying: boolean;
}

export function AmbientPlayerGroup({ elements, volumes, isPlaying }: AmbientPlayerGroupProps) {
  const { qualityMode } = useSessionStore(
    useShallow((s) => ({
      qualityMode: s.qualityMode,
    }))
  );

  const prevIsPlaying = useRef(isPlaying);
  const prevVolumes = useRef<Record<string, number>>({});

  // 1 — React to global play / pause
  useEffect(() => {
    if (qualityMode === 'minimal') return;
    const mixer = getAudioMixer();
    if (!mixer) return;

    if (isPlaying) {
      mixer.resume();
      mixer.resumeAll();
    } else {
      mixer.pauseAll();
    }

    prevIsPlaying.current = isPlaying;
  }, [isPlaying, qualityMode]);

  // 2 — React to individual volume changes
  useEffect(() => {
    const mixer = getAudioMixer();
    if (!mixer) return;

    for (const el of elements) {
      const vol = volumes[el.id] ?? 0;
      const prev = prevVolumes.current[el.id] ?? 0;

      if (vol !== prev) {
        // setChannelVolume handles load → play automatically
        mixer.setChannelVolume(el.url, vol, isPlaying).catch(() => {});
        prevVolumes.current[el.id] = vol;
      }
    }
  }, [volumes, elements, isPlaying, qualityMode]);

  // 3 — Cleanup on unmount
  useEffect(() => {
    return () => {
      const mixer = getAudioMixer();
      mixer?.stopAll();
    };
  }, []);

  return null; // purely a side-effect component
}
