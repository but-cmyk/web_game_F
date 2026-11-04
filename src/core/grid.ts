/**
 * Grid Mathematics & BFS Pathfinding for DEEPER.
 * Coordinate convention: x right, y down, (x, y) parameter ordering.
 * Index conversion: index = y * width + x.
 * Pure TypeScript, zero Phaser imports.
 */

export interface Coord {
  readonly x: number;
  readonly y: number;
}

export type Direction = 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW';

export function toIndex(x: number, y: number, width: number): number {
  return y * width + x;
}

export function toCoord(index: number, width: number): Coord {
  return {
    x: index % width,
    y: Math.floor(index / width),
  };
}

export function inBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

export function manhattanDistance(a: Coord, b: Coord): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function chebyshevDistance(a: Coord, b: Coord): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function euclideanDistance(a: Coord, b: Coord): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getCardinals(coord: Coord): Coord[] {
  return [
    { x: coord.x, y: coord.y - 1 }, // N
    { x: coord.x, y: coord.y + 1 }, // S
    { x: coord.x + 1, y: coord.y }, // E
    { x: coord.x - 1, y: coord.y }, // W
  ];
}

export function getAllNeighbors(coord: Coord): Coord[] {
  return [
    { x: coord.x, y: coord.y - 1 }, // N
    { x: coord.x, y: coord.y + 1 }, // S
    { x: coord.x + 1, y: coord.y }, // E
    { x: coord.x - 1, y: coord.y }, // W
    { x: coord.x + 1, y: coord.y - 1 }, // NE
    { x: coord.x - 1, y: coord.y - 1 }, // NW
    { x: coord.x + 1, y: coord.y + 1 }, // SE
    { x: coord.x - 1, y: coord.y + 1 }, // SW
  ];
}

/**
 * Bresenham's straight line algorithm between two coordinates (inclusive).
 */
export function bresenhamLine(start: Coord, end: Coord): Coord[] {
  const points: Coord[] = [];
  let x0 = start.x;
  let y0 = start.y;
  const x1 = end.x;
  const y1 = end.y;

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    points.push({ x: x0, y: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }

  return points;
}

/**
 * Breadth-First Search (BFS) propagation from source up to maxDistance.
 * Evaluates path distance around walls/obstacles.
 * Returns map of "x,y" string -> path distance.
 */
export function propagateBFS(
  source: Coord,
  maxDistance: number,
  isPassable: (coord: Coord) => boolean
): Map<string, number> {
  const distances = new Map<string, number>();
  const queue: { coord: Coord; dist: number }[] = [];

  const sourceKey = `${source.x},${source.y}`;
  distances.set(sourceKey, 0);
  queue.push({ coord: source, dist: 0 });

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.dist >= maxDistance) continue;

    for (const neighbor of getCardinals(current.coord)) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!distances.has(key) && isPassable(neighbor)) {
        const nextDist = current.dist + 1;
        distances.set(key, nextDist);
        queue.push({ coord: neighbor, dist: nextDist });
      }
    }
  }

  return distances;
}

/**
 * Shortest path between start and target using BFS.
 * Returns coordinate array excluding start, or null if target is unreachable.
 */
export function bfsPath(
  start: Coord,
  target: Coord,
  isPassable: (coord: Coord) => boolean,
  _width: number,
  _height: number
): Coord[] | null {
  if (start.x === target.x && start.y === target.y) return [];
  if (!isPassable(target)) return null;

  const queue: Coord[] = [start];
  const cameFrom = new Map<string, Coord>();
  const visited = new Set<string>([`${start.x},${start.y}`]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.x === target.x && current.y === target.y) {
      // Reconstruct path
      const path: Coord[] = [];
      let curr = target;
      while (curr.x !== start.x || curr.y !== start.y) {
        path.unshift(curr);
        curr = cameFrom.get(`${curr.x},${curr.y}`)!;
      }
      return path;
    }

    for (const next of getCardinals(current)) {
      const key = `${next.x},${next.y}`;
      if (!visited.has(key) && isPassable(next)) {
        visited.add(key);
        cameFrom.set(key, current);
        queue.push(next);
      }
    }
  }

  return null;
}
