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

export interface SessionState {
  isPlaying: boolean;
  sessionDuration: number;
  timeLeft: number;
  activeChakra: Chakra | null;
  isChakraOn: boolean;
  chakraVolume: number;
  ambientVolumes: Record<string, number>;
  masterVolume: number;
  isMuted: boolean;
  hasStarted: boolean;
  isFullScreen: boolean;
  savedTemplates: SavedTemplate[];
  showTimerPicker: boolean;
  showSaveModal: boolean;
  breathingActive: boolean;
}
