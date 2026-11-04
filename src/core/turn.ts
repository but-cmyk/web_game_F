/**
 * Turn Resolution Framework for DEEPER.
 * Handles deterministic player actions (MOVE, WAIT), grid collision,
 * turn counting, and event dispatching.
 * Pure TypeScript, zero Phaser imports.
 */

import { Coord, Direction, inBounds, toIndex } from './grid';
import { DungeonFloor } from './mapgen';
import { EventBus } from './events';

export type MovementMode = 'sneak' | 'walk' | 'run';

export type PlayerAction =
  | { readonly type: 'MOVE'; readonly direction: Direction }
  | { readonly type: 'WAIT' };

export interface TurnResult {
  readonly consumedTurn: boolean;
}

export interface DungeonState {
  floor: DungeonFloor;
  playerPos: Coord;
  movementMode: MovementMode;
  turnCount: number;
  depth: number;
  eventBus: EventBus;
}

function getDelta(direction: Direction): Coord {
  switch (direction) {
    case 'N':
      return { x: 0, y: -1 };
    case 'S':
      return { x: 0, y: 1 };
    case 'E':
      return { x: 1, y: 0 };
    case 'W':
      return { x: -1, y: 0 };
    case 'NE':
      return { x: 1, y: -1 };
    case 'NW':
      return { x: -1, y: -1 };
    case 'SE':
      return { x: 1, y: 1 };
    case 'SW':
      return { x: -1, y: 1 };
  }
}

export class TurnResolver {
  public static step(state: DungeonState, action: PlayerAction): TurnResult {
    switch (action.type) {
      case 'WAIT': {
        state.turnCount += 1;
        return { consumedTurn: true };
      }

      case 'MOVE': {
        const delta = getDelta(action.direction);
        const targetX = state.playerPos.x + delta.x;
        const targetY = state.playerPos.y + delta.y;

        // Check bounds
        if (!inBounds(targetX, targetY, state.floor.width, state.floor.height)) {
          return { consumedTurn: false };
        }

        // Check walkable tile
        const targetIdx = toIndex(targetX, targetY, state.floor.width);
        const tile = state.floor.tiles[targetIdx];

        if (tile === 'WALL') {
          return { consumedTurn: false };
        }

        // Update player position and advance turn
        state.playerPos = { x: targetX, y: targetY };
        state.turnCount += 1;

        // Emit StepTaken event
        state.eventBus.emit('StepTaken', {
          depth: state.depth,
          x: targetX,
          y: targetY,
          mode: state.movementMode,
          oilCost: 1,
        });

        return { consumedTurn: true };
      }
    }
  }
}

