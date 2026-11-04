import { describe, it, expect } from 'vitest';
import { Rng } from '../src/core/rng';
import { generateDungeon, isFullyConnected, canReachStairs, getStairsPathDistance } from '../src/core/mapgen';

describe('BSP Dungeon Generation', () => {
  it('generates identical dungeon floor layout for identical seed', () => {
    const rngA = new Rng(12345);
    const rngB = new Rng(12345);

    const floorA = generateDungeon(rngA);
    const floorB = generateDungeon(rngB);

    expect(floorA.width).toBe(40);
    expect(floorA.height).toBe(30);
    expect(floorA.entrance).toEqual(floorB.entrance);
    expect(floorA.stairsDown).toEqual(floorB.stairsDown);
    expect(floorA.tiles).toEqual(floorB.tiles);
  });

  it('guarantees full floor connectivity across 100 consecutive seeds', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const rng = new Rng(seed);
      const floor = generateDungeon(rng);

      // 1. All walkable floor tiles must belong to a single connected component
      expect(isFullyConnected(floor)).toBe(true);

      // 2. Stairs down must be directly reachable from the entrance
      expect(canReachStairs(floor)).toBe(true);
    }
  });

  it('places stairs at path distance >= 60% of map diameter from entrance across 100 seeds', () => {
    // Map dimensions: 40x30. Map diameter = Math.hypot(40, 30) = 50.
    // Minimum path distance required: 0.60 * 50 = 30 tiles.
    for (let seed = 1; seed <= 100; seed++) {
      const rng = new Rng(seed);
      const floor = generateDungeon(rng);
      const pathDist = getStairsPathDistance(floor);
      const mapDiameter = Math.hypot(floor.width, floor.height);
      const minDistance = Math.floor(0.60 * mapDiameter);

      expect(pathDist).toBeGreaterThanOrEqual(minDistance);
    }
  });
});

