/**
 * AudioLoopManager.ts (Buffer-Based)
 * Sistema de gerenciamento de loops contínuos para AyaGuide usando Web Audio Buffers.
 * Permite mixagem infinita sem os limites de MediaElementAudioSourceNode.
 */

import { getAudioMixer as getAudioEngine } from "./audioMixer";

export type AudioLoopCallback = () => void;

export class AudioLoopManager {
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private totalElapsedMs: number = 0;
  private isPlayingActive: boolean = false;
  private loopDurationMs: number;
  private onComplete?: AudioLoopCallback;
  private timerId?: number;
  private isLoading: boolean = false;

  constructor(
    private src: string,
    private volume: number = 0.5,
    loopDurationSeconds: number = 14400, // 4 horas
    onComplete?: AudioLoopCallback
  ) {
    this.loopDurationMs = loopDurationSeconds * 1000;
    this.onComplete = onComplete;
  }

  /**
   * Pre-loads the audio buffer into memory.
   */
  public async load(): Promise<void> {
    if (this.isLoading) return;
    const engine = getAudioEngine();
    if (!engine) return;

    this.isLoading = true;
    try {
      await engine.loadBuffer(this.src);
    } finally {
      this.isLoading = false;
    }
  }

  public start(): void {
    if (this.isPlayingActive) return;
    const engine = getAudioEngine();
    const buffer = engine?.getBuffer(this.src);

    if (!engine || !buffer) {
      // If buffer not loaded, trigger load and wait for next start call
      this.load();
      return;
    }

    // Verificar se já completou as 4 horas
    if (this.totalElapsedMs >= this.loopDurationMs) {
      this.stop();
      return;
    }

    this.isPlayingActive = true;
    this.startTime = performance.now();

    // 1. Create Gain Node if not exists
    if (!this.gainNode) {
      this.gainNode = engine.createGain();
      if (this.gainNode) this.gainNode.gain.value = this.volume;
    }

    // 2. Create and start source node (Buffer sources are one-shot, must be new every play)
    const ctx = engine.context;
    if (!ctx) return;
    
    this.source = ctx.createBufferSource();
    if (this.source && this.gainNode) {
      this.source.buffer = buffer;
      this.source.loop = true;
      this.source.connect(this.gainNode);
      
      // Calculate offset if resuming
      const offsetSeconds = (this.pauseTime % buffer.duration);
      this.source.start(0, offsetSeconds);
    }

    this.startProgressMonitor();
  }

  public pause(): void {
    if (!this.isPlayingActive) return;

    if (this.source) {
      try {
        this.source.stop();
        this.source.disconnect();
      } catch (e) {}
      this.source = null;
    }

    this.updateElapsed();
    // Track where we paused within the loop for resume offset
    const elapsedSinceStart = (performance.now() - this.startTime) / 1000;
    this.pauseTime += elapsedSinceStart;

    this.isPlayingActive = false;
    this.stopProgressMonitor();
  }

  public stop(): void {
    if (this.source) {
      try {
        this.source.stop();
        this.source.disconnect();
      } catch (e) {}
      this.source = null;
    }
    this.totalElapsedMs = 0;
    this.pauseTime = 0;
    this.isPlayingActive = false;
    this.stopProgressMonitor();
  }

  public setVolume(vol: number): void {
    this.volume = vol;
    const engine = getAudioEngine();
    if (this.gainNode && engine?.context) {
      this.gainNode.gain.setTargetAtTime(vol, engine.context.currentTime, 0.1);
    }
  }

  public async setSrc(src: string): Promise<void> {
    if (this.src === src) return;
    const wasPlaying = this.isPlayingActive;
    if (wasPlaying) this.stop();
    
    this.src = src;
    await this.load();
    
    if (wasPlaying) this.start();
  }

  public getProgress(): number {
    const currentSessionElapsed = this.isPlayingActive 
      ? performance.now() - this.startTime 
      : 0;
    const total = this.totalElapsedMs + currentSessionElapsed;
    return Math.min(total / this.loopDurationMs, 1);
  }

  public isPlaying(): boolean {
    return this.isPlayingActive;
  }

  private updateElapsed(): void {
    if (this.isPlayingActive) {
      this.totalElapsedMs += performance.now() - this.startTime;
      this.startTime = performance.now();
    }
  }

  private startProgressMonitor(): void {
    this.stopProgressMonitor();
    this.timerId = window.setInterval(() => {
      if (!this.isPlayingActive) {
        this.stopProgressMonitor();
        return;
      }
      if (this.totalElapsedMs + (performance.now() - this.startTime) >= this.loopDurationMs) {
        this.stop();
        if (this.onComplete) this.onComplete();
      }
    }, 1000);
  }

  private stopProgressMonitor(): void {
    if (this.timerId !== undefined) {
      window.clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }

  public cleanup(): void {
    this.stop();
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }
}
