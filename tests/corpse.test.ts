import { describe, it, expect } from 'vitest';
import {
  createCorpse,
  lootCorpse,
  filterCorpsesForFloor,
  PlayerCorpse,
} from '../src/core/corpse';

describe('Player Corpse Retrieval System (§4.10, §5 M10)', () => {
  it('creates corpse recording death location, cause, and 50% recoverable gold', () => {
    const corpse = createCorpse(3, 14, 18, 100, 'crawler_attack', 1699999999);

    expect(corpse.depth).toBe(3);
    expect(corpse.x).toBe(14);
    expect(corpse.y).toBe(18);
    expect(corpse.lostGold).toBe(100);
    expect(corpse.recoverableGold).toBe(50); // 50%
    expect(corpse.deathCause).toBe('crawler_attack');
    expect(corpse.isLooted).toBe(false);
  });

  it('rounds odd gold numbers correctly for recovery', () => {
    const corpse = createCorpse(1, 5, 5, 75, 'dread_collapse');
    expect(corpse.recoverableGold).toBe(38); // Math.round(75 * 0.5) = 38
  });

  it('loots uncollected corpse, granting recovered gold and preventing double-looting', () => {
    const corpse = createCorpse(2, 8, 12, 60, 'listener_ambush');

    const result1 = lootCorpse(corpse);
    expect(result1.goldRecovered).toBe(30);
    expect(result1.updatedCorpse.isLooted).toBe(true);

    // Second loot attempt
    const result2 = lootCorpse(result1.updatedCorpse);
    expect(result2.goldRecovered).toBe(0);
  });

  it('filters active unlooted corpses for the current floor depth', () => {
    const corpses: PlayerCorpse[] = [
      createCorpse(1, 4, 4, 20, 'crawler'),
      createCorpse(2, 6, 6, 40, 'stalker'),
      createCorpse(2, 10, 10, 50, 'crawler'),
      createCorpse(3, 12, 12, 80, 'listener'),
    ];

    // Mark one as already looted
    corpses[1].isLooted = true;

    const floor2Corpses = filterCorpsesForFloor(corpses, 2);
    expect(floor2Corpses).toHaveLength(1);
    expect(floor2Corpses[0].x).toBe(10);
    expect(floor2Corpses[0].depth).toBe(2);
  });
});
