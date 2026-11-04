import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../src/core/events';
import { DungeonFloor } from '../src/core/mapgen';
import { TurnResolver, DungeonState, PlayerAction } from '../src/core/turn';

describe('Turn Resolution Framework', () => {
  function createTestFloor(): DungeonFloor {
    // 5x5 grid:
    // W W W W W
    // W . . . W
    // W . W . W
    // W @ . > W
    // W W W W W
    // (0,0) is top-left WALL.
    // (1,3) is ENTRANCE.
    // (3,3) is STAIRS_DOWN.
    // (2,2) is WALL.
    const width = 5;
    const height = 5;
    const tiles = [
      'WALL', 'WALL',  'WALL', 'WALL',        'WALL',
      'WALL', 'FLOOR', 'FLOOR', 'FLOOR',       'WALL',
      'WALL', 'FLOOR', 'WALL',  'FLOOR',       'WALL',
      'WALL', 'ENTRANCE', 'FLOOR', 'STAIRS_DOWN', 'WALL',
      'WALL', 'WALL',  'WALL', 'WALL',        'WALL',
    ] as const;

    return {
      width,
      height,
      tiles: [...tiles],
      entrance: { x: 1, y: 3 },
      stairsDown: { x: 3, y: 3 },
      rooms: [],
    };
  }

  function createInitialState(floor: DungeonFloor, eventBus: EventBus): DungeonState {
    return {
      floor,
      playerPos: { ...floor.entrance },
      movementMode: 'walk',
      turnCount: 0,
      depth: 1,
      eventBus,
    };
  }

  it('updates position, increments turn, and emits StepTaken when moving onto a walkable floor', () => {
    const floor = createTestFloor();
    const eventBus = new EventBus();
    const stepTakenSpy = vi.fn();
    eventBus.on('StepTaken', stepTakenSpy);

    const state = createInitialState(floor, eventBus);
    const action: PlayerAction = { type: 'MOVE', direction: 'E' };

    const result = TurnResolver.step(state, action);

    expect(result.consumedTurn).toBe(true);
    expect(state.playerPos).toEqual({ x: 2, y: 3 });
    expect(state.turnCount).toBe(1);
    expect(stepTakenSpy).toHaveBeenCalledTimes(1);
    expect(stepTakenSpy).toHaveBeenCalledWith({
      depth: 1,
      x: 2,
      y: 3,
      mode: 'walk',
      oilCost: 1,
    });
  });

  it('blocks movement when moving into a wall, preserves position, does not consume turn', () => {
    const floor = createTestFloor();
    const eventBus = new EventBus();
    const stepTakenSpy = vi.fn();
    eventBus.on('StepTaken', stepTakenSpy);

    const state = createInitialState(floor, eventBus);
    // (1,3) moving South is WALL (1,4)
    const action: PlayerAction = { type: 'MOVE', direction: 'S' };

    const result = TurnResolver.step(state, action);

    expect(result.consumedTurn).toBe(false);
    expect(state.playerPos).toEqual({ x: 1, y: 3 });
    expect(state.turnCount).toBe(0);
    expect(stepTakenSpy).not.toHaveBeenCalled();
  });

  it('blocks movement when attempting to move out of bounds', () => {
    const floor = createTestFloor();
    const eventBus = new EventBus();
    const state = createInitialState(floor, eventBus);
    state.playerPos = { x: 0, y: 0 }; // Edge tile

    const action: PlayerAction = { type: 'MOVE', direction: 'N' };
    const result = TurnResolver.step(state, action);

    expect(result.consumedTurn).toBe(false);
    expect(state.playerPos).toEqual({ x: 0, y: 0 });
    expect(state.turnCount).toBe(0);
  });

  it('consumes turn and increments turn count when waiting', () => {
    const floor = createTestFloor();
    const eventBus = new EventBus();
    const stepTakenSpy = vi.fn();
    eventBus.on('StepTaken', stepTakenSpy);

    const state = createInitialState(floor, eventBus);
    const action: PlayerAction = { type: 'WAIT' };

    const result = TurnResolver.step(state, action);

    expect(result.consumedTurn).toBe(true);
    expect(state.playerPos).toEqual({ x: 1, y: 3 });
    expect(state.turnCount).toBe(1);
    expect(stepTakenSpy).not.toHaveBeenCalled();
  });

  it('allows moving onto STAIRS_DOWN and ENTRANCE tiles', () => {
    const floor = createTestFloor();
    const eventBus = new EventBus();
    const state = createInitialState(floor, eventBus);

    // Move to (2,3)
    TurnResolver.step(state, { type: 'MOVE', direction: 'E' });
    expect(state.playerPos).toEqual({ x: 2, y: 3 });

    // Move onto STAIRS_DOWN at (3,3)
    const res = TurnResolver.step(state, { type: 'MOVE', direction: 'E' });
    expect(res.consumedTurn).toBe(true);
    expect(state.playerPos).toEqual({ x: 3, y: 3 });
    expect(state.turnCount).toBe(2);
  });
});

