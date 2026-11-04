import { describe, it, expect } from 'vitest';
import {
  toIndex,
  toCoord,
  inBounds,
  manhattanDistance,
  chebyshevDistance,
  euclideanDistance,
  getCardinals,
  getAllNeighbors,
  bresenhamLine,
  propagateBFS,
  bfsPath,
  Coord,
} from '../src/core/grid';

describe('Grid Utilities', () => {
  it('converts between (x, y) coordinates and linear index accurately', () => {
    const width = 40;
    const x = 15;
    const y = 8;
    const idx = toIndex(x, y, width);
    expect(idx).toBe(8 * 40 + 15);

    const coord = toCoord(idx, width);
    expect(coord).toEqual({ x: 15, y: 8 });
  });

  it('correctly validates bounds for a 40x30 dungeon floor', () => {
    const width = 40;
    const height = 30;

    expect(inBounds(0, 0, width, height)).toBe(true);
    expect(inBounds(39, 29, width, height)).toBe(true);
    expect(inBounds(-1, 5, width, height)).toBe(false);
    expect(inBounds(40, 5, width, height)).toBe(false);
    expect(inBounds(10, -1, width, height)).toBe(false);
    expect(inBounds(10, 30, width, height)).toBe(false);
  });

  it('computes Manhattan and Chebyshev distances correctly', () => {
    const a: Coord = { x: 2, y: 3 };
    const b: Coord = { x: 7, y: 9 };

    // dx = 5, dy = 6
    expect(manhattanDistance(a, b)).toBe(11);
    expect(chebyshevDistance(a, b)).toBe(6);
    expect(euclideanDistance(a, b)).toBeCloseTo(7.81, 2);
  });

  it('returns valid cardinal and 8-direction neighbors', () => {
    const center: Coord = { x: 5, y: 5 };
    const cardinals = getCardinals(center);
    expect(cardinals).toHaveLength(4);
    expect(cardinals).toContainEqual({ x: 5, y: 4 }); // N
    expect(cardinals).toContainEqual({ x: 5, y: 6 }); // S
    expect(cardinals).toContainEqual({ x: 6, y: 5 }); // E
    expect(cardinals).toContainEqual({ x: 4, y: 5 }); // W

    const all = getAllNeighbors(center);
    expect(all).toHaveLength(8);
  });

  it('computes continuous Bresenham line ray', () => {
    const start: Coord = { x: 1, y: 1 };
    const end: Coord = { x: 4, y: 4 };
    const line = bresenhamLine(start, end);

    expect(line[0]).toEqual(start);
    expect(line[line.length - 1]).toEqual(end);
    expect(line).toHaveLength(4);
  });

  it('BFS propagates along path distance and is strictly blocked by walls', () => {
    // 5x5 grid with a vertical wall blocking column 2 except at y=0
    // (0,2) to (4,2) must navigate around wall
    const wallTiles = new Set(['2,1', '2,2', '2,3', '2,4']); // solid wall at x=2
    const isPassable = (c: Coord) => !wallTiles.has(`${c.x},${c.y}`) && inBounds(c.x, c.y, 5, 5);

    const source: Coord = { x: 1, y: 2 };
    const reachable = propagateBFS(source, 6, isPassable);

    // Coordinate immediately behind wall (3, 2) cannot be reached in 2 steps
    // Euclidean distance is 2, but BFS path must go through (1,2)->(1,1)->(1,0)->(2,0)->(3,0)->(3,1)->(3,2) = 6 steps
    expect(reachable.get('3,2')).toBe(6);

    // A coordinate behind wall at distance 7 cannot be reached with maxDistance=6
    expect(reachable.has('4,4')).toBe(false);

    // Wall coordinate itself is not reachable
    expect(reachable.has('2,2')).toBe(false);
  });

  it('finds shortest path via BFS or returns null if blocked', () => {
    const walls = new Set(['1,0', '1,1', '1,2']);
    const isPassable = (c: Coord) => !walls.has(`${c.x},${c.y}`) && inBounds(c.x, c.y, 3, 3);

    const path = bfsPath({ x: 0, y: 0 }, { x: 2, y: 0 }, isPassable, 3, 3);
    // Path must go around the wall: (0,0) -> (0,1) -> (0,2) -> (1,2) -> (2,2) -> (2,1) -> (2,0)
    // Wait, (1,2) is a wall in our set, so it's blocked completely!
    expect(path).toBeNull();
  });
});

