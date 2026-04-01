'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Chakra, SavedTemplate, SessionState } from './types';
import { CHAKRAS } from './constants';

export type SessionAction =
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'TICK'; payload: number }
  | { type: 'SET_CHAKRA'; payload: Chakra }
  | { type: 'TOGGLE_CHAKRA' }
  | { type: 'SET_CHAKRA_VOLUME'; payload: number }
  | { type: 'SET_AMBIENT_VOLUME'; payload: { id: string; volume: number } }
  | { type: 'SET_MASTER_VOLUME'; payload: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'START_EXPERIENCE' }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'ADD_SAVED_TEMPLATE'; payload: SavedTemplate }
  | { type: 'REMOVE_SAVED_TEMPLATE'; payload: string }
  | { type: 'LOAD_TEMPLATE'; payload: SavedTemplate }
  | { type: 'SET_SAVED_TEMPLATES'; payload: SavedTemplate[] }
  | { type: 'TOGGLE_TIMER_PICKER' }
  | { type: 'TOGGLE_SAVE_MODAL' }
  | { type: 'TOGGLE_BREATHING_GUIDE' }
  | { type: 'CLEAR_ALL_AMBIENTS' };

const initialState: SessionState = {
  isPlaying: false,
  sessionDuration: 60, // minutes
  timeLeft: 3600, // seconds
  activeChakra: (CHAKRAS as Chakra[])[3], // Heart by default
  isChakraOn: true,
  chakraVolume: 0.6,
  ambientVolumes: {},
  masterVolume: 0.7,
  isMuted: false,
  hasStarted: false,
  isFullScreen: false,
  savedTemplates: [],
  showTimerPicker: false,
  showSaveModal: false,
  breathingActive: false,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_DURATION':
      return { 
        ...state, 
        sessionDuration: action.payload,
        timeLeft: action.payload * 60,
        isPlaying: false
      };
    case 'TICK':
      return { ...state, timeLeft: action.payload };
    case 'SET_CHAKRA':
      return { ...state, activeChakra: action.payload };
    case 'TOGGLE_CHAKRA':
      return { ...state, isChakraOn: !state.isChakraOn };
    case 'SET_CHAKRA_VOLUME':
      return { ...state, chakraVolume: action.payload };
    case 'SET_AMBIENT_VOLUME': {
      const { id, volume } = action.payload;
      const newVols = { ...state.ambientVolumes };
      if (volume <= 0) {
        delete newVols[id];
      } else {
        newVols[id] = volume;
      }
      return { ...state, ambientVolumes: newVols };
    }
    case 'SET_MASTER_VOLUME':
      return { ...state, masterVolume: action.payload, isMuted: action.payload === 0 };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'START_EXPERIENCE':
      return { ...state, hasStarted: true, isPlaying: true };
    case 'TOGGLE_FULLSCREEN':
      return { ...state, isFullScreen: !state.isFullScreen };
    case 'ADD_SAVED_TEMPLATE':
      return { ...state, savedTemplates: [...state.savedTemplates, action.payload] };
    case 'REMOVE_SAVED_TEMPLATE':
      return { 
        ...state, 
        savedTemplates: state.savedTemplates.filter(t => String(t.id) !== action.payload) 
      };
    case 'LOAD_TEMPLATE': {
      const { chakraId, ambientVolumes, chakraVolume } = action.payload;
      const chakra = (CHAKRAS as Chakra[]).find(c => c.id === chakraId);
      return {
        ...state,
        activeChakra: chakra || state.activeChakra,
        ambientVolumes,
        chakraVolume: chakraVolume,
        isChakraOn: true,
      };
    }
    case 'SET_SAVED_TEMPLATES':
      return { ...state, savedTemplates: action.payload };
    case 'TOGGLE_TIMER_PICKER':
      return { ...state, showTimerPicker: !state.showTimerPicker };
    case 'TOGGLE_SAVE_MODAL':
      return { ...state, showSaveModal: !state.showSaveModal };
    case 'TOGGLE_BREATHING_GUIDE':
      return { ...state, breathingActive: !state.breathingActive };
    case 'CLEAR_ALL_AMBIENTS':
      return { ...state, ambientVolumes: {}, isChakraOn: false };
    default:
      return state;
  }
}

const SessionContext = createContext<{
  state: SessionState;
  dispatch: React.Dispatch<SessionAction>;
} | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ayaguide_templates');
      if (saved) {
        dispatch({ type: 'SET_SAVED_TEMPLATES', payload: JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Failed to load templates:', e);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    try {
      if (state.savedTemplates.length > 0) {
        localStorage.setItem('ayaguide_templates', JSON.stringify(state.savedTemplates));
      }
    } catch (e) {
      console.error('Failed to save templates:', e);
    }
  }, [state.savedTemplates]);

  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
