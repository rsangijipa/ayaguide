/**
 * AudioLoopManager.ts
 * Sistema de gerenciamento de loops contínuos para AyaGuide.
 * Permite que sons curtos (15s) se comportem como sessões de 4h.
 */

import { getAudioEngine } from "./audio";

export type AudioLoopCallback = () => void;

export class AudioLoopManager {
  private audio: HTMLAudioElement | null = null;
  private startTime: number = 0;
  private totalElapsedMs: number = 0;
  private isPlayingActive: boolean = false;
  private loopDurationMs: number;
  private onComplete?: AudioLoopCallback;
  private timerId?: number;

  constructor(
    private src: string,
    private volume: number = 0.5,
    loopDurationSeconds: number = 14400, // 4 horas
    onComplete?: AudioLoopCallback
  ) {
    this.loopDurationMs = loopDurationSeconds * 1000;
    this.onComplete = onComplete;
    
    if (typeof window !== "undefined") {
      this.audio = new Audio(this.src);
      this.audio.loop = true;
      this.audio.crossOrigin = "anonymous";
      this.audio.preload = "none";
      this.audio.volume = this.volume;
    }
  }

  public connectToEngine(): void {
    if (typeof window === "undefined" || !this.audio) return;
    const engine = getAudioEngine();
    if (engine) {
      engine.connectMediaElement(this.audio);
    }
  }

  public start(): void {
    if (!this.audio || this.isPlayingActive) return;
    
    // Verificar se já completou as 4 horas
    if (this.totalElapsedMs >= this.loopDurationMs) {
      this.stop();
      return;
    }

    this.isPlayingActive = true;
    this.startTime = performance.now();
    
    this.audio.play().catch(err => {
      console.warn(`Erro ao iniciar áudio ${this.src}:`, err);
      this.isPlayingActive = false;
    });

    // Iniciar monitoramento do loop de 4 horas
    this.startProgressMonitor();
  }

  public pause(): void {
    if (!this.audio || !this.isPlayingActive) return;

    this.audio.pause();
    this.updateElapsed();
    this.isPlayingActive = false;
    this.stopProgressMonitor();
  }

  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.totalElapsedMs = 0;
    this.isPlayingActive = false;
    this.stopProgressMonitor();
  }

  public setVolume(vol: number): void {
    this.volume = vol;
    if (this.audio) {
      this.audio.volume = vol;
    }
  }

  public setSrc(src: string): void {
    if (this.src === src) return;
    
    const wasPlaying = this.isPlayingActive;
    if (wasPlaying) this.pause();
    
    this.src = src;
    if (this.audio) {
      this.audio.src = src;
      this.audio.load();
    }
    
    if (wasPlaying) this.start();
  }

  public getProgress(): number {
    const currentSessionElapsed = this.isPlayingActive 
      ? performance.now() - this.startTime 
      : 0;
    const total = this.totalElapsedMs + currentSessionElapsed;
    return Math.min(total / this.loopDurationMs, 1);
  }

  public getElapsedTime(): number {
    const currentSessionElapsed = this.isPlayingActive 
      ? performance.now() - this.startTime 
      : 0;
    return this.totalElapsedMs + currentSessionElapsed;
  }

  public getRemainingTime(): number {
    return Math.max(this.loopDurationMs - this.getElapsedTime(), 0);
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

      if (this.getElapsedTime() >= this.loopDurationMs) {
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
    if (this.audio) {
      const engine = getAudioEngine();
      if (engine) engine.disconnectMediaElement(this.audio);
      this.audio.src = "";
      this.audio = null;
    }
  }
}
