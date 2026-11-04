import { describe, it, expect, vi } from 'vitest';
import { Rng } from '../src/core/rng';
import { generateDungeon } from '../src/core/mapgen';
import { EventBus } from '../src/core/events';
import { TurnResolver, DungeonState } from '../src/core/turn';
import { spawnGoldPiles } from '../src/core/loot';

describe('Single Run Loop & Run Lifecycle', () => {
  function setupTestState(depth = 1, seed = 12345): DungeonState {
    const rng = new Rng(seed);
    const floor = generateDungeon(rng, depth);
    const goldPiles = spawnGoldPiles(floor, depth, rng);
    const eventBus = new EventBus();

    return {
      floor,
      playerPos: { ...floor.entrance },
      movementMode: 'walk',
      turnCount: 0,
      depth,
      hp: 2,
      carriedGold: 0,
      bankedGold: 100, // existing treasury
      oil: 100,
      maxOil: 100,
      dread: 0,
      goldPiles,
      oilFlasks: [],
      isExtracted: false,
      isDead: false,
      eventBus,
    };
  }

  it('collects gold pile upon moving onto its tile, increments carriedGold, emits GoldPicked', () => {
    const state = setupTestState(1);
    const goldSpy = vi.fn();
    state.eventBus.on('GoldPicked', goldSpy);

    // Place a known gold pile adjacent to player
    const targetPos = { x: state.playerPos.x + 1, y: state.playerPos.y };
    // Temporarily ensure floor tile is walkable
    const targetIdx = targetPos.y * state.floor.width + targetPos.x;
    (state.floor.tiles as unknown as string[])[targetIdx] = 'FLOOR';

    state.goldPiles = [{ id: 'test_gold', x: targetPos.x, y: targetPos.y, amount: 20 }];

    const result = TurnResolver.step(state, { type: 'MOVE', direction: 'E' });

    expect(result.consumedTurn).toBe(true);
    expect(state.playerPos).toEqual(targetPos);
    expect(state.carriedGold).toBe(20);
    expect(state.goldPiles.length).toBe(0);
    expect(goldSpy).toHaveBeenCalledWith({
      amount: 20,
      totalCarried: 20,
      x: targetPos.x,
      y: targetPos.y,
    });
  });

  it('generates extraction stations on depths 3, 6, 9, 12, but not on depth 1 or 2', () => {
    const rng = new Rng(42);
    const f1 = generateDungeon(rng, 1);
    const f2 = generateDungeon(rng, 2);
    const f3 = generateDungeon(rng, 3);
    const f6 = generateDungeon(rng, 6);
    const f9 = generateDungeon(rng, 9);
    const f12 = generateDungeon(rng, 12);

    expect(f1.extractionStation).toBeUndefined();
    expect(f2.extractionStation).toBeUndefined();

    // Verify tiles in grid are EXTRACTION_STATION
    const idx3 = f3.extractionStation!.y * f3.width + f3.extractionStation!.x;
    expect(f3.tiles[idx3]).toBe('EXTRACTION_STATION');

    const idx6 = f6.extractionStation!.y * f6.width + f6.extractionStation!.x;
    expect(f6.tiles[idx6]).toBe('EXTRACTION_STATION');

    const idx9 = f9.extractionStation!.y * f9.width + f9.extractionStation!.x;
    expect(f9.tiles[idx9]).toBe('EXTRACTION_STATION');

    const idx12 = f12.extractionStation!.y * f12.width + f12.extractionStation!.x;
    expect(f12.tiles[idx12]).toBe('EXTRACTION_STATION');
  });

  it('banks carried gold and ends run upon extracting at depth 3', () => {
    const state = setupTestState(3);
    const runEndedSpy = vi.fn();
    state.eventBus.on('RunEnded', runEndedSpy);

    state.carriedGold = 75;
    state.bankedGold = 50;

    // Position player directly at extraction station
    state.playerPos = { ...state.floor.extractionStation! };

    const result = TurnResolver.step(state, { type: 'EXTRACT' });

    expect(result.consumedTurn).toBe(true);
    expect(state.isExtracted).toBe(true);
    expect(state.bankedGold).toBe(125); // 50 + 75
    expect(runEndedSpy).toHaveBeenCalledWith({
      outcome: 'extracted',
      depth: 3,
      bankedGold: 75,
      lostGold: 0,
    });
  });

  it('applies 1.25x gold multiplier upon extracting at final exit depth 12', () => {
    const state = setupTestState(12);
    const runEndedSpy = vi.fn();
    state.eventBus.on('RunEnded', runEndedSpy);

    state.carriedGold = 100;
    state.bankedGold = 0;
    state.playerPos = { ...state.floor.extractionStation! };

    const result = TurnResolver.step(state, { type: 'EXTRACT' });

    expect(result.consumedTurn).toBe(true);
    expect(state.isExtracted).toBe(true);
    // 100 * 1.25 = 125
    expect(state.bankedGold).toBe(125);
    expect(runEndedSpy).toHaveBeenCalledWith({
      outcome: 'extracted',
      depth: 12,
      bankedGold: 125,
      lostGold: 0,
    });
  });

  it('wipes carried gold on death, emits RunEnded died, and leaves treasury intact', () => {
    const state = setupTestState(2);
    const runEndedSpy = vi.fn();
    state.eventBus.on('RunEnded', runEndedSpy);

    state.carriedGold = 150;
    state.bankedGold = 200;

    // Trigger lethal damage
    state.hp = 0;
    TurnResolver.checkDeath(state);

    expect(state.isDead).toBe(true);
    expect(state.carriedGold).toBe(0);
    expect(state.bankedGold).toBe(200); // Intact!
    expect(runEndedSpy).toHaveBeenCalledWith({
      outcome: 'died',
      depth: 2,
      bankedGold: 0,
      lostGold: 150,
    });
  });
});
