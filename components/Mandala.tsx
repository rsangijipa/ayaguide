'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { 
  calculateBands,
  drawPetal,
  drawPoly,
  drawRing,
  emod
} from '@/lib/mandalaSystem';
import { getAudioMixer } from '@/lib/audioMixer';
import { useSessionStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';

interface MandalaProps {
  chakraId: string;
  ambientVolumes: Record<string, number>;
  audioLevel?: number; // Kept for compatibility
  isPlaying: boolean;
  chakraPalette?: {
    primary: string;
    secondary: string;
    accent: string;
    soft: string;
  };
}

export function Mandala({ 
  chakraId, 
  ambientVolumes, 
  isPlaying,
  chakraPalette 
}: MandalaProps) {
  const { qualityMode } = useSessionStore(
    useShallow((s) => ({
      qualityMode: s.qualityMode,
    }))
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationTimeRef = useRef(0);
  const lastTimeRef = useRef(0);
  const rafId = useRef<number | null>(null);
  const audioDataRef = useRef(new Uint8Array(64));
  const reactiveScaleRef = useRef(1);
  const reactiveGlowRef = useRef(15);
  
  // High-frequency data refs
  const playingRef = useRef(isPlaying);
  const volumesRef = useRef(ambientVolumes);
  const chakraIdRef = useRef(chakraId);
  const paletteRef = useRef(chakraPalette);
  const isMobileRef = useRef(typeof window !== 'undefined' && window.innerWidth < 768);
  const isVisibleRef = useRef(true);

  // Sync refs with props
  useEffect(() => {
    playingRef.current = isPlaying;
    volumesRef.current = ambientVolumes;
    chakraIdRef.current = chakraId;
    paletteRef.current = chakraPalette;
  }, [isPlaying, ambientVolumes, chakraId, chakraPalette]);

  useEffect(() => {
    const updateSizeInfo = () => {
        isMobileRef.current = window.innerWidth < 768;
    };
    const updateVisibility = () => {
        isVisibleRef.current = document.visibilityState === 'visible';
    };
    updateSizeInfo();
    window.addEventListener('resize', updateSizeInfo);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
        window.removeEventListener('resize', updateSizeInfo);
        document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  const core = useCallback((ctx: CanvasRenderingContext2D, color: string, r: number, hi: number) => {
    const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 3.5);
    gr.addColorStop(0, color.replace(/0\.\d+\)$/, '0.95)').replace('0.8', '0.95').replace('0.4', '0.95'));
    gr.addColorStop(0.45, color.replace(/0\.\d+\)$/, '0.35)').replace('0.8', '0.35').replace('0.4', '0.35'));
    gr.addColorStop(1, color.replace(/0\.\d+\)$/, '0)').replace('0.8', '0').replace('0.4', '0'));
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(0, 0, r * 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white'; ctx.globalAlpha = 0.9 + hi * 0.08;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  }, []);

  const drawRoot = useCallback((ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, a: {lo: number, mi: number, hi: number}, v: Record<string, number>, c: string) => {
    const s = Math.min(cx, cy) * 0.85; const rb = t * 0.003;
    const wm = emod(v, ['water', 'ocean'], t); const fm = emod(v, ['fire', 'lava'], t, 'sin');
    const m = isMobileRef.current ? 0.5 : 1;
    ctx.save(); ctx.translate(cx, cy); ctx.save(); ctx.rotate(rb * 0.5);
    const cnt = Math.max(8, Math.floor(40*m));
    for(let i=0; i<cnt; i++) {
      const ang = (i/cnt)*Math.PI*2; const r1 = s*0.94, r2 = s*(i%4===0?0.84:0.89);
      ctx.strokeStyle = c; ctx.globalAlpha = i%4===0?0.4:0.12; ctx.lineWidth = i%4===0?2:0.7;
      ctx.beginPath(); ctx.moveTo(Math.cos(ang)*r1, Math.sin(ang)*r1); ctx.lineTo(Math.cos(ang)*r2, Math.sin(ang)*r2); ctx.stroke();
    } ctx.restore();
    ctx.save(); ctx.rotate(rb*0.3+Math.PI/4); ctx.strokeStyle = c; ctx.globalAlpha = 0.15+a.lo*0.12;
    ctx.lineWidth = 1; const sq = s*0.86/Math.SQRT2; ctx.strokeRect(-sq, -sq, sq*2, sq*2); ctx.restore();
    for(let i=0; i<4; i++) drawPetal(ctx, s*(0.18+fm*0.04), s*(0.18+wm*0.04), s*0.72, (i/4)*Math.PI*2+rb*0.3, c, 0.55);
    for(let i=0; i<4; i++) drawPetal(ctx, s*0.18, s*0.15, s*0.56, (i/4)*Math.PI*2+Math.PI/4-rb*0.4, c, 0.42);
    for(let i=0; i<4; i++) drawPetal(ctx, s*0.1, s*0.09, s*0.28, (i/4)*Math.PI*2+rb, c, 0.65);
    ctx.save(); ctx.rotate(rb*0.8); ctx.strokeStyle = c; ctx.globalAlpha = 0.3; ctx.lineWidth = 1.5;
    const isq = s*0.33; ctx.strokeRect(-isq, -isq, isq*2, isq*2); ctx.restore();
    if(wm>0.03) { for(let r=1; r<=Math.floor(4*m); r++) drawRing(ctx, s*(0.38+r*0.1)*(1+wm*0.08*Math.sin(t*0.04+r)), '#38BDF8', wm*(0.35-r*0.06), 0.8); }
    ctx.save(); ctx.rotate(rb*1.2); ctx.strokeStyle = c; ctx.globalAlpha = 0.5+a.hi*0.25; ctx.lineWidth = 1.5;
    const cr = s*0.22; ctx.beginPath(); ctx.moveTo(-cr, 0); ctx.lineTo(cr, 0); ctx.moveTo(0, -cr); ctx.lineTo(0, cr); ctx.stroke();
    drawRing(ctx, cr, c, 0.4+a.hi*0.2, 1.5); ctx.restore(); core(ctx, c, s*(0.06+a.hi*0.04), a.hi); ctx.restore();
  }, [core]);

  const drawSacral = useCallback((ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, a: {lo: number, mi: number, hi: number}, v: Record<string, number>, c: string) => {
    const s = Math.min(cx, cy) * 0.85; const rb = t * 0.004;
    const wm = emod(v, ['water', 'ocean', 'waterfall'], t); const m = isMobileRef.current ? 0.5 : 1;
    ctx.save(); ctx.translate(cx, cy); ctx.save(); ctx.rotate(rb * 0.4);
    const cnt = Math.max(6, Math.floor(36*m));
    for(let i=0; i<cnt; i++) {
        const ang = (i/cnt)*Math.PI*2; ctx.strokeStyle = c; ctx.globalAlpha = i%6===0?0.45:0.12; ctx.lineWidth = i%6===0?2:0.7;
        ctx.beginPath(); ctx.moveTo(Math.cos(ang)*s*0.95, Math.sin(ang)*s*0.95); ctx.lineTo(Math.cos(ang)*s*(i%6===0?0.84:0.89), Math.sin(ang)*s*(i%6===0?0.84:0.89)); ctx.stroke();
    } ctx.restore();
    ctx.save(); ctx.rotate(rb*0.25); drawPoly(ctx, 6, s*0.87, 0, c, 0.12, 1); ctx.restore();
    const sc = Math.max(2, Math.floor(6*m));
    for(let i=0; i<sc; i++) drawPetal(ctx, s*0.15, s*(0.21+wm*0.05+a.mi*0.03), s*(0.73+wm*0.1), (i/sc)*Math.PI*2+rb*0.5, c, 0.5);
    for(let i=0; i<sc; i++) drawPetal(ctx, s*0.15, s*0.16, s*(0.56+wm*0.07), (i/sc)*Math.PI*2+Math.PI/6-rb*0.6, c, 0.4);
    if(wm>0.02) for(let r=1; r<=Math.floor(4*m); r++) drawRing(ctx, s*(0.18+r*0.08)*(1+wm*0.13*Math.sin(t*0.05+r*1.2)), '#38BDF8', wm*(0.32-r*0.055), 0.9);
    core(ctx, c, s*(0.062+a.mi*0.035), a.hi); ctx.restore();
  }, [core]);

  const drawSolar = useCallback((ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, a: {lo: number, mi: number, hi: number}, v: Record<string, number>, c: string) => {
    const s = Math.min(cx, cy) * 0.85; const rb = t * 0.005;
    const fm = emod(v, ['fire', 'lava'], t, 'sin'); const wm = emod(v, ['wind', 'storm'], t); const m = isMobileRef.current ? 0.5 : 1;
    ctx.save(); ctx.translate(cx, cy); ctx.save(); ctx.rotate(rb * 0.4);
    const cnt = Math.floor(40*m);
    for(let i=0; i<cnt; i++) {
        const ang = (i/cnt)*Math.PI*2; const mn = i%4===0; ctx.strokeStyle = c; ctx.globalAlpha = mn?0.55:0.18; ctx.lineWidth = mn?2.5:0.8;
        ctx.beginPath(); ctx.moveTo(Math.cos(ang)*s*0.96, Math.sin(ang)*s*0.96); ctx.lineTo(Math.cos(ang)*s*(mn?0.82:0.91), Math.sin(ang)*s*(mn?0.82:0.91)); ctx.stroke();
    } ctx.restore();
    const pc = Math.max(4, Math.floor(10*m));
    for(let i=0; i<pc; i++) {
        const ang = (i/pc)*Math.PI*2+rb*0.4; const fr = s*(0.58+fm*0.13+a.mi*0.05+Math.sin(t*0.08+i)*0.02*wm);
        ctx.save(); ctx.rotate(ang); ctx.globalAlpha = 0.55; ctx.fillStyle = c;
        ctx.beginPath(); ctx.moveTo(0, -fr*0.12); ctx.bezierCurveTo(s*0.13, -fr*0.12+fr*0.28*0.85, s*0.04, -fr*0.12+fr*0.6, 0, -fr*0.12+fr);
        ctx.bezierCurveTo(-s*0.04, -fr*0.12+fr*0.6, -s*0.13, -fr*0.12+fr*0.28*0.85, 0, -fr*0.12); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    for(let i=0; i<pc; i++) drawPetal(ctx, s*0.14, s*0.09, s*(0.38+fm*0.08+a.mi*0.04), (i/pc)*Math.PI*2+Math.PI/pc-rb*0.5, c, 0.42);
    ctx.save(); ctx.rotate(rb*0.6); drawPoly(ctx, 3, s*0.33, -Math.PI/6, c, 0.18, 1.5); ctx.restore();
    core(ctx, c, s*(0.065+a.hi*0.04), a.hi); ctx.restore();
  }, [core]);

  const drawHeart = useCallback((ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, a: {lo: number, mi: number, hi: number}, v: Record<string, number>, c: string) => {
    const s = Math.min(cx, cy) * 0.85; const rb = t * 0.0035;
    const wm = emod(v, ['water', 'rain'], t); const bm = emod(v, ['bells', 'singing_bowl'], t, 'cos'); const m = isMobileRef.current ? 0.5 : 1;
    ctx.save(); ctx.translate(cx, cy); ctx.save(); ctx.rotate(rb * 0.3);
    const cnt = Math.floor(48*m);
    for(let i=0; i<cnt; i++) {
        const ang = (i/cnt)*Math.PI*2; const mn = i%4===0; ctx.strokeStyle = c; ctx.globalAlpha = mn?0.42:0.13; ctx.lineWidth = mn?2:0.7;
        ctx.beginPath(); ctx.moveTo(Math.cos(ang)*s*0.96, Math.sin(ang)*s*0.96); ctx.lineTo(Math.cos(ang)*s*(mn?0.87:0.91), Math.sin(ang)*s*(mn?0.87:0.91)); ctx.stroke();
    } ctx.restore();
    ctx.save(); ctx.rotate(rb*0.2); drawPoly(ctx, 3, s*0.8, Math.PI/6, c, 0.1, 1); drawPoly(ctx, 3, s*0.8, -Math.PI/6, c, 0.1, 1); ctx.restore();
    const pc = Math.max(6, Math.floor(12*m));
    for(let i=0; i<pc; i++) drawPetal(ctx, s*0.12, s*(0.17+bm*0.04+wm*0.04), s*(0.76+wm*0.07), (i/pc)*Math.PI*2+rb*0.4, c, 0.46);
    for(let i=0; i<pc; i++) drawPetal(ctx, s*0.12, s*0.13, s*(0.54+wm*0.05), (i/pc)*Math.PI*2+Math.PI/pc-rb*0.5, c, 0.36);
    if(bm>0.02) for(let r=1; r<=Math.floor(6*m); r++) drawRing(ctx, s*(0.09+r*0.07+bm*0.04*Math.sin(t*0.04+r*0.8)), '#C084FC', bm*(0.38-r*0.05), 1);
    core(ctx, c, s*(0.06+a.hi*0.038), a.hi); ctx.restore();
  }, [core]);

  const drawThroat = useCallback((ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, a: {lo: number, mi: number, hi: number}, v: Record<string, number>, c: string) => {
    const s = Math.min(cx, cy) * 0.85; const rb = t * 0.004;
    const wm = emod(v, ['wind', 'leaves'], t); const bm = emod(v, ['singing_bowl', 'bells'], t, 'cos'); const m = isMobileRef.current ? 0.5 : 1;
    ctx.save(); ctx.translate(cx, cy); drawRing(ctx, s*0.92, c, 0.18, 1); ctx.save(); ctx.rotate(rb * 0.3);
    const cnt = Math.floor(64*m);
    for(let i=0; i<cnt; i++) {
        const ang = (i/cnt)*Math.PI*2; const mn = i%4===0; ctx.strokeStyle = c; ctx.globalAlpha = mn?0.48:0.1; ctx.lineWidth = mn?2:0.5;
        ctx.beginPath(); ctx.moveTo(Math.cos(ang)*s*0.95, Math.sin(ang)*s*0.95); ctx.lineTo(Math.cos(ang)*s*(mn?0.86:0.91), Math.sin(ang)*s*(mn?0.86:0.91)); ctx.stroke();
    } ctx.restore();
    const pc = Math.max(8, Math.floor(16*m));
    for(let i=0; i<pc; i++) drawPetal(ctx, s*0.08, s*(0.085+wm*0.03), s*(0.84+a.mi*0.05+wm*0.05), (i/pc)*Math.PI*2+rb*0.35, c, 0.43);
    for(let i=0; i<pc; i++) drawPetal(ctx, s*0.08, s*0.07, s*(0.6+a.mi*0.04), (i/pc)*Math.PI*2+Math.PI/pc-rb*0.5, c, 0.33);
    for(let r=1; r<=Math.floor(7*m); r++) drawRing(ctx, s*(0.09+r*0.055+bm*0.035*Math.sin(t*0.04+r)), c, 0.13+bm*0.18-r*0.015, 0.9);
    core(ctx, c, s*(0.055+a.hi*0.033), a.hi); ctx.restore();
  }, [core]);

  const drawThirdEye = useCallback((ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, a: {lo: number, mi: number, hi: number}, v: Record<string, number>, c: string) => {
    const s = Math.min(cx, cy) * 0.85; const rb = t * 0.003;
    const mm = emod(v, ['bells', 'gong', 'singing_bowl'], t, 'cos'); const m = isMobileRef.current ? 0.5 : 1;
    ctx.save(); ctx.translate(cx, cy); drawRing(ctx, s*0.92, c, 0.22, 1.5); ctx.save(); ctx.rotate(rb * 0.2);
    const cnt = Math.floor(96*m);
    for(let i=0; i<cnt; i++) {
        const ang = (i/cnt)*Math.PI*2; const mn = i%(cnt/2)===0, sub = i%8===0; ctx.strokeStyle = c; ctx.globalAlpha = mn?0.75:sub?0.3:0.1; ctx.lineWidth = mn?3:sub?1.5:0.5;
        ctx.beginPath(); ctx.moveTo(Math.cos(ang)*s*0.95, Math.sin(ang)*s*0.95); ctx.lineTo(Math.cos(ang)*s*(mn?0.82:sub?0.88:0.92), Math.sin(ang)*s*(mn?0.82:sub?0.88:0.92)); ctx.stroke();
    } ctx.restore();
    const er = s*(0.6+a.mi*0.06+mm*0.04), ew = s*(0.38+mm*0.05);
    ctx.save(); ctx.globalAlpha = 0.42; ctx.fillStyle = c;
    ctx.beginPath(); ctx.moveTo(-er, 0); ctx.bezierCurveTo(-er+ew, -ew*0.5, -ew*0.3, -ew*0.6, 0, 0); ctx.bezierCurveTo(-ew*0.3, ew*0.6, -er+ew, ew*0.5, -er, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(er, 0); ctx.bezierCurveTo(er-ew, -ew*0.5, ew*0.3, -ew*0.6, 0, 0); ctx.bezierCurveTo(ew*0.3, ew*0.6, er-ew, ew*0.5, er, 0); ctx.closePath(); ctx.fill(); ctx.restore();
    const pc = Math.max(12, Math.floor(24*m));
    ctx.save(); ctx.rotate(rb*0.4); for(let i=0; i<pc; i++) drawPetal(ctx, s*0.12, s*0.045, s*0.7, (i/pc)*Math.PI*2, c, 0.25); ctx.restore();
    core(ctx, c, s*(0.1+a.hi*0.04), a.hi); ctx.restore();
  }, [core]);

  const drawCrown = useCallback((ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, a: {lo: number, mi: number, hi: number}, v: Record<string, number>, c: string) => {
    const s = Math.min(cx, cy) * 0.85; const rb = t * 0.0025;
    const gm = emod(v, ['gong', 'bells', 'singing_bowl'], t, 'cos'); const m = isMobileRef.current ? 0.5 : 1;
    ctx.save(); ctx.translate(cx, cy); ctx.save(); ctx.rotate(rb * 0.15);
    const cnt = Math.floor(144*m);
    for(let i=0; i<cnt; i++) {
        const ang = (i/cnt)*Math.PI*2; const mn = i%12===0, sb = i%4===0; ctx.strokeStyle = c; ctx.globalAlpha = mn?0.55:sb?0.22:0.07; ctx.lineWidth = mn?2.5:sb?1:0.4;
        ctx.beginPath(); ctx.moveTo(Math.cos(ang)*s*0.96, Math.sin(ang)*s*0.96); ctx.lineTo(Math.cos(ang)*s*(mn?0.84:sb?0.89:0.93), Math.sin(ang)*s*(mn?0.84:sb?0.89:0.93)); ctx.stroke();
    } ctx.restore();
    const pCnts = [Math.floor(24*m), Math.floor(20*m), Math.floor(16*m), Math.floor(12*m), Math.floor(8*m), Math.floor(6*m)]; const pRad = [0.82, 0.69, 0.57, 0.44, 0.32, 0.22]; const pAlp = [0.32, 0.36, 0.40, 0.44, 0.48, 0.55];
    pCnts.forEach((pcnt, li) => {
        const dir = li%2===0?1:-1; const rs = (0.5+li*0.3)*dir; const ph = s*(pRad[li]-(li<5?pRad[li+1]:0.1));
        const pc = Math.max(1, pcnt); for(let i=0; i<pc; i++) drawPetal(ctx, s*(li<5?pRad[li+1]:0.1), s*0.08, ph, (i/pc)*Math.PI*2+rb*rs, `hsl(${278+li*9},68%,72%)`, pAlp[li]+gm*0.08);
    });
    core(ctx, c, s*(0.07+a.hi*0.045), a.hi); ctx.restore();
  }, [core]);

  useEffect(() => {
    if (qualityMode === 'minimal') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
        canvas.width = parent.clientWidth * dpr;
        canvas.height = parent.clientHeight * dpr;
        canvas.style.width = `${parent.clientWidth}px`;
        canvas.style.height = `${parent.clientHeight}px`;
        ctx.scale(dpr, dpr);
      }
    };

    window.addEventListener('resize', resize);
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) resize();
    });
    observer.observe(canvas);
    resize();

    lastTimeRef.current = performance.now();

    const animate = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      if (w === 0 || h === 0 || !isVisibleRef.current) {
        rafId.current = requestAnimationFrame(animate);
        return;
      }
      
      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;
      const isPlaying = playingRef.current;
      if (isPlaying) rotationTimeRef.current += deltaTime;
      const time = rotationTimeRef.current;

      ctx.clearRect(0, 0, w, h);
      
      // QUALITY ENHANCEMENT: Glow effect for "neon" look
      ctx.shadowBlur = 15;
      ctx.shadowColor = paletteRef.current?.primary || '#fff';

      const engine = getAudioMixer();
      let targetScale = 1;
      let targetGlow = 15;

      if (isPlaying && engine && qualityMode === 'full') {
        engine.getFrequencyData(audioDataRef.current);
        const bands = calculateBands(audioDataRef.current);
        // LO influences scale (bass pulse) - subtle +5% max
        targetScale = 1 + (bands.lo * 0.06); 
        // HI influences glow (shimmer) - up to 40px
        targetGlow = 12 + (bands.hi * 28);
      }

      // Smooth interpolation (lerp) for organic feel
      reactiveScaleRef.current += (targetScale - reactiveScaleRef.current) * 0.12;
      reactiveGlowRef.current += (targetGlow - reactiveGlowRef.current) * 0.08;

      const bands = calculateBands(audioDataRef.current);
      const cx = w/2; const cy = h/2;
      const palette = paletteRef.current;
      const c = palette?.primary || '#fff';
      const chakraId = chakraIdRef.current;
      const volumes = volumesRef.current;

      ctx.save();
      // Apply organic pulse
      ctx.translate(cx, cy);
      ctx.scale(reactiveScaleRef.current, reactiveScaleRef.current);
      ctx.translate(-cx, -cy);
      
      ctx.shadowBlur = reactiveGlowRef.current;
      ctx.shadowColor = c;
      
      switch(chakraId) {
        case 'root': drawRoot(ctx, cx, cy, time, bands, volumes, c); break;
        case 'sacral': drawSacral(ctx, cx, cy, time, bands, volumes, c); break;
        case 'solar': drawSolar(ctx, cx, cy, time, bands, volumes, c); break;
        case 'heart': drawHeart(ctx, cx, cy, time, bands, volumes, c); break;
        case 'throat': drawThroat(ctx, cx, cy, time, bands, volumes, c); break;
        case 'thirdeye': drawThirdEye(ctx, cx, cy, time, bands, volumes, c); break;
        case 'crown': drawCrown(ctx, cx, cy, time, bands, volumes, c); break;
        default: drawHeart(ctx, cx, cy, time, bands, volumes, c);
      }
      ctx.restore();
      rafId.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener('resize', resize);
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [drawCrown, drawHeart, drawRoot, drawSacral, drawSolar, drawThirdEye, drawThroat, qualityMode]);

  if (qualityMode === 'minimal') {
    return (
      <div className="relative w-full h-full flex items-center justify-center p-8">
        <svg 
          viewBox="0 0 100 100" 
          className={`w-[80%] h-[80%] opacity-40 transition-all duration-1000 ${isPlaying ? 'animate-spin-slow' : ''}`}
          style={{ color: chakraPalette?.primary || 'white' }}
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
          <path d="M50 5 L55 45 L95 50 L55 55 L50 95 L45 55 L5 50 L45 45 Z" fill="currentColor" fillOpacity="0.4" />
          <circle cx="50" cy="50" r="10" fill="currentColor" fillOpacity="0.2" />
          <circle cx="50" cy="50" r="5" fill="currentColor" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[inherit] flex items-center justify-center overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-contain pointer-events-none" 
        role="img"
        aria-label="Mandala animada reagindo aos sons da meditação"
      />
    </div>
  );
}
