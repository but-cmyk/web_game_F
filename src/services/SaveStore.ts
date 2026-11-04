/**
 * State Persistence Service for DEEPER.
 * Provides versioned LocalStorage persistence with sequential migrations
 * and automatic fallback to MemoryStore on restricted/private browsing environments.
 * Zero any.
 */

export interface GameSave {
  readonly version: number;
  readonly bankedGold: number;
  readonly upgrades: Readonly<Record<string, number>>;
  readonly runsCompleted: number;
  readonly deaths: number;
  readonly lastPlayedDate?: string;
  readonly reduceMotion?: boolean;
}

export const CURRENT_SAVE_VERSION = 1;

export const DEFAULT_SAVE: GameSave = {
  version: CURRENT_SAVE_VERSION,
  bankedGold: 0,
  upgrades: {},
  runsCompleted: 0,
  deaths: 0,
};

export interface SaveStore {
  load(): GameSave;
  save(data: GameSave): void;
  clear(): void;
}

export class MemoryStore implements SaveStore {
  private state: GameSave;

  constructor(initialState: GameSave = DEFAULT_SAVE) {
    this.state = { ...initialState };
  }

  load(): GameSave {
    return { ...this.state };
  }

  save(data: GameSave): void {
    this.state = { ...data };
  }

  clear(): void {
    this.state = { ...DEFAULT_SAVE };
  }
}

export type MigrationFn = (oldData: Record<string, unknown>) => Record<string, unknown>;

export class LocalStorageStore implements SaveStore {
  private fallbackStore: MemoryStore = new MemoryStore();
  private isFallback = false;
  private storage: Storage | null;
  private readonly storageKey: string;
  private readonly targetVersion: number;
  private readonly migrations: Record<number, MigrationFn>;

  constructor(
    storageOverride?: Storage,
    targetVersion: number = CURRENT_SAVE_VERSION,
    migrations: Record<number, MigrationFn> = {},
    storageKey = 'deeper_save'
  ) {
    this.storageKey = storageKey;
    this.targetVersion = targetVersion;
    this.migrations = migrations;

    if (storageOverride) {
      this.storage = storageOverride;
    } else {
      try {
        this.storage = typeof window !== 'undefined' ? window.localStorage : null;
      } catch {
        this.storage = null;
        this.isFallback = true;
      }
    }
  }

  load(): GameSave {
    if (this.isFallback || !this.storage) {
      return this.fallbackStore.load();
    }

    try {
      const raw = this.storage.getItem(this.storageKey);
      if (!raw) {
        return DEFAULT_SAVE;
      }

      let parsed = JSON.parse(raw) as Record<string, unknown>;
      let version = typeof parsed.version === 'number' ? parsed.version : 0;

      // Sequential migration loop
      while (version < this.targetVersion && this.migrations[version]) {
        parsed = this.migrations[version](parsed);
        version = typeof parsed.version === 'number' ? parsed.version : version + 1;
      }

      return {
        version: typeof parsed.version === 'number' ? parsed.version : this.targetVersion,
        bankedGold: typeof parsed.bankedGold === 'number' ? parsed.bankedGold : 0,
        upgrades:
          parsed.upgrades && typeof parsed.upgrades === 'object'
            ? (parsed.upgrades as Record<string, number>)
            : {},
        runsCompleted: typeof parsed.runsCompleted === 'number' ? parsed.runsCompleted : 0,
        deaths: typeof parsed.deaths === 'number' ? parsed.deaths : 0,
        lastPlayedDate: typeof parsed.lastPlayedDate === 'string' ? parsed.lastPlayedDate : undefined,
        reduceMotion: typeof parsed.reduceMotion === 'boolean' ? parsed.reduceMotion : undefined,
      };
    } catch {
      this.isFallback = true;
      return this.fallbackStore.load();
    }
  }

  save(data: GameSave): void {
    if (this.isFallback || !this.storage) {
      this.fallbackStore.save(data);
      return;
    }

    try {
      this.storage.setItem(this.storageKey, JSON.stringify(data));
    } catch {
      this.isFallback = true;
      this.fallbackStore.save(data);
    }
  }

  clear(): void {
    if (this.isFallback || !this.storage) {
      this.fallbackStore.clear();
      return;
    }

    try {
      this.storage.removeItem(this.storageKey);
    } catch {
      this.isFallback = true;
      this.fallbackStore.clear();
    }
  }
}

export const defaultSaveStore = new LocalStorageStore();

