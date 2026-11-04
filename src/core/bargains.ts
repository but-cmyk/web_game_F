/**
 * Devil's Bargains & Escape Rope Subsystem for DEEPER.
 * Governs the 8 transparent devil's bargains appearing on even floors (2, 4, 6, 8, 10),
 * cost/reward processing with strict Zero Penalty on decline, and escape rope channeling.
 * Pure TypeScript, zero Phaser imports, zero Math.random.
 */

import bargainsData from '../data/bargains.json';
import { Rng } from './rng';
import { DungeonState } from './turn';
import { lootValue } from './loot';

export interface Bargain {
  readonly id: string;
  readonly nameKey?: string;
  readonly costKey?: string;
  readonly rewardKey?: string;
  readonly costType: string;
  readonly costValue: number;
  readonly rewardType: string;
  readonly rewardValue: number;
}

export interface BargainResult {
  readonly success: boolean;
  readonly reason?: string;
}

export interface RopeChannelResult {
  readonly turnsRemaining: number;
  readonly extracted: boolean;
  readonly cancelled: boolean;
}

/**
 * Checks whether the current depth features a devil's bargain altar (even floors 2, 4, 6, 8, 10).
 */
export function isBargainFloor(depth: number): boolean {
  return depth >= 2 && depth <= 10 && depth % 2 === 0;
}

/**
 * Selects 2 distinct bargains from bargains.json uniformly at random.
 */
export function selectFloorBargains(rng: Rng): Bargain[] {
  const all = [...bargainsData.bargains];
  const idx1 = rng.nextInt(0, all.length - 1);
  const first = all.splice(idx1, 1)[0];
  const idx2 = rng.nextInt(0, all.length - 1);
  const second = all[idx2];

  return [
    {
      id: first.id,
      nameKey: first.name_key,
      costKey: first.cost_key,
      rewardKey: first.reward_key,
      costType: first.cost_type,
      costValue: first.cost_value,
      rewardType: first.reward_type,
      rewardValue: first.reward_value,
    },
    {
      id: second.id,
      nameKey: second.name_key,
      costKey: second.cost_key,
      rewardKey: second.reward_key,
      costType: second.cost_type,
      costValue: second.cost_value,
      rewardType: second.reward_type,
      rewardValue: second.reward_value,
    },
  ];
}

/**
 * Resolves player decision on a devil's bargain with complete state transparency.
 */
export function resolveBargain(
  state: DungeonState,
  bargain: Bargain,
  accepted: boolean
): BargainResult {
  if (!accepted) {
    state.eventBus.emit('BargainResolved', {
      bargainId: bargain.id,
      accepted: false,
    });
    return { success: true };
  }

  // Pre-condition check: player cannot pay HP if HP <= 1
  if (bargain.costType === 'hp_loss' && state.hp <= 1) {
    return { success: false, reason: 'hp_too_low' };
  }

  // 1. Deduct cost
  switch (bargain.costType) {
    case 'oil_percentage': {
      const deduction = state.oil * bargain.costValue;
      state.oil = Math.max(0, state.oil - deduction);
      break;
    }
    case 'hp_loss': {
      state.hp = Math.max(1, state.hp - bargain.costValue);
      break;
    }
    case 'light_radius_delta': {
      if (!state.activeCurses) state.activeCurses = [];
      state.activeCurses.push({
        id: 'bargain_light_loss',
        effect: 'reduce_light_radius',
        radiusDelta: bargain.costValue,
      });
      break;
    }
    case 'noise_multiplier': {
      if (!state.activeCurses) state.activeCurses = [];
      state.activeCurses.push({
        id: 'bargain_noise_inc',
        effect: 'increase_noise',
        noiseMultiplier: bargain.costValue,
      });
      break;
    }
    case 'dread_add': {
      const oldDread = state.dread;
      state.dread = Math.min(100, state.dread + bargain.costValue);
      state.eventBus.emit('DreadChanged', {
        oldDread,
        newDread: state.dread,
        reason: 'bargain_curse',
      });
      break;
    }
    case 'carried_gold_percentage': {
      const cost = Math.round(state.carriedGold * bargain.costValue);
      state.carriedGold = Math.max(0, state.carriedGold - cost);
      break;
    }
    case 'delayed_stalker': {
      state.delayedStalkerTurns = bargain.costValue;
      break;
    }
  }

  // 2. Grant reward
  switch (bargain.rewardType) {
    case 'gold_multiplier': {
      const base = lootValue(state.depth);
      const reward = Math.round(base * bargain.rewardValue);
      state.carriedGold += reward;
      state.eventBus.emit('GoldPicked', {
        amount: reward,
        totalCarried: state.carriedGold,
        x: state.playerPos.x,
        y: state.playerPos.y,
      });
      break;
    }
    case 'oil_add': {
      state.oil = Math.min(state.maxOil, state.oil + bargain.rewardValue);
      break;
    }
    case 'dread_reduce_and_reveal': {
      const old = state.dread;
      state.dread = Math.max(0, state.dread + bargain.rewardValue);
      state.stairsRevealed = true;
      state.eventBus.emit('DreadChanged', {
        oldDread: old,
        newDread: state.dread,
        reason: 'bargain_clarity',
      });
      break;
    }
    case 'add_rope': {
      state.ropeCount = (state.ropeCount ?? 0) + bargain.rewardValue;
      break;
    }
  }

  state.eventBus.emit('BargainResolved', {
    bargainId: bargain.id,
    accepted: true,
  });

  return { success: true };
}

/**
 * Processes a single turn of escape rope channeling.
 */
export function processRopeChannelTurn(
  state: DungeonState,
  currentTurnsRemaining: number,
  tookDamage: boolean
): RopeChannelResult {
  if (tookDamage) {
    return {
      turnsRemaining: 0,
      extracted: false,
      cancelled: true,
    };
  }

  const remaining = currentTurnsRemaining - 1;

  if (remaining <= 0) {
    state.bankedGold += state.carriedGold;
    const bankedAmount = state.carriedGold;
    state.carriedGold = 0;
    state.isExtracted = true;

    state.eventBus.emit('RunEnded', {
      outcome: 'extracted',
      depth: state.depth,
      bankedGold: bankedAmount,
      lostGold: 0,
    });

    return {
      turnsRemaining: 0,
      extracted: true,
      cancelled: false,
    };
  }

  return {
    turnsRemaining: remaining,
    extracted: false,
    cancelled: false,
  };
}
