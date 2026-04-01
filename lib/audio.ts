"use client";

// Legacy compatibility shim.
// New code should import directly from '@/lib/audioMixer'.
export {
  getAudioMixer as getAudioEngine,
  getAudioMixer,
  BINAURAL_DELTAS,
  CHAKRA_FREQUENCIES,
} from './audioMixer';
