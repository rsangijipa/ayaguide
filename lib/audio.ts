
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
  private chakraOsc: OscillatorNode | null = null;
  private chakraOsc2: OscillatorNode | null = null;
  private chakraOsc3: OscillatorNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;
  private sources: Map<HTMLMediaElement, MediaElementAudioSourceNode> = new Map();
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

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.8;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.7;
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.chakraGain = this.ctx.createGain();
    this.chakraGain.gain.value = 0;
    this.chakraGain.connect(this.masterGain);

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 2000;
    this.filterNode.Q.value = 1;
    this.filterNode.connect(this.chakraGain);

    this.createReverb();
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
    if (!this.ctx) return;

    const baseFreq = CHAKRA_FREQUENCIES[chakraId] || 432;
    
    // If already playing the same chakra, just update volume
    if (this.chakraOsc && this.chakraOsc.frequency.value === baseFreq) {
      this.setChakraVolume(volume);
      return;
    }

    this.stopChakra(0.1); // Quick fade out before switching

    this.chakraOsc = this.ctx.createOscillator();
    this.chakraOsc.type = 'sine';
    this.chakraOsc.frequency.value = baseFreq;

    this.chakraOsc2 = this.ctx.createOscillator();
    this.chakraOsc2.type = 'triangle';
    this.chakraOsc2.frequency.value = baseFreq * 2;

    this.chakraOsc3 = this.ctx.createOscillator();
    this.chakraOsc3.type = 'sine';
    this.chakraOsc3.frequency.value = baseFreq * 3;

    this.lfoOsc = this.ctx.createOscillator();
    this.lfoOsc.type = 'sine';
    this.lfoOsc.frequency.value = 0.5 + Math.random() * 2;

    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.value = 5;
    this.lfoOsc.connect(this.lfoGain);
    this.lfoGain.connect(this.chakraOsc.frequency);

    const gain2 = this.ctx.createGain();
    gain2.gain.value = 0.3;
    const gain3 = this.ctx.createGain();
    gain3.gain.value = 0.15;

    this.chakraOsc.connect(this.filterNode!);
    this.chakraOsc2.connect(gain2);
    gain2.connect(this.filterNode!);
    this.chakraOsc3.connect(gain3);
    gain3.connect(this.filterNode!);

    this.chakraOsc.start();
    this.chakraOsc2.start();
    this.chakraOsc3.start();
    this.lfoOsc.start();

    this.setChakraVolume(volume);
  }

  stopChakra(fadeTime: number = 0.5) {
    if (this.chakraGain && this.ctx) {
      this.chakraGain.gain.setTargetAtTime(0, this.ctx.currentTime, fadeTime / 3);
    }
    
    const oscs = [this.chakraOsc, this.chakraOsc2, this.chakraOsc3, this.lfoOsc];
    this.chakraOsc = null;
    this.chakraOsc2 = null;
    this.chakraOsc3 = null;
    this.lfoOsc = null;

    setTimeout(() => {
      oscs.forEach(osc => {
        if (osc) {
          try { osc.stop(); } catch {}
          osc.disconnect();
        }
      });
    }, fadeTime * 1000);
  }

  setChakraVolume(vol: number) {
    if (this.chakraGain && this.ctx) {
      // Use linearRampToValueAtTime for more predictable volume changes
      const targetVol = vol * 0.6;
      this.chakraGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.1);
    }
  }

  setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }
  }

  setFilterFrequency(freq: number) {
    if (this.filterNode && this.ctx) {
      this.filterNode.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
    }
  }

  connectMediaElement(el: HTMLMediaElement) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    
    if (!this.sources.has(el)) {
      try {
        const source = this.ctx.createMediaElementSource(el);
        source.connect(this.masterGain!);
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

    // If same state, just update volume
    if (this.currentBinauralState === stateId && this.binauralGain) {
      this.setBinauralVolume(volume);
      return;
    }

    // Stop existing
    this.stopBinaural(0.1);

    const baseFreq = config.baseFreq;
    const delta = config.delta;

    // Shared gain
    this.binauralGain = this.ctx.createGain();
    this.binauralGain.gain.value = 0;
    this.binauralGain.connect(this.masterGain);

    // Left oscillator: base frequency
    this.binauralOscL = this.ctx.createOscillator();
    this.binauralOscL.type = 'sine';
    this.binauralOscL.frequency.value = baseFreq;

    this.binauralPanL = this.ctx.createStereoPanner();
    this.binauralPanL.pan.value = -1;
    this.binauralOscL.connect(this.binauralPanL);
    this.binauralPanL.connect(this.binauralGain);

    // Right oscillator: base + delta
    this.binauralOscR = this.ctx.createOscillator();
    this.binauralOscR.type = 'sine';
    this.binauralOscR.frequency.value = baseFreq + delta;

    this.binauralPanR = this.ctx.createStereoPanner();
    this.binauralPanR.pan.value = 1;
    this.binauralOscR.connect(this.binauralPanR);
    this.binauralPanR.connect(this.binauralGain);

    this.binauralOscL.start();
    this.binauralOscR.start();

    // Fade in
    this.binauralGain.gain.setTargetAtTime(volume * 0.7, this.ctx.currentTime, 0.3);
    this.currentBinauralState = stateId;
  }

  stopBinaural(fadeTime: number = 0.5) {
    if (this.binauralGain && this.ctx) {
      this.binauralGain.gain.setTargetAtTime(0, this.ctx.currentTime, fadeTime / 3);
    }

    const oscs = [this.binauralOscL, this.binauralOscR];
    const panners = [this.binauralPanL, this.binauralPanR];
    this.binauralOscL = null;
    this.binauralOscR = null;
    this.binauralPanL = null;
    this.binauralPanR = null;
    this.currentBinauralState = 'off';

    setTimeout(() => {
      oscs.forEach(osc => {
        if (osc) { try { osc.stop(); } catch {} osc.disconnect(); }
      });
      panners.forEach(p => { if (p) p.disconnect(); });
      if (this.binauralGain) { this.binauralGain.disconnect(); this.binauralGain = null; }
    }, fadeTime * 1000);
  }

  setBinauralVolume(vol: number) {
    if (this.binauralGain && this.ctx) {
      this.binauralGain.gain.setTargetAtTime(vol * 0.7, this.ctx.currentTime, 0.1);
    }
  }

  getBinauralState(): string {
    return this.currentBinauralState;
  }
}

let instance: AudioEngine | null = null;
export const getAudioEngine = () => {
  if (typeof window === 'undefined') return null;
  if (!instance) {
    instance = new AudioEngine();
  }
  return instance;
};
