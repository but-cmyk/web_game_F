/**
 * Monster AI & Finite State Machine (FSM) Engine for DEEPER.
 * Implements Crawler, Listener, and Stalker archetypes with deterministic BFS pathfinding,
 * line-of-sight checks, noise awareness, and combat collision resolution.
 * Pure TypeScript, zero Phaser imports, zero Math.random.
 */

import { DungeonFloor } from './mapgen';
import { Coord, toIndex, getCardinals, bresenhamLine, propagateBFS, bfsPath, manhattanDistance } from './grid';
import { Rng } from './rng';
import { EventBus } from './events';
import enemiesData from '../data/enemies.json';

export const MONSTER_VISION_RADIUS = 6;

export type MonsterType = 'crawler' | 'listener' | 'stalker';

export type MonsterState =
  | 'PATROL'
  | 'SUSPICIOUS'
  | 'CHASE'
  | 'SEARCH'
  | 'IDLE'
  | 'HOWL'
  | 'STALK';

export interface Monster {
  readonly id: string;
  readonly type: MonsterType;
  x: number;
  y: number;
  state: MonsterState;
  hp: number;
  readonly maxHp: number;
  readonly damage: number;
  targetCoord: Coord | null;
  stunnedTurns: number;
  searchTurnsRemaining: number;
  howlCooldown: number;
  lastSeenPlayerPos: Coord | null;
  stepTurnCounter?: number;
}

export interface NoiseEventInfo {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly source: string;
}

export interface CollisionResult {
  readonly playerHp: number;
  readonly playerInvulnerableTurns: number;
  readonly hitOccurred: boolean;
  readonly attackingMonster: Monster | null;
}

/**
 * Checks whether an unobstructed line-of-sight exists between two points.
 */
export function hasLineOfSight(floor: DungeonFloor, start: Coord, end: Coord): boolean {
  if (start.x === end.x && start.y === end.y) return true;

  const points = bresenhamLine(start, end);
  // Intermediate points excluding endpoints
  for (let i = 1; i < points.length - 1; i++) {
    const pt = points[i];
    const idx = toIndex(pt.x, pt.y, floor.width);
    if (floor.tiles[idx] === 'WALL') {
      return false;
    }
  }
  return true;
}

/**
 * Calculates disturbance (Biến cố) probability based on depth and dread.
 */
export function calculateDangerP(depth: number, dread: number): number {
  return Math.min(0.6, 0.05 + 0.04 * depth + 0.002 * dread);
}

/**
 * Spawns monsters on a dungeon floor based on depth scaling.
 */
export function spawnMonsters(floor: DungeonFloor, depth: number, rng: Rng): Monster[] {
  const count = 2 + Math.floor(depth / 2);
  const monsters: Monster[] = [];
  const occupied = new Set<string>();

  // Exclude entrance and stairs
  occupied.add(`${floor.entrance.x},${floor.entrance.y}`);
  occupied.add(`${floor.stairsDown.x},${floor.stairsDown.y}`);

  const candidates: Coord[] = [];
  for (let y = 0; y < floor.height; y++) {
    for (let x = 0; x < floor.width; x++) {
      const idx = toIndex(x, y, floor.width);
      if (floor.tiles[idx] === 'FLOOR') {
        const distToEntrance = Math.abs(x - floor.entrance.x) + Math.abs(y - floor.entrance.y);
        if (distToEntrance >= 6 && !occupied.has(`${x},${y}`)) {
          candidates.push({ x, y });
        }
      }
    }
  }

  const enemyDefs = enemiesData.enemies;
  const crawlerDef = enemyDefs.find((e) => e.id === 'crawler')!;
  const listenerDef = enemyDefs.find((e) => e.id === 'listener')!;
  const stalkerDef = enemyDefs.find((e) => e.id === 'stalker')!;

  for (let i = 0; i < count; i++) {
    if (candidates.length === 0) break;

    const candIndex = rng.nextInt(0, candidates.length - 1);
    const pos = candidates.splice(candIndex, 1)[0];
    occupied.add(`${pos.x},${pos.y}`);

    // Choose enemy type based on weights and depth
    let type: MonsterType = 'crawler';
    const roll = rng.nextInt(1, 100);

    if (depth >= 8 && roll <= stalkerDef.weight) {
      type = 'stalker';
    } else if (roll <= crawlerDef.weight) {
      type = 'crawler';
    } else {
      type = 'listener';
    }

    if (type === 'crawler') {
      monsters.push({
        id: `crawler_${i + 1}`,
        type: 'crawler',
        x: pos.x,
        y: pos.y,
        state: 'PATROL',
        hp: crawlerDef.hp,
        maxHp: crawlerDef.hp,
        damage: crawlerDef.damage,
        targetCoord: null,
        stunnedTurns: 0,
        searchTurnsRemaining: 0,
        howlCooldown: 0,
        lastSeenPlayerPos: null,
      });
    } else if (type === 'listener') {
      monsters.push({
        id: `listener_${i + 1}`,
        type: 'listener',
        x: pos.x,
        y: pos.y,
        state: 'IDLE',
        hp: listenerDef.hp,
        maxHp: listenerDef.hp,
        damage: listenerDef.damage,
        targetCoord: null,
        stunnedTurns: 0,
        searchTurnsRemaining: 0,
        howlCooldown: 0,
        lastSeenPlayerPos: null,
      });
    } else {
      monsters.push({
        id: `stalker_${i + 1}`,
        type: 'stalker',
        x: pos.x,
        y: pos.y,
        state: 'STALK',
        hp: stalkerDef.hp,
        maxHp: stalkerDef.hp,
        damage: stalkerDef.damage,
        targetCoord: null,
        stunnedTurns: 0,
        searchTurnsRemaining: 0,
        howlCooldown: 0,
        lastSeenPlayerPos: null,
        stepTurnCounter: 0,
      });
    }
  }

  return monsters;
}

/**
 * Updates a single monster's FSM state and executes its movement for the turn.
 */
export function updateMonsterFSM(
  monster: Monster,
  floor: DungeonFloor,
  playerPos: Coord,
  noiseEvents: readonly NoiseEventInfo[],
  playerHistory: readonly Coord[],
  eventBus: EventBus,
  allMonsters?: readonly Monster[],
  rng?: Rng
): void {
  // If stunned, decrement and skip turn
  if (monster.stunnedTurns > 0) {
    monster.stunnedTurns -= 1;
    return;
  }

  const isPassable = (c: Coord) => {
    const idx = toIndex(c.x, c.y, floor.width);
    return floor.tiles[idx] === 'FLOOR';
  };

  const distToPlayer = manhattanDistance(monster, playerPos);
  const hasSight = distToPlayer <= MONSTER_VISION_RADIUS && hasLineOfSight(floor, monster, playerPos);

  if (monster.type === 'crawler') {
    // 1. Sight has highest priority
    if (hasSight) {
      if (monster.state !== 'CHASE') {
        const oldState = monster.state;
        monster.state = 'CHASE';
        eventBus.emit('MonsterStateChanged', {
          monsterId: monster.id,
          oldState,
          newState: 'CHASE',
        });
      }
      monster.targetCoord = { ...playerPos };
      monster.lastSeenPlayerPos = { ...playerPos };

      // Move towards player
      const path = bfsPath(monster, playerPos, isPassable, floor.width, floor.height);
      if (path && path.length > 0) {
        monster.x = path[0].x;
        monster.y = path[0].y;
      }
      return;
    }

    // 2. Was chasing but lost sight -> enter SEARCH
    if (monster.state === 'CHASE') {
      const oldState = monster.state;
      monster.state = 'SEARCH';
      monster.searchTurnsRemaining = 8;
      monster.targetCoord = monster.lastSeenPlayerPos ? { ...monster.lastSeenPlayerPos } : null;
      eventBus.emit('MonsterStateChanged', {
        monsterId: monster.id,
        oldState,
        newState: 'SEARCH',
      });

      if (monster.targetCoord) {
        const path = bfsPath(monster, monster.targetCoord, isPassable, floor.width, floor.height);
        if (path && path.length > 0) {
          monster.x = path[0].x;
          monster.y = path[0].y;
        }
      }
      return;
    }

    // 3. SEARCH state
    if (monster.state === 'SEARCH') {
      // Check if heard any new noise
      let heardNoise = false;
      for (const noise of noiseEvents) {
        const distances = propagateBFS(noise, noise.radius, isPassable);
        const dist = distances.get(`${monster.x},${monster.y}`);
        if (dist !== undefined) {
          monster.state = 'SUSPICIOUS';
          monster.targetCoord = { x: noise.x, y: noise.y };
          heardNoise = true;
          eventBus.emit('MonsterStateChanged', {
            monsterId: monster.id,
            oldState: 'SEARCH',
            newState: 'SUSPICIOUS',
          });
          break;
        }
      }

      if (!heardNoise) {
        monster.searchTurnsRemaining -= 1;
        if (monster.searchTurnsRemaining <= 0) {
          monster.state = 'PATROL';
          monster.targetCoord = null;
          eventBus.emit('MonsterStateChanged', {
            monsterId: monster.id,
            oldState: 'SEARCH',
            newState: 'PATROL',
          });
        } else if (monster.targetCoord) {
          const path = bfsPath(monster, monster.targetCoord, isPassable, floor.width, floor.height);
          if (path && path.length > 0) {
            monster.x = path[0].x;
            monster.y = path[0].y;
          }
        }
      }
      return;
    }

    // 4. SUSPICIOUS state
    if (monster.state === 'SUSPICIOUS') {
      if (monster.targetCoord && monster.x === monster.targetCoord.x && monster.y === monster.targetCoord.y) {
        // Reached destination, search briefly
        monster.state = 'SEARCH';
        monster.searchTurnsRemaining = 4;
        eventBus.emit('MonsterStateChanged', {
          monsterId: monster.id,
          oldState: 'SUSPICIOUS',
          newState: 'SEARCH',
        });
        return;
      }

      if (monster.targetCoord) {
        const path = bfsPath(monster, monster.targetCoord, isPassable, floor.width, floor.height);
        if (path && path.length > 0) {
          monster.x = path[0].x;
          monster.y = path[0].y;
        }
      }
      return;
    }

    // 5. PATROL state
    if (monster.state === 'PATROL') {
      // Check noise propagation
      for (const noise of noiseEvents) {
        const distances = propagateBFS(noise, noise.radius, isPassable);
        const dist = distances.get(`${monster.x},${monster.y}`);
        if (dist !== undefined) {
          monster.state = 'SUSPICIOUS';
          monster.targetCoord = { x: noise.x, y: noise.y };
          eventBus.emit('MonsterStateChanged', {
            monsterId: monster.id,
            oldState: 'PATROL',
            newState: 'SUSPICIOUS',
          });
          // Take first step towards noise
          const path = bfsPath(monster, monster.targetCoord, isPassable, floor.width, floor.height);
          if (path && path.length > 0) {
            monster.x = path[0].x;
            monster.y = path[0].y;
          }
          return;
        }
      }

      // Random wander in patrol
      if (rng) {
        const candidates = getCardinals(monster).filter(isPassable);
        if (candidates.length > 0) {
          const pick = candidates[rng.nextInt(0, candidates.length - 1)];
          monster.x = pick.x;
          monster.y = pick.y;
        }
      }
    }
  } else if (monster.type === 'listener') {
    // Listener is stationary
    if (monster.howlCooldown > 0) {
      monster.howlCooldown -= 1;
    }

    if (monster.state === 'HOWL') {
      // Execute howl: alert all other monsters within 10 path tiles
      if (allMonsters && monster.targetCoord) {
        const distances = propagateBFS(monster, 10, isPassable);
        for (const other of allMonsters) {
          if (other.id !== monster.id) {
            const d = distances.get(`${other.x},${other.y}`);
            if (d !== undefined) {
              const old = other.state;
              other.state = 'SUSPICIOUS';
              other.targetCoord = { ...monster.targetCoord };
              eventBus.emit('MonsterStateChanged', {
                monsterId: other.id,
                oldState: old,
                newState: 'SUSPICIOUS',
              });
            }
          }
        }
      }

      monster.state = 'IDLE';
      monster.howlCooldown = 5;
      eventBus.emit('MonsterStateChanged', {
        monsterId: monster.id,
        oldState: 'HOWL',
        newState: 'IDLE',
      });
      return;
    }

    if (monster.state === 'IDLE' && monster.howlCooldown === 0) {
      // Check noise within 5 BFS tiles
      for (const noise of noiseEvents) {
        const distances = propagateBFS(noise, 5, isPassable);
        const dist = distances.get(`${monster.x},${monster.y}`);
        if (dist !== undefined) {
          monster.state = 'HOWL';
          monster.targetCoord = { x: noise.x, y: noise.y };
          eventBus.emit('MonsterStateChanged', {
            monsterId: monster.id,
            oldState: 'IDLE',
            newState: 'HOWL',
          });
          break;
        }
      }
    }
  } else if (monster.type === 'stalker') {
    monster.stepTurnCounter = (monster.stepTurnCounter ?? 0) + 1;

    // Stalker moves every 2 turns
    if (monster.stepTurnCounter % 2 === 0) {
      // Target player or the breadcrumb history
      let target: Coord = playerPos;
      if (playerHistory && playerHistory.length > 0) {
        target = playerHistory[0];
      }

      const path = bfsPath(monster, target, isPassable, floor.width, floor.height);
      if (path && path.length > 0) {
        monster.x = path[0].x;
        monster.y = path[0].y;
      }
    }
  }
}

/**
 * Resolves monster-player collisions, stun, and player invulnerability.
 */
export function resolveMonsterCollisions(
  monsters: readonly Monster[],
  playerPos: Coord,
  playerHp: number,
  playerInvulnerableTurns: number,
  eventBus: EventBus
): CollisionResult {
  let hp = playerHp;
  let invulnerable = playerInvulnerableTurns;
  let hitOccurred = false;
  let attackingMonster: Monster | null = null;

  for (const monster of monsters) {
    if (monster.x === playerPos.x && monster.y === playerPos.y) {
      if (invulnerable <= 0) {
        hp = Math.max(0, hp - monster.damage);
        invulnerable = 2; // 2 turns of invulnerability
        monster.stunnedTurns = 3; // Monster stunned 3 turns
        hitOccurred = true;
        attackingMonster = monster;

        eventBus.emit('MonsterStateChanged', {
          monsterId: monster.id,
          oldState: monster.state,
          newState: 'STUNNED',
        });
        break;
      }
    }
  }

  // If no hit occurred this turn, count down invulnerability
  if (!hitOccurred && invulnerable > 0) {
    invulnerable -= 1;
  }

  return {
    playerHp: hp,
    playerInvulnerableTurns: invulnerable,
    hitOccurred,
    attackingMonster,
  };
}
