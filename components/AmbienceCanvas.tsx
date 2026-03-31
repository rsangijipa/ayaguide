'use client';

import React, { useEffect, useRef } from 'react';

interface AmbienceCanvasProps {
  volumes: Record<string, number>;
  chakraColor: string;
}

interface BGParticle {
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

export function AmbienceCanvas({ volumes: v, chakraColor: cc }: AmbienceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafId = useRef<number | null>(null);
  const flashRef = useRef(0); // For thunder flash

  const bpRef = useRef<{
    rain: BGParticle[],
    rainSplash: BGParticle[],
    fire: BGParticle[],
    embers: BGParticle[],
    birds: BGParticle[],
    leaves: BGParticle[],
    ripples: BGParticle[],
    fireflies: BGParticle[],
    waves: BGParticle[],
    spores: BGParticle[],
    waterfallDrops: BGParticle[],
  }>({
    rain: [], rainSplash: [], fire: [], embers: [], birds: [], leaves: [],
    ripples: [], fireflies: [], waves: [], spores: [], waterfallDrops: [],
  });

  useEffect(() => {
    const bp = bpRef.current;
    if (bp.rain.length === 0) {
      const isMobile = window.innerWidth < 768;
      const pMult = isMobile ? 0.5 : 1; // Particle multiplier for mobile performance

      // Rain — 3 depth layers
      const rainCount = Math.floor(350 * pMult);
      for (let i = 0; i < rainCount; i++) {
        const layer = i < (rainCount * 0.3) ? 0 : i < (rainCount * 0.7) ? 1 : 2;
        bp.rain.push({ x: Math.random(), y: Math.random(), len: 0.008 + layer * 0.008 + Math.random() * 0.01, spd: 0.004 + layer * 0.004 + Math.random() * 0.005, layer, al: 0.15 + layer * 0.15 });
      }
      // Fire particles
      for (let i = 0; i < Math.floor(100 * pMult); i++) bp.fire.push({ x: 0.2 + Math.random() * 0.6, y: 0.5 + Math.random() * 0.4, vx: (Math.random() - 0.5) * 0.003, vy: -(0.001 + Math.random() * 0.005), sz: 2 + Math.random() * 10, lf: Math.random(), ml: 0.5 + Math.random() * 0.5, hue: 5 + Math.random() * 35 });
      // Embers
      for (let i = 0; i < Math.floor(60 * pMult); i++) bp.embers.push({ x: 0.15 + Math.random() * 0.7, y: 0.9 + Math.random() * 0.1, vx: (Math.random() - 0.5) * 0.002, vy: -(0.002 + Math.random() * 0.004), sz: 1 + Math.random() * 3, lf: Math.random(), ml: 0.8 + Math.random() * 0.4, hue: 15 + Math.random() * 25 });
      // Birds
      for (let i = 0; i < Math.floor(40 * pMult); i++) bp.birds.push({ x: Math.random(), y: 0.05 + Math.random() * 0.6, vx: 0.0005 + Math.random() * 0.002, vy: (Math.random() - 0.5) * 0.0008, wp: Math.random() * Math.PI * 2, ws: 0.06 + Math.random() * 0.14, sz: 2 + Math.random() * 6, layer: Math.random() < 0.3 ? 0 : 1 });
      // Leaves
      const leafColors = ['#4ade80', '#86efac', '#facc15', '#fb923c', '#a3a3a3'];
      for (let i = 0; i < Math.floor(60 * pMult); i++) bp.leaves.push({ x: Math.random(), y: -0.1 - Math.random() * 0.5, vx: (Math.random() - 0.5) * 0.0015, vy: 0.0008 + Math.random() * 0.003, rot: Math.random() * Math.PI * 2, rs: (Math.random() - 0.5) * 0.04, sz: 3 + Math.random() * 7, color: leafColors[Math.floor(Math.random() * leafColors.length)] });
      // Fireflies
      for (let i = 0; i < Math.floor(100 * pMult); i++) bp.fireflies.push({ x: Math.random(), y: Math.random(), sz: 1 + Math.random() * 3, ph: Math.random() * Math.PI * 2, sp: 0.015 + Math.random() * 0.06, vx: (Math.random() - 0.5) * 0.001, vy: (Math.random() - 0.5) * 0.001, blink: Math.random(), trail: 0 });
      // Waves
      for (let i = 0; i < Math.floor(25 * pMult); i++) bp.waves.push({ y: i / 25, ph: Math.random() * Math.PI * 2, spd: 0.008 + Math.random() * 0.018, amp: 0.015 + Math.random() * 0.04, fr: 2 + Math.random() * 5, layer: i % 3 });
      // Spores
      for (let i = 0; i < Math.floor(80 * pMult); i++) bp.spores.push({ x: Math.random(), y: 0.3 + Math.random() * 0.7, vx: (Math.random() - 0.5) * 0.0006, vy: -(0.0003 + Math.random() * 0.001), sz: 1 + Math.random() * 2.5, ph: Math.random() * Math.PI * 2, sp: 0.01 + Math.random() * 0.04, al: 0.3 + Math.random() * 0.5 });
      // Waterfall drops
      for (let i = 0; i < Math.floor(50 * pMult); i++) bp.waterfallDrops.push({ x: 0.4 + Math.random() * 0.2, y: Math.random(), spd: 0.006 + Math.random() * 0.01, sz: 1 + Math.random() * 3, al: 0.2 + Math.random() * 0.5, vx: (Math.random() - 0.5) * 0.003 });
    }
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

    window.addEventListener('resize', resize); resize();

    const draw = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      frameRef.current++;
      const t = frameRef.current;
      const bp = bpRef.current;

      ctx.clearRect(0, 0, w, h);

      // === 1. WATER / OCEAN — Lines only, using chakra color ===
      const wt = (v.water || 0) * 0.6 + (v.ocean || 0) * 0.8;
      if (wt > 0.02) {
        ctx.save();
        bp.waves.forEach((w2) => {
          w2.ph! += w2.spd!;
          const ly = w2.layer || 0;
          const alpha = wt * (0.12 + ly * 0.08);

          ctx.strokeStyle = cc;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 0.6 + ly * 0.3;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 12) {
            const yp = w2.y * h + Math.sin(x / w * Math.PI * 2 * w2.fr! + w2.ph!) * w2.amp! * h * (1 + wt * 0.5);
            x === 0 ? ctx.moveTo(x, yp) : ctx.lineTo(x, yp);
          }
          ctx.stroke();
        });
        ctx.restore();
      }

      // === 2. WATERFALL — Cascading streaks with mist ===
      const wfv = v.waterfall || 0;
      if (wfv > 0.04) {
        ctx.save();
        // Mist gradient at base
        const mistGr = ctx.createLinearGradient(0, h * 0.7, 0, h);
        mistGr.addColorStop(0, 'rgba(180,230,255,0)');
        mistGr.addColorStop(1, `rgba(180,230,255,${wfv * 0.12})`);
        ctx.fillStyle = mistGr;
        ctx.fillRect(w * 0.2, h * 0.7, w * 0.6, h * 0.3);

        // Cascading drops
        const cnt = Math.floor(bp.waterfallDrops.length * Math.min(1, wfv * 1.5));
        for (let i = 0; i < cnt; i++) {
          const d = bp.waterfallDrops[i];
          d.y += d.spd!;
          d.x! += d.vx! + Math.sin(t * 0.02 + i) * 0.001;
          if (d.y > 1.05) { d.y = -0.05; d.x = 0.35 + Math.random() * 0.3; }

          const gr = ctx.createLinearGradient(d.x! * w, d.y * h, d.x! * w, (d.y + 0.06) * h);
          gr.addColorStop(0, `rgba(200,240,255,0)`);
          gr.addColorStop(0.4, `rgba(200,240,255,${wfv * d.al! * 0.7})`);
          gr.addColorStop(1, `rgba(200,240,255,0)`);
          ctx.strokeStyle = gr;
          ctx.lineWidth = d.sz! * 0.5;
          ctx.beginPath();
          ctx.moveTo(d.x! * w, d.y * h);
          ctx.lineTo(d.x! * w + Math.sin(t * 0.015 + i * 2) * 3, (d.y + 0.06) * h);
          ctx.stroke();
        }

        // Splash particles at bottom
        ctx.globalAlpha = wfv * 0.35;
        for (let i = 0; i < 15; i++) {
          const sx = (0.3 + Math.random() * 0.4) * w;
          const sy = (0.85 + Math.random() * 0.1) * h;
          ctx.fillStyle = 'rgba(200,240,255,0.6)';
          ctx.beginPath();
          ctx.arc(sx + Math.sin(t * 0.05 + i * 3) * 5, sy, 1 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // === 3. RAIN — Depth layers with splash particles ===
      const rv = (v.rain || 0) + (v.storm || 0) * 1.5;
      if (rv > 0.04) {
        ctx.save();
        const cnt = Math.floor(bp.rain.length * Math.min(1, rv));
        const windAngle = Math.sin(t * 0.005) * 3 * rv; // Wind sway
        for (let i = 0; i < cnt; i++) {
          const p = bp.rain[i];
          p.y += p.spd! * (1 + rv * 0.5);
          if (p.y > 1) {
            // Spawn splash
            if (Math.random() < 0.3) {
              bp.rainSplash.push({ x: p.x!, y: 1 - Math.random() * 0.02, lf: 0, ml: 8 + Math.random() * 10, sz: 1 + (p.layer || 0) * 1.5, al: p.al });
            }
            p.y = -p.len!; p.x = Math.random();
          }
          const lw = 0.5 + (p.layer || 0) * 0.4;
          ctx.strokeStyle = `rgba(200, 225, 255, ${p.al! * rv * 0.7})`;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.moveTo(p.x! * w, p.y * h);
          ctx.lineTo(p.x! * w - windAngle, (p.y + p.len!) * h);
          ctx.stroke();
        }

        // Rain splashes
        ctx.fillStyle = 'rgba(200, 225, 255, 0.4)';
        bp.rainSplash.forEach(sp => {
          sp.lf!++;
          const progress = sp.lf! / sp.ml!;
          const r = sp.sz! * (1 + progress * 3);
          ctx.globalAlpha = (1 - progress) * rv * 0.4 * (sp.al || 0.3);
          ctx.beginPath();
          ctx.arc(sp.x! * w, sp.y * h, r, 0, Math.PI * 2);
          ctx.fill();
        });
        bp.rainSplash = bp.rainSplash.filter(sp => sp.lf! < sp.ml!);

        // Keep reasonable limit
        if (bp.rainSplash.length > 120) bp.rainSplash = bp.rainSplash.slice(-80);
        ctx.restore();
      }

      // === 4. THUNDER — Branching lightning with full-screen flash ===
      const thunderV = (v.thunder || 0) + (v.storm || 0) * 0.8;
      if (thunderV > 0.08) {
        // Flash decay
        if (flashRef.current > 0) {
          ctx.save();
          ctx.fillStyle = `rgba(200, 200, 255, ${flashRef.current * 0.15})`;
          ctx.fillRect(0, 0, w, h);
          flashRef.current *= 0.92;
          if (flashRef.current < 0.01) flashRef.current = 0;
          ctx.restore();
        }

        if (Math.random() < 0.005 * thunderV) {
          flashRef.current = 1;

          ctx.save();
          ctx.strokeStyle = 'rgba(220, 220, 255, 0.9)';
          ctx.shadowBlur = 25;
          ctx.shadowColor = 'rgba(150, 150, 255, 0.8)';

          // Main bolt
          const drawBolt = (startX: number, startY: number, endY: number, width: number, depth: number) => {
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            let curX = startX, curY = startY;
            while (curY < endY) {
              curY += 15 + Math.random() * 30;
              curX += (Math.random() - 0.5) * 50;
              ctx.lineTo(curX, curY);

              // Branch
              if (depth < 2 && Math.random() < 0.25) {
                ctx.stroke();
                drawBolt(curX, curY, curY + 50 + Math.random() * 100, width * 0.5, depth + 1);
                ctx.beginPath();
                ctx.moveTo(curX, curY);
              }
            }
            ctx.stroke();
          };
          drawBolt((0.2 + Math.random() * 0.6) * w, 0, h * (0.5 + Math.random() * 0.5), 2.5, 0);
          ctx.restore();
        }
      }

      // === 5. WIND — Curved Bézier streaks ===
      const wndv = v.wind || 0;
      if (wndv > 0.04) {
        ctx.save();
        ctx.globalAlpha = wndv * 0.35;
        for (let i = 0; i < 30; i++) {
          const yBase = ((i / 30 + t * 0.0008) % 1) * h;
          const xStart = ((t * 0.002 + i * 0.15) % 1.3 - 0.15) * w;
          const len = (0.12 + Math.random() * 0.08) * w;
          const curve = Math.sin(t * 0.01 + i * 0.7) * 20;

          const gr = ctx.createLinearGradient(xStart, yBase, xStart + len, yBase);
          gr.addColorStop(0, 'rgba(255,255,255,0)');
          gr.addColorStop(0.3, `rgba(255,255,255,${wndv * 0.25})`);
          gr.addColorStop(0.7, `rgba(255,255,255,${wndv * 0.2})`);
          gr.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.strokeStyle = gr;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(xStart, yBase);
          ctx.bezierCurveTo(xStart + len * 0.33, yBase + curve, xStart + len * 0.66, yBase - curve * 0.5, xStart + len, yBase + curve * 0.3);
          ctx.stroke();
        }
        ctx.restore();
      }

      // === 6. BIRDS — Smoother arcs with body, depth variation ===
      const bv = v.birds || 0;
      if (bv > 0.04) {
        ctx.save();
        const cnt = Math.floor(bp.birds.length * Math.min(1, bv));
        for (let i = 0; i < cnt; i++) {
          const b = bp.birds[i];
          b.x! += b.vx!;
          b.y += b.vy! + Math.sin(b.wp!) * 0.0008;
          b.wp! += b.ws!;
          if (b.x! > 1.15) { b.x = -0.1; b.y = 0.05 + Math.random() * 0.6; }

          const wx = b.x! * w, wy = b.y * h;
          const wingFlap = Math.sin(b.wp!) * b.sz!;
          const isNear = (b.layer || 0) > 0;
          const alpha = bv * (isNear ? 0.5 : 0.25);
          const size = b.sz! * (isNear ? 1 : 0.6);

          ctx.strokeStyle = cc;
          ctx.lineWidth = isNear ? 2 : 1;
          ctx.globalAlpha = alpha;

          // Wing arcs
          ctx.beginPath();
          ctx.moveTo(wx - size * 1.5, wy + wingFlap * 0.3);
          ctx.quadraticCurveTo(wx - size * 0.5, wy - wingFlap, wx, wy);
          ctx.quadraticCurveTo(wx + size * 0.5, wy - wingFlap, wx + size * 1.5, wy + wingFlap * 0.3);
          ctx.stroke();

          // Body dot
          ctx.fillStyle = cc;
          ctx.globalAlpha = alpha * 0.8;
          ctx.beginPath();
          ctx.arc(wx, wy, isNear ? 1.5 : 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // === 7. FOREST — Tree silhouettes, fog layers, floating spores ===
      const forestv = v.forest || 0;
      if (forestv > 0.04) {
        ctx.save();

        // Deep fog layers
        for (let i = 0; i < 3; i++) {
          const fogY = h * (0.5 + i * 0.15);
          const fogH = h * 0.25;
          const fogAlpha = forestv * (0.06 + i * 0.03) * (1 + Math.sin(t * 0.003 + i) * 0.3);
          const gr = ctx.createLinearGradient(0, fogY, 0, fogY + fogH);
          gr.addColorStop(0, `rgba(0,40,20,0)`);
          gr.addColorStop(0.5, `rgba(0,35,15,${fogAlpha})`);
          gr.addColorStop(1, `rgba(0,40,20,0)`);
          ctx.fillStyle = gr;
          ctx.fillRect(0, fogY - fogH * 0.3, w, fogH);
        }

        // Tree silhouettes along bottom
        ctx.globalAlpha = forestv * 0.2;
        for (let i = 0; i < 12; i++) {
          const tx = (i / 12 + 0.04) * w;
          const th = (0.08 + Math.random() * 0.12) * h;
          const tw = 3 + Math.random() * 6;

          ctx.fillStyle = 'rgba(0,30,10,0.8)';
          // Trunk
          ctx.fillRect(tx - tw * 0.15, h - th, tw * 0.3, th);
          // Canopy (triangle)
          ctx.beginPath();
          ctx.moveTo(tx, h - th - th * 0.6);
          ctx.lineTo(tx - tw, h - th * 0.3);
          ctx.lineTo(tx + tw, h - th * 0.3);
          ctx.closePath();
          ctx.fill();
        }

        // Floating spores/pollen
        const sporeCnt = Math.floor(bp.spores.length * forestv);
        for (let i = 0; i < sporeCnt; i++) {
          const sp = bp.spores[i];
          sp.ph! += sp.sp!;
          sp.x! += sp.vx! + Math.sin(sp.ph!) * 0.0008;
          sp.y += sp.vy!;
          if (sp.y < 0.1) { sp.y = 0.8 + Math.random() * 0.2; sp.x = Math.random(); }

          ctx.globalAlpha = sp.al! * forestv * (0.5 + 0.5 * Math.sin(sp.ph!));
          ctx.fillStyle = 'rgba(180,255,180,0.7)';
          ctx.beginPath();
          ctx.arc(sp.x! * w, sp.y * h, sp.sz!, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // === 8. CRICKETS → FIREFLIES — Warm glow with blink/trail ===
      const cv = v.crickets || 0;
      if (cv > 0.04) {
        ctx.save();
        const cnt = Math.floor(bp.fireflies.length * cv);
        for (let i = 0; i < cnt; i++) {
          const ff = bp.fireflies[i];
          ff.ph! += ff.sp!;
          ff.blink! += 0.02 + Math.random() * 0.01;
          ff.x! += ff.vx! + Math.sin(ff.ph! + i) * 0.0005;
          ff.y += ff.vy! + Math.cos(ff.ph! * 0.7 + i) * 0.0005;

          // Wrap
          if (ff.x! > 1.05) ff.x = -0.05;
          if (ff.x! < -0.05) ff.x = 1.05;
          if (ff.y > 1.05) ff.y = -0.05;
          if (ff.y < -0.05) ff.y = 1.05;

          const blinkIntensity = Math.max(0, Math.sin(ff.blink! * 3) * 0.7 + 0.3);
          const alpha = cv * blinkIntensity * 0.7;

          if (alpha > 0.05) {
            const px = ff.x! * w, py = ff.y * h;

            // Outer glow
            const glowR = ff.sz! * 6;
            const gr = ctx.createRadialGradient(px, py, 0, px, py, glowR);
            gr.addColorStop(0, `rgba(200,255,100,${alpha * 0.4})`);
            gr.addColorStop(0.4, `rgba(180,240,80,${alpha * 0.15})`);
            gr.addColorStop(1, 'rgba(180,240,80,0)');
            ctx.fillStyle = gr;
            ctx.beginPath();
            ctx.arc(px, py, glowR, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.globalAlpha = alpha;
            ctx.fillStyle = `rgba(230,255,150,0.9)`;
            ctx.beginPath();
            ctx.arc(px, py, ff.sz! * 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // === 9. LEAVES — Leaf-shaped with color variety ===
      const lv = v.leaves || 0;
      if (lv > 0.04) {
        ctx.save();
        const cnt = Math.floor(bp.leaves.length * Math.min(1, lv));
        for (let i = 0; i < cnt; i++) {
          const leaf = bp.leaves[i];
          leaf.y += leaf.vy!;
          leaf.x! += leaf.vx! + Math.sin(t * 0.008 + i * 0.5) * 0.001;
          leaf.rot! += leaf.rs!;
          if (leaf.y > 1.15) { leaf.y = -0.1; leaf.x = Math.random(); }

          ctx.save();
          ctx.translate(leaf.x! * w, leaf.y * h);
          ctx.rotate(leaf.rot!);
          ctx.globalAlpha = lv * 0.55;

          // Leaf shape (pointed oval with stem)
          ctx.fillStyle = leaf.color || cc;
          ctx.beginPath();
          ctx.moveTo(0, -leaf.sz!);
          ctx.bezierCurveTo(leaf.sz! * 0.4, -leaf.sz! * 0.5, leaf.sz! * 0.4, leaf.sz! * 0.5, 0, leaf.sz!);
          ctx.bezierCurveTo(-leaf.sz! * 0.4, leaf.sz! * 0.5, -leaf.sz! * 0.4, -leaf.sz! * 0.5, 0, -leaf.sz!);
          ctx.closePath();
          ctx.fill();

          // Central vein
          ctx.strokeStyle = 'rgba(255,255,255,0.15)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(0, -leaf.sz! * 0.8);
          ctx.lineTo(0, leaf.sz! * 0.8);
          ctx.stroke();

          ctx.restore();
        }
        ctx.restore();
      }

      // === 10. RIPPLES — Concentric rings with gradient glow ===
      const mys = (v.bells || 0) * 0.7 + (v.gong || 0) * 0.95 + (v.singing_bowl || 0) * 0.6;
      if (mys > 0.04) {
        if (Math.random() < 0.025 * mys) {
          bp.ripples.push({ x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.7, r: 0, mr: 0.15 + Math.random() * 0.3, lf: 0, ml: 80 + Math.random() * 80, al: mys * 0.5 });
        }
        ctx.save();
        bp.ripples.forEach(rp => {
          rp.r! += rp.mr! / rp.ml!;
          rp.lf!++;
          const pg = rp.lf! / rp.ml!;
          const baseR = rp.r! * Math.min(w, h);

          // Multiple concentric rings
          for (let ring = 0; ring < 3; ring++) {
            const ringR = baseR * (1 - ring * 0.15);
            if (ringR > 0) {
              const alpha = rp.al! * (1 - pg) * (1 - ring * 0.3);
              ctx.globalAlpha = alpha;
              ctx.strokeStyle = cc;
              ctx.lineWidth = 1.5 - ring * 0.3;
              ctx.beginPath();
              ctx.arc(rp.x! * w, rp.y * h, ringR, 0, Math.PI * 2);
              ctx.stroke();
            }
          }

          // Center glow
          if (pg < 0.3) {
            const glowAlpha = rp.al! * (1 - pg / 0.3) * 0.15;
            const glowR = baseR * 0.4;
            const gr = ctx.createRadialGradient(rp.x! * w, rp.y * h, 0, rp.x! * w, rp.y * h, glowR);
            gr.addColorStop(0, cc.replace(')', `,${glowAlpha})`).replace('rgb(', 'rgba('));
            gr.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.globalAlpha = 1;
            ctx.fillStyle = gr;
            ctx.beginPath();
            ctx.arc(rp.x! * w, rp.y * h, glowR, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        bp.ripples = bp.ripples.filter(r => r.lf! < r.ml!);
        ctx.restore();
      }

      // === 11. FIRE / LAVA — Larger flames with rising embers ===
      const firev = (v.fire || 0) * 1.2 + (v.lava || 0) * 0.8;
      if (firev > 0.04) {
        ctx.save();

        // Heat shimmer at bottom
        ctx.globalAlpha = firev * 0.06;
        const shimGr = ctx.createLinearGradient(0, h * 0.6, 0, h);
        shimGr.addColorStop(0, 'rgba(255,100,0,0)');
        shimGr.addColorStop(1, `rgba(255,60,0,${firev * 0.15})`);
        ctx.fillStyle = shimGr;
        ctx.fillRect(0, h * 0.6, w, h * 0.4);

        // Main flame particles
        bp.fire.forEach(p => {
          p.x! += p.vx! + (Math.random() - 0.5) * 0.003;
          p.y += p.vy!;
          p.lf! += 0.01;
          p.sz! *= 0.997;
          if (p.lf! >= p.ml! || p.sz! < 0.5) {
            p.x = 0.15 + Math.random() * 0.7;
            p.y = 0.5 + Math.random() * 0.45;
            p.lf = 0;
            p.sz = 3 + Math.random() * 12;
          }
          const pg = p.lf! / p.ml!;
          ctx.globalAlpha = Math.min(1, firev * (1 - pg) * 0.6);
          const gr = ctx.createRadialGradient(p.x! * w, p.y * h, 0, p.x! * w, p.y * h, p.sz! * 1.5);
          gr.addColorStop(0, `hsl(${p.hue! + 35}, 100%, 85%)`);
          gr.addColorStop(0.3, `hsl(${p.hue! + 15}, 100%, 60%)`);
          gr.addColorStop(0.7, `hsl(${p.hue!}, 95%, 40%)`);
          gr.addColorStop(1, `hsla(${p.hue! - 10}, 90%, 25%, 0)`);
          ctx.fillStyle = gr;
          ctx.beginPath();
          ctx.arc(p.x! * w, p.y * h, p.sz! * 1.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Rising embers
        const emberCnt = Math.floor(bp.embers.length * firev);
        for (let i = 0; i < emberCnt; i++) {
          const e = bp.embers[i];
          e.x! += e.vx! + Math.sin(t * 0.02 + i) * 0.001;
          e.y += e.vy!;
          e.lf! += 0.008;
          if (e.lf! >= e.ml! || e.y < 0) {
            e.x = 0.15 + Math.random() * 0.7;
            e.y = 0.85 + Math.random() * 0.15;
            e.lf = 0;
          }
          const pg = e.lf! / e.ml!;
          const alpha = firev * (1 - pg) * 0.8;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = `hsl(${e.hue! + 20}, 100%, ${60 + (1 - pg) * 30}%)`;
          ctx.beginPath();
          ctx.arc(e.x! * w, e.y * h, e.sz! * (1 - pg * 0.5), 0, Math.PI * 2);
          ctx.fill();

          // Tiny glow
          if (alpha > 0.2) {
            const eGr = ctx.createRadialGradient(e.x! * w, e.y * h, 0, e.x! * w, e.y * h, e.sz! * 4);
            eGr.addColorStop(0, `hsla(${e.hue! + 20}, 100%, 70%, ${alpha * 0.2})`);
            eGr.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = eGr;
            ctx.beginPath();
            ctx.arc(e.x! * w, e.y * h, e.sz! * 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      rafId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [v, cc]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] w-screen h-screen"
    />
  );
}
