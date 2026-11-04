/**
 * Cursed Chest & Curse Subsystem for DEEPER.
 * Implements deterministic 25% equal curse selection and runtime gameplay modifiers:
 * - stalker_haunt: Spawns Stalker at entrance
 * - blindness: Light radius -1
 * - heavy_footsteps: Noise radius +50%
 * - darkness_tax: +20 Dread on floor transition
 * Pure TypeScript, zero Phaser imports, zero Math.random.
 */

import cursesData from '../data/curses.json';
import { Rng } from './rng';
import { EventBus } from './events';

export interface Curse {
  readonly id: string;
  readonly effect: string;
  readonly radiusDelta?: number;
  readonly noiseMultiplier?: number;
  readonly dreadAddition?: number;
}

/**
 * Rolls one of the 4 curses from curses.json with equal 25% probability.
 */
export function rollCursedChestCurse(rng: Rng): Curse {
  const chosen = rng.pick(cursesData.curses);

  return {
    id: chosen.id,
    effect: chosen.effect,
    radiusDelta: 'radius_delta' in chosen ? (chosen as { radius_delta: number }).radius_delta : undefined,
    noiseMultiplier: 'noise_multiplier' in chosen ? (chosen as { noise_multiplier: number }).noise_multiplier : undefined,
    dreadAddition: 'dread_addition' in chosen ? (chosen as { dread_addition: number }).dread_addition : undefined,
  };
}

/**
 * Applies light radius curse modifiers (e.g., blindness).
 */
export function applyCurseLightModifier(currentRadius: number, activeCurses: readonly Curse[]): number {
  let radius = currentRadius;
  for (const curse of activeCurses) {
    if (curse.effect === 'reduce_light_radius' && curse.radiusDelta) {
      radius = Math.max(1, radius + curse.radiusDelta);
    }
  }
  return radius;
}

/**
 * Applies noise emission curse modifiers (e.g., heavy_footsteps).
 */
export function applyCurseNoiseModifier(baseRadius: number, activeCurses: readonly Curse[]): number {
  let radius = baseRadius;
  for (const curse of activeCurses) {
    if (curse.effect === 'increase_noise' && curse.noiseMultiplier) {
      radius = Math.round(radius * curse.noiseMultiplier);
    }
  }
  return radius;
}

/**
 * Applies floor transition curses (e.g., darkness_tax).
 */
export function applyFloorTransitionCurses(
  currentDread: number,
  activeCurses: readonly Curse[],
  eventBus: EventBus
): number {
  let dread = currentDread;
  for (const curse of activeCurses) {
    if (curse.effect === 'floor_transition_dread' && curse.dreadAddition) {
      const old = dread;
      dread = Math.min(100, dread + curse.dreadAddition);
      if (dread !== old) {
        eventBus.emit('DreadChanged', {
          oldDread: old,
          newDread: dread,
          reason: 'curse_darkness_tax',
        });
      }
    }
  }
  return dread;
}
