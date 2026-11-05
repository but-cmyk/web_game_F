/**
 * RemoteStore Interface & Local Implementation for DEEPER (§4.10, §5 M10).
 * Provides decoupled leaderboard storage for successful extractions.
 * Ranked strictly by depth reached and runs survived (never ranked by gold greed).
 * Zero Phaser imports.
 */

export interface SurvivorRecord {
  readonly id: string;
  readonly playerName: string;
  readonly depthReached: number;
  readonly runsSurvived: number;
  readonly archetypeId: string;
  readonly timestamp: number;
}

export interface RemoteStore {
  fetchTopSurvivors(limit?: number): Promise<readonly SurvivorRecord[]>;
  submitSurvivor(record: SurvivorRecord): Promise<boolean>;
}

export class LocalRemoteStore implements RemoteStore {
  private records: SurvivorRecord[] = [];

  constructor(initialRecords: readonly SurvivorRecord[] = []) {
    this.records = [...initialRecords];
  }

  async fetchTopSurvivors(limit = 10): Promise<readonly SurvivorRecord[]> {
    const sorted = [...this.records].sort((a, b) => {
      // 1. Depth descending
      if (b.depthReached !== a.depthReached) {
        return b.depthReached - a.depthReached;
      }
      // 2. Runs survived descending
      if (b.runsSurvived !== a.runsSurvived) {
        return b.runsSurvived - a.runsSurvived;
      }
      // 3. Timestamp descending (newer first)
      return b.timestamp - a.timestamp;
    });

    return sorted.slice(0, limit);
  }

  async submitSurvivor(record: SurvivorRecord): Promise<boolean> {
    const existingIndex = this.records.findIndex((r) => r.id === record.id);
    if (existingIndex >= 0) {
      this.records[existingIndex] = record;
    } else {
      this.records.push(record);
    }
    return true;
  }
}
