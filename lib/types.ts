export interface ChakraPalette {
  primary: string;
  secondary: string;
  accent: string;
  soft: string;
}

export interface Chakra {
  id: string;
  name: string;
  sanskrit?: string;
  frequency: number;
  hue: number;
  color: string;
  palette: ChakraPalette;
  theme?: 'earth' | 'water' | 'fire' | 'air' | 'ether' | 'light' | 'thought';
}

export interface SavedTemplate {
  id: number | string;
  name: string;
  chakraId: string;
  ambientVolumes: Record<string, number>;
  chakraVolume: number;
  isPreset?: boolean;
  objective?: string;
  description?: string;
}

export interface JourneyPhase {
  chakraId: string;
  ambientVolumes: Record<string, number>;
  breathPatternId?: string;
  duration: number; // seconds
  message: string;
  chakraVolume: number;
}

export interface ActiveJourney {
  journeyId: string;
  currentPhaseIndex: number;
  phaseTimeLeft: number; // seconds left in current phase
  totalPhasesCount: number;
}

export type BinauralState = 'off' | 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';

export interface AudioPlayerElement {
  id: string;
  name: string;
  url: string;
  icon?: any;
}


