'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { 
  ElementalLayer, 
  MysticalLayer, 
  NatureLayer, 
  WaterLayer, 
  WeatherLayer,
  DrawFunction 
} from './canvas/AmbienceLayers';

interface AmbienceCanvasProps {
  volumes: Record<string, number>;
  chakraColor: string;
}

export function AmbienceCanvas({ volumes, chakraColor }: AmbienceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafId = useRef<number | null>(null);
  
  // Refs for high-frequency data to avoid re-running the effect
  const volumesRef = useRef(volumes);
  const colorRef = useRef(chakraColor);
  
  const layersRef = useRef<Record<string, DrawFunction>>({});

  // Sync refs with props
  useEffect(() => {
    volumesRef.current = volumes;
    colorRef.current = chakraColor;
  }, [volumes, chakraColor]);

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
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      frameRef.current++;
      const t = frameRef.current;
      
      const v = volumesRef.current;
      const cc = colorRef.current;

      ctx.clearRect(0, 0, w, h);

      // Execute all registered layers
      Object.values(layersRef.current).forEach(layerDraw => {
        layerDraw(ctx, w, h, t, v, cc);
      });

      rafId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []); // Run on mount only

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[1] w-screen h-screen"
      />
      {/* Partitioned Layers */}
      <ElementalLayer register={registerLayer} unregister={unregisterLayer} />
      <MysticalLayer register={registerLayer} unregister={unregisterLayer} />
      <NatureLayer register={registerLayer} unregister={unregisterLayer} />
      <WaterLayer register={registerLayer} unregister={unregisterLayer} />
      <WeatherLayer register={registerLayer} unregister={unregisterLayer} />
    </>
  );
}
