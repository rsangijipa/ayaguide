"use client";

import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeLocalStorage } from './storage';
import { 
  Chakra, SavedTemplate, 
  BinauralState, ActiveJourney 
} from './types';
import { CHAKRAS } from './constants';

// --- SLICES TYPES ---

interface SessionSlice {
  isPlaying: boolean;
  timeLeft: number;
  sessionDuration: number;
  hasStarted: boolean;
  isFullScreen: boolean;
  togglePlay: () => void;
  setDuration: (mins: number) => void;
  tick: (timeLeft: number) => void;
  startExperience: () => void;
  toggleFullscreen: () => void;
  resetSession: () => void;
}

interface AudioSlice {
  activeChakra: Chakra;
  isChakraOn: boolean;
  chakraVolume: number;
  ambientVolumes: Record<string, number>;
  masterVolume: number;
  isMuted: boolean;
  binauralState: BinauralState;
  binauralVolume: number;
  setChakra: (chakra: Chakra) => void;
  toggleChakra: () => void;
  setChakraVolume: (vol: number) => void;
  setAmbientVolume: (id: string, volume: number) => void;
  setAmbientVolumesBulk: (vols: Record<string, number>) => void;
  setMasterVolume: (vol: number) => void;
  toggleMute: () => void;
  clearAllAmbients: () => void;
  setBinauralState: (state: BinauralState) => void;
  setBinauralVolume: (vol: number) => void;
}

interface UISlice {
  showTimerPicker: boolean;
  showSaveModal: boolean;
  breathingActive: boolean;
  breathingPatternId: string;
  showBreathingPicker: boolean;
  savedTemplates: SavedTemplate[];
  isSidebarExpanded: boolean;
  toggleTimerPicker: () => void;
  toggleSaveModal: () => void;
  toggleBreathingGuide: () => void;
  setBreathingPattern: (id: string) => void;
  toggleBreathingPicker: () => void;
  addSavedTemplate: (template: SavedTemplate) => void;
  removeSavedTemplate: (id: string) => void;
  setSavedTemplates: (templates: SavedTemplate[]) => void;
  loadTemplate: (template: SavedTemplate) => void;
  setSidebarExpanded: (expanded: boolean) => void;
}

interface JourneySlice {
  activeJourney: ActiveJourney | null;
  startJourney: (journey: ActiveJourney) => void;
  advanceJourneyPhase: (payload: { 
    phaseIndex: number; 
    chakra: Chakra; 
    ambientVolumes: Record<string, number>; 
    chakraVolume: number; 
    breathPatternId?: string; 
    phaseTimeLeft: number 
  }) => void;
  journeyPhaseTick: (timeLeft: number) => void;
  exitJourney: () => void;
}

// Complete Store Type
export type SessionStore = SessionSlice & AudioSlice & UISlice & JourneySlice;

// --- INITIAL STATES ---

const initialSessionState = {
  isPlaying: false,
  sessionDuration: 60,
  timeLeft: 3600,
  hasStarted: false,
  isFullScreen: false,
};

const initialAudioState = {
  activeChakra: (CHAKRAS as Chakra[])[3], // Heart
  isChakraOn: false,
  chakraVolume: 0.6,
  ambientVolumes: {} as Record<string, number>,
  masterVolume: 0.7,
  isMuted: false,
  binauralState: 'off' as BinauralState,
  binauralVolume: 0.5,
};

const initialUIState = {
  showTimerPicker: false,
  showSaveModal: false,
  breathingActive: false,
  breathingPatternId: 'calm',
  showBreathingPicker: false,
  savedTemplates: [] as SavedTemplate[],
  isSidebarExpanded: false,
};

// --- SLICE CREATORS ---

const createSessionSlice: StateCreator<SessionStore, [], [], SessionSlice> = (set) => ({
  ...initialSessionState,
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setDuration: (mins) => set(() => ({ 
    sessionDuration: mins,
    timeLeft: mins * 60,
    isPlaying: false
  })),
  tick: (timeLeft) => set(() => ({ timeLeft })),
  startExperience: () => set(() => ({ hasStarted: true, isPlaying: false })),
  toggleFullscreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),
  resetSession: () => set(() => ({
    ...initialSessionState,
    ...initialAudioState,
    ...initialUIState,
    activeJourney: null,
  })),
});

const createAudioSlice: StateCreator<SessionStore, [], [], AudioSlice> = (set) => ({
  ...initialAudioState,
  setChakra: (chakra) => set(() => ({ activeChakra: chakra })),
  toggleChakra: () => set((state) => ({ isChakraOn: !state.isChakraOn })),
  setChakraVolume: (vol) => set(() => ({ chakraVolume: vol })),
  setAmbientVolume: (id, volume) => set((state) => {
    const newVols = { ...state.ambientVolumes };
    if (volume <= 0) {
      delete newVols[id];
    } else {
      newVols[id] = volume;
    }
    return { ambientVolumes: newVols };
  }),
  setAmbientVolumesBulk: (vols) => set(() => ({ ambientVolumes: vols })),
  setMasterVolume: (vol) => set(() => ({ masterVolume: vol, isMuted: vol === 0 })),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  clearAllAmbients: () => set(() => ({ ambientVolumes: {}, isChakraOn: false })),
  setBinauralState: (bState) => set(() => ({ binauralState: bState })),
  setBinauralVolume: (vol) => set(() => ({ binauralVolume: vol })),
});

const createUISlice: StateCreator<SessionStore, [], [], UISlice> = (set) => ({
  ...initialUIState,
  toggleTimerPicker: () => set((state) => ({ showTimerPicker: !state.showTimerPicker })),
  toggleSaveModal: () => set((state) => ({ showSaveModal: !state.showSaveModal })),
  toggleBreathingGuide: () => set((state) => ({ breathingActive: !state.breathingActive })),
  setBreathingPattern: (id) => set(() => ({ breathingPatternId: id })),
  toggleBreathingPicker: () => set((state) => ({ showBreathingPicker: !state.showBreathingPicker })),
  addSavedTemplate: (template) => set((state) => ({ 
    savedTemplates: [...state.savedTemplates, template] 
  })),
  removeSavedTemplate: (id) => set((state) => ({ 
    savedTemplates: state.savedTemplates.filter(t => String(t.id) !== id) 
  })),
  setSavedTemplates: (templates) => set(() => ({ savedTemplates: templates })),
  loadTemplate: (template) => {
    const chakra = (CHAKRAS as Chakra[]).find(c => c.id === template.chakraId);
    set((state) => ({
      activeChakra: chakra || state.activeChakra,
      ambientVolumes: template.ambientVolumes,
      chakraVolume: template.chakraVolume,
      isChakraOn: true,
    }));
  },
  setSidebarExpanded: (expanded) => set(() => ({ isSidebarExpanded: expanded })),
});

const createJourneySlice: StateCreator<SessionStore, [], [], JourneySlice> = (set) => ({
  activeJourney: null,
  startJourney: (journey) => set(() => ({ activeJourney: journey })),
  advanceJourneyPhase: (payload) => set((state) => ({
    activeChakra: payload.chakra,
    ambientVolumes: payload.ambientVolumes,
    chakraVolume: payload.chakraVolume,
    isChakraOn: true,
    breathingPatternId: payload.breathPatternId || state.breathingPatternId,
    activeJourney: state.activeJourney ? {
      ...state.activeJourney,
      currentPhaseIndex: payload.phaseIndex,
      phaseTimeLeft: payload.phaseTimeLeft,
    } : null,
  })),
  journeyPhaseTick: (timeLeft) => set((state) => ({
    activeJourney: state.activeJourney ? {
      ...state.activeJourney,
      phaseTimeLeft: timeLeft,
    } : null,
  })),
  exitJourney: () => set(() => ({ activeJourney: null })),
});

// --- COMBINED STORE WITH PERSISTENCE ---

export const useSessionStore = create<SessionStore>()(
  persist(
    (...a) => ({
      ...createSessionSlice(...a),
      ...createAudioSlice(...a),
      ...createUISlice(...a),
      ...createJourneySlice(...a),
    }),
    {
      name: 'ayaguide-session-store',
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        savedTemplates: state.savedTemplates,
        masterVolume: state.masterVolume,
        chakraVolume: state.chakraVolume,
        isMuted: state.isMuted,
        binauralVolume: state.binauralVolume,
        breathingPatternId: state.breathingPatternId,
        isSidebarExpanded: state.isSidebarExpanded,
      }),
    }
  )
);
