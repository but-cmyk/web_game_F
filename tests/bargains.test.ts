import { describe, it, expect } from 'vitest';
import {
  isBargainFloor,
  selectFloorBargains,
  resolveBargain,
  processRopeChannelTurn,
  Bargain,
} from '../src/core/bargains';
import { DungeonState } from '../src/core/turn';
import { Rng } from '../src/core/rng';
import { EventBus } from '../src/core/events';
import { DungeonFloor } from '../src/core/mapgen';

function createMockState(depth = 2): DungeonState {
  const floor: DungeonFloor = {
    width: 10,
    height: 10,
    tiles: new Array(100).fill('FLOOR'),
    entrance: { x: 1, y: 1 },
    stairsDown: { x: 8, y: 8 },
    rooms: [],
  };

  return {
    floor,
    playerPos: { x: 2, y: 2 },
    movementMode: 'walk',
    turnCount: 0,
    depth,
    hp: 2,
    carriedGold: 100,
    bankedGold: 0,
    oil: 80,
    maxOil: 100,
    dread: 20,
    goldPiles: [],
    oilFlasks: [],
    monsters: [],
    hallucinations: [],
    isExtracted: false,
    isDead: false,
    eventBus: new EventBus(),
  };
}

describe('Devil Bargains System (§4.6)', () => {
  it('only presents bargains on even floors 2, 4, 6, 8, 10', () => {
    expect(isBargainFloor(1)).toBe(false);
    expect(isBargainFloor(2)).toBe(true);
    expect(isBargainFloor(3)).toBe(false);
    expect(isBargainFloor(4)).toBe(true);
    expect(isBargainFloor(6)).toBe(true);
    expect(isBargainFloor(8)).toBe(true);
    expect(isBargainFloor(10)).toBe(true);
    expect(isBargainFloor(12)).toBe(false);
  });

  it('selects exactly 2 distinct bargains from the 8 available', () => {
    const rng = new Rng(456);
    const bargains = selectFloorBargains(rng);

    expect(bargains).toHaveLength(2);
    expect(bargains[0].id).not.toBe(bargains[1].id);
  });

  it('guarantees complete state safety when declining a bargain (Zero Penalty Invariant)', () => {
    const state = createMockState(2);
    const bargain: Bargain = {
      id: 'b1_oil_for_gold',
      costType: 'oil_percentage',
      costValue: 0.3,
      rewardType: 'gold_multiplier',
      rewardValue: 4.0,
    };

    const initialOil = state.oil;
    const initialGold = state.carriedGold;
    const initialHp = state.hp;
    const initialDread = state.dread;

    resolveBargain(state, bargain, false); // DECLINE

    expect(state.oil).toBe(initialOil);
    expect(state.carriedGold).toBe(initialGold);
    expect(state.hp).toBe(initialHp);
    expect(state.dread).toBe(initialDread);
  });

  it('applies cost and reward accurately when accepting bargain B1 (oil for gold)', () => {
    const state = createMockState(2);
    const bargain: Bargain = {
      id: 'b1_oil_for_gold',
      costType: 'oil_percentage',
      costValue: 0.3, // 30% of 80 = 24
      rewardType: 'gold_multiplier',
      rewardValue: 4.0,
    };

    resolveBargain(state, bargain, true); // ACCEPT

    // 80 - 24 = 56 oil
    expect(state.oil).toBe(56);
    // Gold added = 4 * lootValue(2) = 4 * 13 = 52 -> 100 + 52 = 152
    expect(state.carriedGold).toBe(152);
  });

  it('prevents B2 (HP for oil) from dropping player HP below 1', () => {
    const state = createMockState(2);
    state.hp = 1; // Only 1 HP left

    const bargain: Bargain = {
      id: 'b2_hp_for_oil',
      costType: 'hp_loss',
      costValue: 1,
      rewardType: 'oil_add',
      rewardValue: 40,
    };

    const result = resolveBargain(state, bargain, true);
    // Bargain cannot be accepted if player has only 1 HP
    expect(result.success).toBe(false);
    expect(state.hp).toBe(1);
  });
});

describe('Escape Rope Channeling Mechanics (§4.7)', () => {
  it('channels extraction across 3 consecutive WAIT turns', () => {
    const state = createMockState(2);
    let turnsRemaining = 3;

    // Turn 1
    const t1 = processRopeChannelTurn(state, turnsRemaining, false);
    turnsRemaining = t1.turnsRemaining;
    expect(turnsRemaining).toBe(2);
    expect(state.isExtracted).toBe(false);

    // Turn 2
    const t2 = processRopeChannelTurn(state, turnsRemaining, false);
    turnsRemaining = t2.turnsRemaining;
    expect(turnsRemaining).toBe(1);
    expect(state.isExtracted).toBe(false);

    // Turn 3: Completion!
    const t3 = processRopeChannelTurn(state, turnsRemaining, false);
    expect(t3.turnsRemaining).toBe(0);
    expect(t3.extracted).toBe(true);
    expect(state.isExtracted).toBe(true);
    expect(state.bankedGold).toBe(100);
  });

  it('cancels rope channeling if player takes damage during the 3 turns', () => {
    const state = createMockState(2);
    const turnsRemaining = 2;

    const res = processRopeChannelTurn(state, turnsRemaining, true); // tookDamage = true
    expect(res.cancelled).toBe(true);
    expect(res.turnsRemaining).toBe(0);
    expect(state.isExtracted).toBe(false);
  });
});
