/**
 * Procedural WebAudio Director for DEEPER.
 * Synthesizes all music and sound effects natively via WebAudio API:
 * - Dread-modulated heartbeat (60-140 BPM)
 * - Subterranean ambient drone
 * - Footstep sounds per movement mode
 * - Gold chime & oil pickup sound effects
 * Zero external audio assets, zero any.
 */

import { MovementMode } from '../core/turn';

export function calculateHeartbeatBPM(dread: number): number {
  if (dread < 40) {
    return 0;
  }
  const clamped = Math.min(100, Math.max(40, dread));
  const ratio = (clamped - 40) / 60;
  return Math.round(60 + (140 - 60) * ratio);
}

export class AudioDirector {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  private masterVolume = 0.7;
  private sfxVolume = 0.8;
  private muted = false;

  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private currentBPM = 0;

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  /**
   * Initializes or resumes the WebAudio context upon user gesture.
   */
  public unlock(): void {
    if (typeof window === 'undefined') return;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX Gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Ambient Gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.startAmbientDrone();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err: unknown) => {
        void err;
      });
    }
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public setMasterVolume(val: number): void {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setSfxVolume(val: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
  }

  /**
   * Starts low-frequency subterranean ambient drone.
   */
  private startAmbientDrone(): void {
    if (!this.ctx || !this.ambientGain) return;

    try {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, this.ctx.currentTime);
      filter.connect(this.ambientGain);

      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(46, this.ctx.currentTime);
      this.ambientOsc1.connect(filter);
      this.ambientOsc1.start();

      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(50, this.ctx.currentTime);
      this.ambientOsc2.connect(filter);
      this.ambientOsc2.start();
    } catch (_err) {
      void _err;
    }
  }

  /**
   * Modulates procedural heartbeat pacing based on Dread meter.
   */
  public updateDread(dread: number): void {
    const bpm = calculateHeartbeatBPM(dread);

    if (bpm === this.currentBPM) {
      return;
    }

    this.currentBPM = bpm;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (bpm > 0) {
      const intervalMs = (60 / bpm) * 1000;
      // Trigger immediate beat then interval
      this.playHeartbeatThump();
      this.heartbeatInterval = setInterval(() => {
        this.playHeartbeatThump();
      }, intervalMs);
    }
  }

  private playHeartbeatThump(): void {
    if (!this.ctx || !this.sfxGain || this.muted) return;

    try {
      const now = this.ctx.currentTime;

      // Double-thump heartbeat: lub-dub
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(58, now);
      osc1.frequency.exponentialRampToValueAtTime(38, now + 0.12);

      gain1.gain.setValueAtTime(0.5, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

      osc1.connect(gain1);
      gain1.connect(this.sfxGain);

      osc1.start(now);
      osc1.stop(now + 0.15);

      // Second beat (dub) slightly quieter after 120ms
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(52, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(32, now + 0.22);

      gain2.gain.setValueAtTime(0.35, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

      osc2.connect(gain2);
      gain2.connect(this.sfxGain);

      osc2.start(now + 0.12);
      osc2.stop(now + 0.25);
    } catch (_err) {
      void _err;
    }
  }

  /**
   * Procedural footstep sound based on movement mode.
   */
  public playFootstep(mode: MovementMode): void {
    if (!this.ctx || !this.sfxGain || this.muted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = mode === 'sneak' ? 90 : mode === 'run' ? 160 : 120;
      const vol = mode === 'sneak' ? 0.08 : mode === 'run' ? 0.25 : 0.15;
      const duration = mode === 'run' ? 0.06 : 0.04;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + duration);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + duration + 0.01);
    } catch (_err) {
      void _err;
    }
  }

  /**
   * Procedural gold pickup chime (resonant harmonic sparkle).
   */
  public playGoldChime(): void {
    if (!this.ctx || !this.sfxGain || this.muted) return;

    try {
      const now = this.ctx.currentTime;

      // Note 1: B5 (987.77 Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(this.sfxGain);
      osc1.start(now);
      osc1.stop(now + 0.36);

      // Note 2: E6 (1318.51 Hz) after 40ms
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.04);
      gain2.gain.setValueAtTime(0.25, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc2.connect(gain2);
      gain2.connect(this.sfxGain);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.46);
    } catch (_err) {
      void _err;
    }
  }

  /**
   * Procedural oil pickup glissando (warm rising pitch).
   */
  public playOilChime(): void {
    if (!this.ctx || !this.sfxGain || this.muted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.22);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (_err) {
      void _err;
    }
  }

  public destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.ambientOsc1) {
      try {
        this.ambientOsc1.stop();
      } catch (_err) {
        void _err;
      }
      this.ambientOsc1 = null;
    }
    if (this.ambientOsc2) {
      try {
        this.ambientOsc2.stop();
      } catch (_err) {
        void _err;
      }
      this.ambientOsc2 = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close().catch((err: unknown) => {
          void err;
        });
      } catch (_err) {
        void _err;
      }
      this.ctx = null;
    }
  }
}

export const defaultAudioDirector = new AudioDirector();
