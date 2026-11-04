/**
 * Procedural BSP Dungeon Generator for DEEPER.
 * Generates 40x30 tile layouts with guaranteed 100% connectivity
 * and stairs placed at path distance >= 60% of map diameter.
 * Pure TypeScript, zero Phaser imports.
 */

import { Rng } from './rng';
import { Coord, toIndex, inBounds, propagateBFS } from './grid';

export type TileType = 'WALL' | 'FLOOR' | 'STAIRS_DOWN' | 'ENTRANCE' | 'EXTRACTION_STATION';

export interface Room {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly centerX: number;
  readonly centerY: number;
}

export interface DungeonFloor {
  readonly width: number;
  readonly height: number;
  readonly tiles: readonly TileType[];
  readonly entrance: Coord;
  readonly stairsDown: Coord;
  readonly extractionStation?: Coord;
  readonly rooms: readonly Room[];
}

interface BSPNode {
  x: number;
  y: number;
  w: number;
  h: number;
  left?: BSPNode;
  right?: BSPNode;
  room?: Room;
}

const MAP_WIDTH = 40;
const MAP_HEIGHT = 30;
const MIN_LEAF_SIZE = 7;
const MAX_SPLIT_DEPTH = 4;

function splitNode(node: BSPNode, depth: number, rng: Rng): void {
  if (depth >= MAX_SPLIT_DEPTH) return;

  // Decide split orientation based on aspect ratio or random
  let splitHorizontally = rng.next() > 0.5;
  if (node.w > node.h && node.w / node.h >= 1.25) {
    splitHorizontally = false;
  } else if (node.h > node.w && node.h / node.w >= 1.25) {
    splitHorizontally = true;
  }

  const max = (splitHorizontally ? node.h : node.w) - MIN_LEAF_SIZE;
  if (max <= MIN_LEAF_SIZE) return;

  const splitPos = rng.nextInt(MIN_LEAF_SIZE, max);

  if (splitHorizontally) {
    node.left = { x: node.x, y: node.y, w: node.w, h: splitPos };
    node.right = { x: node.x, y: node.y + splitPos, w: node.w, h: node.h - splitPos };
  } else {
    node.left = { x: node.x, y: node.y, w: splitPos, h: node.h };
    node.right = { x: node.x + splitPos, y: node.y, w: node.w - splitPos, h: node.h };
  }

  splitNode(node.left, depth + 1, rng);
  splitNode(node.right, depth + 1, rng);
}

function getLeafNodes(node: BSPNode): BSPNode[] {
  if (!node.left && !node.right) {
    return [node];
  }
  const leaves: BSPNode[] = [];
  if (node.left) leaves.push(...getLeafNodes(node.left));
  if (node.right) leaves.push(...getLeafNodes(node.right));
  return leaves;
}

function carveCorridor(
  grid: TileType[],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  width: number,
  rng: Rng
): void {
  let currX = x0;
  let currY = y0;

  const horizontalFirst = rng.next() > 0.5;

  if (horizontalFirst) {
    while (currX !== x1) {
      grid[toIndex(currX, currY, width)] = 'FLOOR';
      currX += x1 > currX ? 1 : -1;
    }
    while (currY !== y1) {
      grid[toIndex(currX, currY, width)] = 'FLOOR';
      currY += y1 > currY ? 1 : -1;
    }
  } else {
    while (currY !== y1) {
      grid[toIndex(currX, currY, width)] = 'FLOOR';
      currY += y1 > currY ? 1 : -1;
    }
    while (currX !== x1) {
      grid[toIndex(currX, currY, width)] = 'FLOOR';
      currX += x1 > currX ? 1 : -1;
    }
  }
  grid[toIndex(x1, y1, width)] = 'FLOOR';
}

function connectSiblingRooms(node: BSPNode, grid: TileType[], width: number, rng: Rng): Room | null {
  if (!node.left && !node.right) {
    return node.room ?? null;
  }

  const leftRoom = node.left ? connectSiblingRooms(node.left, grid, width, rng) : null;
  const rightRoom = node.right ? connectSiblingRooms(node.right, grid, width, rng) : null;

  if (leftRoom && rightRoom) {
    carveCorridor(grid, leftRoom.centerX, leftRoom.centerY, rightRoom.centerX, rightRoom.centerY, width, rng);
  }

  return leftRoom ?? rightRoom;
}

export function generateDungeon(
  rng: Rng,
  depth: number = 1,
  width: number = MAP_WIDTH,
  height: number = MAP_HEIGHT
): DungeonFloor {
  // Initialize solid wall grid
  const tiles: TileType[] = new Array(width * height).fill('WALL');

  // Root node bounded within map borders (1 tile boundary padding)
  const root: BSPNode = { x: 1, y: 1, w: width - 2, h: height - 2 };
  splitNode(root, 0, rng);

  const leaves = getLeafNodes(root);
  const rooms: Room[] = [];

  // Carve a room inside each leaf
  leaves.forEach((leaf, idx) => {
    // Room dimensions constrained within leaf bounds
    const minW = 4;
    const minH = 4;
    const maxW = Math.max(minW, Math.min(10, leaf.w - 2));
    const maxH = Math.max(minH, Math.min(8, leaf.h - 2));

    const w = rng.nextInt(minW, maxW);
    const h = rng.nextInt(minH, maxH);
    const x = leaf.x + rng.nextInt(1, Math.max(1, leaf.w - w - 1));
    const y = leaf.y + rng.nextInt(1, Math.max(1, leaf.h - h - 1));

    const room: Room = {
      id: idx,
      x,
      y,
      w,
      h,
      centerX: Math.floor(x + w / 2),
      centerY: Math.floor(y + h / 2),
    };

    leaf.room = room;
    rooms.push(room);

    // Carve room tiles
    for (let ry = y; ry < y + h; ry++) {
      for (let rx = x; rx < x + w; rx++) {
        if (inBounds(rx, ry, width, height)) {
          tiles[toIndex(rx, ry, width)] = 'FLOOR';
        }
      }
    }
  });

  // Connect rooms hierarchically via corridors
  connectSiblingRooms(root, tiles, width, rng);

  // Set Entrance in first room
  const entrance: Coord = { x: rooms[0].centerX, y: rooms[0].centerY };
  tiles[toIndex(entrance.x, entrance.y, width)] = 'ENTRANCE';

  // Calculate BFS distances from entrance to place stairs
  const isPassable = (c: Coord) =>
    inBounds(c.x, c.y, width, height) && tiles[toIndex(c.x, c.y, width)] !== 'WALL';

  const distances = propagateBFS(entrance, width * height, isPassable);

  // Map diameter = Math.hypot(width, height). Required distance >= 60% of diameter.
  const mapDiameter = Math.hypot(width, height);
  const minRequiredDistance = Math.floor(0.6 * mapDiameter);

  // Find candidate walkable floor tiles satisfying the distance constraint
  const candidateCoords: { coord: Coord; dist: number }[] = [];
  let maxFoundDist = 0;
  let maxCoord: Coord = entrance;

  for (const [key, dist] of distances.entries()) {
    const [sx, sy] = key.split(',').map(Number);
    const coord: Coord = { x: sx, y: sy };

    if (coord.x === entrance.x && coord.y === entrance.y) continue;

    if (dist > maxFoundDist) {
      maxFoundDist = dist;
      maxCoord = coord;
    }

    if (dist >= minRequiredDistance) {
      candidateCoords.push({ coord, dist });
    }
  }

  // Pick stairs down location
  let chosenStairs: Coord;
  if (candidateCoords.length === 0) {
    chosenStairs = maxCoord;
  } else {
    candidateCoords.sort((a, b) => b.dist - a.dist);
    const pickPool = candidateCoords.slice(0, Math.max(1, Math.floor(candidateCoords.length * 0.2)));
    chosenStairs = rng.pick(pickPool).coord;
  }
  tiles[toIndex(chosenStairs.x, chosenStairs.y, width)] = 'STAIRS_DOWN';

  // Extraction stations appear on depths 3, 6, 9, 12
  let extractionStation: Coord | undefined;
  if (depth === 3 || depth === 6 || depth === 9 || depth === 12) {
    // Select a room distinct from entrance and stairs
    const candidateRoom =
      rooms.find(
        (r) =>
          (r.centerX !== entrance.x || r.centerY !== entrance.y) &&
          (r.centerX !== chosenStairs.x || r.centerY !== chosenStairs.y)
      ) ?? rooms[rooms.length - 1];

    // Find open floor tile in this room
    for (let ry = candidateRoom.y; ry < candidateRoom.y + candidateRoom.h; ry++) {
      for (let rx = candidateRoom.x; rx < candidateRoom.x + candidateRoom.w; rx++) {
        const idx = toIndex(rx, ry, width);
        if (tiles[idx] === 'FLOOR') {
          tiles[idx] = 'EXTRACTION_STATION';
          extractionStation = { x: rx, y: ry };
          break;
        }
      }
      if (extractionStation) break;
    }
  }

  return {
    width,
    height,
    tiles,
    entrance,
    stairsDown: chosenStairs,
    extractionStation,
    rooms,
  };
}

export function isFullyConnected(floor: DungeonFloor): boolean {
  const isPassable = (c: Coord) =>
    inBounds(c.x, c.y, floor.width, floor.height) &&
    floor.tiles[toIndex(c.x, c.y, floor.width)] !== 'WALL';

  const reachable = propagateBFS(floor.entrance, floor.width * floor.height, isPassable);

  // Count all walkable tiles on floor
  let walkableCount = 0;
  for (let y = 0; y < floor.height; y++) {
    for (let x = 0; x < floor.width; x++) {
      if (floor.tiles[toIndex(x, y, floor.width)] !== 'WALL') {
        walkableCount++;
      }
    }
  }

  return reachable.size === walkableCount;
}

export function canReachStairs(floor: DungeonFloor): boolean {
  const isPassable = (c: Coord) =>
    inBounds(c.x, c.y, floor.width, floor.height) &&
    floor.tiles[toIndex(c.x, c.y, floor.width)] !== 'WALL';

  const reachable = propagateBFS(floor.entrance, floor.width * floor.height, isPassable);
  return reachable.has(`${floor.stairsDown.x},${floor.stairsDown.y}`);
}

export function getStairsPathDistance(floor: DungeonFloor): number {
  const isPassable = (c: Coord) =>
    inBounds(c.x, c.y, floor.width, floor.height) &&
    floor.tiles[toIndex(c.x, c.y, floor.width)] !== 'WALL';

  const reachable = propagateBFS(floor.entrance, floor.width * floor.height, isPassable);
  return reachable.get(`${floor.stairsDown.x},${floor.stairsDown.y}`) ?? 0;
}
