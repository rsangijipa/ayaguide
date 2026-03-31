'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  CHAKRA_COLOR_PALETTES,
  calculateMandalaColor,
  generateParticleColors,
  getTemperatureBalance,
  ColorPalette,
} from '@/lib/colorSystem';

interface MandalaAdvancedProps {
  hue: number;
  isPlaying: boolean;
  chakraId: string;
  ambientVolumes: Record<string, number>;
  audioLevel: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export function MandalaAdvanced({
  hue,
  isPlaying,
  chakraId,
  ambientVolumes,
  audioLevel,
}: MandalaAdvancedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(
    CHAKRA_COLOR_PALETTES[chakraId] || CHAKRA_COLOR_PALETTES.heart
  );

  const basePalette = useMemo(() => CHAKRA_COLOR_PALETTES[chakraId] || CHAKRA_COLOR_PALETTES.heart, [chakraId]);
  const temperatureBalance = useMemo(() => getTemperatureBalance(ambientVolumes), [ambientVolumes]);

  useEffect(() => {
    const newPalette = calculateMandalaColor(basePalette, ambientVolumes, chakraId);
    setCurrentPalette(newPalette);
  }, [ambientVolumes, chakraId, basePalette]);

  const drawMandala = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) / 2 - 40;

    ctx.fillStyle = 'rgba(2, 2, 2, 0.1)';
    ctx.fillRect(0, 0, width, height);

    for (let i = 5; i >= 1; i--) {
      const radius = (baseRadius * i) / 5;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      const colors = [currentPalette.vibrant, currentPalette.primary, currentPalette.medium, currentPalette.light, currentPalette.pale];
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.3, colors[1]);
      gradient.addColorStop(0.6, colors[2]);
      gradient.addColorStop(0.8, colors[3]);
      gradient.addColorStop(1, colors[4]);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const petalCount = 8;
    for (let p = 0; p < petalCount; p++) {
      const angle = (p / petalCount) * Math.PI * 2;
      const petalColors = [currentPalette.primary, currentPalette.medium, currentPalette.light, currentPalette.dark];
      for (let layer = 0; layer < 4; layer++) {
        const layerRadius = (baseRadius * (4 - layer)) / 4;
        const layerWidth = baseRadius / 8;
        ctx.fillStyle = petalColors[layer];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX + Math.cos(angle) * layerRadius, centerY + Math.sin(angle) * layerRadius, layerWidth, angle - Math.PI / petalCount, angle + Math.PI / petalCount);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
      }
    }

    const triangleCount = 12;
    for (let t = 0; t < triangleCount; t++) {
      const angle = (t / triangleCount) * Math.PI * 2;
      const radius = baseRadius * 0.7;
      const size = baseRadius * 0.1;
      ctx.fillStyle = t % 2 === 0 ? currentPalette.vibrant : currentPalette.accent;
      ctx.save();
      ctx.translate(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
      ctx.rotate(angle);
      ctx.beginPath(); ctx.moveTo(0, -size); ctx.lineTo(size, size); ctx.lineTo(-size, size); ctx.closePath();
      ctx.fill(); ctx.restore();
    }

    const glowGradient = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.8, centerX, centerY, baseRadius * 1.1);
    glowGradient.addColorStop(0, currentPalette.glow);
    glowGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.strokeStyle = glowGradient; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2); ctx.stroke();

    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 0.2);
    centerGradient.addColorStop(0, currentPalette.vibrant);
    centerGradient.addColorStop(0.5, currentPalette.primary);
    centerGradient.addColorStop(1, currentPalette.medium);
    ctx.fillStyle = centerGradient;
    ctx.beginPath(); ctx.arc(centerX, centerY, baseRadius * 0.2, 0, Math.PI * 2); ctx.fill();

    if (audioLevel > 0) {
      ctx.strokeStyle = currentPalette.glow.replace('0.4', String(audioLevel * 0.6));
      ctx.lineWidth = 2 + audioLevel * 3;
      ctx.beginPath(); ctx.arc(centerX, centerY, baseRadius * (0.8 + audioLevel * 0.2), 0, Math.PI * 2); ctx.stroke();
    }
  };

  const updateParticles = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const particleColors = generateParticleColors(ambientVolumes, 12);
    if (audioLevel > 0 && particlesRef.current.length < 50) {
      for (let i = 0; i < Math.floor(audioLevel * 5); i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + audioLevel * 3;
        const radius = Math.min(width, height) / 2 - 40;
        particlesRef.current.push({
          x: centerX + Math.cos(angle) * radius * 0.7,
          y: centerY + Math.sin(angle) * radius * 0.7,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: particleColors[Math.floor(Math.random() * particleColors.length)],
          life: 1,
          maxLife: 2 + Math.random() * 2,
        });
      }
    }
    particlesRef.current = particlesRef.current.filter((particle) => {
      particle.x += particle.vx; particle.y += particle.vy; particle.life -= 0.02; particle.vy += 0.1;
      if (particle.life > 0) {
        ctx.fillStyle = particle.color.replace(/[\d.]+\)$/, `${particle.life * 0.5})`);
        ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); ctx.fill();
        return true;
      }
      return false;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const animate = () => {
      const width = canvas.width; const height = canvas.height;
      drawMandala(ctx, width, height); updateParticles(ctx, width, height);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [currentPalette, audioLevel, ambientVolumes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" style={{ filter: `drop-shadow(0 0 ${20 + audioLevel * 30}px ${currentPalette.glow})` }} />
      <motion.div className="absolute bottom-4 right-4 flex gap-2 text-xs font-bold uppercase tracking-wider" animate={{ opacity: temperatureBalance.warm > 0 || temperatureBalance.cool > 0 ? 1 : 0.3 }}>
        {temperatureBalance.warm > 0 && <motion.div className="px-2 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30" animate={{ scale: 1 + temperatureBalance.warm * 0.1 }}>🔥 Quente</motion.div>}
        {temperatureBalance.cool > 0 && <motion.div className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30" animate={{ scale: 1 + temperatureBalance.cool * 0.1 }}>❄️ Frio</motion.div>}
      </motion.div>
      <motion.div className="absolute top-4 left-4 text-xs text-white/40 space-y-1" animate={{ opacity: Object.values(ambientVolumes).some((v) => v > 0) ? 0.7 : 0.3 }}>
        {Object.entries(ambientVolumes).filter(([_, volume]) => volume > 0).slice(0, 3).map(([id, volume]) => (
          <div key={id} className="text-[10px]">{id}: {Math.round(volume * 100)}%</div>
        ))}
      </motion.div>
    </motion.div>
  );
}
