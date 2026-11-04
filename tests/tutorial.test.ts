import { describe, it, expect } from 'vitest';
import {
  createTutorialFloor,
  evaluateTutorialProgress,
  TutorialStage,
  TutorialState,
} from '../src/core/tutorial';
import { isFullyConnected } from '../src/core/mapgen';
import { bfsPath } from '../src/core/grid';

describe('Tutorial Core Engine & Scripted Floor (§5 M8)', () => {
  it('generates a valid, deterministic pre-authored tutorial floor', () => {
    const floor = createTutorialFloor();

    expect(floor.width).toBe(30);
    expect(floor.height).toBe(20);
    expect(floor.entrance).toBeDefined();
    expect(floor.extractionStation).toBeDefined();

    // Must be fully connected from entrance to extraction station
    expect(isFullyConnected(floor)).toBe(true);

    const isPassable = (c: { x: number; y: number }) => {
      const idx = c.y * floor.width + c.x;
      return floor.tiles[idx] !== 'WALL';
    };

    const path = bfsPath(floor.entrance, floor.extractionStation!, isPassable, floor.width, floor.height);
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(10);
  });

  it('progresses through sequential tutorial stages upon achieving milestones', () => {
    const state: TutorialState = {
      stepsTaken: 0,
      modeChanged: false,
      oilCollected: false,
      chestOpened: false,
      extracted: false,
    };

    // Stage 0: Initial spawn -> Requires moving at least 3 steps
    let stage: TutorialStage = 'MOVE_BASICS';
    expect(evaluateTutorialProgress(stage, { x: 5, y: 5 }, state)).toBe('MOVE_BASICS');

    state.stepsTaken = 4;
    stage = evaluateTutorialProgress(stage, { x: 8, y: 5 }, state);
    expect(stage).toBe('MOVEMENT_MODES');

    // Stage 1: Movement modes -> Requires toggling movement mode
    expect(evaluateTutorialProgress(stage, { x: 9, y: 5 }, state)).toBe('MOVEMENT_MODES');
    state.modeChanged = true;
    stage = evaluateTutorialProgress(stage, { x: 10, y: 5 }, state);
    expect(stage).toBe('OIL_AND_DREAD');

    // Stage 2: Collect oil flask
    expect(evaluateTutorialProgress(stage, { x: 12, y: 5 }, state)).toBe('OIL_AND_DREAD');
    state.oilCollected = true;
    stage = evaluateTutorialProgress(stage, { x: 15, y: 5 }, state);
    expect(stage).toBe('OPEN_CHEST');

    // Stage 3: Open chest
    expect(evaluateTutorialProgress(stage, { x: 18, y: 8 }, state)).toBe('OPEN_CHEST');
    state.chestOpened = true;
    stage = evaluateTutorialProgress(stage, { x: 22, y: 10 }, state);
    expect(stage).toBe('EXTRACTION');

    // Stage 4: Reach extraction station
    state.extracted = true;
    stage = evaluateTutorialProgress(stage, { x: 25, y: 15 }, state);
    expect(stage).toBe('COMPLETED');
  });
});
