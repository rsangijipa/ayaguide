'use client';

import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface MandalaElegantProps {
  chakraId: string;
  ambientVolumes: Record<string, number>;
  audioLevel: number;
  isPlaying: boolean;
}

// Cores elegantes para cada chakra
const CHAKRA_COLORS = {
  root: { primary: '#ef4444', light: '#fca5a5', dark: '#7f1d1d', accent: '#fee2e2' },
  sacral: { primary: '#fb923c', light: '#fed7aa', dark: '#7c2d12', accent: '#ffedd5' },
  solar: { primary: '#facc15', light: '#fef3c7', dark: '#78350f', accent: '#fef9e7' },
  heart: { primary: '#10b981', light: '#a7f3d0', dark: '#065f46', accent: '#ecfdf5' },
  throat: { primary: '#3b82f6', light: '#bfdbfe', dark: '#1e3a8a', accent: '#eff6ff' },
  thirdeye: { primary: '#8b5cf6', light: '#ddd6fe', dark: '#4c1d95', accent: '#f5f3ff' },
  crown: { primary: '#d946ef', light: '#f0d9ff', dark: '#6b21a8', accent: '#faf5ff' },
};

// Influências de cores dos elementos
const ELEMENT_COLORS: Record<string, { hue: number; temp: 'warm' | 'cool' }> = {
  fire: { hue: 0, temp: 'warm' },
  lava: { hue: 25, temp: 'warm' },
  water: { hue: 200, temp: 'cool' },
  ocean: { hue: 210, temp: 'cool' },
  waterfall: { hue: 190, temp: 'cool' },
  rain: { hue: 220, temp: 'cool' },
  thunder: { hue: 240, temp: 'cool' },
  wind: { hue: 0, temp: 'cool' },
  storm: { hue: 230, temp: 'cool' },
  birds: { hue: 120, temp: 'cool' },
  forest: { hue: 100, temp: 'cool' },
  crickets: { hue: 110, temp: 'cool' },
  leaves: { hue: 130, temp: 'cool' },
  bells: { hue: 280, temp: 'cool' },
  gong: { hue: 270, temp: 'cool' },
  singing_bowl: { hue: 290, temp: 'cool' },
};

export function MandalaElegant({
  chakraId,
  ambientVolumes,
  audioLevel,
  isPlaying,
}: MandalaElegantProps) {
  const colors = CHAKRA_COLORS[chakraId as keyof typeof CHAKRA_COLORS] || CHAKRA_COLORS.heart;

  // Calcular influência dos elementos
  const elementInfluence = useMemo(() => {
    let warmIntensity = 0;
    let coolIntensity = 0;
    let avgHue = 0;
    let totalIntensity = 0;

    Object.entries(ambientVolumes).forEach(([elementId, volume]) => {
      if (volume > 0) {
        const element = ELEMENT_COLORS[elementId];
        if (element) {
          if (element.temp === 'warm') warmIntensity += volume;
          else coolIntensity += volume;
          avgHue += element.hue * volume;
          totalIntensity += volume;
        }
      }
    });

    return {
      warmIntensity: Math.min(warmIntensity, 1),
      coolIntensity: Math.min(coolIntensity, 1),
      avgHue: totalIntensity > 0 ? avgHue / totalIntensity : 0,
      hasElements: totalIntensity > 0,
    };
  }, [ambientVolumes]);

  // Calcular cor influenciada
  const influencedColor = useMemo(() => {
    if (!elementInfluence.hasElements) return colors.primary;

    const baseHSL = hexToHSL(colors.primary);
    const newHue = (baseHSL.h + elementInfluence.avgHue * 0.3) % 360;
    const saturation = baseHSL.s + (elementInfluence.warmIntensity - elementInfluence.coolIntensity) * 10;
    const lightness = baseHSL.l + (elementInfluence.coolIntensity - elementInfluence.warmIntensity) * 5;

    return hslToHex(newHue, Math.max(0, Math.min(100, saturation)), Math.max(0, Math.min(100, lightness)));
  }, [elementInfluence, colors.primary]);

  // Calcular opacidade das camadas baseado em áudio
  const layerOpacities = useMemo(() => {
    const base = 0.7;
    const pulse = audioLevel * 0.3;
    return {
      outer: base + pulse * 0.2,
      middle: base + pulse * 0.3,
      inner: base + pulse * 0.4,
      core: Math.min(1, base + pulse * 0.5),
    };
  }, [audioLevel]);

  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Background influenciado pelos sons */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-full"
        animate={{
          background: `radial-gradient(circle at 50% 50%, 
            ${elementInfluence.hasElements ? influencedColor + '15' : colors.accent + '10'},
            transparent 70%)`,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Camada de Aurora (fundo dinâmico) */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-20 blur-3xl"
        animate={{
          background: `conic-gradient(
            from ${elementInfluence.avgHue}deg,
            ${colors.primary}10,
            ${elementInfluence.hasElements ? influencedColor + '20' : colors.light + '15'},
            ${colors.primary}10
          )`,
        }}
        transition={{ duration: 1 }}
      />

      {/* SVG Mandala */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full max-w-[90%] max-h-[90%]"
        style={{ filter: `drop-shadow(0 0 ${15 + audioLevel * 35}px ${influencedColor}30)` }}
      >
        <defs>
          <radialGradient id="mandala-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor={influencedColor} stopOpacity={layerOpacities.core} />
            <stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
          </radialGradient>

          <radialGradient id="mandala-core" cx="50%" cy="50%">
            <stop offset="0%" stopColor={influencedColor} stopOpacity="1" />
            <stop offset="100%" stopColor={colors.primary} stopOpacity={layerOpacities.inner} />
          </radialGradient>

          <radialGradient id="mandala-middle" cx="50%" cy="50%">
            <stop offset="0%" stopColor={colors.primary} stopOpacity={layerOpacities.middle} />
            <stop offset="50%" stopColor={influencedColor} stopOpacity={layerOpacities.middle * 0.6} />
            <stop offset="100%" stopColor={colors.light} stopOpacity={layerOpacities.middle * 0.3} />
          </radialGradient>

          <filter id="glow-elegant">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Camada 1: Anel externo decorativo */}
        <motion.circle
          cx="200"
          cy="200"
          r="180"
          fill="none"
          stroke={colors.light}
          strokeWidth="0.5"
          opacity={layerOpacities.outer * 0.3}
          animate={{
            strokeWidth: 0.5 + audioLevel * 1.5,
            opacity: layerOpacities.outer * 0.3 + audioLevel * 0.1,
          }}
          transition={{ duration: 0.1 }}
        />

        {/* Camada 2: Pétalas externas (12) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const x = 200 + Math.cos(angle) * 140;
          const y = 200 + Math.sin(angle) * 140;

          return (
            <motion.g key={`petal-outer-${i}`}>
              <motion.ellipse
                cx={x}
                cy={y}
                rx="18"
                ry="32"
                fill={i % 2 === 0 ? colors.primary : influencedColor}
                opacity={layerOpacities.outer}
                transform={`rotate(${(angle * 180) / Math.PI} ${x} ${y})`}
                animate={{
                  rx: 18 + audioLevel * 4,
                  ry: 32 + audioLevel * 6,
                  opacity: layerOpacities.outer + audioLevel * 0.1,
                }}
                transition={{ duration: 0.2 }}
                filter="url(#glow-elegant)"
              />
            </motion.g>
          );
        })}

        {/* Camada 3: Anel intermediário */}
        <motion.circle
          cx="200"
          cy="200"
          r="115"
          fill="none"
          stroke={influencedColor}
          strokeWidth="1.5"
          opacity={layerOpacities.middle * 0.5}
          animate={{
            strokeWidth: 1.5 + audioLevel * 1,
            opacity: layerOpacities.middle * 0.5 + audioLevel * 0.08,
          }}
          transition={{ duration: 0.15 }}
        />

        {/* Camada 4: Pétalas intermediárias (8) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2 + Math.PI / 16;
          const x = 200 + Math.cos(angle) * 95;
          const y = 200 + Math.sin(angle) * 95;

          return (
            <motion.path
              key={`petal-middle-${i}`}
              d={`M 200 200 Q ${x + Math.cos(angle + Math.PI / 2) * 12} ${y + Math.sin(angle + Math.PI / 2) * 12} ${x} ${y}`}
              fill={influencedColor}
              opacity={layerOpacities.middle * 0.9}
              animate={{
                opacity: layerOpacities.middle * 0.9 + audioLevel * 0.15,
              }}
              transition={{ duration: 0.2 }}
              filter="url(#glow-elegant)"
            />
          );
        })}

        {/* Camada 5: Anel interno */}
        <motion.circle
          cx="200"
          cy="200"
          r="65"
          fill="url(#mandala-middle)"
          opacity={layerOpacities.inner}
          animate={{
            r: 65 + audioLevel * 8,
            opacity: layerOpacities.inner + audioLevel * 0.1,
          }}
          transition={{ duration: 0.15 }}
        />

        {/* Camada 6: Triângulos decorativos (6) */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const size = 12;
          const distance = 48;
          const x = 200 + Math.cos(angle) * distance;
          const y = 200 + Math.sin(angle) * distance;

          const x1 = x + Math.cos(angle) * size;
          const y1 = y + Math.sin(angle) * size;
          const x2 = x + Math.cos(angle + (2 * Math.PI) / 3) * size;
          const y2 = y + Math.sin(angle + (2 * Math.PI) / 3) * size;
          const x3 = x + Math.cos(angle + (4 * Math.PI) / 3) * size;
          const y3 = y + Math.sin(angle + (4 * Math.PI) / 3) * size;

          return (
            <motion.polygon
              key={`triangle-${i}`}
              points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
              fill={colors.primary}
              opacity={layerOpacities.inner * 0.6}
              animate={{
                opacity: layerOpacities.inner * 0.6 + audioLevel * 0.12,
              }}
              transition={{ duration: 0.2 }}
            />
          );
        })}

        {/* Camada 7: Núcleo central */}
        <motion.circle
          cx="200"
          cy="200"
          r="32"
          fill="url(#mandala-core)"
          animate={{
            r: 32 + audioLevel * 6,
          }}
          transition={{ duration: 0.15 }}
          filter="url(#glow-elegant)"
        />

        {/* Camada 8: Centro com ponto de luz */}
        <motion.circle
          cx="200"
          cy="200"
          r="10"
          fill={influencedColor}
          opacity="0.95"
          animate={{
            r: 10 + audioLevel * 3,
            opacity: 0.9 + audioLevel * 0.1,
          }}
          transition={{ duration: 0.1 }}
          filter="url(#glow-elegant)"
        />

        {/* Camada 9: Aura de pulsação */}
        <motion.circle
          cx="200"
          cy="200"
          r="140"
          fill="none"
          stroke={influencedColor}
          strokeWidth="0.3"
          opacity={audioLevel * 0.3}
          animate={{
            r: 140 + audioLevel * 40,
            opacity: audioLevel * 0.3 - audioLevel * 0.3,
          }}
          transition={{ duration: 0.4 }}
        />
      </svg>

      {/* Indicadores de temperatura elegantes */}
      <motion.div
        className="absolute bottom-4 right-4 flex flex-col gap-1.5 items-end"
        animate={{
          opacity: elementInfluence.hasElements ? 1 : 0.3,
        }}
      >
        {elementInfluence.warmIntensity > 0 && (
          <motion.div
            className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-300 border border-red-500/20 backdrop-blur-sm text-[9px] font-bold tracking-widest flex items-center gap-1.5"
            animate={{ x: 0 }}
            initial={{ x: 20 }}
          >
            <span>🔥</span>
            <span>{Math.round(elementInfluence.warmIntensity * 100)}%</span>
          </motion.div>
        )}
        {elementInfluence.coolIntensity > 0 && (
          <motion.div
            className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 backdrop-blur-sm text-[9px] font-bold tracking-widest flex items-center gap-1.5"
            animate={{ x: 0 }}
            initial={{ x: 20 }}
          >
            <span>❄️</span>
            <span>{Math.round(elementInfluence.coolIntensity * 100)}%</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * (l / 100) - 1)) * (s / 100);
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l / 100 - c / 2;
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }
  const toHex = (val: number) => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
