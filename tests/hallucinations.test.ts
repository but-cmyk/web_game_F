import { describe, it, expect } from 'vitest';
import {
  shouldSpawnHallucination,
  updateHallucinations,
  Hallucination,
} from '../src/core/hallucinations';
import { Rng } from '../src/core/rng';
import { EventBus } from '../src/core/events';

describe('Hallucination Mechanics (§4.4, §4.5)', () => {
  describe('shouldSpawnHallucination check', () => {
    it('never spawns when Dread < 70', () => {
      const rng = new Rng(42);
      // Even if step count is multiple of 5
      expect(shouldSpawnHallucination(69, 5, rng)).toBe(false);
      expect(shouldSpawnHallucination(0, 10, rng)).toBe(false);
      expect(shouldSpawnHallucination(40, 15, rng)).toBe(false);
    });

    it('only checks on every 5th step when Dread >= 70', () => {
      const rng = new Rng(42);
      expect(shouldSpawnHallucination(70, 1, rng)).toBe(false);
      expect(shouldSpawnHallucination(70, 2, rng)).toBe(false);
      expect(shouldSpawnHallucination(70, 3, rng)).toBe(false);
      expect(shouldSpawnHallucination(70, 4, rng)).toBe(false);
    });

    it('triggers with ~15% probability on 5th step when Dread >= 70', () => {
      let spawns = 0;
      const totalTrials = 1000;
      for (let seed = 0; seed < totalTrials; seed++) {
        const rng = new Rng(seed);
        if (shouldSpawnHallucination(80, 5, rng)) {
          spawns++;
        }
      }

      // Expected ~150 out of 1000 (15%)
      const rate = spawns / totalTrials;
      expect(rate).toBeGreaterThan(0.11);
      expect(rate).toBeLessThan(0.19);
    });
  });

  describe('updateHallucinations lifecycle & Zero Damage Invariant', () => {
    it('evaporates into smoke when distance to player is <= 2 tiles, adding +5 Dread', () => {
      const eventBus = new EventBus();
      const hallucination: Hallucination = {
        id: 'hal_1',
        x: 6,
        y: 5,
        type: 'crawler',
        lifetime: 10,
      };

      const result = updateHallucinations(
        [hallucination],
        { x: 5, y: 5 }, // Player distance = 1 tile (<= 2)
        75, // initial dread
        2,  // player HP
        eventBus
      );

      // Evaporated
      expect(result.remainingHallucinations).toHaveLength(0);
      expect(result.evaporatedCount).toBe(1);
      // Dread +5 penalty
      expect(result.newDread).toBe(80);
      // Zero damage guarantee: HP remains 2!
      expect(result.playerHp).toBe(2);
    });

    it('persists when distance to player is > 2 tiles', () => {
      const eventBus = new EventBus();
      const hallucination: Hallucination = {
        id: 'hal_1',
        x: 10,
        y: 5,
        type: 'stalker',
        lifetime: 10,
      };

      const result = updateHallucinations(
        [hallucination],
        { x: 5, y: 5 }, // Distance = 5 (> 2)
        70,
        2,
        eventBus
      );

      expect(result.remainingHallucinations).toHaveLength(1);
      expect(result.evaporatedCount).toBe(0);
      expect(result.newDread).toBe(70);
      expect(result.playerHp).toBe(2);
    });
  });
});
