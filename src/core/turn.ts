/**
 * Turn Resolution Framework for DEEPER.
 * Handles deterministic player actions (MOVE, WAIT, DESCEND, EXTRACT, SET_MODE),
 * grid collision, gold & oil collection, fear mechanics (oil depletion, noise, Dread),
 * health / death tracking, and event dispatching.
 * Pure TypeScript, zero Phaser imports.
 */

import { Coord, Direction, inBounds, toIndex } from './grid';
import { DungeonFloor } from './mapgen';
import { EventBus } from './events';
import { GoldPile, pickupGold, OilFlask, pickupOilFlask } from './loot';
import { oilCostPerStep, calculateNoiseRadius, updateDread } from './fear';
import {
  Monster,
  NoiseEventInfo,
  updateMonsterFSM,
  calculateDangerP,
  resolveMonsterCollisions,
} from './monsters';
import {
  Hallucination,
  shouldSpawnHallucination,
  spawnHallucination,
  updateHallucinations,
} from './hallucinations';
import { Rng } from './rng';

export type MovementMode = 'sneak' | 'walk' | 'run';

export type PlayerAction =
  | { readonly type: 'MOVE'; readonly direction: Direction }
  | { readonly type: 'WAIT' }
  | { readonly type: 'DESCEND' }
  | { readonly type: 'EXTRACT' }
  | { readonly type: 'SET_MODE'; readonly mode: MovementMode };

export interface TurnResult {
  readonly consumedTurn: boolean;
  readonly advancedFloor?: boolean;
  readonly runEnded?: 'extracted' | 'died';
}

export interface DungeonState {
  floor: DungeonFloor;
  playerPos: Coord;
  movementMode: MovementMode;
  turnCount: number;
  depth: number;
  hp: number;
  carriedGold: number;
  bankedGold: number;
  oil: number;
  maxOil: number;
  dread: number;
  goldPiles: GoldPile[];
  oilFlasks: OilFlask[];
  monsters?: Monster[];
  hallucinations?: Hallucination[];
  playerInvulnerableTurns?: number;
  playerHistory?: Coord[];
  isExtracted: boolean;
  isDead: boolean;
  eventBus: EventBus;
  rng?: Rng;
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
      case 'SET_MODE': {
        state.movementMode = action.mode;
        return { consumedTurn: false };
      }

      case 'WAIT': {
        state.turnCount += 1;
        const postRes = TurnResolver.processPostPlayerTurn(state, []);
        if (postRes.runEnded) return postRes;
        return { consumedTurn: true };
      }

      case 'DESCEND': {
        const isAtStairs =
          state.playerPos.x === state.floor.stairsDown.x &&
          state.playerPos.y === state.floor.stairsDown.y;

        if (isAtStairs) {
          state.turnCount += 1;
          return { consumedTurn: true, advancedFloor: true };
        }
        return { consumedTurn: false };
      }

      case 'EXTRACT': {
        const station = state.floor.extractionStation;
        const isAtStation =
          station !== undefined &&
          state.playerPos.x === station.x &&
          state.playerPos.y === station.y;

        if (isAtStation) {
          const multiplier = state.depth === 12 ? 1.25 : 1.0;
          const goldToBank = Math.round(state.carriedGold * multiplier);
          state.bankedGold += goldToBank;
          state.isExtracted = true;
          state.turnCount += 1;

          state.eventBus.emit('RunEnded', {
            outcome: 'extracted',
            depth: state.depth,
            bankedGold: goldToBank,
            lostGold: 0,
          });

          return { consumedTurn: true, runEnded: 'extracted' };
        }
        return { consumedTurn: false };
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

        // 1. Consume oil based on depth and movement mode
        const oilCost = oilCostPerStep(state.depth, state.movementMode);
        state.oil = Math.max(0, state.oil - oilCost);

        // 2. Emit noise along path
        const noiseRadius = calculateNoiseRadius(state.movementMode, state.dread);
        state.eventBus.emit('NoiseEmitted', {
          x: targetX,
          y: targetY,
          radius: noiseRadius,
          source: 'player',
        });

        // 3. Update Dread based on lighting
        const isInLight =
          (targetX === state.floor.entrance.x && targetY === state.floor.entrance.y) ||
          (state.floor.extractionStation !== undefined &&
            targetX === state.floor.extractionStation.x &&
            targetY === state.floor.extractionStation.y);

        const oldDread = state.dread;
        const newDread = updateDread(oldDread, isInLight, state.oil <= 0);
        state.dread = newDread;
        if (newDread !== oldDread) {
          state.eventBus.emit('DreadChanged', {
            oldDread,
            newDread,
            reason: isInLight ? 'restored_in_light' : 'darkness_step',
          });
        }

        // 4. Update player position and advance turn
        state.playerPos = { x: targetX, y: targetY };
        state.turnCount += 1;

        // 5. Collect gold if present on tile
        if (state.goldPiles && state.goldPiles.length > 0) {
          const { remainingPiles, collectedAmount } = pickupGold(state.goldPiles, state.playerPos);
          if (collectedAmount > 0) {
            state.carriedGold += collectedAmount;
            state.goldPiles = remainingPiles;
            state.eventBus.emit('GoldPicked', {
              amount: collectedAmount,
              totalCarried: state.carriedGold,
              x: targetX,
              y: targetY,
            });
          }
        }

        // 6. Collect oil flask if present on tile
        if (state.oilFlasks && state.oilFlasks.length > 0) {
          const { remainingFlasks, collectedAmount } = pickupOilFlask(state.oilFlasks, state.playerPos);
          if (collectedAmount > 0) {
            state.oil = Math.min(state.maxOil, state.oil + collectedAmount);
            state.oilFlasks = remainingFlasks;
            state.eventBus.emit('OilPicked', {
              amount: collectedAmount,
              currentOil: state.oil,
              x: targetX,
              y: targetY,
            });
          }
        }

        // 7. Emit StepTaken event
        state.eventBus.emit('StepTaken', {
          depth: state.depth,
          x: targetX,
          y: targetY,
          mode: state.movementMode,
          oilCost,
        });

        // 8. Post-turn processing (monsters, hallucinations, collisions)
        const noiseInfo: NoiseEventInfo = {
          x: targetX,
          y: targetY,
          radius: noiseRadius,
          source: 'player',
        };
        const postRes = TurnResolver.processPostPlayerTurn(state, [noiseInfo]);
        if (postRes.runEnded) return postRes;

        return { consumedTurn: true };
      }
    }
  }

  /**
   * Processes monster AI turns, disturbance checks, hallucinations, and combat collisions.
   */
  private static processPostPlayerTurn(
    state: DungeonState,
    noiseEvents: readonly NoiseEventInfo[]
  ): TurnResult {
    // 1. Maintain player breadcrumb history (for Stalker tracking)
    if (!state.playerHistory) {
      state.playerHistory = [];
    }
    state.playerHistory.unshift({ ...state.playerPos });
    if (state.playerHistory.length > 12) {
      state.playerHistory.pop();
    }

    // 2. Disturbance check
    if (state.rng && state.monsters && state.monsters.length > 0) {
      const danger = calculateDangerP(state.depth, state.dread);
      if (state.rng.next() <= danger) {
        const eligible = state.monsters.filter(
          (m) => m.state !== 'CHASE' && m.type !== 'listener'
        );
        if (eligible.length > 0) {
          const picked = eligible[state.rng.nextInt(0, eligible.length - 1)];
          picked.state = 'SUSPICIOUS';
          picked.targetCoord = { ...state.playerPos };
          state.eventBus.emit('MonsterAlerted', {
            monsterId: picked.id,
            type: picked.type,
            state: 'SUSPICIOUS',
            x: picked.x,
            y: picked.y,
          });
        }
      }
    }

    // 3. Update Monster FSMs & movement
    if (state.monsters && state.monsters.length > 0) {
      for (const monster of state.monsters) {
        updateMonsterFSM(
          monster,
          state.floor,
          state.playerPos,
          noiseEvents,
          state.playerHistory,
          state.eventBus,
          state.monsters,
          state.rng
        );
      }
    }

    // 4. Hallucinations spawn & lifecycle
    if (!state.hallucinations) {
      state.hallucinations = [];
    }
    if (state.rng && shouldSpawnHallucination(state.dread, state.turnCount, state.rng)) {
      const h = spawnHallucination(state.floor, state.playerPos, state.rng, state.turnCount);
      if (h) {
        state.hallucinations.push(h);
        state.eventBus.emit('HallucinationTriggered', {
          id: h.id,
          type: h.type,
          x: h.x,
          y: h.y,
        });
      }
    }

    const halRes = updateHallucinations(
      state.hallucinations,
      state.playerPos,
      state.dread,
      state.hp,
      state.eventBus
    );
    state.hallucinations = halRes.remainingHallucinations;
    state.dread = halRes.newDread;

    // 5. Combat Collisions & Invulnerability
    if (state.monsters && state.monsters.length > 0) {
      const collRes = resolveMonsterCollisions(
        state.monsters,
        state.playerPos,
        state.hp,
        state.playerInvulnerableTurns ?? 0,
        state.eventBus
      );
      state.hp = collRes.playerHp;
      state.playerInvulnerableTurns = collRes.playerInvulnerableTurns;

      if (collRes.hitOccurred && collRes.attackingMonster) {
        state.eventBus.emit('MonsterAttacked', {
          monsterId: collRes.attackingMonster.id,
          damage: collRes.attackingMonster.damage,
          remainingHp: state.hp,
        });
      }

      if (TurnResolver.checkDeath(state)) {
        return { consumedTurn: true, runEnded: 'died' };
      }
    }

    return { consumedTurn: true };
  }

  /**
   * Checks whether player HP reached zero, triggering permadeath and gold loss.
   */
  public static checkDeath(state: DungeonState): boolean {
    if (state.hp <= 0 && !state.isDead) {
      state.isDead = true;
      const lost = state.carriedGold;
      state.carriedGold = 0;
      state.eventBus.emit('RunEnded', {
        outcome: 'died',
        depth: state.depth,
        bankedGold: 0,
        lostGold: lost,
      });
      return true;
    }
    return false;
  }
}
