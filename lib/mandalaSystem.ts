export interface AudioBands {
  sub: number;
  bass: number;
  lowMid: number;
  mid: number;
  high: number;
  air: number;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export interface MandalaGeometry {
  layers: number;
  points: number;
  radius: number;
  spread: number;
  twist: number;
  distortion: number;
  complexity: number;
  family: 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'thirdeye' | 'crown';
}

export const CHAKRA_MANDALA_PRESETS: Record<string, MandalaGeometry> = {
  root: {
    layers: 4,
    points: 4,
    radius: 140,
    spread: 0.8,
    twist: 0.2,
    distortion: 0.1,
    complexity: 1.2,
    family: 'root'
  },
  sacral: {
    layers: 6,
    points: 6,
    radius: 155,
    spread: 1.1,
    twist: 0.4,
    distortion: 0.2,
    complexity: 1.5,
    family: 'sacral'
  },
  solar: {
    layers: 10,
    points: 10,
    radius: 170,
    spread: 1.3,
    twist: 0.6,
    distortion: 0.25,
    complexity: 2.0,
    family: 'solar'
  },
  heart: {
    layers: 12,
    points: 12,
    radius: 185,
    spread: 1.5,
    twist: 0.8,
    distortion: 0.3,
    complexity: 2.5,
    family: 'heart'
  },
  throat: {
    layers: 16,
    points: 16,
    radius: 200,
    spread: 1.8,
    twist: 1.0,
    distortion: 0.4,
    complexity: 3.0,
    family: 'throat'
  },
  thirdeye: {
    layers: 24,
    points: 48,
    radius: 220,
    spread: 2.2,
    twist: 1.4,
    distortion: 0.5,
    complexity: 4.0,
    family: 'thirdeye'
  },
  crown: {
    layers: 32,
    points: 64,
    radius: 240,
    spread: 2.8,
    twist: 2.0,
    distortion: 0.8,
    complexity: 6.0,
    family: 'crown'
  },
};

export function getAudioInfluence(bands: AudioBands, ruleBand: keyof AudioBands, volume: number): number {
  return clamp(volume * 0.7 + (bands[ruleBand] ?? 0) * 0.9, 0, 1.5);
}

export function calculatePoint(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius
  };
}

/**
 * Modula a intensidade de um efeito baseado no volume de um conjunto de IDs de som e uma forma de onda senoidal
 */
export function emod(vols: Record<string, number>, ids: string[], time: number, wave: 'sin' | 'cos' = 'sin'): number {
  let sum = 0;
  ids.forEach(id => {
    const x = vols[id] || 0;
    const factor = wave === 'cos' ? 0.5 + 0.5 * Math.cos(time * 0.04) : 0.5 + 0.5 * Math.sin(time * 0.05);
    sum += x * factor;
  });
  return Math.min(1, sum);
}

/**
 * Calcula as bandas de áudio (Grave, Médio, Agudo) a partir de um array de frequências
 */
export function calculateBands(data: Uint8Array) {
  let lo = 0, mi = 0, hi = 0;
  const len = data.length;
  const chunk = Math.floor(len / 3);
  
  for (let i = 0; i < chunk; i++) lo += data[i] / 255;
  for (let i = chunk; i < chunk * 2; i++) mi += data[i] / 255;
  for (let i = chunk * 2; i < len; i++) hi += data[i] / 255;
  
  return {
    lo: lo / chunk,
    mi: mi / chunk,
    hi: hi / (len - chunk * 2)
  };
}

/**
 * Desenha uma pétala com curvas de bezier
 */
export function drawPetal(ctx: CanvasRenderingContext2D, r0: number, w: number, h: number, angle: number, color: string, alpha: number) {
  ctx.save();
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -r0);
  ctx.bezierCurveTo(w, -r0 + h * 0.28, w, -r0 + h * 0.72, 0, -r0 + h);
  ctx.bezierCurveTo(-w, -r0 + h * 0.72, -w, -r0 + h * 0.28, 0, -r0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Desenha um polígono regular
 */
export function drawPoly(ctx: CanvasRenderingContext2D, sides: number, r: number, rot: number, color: string, alpha: number, lw?: number) {
  ctx.save();
  ctx.rotate(rot);
  if (lw) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.globalAlpha = alpha;
  } else {
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
  }
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  lw ? ctx.stroke() : ctx.fill();
  ctx.restore();
}

/**
 * Desenha um anel circular
 */
export function drawRing(ctx: CanvasRenderingContext2D, r: number, color: string, alpha: number, lw: number = 1) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
