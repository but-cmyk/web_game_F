/**
 * Line of Sight and Circular FOV (Field of View) for DEEPER.
 * Implements 360-degree raycasting with Bresenham rays, wall surface occlusion,
 * and persistent Fog of War memory.
 * Pure TypeScript, zero Phaser imports.
 */

import { Coord, inBounds, toIndex, bresenhamLine } from './grid';

export interface FogOfWar {
  readonly width: number;
  readonly height: number;
  explored: boolean[];
  visible: boolean[];
}

export function createFogOfWar(width: number, height: number): FogOfWar {
  return {
    width,
    height,
    explored: new Array(width * height).fill(false),
    visible: new Array(width * height).fill(false),
  };
}

export function updateFogOfWar(fog: FogOfWar, visibleIndices: Iterable<number>): void {
  fog.visible.fill(false);
  for (const idx of visibleIndices) {
    if (idx >= 0 && idx < fog.visible.length) {
      fog.visible[idx] = true;
      fog.explored[idx] = true;
    }
  }
}

/**
 * Computes visible tile indices from origin within circular radius.
 * Casts dense rays around 360 degrees.
 * When a ray hits an opaque tile, that tile itself is marked visible (the front surface of the wall),
 * but further propagation along that ray is blocked.
 */
export function computeFOV(
  origin: Coord,
  radius: number,
  isOpaque: (coord: Coord) => boolean,
  width: number,
  height: number
): Set<number> {
  const visible = new Set<number>();

  if (!inBounds(origin.x, origin.y, width, height)) {
    return visible;
  }

  // Origin is always visible
  visible.add(toIndex(origin.x, origin.y, width));

  if (radius <= 0) {
    return visible;
  }

  // Cast 720 rays (every 0.5 degrees) to guarantee no sub-tile ray gaps
  const rayCount = 720;
  const angleStep = (2 * Math.PI) / rayCount;

  for (let i = 0; i < rayCount; i++) {
    const angle = i * angleStep;
    const targetX = Math.round(origin.x + radius * Math.cos(angle));
    const targetY = Math.round(origin.y + radius * Math.sin(angle));

    const line = bresenhamLine(origin, { x: targetX, y: targetY });

    for (const pt of line) {
      // Check Euclidean distance
      const dist = Math.hypot(pt.x - origin.x, pt.y - origin.y);
      if (dist > radius) {
        break;
      }

      if (!inBounds(pt.x, pt.y, width, height)) {
        break;
      }

      const idx = toIndex(pt.x, pt.y, width);
      visible.add(idx);

      // If opaque wall encountered (and not origin), the wall itself is visible, but ray stops
      if (isOpaque(pt) && !(pt.x === origin.x && pt.y === origin.y)) {
        break;
      }
    }
  }

  return visible;
}

