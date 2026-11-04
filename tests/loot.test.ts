import { describe, it, expect } from 'vitest';
import { Rng } from '../src/core/rng';
import { generateDungeon } from '../src/core/mapgen';
import { lootValue, spawnGoldPiles, pickupGold, GoldPile } from '../src/core/loot';

describe('Loot System', () => {
  describe('lootValue formula', () => {
    it('calculates exact depth-scaled loot values according to specs', () => {
      // Specs §4.6: depth 1 = 10, depth 3 = 17, depth 6 = 37, depth 12 = 179
      expect(lootValue(1)).toBe(10);
      expect(lootValue(2)).toBe(13);
      expect(lootValue(3)).toBe(17);
      expect(lootValue(6)).toBe(37);
      expect(lootValue(12)).toBe(179);
    });

    it('clamps or handles minimum depth 1', () => {
      expect(lootValue(0)).toBe(10);
      expect(lootValue(-5)).toBe(10);
    });
  });

  describe('spawnGoldPiles', () => {
    it('spawns between 4 and 6 gold piles per floor across 50 seeds', () => {
      for (let seed = 1; seed <= 50; seed++) {
        const rng = new Rng(seed);
        const floor = generateDungeon(rng);
        const piles = spawnGoldPiles(floor, 1, rng);

        expect(piles.length).toBeGreaterThanOrEqual(4);
        expect(piles.length).toBeLessThanOrEqual(6);

        // Every pile must be placed on a walkable floor tile
        for (const pile of piles) {
          const tileIdx = pile.y * floor.width + pile.x;
          expect(floor.tiles[tileIdx]).toBe('FLOOR');

          // Cannot overlap entrance or stairs
          expect(pile.x === floor.entrance.x && pile.y === floor.entrance.y).toBe(false);
          expect(pile.x === floor.stairsDown.x && pile.y === floor.stairsDown.y).toBe(false);

          // Value must match depth loot value
          expect(pile.amount).toBe(10);
        }
      }
    });

    it('generates identical gold piles deterministically for the same seed', () => {
      const rngA = new Rng(999);
      const floorA = generateDungeon(rngA);
      const pilesA = spawnGoldPiles(floorA, 3, rngA);

      const rngB = new Rng(999);
      const floorB = generateDungeon(rngB);
      const pilesB = spawnGoldPiles(floorB, 3, rngB);

      expect(pilesA).toEqual(pilesB);
    });
  });

  describe('pickupGold', () => {
    it('collects gold pile at player position and updates remaining piles', () => {
      const initialPiles: GoldPile[] = [
        { id: 'gold_1', x: 5, y: 5, amount: 25 },
        { id: 'gold_2', x: 8, y: 10, amount: 30 },
      ];

      // Stepping onto (5, 5)
      const res1 = pickupGold(initialPiles, { x: 5, y: 5 });
      expect(res1.collectedAmount).toBe(25);
      expect(res1.remainingPiles.length).toBe(1);
      expect(res1.remainingPiles[0].id).toBe('gold_2');

      // Stepping onto empty tile (2, 2)
      const res2 = pickupGold(res1.remainingPiles, { x: 2, y: 2 });
      expect(res2.collectedAmount).toBe(0);
      expect(res2.remainingPiles.length).toBe(1);
    });
  });
});
