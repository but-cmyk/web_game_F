/**
 * Loot Calculation & Gold Pile Spawning for DEEPER.
 * Pure TypeScript, zero Phaser imports.
 */

import { Rng } from './rng';
import { Coord, toIndex } from './grid';
import { DungeonFloor } from './mapgen';

export interface GoldPile {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly amount: number;
}

/**
 * Calculates base loot value scaled by depth:
 * lootValue(depth) = round(10 * 1.3^(depth - 1))
 */
export function lootValue(depth: number): number {
  const d = Math.max(1, depth);
  return Math.round(10 * Math.pow(1.3, d - 1));
}

/**
 * Deterministically spawns 4-6 gold piles on walkable floor tiles.
 */
export function spawnGoldPiles(floor: DungeonFloor, depth: number, rng: Rng): GoldPile[] {
  const count = rng.nextInt(4, 6);
  const amount = lootValue(depth);

  const candidates: Coord[] = [];
  for (let y = 0; y < floor.height; y++) {
    for (let x = 0; x < floor.width; x++) {
      const idx = toIndex(x, y, floor.width);
      if (floor.tiles[idx] !== 'FLOOR') continue;
      if (x === floor.entrance.x && y === floor.entrance.y) continue;
      if (x === floor.stairsDown.x && y === floor.stairsDown.y) continue;
      candidates.push({ x, y });
    }
  }

  const piles: GoldPile[] = [];
  const chosenIndices = new Set<number>();
  const needed = Math.min(count, candidates.length);

  while (piles.length < needed) {
    const pickIdx = rng.nextInt(0, candidates.length - 1);
    if (!chosenIndices.has(pickIdx)) {
      chosenIndices.add(pickIdx);
      const coord = candidates[pickIdx];
      piles.push({
        id: `gold_${depth}_${piles.length}_${coord.x}_${coord.y}`,
        x: coord.x,
        y: coord.y,
        amount,
      });
    }
  }

  return piles;
}

/**
 * Checks if a gold pile is at target position, returns collected amount and remaining piles.
 */
export function pickupGold(
  piles: readonly GoldPile[],
  pos: Coord
): { remainingPiles: GoldPile[]; collectedAmount: number } {
  let collectedAmount = 0;
  const remainingPiles: GoldPile[] = [];

  for (const pile of piles) {
    if (pile.x === pos.x && pile.y === pos.y) {
      collectedAmount += pile.amount;
    } else {
      remainingPiles.push(pile);
    }
  }

  return { remainingPiles, collectedAmount };
}

