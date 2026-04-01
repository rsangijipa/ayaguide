'use client';

import React, { useEffect, useRef } from 'react';

// Common Types
export interface BGParticle {
  x?: number;
  y: number;
  len?: number;
  spd?: number;
  vx?: number;
  vy?: number;
  sz?: number;
  lf?: number;
  ml?: number;
  hue?: number;
  ph?: number;
  sp?: number;
  amp?: number;
  fr?: number;
  layer?: number;
  blink?: number;
  color?: string;
  rot?: number;
  rs?: number;
  al?: number;
}

export type DrawFunction = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  v: Record<string, number>,
  cc: string
) => void;

interface LayerProps {
  register: (name: string, draw: DrawFunction) => void;
  unregister: (name: string) => void;
}

// 1. ELEMENTAL LAYER (Fire, Lava, Embers)
export function ElementalLayer({ register, unregister }: LayerProps) {
  const particles = useRef<{ fire: BGParticle[], embers: BGParticle[] }>({ fire: [], embers: [] });

  useEffect(() => {
    const p = particles.current;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const pMult = isMobile ? 0.4 : 1;

    for (let i = 0; i < Math.floor(100 * pMult); i++) {
        p.fire.push({ x: 0.2 + Math.random() * 0.6, y: 0.5 + Math.random() * 0.4, vx: (Math.random() - 0.5) * 0.003, vy: -(0.001 + Math.random() * 0.005), sz: 2 + Math.random() * 8, lf: Math.random(), ml: 0.5 + Math.random() * 0.5, hue: 5 + Math.random() * 35 });
    }
    for (let i = 0; i < Math.floor(60 * pMult); i++) {
        p.embers.push({ x: 0.15 + Math.random() * 0.7, y: 0.9 + Math.random() * 0.1, vx: (Math.random() - 0.5) * 0.002, vy: -(0.002 + Math.random() * 0.004), sz: 1 + Math.random() * 3, lf: Math.random(), ml: 0.8 + Math.random() * 0.4, hue: 15 + Math.random() * 25 });
    }

    const draw: DrawFunction = (ctx, w, h, t, v) => {
      const firev = (v.fire || 0) * 1.2 + (v.lava || 0) * 0.8;
      if (firev > 0.04) {
        ctx.save();
        p.fire.forEach(p => {
          p.x! += p.vx! + (Math.random() - 0.5) * 0.003; p.y += p.vy!; p.lf! += 0.01; p.sz! *= 0.997;
          if (p.lf! >= p.ml! || p.sz! < 0.5) { p.x = 0.15 + Math.random() * 0.7; p.y = 0.5 + Math.random() * 0.45; p.lf = 0; p.sz = 3 + Math.random() * 10; }
          const pg = p.lf! / p.ml!; ctx.globalAlpha = Math.min(1, firev * (1 - pg) * 0.6);
          const gr = ctx.createRadialGradient(p.x! * w, p.y * h, 0, p.x! * w, p.y * h, p.sz! * 1.5);
          gr.addColorStop(0, `hsl(${p.hue! + 35}, 100%, 85%)`); gr.addColorStop(1, `hsla(${p.hue! - 10}, 90%, 25%, 0)`);
          ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x! * w, p.y * h, p.sz! * 1.5, 0, Math.PI * 2); ctx.fill();
        });
        const emberCnt = Math.floor(p.embers.length * firev);
        for (let i = 0; i < emberCnt; i++) {
          const e = p.embers[i]; e.x! += e.vx!; e.y += e.vy!; e.lf! += 0.008;
          if (e.lf! >= e.ml! || e.y < 0) { e.x = 0.15 + Math.random() * 0.7; e.y = 0.85 + Math.random() * 0.15; e.lf = 0; }
          const pg = e.lf! / e.ml!; ctx.globalAlpha = firev * (1 - pg) * 0.8;
          ctx.fillStyle = `hsl(${e.hue! + 20}, 100%, ${60 + (1 - pg) * 30}%)`; ctx.beginPath(); ctx.arc(e.x! * w, e.y * h, e.sz! * (1 - pg * 0.5), 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
    };
    register('elemental', draw);
    return () => unregister('elemental');
  }, []);
  return null;
}

// 2. WATER LAYER (Rain, Waves, Bubbles)
export function WaterLayer({ register, unregister }: LayerProps) {
  const particles = useRef<{ rain: BGParticle[], waves: BGParticle[], bubbles: BGParticle[] }>({ rain: [], waves: [], bubbles: [] });

  useEffect(() => {
    const p = particles.current;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const pMult = isMobile ? 0.3 : 1;

    for (let i = 0; i < Math.floor(120 * pMult); i++) {
        p.rain.push({ x: Math.random(), y: -Math.random(), len: 10 + Math.random() * 20, spd: 8 + Math.random() * 12, al: 0.1 + Math.random() * 0.3 });
    }
    for (let i = 0; i < Math.floor(15 * pMult); i++) {
        p.waves.push({ y: 0.6 + Math.random() * 0.4, ph: Math.random() * Math.PI * 2, spd: 0.005 + Math.random() * 0.01, amp: 20 + Math.random() * 40, fr: 2 + Math.random() * 3 });
    }
    for (let i = 0; i < Math.floor(40 * pMult); i++) {
        p.bubbles.push({ x: Math.random(), y: 1.1, sz: 1 + Math.random() * 4, spd: 0.5 + Math.random() * 1.5, ph: Math.random() * Math.PI * 2 });
    }

    const draw: DrawFunction = (ctx, w, h, t, v, cc) => {
      const wv = (v.water || 0) + (v.rain || 0) * 0.5 + (v.waves || 0) * 0.5;
      if (wv > 0.04) {
        ctx.save();
        // Rain
        if (v.rain && v.rain > 0.05) {
          ctx.strokeStyle = cc; ctx.lineWidth = 1;
          p.rain.forEach(r => {
            r.y += r.spd!; r.x! += Math.sin(t * 0.02) * 0.001;
            if (r.y > 1) { r.y = -0.1; r.x = Math.random(); }
            ctx.globalAlpha = r.al! * v.rain!; ctx.beginPath(); ctx.moveTo(r.x! * w, r.y * h); ctx.lineTo(r.x! * w, r.y * h + r.len!); ctx.stroke();
          });
        }
        // Waves
        p.waves.forEach(wave => {
          wave.ph! += wave.spd!; const alpha = wv * 0.2; ctx.strokeStyle = cc; ctx.globalAlpha = alpha; ctx.beginPath();
          for (let x = 0; x <= w; x += 20) { const yp = wave.y * h + Math.sin(x / w * Math.PI * 2 * wave.fr! + wave.ph!) * wave.amp!; x === 0 ? ctx.moveTo(x, yp) : ctx.lineTo(x, yp); } ctx.stroke();
        });
        ctx.restore();
      }
    };
    register('water', draw);
    return () => unregister('water');
  }, []);
  return null;
}

// 3. WIND LAYER (Leaves, Clouds)
export function WindLayer({ register, unregister }: LayerProps) {
  const particles = useRef<{ leaves: BGParticle[], clouds: BGParticle[] }>({ leaves: [], clouds: [] });

  useEffect(() => {
    const p = particles.current;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const pMult = isMobile ? 0.3 : 1;

    for (let i = 0; i < Math.floor(40 * pMult); i++) {
        p.leaves.push({ x: Math.random(), y: Math.random(), vx: 0.001 + Math.random() * 0.003, vy: 0.0005 + Math.random() * 0.001, sz: 5 + Math.random() * 10, rot: Math.random() * Math.PI * 2, rs: (Math.random() - 0.5) * 0.05, ph: Math.random() * Math.PI * 2, hue: 80 + Math.random() * 60 });
    }
    for (let i = 0; i < Math.floor(6 * pMult); i++) {
        p.clouds.push({ x: Math.random(), y: 0.1 + Math.random() * 0.4, vx: 0.0001 + Math.random() * 0.0003, sz: 150 + Math.random() * 300, al: 0.05 + Math.random() * 0.1 });
    }

    const draw: DrawFunction = (ctx, w, h, t, v, cc) => {
      const windv = (v.wind || 0) + (v.clouds || 0) * 0.4;
      if (windv > 0.04) {
        ctx.save();
        p.leaves.forEach(l => {
          l.x! += l.vx!; l.y += l.vy! + Math.sin(t * 0.01 + l.ph!) * 0.001; l.rot! += l.rs!;
          if (l.x! > 1.1) { l.x = -0.1; l.y = Math.random(); }
          ctx.save(); ctx.translate(l.x! * w, l.y * h); ctx.rotate(l.rot!); ctx.globalAlpha = windv * 0.4; ctx.fillStyle = `hsl(${l.hue}, 40%, 40%)`;
          ctx.beginPath(); ctx.ellipse(0, 0, l.sz!, l.sz! * 0.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        });
        ctx.restore();
      }
    };
    register('wind', draw);
    return () => unregister('wind');
  }, []);
  return null;
}

// 4. NATURE LAYER (Birds, Petals)
export function NatureLayer({ register, unregister }: LayerProps) {
  const particles = useRef<{ birds: BGParticle[], petals: BGParticle[] }>({ birds: [], petals: [] });

  useEffect(() => {
    const p = particles.current;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const pMult = isMobile ? 0.3 : 1;

    for (let i = 0; i < Math.floor(8 * pMult); i++) {
        p.birds.push({ x: Math.random(), y: 0.1 + Math.random() * 0.3, vx: 0.002 + Math.random() * 0.004, vy: 0, sz: 10 + Math.random() * 15, ph: Math.random() * Math.PI * 2 });
    }
    for (let i = 0; i < Math.floor(30 * pMult); i++) {
        p.petals.push({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.002, vy: 0.001 + Math.random() * 0.003, sz: 3 + Math.random() * 8, rot: Math.random() * Math.PI * 2, rs: (Math.random() - 0.5) * 0.1, hue: 300 + Math.random() * 60 });
    }

    const draw: DrawFunction = (ctx, w, h, t, v, cc) => {
      const nv = (v.birds || 0) + (v.forest || 0) * 0.6;
      if (nv > 0.04) {
        ctx.save();
        p.birds.forEach(b => {
          b.x! += b.vx!; b.y += Math.sin(t * 0.05 + b.ph!) * 0.001;
          if (b.x! > 1.1) { b.x = -0.1; b.y = 0.1 + Math.random() * 0.4; }
          ctx.strokeStyle = cc; ctx.globalAlpha = nv * 0.4; ctx.beginPath(); ctx.moveTo(b.x! * w - b.sz!, b.y * h); ctx.quadraticCurveTo(b.x! * w, b.y * h - b.sz! * Math.sin(t * 0.1), b.x! * w + b.sz!, b.y * h); ctx.stroke();
        });
        ctx.restore();
      }
    };
    register('nature', draw);
    return () => unregister('nature');
  }, []);
  return null;
}

// 5. ETHEREAL LAYER (Stars)
export function EtherealLayer({ register, unregister }: LayerProps) {
  const particles = useRef<{ stars: BGParticle[] }>({ stars: [] });

  useEffect(() => {
    const p = particles.current;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const pMult = isMobile ? 0.3 : 1;

    for (let i = 0; i < Math.floor(200 * pMult); i++) {
        p.stars.push({ x: Math.random(), y: Math.random(), sz: 0.5 + Math.random() * 1.5, blink: 0.01 + Math.random() * 0.03, ph: Math.random() * Math.PI * 2 });
    }

    const draw: DrawFunction = (ctx, w, h, t, v, cc) => {
      const ev = (v.stars || 0) + (v.cosmos || 0) * 0.5;
      if (ev > 0.04) {
        ctx.save();
        p.stars.forEach(s => {
          const alpha = ev * (0.3 + 0.7 * Math.abs(Math.sin(t * s.blink! + s.ph!)));
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath(); ctx.arc(s.x! * w, s.y * h, s.sz!, 0, Math.PI * 2); ctx.fill();
        });
        ctx.restore();
      }
    };
    register('ethereal', draw);
    return () => unregister('ethereal');
  }, []);
  return null;
}
