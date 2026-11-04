/**
 * Tutorial Engine & Pre-Authored Scripted Floor for DEEPER.
 * Provides a deterministic, 3-minute traversable layout teaching
 * movement, noise/modes, oil/dread, chests, and extraction.
 * Pure TypeScript, zero Phaser imports, zero Math.random.
 */

import { DungeonFloor, Room, TileType } from './mapgen';
import { Coord, toIndex } from './grid';

export type TutorialStage =
  | 'MOVE_BASICS'
  | 'MOVEMENT_MODES'
  | 'OIL_AND_DREAD'
  | 'OPEN_CHEST'
  | 'EXTRACTION'
  | 'COMPLETED';

export interface TutorialState {
  stepsTaken: number;
  modeChanged: boolean;
  oilCollected: boolean;
  chestOpened: boolean;
  extracted: boolean;
}

/**
 * Creates the deterministic 30x20 pre-authored tutorial floor.
 */
export function createTutorialFloor(): DungeonFloor {
  const width = 30;
  const height = 20;
  const tiles: TileType[] = new Array(width * height).fill('WALL');

  let roomId = 0;
  const carveRoom = (rx: number, ry: number, rw: number, rh: number): Room => {
    for (let y = ry; y < ry + rh; y++) {
      for (let x = rx; x < rx + rw; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          tiles[toIndex(x, y, width)] = 'FLOOR';
        }
      }
    }
    return {
      id: roomId++,
      x: rx,
      y: ry,
      w: rw,
      h: rh,
      centerX: Math.floor(rx + rw / 2),
      centerY: Math.floor(ry + rh / 2),
    };
  };

  const carveHCorridor = (x1: number, x2: number, y: number) => {
    const startX = Math.min(x1, x2);
    const endX = Math.max(x1, x2);
    for (let x = startX; x <= endX; x++) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        tiles[toIndex(x, y, width)] = 'FLOOR';
      }
    }
  };

  const carveVCorridor = (y1: number, y2: number, x: number) => {
    const startY = Math.min(y1, y2);
    const endY = Math.max(y1, y2);
    for (let y = startY; y <= endY; y++) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        tiles[toIndex(x, y, width)] = 'FLOOR';
      }
    }
  };

  // 1. Room 1 (Spawn): Entrance at (5, 5)
  const room1 = carveRoom(3, 3, 6, 5); // x: 3..8, y: 3..7
  const entrance: Coord = { x: 5, y: 5 };

  // Corridor 1: Room 1 to Room 2
  carveHCorridor(8, 14, 5);

  // 2. Room 2 (Items): x: 14..18, y: 3..7
  const room2 = carveRoom(14, 3, 5, 5);

  // Corridor 2: Room 2 to Room 3
  carveVCorridor(7, 12, 16);
  carveHCorridor(16, 20, 12);

  // 3. Room 3 (Chest): x: 20..24, y: 10..14
  const room3 = carveRoom(20, 10, 5, 5);

  // Corridor 3: Room 3 to Room 4
  carveVCorridor(14, 16, 22);
  carveHCorridor(22, 24, 16);

  // 4. Room 4 (Extraction): x: 24..28, y: 14..18
  const room4 = carveRoom(24, 14, 5, 5);
  const extractionStation: Coord = { x: 26, y: 16 };
  tiles[toIndex(extractionStation.x, extractionStation.y, width)] = 'EXTRACTION_STATION';

  const stairsDown: Coord = { x: 27, y: 17 };
  tiles[toIndex(stairsDown.x, stairsDown.y, width)] = 'STAIRS_DOWN';

  return {
    width,
    height,
    tiles,
    rooms: [room1, room2, room3, room4],
    entrance,
    stairsDown,
    extractionStation,
  };
}

/**
 * Progresses the tutorial stage based on player actions and state.
 */
export function evaluateTutorialProgress(
  stage: TutorialStage,
  _playerPos: Coord,
  state: TutorialState
): TutorialStage {
  switch (stage) {
    case 'MOVE_BASICS':
      if (state.stepsTaken >= 3) {
        return 'MOVEMENT_MODES';
      }
      return 'MOVE_BASICS';

    case 'MOVEMENT_MODES':
      if (state.modeChanged) {
        return 'OIL_AND_DREAD';
      }
      return 'MOVEMENT_MODES';

    case 'OIL_AND_DREAD':
      if (state.oilCollected) {
        return 'OPEN_CHEST';
      }
      return 'OIL_AND_DREAD';

    case 'OPEN_CHEST':
      if (state.chestOpened) {
        return 'EXTRACTION';
      }
      return 'OPEN_CHEST';

    case 'EXTRACTION':
      if (state.extracted) {
        return 'COMPLETED';
      }
      return 'EXTRACTION';

    case 'COMPLETED':
      return 'COMPLETED';
  }
}
