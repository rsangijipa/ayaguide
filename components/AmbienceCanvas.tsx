'use client';

import React, { useEffect, useRef } from 'react';
import { emod } from '@/lib/mandalaSystem';

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
}

export function AmbienceCanvas({ volumes: v, chakraColor: cc }: AmbienceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafId = useRef<number | null>(null);
  
  // Background particles refs
  const bpRef = useRef<{
    rain: BGParticle[],
    fire: BGParticle[],
    birds: BGParticle[],
    leaves: BGParticle[],
    ripples: BGParticle[],
    stars: BGParticle[],
    waves: BGParticle[]
  }>({
    rain: [], fire: [], birds: [], leaves: [], ripples: [], stars: [], waves: []
  });

  // Initialize background particles
  useEffect(() => {
    const bp = bpRef.current;
    if (bp.rain.length === 0) {
      for(let i=0;i<280;i++)bp.rain.push({x:Math.random(),y:Math.random(),len:0.013+Math.random()*0.02,spd:0.005+Math.random()*0.008});
      for(let i=0;i<80;i++)bp.fire.push({x:0.25+Math.random()*0.5,y:0.5+Math.random()*0.4,vx:(Math.random()-0.5)*0.003,vy:-(0.001+Math.random()*0.004),sz:2+Math.random()*8,lf:Math.random(),ml:0.6+Math.random()*0.4,hue:10+Math.random()*30});
      for(let i=0;i<35;i++)bp.birds.push({x:Math.random(),y:0.1+Math.random()*0.8,vx:0.001+Math.random()*0.002,vy:(Math.random()-0.5)*0.001,wp:Math.random()*Math.PI*2,ws:0.09+Math.random()*0.13,sz:3+Math.random()*4});
      for(let i=0;i<55;i++)bp.leaves.push({x:Math.random(),y:-0.1-Math.random()*0.3,vx:(Math.random()-0.5)*0.002,vy:0.001+Math.random()*0.003,rot:Math.random()*Math.PI*2,rs:(Math.random()-0.5)*0.05,sz:3+Math.random()*6});
      for(let i=0;i<90;i++)bp.stars.push({x:Math.random(),y:Math.random(),sz:0.5+Math.random()*2,ph:Math.random()*Math.PI*2,sp:0.02+Math.random()*0.08});
      for(let i=0;i<20;i++)bp.waves.push({y:i/20,ph:Math.random()*Math.PI*2,spd:0.01+Math.random()*0.02,amp:0.02+Math.random()*0.04,fr:3+Math.random()*4});
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

      // 1. Water/Ocean (Waves)
      const wt = (v.water || 0) * 0.6 + (v.ocean || 0) * 0.8;
      if (wt > 0.02) {
        ctx.save(); bp.waves.forEach(w2 => { 
          w2.ph! += w2.spd!; ctx.strokeStyle = cc; ctx.globalAlpha = wt * 0.28; ctx.lineWidth = 1 + wt * 2; 
          ctx.beginPath(); for(let x=0; x<=w; x+=25) {
            const y = w2.y*h + Math.sin(x/w*Math.PI*2*w2.fr! + w2.ph!) * w2.amp! * h;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          } ctx.stroke();
        }); ctx.restore();
      }

      // 2. Waterfall
      const wfv = v.waterfall || 0;
      if (wfv > 0.04) {
        ctx.save(); 
        for(let i=0; i<30; i++) {
          const x = (0.2+i/30*0.6)*w; const y0 = ((t*0.004+i*0.12)%1); 
          const gr = ctx.createLinearGradient(x, y0*h, x, (y0+0.15)*h);
          gr.addColorStop(0, 'rgba(200,240,255,0)'); gr.addColorStop(0.4, `rgba(180,230,255,${wfv*0.4})`); gr.addColorStop(1, 'rgba(200,240,255,0)');
          ctx.strokeStyle = gr; ctx.lineWidth = 1; ctx.globalAlpha = wfv*0.6;
          ctx.beginPath(); ctx.moveTo(x+Math.sin(t*0.02+i)*4, y0*h); ctx.lineTo(x+Math.sin(t*0.02+i+1)*3, (y0+0.15)*h); ctx.stroke();
        } ctx.restore();
      }

      // 3. Rain
      const rv = (v.rain || 0) + (v.storm || 0) * 1.5;
      if (rv > 0.04) {
        ctx.save(); ctx.strokeStyle = 'rgba(200, 225, 255, 0.45)'; ctx.lineWidth = 1; ctx.globalAlpha = rv * 0.5;
        const cnt = Math.floor(bp.rain.length * Math.min(1, rv));
        for(let i=0; i<cnt; i++) {
          const p = bp.rain[i]; p.y += p.spd! * (1 + rv); if(p.y > 1) { p.y = -p.len!; p.x = Math.random(); }
          ctx.beginPath(); ctx.moveTo(p.x! * w, p.y * h); ctx.lineTo(p.x! * w - 2, (p.y + p.len!) * h); ctx.stroke();
        } ctx.restore();
      }

      // 4. Thunder
      if ((v.thunder || v.storm) > 0.08 && Math.random() < 0.007 * (v.thunder || v.storm)) {
        ctx.save(); ctx.strokeStyle = 'rgba(215, 215, 255, 0.8)'; ctx.lineWidth = 2; ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(150, 150, 255, 0.6)';
        const lx = 0.2 + Math.random() * 0.6; ctx.beginPath(); let ly = 0; ctx.moveTo(lx * w, 0);
        while(ly < h) { ly += 25 + Math.random() * 45; ctx.lineTo((lx + (Math.random() - 0.5) * 0.15) * w, ly); }
        ctx.stroke(); ctx.restore();
      }

      // 5. Wind
      const wndv = v.wind || 0;
      if (wndv > 0.04) {
        ctx.save(); ctx.globalAlpha = wndv * 0.2;
        for (let i=0; i<25; i++) {
          const yb = ((i/25 + t*0.001) % 1) * h;
          const xo = Math.sin(t*0.015 + i) * 0.1 * w; const len = 0.1 * w;
          const gr = ctx.createLinearGradient(xo+i*0.04*w, yb, xo+i*0.04*w+len, yb);
          gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${wndv*0.3})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.strokeStyle = gr; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(xo+i*0.04*w, yb); ctx.lineTo(xo+i*0.04*w+len, yb); ctx.stroke();
        } ctx.restore();
      }

      // 6. Birds
      const bv = v.birds || 0;
      if (bv > 0.04) {
        ctx.save(); ctx.strokeStyle = cc; ctx.lineWidth = 2; ctx.globalAlpha = bv * 0.6;
        const cnt = Math.floor(bp.birds.length * bv);
        for(let i=0; i<cnt; i++) {
          const b = bp.birds[i]; b.x! += b.vx!; b.y += b.vy! + Math.sin(b.wp!) * 0.001; b.wp! += b.ws!;
          if(b.x! > 1.1) { b.x = -0.1; b.y = 0.1 + Math.random()*0.8; }
          const wx = b.x! * w, wy = b.y * h, wg = Math.sin(b.wp!) * b.sz!;
          ctx.beginPath(); ctx.moveTo(wx - b.sz!, wy - wg*0.5); ctx.quadraticCurveTo(wx, wy - wg, wx + b.sz!, wy - wg*0.5); ctx.stroke();
        } ctx.restore();
      }

      // 7. Forest
      const forestv = v.forest || 0;
      if (forestv > 0.04) {
        ctx.save(); const gr = ctx.createLinearGradient(0, h*0.5, 0, h);
        gr.addColorStop(0, 'rgba(0,50,20,0)'); gr.addColorStop(1, `rgba(0,40,15,${forestv*0.25})`);
        ctx.fillStyle = gr; ctx.fillRect(0, h*0.5, w, h*0.5); ctx.restore();
      }

      // 8. Crickets
      const cv = v.crickets || 0;
      if (cv > 0.04) {
        ctx.save(); bp.stars.forEach(s => {
          s.ph! += s.sp!; const al = cv * (0.3 + 0.7*Math.abs(Math.sin(s.ph!))) * 0.6;
          ctx.globalAlpha = al; ctx.fillStyle = 'rgba(255,255,220,0.8)';
          ctx.beginPath(); ctx.arc(s.x! * w, s.y*h, s.sz!, 0, Math.PI*2); ctx.fill();
        }); ctx.restore();
      }

      // 9. Leaves
      const lv = v.leaves || 0;
      if (lv > 0.04) {
        ctx.save(); ctx.globalAlpha = lv * 0.5;
        const cnt = Math.floor(bp.leaves.length * lv);
        for(let i=0; i<cnt; i++) {
          const leaf = bp.leaves[i]; leaf.y += leaf.vy!; leaf.x! += leaf.vx! + Math.sin(t*0.01 + i)*0.001; leaf.rot! += leaf.rs!;
          if(leaf.y > 1.1) { leaf.y = -0.1; leaf.x = Math.random(); }
          ctx.save(); ctx.translate(leaf.x! * w, leaf.y*h); ctx.rotate(leaf.rot!); ctx.fillStyle = cc;
          ctx.beginPath(); ctx.ellipse(0, 0, leaf.sz!*0.3, leaf.sz!, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
        } ctx.restore();
      }

      // 10. Ripples
      const mys = (v.bells || 0) * 0.7 + (v.gong || 0) * 0.95 + (v.singing_bowl || 0) * 0.6;
      if(mys > 0.04) {
        if(Math.random() < 0.03 * mys) bp.ripples.push({x: Math.random(), y: Math.random(), r: 0, mr: 0.15+Math.random()*0.25, lf: 0, ml: 60+Math.random()*60, al: mys*0.5, spd:0});
        ctx.save(); bp.ripples.forEach((rp) => {
          rp.r! += rp.mr! / rp.ml!; rp.lf!++; const pg = rp.lf! / rp.ml!;
          ctx.globalAlpha = rp.al! * (1 - pg); ctx.strokeStyle = cc; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(rp.x! * w, rp.y * h, rp.r! * Math.min(w, h), 0, Math.PI * 2); ctx.stroke();
        });
        bp.ripples = bp.ripples.filter(r => r.lf! < r.ml!); ctx.restore();
      }

      // 11. Fire/Lava
      const firev = (v.fire || 0) * 1.2 + (v.lava || 0) * 0.8;
      if (firev > 0.04) {
        ctx.save(); bp.fire.forEach(p => {
          p.x! += p.vx! + (Math.random() - 0.5) * 0.004; p.y += p.vy!; p.lf! += 0.012; p.sz! *= 0.996;
          if(p.lf! >= p.ml! || p.sz! < 0.5) { p.x = 0.2+Math.random()*0.6; p.y = 0.4+Math.random()*0.4; p.lf = 0; p.sz = 2+Math.random()*10; }
          const pg = p.lf! / p.ml!; ctx.globalAlpha = Math.min(1, firev * (1 - pg) * 0.7);
          const gr = ctx.createRadialGradient(p.x! * w, p.y * h, 0, p.x! * w, p.y * h, p.sz!);
          gr.addColorStop(0, `hsl(${p.hue! + 30}, 100%, 80%)`); gr.addColorStop(0.5, `hsl(${p.hue!}, 100%, 50%)`); gr.addColorStop(1, `hsla(${p.hue! - 15}, 90%, 30%, 0)`);
          ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x! * w, p.y * h, p.sz!, 0, Math.PI * 2); ctx.fill();
        }); ctx.restore();
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
