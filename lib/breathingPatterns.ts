/**
 * Padrões de Respiração Avançados para AyaGuide
 * Cada padrão define fases com duração, label e escala visual
 */

export interface BreathingPhase {
  label: string;
  duration: number; // ms
  /** 
   * Visual scale direction:
   * 'grow' = circle expands
   * 'hold' = circle stays 
   * 'shrink' = circle contracts
   * 'rapid' = fast pulsing (for Wim Hof power breaths)
   */
  visual: 'grow' | 'hold' | 'shrink' | 'rapid';
}

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  emoji: string;
  indication: string;
  phases: BreathingPhase[];
  /** Total cycle duration in ms (auto-calculated) */
  cycleDuration: number;
  /** For patterns with repetitions before a hold (e.g. Wim Hof) */
  rapidCount?: number;
}

function calcCycleDuration(phases: BreathingPhase[]): number {
  return phases.reduce((sum, p) => sum + p.duration, 0);
}

const calmPhases: BreathingPhase[] = [
  { label: 'Inspire', duration: 4000, visual: 'grow' },
  { label: 'Retenha', duration: 4000, visual: 'hold' },
  { label: 'Expire', duration: 6000, visual: 'shrink' },
];

const boxPhases: BreathingPhase[] = [
  { label: 'Inspire', duration: 4000, visual: 'grow' },
  { label: 'Retenha', duration: 4000, visual: 'hold' },
  { label: 'Expire', duration: 4000, visual: 'shrink' },
  { label: 'Retenha', duration: 4000, visual: 'hold' },
];

const sleepPhases: BreathingPhase[] = [
  { label: 'Inspire', duration: 4000, visual: 'grow' },
  { label: 'Retenha', duration: 7000, visual: 'hold' },
  { label: 'Expire', duration: 8000, visual: 'shrink' },
];

const coherencePhases: BreathingPhase[] = [
  { label: 'Inspire', duration: 5000, visual: 'grow' },
  { label: 'Expire', duration: 5000, visual: 'shrink' },
];

// Wim Hof: 30 rapid breaths (~1.3s each) then deep inhale + hold 15s + exhale
const wimHofPhases: BreathingPhase[] = [
  { label: 'Respire Rápido', duration: 39000, visual: 'rapid' }, // 30 × 1.3s
  { label: 'Inspire Fundo', duration: 3000, visual: 'grow' },
  { label: 'Retenha', duration: 15000, visual: 'hold' },
  { label: 'Expire', duration: 3000, visual: 'shrink' },
];

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'calm',
    name: 'Calmante',
    description: 'Padrão 4-4-6 para relaxamento geral',
    emoji: '🍃',
    indication: 'Relaxamento e redução de ansiedade',
    phases: calmPhases,
    cycleDuration: calcCycleDuration(calmPhases),
  },
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Padrão 4-4-4-4 usado por Navy SEALs',
    emoji: '📦',
    indication: 'Foco, controle e clareza mental',
    phases: boxPhases,
    cycleDuration: calcCycleDuration(boxPhases),
  },
  {
    id: 'sleep',
    name: '4-7-8',
    description: 'Técnica do Dr. Andrew Weil',
    emoji: '🌙',
    indication: 'Indução de sono e relaxamento profundo',
    phases: sleepPhases,
    cycleDuration: calcCycleDuration(sleepPhases),
  },
  {
    id: 'coherence',
    name: 'Coerência Cardíaca',
    description: 'Padrão 5-5 para equilíbrio autônomo',
    emoji: '💚',
    indication: 'Equilíbrio do sistema nervoso',
    phases: coherencePhases,
    cycleDuration: calcCycleDuration(coherencePhases),
  },
  {
    id: 'wimhof',
    name: 'Wim Hof',
    description: '30 respirações rápidas + retenção',
    emoji: '🧊',
    indication: 'Energia, vitalidade e resiliência',
    phases: wimHofPhases,
    cycleDuration: calcCycleDuration(wimHofPhases),
    rapidCount: 30,
  },
];

export function getBreathingPattern(id: string): BreathingPattern {
  return BREATHING_PATTERNS.find(p => p.id === id) || BREATHING_PATTERNS[0];
}

/**
 * Given elapsed time within a cycle, returns current phase index and progress within that phase
 */
export function getPhaseAtTime(pattern: BreathingPattern, elapsedInCycle: number): {
  phaseIndex: number;
  phase: BreathingPhase;
  progress: number; // 0-1 within the phase
  rapidBeat?: number; // current rapid breath number (for Wim Hof)
} {
  let accumulated = 0;
  for (let i = 0; i < pattern.phases.length; i++) {
    const phase = pattern.phases[i];
    if (elapsedInCycle < accumulated + phase.duration) {
      const phaseElapsed = elapsedInCycle - accumulated;
      const progress = phaseElapsed / phase.duration;

      let rapidBeat: number | undefined;
      if (phase.visual === 'rapid' && pattern.rapidCount) {
        const beatDuration = phase.duration / pattern.rapidCount;
        rapidBeat = Math.floor(phaseElapsed / beatDuration) + 1;
      }

      return { phaseIndex: i, phase, progress, rapidBeat };
    }
    accumulated += phase.duration;
  }
  // Fallback to last phase
  const lastPhase = pattern.phases[pattern.phases.length - 1];
  return { phaseIndex: pattern.phases.length - 1, phase: lastPhase, progress: 1 };
}
