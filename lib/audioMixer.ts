/**
 * AudioMixer.ts
 * Motor de mixagem centralizado para o AyaGuide.
 *
 * Arquitetura:
 *   AudioBufferSourceNode (loop=true) → GainNode (per-channel) → masterGain → analyser → destination
 *
 * Vantagens:
 *   - Um único AudioContext compartilhado → sem limite de canais simultâneos
 *   - Cada canal tem GainNode próprio → controle de volume independente
 *   - Sem HTMLAudioElement → sem AbortError, sem exclusividade do browser
 *   - Buffers cacheados → segundo play é instantâneo
 */

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

export const BINAURAL_DELTAS: Record<string, { delta: number; baseFreq: number; label: string }> = {
  delta: { delta: 2,  baseFreq: 100, label: 'Delta (0.5–4 Hz) — Sono Profundo' },
  theta: { delta: 6,  baseFreq: 150, label: 'Theta (4–8 Hz) — Meditação' },
  alpha: { delta: 10, baseFreq: 200, label: 'Alpha (8–14 Hz) — Relaxamento' },
  beta:  { delta: 20, baseFreq: 250, label: 'Beta (14–30 Hz) — Foco' },
  gamma: { delta: 40, baseFreq: 300, label: 'Gamma (30–50 Hz) — Percepção' },
};

// ─── Channel State ────────────────────────────────────────────────────────────

interface Channel {
  buffer: AudioBuffer;
  gainNode: GainNode;
  pannerNode: StereoPannerNode;
  source: AudioBufferSourceNode | null;
  /** wall-clock offset to resume from (seconds within buffer) */
  pauseOffset: number;
  /** performance.now() when play started (for tracking offset on pause) */
  playedAt: number;
  playing: boolean;
  targetVolume: number;
  /** for dynamic panning animation */
  panDirection: number;
}

// ─── AudioMixer ───────────────────────────────────────────────────────────────

class AudioMixer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Ambient channels
  private channels: Map<string, Channel> = new Map();
  // In-flight buffer loads (avoid duplicate fetches)
  private loading: Map<string, Promise<AudioBuffer | null>> = new Map();

  // Chakra oscillators
  private chakraGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private chakraOscs: OscillatorNode[] = [];
  private lfoOsc: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  // Binaural
  private binauralGain: GainNode | null = null;
  private binauralOscL: OscillatorNode | null = null;
  private binauralOscR: OscillatorNode | null = null;
  private binauralPanL: StereoPannerNode | null = null;
  private binauralPanR: StereoPannerNode | null = null;
  private currentBinauralState: string = 'off';

  private globalFilter: BiquadFilterNode | null = null;
  private panTimer: number | null = null;

  private initialized = false;

  // ── Init ────────────────────────────────────────────────────────────────────

  init(): void {
    if (this.initialized || typeof window === 'undefined') return;

    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AC() as AudioContext;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.8;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.8;
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.globalFilter = this.ctx.createBiquadFilter();
    this.globalFilter.type = 'lowpass';
    this.globalFilter.frequency.value = 20000; // Open by default
    this.globalFilter.connect(this.masterGain);

    this.chakraGain = this.ctx.createGain();
    this.chakraGain.gain.value = 0;
    this.chakraGain.connect(this.globalFilter);

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 2000;
    this.filterNode.Q.value = 1;
    this.filterNode.connect(this.chakraGain);

    this._createReverb();

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') this.resume();
      });
    }

    this.initialized = true;
    this._startPanningAnimation();
  }

  private async _createReverb(): Promise<void> {
    if (!this.ctx || !this.masterGain) return;
    const conv = this.ctx.createConvolver();
    const sr = this.ctx.sampleRate;
    const len = sr * 2;
    const buf = this.ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    }
    conv.buffer = buf;
    const rg = this.ctx.createGain();
    rg.gain.value = 0.15;
    conv.connect(rg);
    rg.connect(this.masterGain);
  }

  // ── Context helpers ─────────────────────────────────────────────────────────

  resume(): void {
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  get context(): AudioContext | null {
    if (!this.ctx) this.init();
    return this.ctx;
  }

  // ── Buffer loading ──────────────────────────────────────────────────────────

  private async _fetchBuffer(url: string): Promise<AudioBuffer | null> {
    if (!this.ctx) this.init();
    if (!this.ctx) return null;

    try {
      const res = await fetch(url);
      const arr = await res.arrayBuffer();
      return await this.ctx.decodeAudioData(arr);
    } catch (e) {
      console.warn('[AudioMixer] Could not load buffer:', url, e);
      return null;
    }
  }

  async loadBuffer(url: string): Promise<AudioBuffer | null> {
    // Check if already loaded in any channel
    for (const ch of this.channels.values()) {
      // We cache on channels map by url — also check the loading map
    }
    if (this.loading.has(url)) return this.loading.get(url)!;
    const p = this._fetchBuffer(url);
    this.loading.set(url, p);
    const buf = await p;
    this.loading.delete(url);
    return buf;
  }

  getBuffer(url: string): AudioBuffer | undefined {
    const ch = this.channels.get(url);
    return ch?.buffer;
  }

  // ── Per-channel Gain (used by chakra/binaural, kept for compat) ──────────────

  createGain(): GainNode | null {
    if (!this.ctx || !this.masterGain) return null;
    const g = this.ctx.createGain();
    g.connect(this.masterGain);
    return g;
  }

  // ── Ambient Sound Layer API ─────────────────────────────────────────────────

  /**
   * Set the volume of a channel. If volume > 0 and buffer not yet loaded, 
   * fetch it then start if globally playing. If volume === 0, stop the channel.
   */
  async setChannelVolume(url: string, volume: number, globallyPlaying: boolean): Promise<void> {
    if (!this.ctx) this.init();
    if (!this.ctx || !this.masterGain) return;

    if (volume <= 0) {
      this._stopChannel(url);
      return;
    }

    let ch = this.channels.get(url);

    if (!ch) {
      // Need to load buffer first
      const buffer = await this.loadBuffer(url);
      if (!buffer) return;

      const gainNode = this.ctx.createGain();
      gainNode.gain.value = 0;
      
      const pannerNode = this.ctx.createStereoPanner();
      // Start with a random pan for variety
      pannerNode.pan.value = (Math.random() * 2 - 1) * 0.6;
      
      gainNode.connect(pannerNode);
      pannerNode.connect(this.globalFilter!);

      ch = { 
        buffer, gainNode, pannerNode, source: null, 
        pauseOffset: 0, playedAt: 0, playing: false, 
        targetVolume: volume,
        panDirection: Math.random() > 0.5 ? 1 : -1
      };
      this.channels.set(url, ch);
    }

    ch.targetVolume = volume;
    ch.gainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);

    if (globallyPlaying && !ch.playing) {
      this._startChannel(ch);
    }
  }

  /**
   * Resume all channels that have a buffer loaded and targetVolume > 0.
   */
  resumeAll(): void {
    this.resume();
    for (const ch of this.channels.values()) {
      if (ch.targetVolume > 0 && !ch.playing) {
        this._startChannel(ch);
      }
    }
  }

  /**
   * Pause all playing channels (remembers offset for clean resume).
   */
  pauseAll(): void {
    for (const [, ch] of this.channels) {
      if (ch.playing) this._pauseChannel(ch);
    }
  }

  /**
   * Stop all channels completely (resets offsets).
   */
  stopAll(): void {
    for (const [url] of this.channels) {
      this._stopChannel(url);
    }
    this.channels.clear();
    this.loading.clear();
    if (this.panTimer) {
      window.clearInterval(this.panTimer);
      this.panTimer = null;
    }
  }

  // ── Internal channel control ────────────────────────────────────────────────

  private _startChannel(ch: Channel): void {
    if (ch.playing || !this.ctx) return;

    const src = this.ctx.createBufferSource();
    src.buffer = ch.buffer;
    src.loop = true;
    src.connect(ch.gainNode);

    const offset = ch.pauseOffset % ch.buffer.duration;
    src.start(0, offset);

    ch.source = src;
    ch.playing = true;
    ch.playedAt = this.ctx.currentTime - offset;
  }

  private _pauseChannel(ch: Channel): void {
    if (!ch.playing || !this.ctx) return;

    // Save offset for resume
    ch.pauseOffset = (this.ctx.currentTime - ch.playedAt) % ch.buffer.duration;

    try {
      ch.source?.stop();
      ch.source?.disconnect();
    } catch {}
    ch.source = null;
    ch.playing = false;
  }

  private _stopChannel(url: string): void {
    const ch = this.channels.get(url);
    if (!ch) return;
    try {
      ch.source?.stop();
      ch.source?.disconnect();
    } catch {}
    ch.gainNode.disconnect();
    ch.pannerNode.disconnect();
    this.channels.delete(url);
  }

  // ── Panning & Focus ─────────────────────────────────────────────────────────

  private _startPanningAnimation(): void {
    if (this.panTimer) return;
    
    this.panTimer = window.setInterval(() => {
      const now = this.ctx?.currentTime || 0;
      for (const ch of this.channels.values()) {
        if (!ch.playing) continue;

        // Subtly shift pan
        let newPan = ch.pannerNode.pan.value + (0.01 * ch.panDirection);
        
        // Bounce at limits
        if (Math.abs(newPan) > 0.7) {
          ch.panDirection *= -1;
          newPan = ch.pannerNode.pan.value + (0.01 * ch.panDirection);
        }
        
        ch.pannerNode.pan.setTargetAtTime(newPan, now, 0.5);
      }
    }, 2000);
  }

  /**
   * Set Focus level (0 = original sound, 1 = muffled/underwater)
   */
  setFocus(value: number): void {
    if (!this.globalFilter || !this.ctx) return;
    // Map 0..1 to 20000Hz..400Hz (logarithmic-ish)
    const freq = 20000 * Math.pow(0.02, value);
    this.globalFilter.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.2);
  }

  // ── Analyser ────────────────────────────────────────────────────────────────

  getFrequencyData(dataArray: Uint8Array): void {
    this.analyser?.getByteFrequencyData(dataArray as any);
  }

  // ── Master Volume ────────────────────────────────────────────────────────────

  setMasterVolume(vol: number): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.15);
    }
  }

  // ── Chakra Synth ─────────────────────────────────────────────────────────────

  playChakra(chakraId: string): void {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const baseFreq = CHAKRA_FREQUENCIES[chakraId] || 432;
    const now = this.ctx.currentTime;

    if (this.chakraOscs.length > 0 && this.chakraOscs[0].frequency.value === baseFreq) return;

    const prev = [...this.chakraOscs];
    if (this.lfoOsc) prev.push(this.lfoOsc);
    this.chakraOscs = [];
    this.lfoOsc = null;

    if (prev.length > 0) {
      this.chakraGain!.gain.linearRampToValueAtTime(0, now + 0.1);
      setTimeout(() => prev.forEach(o => { try { o.stop(); o.disconnect(); } catch {} }), 400);
    }

    const osc1 = this.ctx.createOscillator(); osc1.type = 'sine'; osc1.frequency.value = baseFreq;
    const osc2 = this.ctx.createOscillator(); osc2.type = 'triangle'; osc2.frequency.value = baseFreq * 2;
    const osc3 = this.ctx.createOscillator(); osc3.type = 'sine'; osc3.frequency.value = baseFreq * 3;

    this.lfoOsc = this.ctx.createOscillator(); this.lfoOsc.type = 'sine'; this.lfoOsc.frequency.value = 0.5 + Math.random() * 2;
    this.lfoGain = this.ctx.createGain(); this.lfoGain.gain.value = 5;
    this.lfoOsc.connect(this.lfoGain); this.lfoGain.connect(osc1.frequency);

    const g2 = this.ctx.createGain(); g2.gain.value = 0.3;
    const g3 = this.ctx.createGain(); g3.gain.value = 0.15;

    osc1.connect(this.filterNode!);
    osc2.connect(g2); g2.connect(this.filterNode!);
    osc3.connect(g3); g3.connect(this.filterNode!);

    [osc1, osc2, osc3, this.lfoOsc].forEach(o => o.start());
    this.chakraOscs = [osc1, osc2, osc3];
  }

  stopChakra(): void {
    if (this.chakraGain && this.ctx) {
      this.chakraGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
    const oscs = [...this.chakraOscs];
    if (this.lfoOsc) oscs.push(this.lfoOsc);
    this.chakraOscs = []; this.lfoOsc = null;
    setTimeout(() => oscs.forEach(o => { try { o.stop(); o.disconnect(); } catch {} }), 500);
  }

  setChakraVolume(vol: number): void {
    if (this.chakraGain && this.ctx) {
      this.chakraGain.gain.setTargetAtTime(vol * 0.6, this.ctx.currentTime, 0.2);
    }
  }

  // ── Binaural Beats ────────────────────────────────────────────────────────────

  playBinaural(stateId: string, volume: number): void {
    if (!this.ctx) this.init();
    if (!this.ctx || !this.masterGain) return;

    const config = BINAURAL_DELTAS[stateId];
    if (!config) { this.stopBinaural(); return; }
    if (this.currentBinauralState === stateId && this.binauralGain) { this.setBinauralVolume(volume); return; }

    this.stopBinaural(0.2);
    const { baseFreq, delta } = config;

    this.binauralGain = this.ctx.createGain(); this.binauralGain.gain.value = 0; this.binauralGain.connect(this.masterGain);
    this.binauralOscL = this.ctx.createOscillator(); this.binauralOscL.type = 'sine'; this.binauralOscL.frequency.value = baseFreq;
    this.binauralOscR = this.ctx.createOscillator(); this.binauralOscR.type = 'sine'; this.binauralOscR.frequency.value = baseFreq + delta;
    this.binauralPanL = this.ctx.createStereoPanner(); this.binauralPanL.pan.value = -1;
    this.binauralPanR = this.ctx.createStereoPanner(); this.binauralPanR.pan.value = 1;

    this.binauralOscL.connect(this.binauralPanL); this.binauralPanL.connect(this.binauralGain);
    this.binauralOscR.connect(this.binauralPanR); this.binauralPanR.connect(this.binauralGain);
    this.binauralOscL.start(); this.binauralOscR.start();
    this.currentBinauralState = stateId;
    this.setBinauralVolume(volume);
  }

  setBinauralVolume(vol: number): void {
    if (this.binauralGain && this.ctx) {
      this.binauralGain.gain.linearRampToValueAtTime(vol * 0.4, this.ctx.currentTime + 0.1);
    }
  }

  stopBinaural(fadeTime = 0.5): void {
    if (this.binauralGain && this.ctx) {
      this.binauralGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + fadeTime / 2);
    }
    const nodes = [this.binauralOscL, this.binauralOscR, this.binauralPanL, this.binauralPanR, this.binauralGain];
    this.binauralOscL = this.binauralOscR = this.binauralPanL = this.binauralPanR = this.binauralGain = null;
    this.currentBinauralState = 'off';
    setTimeout(() => nodes.forEach(n => { if (n) try { (n as any).stop?.(); n.disconnect(); } catch {} }), fadeTime * 1000);
  }

  disconnectMediaElement(el: HTMLMediaElement): void {
    // kept for backwards compat — no-op in buffer mode
  }

  connectMediaElement(el: HTMLMediaElement): void {
    // kept for backwards compat — no-op in buffer mode
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _mixer: AudioMixer | null = null;

export const getAudioMixer = (): AudioMixer | null => {
  if (typeof window === 'undefined') return null;
  if (!_mixer) _mixer = new AudioMixer();
  return _mixer;
};

/** Legacy alias so existing code using getAudioEngine() still compiles */
export const getAudioEngine = getAudioMixer;
