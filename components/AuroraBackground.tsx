'use client';

import { useEffect, useRef, useState } from 'react';
import { getAudioEngine } from '@/lib/audio';

interface AuroraBackgroundProps {
  activeChakraHue: number;
  ambientVolumes: Record<string, number>;
  isPlaying: boolean;
}

export function AuroraBackground({ activeChakraHue, ambientVolumes, isPlaying }: AuroraBackgroundProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  const freqDataRef = useRef(new Uint8Array(32));
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const engine = getAudioEngine();
    if (!engine) return;

    const getLevels = () => {
      if (isPlaying) {
        engine.getFrequencyData(freqDataRef.current);
        const level = freqDataRef.current.reduce((a, b) => a + b, 0) / 32 / 255;
        setAudioLevel(level);
      } else {
        setAudioLevel(0);
      }
      rafId.current = requestAnimationFrame(getLevels);
    };

    rafId.current = requestAnimationFrame(getLevels);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isPlaying]);

  // Shift hue: water pushes toward blue (210), fire toward red (0), nature toward green (120)
  const waterLevel = ((ambientVolumes.water || 0) + (ambientVolumes.ocean || 0) + (ambientVolumes.waterfall || 0)) / 3;
  const fireLevel = ((ambientVolumes.fire || 0) + (ambientVolumes.lava || 0)) / 2;
  const natureLevel = ((ambientVolumes.forest || 0) + (ambientVolumes.birds || 0) + (ambientVolumes.leaves || 0)) / 3;
  const hueShift = waterLevel * 30 + fireLevel * -40 + natureLevel * 10;
  const auroraHue = activeChakraHue + hueShift;
  const auroraIntensity = 0.15 + audioLevel * 0.15 + (waterLevel + fireLevel + natureLevel) * 0.05;

  return (
    <div className="fixed inset-0 pointer-events-none z-[0] bg-[#020202]">
      <div 
        className="aurora-layer w-[80vw] h-[80vw] -top-[40%] -left-[20%]" 
        style={{ 
          background: `radial-gradient(circle, hsla(${auroraHue}, 100%, 50%, ${auroraIntensity}) 0%, transparent 70%)`, 
          transition: 'background 2s ease' 
        }} 
      />
      <div 
        className="aurora-layer w-[60vw] h-[60vw] -bottom-[30%] -right-[10%]" 
        style={{ 
          background: `radial-gradient(circle, hsla(${(auroraHue + 180) % 360}, 100%, 50%, ${auroraIntensity * 0.7}) 0%, transparent 70%)`, 
          animationDelay: '-5s', 
          transition: 'background 2s ease' 
        }} 
      />
      <div 
        className="aurora-layer w-[100vw] h-[100vw] top-[10%] left-[10%]" 
        style={{ 
          background: `radial-gradient(circle, hsla(${auroraHue}, 100%, 30%, ${auroraIntensity * 0.4}) 0%, transparent 80%)`, 
          animationDuration: '30s', 
          transition: 'background 2s ease' 
        }} 
      />
    </div>
  );
}
