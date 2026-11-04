/**
 * Meta-Upgrades Subsystem for DEEPER.
 * Data-driven persistent upgrades purchased solely with banked vault gold.
 * Pure TypeScript, zero Phaser imports, zero Math.random.
 */

import upgradesData from '../data/upgrades.json';
import { GameSave } from '../services/SaveStore';
import { DungeonState } from './turn';
import { toIndex } from './grid';
import { OilFlask } from './loot';

export interface UpgradeDef {
  readonly id: string;
  readonly nameKey: string;
  readonly descKey: string;
  readonly maxTiers: number;
  readonly tierCosts: readonly number[];
  readonly effectPerTier?: number;
  readonly noiseReductionPerTier?: number;
  readonly ropesGranted?: number;
  readonly hpGranted?: number;
  readonly revealStairsUses?: number;
  readonly flaskOnEvenFloors?: number;
}

/**
 * Returns all upgrade definitions normalized from upgrades.json.
 */
export function getUpgradeDefs(): readonly UpgradeDef[] {
  return upgradesData.upgrades.map((u) => ({
    id: u.id,
    nameKey: u.name_key,
    descKey: u.desc_key,
    maxTiers: u.max_tiers,
    tierCosts: u.tier_costs,
    effectPerTier: 'effect_per_tier' in u ? (u as { effect_per_tier: number }).effect_per_tier : undefined,
    noiseReductionPerTier:
      'noise_reduction_per_tier' in u
        ? (u as { noise_reduction_per_tier: number }).noise_reduction_per_tier
        : undefined,
    ropesGranted: 'ropes_granted' in u ? (u as { ropes_granted: number }).ropes_granted : undefined,
    hpGranted: 'hp_granted' in u ? (u as { hp_granted: number }).hp_granted : undefined,
    revealStairsUses:
      'reveal_stairs_uses' in u ? (u as { reveal_stairs_uses: number }).reveal_stairs_uses : undefined,
    flaskOnEvenFloors:
      'flask_on_even_floors' in u ? (u as { flask_on_even_floors: number }).flask_on_even_floors : undefined,
  }));
}

/**
 * Retrieves the current purchased tier for a given upgrade ID (defaults to 0).
 */
export function getUpgradeTier(upgrades: Readonly<Record<string, number>>, id: string): number {
  return upgrades[id] ?? 0;
}

/**
 * Calculates the vault gold cost for the next tier of an upgrade, or null if already at max tier.
 */
export function getNextTierCost(upgrades: Readonly<Record<string, number>>, id: string): number | null {
  const def = getUpgradeDefs().find((u) => u.id === id);
  if (!def) return null;

  const currentTier = getUpgradeTier(upgrades, id);
  if (currentTier >= def.maxTiers) return null;

  return def.tierCosts[currentTier] ?? null;
}

/**
 * Validates whether the player has sufficient banked gold and has not reached the max tier.
 */
export function canPurchaseUpgrade(
  bankedGold: number,
  upgrades: Readonly<Record<string, number>>,
  id: string
): boolean {
  const cost = getNextTierCost(upgrades, id);
  if (cost === null) return false;
  return bankedGold >= cost;
}

/**
 * Atomically executes an upgrade purchase, deducting banked gold and incrementing tier.
 */
export function purchaseUpgrade(
  save: GameSave,
  id: string
): { success: boolean; newSave: GameSave; cost: number } {
  if (!canPurchaseUpgrade(save.bankedGold, save.upgrades, id)) {
    return { success: false, newSave: save, cost: 0 };
  }

  const cost = getNextTierCost(save.upgrades, id)!;
  const currentTier = getUpgradeTier(save.upgrades, id);
  const newUpgrades: Record<string, number> = {
    ...save.upgrades,
    [id]: currentTier + 1,
  };

  const newSave: GameSave = {
    ...save,
    bankedGold: save.bankedGold - cost,
    upgrades: newUpgrades,
  };

  return { success: true, newSave, cost };
}

/**
 * Calculates noise radius after applying soft_shoes noise reduction (-10% per tier, max -30%).
 */
export function calculateNoiseWithBoots(baseNoise: number, softShoesTier: number): number {
  const reduction = Math.min(0.3, Math.max(0, softShoesTier) * 0.1);
  return Math.round(baseNoise * (1 - reduction) * 10) / 10;
}

/**
 * Applies active meta-upgrades to DungeonState on run initialization or floor progression.
 */
export function applyUpgradesToState(
  state: DungeonState,
  upgrades: Readonly<Record<string, number>>
): void {
  // 1. Lantern capacity (+10 max oil per tier, up to 5 tiers)
  const lanternTier = getUpgradeTier(upgrades, 'lantern_capacity');
  if (lanternTier > 0) {
    const additionalOil = lanternTier * 10;
    state.maxOil = 100 + additionalOil;
    if (state.turnCount === 0) {
      state.oil = state.maxOil;
    }
  }

  // 2. Extra heart (+1 starting HP)
  const heartTier = getUpgradeTier(upgrades, 'extra_heart');
  if (heartTier > 0 && state.turnCount === 0) {
    state.hp = 3;
  }

  // 3. Starting rope (begins run with 1 escape rope)
  const ropeTier = getUpgradeTier(upgrades, 'starting_rope');
  if (ropeTier > 0 && state.turnCount === 0) {
    state.ropeCount = (state.ropeCount ?? 0) + 1;
  }

  // 4. Stair compass (reveals stairs location on floor 1)
  const compassTier = getUpgradeTier(upgrades, 'stair_compass');
  if (compassTier > 0 && state.depth === 1) {
    state.stairsRevealed = true;
  }

  // 5. Reserve oil (+1 oil flask on even floors)
  const reserveTier = getUpgradeTier(upgrades, 'reserve_oil');
  if (reserveTier > 0 && state.depth % 2 === 0) {
    if (!state.oilFlasks) state.oilFlasks = [];
    const floor = state.floor;
    // Find an empty floor tile for the reserve flask
    for (let y = 1; y < floor.height - 1; y++) {
      for (let x = 1; x < floor.width - 1; x++) {
        const idx = toIndex(x, y, floor.width);
        if (floor.tiles[idx] !== 'FLOOR') continue;
        if (x === floor.entrance.x && y === floor.entrance.y) continue;
        if (x === floor.stairsDown.x && y === floor.stairsDown.y) continue;
        if (state.oilFlasks.some((f) => f.x === x && f.y === y)) continue;

        const flask: OilFlask = {
          id: `oil_reserve_${state.depth}_${x}_${y}`,
          x,
          y,
          amount: 15,
        };
        state.oilFlasks.push(flask);
        return;
      }
    }
  }
}

