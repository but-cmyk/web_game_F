import { describe, it, expect } from 'vitest';
import {
  getUpgradeDefs,
  getUpgradeTier,
  getNextTierCost,
  canPurchaseUpgrade,
  purchaseUpgrade,
  applyUpgradesToState,
  calculateNoiseWithBoots,
} from '../src/core/upgrades';
import { GameSave, DEFAULT_SAVE } from '../src/services/SaveStore';
import { DungeonState } from '../src/core/turn';
import { generateDungeon } from '../src/core/mapgen';
import { Rng } from '../src/core/rng';
import { EventBus } from '../src/core/events';

describe('Meta-Upgrades Subsystem (§4.8)', () => {
  it('loads all 6 data-driven upgrade definitions from upgrades.json', () => {
    const defs = getUpgradeDefs();
    expect(defs).toHaveLength(6);

    const ids = defs.map((u) => u.id).sort();
    expect(ids).toEqual([
      'extra_heart',
      'lantern_capacity',
      'reserve_oil',
      'soft_shoes',
      'stair_compass',
      'starting_rope',
    ]);
  });

  it('determines next tier cost and correctly recognizes max tier cap', () => {
    const emptyUpgrades: Record<string, number> = {};

    expect(getUpgradeTier(emptyUpgrades, 'lantern_capacity')).toBe(0);
    expect(getUpgradeTier({ lantern_capacity: 3 }, 'lantern_capacity')).toBe(3);

    // Lantern capacity: 5 tiers (50, 100, 200, 400, 800)
    expect(getNextTierCost(emptyUpgrades, 'lantern_capacity')).toBe(50);
    expect(getNextTierCost({ lantern_capacity: 1 }, 'lantern_capacity')).toBe(100);
    expect(getNextTierCost({ lantern_capacity: 4 }, 'lantern_capacity')).toBe(800);
    expect(getNextTierCost({ lantern_capacity: 5 }, 'lantern_capacity')).toBeNull();

    // Extra heart: 1 tier (300)
    expect(getNextTierCost(emptyUpgrades, 'extra_heart')).toBe(300);
    expect(getNextTierCost({ extra_heart: 1 }, 'extra_heart')).toBeNull();
  });

  it('validates purchase eligibility based on banked gold and tier limits', () => {
    const upgrades: Record<string, number> = { lantern_capacity: 0 };

    // Cost 50: 40 is insufficient, 50 is sufficient
    expect(canPurchaseUpgrade(40, upgrades, 'lantern_capacity')).toBe(false);
    expect(canPurchaseUpgrade(50, upgrades, 'lantern_capacity')).toBe(true);

    // Max tier capping
    expect(canPurchaseUpgrade(1000, { lantern_capacity: 5 }, 'lantern_capacity')).toBe(false);
  });

  it('atomically executes upgrade purchase, deducting vault gold and updating tier', () => {
    const initialSave: GameSave = {
      ...DEFAULT_SAVE,
      bankedGold: 200,
      upgrades: {},
    };

    // Purchase Tier 1 of lantern_capacity (cost 50)
    const result1 = purchaseUpgrade(initialSave, 'lantern_capacity');
    expect(result1.success).toBe(true);
    expect(result1.cost).toBe(50);
    expect(result1.newSave.bankedGold).toBe(150);
    expect(result1.newSave.upgrades['lantern_capacity']).toBe(1);

    // Purchase Tier 2 of lantern_capacity (cost 100)
    const result2 = purchaseUpgrade(result1.newSave, 'lantern_capacity');
    expect(result2.success).toBe(true);
    expect(result2.cost).toBe(100);
    expect(result2.newSave.bankedGold).toBe(50);
    expect(result2.newSave.upgrades['lantern_capacity']).toBe(2);

    // Attempt purchase Tier 3 (cost 200, only 50 gold available)
    const result3 = purchaseUpgrade(result2.newSave, 'lantern_capacity');
    expect(result3.success).toBe(false);
    expect(result3.cost).toBe(0);
    expect(result3.newSave.bankedGold).toBe(50);
    expect(result3.newSave.upgrades['lantern_capacity']).toBe(2);
  });

  it('calculates noise reduction with soft_shoes upgrade (-10% per tier up to 3 tiers)', () => {
    const baseNoise = 4; // Walk base noise

    expect(calculateNoiseWithBoots(baseNoise, 0)).toBe(4);
    expect(calculateNoiseWithBoots(baseNoise, 1)).toBe(3.6);
    expect(calculateNoiseWithBoots(baseNoise, 2)).toBe(3.2);
    expect(calculateNoiseWithBoots(baseNoise, 3)).toBe(2.8);
  });

  it('correctly applies active upgrades to initial DungeonState on run start', () => {
    const rng = new Rng(12345);
    const floor = generateDungeon(rng, 1);
    const eventBus = new EventBus();

    const state: DungeonState = {
      floor,
      playerPos: { ...floor.entrance },
      movementMode: 'walk',
      turnCount: 0,
      depth: 1,
      hp: 2,
      carriedGold: 0,
      bankedGold: 500,
      oil: 100,
      maxOil: 100,
      dread: 0,
      goldPiles: [],
      oilFlasks: [],
      eventBus,
      rng,
      isExtracted: false,
      isDead: false,
    };

    const upgrades: Record<string, number> = {
      lantern_capacity: 2, // +20 max oil
      extra_heart: 1,      // +1 HP
      starting_rope: 1,    // +1 starting rope
      stair_compass: 1,    // stairs revealed on floor 1
    };

    applyUpgradesToState(state, upgrades);

    expect(state.maxOil).toBe(120);
    expect(state.oil).toBe(120);
    expect(state.hp).toBe(3);
    expect(state.ropeCount).toBe(1);
    expect(state.stairsRevealed).toBe(true);
  });
});
