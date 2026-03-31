'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAudioEngine } from '@/lib/audio';

interface MandalaProps {
  hue: number;
  isPlaying: boolean;
  chakraId: string;
}

interface Theme {
  center: string;
  petal1: string;
  petal2: string;
  petal3: string;
  petal4: string;
  petal5: string;
  outer: string;
  bg: string;
  accent: string;
  glow: string;
}

const CHAKRA_THEMES: Record<string, Theme> = {
  root: {
    center: 'rgba(239, 68, 68, 0.8)',
    petal1: 'rgba(239, 68, 68, 0.6)',
    petal2: 'rgba(220, 38, 38, 0.5)',
    petal3: 'rgba(185, 28, 28, 0.4)',
    petal4: 'rgba(153, 27, 27, 0.3)',
    petal5: 'rgba(127, 29, 29, 0.2)',
    outer: 'rgba(239, 68, 68, 0.15)',
    bg: 'rgba(239, 68, 68, 0.05)',
    accent: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  sacral: {
    center: 'rgba(249, 115, 22, 0.8)',
    petal1: 'rgba(249, 115, 22, 0.6)',
    petal2: 'rgba(234, 88, 12, 0.5)',
    petal3: 'rgba(194, 65, 12, 0.4)',
    petal4: 'rgba(154, 52, 18, 0.3)',
    petal5: 'rgba(124, 45, 18, 0.2)',
    outer: 'rgba(249, 115, 22, 0.15)',
    bg: 'rgba(249, 115, 22, 0.05)',
    accent: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(249, 115, 22, 0.4)',
  },
  solar: {
    center: 'rgba(250, 204, 21, 0.8)',
    petal1: 'rgba(250, 204, 21, 0.6)',
    petal2: 'rgba(234, 179, 8, 0.5)',
    petal3: 'rgba(202, 138, 4, 0.4)',
    petal4: 'rgba(161, 98, 7, 0.3)',
    petal5: 'rgba(120, 53, 15, 0.2)',
    outer: 'rgba(250, 204, 21, 0.15)',
    bg: 'rgba(250, 204, 21, 0.05)',
    accent: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(250, 204, 21, 0.4)',
  },
  heart: {
    center: 'rgba(16, 185, 129, 0.8)',
    petal1: 'rgba(16, 185, 129, 0.6)',
    petal2: 'rgba(5, 150, 105, 0.5)',
    petal3: 'rgba(4, 120, 87, 0.4)',
    petal4: 'rgba(5, 83, 63, 0.3)',
    petal5: 'rgba(6, 54, 42, 0.2)',
    outer: 'rgba(16, 185, 129, 0.15)',
    bg: 'rgba(16, 185, 129, 0.05)',
    accent: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  throat: {
    center: 'rgba(56, 189, 248, 0.8)',
    petal1: 'rgba(56, 189, 248, 0.6)',
    petal2: 'rgba(34, 162, 235, 0.5)',
    petal3: 'rgba(15, 118, 210, 0.4)',
    petal4: 'rgba(13, 71, 161, 0.3)',
    petal5: 'rgba(25, 32, 71, 0.2)',
    outer: 'rgba(56, 189, 248, 0.15)',
    bg: 'rgba(56, 189, 248, 0.05)',
    accent: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(56, 189, 248, 0.4)',
  },
  third_eye: {
    center: 'rgba(129, 140, 248, 0.8)',
    petal1: 'rgba(129, 140, 248, 0.6)',
    petal2: 'rgba(99, 102, 241, 0.5)',
    petal3: 'rgba(79, 70, 229, 0.4)',
    petal4: 'rgba(55, 48, 163, 0.3)',
    petal5: 'rgba(30, 27, 102, 0.2)',
    outer: 'rgba(129, 140, 248, 0.15)',
    bg: 'rgba(129, 140, 248, 0.05)',
    accent: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(129, 140, 248, 0.4)',
  },
  crown: {
    center: 'rgba(192, 132, 252, 0.8)',
    petal1: 'rgba(192, 132, 252, 0.6)',
    petal2: 'rgba(168, 85, 247, 0.5)',
    petal3: 'rgba(147, 51, 234, 0.4)',
    petal4: 'rgba(109, 40, 217, 0.3)',
    petal5: 'rgba(88, 28, 135, 0.2)',
    outer: 'rgba(192, 132, 252, 0.15)',
    bg: 'rgba(192, 132, 252, 0.05)',
    accent: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(192, 132, 252, 0.4)',
  },
};

export function Mandala({ hue, isPlaying, chakraId }: MandalaProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const audioDataRef = useRef(new Uint8Array(32));
  const [theme, setTheme] = useState<Theme>(CHAKRA_THEMES[chakraId] || CHAKRA_THEMES.heart);

  useEffect(() => {
    setTheme(CHAKRA_THEMES[chakraId] || CHAKRA_THEMES.heart);
  }, [chakraId]);

  useEffect(() => {
    const engine = getAudioEngine();
    if (!engine || !svgRef.current) return;

    const animate = () => {
      rotationRef.current += 0.5;

      if (isPlaying && engine) {
        engine.getFrequencyData(audioDataRef.current);
      }

      const svg = svgRef.current;
      if (!svg) return;

      const high = audioDataRef.current[15] || 0;
      const mid = audioDataRef.current[8] || 0;
      const low = audioDataRef.current[2] || 0;

      // Outer Ring - Responds to Low Frequencies
      const l1 = svg.getElementById('layer-outer') as SVGElement | null;
      if (l1) {
        l1.style.transform = `rotate(${rotationRef.current * 0.3}deg) scale(${1 + (low / 255) * 0.2})`;
      }

      // Petal Layer 1 - Responds to Mid Frequencies
      const l2 = svg.getElementById('layer-petal1') as SVGElement | null;
      if (l2) {
        l2.style.transform = `rotate(${rotationRef.current * 0.6}deg) scale(${1 + (mid / 255) * 0.25})`;
      }

      // Petal Layer 2
      const l2b = svg.getElementById('layer-petal2') as SVGElement | null;
      if (l2b) {
        l2b.style.transform = `rotate(${-rotationRef.current * 0.5}deg) scale(${1 + (mid / 255) * 0.2})`;
      }

      // Petal Layer 3
      const l3 = svg.getElementById('layer-petal3') as SVGElement | null;
      if (l3) {
        l3.style.transform = `rotate(${rotationRef.current * 0.9}deg) scale(${1 + (high / 255) * 0.3})`;
      }

      // Petal Layer 4 - New Layer
      const l4 = svg.getElementById('layer-petal4') as SVGElement | null;
      if (l4) {
        l4.style.transform = `rotate(${-rotationRef.current * 0.7}deg) scale(${1 + (high / 255) * 0.25})`;
      }

      // Petal Layer 5 - New Layer
      const l5 = svg.getElementById('layer-petal5') as SVGElement | null;
      if (l5) {
        l5.style.transform = `rotate(${rotationRef.current * 1.1}deg) scale(${1 + (mid / 255) * 0.2})`;
      }

      // Center Layer - Responds to High Frequencies
      const cf = svg.getElementById('layer-center') as SVGElement | null;
      if (cf) {
        cf.style.transform = `rotate(${-rotationRef.current * 1.2}deg) scale(${1 + (high / 255) * 0.4})`;
      }

      // Inner Rings
      const innerRings = svg.getElementById('inner-rings') as SVGElement | null;
      if (innerRings) {
        innerRings.style.transform = `rotate(${rotationRef.current * 1.5}deg) scale(${1 + (high / 255) * 0.35})`;
      }

      // Core Glow
      const core = svg.getElementById('center-core') as SVGElement | null;
      if (core) {
        const glow = 15 + (high / 255) * 50;
        core.style.filter = `blur(${glow / 2}px)`;
        core.style.opacity = (0.3 + (high / 255) * 0.7).toString();
      }

      // Outer Glow
      const outerGlow = svg.getElementById('outer-glow') as SVGCircleElement | null;
      if (outerGlow) {
        const glowRadius = 200 + (low / 255) * 50;
        outerGlow.setAttribute('r', glowRadius.toString());
        outerGlow.style.opacity = (0.1 + (low / 255) * 0.3).toString();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, theme.center]);

  const renderPetals = (
    id: string,
    count: number,
    radius: number,
    width: number,
    height: number,
    color: string,
    rotateOffset: number = 0,
    hasDot: boolean = false
  ) => {
    const petals = [];
    for (let i = 0; i < count; i++) {
      const angle = (i * (360 / count)) + rotateOffset;
      const d = `M 200,${200 - radius}
                 Q ${200 - width},${200 - radius + height / 2} 200,${200 - radius + height}
                 Q ${200 + width},${200 - radius + height / 2} 200,${200 - radius} Z`;
      petals.push(
        <g key={i} transform={`rotate(${angle}, 200, 200)`}>
          <motion.path
            d={d}
            fill={color}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.02, type: 'spring', stiffness: 120 }}
          />
          {hasDot && (
            <circle
              cx="200"
              cy={200 - radius + 25}
              r="1.5"
              fill="rgba(255,255,255,0.15)"
            />
          )}
        </g>
      );
    }
    return (
      <g id={id} className="origin-center">
        {petals}
      </g>
    );
  };

  const renderInnerRings = () => {
    const rings = [];
    for (let i = 1; i <= 4; i++) {
      const radius = 30 + i * 15;
      const opacity = 0.3 - i * 0.05;
      rings.push(
        <circle
          key={`ring-${i}`}
          cx="200"
          cy="200"
          r={radius}
          fill="none"
          stroke={theme.accent}
          strokeWidth="0.5"
          opacity={opacity}
        />
      );
    }
    return rings;
  };

  return (
    <div className="relative w-full aspect-square flex items-center justify-center p-8">
      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        className="w-full h-full max-w-[700px] overflow-visible"
      >
        <defs>
          <filter id="bloom-enhanced" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="glow"
            />
            <feBlend in="SourceGraphic" in2="glow" mode="screen" />
          </filter>

          <radialGradient id="mandala-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.center} stopOpacity="0.8" />
            <stop offset="50%" stopColor={theme.petal1} stopOpacity="0.4" />
            <stop offset="100%" stopColor={theme.outer} stopOpacity="0.1" />
          </radialGradient>

          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feBlend in="SourceGraphic" in2="blur" mode="lighten" />
          </filter>
        </defs>

        <g filter="url(#bloom-enhanced)">
          {/* Outer Ambient Glow - Expanded */}
          <circle
            id="outer-glow"
            cx="200"
            cy="200"
            r="200"
            fill={theme.glow}
            opacity="0.15"
            className="origin-center"
          />

          {/* Outer Ring Layer */}
          <g id="layer-outer" className="origin-center">
            <circle cx="200" cy="200" r="190" fill={theme.outer} opacity="0.25" />
            {Array.from({ length: 48 }).map((_, i) => (
              <rect
                key={i}
                x="199.5"
                y="5"
                width="1"
                height="18"
                fill="white"
                opacity={0.08 + (i % 2) * 0.04}
                transform={`rotate(${(i * 360) / 48}, 200, 200)`}
              />
            ))}
          </g>

          {/* Main Background */}
          <motion.circle
            id="main-bg"
            cx="200"
            cy="200"
            r="165"
            fill="url(#mandala-gradient)"
            opacity="0.15"
            className="origin-center"
            animate={{ fill: 'url(#mandala-gradient)' }}
            transition={{ duration: 1.5 }}
          />

          {/* Animated Petals */}
          <AnimatePresence mode="popLayout">
            <motion.g
              key={chakraId}
              initial={{ opacity: 0, scale: 0.85, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.15, rotate: 30 }}
              transition={{ duration: 1.3, ease: 'circOut' }}
            >
              {renderPetals('layer-petal1', 16, 160, 50, 100, theme.petal1, 11, true)}
              {renderPetals('layer-petal2', 16, 130, 40, 90, theme.petal2, 0, true)}
              {renderPetals('layer-petal3', 16, 100, 30, 75, theme.petal3, 11, false)}
              {renderPetals('layer-petal4', 12, 70, 22, 55, theme.petal4, 15, true)}
              {renderPetals('layer-petal5', 12, 50, 15, 40, theme.petal5, 0, false)}

              {/* Center Flower - Enhanced */}
              <g id="layer-center" className="origin-center">
                {Array.from({ length: 16 }).map((_, i) => (
                  <circle
                    key={i}
                    cx="200"
                    cy="165"
                    r="14"
                    fill={theme.center}
                    opacity={0.7 + (i % 2) * 0.2}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="0.5"
                    transform={`rotate(${(i * 360) / 16}, 200, 200)`}
                  />
                ))}
              </g>
            </motion.g>
          </AnimatePresence>

          {/* Inner Rings */}
          <g id="inner-rings" className="origin-center" filter="url(#soft-glow)">
            {renderInnerRings()}
          </g>

          {/* Core Glow - Enhanced */}
          <circle
            id="center-core"
            cx="200"
            cy="200"
            r="35"
            fill={theme.center}
            opacity="0.5"
            className="origin-center"
            filter="url(#soft-glow)"
          />

          {/* Inner Core - Bright */}
          <circle cx="200" cy="200" r="20" fill="white" opacity="0.95" />

          {/* Center Dot */}
          <circle cx="200" cy="200" r="10" fill={theme.center} opacity="0.9" />

          {/* Decorative Triangles around Center */}
          {Array.from({ length: 8 }).map((_, i) => (
            <polygon
              key={`tri-${i}`}
              points="200,180 190,200 210,200"
              fill={theme.petal2}
              opacity="0.3"
              transform={`rotate(${(i * 360) / 8}, 200, 200)`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
