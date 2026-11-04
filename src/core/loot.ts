/**
 * Loot Calculation & Gold Pile Spawning for DEEPER.
 * Pure TypeScript, zero Phaser imports.
 */

import { Rng } from './rng';
import { Coord, toIndex } from './grid';
import { DungeonFloor } from './mapgen';
import { isBargainFloor, selectFloorBargains, Bargain } from './bargains';
import itemsData from '../data/items.json';

export interface GoldPile {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly amount: number;
}

export interface OilFlask {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly amount: number;
}

export interface Chest {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly isCursed: boolean;
  readonly goldValue: number;
  isOpen: boolean;
}

export interface BargainPedestal {
  readonly x: number;
  readonly y: number;
  readonly bargains: readonly Bargain[];
  isUsed: boolean;
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

/**
 * Deterministically spawns 2-3 oil flasks (+15 oil each) on walkable floor tiles.
 */
export function spawnOilFlasks(floor: DungeonFloor, depth: number, rng: Rng): OilFlask[] {
  const count = rng.nextInt(2, 3);
  const amount = itemsData.items.find((i) => i.id === 'oil_flask')?.oil_restore ?? 25;

  const candidates: Coord[] = [];
  for (let y = 0; y < floor.height; y++) {
    for (let x = 0; x < floor.width; x++) {
      const idx = toIndex(x, y, floor.width);
      if (floor.tiles[idx] !== 'FLOOR') continue;
      if (x === floor.entrance.x && y === floor.entrance.y) continue;
      if (x === floor.stairsDown.x && y === floor.stairsDown.y) continue;
      if (floor.extractionStation && x === floor.extractionStation.x && y === floor.extractionStation.y) continue;
      candidates.push({ x, y });
    }
  }

  const flasks: OilFlask[] = [];
  const chosenIndices = new Set<number>();
  const needed = Math.min(count, candidates.length);

  while (flasks.length < needed) {
    const pickIdx = rng.nextInt(0, candidates.length - 1);
    if (!chosenIndices.has(pickIdx)) {
      chosenIndices.add(pickIdx);
      const coord = candidates[pickIdx];
      flasks.push({
        id: `oil_${depth}_${flasks.length}_${coord.x}_${coord.y}`,
        x: coord.x,
        y: coord.y,
        amount,
      });
    }
  }

  return flasks;
}

/**
 * Deterministically spawns chests (standard 3x lootValue and cursed 4.5x lootValue).
 */
export function spawnChests(floor: DungeonFloor, depth: number, rng: Rng): Chest[] {
  const chests: Chest[] = [];
  const baseValue = lootValue(depth);

  const candidates: Coord[] = [];
  for (let y = 0; y < floor.height; y++) {
    for (let x = 0; x < floor.width; x++) {
      const idx = toIndex(x, y, floor.width);
      if (floor.tiles[idx] !== 'FLOOR') continue;
      if (x === floor.entrance.x && y === floor.entrance.y) continue;
      if (x === floor.stairsDown.x && y === floor.stairsDown.y) continue;
      if (floor.extractionStation && x === floor.extractionStation.x && y === floor.extractionStation.y) continue;
      candidates.push({ x, y });
    }
  }

  if (candidates.length === 0) return chests;

  // 1 standard chest (worth 3x lootValue)
  const pick1 = candidates.splice(rng.nextInt(0, candidates.length - 1), 1)[0];
  chests.push({
    id: `chest_std_${depth}_${pick1.x}_${pick1.y}`,
    x: pick1.x,
    y: pick1.y,
    isCursed: false,
    goldValue: baseValue * 3,
    isOpen: false,
  });

  // Cursed chest from depth >= 2 with 50% probability
  if (depth >= 2 && candidates.length > 0 && rng.nextInt(1, 100) <= 50) {
    const pick2 = candidates.splice(rng.nextInt(0, candidates.length - 1), 1)[0];
    chests.push({
      id: `chest_cursed_${depth}_${pick2.x}_${pick2.y}`,
      x: pick2.x,
      y: pick2.y,
      isCursed: true,
      goldValue: Math.round(baseValue * 4.5),
      isOpen: false,
    });
  }

  return chests;
}

/**
 * Spawns an obsidian devil's bargain altar on even floors (depth 2, 4, 6, 8, 10).
 */
export function spawnBargainPedestal(
  floor: DungeonFloor,
  depth: number,
  rng: Rng
): BargainPedestal | null {
  if (!isBargainFloor(depth)) return null;

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

  if (candidates.length === 0) return null;

  const pick = candidates[rng.nextInt(0, candidates.length - 1)];
  const bargains = selectFloorBargains(rng);

  return {
    x: pick.x,
    y: pick.y,
    bargains,
    isUsed: false,
  };
}

/**
 * Checks if a chest is at target position, returns opened chest if found.
 */
export function pickupChest(
  chests: readonly Chest[],
  pos: Coord
): { remainingChests: Chest[]; openedChest: Chest | null } {
  let openedChest: Chest | null = null;
  const remainingChests: Chest[] = [];

  for (const c of chests) {
    if (c.x === pos.x && c.y === pos.y && !c.isOpen) {
      openedChest = { ...c, isOpen: true };
    } else {
      remainingChests.push(c);
    }
  }

  return { remainingChests, openedChest };
}

/**
 * Checks if an oil flask is at target position, returns collected amount and remaining flasks.
 */
export function pickupOilFlask(
  flasks: readonly OilFlask[],
  pos: Coord
): { remainingFlasks: OilFlask[]; collectedAmount: number } {
  let collectedAmount = 0;
  const remainingFlasks: OilFlask[] = [];

  for (const flask of flasks) {
    if (flask.x === pos.x && flask.y === pos.y) {
      collectedAmount += flask.amount;
    } else {
      remainingFlasks.push(flask);
    }
  }

  return { remainingFlasks, collectedAmount };
}

