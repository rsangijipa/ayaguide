
"use client";

export const CHAKRA_FREQUENCIES: Record<string, number> = {
  root: 396,
  sacral: 417,
  solar: 528,
  heart: 639,
  throat: 741,
  third_eye: 852,
  crown: 963,
};

// Binaural beat frequency deltas for each brain state
export const BINAURAL_DELTAS: Record<string, { delta: number; baseFreq: number; label: string }> = {
  delta: { delta: 2, baseFreq: 100, label: 'Delta (0.5–4 Hz) — Sono Profundo' },
  theta: { delta: 6, baseFreq: 150, label: 'Theta (4–8 Hz) — Meditação' },
  alpha: { delta: 10, baseFreq: 200, label: 'Alpha (8–14 Hz) — Relaxamento' },
  beta:  { delta: 20, baseFreq: 250, label: 'Beta (14–30 Hz) — Foco' },
  gamma: { delta: 40, baseFreq: 300, label: 'Gamma (30–50 Hz) — Percepção' },
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private chakraGain: GainNode | null = null;
  private chakraOscs: OscillatorNode[] = [];
  private lfoOsc: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;
  private sources: Map<HTMLMediaElement, MediaElementAudioSourceNode> = new Map();
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private reverbNode: ConvolverNode | null = null;
  private isInitialized = false;

  // Binaural beat nodes
  private binauralOscL: OscillatorNode | null = null;
  private binauralOscR: OscillatorNode | null = null;
  private binauralGain: GainNode | null = null;
  private binauralPanL: StereoPannerNode | null = null;
  private binauralPanR: StereoPannerNode | null = null;
  private currentBinauralState: string = 'off';

  constructor() {
    if (typeof window !== 'undefined') {
      // AudioContext will be created on first user interaction
    }
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    this.analyser = this.ctx!.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.8;

    this.masterGain = this.ctx!.createGain();
    this.masterGain.gain.value = 0.7;
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx!.destination);

    this.chakraGain = this.ctx!.createGain();
    this.chakraGain.gain.value = 0;
    this.chakraGain.connect(this.masterGain);

    this.filterNode = this.ctx!.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 2000;
    this.filterNode.Q.value = 1;
    this.filterNode.connect(this.chakraGain);
    this.createReverb();

    // Auto-resume on visibility change (Tab switching / Phone sleep)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.resume();
        }
      });
    }

    this.isInitialized = true;
  }

  async createReverb() {
    if (!this.ctx) return;
    this.reverbNode = this.ctx.createConvolver();
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * 2;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    this.reverbNode.buffer = impulse;
    const reverbGain = this.ctx.createGain();
    reverbGain.gain.value = 0.2;
    this.reverbNode.connect(reverbGain);
    reverbGain.connect(this.masterGain!);
  }

  playChakra(chakraId: string, volume: number = 0.5) {
    if (!this.ctx) this.init();
    if (!this.ctx || !this.isInitialized) return;

    const baseFreq = CHAKRA_FREQUENCIES[chakraId] || 432;
    const now = this.ctx.currentTime;
    
    // If already playing this frequency, just adjust volume
    if (this.chakraOscs.length > 0 && this.chakraOscs[0].frequency.value === baseFreq) {
      this.setChakraVolume(volume);
      return;
    }

    // SMOOTH CROSSFADE: Fade out previous nodes gently
    const prevOscs = [...this.chakraOscs];
    if (this.lfoOsc) prevOscs.push(this.lfoOsc);
    
    this.chakraOscs = [];
    this.lfoOsc = null;

    if (prevOscs.length > 0) {
      const fadeOutTime = 0.4;
      // Quick but click-free ramp to zero
      this.chakraGain!.gain.linearRampToValueAtTime(0, now + 0.1);
      
      setTimeout(() => {
        prevOscs.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch {}
        });
      }, fadeOutTime * 1000);
    }

    // Create new nodes
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = baseFreq;

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = baseFreq * 2;

    const osc3 = this.ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = baseFreq * 3;

    this.lfoOsc = this.ctx.createOscillator();
    this.lfoOsc.type = 'sine';
    this.lfoOsc.frequency.value = 0.5 + Math.random() * 2;

    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.value = 5;
    this.lfoOsc.connect(this.lfoGain);
    this.lfoGain.connect(osc1.frequency);

    const g2 = this.ctx.createGain();
    g2.gain.value = 0.3;
    const g3 = this.ctx.createGain();
    g3.gain.value = 0.15;

    osc1.connect(this.filterNode!);
    osc2.connect(g2); g2.connect(this.filterNode!);
    osc3.connect(g3); g3.connect(this.filterNode!);

    [osc1, osc2, osc3, this.lfoOsc].forEach(o => o.start());
    this.chakraOscs = [osc1, osc2, osc3];

    // Fade in
    this.setChakraVolume(volume);
  }

  stopChakra(fadeTime: number = 0.5) {
    if (this.chakraGain && this.ctx) {
      this.chakraGain.gain.setTargetAtTime(0, this.ctx.currentTime, fadeTime / 4);
    }
    
    const oscs = [...this.chakraOscs];
    if (this.lfoOsc) oscs.push(this.lfoOsc);
    
    this.chakraOscs = [];
    this.lfoOsc = null;

    setTimeout(() => {
      oscs.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch {}
      });
    }, fadeTime * 1000);
  }

  setChakraVolume(vol: number) {
    if (this.chakraGain && this.ctx) {
      const targetVol = vol * 0.6;
      // 0.2s constant for smooth organic feel
      this.chakraGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.2);
    }
  }

  setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.15);
    }
  }

  setFilterFrequency(freq: number) {
    if (this.filterNode && this.ctx) {
      this.filterNode.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.3);
    }
  }

  connectMediaElement(el: HTMLMediaElement) {
    if (!this.ctx) this.init();
    if (!this.ctx || !this.masterGain) return;
    
    if (!this.sources.has(el)) {
      try {
        const source = this.ctx.createMediaElementSource(el);
        source.connect(this.masterGain);
        this.sources.set(el, source);
      } catch (e) {
        console.warn("Could not connect media element", e);
      }
    }
  }

  getFrequencyData(dataArray: Uint8Array) {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(dataArray as any);
    }
  }

  get context(): AudioContext | null {
    if (!this.ctx) this.init();
    return this.ctx;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ============ Binaural Beats ============

  playBinaural(stateId: string, volume: number = 0.5) {
    if (!this.ctx) this.init();
    if (!this.ctx || !this.masterGain) return;

    const config = BINAURAL_DELTAS[stateId];
    if (!config) { this.stopBinaural(); return; }

    if (this.currentBinauralState === stateId && this.binauralGain) {
      this.setBinauralVolume(volume);
      return;
    }

    this.stopBinaural(0.2);

    const { baseFreq, delta } = config;
    this.binauralGain = this.ctx.createGain();
    this.binauralGain.gain.value = 0;
    this.binauralGain.connect(this.masterGain);

    this.binauralOscL = this.ctx.createOscillator();
    this.binauralOscL.type = 'sine';
    this.binauralOscL.frequency.value = baseFreq;

    this.binauralOscR = this.ctx.createOscillator();
    this.binauralOscR.type = 'sine';
    this.binauralOscR.frequency.value = baseFreq + delta;

    this.binauralPanL = this.ctx.createStereoPanner();
    this.binauralPanL.pan.value = -1;
    this.binauralPanR = this.ctx.createStereoPanner();
    this.binauralPanR.pan.value = 1;

    this.binauralOscL.connect(this.binauralPanL);
    this.binauralPanL.connect(this.binauralGain);
    this.binauralOscR.connect(this.binauralPanR);
    this.binauralPanR.connect(this.binauralGain);

    this.binauralOscL.start();
    this.binauralOscR.start();
    this.currentBinauralState = stateId;

    this.setBinauralVolume(volume);
  }

  setBinauralVolume(vol: number) {
    if (this.binauralGain && this.ctx) {
      this.binauralGain.gain.linearRampToValueAtTime(vol * 0.4, this.ctx.currentTime + 0.1);
    }
  }

  stopBinaural(fadeTime: number = 0.5) {
    if (this.binauralGain && this.ctx) {
      this.binauralGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + (fadeTime / 2));
    }
    const nodes = [this.binauralOscL, this.binauralOscR, this.binauralPanL, this.binauralPanR, this.binauralGain];
    this.binauralOscL = null; this.binauralOscR = null; 
    this.binauralPanL = null; this.binauralPanR = null;
    this.binauralGain = null;
    this.currentBinauralState = 'off';

    setTimeout(() => {
      nodes.forEach(node => { if (node) try { (node as any).stop?.(); node.disconnect(); } catch {} });
    }, fadeTime * 1000);
  }

  /**
   * loadBuffer: Fetches and decodes audio into a high-performance Buffer.
   */
  async loadBuffer(url: string): Promise<AudioBuffer | null> {
    if (!this.ctx) this.init();
    if (!this.ctx) return null;
    if (this.audioBuffers.has(url)) return this.audioBuffers.get(url)!;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(url, audioBuffer);
      return audioBuffer;
    } catch (e) {
      console.warn(`Could not load audio buffer: ${url}`, e);
      return null;
    }
  }

  getBuffer(url: string): AudioBuffer | undefined {
    return this.audioBuffers.get(url);
  }

  createGain(): GainNode | null {
    if (!this.ctx || !this.masterGain) return null;
    const gainNode = this.ctx.createGain();
    gainNode.connect(this.masterGain);
    return gainNode;
  }

  /**
   * disconnectMediaElement: Prevents memory leaks by cleaning up 
   * MediaElementAudioSourceNode references when elements are no longer needed.
   */
  disconnectMediaElement(el: HTMLMediaElement) {
    const source = this.sources.get(el);
    if (source) {
      try {
        source.disconnect();
      } catch {}
      this.sources.delete(el);
    }
  }
}

// ─── Re-export new mixer as drop-in replacement ───────────────────────────────
// All existing imports of getAudioEngine from '@/lib/audio' now get the mixer.
export { getAudioMixer as getAudioEngine, BINAURAL_DELTAS as _BINAURAL_DELTAS } from './audioMixer';
