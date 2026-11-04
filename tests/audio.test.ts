import { describe, it, expect } from 'vitest';
import { calculateHeartbeatBPM, AudioDirector } from '../src/audio/AudioDirector';

describe('AudioDirector & Procedural WebAudio Mechanics', () => {
  describe('calculateHeartbeatBPM mapping', () => {
    it('returns 0 when Dread < 40 (heartbeat silent under baseline)', () => {
      expect(calculateHeartbeatBPM(0)).toBe(0);
      expect(calculateHeartbeatBPM(25)).toBe(0);
      expect(calculateHeartbeatBPM(39)).toBe(0);
    });

    it('maps Dread 40..100 linearly to 60..140 BPM (§4.4)', () => {
      // At threshold 40: 60 BPM
      expect(calculateHeartbeatBPM(40)).toBe(60);

      // At mid threshold 70: 100 BPM
      expect(calculateHeartbeatBPM(70)).toBe(100);

      // At peak threshold 100: 140 BPM
      expect(calculateHeartbeatBPM(100)).toBe(140);
    });

    it('clamps upper bound at 140 BPM for values exceeding 100', () => {
      expect(calculateHeartbeatBPM(120)).toBe(140);
    });
  });

  describe('Volume and Mute controls', () => {
    it('initializes with valid default volumes and unmuted', () => {
      const director = new AudioDirector();
      expect(director.getMasterVolume()).toBeGreaterThan(0);
      expect(director.getSfxVolume()).toBeGreaterThan(0);
      expect(director.isMuted()).toBe(false);
    });

    it('clamps volume inputs strictly within [0, 1]', () => {
      const director = new AudioDirector();

      director.setMasterVolume(1.5);
      expect(director.getMasterVolume()).toBe(1.0);

      director.setMasterVolume(-0.5);
      expect(director.getMasterVolume()).toBe(0.0);

      director.setSfxVolume(2.0);
      expect(director.getSfxVolume()).toBe(1.0);

      director.setSfxVolume(-1.0);
      expect(director.getSfxVolume()).toBe(0.0);
    });

    it('toggles mute state properly', () => {
      const director = new AudioDirector();

      director.setMuted(true);
      expect(director.isMuted()).toBe(true);

      director.setMuted(false);
      expect(director.isMuted()).toBe(false);
    });

    it('gracefully handles monster audio cues without active AudioContext in node', () => {
      const director = new AudioDirector();
      expect(() => director.playMonsterAlert('CHASE')).not.toThrow();
      expect(() => director.playMonsterAlert('SUSPICIOUS')).not.toThrow();
      expect(() => director.playListenerHowl()).not.toThrow();
      expect(() => director.playPlayerHurt()).not.toThrow();
      expect(() => director.playHallucinationEvaporation()).not.toThrow();
      expect(() => director.silenceAmbient()).not.toThrow();
    });
  });
});
