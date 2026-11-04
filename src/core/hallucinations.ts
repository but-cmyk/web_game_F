/**
 * Hallucination Subsystem for DEEPER.
 * Governs psychological phantoms when Dread >= 70:
 * - 15% chance to spawn phantoms every 5 steps.
 * - Zero Damage Invariant: Phantoms never inflict combat damage.
 * - Evaporates into smoke within <= 2 tiles of the player, penalizing +5 Dread.
 * Pure TypeScript, zero Phaser imports, zero Math.random.
 */

import { Coord, toIndex, manhattanDistance } from './grid';
import { DungeonFloor } from './mapgen';
import { Rng } from './rng';
import { EventBus } from './events';

export interface Hallucination {
  readonly id: string;
  readonly type: 'crawler' | 'stalker';
  x: number;
  y: number;
  lifetime: number;
}

export interface HallucinationUpdateResult {
  readonly remainingHallucinations: Hallucination[];
  readonly evaporatedCount: number;
  readonly newDread: number;
  readonly playerHp: number;
}

/**
 * Checks whether a hallucination should spawn on the current step.
 */
export function shouldSpawnHallucination(
  dread: number,
  stepCount: number,
  rng: Rng
): boolean {
  if (dread < 70) return false;
  if (stepCount <= 0 || stepCount % 5 !== 0) return false;

  return rng.nextInt(1, 100) <= 15;
}

/**
 * Spawns a new phantom hallucination near the player on a walkable tile.
 */
export function spawnHallucination(
  floor: DungeonFloor,
  playerPos: Coord,
  rng: Rng,
  idSuffix: number
): Hallucination | null {
  const candidates: Coord[] = [];

  for (let dy = -6; dy <= 6; dy++) {
    for (let dx = -6; dx <= 6; dx++) {
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist >= 3 && dist <= 6) {
        const x = playerPos.x + dx;
        const y = playerPos.y + dy;
        if (x >= 0 && x < floor.width && y >= 0 && y < floor.height) {
          const idx = toIndex(x, y, floor.width);
          if (floor.tiles[idx] === 'FLOOR') {
            candidates.push({ x, y });
          }
        }
      }
    }
  }

  if (candidates.length === 0) return null;

  const pick = candidates[rng.nextInt(0, candidates.length - 1)];
  const type = rng.nextInt(1, 2) === 1 ? 'crawler' : 'stalker';

  return {
    id: `phantom_${idSuffix}`,
    type,
    x: pick.x,
    y: pick.y,
    lifetime: 12,
  };
}

/**
 * Updates hallucination lifecycle and enforces the Zero Damage Invariant.
 */
export function updateHallucinations(
  hallucinations: readonly Hallucination[],
  playerPos: Coord,
  currentDread: number,
  playerHp: number,
  eventBus: EventBus
): HallucinationUpdateResult {
  const remaining: Hallucination[] = [];
  let evaporatedCount = 0;
  let newDread = currentDread;

  for (const h of hallucinations) {
    const dist = manhattanDistance(h, playerPos);

    if (dist <= 2) {
      // Evaporates into smoke
      evaporatedCount += 1;
      newDread = Math.min(100, newDread + 5);

      eventBus.emit('HallucinationEvaporated', {
        id: h.id,
        x: h.x,
        y: h.y,
      });
    } else if (h.lifetime - 1 > 0) {
      remaining.push({
        ...h,
        lifetime: h.lifetime - 1,
      });
    }
  }

  return {
    remainingHallucinations: remaining,
    evaporatedCount,
    newDread,
    playerHp, // ZERO DAMAGE INVARIANT: unmodified
  };
}
