'use client';

import React, { useEffect, useRef } from 'react';

interface AmbienceCanvasProps {
  volumes: Record<string, number>;
  chakraColor: string;
}

interface Particle {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  length?: number;
  speed?: number;
  size?: number;
  drift?: number;
  rot?: number;
  rotSpeed?: number;
  phase?: number;
  amplitude?: number;
  frequency?: number;
  age?: number;
  maxAge?: number;
  radius?: number;
  alpha?: number;
  hue?: number;
}

export function AmbienceCanvas({ volumes, chakraColor }: AmbienceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const riverLinesRef = useRef<Particle[]>([]);
  const leavesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Particle[]>([]);
  const flowFieldRef = useRef<number[][]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    let rafId: number;

    const initAmbience = () => {
      // Init River Lines - Enhanced with more detail
      riverLinesRef.current = Array.from({ length: 20 }).map((_, i) => ({
        y: (canvas.height / 20) * i,
        phase: Math.random() * Math.PI * 2,
        speed: 0.015 + Math.random() * 0.04,
        amplitude: 20 + Math.random() * 30,
        frequency: 0.003 + Math.random() * 0.005,
      }));

      // Init Rain - More particles for better effect
      particlesRef.current = Array.from({ length: 300 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 12 + Math.random() * 25,
        speed: 5 + Math.random() * 10,
        vx: (Math.random() - 0.5) * 2, // Wind effect
      }));

      // Init Leaves (Birds effect) - Enhanced
      leavesRef.current = Array.from({ length: 60 }).map(() => ({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height * 0.5,
        size: 5 + Math.random() * 8,
        speed: 0.8 + Math.random() * 2,
        drift: (Math.random() - 0.5) * 1.5,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        phase: Math.random() * Math.PI * 2,
      }));

      // Init Flow Field for water effects
      const gridSize = 40;
      flowFieldRef.current = Array.from({ length: Math.ceil(canvas.width / gridSize) }).map(
        () => Array.from({ length: Math.ceil(canvas.height / gridSize) }).map(() => Math.random() * Math.PI * 2)
      );
    };

    initAmbience();

    const drawWaterEffect = (water: number) => {
      ctx.save();
      ctx.strokeStyle = chakraColor;
      ctx.globalAlpha = water * 0.35;

      riverLinesRef.current.forEach((line) => {
        line.phase! += line.speed! * (1 + water * 0.5);

        ctx.beginPath();
        ctx.lineWidth = 1.5 + water * 2.5;

        for (let x = 0; x < canvas.width; x += 25) {
          const yOffset = Math.sin(x * line.frequency! + line.phase!) * (line.amplitude! + water * 50);
          const y = line.y! + yOffset;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      });

      // Add secondary wave layer
      ctx.globalAlpha = water * 0.15;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';

      riverLinesRef.current.forEach((line) => {
        ctx.beginPath();
        ctx.lineWidth = 0.5 + water;

        for (let x = 0; x < canvas.width; x += 40) {
          const yOffset = Math.cos(x * line.frequency! * 0.5 + line.phase! * 0.7) * (line.amplitude! * 0.6);
          const y = line.y! + yOffset;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      });

      ctx.restore();
    };

    const drawRainEffect = (rain: number) => {
      ctx.save();
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = rain * 0.6;

      // Main rain streaks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      const count = Math.floor(particlesRef.current.length * rain);

      for (let i = 0; i < count; i++) {
        const p = particlesRef.current[i];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + (p.vx || 0) * 2, p.y + p.length!);
        ctx.stroke();

        p.y += p.speed! * (1 + rain * 0.8);
        p.x += (p.vx || 0) * 0.3;

        if (p.y > canvas.height) {
          p.y = -p.length!;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < 0 || p.x > canvas.width) {
          p.x = Math.random() * canvas.width;
        }
      }

      // Rain splashes at bottom
      ctx.globalAlpha = rain * 0.3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < count * 0.3; i++) {
        const p = particlesRef.current[i];
        if (p.y > canvas.height - 50) {
          const splashRadius = 3 + Math.random() * 5;
          ctx.beginPath();
          ctx.arc(p.x, canvas.height, splashRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    const drawBirdsEffect = (birds: number) => {
      ctx.save();
      ctx.globalAlpha = birds * 0.5;

      const leafCount = Math.floor(leavesRef.current.length * birds);

      for (let i = 0; i < leafCount; i++) {
        const l = leavesRef.current[i];

        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rot!);

        // Gradient leaf
        const gradient = ctx.createLinearGradient(-l.size!, -l.size!, l.size!, l.size!);
        gradient.addColorStop(0, chakraColor);
        gradient.addColorStop(0.5, chakraColor.replace('0.8', '0.5'));
        gradient.addColorStop(1, chakraColor.replace('0.8', '0.2'));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, -l.size!);
        ctx.quadraticCurveTo(l.size!, 0, 0, l.size!);
        ctx.quadraticCurveTo(-l.size!, 0, 0, -l.size!);
        ctx.fill();

        // Leaf vein
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -l.size!);
        ctx.lineTo(0, l.size!);
        ctx.stroke();

        ctx.restore();

        l.y += l.speed! * (1 + birds * 0.6);
        l.x += l.drift! + Math.sin(l.y * 0.008 + l.phase!) * 1;
        l.rot! += l.rotSpeed!;
        l.phase! += 0.02;

        if (l.y > canvas.height) {
          l.y = -l.size!;
          l.x = Math.random() * canvas.width;
          l.phase = Math.random() * Math.PI * 2;
        }
      }

      ctx.restore();
    };

    const drawBellsEffect = (bells: number) => {
      ctx.save();

      // Spawn ripples more frequently
      if (Math.random() < 0.03 * bells) {
        ripplesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 0,
          alpha: 0.7 * bells,
          age: 0,
          maxAge: 60,
        });
      }

      // Draw ripples with gradient
      ripplesRef.current.forEach((r, i) => {
        const progress = r.age! / r.maxAge!;
        const gradient = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, r.radius!);

        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${r.alpha! * (1 - progress * 0.5)})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2 + bells * 2;
        ctx.globalAlpha = r.alpha! * (1 - progress);

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius!, 0, Math.PI * 2);
        ctx.stroke();

        r.radius! += 3 + bells * 4;
        r.age! += 1;

        if (r.age! >= r.maxAge!) {
          ripplesRef.current.splice(i, 1);
        }
      });

      // Add harmonic circles
      if (bells > 0.3) {
        ctx.globalAlpha = bells * 0.15;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;

        for (let j = 0; j < 3; j++) {
          const radius = 50 + j * 40 + Math.sin(timeRef.current * 0.02 + j) * 20;
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timeRef.current += 1;

      const { water, rain, birds, bells } = volumes;

      if (water > 0.05) drawWaterEffect(water);
      if (rain > 0.05) drawRainEffect(rain);
      if (birds > 0.05) drawBirdsEffect(birds);
      if (bells > 0.05) drawBellsEffect(bells);

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, [volumes, chakraColor]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] w-full h-full"
      style={{ filter: 'blur(1px)', opacity: 0.7 }}
    />
  );
}
