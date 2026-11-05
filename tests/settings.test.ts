import { describe, it, expect } from 'vitest';
import {
  GameSettings,
  DEFAULT_SETTINGS,
  MemoryStore,
} from '../src/services/SaveStore';

describe('Game Settings Persistence (§4.11, §5 M9)', () => {
  it('defines default settings with accessibility flags disabled by default', () => {
    expect(DEFAULT_SETTINGS.masterVolume).toBe(0.8);
    expect(DEFAULT_SETTINGS.sfxVolume).toBe(0.8);
    expect(DEFAULT_SETTINGS.ambientVolume).toBe(0.8);
    expect(DEFAULT_SETTINGS.reduceFlash).toBe(false);
    expect(DEFAULT_SETTINGS.reduceShake).toBe(false);
    expect(DEFAULT_SETTINGS.highContrast).toBe(false);
    expect(DEFAULT_SETTINGS.language).toBe('vi');
    expect(DEFAULT_SETTINGS.breakReminder).toBe(true);
    expect(DEFAULT_SETTINGS.telemetryConsent).toBe(false);
  });

  it('persists and retrieves custom accessibility settings in MemoryStore', () => {
    const store = new MemoryStore();
    const save = store.load();

    const customSettings: GameSettings = {
      masterVolume: 0.5,
      sfxVolume: 0.4,
      ambientVolume: 0.3,
      reduceFlash: true,
      reduceShake: true,
      highContrast: true,
      language: 'en',
      breakReminder: false,
      telemetryConsent: true,
    };

    store.save({
      ...save,
      settings: customSettings,
    });

    const loaded = store.load();
    expect(loaded.settings).toEqual(customSettings);
    expect(loaded.settings?.reduceFlash).toBe(true);
    expect(loaded.settings?.reduceShake).toBe(true);
    expect(loaded.settings?.language).toBe('en');
  });
});
