/**
 * Fear Mechanics (Oil, Dread, Noise, Light Radius) for DEEPER.
 * Pure TypeScript, zero Phaser imports.
 */

import { MovementMode } from './turn';

/**
 * Calculates oil cost per step:
 * (1 + 0.15 * depth) * modeMultiplier
 * Sneak: 1.5x, Walk: 1.0x, Run: 0.7x per tile.
 */
export function oilCostPerStep(depth: number, mode: MovementMode): number {
  const d = Math.max(1, depth);
  const base = 1 + 0.15 * d;

  switch (mode) {
    case 'sneak':
      return base * 1.5;
    case 'walk':
      return base * 1.0;
    case 'run':
      return base * 0.7;
  }
}

/**
 * Calculates dynamic light radius (2 to 6 tiles):
 * lightRadius = 2 + round(4 * oil / maxOil)
 * If dread >= 40: -1 (min 2 while oil > 0)
 * If oil <= 0: fixed at 1 (embers in the dark)
 */
export function calculateLightRadius(oil: number, maxOil: number, dread: number): number {
  if (oil <= 0) {
    return 1;
  }

  const validMax = Math.max(1, maxOil);
  const ratio = Math.max(0, Math.min(1, oil / validMax));
  let radius = 2 + Math.round(4 * ratio);

  if (dread >= 40) {
    radius = Math.max(2, radius - 1);
  }

  return Math.min(6, Math.max(1, radius));
}

/**
 * Calculates noise radius based on movement mode and Dread level:
 * sneak: 2 tiles, walk: 4 tiles, run: 7 tiles.
 * If dread >= 100: noise radius is doubled.
 */
export function calculateNoiseRadius(mode: MovementMode, dread: number): number {
  let base: number;
  switch (mode) {
    case 'sneak':
      base = 2;
      break;
    case 'walk':
      base = 4;
      break;
    case 'run':
      base = 7;
      break;
  }

  if (dread >= 100) {
    return base * 2;
  }

  return base;
}

/**
 * Updates Dread meter (0 to 100):
 * In light: -3 Dread
 * In darkness: +2 Dread (+4 if oil is depleted)
 */
export function updateDread(currentDread: number, isInLight: boolean, oilDepleted: boolean): number {
  if (isInLight) {
    return Math.max(0, currentDread - 3);
  }

  const delta = oilDepleted ? 4 : 2;
  return Math.min(100, currentDread + delta);
}
