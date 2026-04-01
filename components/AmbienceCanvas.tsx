'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { 
  ElementalLayer, 
  WaterLayer, 
  WindLayer, 
  NatureLayer, 
  EtherealLayer,
  DrawFunction 
} from './canvas/AmbienceLayers';

import { useSessionStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';

interface AmbienceCanvasProps {
  // volumes and chakraColor are now read directly from store for better performance
}

export function AmbienceCanvas({ }: AmbienceCanvasProps) {
  const { ambientVolumes, activeChakra } = useSessionStore(useShallow(s => ({
    ambientVolumes: s.ambientVolumes,
    activeChakra: s.activeChakra
  })));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafId = useRef<number | null>(null);
  const isVisible = useRef(true);
  
  // Refs for high-frequency data to avoid re-running the effect
  const volumesRef = useRef(ambientVolumes);
  const colorRef = useRef(activeChakra?.palette.primary || '#ffffff');
  
  const layersRef = useRef<Record<string, DrawFunction>>({});
  
  // Sync refs with store state
  useEffect(() => {
    volumesRef.current = ambientVolumes;
    colorRef.current = activeChakra?.palette.primary || '#ffffff';
  }, [ambientVolumes, activeChakra]);

  const registerLayer = useCallback((name: string, draw: DrawFunction) => {
    layersRef.current[name] = draw;
  }, []);

  const unregisterLayer = useCallback((name: string) => {
    delete layersRef.current[name];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const isMobile = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2.0);
      
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    // Intersection Observer to pause rendering when not visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    // Page Visibility API to pause rendering when tab is hidden
    const handleVisibilityChange = () => {
      isVisible.current = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      if (!isVisible.current) {
        rafId.current = requestAnimationFrame(draw);
        return;
      }

      const isMobile = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2.0);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      frameRef.current++;
      const t = frameRef.current;
      
      ctx.clearRect(0, 0, w, h);
      
      const v = volumesRef.current;
      const cc = colorRef.current;

      Object.values(layersRef.current).forEach(layerDraw => {
        layerDraw(ctx, w, h, t, v, cc);
      });

      rafId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []); // Run on mount only

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[1] w-screen h-screen"
        role="img"
        aria-label="Fundo de ambiente animado com partículas e camadas de profundidade"
      />
      <ElementalLayer register={registerLayer} unregister={unregisterLayer} />
      <WaterLayer register={registerLayer} unregister={unregisterLayer} />
      <WindLayer register={registerLayer} unregister={unregisterLayer} />
      <NatureLayer register={registerLayer} unregister={unregisterLayer} />
      <EtherealLayer register={registerLayer} unregister={unregisterLayer} />
    </>
  );
}
