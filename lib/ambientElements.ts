import {
  Wind,
  CloudRain,
  Bird,
  Bell,
  Waves,
  Flame,
  Trees,
  Zap,
  Cloud,
  Droplets,
  Music,
  Sparkles,
  LucideIcon,
} from 'lucide-react';

export interface AmbientElement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  url: string;
  category: 'water' | 'weather' | 'nature' | 'mystical' | 'elemental';
  frequency?: string; // Dominant frequency range
  chakraAffinity?: string[]; // Which chakras resonate with this sound
}

export const AMBIENT_ELEMENTS: AmbientElement[] = [
  // Water Category
  {
    id: 'water',
    name: 'Água do Rio',
    description: 'Fluxo suave e contínuo',
    icon: Waves,
    url: '/sounds/water/water.mp3',
    category: 'water',
    frequency: 'Low-Mid (100-500Hz)',
    chakraAffinity: ['root', 'sacral', 'heart'],
  },
  {
    id: 'ocean',
    name: 'Ondas do Oceano',
    description: 'Ritmo das marés',
    icon: Waves,
    url: '/sounds/water/ocean.mp3',
    category: 'water',
    frequency: 'Low (50-200Hz)',
    chakraAffinity: ['root', 'sacral'],
  },
  {
    id: 'waterfall',
    name: 'Cachoeira',
    description: 'Queda poderosa',
    icon: Droplets,
    url: '/sounds/water/waterfall.mp3',
    category: 'water',
    frequency: 'Mid-High (500-2000Hz)',
    chakraAffinity: ['solar', 'throat'],
  },

  // Weather Category
  {
    id: 'rain',
    name: 'Chuva Forte',
    description: 'Gotas ritmadas',
    icon: CloudRain,
    url: '/sounds/weather/rain.mp3',
    category: 'weather',
    frequency: 'Mid (300-1000Hz)',
    chakraAffinity: ['heart', 'throat', 'third_eye'],
  },
  {
    id: 'thunder',
    name: 'Trovão Distante',
    description: 'Ecos profundos',
    icon: Zap,
    url: '/sounds/weather/thunder.mp3',
    category: 'weather',
    frequency: 'Very Low (20-100Hz)',
    chakraAffinity: ['root', 'crown'],
  },
  {
    id: 'wind',
    name: 'Vento Suave',
    description: 'Brisa constante',
    icon: Wind,
    url: '/sounds/weather/wind.mp3',
    category: 'weather',
    frequency: 'High (2000-8000Hz)',
    chakraAffinity: ['throat', 'third_eye', 'crown'],
  },
  {
    id: 'storm',
    name: 'Tempestade',
    description: 'Energia bruta',
    icon: Cloud,
    url: '/sounds/weather/storm.mp3',
    category: 'weather',
    frequency: 'Full Spectrum (50-8000Hz)',
    chakraAffinity: ['root', 'solar', 'crown'],
  },

  // Nature Category
  {
    id: 'birds',
    name: 'Pássaros da Floresta',
    description: 'Canto matinal',
    icon: Bird,
    url: '/sounds/nature/birds.mp3',
    category: 'nature',
    frequency: 'High (1000-4000Hz)',
    chakraAffinity: ['heart', 'throat', 'third_eye'],
  },
  {
    id: 'forest',
    name: 'Floresta Tropical',
    description: 'Ambiente vivo',
    icon: Trees,
    url: '/sounds/nature/forest.mp3',
    category: 'nature',
    frequency: 'Mid (300-2000Hz)',
    chakraAffinity: ['heart', 'solar'],
  },
  {
    id: 'crickets',
    name: 'Grilos Noturnos',
    description: 'Ritmo da noite',
    icon: Music,
    url: '/sounds/nature/crickets.mp3',
    category: 'nature',
    frequency: 'High (3000-10000Hz)',
    chakraAffinity: ['third_eye', 'crown'],
  },
  {
    id: 'leaves',
    name: 'Folhas ao Vento',
    description: 'Sussurro delicado',
    icon: Wind,
    url: '/sounds/nature/leaves.mp3',
    category: 'nature',
    frequency: 'High (2000-6000Hz)',
    chakraAffinity: ['heart', 'throat'],
  },

  // Mystical Category
  {
    id: 'bells',
    name: 'Sinos Tibetanos',
    description: 'Harmônicas sagradas',
    icon: Bell,
    url: '/sounds/mystical/bells.mp3',
    category: 'mystical',
    frequency: 'Mid-High (500-2000Hz)',
    chakraAffinity: ['heart', 'third_eye', 'crown'],
  },
  {
    id: 'gong',
    name: 'Gongo Meditativo',
    description: 'Vibração cósmica',
    icon: Sparkles,
    url: '/sounds/mystical/gong.mp3',
    category: 'mystical',
    frequency: 'Full Spectrum (50-4000Hz)',
    chakraAffinity: ['root', 'crown'],
  },
  {
    id: 'singing_bowl',
    name: 'Tigela Cantante',
    description: 'Tones cristalinos',
    icon: Bell,
    url: '/sounds/mystical/singing_bowl.mp3',
    category: 'mystical',
    frequency: 'Mid (400-1500Hz)',
    chakraAffinity: ['heart', 'throat', 'third_eye'],
  },

  // Elemental Category
  {
    id: 'fire',
    name: 'Fogo Crepitante',
    description: 'Energia transformadora',
    icon: Flame,
    url: '/sounds/elemental/fire.mp3',
    category: 'elemental',
    frequency: 'Mid-High (800-3000Hz)',
    chakraAffinity: ['solar', 'root'],
  },
  {
    id: 'lava',
    name: 'Lava Fluindo',
    description: 'Força primordial',
    icon: Flame,
    url: '/sounds/elemental/lava.mp3',
    category: 'elemental',
    frequency: 'Low-Mid (100-800Hz)',
    chakraAffinity: ['root', 'solar'],
  },
];

export const AMBIENT_CATEGORIES = [
  { id: 'water', label: 'Água', icon: Waves },
  { id: 'weather', label: 'Clima', icon: Cloud },
  { id: 'nature', label: 'Natureza', icon: Trees },
  { id: 'mystical', label: 'Místico', icon: Sparkles },
  { id: 'elemental', label: 'Elemental', icon: Flame },
] as const;

export function getElementsByCategory(category: string): AmbientElement[] {
  return AMBIENT_ELEMENTS.filter((el) => el.category === category);
}

export function getElementsForChakra(chakraId: string): AmbientElement[] {
  return AMBIENT_ELEMENTS.filter((el) => el.chakraAffinity?.includes(chakraId));
}
