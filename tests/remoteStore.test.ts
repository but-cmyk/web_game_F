import { describe, it, expect } from 'vitest';
import {
  LocalRemoteStore,
  SurvivorRecord,
} from '../src/services/RemoteStore';
import { SupabaseRemoteStore } from '../src/services/SupabaseRemoteStore';

describe('Survivor Leaderboard & RemoteStore Architecture (§4.10, §5 M10)', () => {
  it('stores and ranks survivors by depth and survival rate, not gold', async () => {
    const localStore = new LocalRemoteStore();

    const recordA: SurvivorRecord = {
      id: 'rec_1',
      playerName: 'Player A',
      depthReached: 6,
      runsSurvived: 3,
      archetypeId: 'flamekeeper',
      timestamp: 1000,
    };

    const recordB: SurvivorRecord = {
      id: 'rec_2',
      playerName: 'Player B',
      depthReached: 12, // deeper
      runsSurvived: 5,
      archetypeId: 'calculator',
      timestamp: 2000,
    };

    const recordC: SurvivorRecord = {
      id: 'rec_3',
      playerName: 'Player C',
      depthReached: 6,
      runsSurvived: 5, // higher runs survived at same depth
      archetypeId: 'gold_digger',
      timestamp: 1500,
    };

    await localStore.submitSurvivor(recordA);
    await localStore.submitSurvivor(recordB);
    await localStore.submitSurvivor(recordC);

    const top = await localStore.fetchTopSurvivors(10);
    expect(top).toHaveLength(3);

    // Rank 1: depth 12 (B)
    expect(top[0].id).toBe('rec_2');
    // Rank 2: depth 6, runsSurvived 5 (C)
    expect(top[1].id).toBe('rec_3');
    // Rank 3: depth 6, runsSurvived 3 (A)
    expect(top[2].id).toBe('rec_1');
  });

  it('SupabaseRemoteStore gracefully falls back to LocalRemoteStore when credentials are absent', async () => {
    const fallbackStore = new LocalRemoteStore();
    // Empty credentials simulating missing .env keys
    const remote = new SupabaseRemoteStore('', '', fallbackStore);

    const testRecord: SurvivorRecord = {
      id: 'rec_fallback',
      playerName: 'Offline Survivor',
      depthReached: 9,
      runsSurvived: 2,
      archetypeId: 'flamekeeper',
      timestamp: Date.now(),
    };

    const success = await remote.submitSurvivor(testRecord);
    expect(success).toBe(true);

    const list = await remote.fetchTopSurvivors();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('rec_fallback');
  });
});
