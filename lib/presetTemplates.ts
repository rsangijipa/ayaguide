/**
 * Preset Templates para AyaGuide
 * 5 templates pré-definidos com objetivos distintos
 * Cada template combina um chakra específico com elementos naturais em volumes otimizados
 */

export interface PresetTemplate {
  id: string;
  name: string;
  objective: string;
  description: string;
  emoji: string;
  chakraId: string;
  chakraVolume: number;
  ambientVolumes: Record<string, number>;
  isPreset: true;
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'anxiety-relief',
    name: 'Alívio da Ansiedade',
    objective: 'Acalmar a mente e reduzir palpitações',
    description: 'Combina o chakra cardíaco com sons aquáticos suaves para trazer paz e estabilidade emocional.',
    emoji: '💚',
    chakraId: 'heart',
    chakraVolume: 0.6,
    ambientVolumes: {
      water: 0.5,
      ocean: 0.4,
      waterfall: 0.0,
      rain: 0.0,
      thunder: 0.0,
      wind: 0.3,
      storm: 0.0,
      birds: 0.0,
      forest: 0.4,
      crickets: 0.0,
      leaves: 0.3,
      bells: 0.5,
      gong: 0.0,
      singing_bowl: 0.6,
      fire: 0.0,
      lava: 0.0,
    },
    isPreset: true,
  },
  {
    id: 'deep-focus',
    name: 'Foco Profundo',
    objective: 'Aumentar concentração e produtividade mental',
    description: 'Chakra do plexo solar com sons que estimulam a clareza mental e o foco. Perfeito para trabalho criativo.',
    emoji: '🎯',
    chakraId: 'solar',
    chakraVolume: 0.7,
    ambientVolumes: {
      water: 0.3,
      ocean: 0.0,
      waterfall: 0.4,
      rain: 0.4,
      thunder: 0.0,
      wind: 0.5,
      storm: 0.0,
      birds: 0.5,
      forest: 0.3,
      crickets: 0.0,
      leaves: 0.0,
      bells: 0.4,
      gong: 0.0,
      singing_bowl: 0.3,
      fire: 0.5,
      lava: 0.0,
    },
    isPreset: true,
  },
  {
    id: 'deep-meditation',
    name: 'Meditação Profunda',
    objective: 'Alcançar estados contemplativos e espirituais',
    description: 'Chakra da coroa com harmônicas cósmicas. Ideal para práticas meditativas e conexão espiritual.',
    emoji: '🧘',
    chakraId: 'crown',
    chakraVolume: 0.8,
    ambientVolumes: {
      water: 0.2,
      ocean: 0.0,
      waterfall: 0.0,
      rain: 0.0,
      thunder: 0.0,
      wind: 0.6,
      storm: 0.0,
      birds: 0.0,
      forest: 0.0,
      crickets: 0.5,
      leaves: 0.4,
      bells: 0.7,
      gong: 0.8,
      singing_bowl: 0.7,
      fire: 0.0,
      lava: 0.0,
    },
    isPreset: true,
  },
  {
    id: 'restful-sleep',
    name: 'Sono Restaurador',
    objective: 'Induzir sono profundo e restaurador',
    description: 'Chakra raiz com sons baixos e ritmados. Perfeito para adormecer e descanso profundo.',
    emoji: '😴',
    chakraId: 'root',
    chakraVolume: 0.5,
    ambientVolumes: {
      water: 0.4,
      ocean: 0.6,
      waterfall: 0.0,
      rain: 0.5,
      thunder: 0.2,
      wind: 0.0,
      storm: 0.0,
      birds: 0.0,
      forest: 0.0,
      crickets: 0.6,
      leaves: 0.0,
      bells: 0.0,
      gong: 0.5,
      singing_bowl: 0.0,
      fire: 0.0,
      lava: 0.4,
    },
    isPreset: true,
  },
  {
    id: 'creative-flow',
    name: 'Fluxo Criativo',
    objective: 'Desbloquear criatividade e inspiração',
    description: 'Chakra sacral com sons dinâmicos e inspiradores. Ideal para artistas e criadores.',
    emoji: '🎨',
    chakraId: 'sacral',
    chakraVolume: 0.7,
    ambientVolumes: {
      water: 0.6,
      ocean: 0.3,
      waterfall: 0.5,
      rain: 0.3,
      thunder: 0.0,
      wind: 0.4,
      storm: 0.0,
      birds: 0.6,
      forest: 0.5,
      crickets: 0.0,
      leaves: 0.3,
      bells: 0.4,
      gong: 0.0,
      singing_bowl: 0.5,
      fire: 0.4,
      lava: 0.0,
    },
    isPreset: true,
  },
];

export function getPresetTemplate(id: string): PresetTemplate | undefined {
  return PRESET_TEMPLATES.find(t => t.id === id);
}

export function getAllPresetTemplates(): PresetTemplate[] {
  return PRESET_TEMPLATES;
}

export function presetToSavedTemplate(preset: PresetTemplate) {
  return {
    id: `preset-${preset.id}`,
    name: `${preset.emoji} ${preset.name}`,
    chakraId: preset.chakraId,
    ambientVolumes: preset.ambientVolumes,
    chakraVolume: preset.chakraVolume,
    isPreset: true,
    objective: preset.objective,
    description: preset.description,
  };
}

export const PRESET_TEMPLATES_INFO = {
  'anxiety-relief': {
    name: 'Alívio da Ansiedade',
    icon: '💚',
    chakra: 'Coração (Anahata)',
    frequency: '639 Hz',
    bestFor: 'Reduzir ansiedade, palpitações e tensão emocional',
    keyElements: ['Água do Rio', 'Vento Suave', 'Floresta Tropical', 'Tigela Cantante'],
  },
  'deep-focus': {
    name: 'Foco Profundo',
    icon: '🎯',
    chakra: 'Plexo Solar (Manipura)',
    frequency: '528 Hz',
    bestFor: 'Aumentar concentração, produtividade e clareza mental',
    keyElements: ['Cachoeira', 'Chuva Forte', 'Vento Suave', 'Pássaros da Floresta', 'Fogo Crepitante'],
  },
  'deep-meditation': {
    name: 'Meditação Profunda',
    icon: '🧘',
    chakra: 'Coroa (Sahasrara)',
    frequency: '963 Hz',
    bestFor: 'Meditação profunda, conexão espiritual e transcendência',
    keyElements: ['Vento Suave', 'Grilos Noturnos', 'Folhas ao Vento', 'Sinos Tibetanos', 'Gongo Meditativo', 'Tigela Cantante'],
  },
  'restful-sleep': {
    name: 'Sono Restaurador',
    icon: '😴',
    chakra: 'Raiz (Muladhara)',
    frequency: '396 Hz',
    bestFor: 'Adormecer, sono profundo e descanso restaurador',
    keyElements: ['Ondas do Oceano', 'Chuva Forte', 'Grilos Noturnos', 'Gongo Meditativo', 'Lava Fluindo'],
  },
  'creative-flow': {
    name: 'Fluxo Criativo',
    icon: '🎨',
    chakra: 'Sacral (Svadhisthana)',
    frequency: '417 Hz',
    bestFor: 'Desbloquear criatividade, inspiração e expressão artística',
    keyElements: ['Água do Rio', 'Cachoeira', 'Pássaros da Floresta', 'Floresta Tropical', 'Sinos Tibetanos', 'Tigela Cantante'],
  },
};
