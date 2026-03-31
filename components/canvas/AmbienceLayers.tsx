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
  wp?: number;
  ws?: number;
  rot?: number;
  rs?: number;
  ph?: number;
  sp?: number;
  r?: number;
  mr?: number;
  al?: number;
  amp?: number;
  fr?: number;
  layer?: number;
  trail?: number;
  blink?: number;
  color?: string;
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
    const pMult = isMobile ? 0.5 : 1;

    // Fire particles
    for (let i = 0; i < Math.floor(100 * pMult); i++) {
        p.fire.push({ x: 0.2 + Math.random() * 0.6, y: 0.5 + Math.random() * 0.4, vx: (Math.random() - 0.5) * 0.003, vy: -(0.001 + Math.random() * 0.005), sz: 2 + Math.random() * 10, lf: Math.random(), ml: 0.5 + Math.random() * 0.5, hue: 5 + Math.random() * 35 });
    }
    // Embers
    for (let i = 0; i < Math.floor(60 * pMult); i++) {
        p.embers.push({ x: 0.15 + Math.random() * 0.7, y: 0.9 + Math.random() * 0.1, vx: (Math.random() - 0.5) * 0.002, vy: -(0.002 + Math.random() * 0.004), sz: 1 + Math.random() * 3, lf: Math.random(), ml: 0.8 + Math.random() * 0.4, hue: 15 + Math.random() * 25 });
    }

    const draw: DrawFunction = (ctx, w, h, t, v) => {
      const firev = (v.fire || 0) * 1.2 + (v.lava || 0) * 0.8;
      if (firev > 0.04) {
        ctx.save();
        // Heat shimmer
        ctx.globalAlpha = firev * 0.06;
        const shimGr = ctx.createLinearGradient(0, h * 0.6, 0, h);
        shimGr.addColorStop(0, 'rgba(255,100,0,0)');
        shimGr.addColorStop(1, `rgba(255,60,0,${firev * 0.15})`);
        ctx.fillStyle = shimGr;
        ctx.fillRect(0, h * 0.6, w, h * 0.4);

        // Fire
        p.fire.forEach(p => {
          p.x! += p.vx! + (Math.random() - 0.5) * 0.003;
          p.y += p.vy!; p.lf! += 0.01; p.sz! *= 0.997;
          if (p.lf! >= p.ml! || p.sz! < 0.5) { p.x = 0.15 + Math.random() * 0.7; p.y = 0.5 + Math.random() * 0.45; p.lf = 0; p.sz = 3 + Math.random() * 12; }
          const pg = p.lf! / p.ml!; ctx.globalAlpha = Math.min(1, firev * (1 - pg) * 0.6);
          const gr = ctx.createRadialGradient(p.x! * w, p.y * h, 0, p.x! * w, p.y * h, p.sz! * 1.5);
          gr.addColorStop(0, `hsl(${p.hue! + 35}, 100%, 85%)`); gr.addColorStop(0.3, `hsl(${p.hue! + 15}, 100%, 60%)`); gr.addColorStop(0.7, `hsl(${p.hue!}, 95%, 40%)`); gr.addColorStop(1, `hsla(${p.hue! - 10}, 90%, 25%, 0)`);
          ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x! * w, p.y * h, p.sz! * 1.5, 0, Math.PI * 2); ctx.fill();
        });

        // Embers
        const emberCnt = Math.floor(p.embers.length * firev);
        for (let i = 0; i < emberCnt; i++) {
          const e = p.embers[i]; e.x! += e.vx! + Math.sin(t * 0.02 + i) * 0.001; e.y += e.vy!; e.lf! += 0.008;
          if (e.lf! >= e.ml! || e.y < 0) { e.x = 0.15 + Math.random() * 0.7; e.y = 0.85 + Math.random() * 0.15; e.lf = 0; }
          const pg = e.lf! / e.ml!; const alpha = firev * (1 - pg) * 0.8; ctx.globalAlpha = alpha;
          ctx.fillStyle = `hsl(${e.hue! + 20}, 100%, ${60 + (1 - pg) * 30}%)`; ctx.beginPath(); ctx.arc(e.x! * w, e.y * h, e.sz! * (1 - pg * 0.5), 0, Math.PI * 2); ctx.fill();
          if (alpha > 0.2) {
            const eGr = ctx.createRadialGradient(e.x! * w, e.y * h, 0, e.x! * w, e.y * h, e.sz! * 4);
            eGr.addColorStop(0, `hsla(${e.hue! + 20}, 100%, 70%, ${alpha * 0.2})`); eGr.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = eGr; ctx.beginPath(); ctx.arc(e.x! * w, e.y * h, e.sz! * 4, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.restore();
      }
    };

    register('elemental', draw);
    return () => unregister('elemental');
  }, []);

  return null;
}

// 2. MYSTICAL LAYER (Sacred Ripples, Fireflies)
export function MysticalLayer({ register, unregister }: LayerProps) {
  const particles = useRef<{ ripples: BGParticle[], fireflies: BGParticle[] }>({ ripples: [], fireflies: [] });

  useEffect(() => {
    const p = particles.current;
    const isMobile = window.innerWidth < 768;
    const pMult = isMobile ? 0.5 : 1;

    for (let i = 0; i < Math.floor(100 * pMult); i++) {
        p.fireflies.push({ x: Math.random(), y: Math.random(), sz: 1 + Math.random() * 3, ph: Math.random() * Math.PI * 2, sp: 0.015 + Math.random() * 0.06, vx: (Math.random() - 0.5) * 0.001, vy: (Math.random() - 0.5) * 0.001, blink: Math.random(), trail: 0 });
    }

    const draw: DrawFunction = (ctx, w, h, t, v, cc) => {
      // Ripples (Spiritual Bells/Singing Bowls)
      const mys = (v.bells || 0) * 0.7 + (v.gong || 0) * 0.95 + (v.singing_bowl || 0) * 0.6;
      if (mys > 0.04) {
        if (Math.random() < 0.025 * mys) p.ripples.push({ x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.7, r: 0, mr: 0.15 + Math.random() * 0.3, lf: 0, ml: 80 + Math.random() * 80, al: mys * 0.5 });
        ctx.save();
        p.ripples.forEach(rp => {
          rp.r! += rp.mr! / rp.ml!; rp.lf!++; const pg = rp.lf! / rp.ml!; const baseR = rp.r! * Math.min(w, h);
          for (let ring = 0; ring < 3; ring++) {
            const ringR = baseR * (1 - ring * 0.15); if (ringR > 0) {
              const alpha = rp.al! * (1 - pg) * (1 - ring * 0.3); ctx.globalAlpha = alpha; ctx.strokeStyle = cc;
              ctx.lineWidth = 1.5 - ring * 0.3; ctx.beginPath(); ctx.arc(rp.x! * w, rp.y * h, ringR, 0, Math.PI * 2); ctx.stroke();
            }
          }
        });
        p.ripples = p.ripples.filter(r => r.lf! < r.ml!); ctx.restore();
      }

      // Fireflies
      const cv = v.crickets || 0;
      if (cv > 0.04) {
        ctx.save();
        const cnt = Math.floor(p.fireflies.length * cv);
        for (let i = 0; i < cnt; i++) {
          const ff = p.fireflies[i]; ff.ph! += ff.sp!; ff.blink! += 0.02 + Math.random() * 0.01;
          ff.x! += ff.vx! + Math.sin(ff.ph! + i) * 0.0005; ff.y += ff.vy! + Math.cos(ff.ph! * 0.7 + i) * 0.0005;
          if (ff.x! > 1.05) ff.x = -0.05; if (ff.x! < -0.05) ff.x = 1.05; if (ff.y > 1.05) ff.y = -0.05; if (ff.y < -0.05) ff.y = 1.05;
          const blinkIntensity = Math.max(0, Math.sin(ff.blink! * 3) * 0.7 + 0.3); const alpha = cv * blinkIntensity * 0.7;
          if (alpha > 0.05) {
            const px = ff.x! * w, py = ff.y * h; const glowR = ff.sz! * 6;
            const gr = ctx.createRadialGradient(px, py, 0, px, py, glowR); gr.addColorStop(0, `rgba(200,255,100,${alpha * 0.4})`); gr.addColorStop(0.4, `rgba(180,240,80,${alpha * 0.15})`); gr.addColorStop(1, 'rgba(180,240,80,0)');
            ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(px, py, glowR, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = alpha; ctx.fillStyle = `rgba(230,255,150,0.9)`; ctx.beginPath(); ctx.arc(px, py, ff.sz! * 0.8, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.restore();
      }
    };

    register('mystical', draw);
    return () => unregister('mystical');
  }, []);

  return null;
}

// 3. NATURE LAYER (Forest, Spores, Birds, Leaves)
export function NatureLayer({ register, unregister }: LayerProps) {
  const particles = useRef<{ birds: BGParticle[], leaves: BGParticle[], spores: BGParticle[] }>({ birds: [], leaves: [], spores: [] });

  useEffect(() => {
    const p = particles.current;
    const isMobile = window.innerWidth < 768;
    const pMult = isMobile ? 0.1 : 1;

    // Birds
    for (let i = 0; i < Math.floor(40 * pMult); i++) p.birds.push({ x: Math.random(), y: 0.05 + Math.random() * 0.6, vx: 0.0005 + Math.random() * 0.002, vy: (Math.random() - 0.5) * 0.0008, wp: Math.random() * Math.PI * 2, ws: 0.06 + Math.random() * 0.14, sz: 2 + Math.random() * 6, layer: Math.random() < 0.3 ? 0 : 1 });
    // Leaves
    const leafColors = ['#4ade80', '#86efac', '#facc15', '#fb923c', '#a3a3a3'];
    for (let i = 0; i < Math.floor(60 * pMult); i++) p.leaves.push({ x: Math.random(), y: -0.1 - Math.random() * 0.5, vx: (Math.random() - 0.5) * 0.0015, vy: 0.0008 + Math.random() * 0.003, rot: Math.random() * Math.PI * 2, rs: (Math.random() - 0.5) * 0.04, sz: 3 + Math.random() * 7, color: leafColors[Math.floor(Math.random() * leafColors.length)] });
    // Spores
    for (let i = 0; i < Math.floor(80 * pMult); i++) p.spores.push({ x: Math.random(), y: 0.3 + Math.random() * 0.7, vx: (Math.random() - 0.5) * 0.0006, vy: -(0.0003 + Math.random() * 0.001), sz: 1 + Math.random() * 2.5, ph: Math.random() * Math.PI * 2, sp: 0.01 + Math.random() * 0.04, al: 0.3 + Math.random() * 0.5 });

    const draw: DrawFunction = (ctx, w, h, t, v, cc) => {
      const forestv = v.forest || 0;
      if (forestv > 0.04) {
        ctx.save();
        // Fog
        for (let i = 0; i < 3; i++) {
          const fogY = h * (0.5 + i * 0.15); const fogH = h * 0.25; const fogAlpha = forestv * (0.06 + i * 0.03) * (1 + Math.sin(t * 0.003 + i) * 0.3);
          const gr = ctx.createLinearGradient(0, fogY, 0, fogY + fogH); gr.addColorStop(0, `rgba(0,40,20,0)`); gr.addColorStop(0.5, `rgba(0,35,15,${fogAlpha})`); gr.addColorStop(1, `rgba(0,40,20,0)`);
          ctx.fillStyle = gr; ctx.fillRect(0, fogY - fogH * 0.3, w, fogH);
        }
        // Trees
        ctx.globalAlpha = forestv * 0.2;
        for (let i = 0; i < 12; i++) {
          const tx = (i / 12 + 0.04) * w; const th = (0.08 + Math.random() * 0.12) * h; const tw = 3 + Math.random() * 6;
          ctx.fillStyle = 'rgba(0,30,10,0.8)'; ctx.fillRect(tx - tw * 0.15, h - th, tw * 0.3, th);
          ctx.beginPath(); ctx.moveTo(tx, h - th - th * 0.6); ctx.lineTo(tx - tw, h - th * 0.3); ctx.lineTo(tx + tw, h - th * 0.3); ctx.closePath(); ctx.fill();
        }
        // Spores
        const sporeCnt = Math.floor(p.spores.length * forestv);
        for (let i = 0; i < sporeCnt; i++) {
          const sp = p.spores[i]; sp.ph! += sp.sp!; sp.x! += sp.vx! + Math.sin(sp.ph!) * 0.0008; sp.y += sp.vy!;
          if (sp.y < 0.1) { sp.y = 0.8 + Math.random() * 0.2; sp.x = Math.random(); }
          ctx.globalAlpha = sp.al! * forestv * (0.5 + 0.5 * Math.sin(sp.ph!)); ctx.fillStyle = 'rgba(180,255,180,0.7)';
          ctx.beginPath(); ctx.arc(sp.x! * w, sp.y * h, sp.sz!, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }

      // Birds
      const bv = v.birds || 0;
      if (bv > 0.04) {
        ctx.save(); const cnt = Math.floor(p.birds.length * Math.min(1, bv));
        for (let i = 0; i < cnt; i++) {
          const b = p.birds[i]; b.x! += b.vx!; b.y += b.vy! + Math.sin(b.wp!) * 0.0008; b.wp! += b.ws!;
          if (b.x! > 1.15) { b.x = -0.1; b.y = 0.05 + Math.random() * 0.6; }
          const wx = b.x! * w, wy = b.y * h; const wingFlap = Math.sin(b.wp!) * b.sz!; const isNear = (b.layer || 0) > 0;
          ctx.strokeStyle = cc; ctx.lineWidth = isNear ? 2 : 1; ctx.globalAlpha = bv * (isNear ? 0.5 : 0.25);
          ctx.beginPath(); ctx.moveTo(wx - b.sz! * 1.5, wy + wingFlap * 0.3); ctx.quadraticCurveTo(wx - b.sz! * 0.5, wy - wingFlap, wx, wy); ctx.quadraticCurveTo(wx + b.sz! * 0.5, wy - wingFlap, wx + b.sz! * 1.5, wy + wingFlap * 0.3); ctx.stroke();
          ctx.fillStyle = cc; ctx.beginPath(); ctx.arc(wx, wy, isNear ? 1.5 : 0.8, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }

      // Leaves
      const lv = v.leaves || 0;
      if (lv > 0.04) {
        ctx.save(); const cnt = Math.floor(p.leaves.length * Math.min(1, lv));
        for (let i = 0; i < cnt; i++) {
          const leaf = p.leaves[i]; leaf.y += leaf.vy!; leaf.x! += leaf.vx! + Math.sin(t * 0.008 + i * 0.5) * 0.001; leaf.rot! += leaf.rs!;
          if (leaf.y > 1.15) { leaf.y = -0.1; leaf.x = Math.random(); }
          ctx.save(); ctx.translate(leaf.x! * w, leaf.y * h); ctx.rotate(leaf.rot!); ctx.globalAlpha = lv * 0.55;
          ctx.fillStyle = leaf.color || cc; ctx.beginPath(); ctx.moveTo(0, -leaf.sz!); ctx.bezierCurveTo(leaf.sz! * 0.4, -leaf.sz! * 0.5, leaf.sz! * 0.4, leaf.sz! * 0.5, 0, leaf.sz!); ctx.bezierCurveTo(-leaf.sz! * 0.4, leaf.sz! * 0.5, -leaf.sz! * 0.4, -leaf.sz! * 0.5, 0, -leaf.sz!); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }
    };

    register('nature', draw);
    return () => unregister('nature');
  }, []);

  return null;
}

// 4. WATER LAYER (Waves, Waterfall, Drops)
export function WaterLayer({ register, unregister }: LayerProps) {
  const particles = useRef<{ waves: BGParticle[], waterfallDrops: BGParticle[] }>({ waves: [], waterfallDrops: [] });

  useEffect(() => {
    const p = particles.current;
    const isMobile = window.innerWidth < 768;
    const pMult = isMobile ? 0.5 : 1;

    for (let i = 0; i < Math.floor(25 * pMult); i++) p.waves.push({ y: i / 25, ph: Math.random() * Math.PI * 2, spd: 0.008 + Math.random() * 0.018, amp: 0.015 + Math.random() * 0.04, fr: 2 + Math.random() * 5, layer: i % 3 });
    for (let i = 0; i < Math.floor(50 * pMult); i++) p.waterfallDrops.push({ x: 0.4 + Math.random() * 0.2, y: Math.random(), spd: 0.006 + Math.random() * 0.01, sz: 1 + Math.random() * 3, al: 0.2 + Math.random() * 0.5, vx: (Math.random() - 0.5) * 0.003 });

    const draw: DrawFunction = (ctx, w, h, t, v, cc) => {
      // Waves
      const wt = (v.water || 0) * 0.6 + (v.ocean || 0) * 0.8;
      if (wt > 0.02) {
        ctx.save();
        p.waves.forEach((w2) => {
          w2.ph! += w2.spd!; const alpha = wt * (0.12 + (w2.layer || 0) * 0.08); ctx.strokeStyle = cc; ctx.globalAlpha = alpha; ctx.lineWidth = 0.6 + (w2.layer || 0) * 0.3; ctx.beginPath();
          for (let x = 0; x <= w; x += 12) { const yp = w2.y * h + Math.sin(x / w * Math.PI * 2 * w2.fr! + w2.ph!) * w2.amp! * h * (1 + wt * 0.5); x === 0 ? ctx.moveTo(x, yp) : ctx.lineTo(x, yp); } ctx.stroke();
        });
        ctx.restore();
      }

      // Waterfall
      const wfv = v.waterfall || 0;
      if (wfv > 0.04) {
        ctx.save();
        const mistGr = ctx.createLinearGradient(0, h * 0.7, 0, h); mistGr.addColorStop(0, 'rgba(180,230,255,0)'); mistGr.addColorStop(1, `rgba(180,230,255,${wfv * 0.12})`);
        ctx.fillStyle = mistGr; ctx.fillRect(w * 0.2, h * 0.7, w * 0.6, h * 0.3);
        const cnt = Math.floor(p.waterfallDrops.length * Math.min(1, wfv * 1.5));
        for (let i = 0; i < cnt; i++) {
          const d = p.waterfallDrops[i]; d.y += d.spd!; d.x! += d.vx! + Math.sin(t * 0.02 + i) * 0.001; if (d.y > 1.05) { d.y = -0.05; d.x = 0.35 + Math.random() * 0.3; }
          const gr = ctx.createLinearGradient(d.x! * w, d.y * h, d.x! * w, (d.y + 0.06) * h); gr.addColorStop(0.4, `rgba(200,240,255,${wfv * d.al! * 0.7})`); ctx.strokeStyle = gr; ctx.lineWidth = d.sz! * 0.5;
          ctx.beginPath(); ctx.moveTo(d.x! * w, d.y * h); ctx.lineTo(d.x! * w + Math.sin(t * 0.015 + i * 2) * 3, (d.y + 0.06) * h); ctx.stroke();
        }
        ctx.restore();
      }
    };

    register('water', draw);
    return () => unregister('water');
  }, []);

  return null;
}

// 5. WEATHER LAYER (Rain, Thunder/Lightning, Wind)
export function WeatherLayer({ register, unregister }: LayerProps) {
  const particles = useRef<{ rain: BGParticle[], rainSplash: BGParticle[] }>({ rain: [], rainSplash: [] });
  const flash = useRef(0);

  useEffect(() => {
    const p = particles.current;
    const isMobile = window.innerWidth < 768;
    const pMult = isMobile ? 0.5 : 1;

    for (let i = 0; i < Math.floor(350 * pMult); i++) {
        const layer = i < (350 * pMult * 0.3) ? 0 : i < (350 * pMult * 0.7) ? 1 : 2;
        p.rain.push({ x: Math.random(), y: Math.random(), len: 0.008 + layer * 0.008 + Math.random() * 0.01, spd: 0.004 + layer * 0.004 + Math.random() * 0.005, layer, al: 0.15 + layer * 0.15 });
    }

    const draw: DrawFunction = (ctx, w, h, t, v) => {
      // Rain
      const rv = (v.rain || 0) + (v.storm || 0) * 1.5;
      if (rv > 0.04) {
        ctx.save(); const cnt = Math.floor(p.rain.length * Math.min(1, rv)); const windAngle = Math.sin(t * 0.005) * 3 * rv;
        for (let i = 0; i < cnt; i++) {
          const pr = p.rain[i]; pr.y += pr.spd! * (1 + rv * 0.5); if (pr.y > 1) { if (Math.random() < 0.3) p.rainSplash.push({ x: pr.x!, y: 1 - Math.random() * 0.02, lf: 0, ml: 8 + Math.random() * 10, sz: 1 + (pr.layer || 0) * 1.5, al: pr.al }); pr.y = -pr.len!; pr.x = Math.random(); }
          ctx.strokeStyle = `rgba(200, 225, 255, ${pr.al! * rv * 0.7})`; ctx.lineWidth = 0.5 + (pr.layer || 0) * 0.4;
          ctx.beginPath(); ctx.moveTo(pr.x! * w, pr.y * h); ctx.lineTo(pr.x! * w - windAngle, (pr.y + pr.len!) * h); ctx.stroke();
        }
        p.rainSplash.forEach(sp => { sp.lf!++; const pg = sp.lf! / sp.ml!; ctx.globalAlpha = (1 - pg) * rv * 0.4 * (sp.al || 0.3); ctx.beginPath(); ctx.arc(sp.x! * w, sp.y * h, sp.sz! * (1 + pg * 3), 0, Math.PI * 2); ctx.fill(); });
        p.rainSplash = p.rainSplash.filter(sp => sp.lf! < sp.ml!);
        if (p.rainSplash.length > Math.floor(120 * pMult)) p.rainSplash = p.rainSplash.slice(-Math.floor(80 * pMult)); ctx.restore();
      }

      // Thunder
      const thunderV = (v.thunder || 0) + (v.storm || 0) * 0.8;
      if (thunderV > 0.08) {
        if (flash.current > 0) { ctx.save(); ctx.fillStyle = `rgba(200, 200, 255, ${flash.current * 0.15})`; ctx.fillRect(0, 0, w, h); flash.current *= 0.92; if (flash.current < 0.01) flash.current = 0; ctx.restore(); }
        if (Math.random() < 0.005 * thunderV) {
          flash.current = 1; ctx.save(); ctx.strokeStyle = 'rgba(220, 220, 255, 0.9)'; ctx.shadowBlur = 25; ctx.shadowColor = 'rgba(150, 150, 255, 0.8)';
          const drawBolt = (startX: number, startY: number, endY: number, width: number, depth: number) => {
            ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(startX, startY); let curX = startX, curY = startY;
            while (curY < endY) { curY += 15 + Math.random() * 30; curX += (Math.random() - 0.5) * 50; ctx.lineTo(curX, curY); if (depth < 2 && Math.random() < 0.25) { ctx.stroke(); drawBolt(curX, curY, curY + 50 + Math.random() * 100, width * 0.5, depth + 1); ctx.beginPath(); ctx.moveTo(curX, curY); } } ctx.stroke();
          };
          drawBolt((0.2 + Math.random() * 0.6) * w, 0, h * (0.5 + Math.random() * 0.5), 2.5, 0); ctx.restore();
        }
      }

      // Wind
      const wndv = v.wind || 0;
      if (wndv > 0.04) {
        ctx.save(); ctx.globalAlpha = wndv * 0.35;
        for (let i = 0; i < 30; i++) {
          const yBase = ((i / 30 + t * 0.0008) % 1) * h; const xStart = ((t * 0.002 + i * 0.15) % 1.3 - 0.15) * w; const len = (0.12 + Math.random() * 0.08) * w; const curve = Math.sin(t * 0.01 + i * 0.7) * 20;
          const gr = ctx.createLinearGradient(xStart, yBase, xStart + len, yBase); gr.addColorStop(0.3, `rgba(255,255,255,${wndv * 0.25})`); ctx.strokeStyle = gr; ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(xStart, yBase); ctx.bezierCurveTo(xStart + len * 0.33, yBase + curve, xStart + len * 0.66, yBase - curve * 0.5, xStart + len, yBase + curve * 0.3); ctx.stroke();
        }
        ctx.restore();
      }
    };

    register('weather', draw);
    return () => unregister('weather');
  }, []);

  return null;
}
