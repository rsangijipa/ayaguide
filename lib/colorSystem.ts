/**
 * Sistema de Cores Dinâmico para Mandala
 * Suporta múltiplas tonalidades e influência de elementos naturais
 */

export interface ColorPalette {
  primary: string;      // Cor principal (mais saturada)
  light: string;        // Variação clara
  medium: string;       // Variação média
  dark: string;         // Variação escura
  pale: string;         // Variação pálida (dessaturada)
  vibrant: string;      // Variação vibrante (muito saturada)
  accent: string;       // Cor de acento
  glow: string;         // Cor de brilho
}

export interface ElementColorInfluence {
  elementId: string;
  hue: number;          // Matiz (0-360)
  saturation: number;   // Saturação (0-100)
  lightness: number;    // Luminosidade (0-100)
  temperature: 'warm' | 'cool' | 'neutral'; // Temperatura da cor
  intensity: number;    // Intensidade de influência (0-1)
}

/**
 * Paletas de cores para cada chakra com múltiplas tonalidades
 */
export const CHAKRA_COLOR_PALETTES: Record<string, ColorPalette> = {
  root: {
    primary: 'rgba(239, 68, 68, 0.8)',
    light: 'rgba(254, 226, 226, 0.6)',
    medium: 'rgba(220, 38, 38, 0.5)',
    dark: 'rgba(127, 29, 29, 0.4)',
    pale: 'rgba(253, 230, 230, 0.3)',
    vibrant: 'rgba(220, 38, 38, 0.9)',
    accent: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  sacral: {
    primary: 'rgba(249, 115, 22, 0.8)',
    light: 'rgba(254, 237, 220, 0.6)',
    medium: 'rgba(234, 88, 12, 0.5)',
    dark: 'rgba(124, 45, 18, 0.4)',
    pale: 'rgba(254, 243, 235, 0.3)',
    vibrant: 'rgba(234, 88, 12, 0.9)',
    accent: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(249, 115, 22, 0.4)',
  },
  solar: {
    primary: 'rgba(250, 204, 21, 0.8)',
    light: 'rgba(254, 252, 191, 0.6)',
    medium: 'rgba(234, 179, 8, 0.5)',
    dark: 'rgba(120, 53, 15, 0.4)',
    pale: 'rgba(254, 252, 232, 0.3)',
    vibrant: 'rgba(234, 179, 8, 0.9)',
    accent: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(250, 204, 21, 0.4)',
  },
  heart: {
    primary: 'rgba(16, 185, 129, 0.8)',
    light: 'rgba(209, 250, 229, 0.6)',
    medium: 'rgba(5, 150, 105, 0.5)',
    dark: 'rgba(6, 54, 42, 0.4)',
    pale: 'rgba(236, 253, 245, 0.3)',
    vibrant: 'rgba(5, 150, 105, 0.9)',
    accent: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  throat: {
    primary: 'rgba(56, 189, 248, 0.8)',
    light: 'rgba(206, 250, 254, 0.6)',
    medium: 'rgba(34, 162, 235, 0.5)',
    dark: 'rgba(25, 32, 71, 0.4)',
    pale: 'rgba(240, 249, 255, 0.3)',
    vibrant: 'rgba(34, 162, 235, 0.9)',
    accent: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(56, 189, 248, 0.4)',
  },
  thirdeye: {
    primary: 'rgba(129, 140, 248, 0.8)',
    light: 'rgba(224, 231, 255, 0.6)',
    medium: 'rgba(99, 102, 241, 0.5)',
    dark: 'rgba(30, 27, 102, 0.4)',
    pale: 'rgba(238, 242, 255, 0.3)',
    vibrant: 'rgba(99, 102, 241, 0.9)',
    accent: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(129, 140, 248, 0.4)',
  },
  crown: {
    primary: 'rgba(192, 132, 252, 0.8)',
    light: 'rgba(243, 232, 255, 0.6)',
    medium: 'rgba(168, 85, 247, 0.5)',
    dark: 'rgba(76, 29, 149, 0.4)',
    pale: 'rgba(250, 245, 255, 0.3)',
    vibrant: 'rgba(168, 85, 247, 0.9)',
    accent: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(192, 132, 252, 0.4)',
  },
};

export const ELEMENT_COLOR_INFLUENCES: Record<string, ElementColorInfluence> = {
  water: { elementId: 'water', hue: 200, saturation: 70, lightness: 50, temperature: 'cool', intensity: 0.3 },
  ocean: { elementId: 'ocean', hue: 210, saturation: 80, lightness: 45, temperature: 'cool', intensity: 0.35 },
  waterfall: { elementId: 'waterfall', hue: 190, saturation: 60, lightness: 55, temperature: 'cool', intensity: 0.25 },
  rain: { elementId: 'rain', hue: 220, saturation: 20, lightness: 60, temperature: 'cool', intensity: 0.2 },
  thunder: { elementId: 'thunder', hue: 240, saturation: 40, lightness: 50, temperature: 'cool', intensity: 0.4 },
  wind: { elementId: 'wind', hue: 0, saturation: 0, lightness: 70, temperature: 'neutral', intensity: 0.15 },
  storm: { elementId: 'storm', hue: 230, saturation: 50, lightness: 40, temperature: 'cool', intensity: 0.5 },
  birds: { elementId: 'birds', hue: 120, saturation: 60, lightness: 55, temperature: 'cool', intensity: 0.3 },
  forest: { elementId: 'forest', hue: 100, saturation: 70, lightness: 40, temperature: 'cool', intensity: 0.35 },
  crickets: { elementId: 'crickets', hue: 110, saturation: 50, lightness: 45, temperature: 'cool', intensity: 0.25 },
  leaves: { elementId: 'leaves', hue: 130, saturation: 60, lightness: 50, temperature: 'cool', intensity: 0.2 },
  bells: { elementId: 'bells', hue: 280, saturation: 70, lightness: 60, temperature: 'cool', intensity: 0.3 },
  gong: { elementId: 'gong', hue: 270, saturation: 80, lightness: 50, temperature: 'cool', intensity: 0.4 },
  singing_bowl: { elementId: 'singing_bowl', hue: 290, saturation: 60, lightness: 55, temperature: 'cool', intensity: 0.35 },
  fire: { elementId: 'fire', hue: 15, saturation: 90, lightness: 55, temperature: 'warm', intensity: 0.5 },
  lava: { elementId: 'lava', hue: 25, saturation: 85, lightness: 45, temperature: 'warm', intensity: 0.45 },
};

export function hslToRgba(h: number, s: number, l: number, a: number = 1): string {
  const c = (1 - Math.abs(2 * l / 100 - 1)) * (s / 100);
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l / 100 - c / 2;
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }
  const red = Math.round((r + m) * 255);
  const green = Math.round((g + m) * 255);
  const blue = Math.round((b + m) * 255);
  return `rgba(${red}, ${green}, ${blue}, ${a})`;
}

export function calculateMandalaColor(basePalette: ColorPalette, activeElements: Record<string, number>, chakraId: string): ColorPalette {
  const activeElementIds = Object.entries(activeElements).filter(([_, volume]) => volume > 0).map(([id, _]) => id);
  if (activeElementIds.length === 0) return basePalette;
  let avgHue = 0, avgSaturation = 0, avgLightness = 0, warmCount = 0, coolCount = 0;
  activeElementIds.forEach((elementId) => {
    const influence = ELEMENT_COLOR_INFLUENCES[elementId];
    if (influence) {
      avgHue += influence.hue * influence.intensity;
      avgSaturation += influence.saturation * influence.intensity;
      avgLightness += influence.lightness * influence.intensity;
      if (influence.temperature === 'warm') warmCount += influence.intensity;
      if (influence.temperature === 'cool') coolCount += influence.intensity;
    }
  });
  const totalInfluence = activeElementIds.reduce((sum, elementId) => sum + (ELEMENT_COLOR_INFLUENCES[elementId]?.intensity || 0), 0);
  if (totalInfluence === 0) return basePalette;
  avgHue /= totalInfluence; avgSaturation /= totalInfluence; avgLightness /= totalInfluence;
  const mixedPalette: ColorPalette = {
    primary: hslToRgba(avgHue, avgSaturation, avgLightness, 0.8),
    light: hslToRgba(avgHue, avgSaturation * 0.5, avgLightness + 15, 0.6),
    medium: hslToRgba(avgHue, avgSaturation, avgLightness - 10, 0.5),
    dark: hslToRgba(avgHue, avgSaturation, avgLightness - 30, 0.4),
    pale: hslToRgba(avgHue, avgSaturation * 0.3, avgLightness + 20, 0.3),
    vibrant: hslToRgba(avgHue, Math.min(100, avgSaturation + 20), avgLightness, 0.9),
    accent: 'rgba(255, 255, 255, 0.1)',
    glow: hslToRgba(avgHue, avgSaturation, avgLightness, 0.4),
  };
  if (warmCount > 0 && coolCount > 0) {
    const warmInfluence = warmCount / (warmCount + coolCount);
    const coolInfluence = coolCount / (warmCount + coolCount);
    mixedPalette.light = hslToRgba(avgHue + (warmInfluence * 20 - coolInfluence * 20), avgSaturation, avgLightness + 15, 0.6);
  }
  return mixedPalette;
}

export function generateParticleColors(activeElements: Record<string, number>, count: number = 12): string[] {
  const colors: string[] = [];
  const activeElementIds = Object.entries(activeElements).filter(([_, volume]) => volume > 0).map(([id, _]) => id);
  if (activeElementIds.length === 0) {
    for (let i = 0; i < count; i++) colors.push(`rgba(255, 255, 255, ${0.3 + Math.random() * 0.3})`);
    return colors;
  }
  for (let i = 0; i < count; i++) {
    const elementId = activeElementIds[i % activeElementIds.length];
    const influence = ELEMENT_COLOR_INFLUENCES[elementId];
    if (influence) {
      const hue = influence.hue + (Math.random() - 0.5) * 30;
      const saturation = influence.saturation + (Math.random() - 0.5) * 20;
      const lightness = influence.lightness + (Math.random() - 0.5) * 15;
      const alpha = 0.3 + Math.random() * 0.4;
      colors.push(hslToRgba(hue, saturation, lightness, alpha));
    }
  }
  return colors;
}

export function getTemperatureBalance(activeElements: Record<string, number>): { warm: number; cool: number; neutral: number; } {
  let warm = 0, cool = 0, neutral = 0;
  Object.entries(activeElements).forEach(([elementId, volume]) => {
    if (volume > 0) {
      const influence = ELEMENT_COLOR_INFLUENCES[elementId];
      if (influence) {
        if (influence.temperature === 'warm') warm += volume;
        else if (influence.temperature === 'cool') cool += volume;
        else neutral += volume;
      }
    }
  });
  return { warm, cool, neutral };
}
