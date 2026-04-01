/**
 * Jornadas Guiadas para AyaGuide
 * Sequências pré-programadas que mudam chakra, sons e respiração automaticamente
 */

export interface JourneyPhaseDefinition {
  chakraId: string;
  ambientVolumes: Record<string, number>;
  breathPatternId?: string;
  duration: number; // seconds
  message: string;
  chakraVolume: number;
}

export interface Journey {
  id: string;
  name: string;
  description: string;
  emoji: string;
  totalDuration: number; // seconds (auto-calculated)
  phases: JourneyPhaseDefinition[];
  indication: string;
}

export const JOURNEYS: Journey[] = [
  {
    id: 'morning-awakening',
    name: 'Despertar Matinal',
    description: 'Ative sua energia dos pés à cabeça com frequências ascendentes e sons revigorantes.',
    emoji: '🌅',
    indication: 'Energia e vitalidade para o dia',
    totalDuration: 900, // 15 min
    phases: [
      {
        chakraId: 'root',
        ambientVolumes: { birds: 0.5, forest: 0.4, water: 0.3 },
        breathPatternId: 'coherence',
        duration: 300,
        message: 'Conecte-se com a terra. Sinta seus pés firmes no chão.',
        chakraVolume: 0.5,
      },
      {
        chakraId: 'sacral',
        ambientVolumes: { water: 0.6, ocean: 0.4, birds: 0.3 },
        breathPatternId: 'calm',
        duration: 300,
        message: 'Desperte sua criatividade. Deixe a energia fluir como água.',
        chakraVolume: 0.6,
      },
      {
        chakraId: 'solar',
        ambientVolumes: { fire: 0.5, wind: 0.4, birds: 0.5, waterfall: 0.3 },
        breathPatternId: 'box',
        duration: 300,
        message: 'Acenda seu poder interior. Sinta o calor da determinação.',
        chakraVolume: 0.7,
      },
    ],
  },
  {
    id: 'night-relaxation',
    name: 'Relaxamento Noturno',
    description: 'Desça suavemente do mental ao coração, preparando corpo e mente para o descanso.',
    emoji: '🌙',
    indication: 'Relaxamento e preparação para o sono',
    totalDuration: 1200, // 20 min
    phases: [
      {
        chakraId: 'crown',
        ambientVolumes: { singing_bowl: 0.6, bells: 0.5, wind: 0.3 },
        breathPatternId: 'calm',
        duration: 300,
        message: 'Abra a consciência. Observe seus pensamentos sem julgamento.',
        chakraVolume: 0.6,
      },
      {
        chakraId: 'thirdeye',
        ambientVolumes: { gong: 0.5, crickets: 0.4, leaves: 0.3 },
        breathPatternId: 'sleep',
        duration: 300,
        message: 'Acalme a mente. Visualize uma noite estrelada.',
        chakraVolume: 0.5,
      },
      {
        chakraId: 'heart',
        ambientVolumes: { ocean: 0.5, rain: 0.4, crickets: 0.5 },
        breathPatternId: 'sleep',
        duration: 300,
        message: 'Sinta gratidão. Envolva-se em paz e acolhimento.',
        chakraVolume: 0.5,
      },
      {
        chakraId: 'root',
        ambientVolumes: { ocean: 0.6, rain: 0.3, lava: 0.3, gong: 0.4 },
        breathPatternId: 'sleep',
        duration: 300,
        message: 'Entregue-se ao descanso. Você está seguro.',
        chakraVolume: 0.4,
      },
    ],
  },
  {
    id: 'energy-cleanse',
    name: 'Limpeza Energética',
    description: 'Percorra todos os 7 chakras em sequência ascendente para uma limpeza completa.',
    emoji: '🔥',
    indication: 'Equilíbrio e limpeza de todos os centros energéticos',
    totalDuration: 1680, // 28 min (4 min each)
    phases: [
      {
        chakraId: 'root',
        ambientVolumes: { fire: 0.5, lava: 0.4, thunder: 0.2 },
        breathPatternId: 'box',
        duration: 240,
        message: 'Raiz: Libere medos. Você está seguro e fundamentado.',
        chakraVolume: 0.7,
      },
      {
        chakraId: 'sacral',
        ambientVolumes: { water: 0.6, ocean: 0.4, waterfall: 0.3 },
        breathPatternId: 'calm',
        duration: 240,
        message: 'Sacral: Libere culpa. Permita-se fluir com prazer.',
        chakraVolume: 0.7,
      },
      {
        chakraId: 'solar',
        ambientVolumes: { fire: 0.6, wind: 0.4, waterfall: 0.3 },
        breathPatternId: 'box',
        duration: 240,
        message: 'Plexo Solar: Libere vergonha. Receba seu poder.',
        chakraVolume: 0.7,
      },
      {
        chakraId: 'heart',
        ambientVolumes: { forest: 0.5, birds: 0.5, bells: 0.4, water: 0.3 },
        breathPatternId: 'coherence',
        duration: 240,
        message: 'Coração: Libere mágoa. Abra-se ao amor incondicional.',
        chakraVolume: 0.7,
      },
      {
        chakraId: 'throat',
        ambientVolumes: { wind: 0.6, leaves: 0.4, singing_bowl: 0.5 },
        breathPatternId: 'calm',
        duration: 240,
        message: 'Garganta: Libere mentiras. Fale sua verdade.',
        chakraVolume: 0.7,
      },
      {
        chakraId: 'thirdeye',
        ambientVolumes: { bells: 0.6, gong: 0.5, crickets: 0.3 },
        breathPatternId: 'calm',
        duration: 240,
        message: 'Terceiro Olho: Libere ilusão. Veja com clareza.',
        chakraVolume: 0.7,
      },
      {
        chakraId: 'crown',
        ambientVolumes: { singing_bowl: 0.7, gong: 0.6, bells: 0.5, wind: 0.3 },
        breathPatternId: 'coherence',
        duration: 240,
        message: 'Coroa: Libere apego. Conecte-se ao infinito.',
        chakraVolume: 0.8,
      },
    ],
  },
];

export function getJourney(id: string): Journey | undefined {
  return JOURNEYS.find(j => j.id === id);
}

export function formatJourneyDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
}
