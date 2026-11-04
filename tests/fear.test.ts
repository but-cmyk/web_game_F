import { describe, it, expect, vi } from 'vitest';
import {
  oilCostPerStep,
  calculateLightRadius,
  calculateNoiseRadius,
  updateDread,
} from '../src/core/fear';
import { TurnResolver, DungeonState } from '../src/core/turn';
import { EventBus } from '../src/core/events';
import { DungeonFloor } from '../src/core/mapgen';
import { spawnOilFlasks, pickupOilFlask } from '../src/core/loot';
import { Rng } from '../src/core/rng';

describe('Fear System Core Formulas', () => {
  describe('oilCostPerStep formula', () => {
    it('calculates exact oil cost per step across depths and modes (§4.2, §4.3)', () => {
      // Depth 1: base = 1 + 0.15 * 1 = 1.15
      expect(oilCostPerStep(1, 'walk')).toBeCloseTo(1.15, 2);
      expect(oilCostPerStep(1, 'sneak')).toBeCloseTo(1.15 * 1.5, 2); // 1.725
      expect(oilCostPerStep(1, 'run')).toBeCloseTo(1.15 * 0.7, 2); // 0.805

      // Depth 6: base = 1 + 0.15 * 6 = 1.90
      expect(oilCostPerStep(6, 'walk')).toBeCloseTo(1.9, 2);
      expect(oilCostPerStep(6, 'sneak')).toBeCloseTo(1.9 * 1.5, 2); // 2.85
      expect(oilCostPerStep(6, 'run')).toBeCloseTo(1.9 * 0.7, 2); // 1.33

      // Minimum depth clamp
      expect(oilCostPerStep(0, 'walk')).toBeCloseTo(1.15, 2);
    });
  });

  describe('calculateLightRadius formula', () => {
    const maxOil = 100;

    it('calculates light radius between 2 and 6 depending on oil level (§4.2)', () => {
      expect(calculateLightRadius(100, maxOil, 0)).toBe(6);
      expect(calculateLightRadius(75, maxOil, 0)).toBe(5);
      expect(calculateLightRadius(50, maxOil, 0)).toBe(4);
      expect(calculateLightRadius(25, maxOil, 0)).toBe(3);
      expect(calculateLightRadius(5, maxOil, 0)).toBe(2);
    });

    it('reduces light radius by 1 when Dread >= 40 (min 2 while oil > 0)', () => {
      expect(calculateLightRadius(100, maxOil, 40)).toBe(5);
      expect(calculateLightRadius(50, maxOil, 50)).toBe(3);
      expect(calculateLightRadius(10, maxOil, 70)).toBe(2); // Minimum 2
    });

    it('collapses light radius to 1 when oil is completely depleted', () => {
      expect(calculateLightRadius(0, maxOil, 0)).toBe(1);
      expect(calculateLightRadius(-10, maxOil, 0)).toBe(1);
      expect(calculateLightRadius(0, maxOil, 80)).toBe(1);
    });
  });

  describe('calculateNoiseRadius formula', () => {
    it('sets base noise radius per movement mode (§4.3)', () => {
      expect(calculateNoiseRadius('sneak', 0)).toBe(2);
      expect(calculateNoiseRadius('walk', 0)).toBe(4);
      expect(calculateNoiseRadius('run', 0)).toBe(7);
    });

    it('doubles noise radius when Dread reaches 100 (§4.4)', () => {
      expect(calculateNoiseRadius('sneak', 100)).toBe(4);
      expect(calculateNoiseRadius('walk', 100)).toBe(8);
      expect(calculateNoiseRadius('run', 100)).toBe(14);
    });
  });

  describe('updateDread rules', () => {
    it('increases Dread by +2 when moving in unlit darkness with oil', () => {
      expect(updateDread(10, false, false)).toBe(12);
    });

    it('increases Dread by +4 when moving in darkness with depleted oil (§4.2)', () => {
      expect(updateDread(10, false, true)).toBe(14);
    });

    it('decreases Dread by -3 when stepping in light, clamped to 0 (§4.4)', () => {
      expect(updateDread(10, true, false)).toBe(7);
      expect(updateDread(2, true, false)).toBe(0);
    });

    it('strictly clamps maximum Dread at 100', () => {
      expect(updateDread(99, false, false)).toBe(100);
      expect(updateDread(98, false, true)).toBe(100);
    });
  });

  describe('Turn Pipeline Fear Integration', () => {
    function createTestDungeonFloor(): DungeonFloor {
      const width = 10;
      const height = 10;
      const tiles = new Array(width * height).fill('FLOOR');
      return {
        width,
        height,
        tiles,
        entrance: { x: 1, y: 1 },
        stairsDown: { x: 8, y: 8 },
        rooms: [],
      };
    }

    it('depletes oil, emits noise event, and increases Dread upon movement', () => {
      const floor = createTestDungeonFloor();
      const eventBus = new EventBus();
      const noiseSpy = vi.fn();
      const dreadSpy = vi.fn();
      eventBus.on('NoiseEmitted', noiseSpy);
      eventBus.on('DreadChanged', dreadSpy);

      const state: DungeonState = {
        floor,
        playerPos: { x: 2, y: 2 },
        movementMode: 'walk',
        turnCount: 0,
        depth: 1,
        hp: 2,
        carriedGold: 0,
        bankedGold: 0,
        oil: 100,
        maxOil: 100,
        dread: 10,
        goldPiles: [],
        oilFlasks: [],
        isExtracted: false,
        isDead: false,
        eventBus,
      };

      const result = TurnResolver.step(state, { type: 'MOVE', direction: 'E' });

      expect(result.consumedTurn).toBe(true);
      expect(state.playerPos).toEqual({ x: 3, y: 2 });

      // Oil decreased by oilCostPerStep(1, 'walk') = 1.15 -> 100 - 1.15 = 98.85
      expect(state.oil).toBeCloseTo(98.85, 2);

      // Noise emitted: radius 4 for walk
      expect(noiseSpy).toHaveBeenCalledWith({
        x: 3,
        y: 2,
        radius: 4,
        source: 'player',
      });

      // Dread increased: 10 + 2 = 12
      expect(state.dread).toBe(12);
      expect(dreadSpy).toHaveBeenCalledWith({
        oldDread: 10,
        newDread: 12,
        reason: 'darkness_step',
      });
    });

    it('toggles movement mode via SET_MODE without consuming a turn', () => {
      const floor = createTestDungeonFloor();
      const eventBus = new EventBus();
      const state: DungeonState = {
        floor,
        playerPos: { x: 2, y: 2 },
        movementMode: 'walk',
        turnCount: 0,
        depth: 1,
        hp: 2,
        carriedGold: 0,
        bankedGold: 0,
        oil: 100,
        maxOil: 100,
        dread: 0,
        goldPiles: [],
        oilFlasks: [],
        isExtracted: false,
        isDead: false,
        eventBus,
      };

      const res = TurnResolver.step(state, { type: 'SET_MODE', mode: 'sneak' });
      expect(res.consumedTurn).toBe(false);
      expect(state.movementMode).toBe('sneak');
      expect(state.turnCount).toBe(0);
    });

    it('spawns 2-3 oil flasks and collects +15 oil upon stepping onto flask tile', () => {
      const rng = new Rng(777);
      const floor = createTestDungeonFloor();
      const flasks = spawnOilFlasks(floor, 1, rng);

      expect(flasks.length).toBeGreaterThanOrEqual(2);
      expect(flasks.length).toBeLessThanOrEqual(3);

      const pickupRes = pickupOilFlask(flasks, { x: flasks[0].x, y: flasks[0].y });
      expect(pickupRes.collectedAmount).toBe(15);
      expect(pickupRes.remainingFlasks.length).toBe(flasks.length - 1);
    });
  });
});
