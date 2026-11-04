import { describe, it, expect, beforeEach } from 'vitest';
import {
  LocalStorageStore,
  MemoryStore,
  GameSave,
  DEFAULT_SAVE,
} from '../src/services/SaveStore';

describe('SaveStore', () => {
  describe('MemoryStore', () => {
    it('returns default save when uninitialized', () => {
      const store = new MemoryStore();
      expect(store.load()).toEqual(DEFAULT_SAVE);
    });

    it('persists and retrieves updated save state', () => {
      const store = new MemoryStore();
      const updated: GameSave = {
        ...DEFAULT_SAVE,
        bankedGold: 350,
        runsCompleted: 2,
      };

      store.save(updated);
      expect(store.load()).toEqual(updated);
    });

    it('clears state back to default save', () => {
      const store = new MemoryStore();
      store.save({ ...DEFAULT_SAVE, bankedGold: 999 });
      store.clear();
      expect(store.load()).toEqual(DEFAULT_SAVE);
    });
  });

  describe('LocalStorageStore with Migrations & Fallback', () => {
    let mockStorage: Record<string, string>;

    beforeEach(() => {
      mockStorage = {};
    });

    it('saves and reloads state via underlying storage', () => {
      const fakeStorage: Storage = {
        getItem: (k: string) => mockStorage[k] ?? null,
        setItem: (k: string, v: string) => {
          mockStorage[k] = v;
        },
        removeItem: (k: string) => {
          delete mockStorage[k];
        },
        clear: () => {
          mockStorage = {};
        },
        key: () => null,
        length: 0,
      };

      const store = new LocalStorageStore(fakeStorage);
      const data: GameSave = {
        version: 1,
        bankedGold: 120,
        upgrades: { lantern_capacity: 1 },
        runsCompleted: 1,
        deaths: 0,
      };

      store.save(data);
      expect(store.load()).toEqual(data);
    });

    it('migrates older save schemas sequentially to current version', () => {
      // Old version 1 save format
      const legacySave = JSON.stringify({
        version: 1,
        gold: 50, // older key name
      });

      const fakeStorage: Storage = {
        getItem: () => legacySave,
        setItem: (k: string, v: string) => {
          mockStorage[k] = v;
        },
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      };

      // Migration: v1 -> v2 (renames gold to bankedGold)
      const migrations = {
        1: (old: Record<string, unknown>) => ({
          version: 2,
          bankedGold: (old.gold as number) ?? 0,
          upgrades: {},
          runsCompleted: 0,
          deaths: 0,
        }),
      };

      const store = new LocalStorageStore(fakeStorage, 2, migrations);
      const migrated = store.load();

      expect(migrated.version).toBe(2);
      expect(migrated.bankedGold).toBe(50);
    });

    it('gracefully falls back to MemoryStore if storage throws', () => {
      const failingStorage: Storage = {
        getItem: () => {
          throw new Error('QuotaExceeded / SecurityError');
        },
        setItem: () => {
          throw new Error('QuotaExceeded / SecurityError');
        },
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      };

      const store = new LocalStorageStore(failingStorage);
      expect(() => store.load()).not.toThrow();
      expect(store.load()).toEqual(DEFAULT_SAVE);

      const modified = { ...DEFAULT_SAVE, bankedGold: 500 };
      expect(() => store.save(modified)).not.toThrow();
      expect(store.load()).toEqual(modified);
    });
  });
});
