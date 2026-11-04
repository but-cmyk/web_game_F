import { describe, it, expect } from 'vitest';
import {
  Monster,
  spawnMonsters,
  updateMonsterFSM,
  calculateDangerP,
  resolveMonsterCollisions,
  hasLineOfSight,
} from '../src/core/monsters';
import { DungeonFloor, TileType } from '../src/core/mapgen';
import { Rng } from '../src/core/rng';
import { EventBus } from '../src/core/events';

interface MutableFloor extends Omit<DungeonFloor, 'tiles'> {
  tiles: TileType[];
}

function createMockFloor(width = 20, height = 20): MutableFloor {
  const tiles: TileType[] = new Array(width * height).fill('FLOOR');
  // Put a border of walls
  for (let x = 0; x < width; x++) {
    tiles[x] = 'WALL';
    tiles[(height - 1) * width + x] = 'WALL';
  }
  for (let y = 0; y < height; y++) {
    tiles[y * width] = 'WALL';
    tiles[y * width + (width - 1)] = 'WALL';
  }
  return {
    width,
    height,
    tiles,
    entrance: { x: 2, y: 2 },
    stairsDown: { x: 17, y: 17 },
    rooms: [],
  };
}

describe('Monster Spawning & Scaling (§4.5)', () => {
  it('spawns 2 + floor(depth / 2) monsters deterministically', () => {
    const floor = createMockFloor();
    const rng1 = new Rng(12345);
    const depth1 = 1; // 2 + floor(1/2) = 2
    const monstersD1 = spawnMonsters(floor, depth1, rng1);
    expect(monstersD1).toHaveLength(2);

    const rng2 = new Rng(12345);
    const depth6 = 6; // 2 + floor(6/2) = 5
    const monstersD6 = spawnMonsters(floor, depth6, rng2);
    expect(monstersD6).toHaveLength(5);
  });

  it('never spawns monsters within 6 tiles of entrance', () => {
    const floor = createMockFloor();
    const rng = new Rng(9999);
    const monsters = spawnMonsters(floor, 5, rng);

    for (const m of monsters) {
      const dist = Math.abs(m.x - floor.entrance.x) + Math.abs(m.y - floor.entrance.y);
      expect(dist).toBeGreaterThanOrEqual(6);
    }
  });

  it('only spawns Stalker naturally at depth >= 8', () => {
    const floor = createMockFloor();
    // At depth 1-7, stalker should not appear naturally
    for (let depth = 1; depth < 8; depth++) {
      const rng = new Rng(100 + depth);
      const monsters = spawnMonsters(floor, depth, rng);
      expect(monsters.some((m) => m.type === 'stalker')).toBe(false);
    }

    // At depth 8, stalker can spawn
    let foundStalker = false;
    for (let seed = 1; seed <= 50; seed++) {
      const rng = new Rng(seed);
      const monsters = spawnMonsters(floor, 8, rng);
      if (monsters.some((m) => m.type === 'stalker')) {
        foundStalker = true;
        break;
      }
    }
    expect(foundStalker).toBe(true);
  });
});

describe('Line of Sight Utilities', () => {
  it('detects unobstructed straight line between two points', () => {
    const floor = createMockFloor();
    expect(hasLineOfSight(floor, { x: 5, y: 5 }, { x: 10, y: 5 })).toBe(true);
  });

  it('detects wall obstruction blocking line of sight', () => {
    const floor = createMockFloor();
    // Place a wall between 5,5 and 10,5 at 7,5
    floor.tiles[5 * floor.width + 7] = 'WALL';
    expect(hasLineOfSight(floor, { x: 5, y: 5 }, { x: 10, y: 5 })).toBe(false);
  });
});

describe('Crawler FSM Transitions (§4.5)', () => {
  it('PATROL -> SUSPICIOUS when hearing noise within BFS path distance', () => {
    const floor = createMockFloor();
    const crawler: Monster = {
      id: 'crawler_1',
      type: 'crawler',
      x: 5,
      y: 5,
      state: 'PATROL',
      hp: 1,
      maxHp: 1,
      damage: 1,
      targetCoord: null,
      stunnedTurns: 0,
      searchTurnsRemaining: 0,
      howlCooldown: 0,
      lastSeenPlayerPos: null,
    };

    const eventBus = new EventBus();
    const noiseEvent = { x: 8, y: 5, radius: 4, source: 'player' };

    updateMonsterFSM(
      crawler,
      floor,
      { x: 15, y: 15 }, // Player far away out of sight
      [noiseEvent],
      [], // player history
      eventBus
    );

    expect(crawler.state).toBe('SUSPICIOUS');
    expect(crawler.targetCoord).toEqual({ x: 8, y: 5 });
  });

  it('remains in PATROL if noise is blocked by walls exceeding hearing distance', () => {
    const floor = createMockFloor();
    // Wall blocking path
    for (let y = 1; y < 19; y++) {
      floor.tiles[y * floor.width + 7] = 'WALL';
    }
    // Only a tiny gap at y=18
    floor.tiles[18 * floor.width + 7] = 'FLOOR';

    const crawler: Monster = {
      id: 'crawler_1',
      type: 'crawler',
      x: 5,
      y: 5,
      state: 'PATROL',
      hp: 1,
      maxHp: 1,
      damage: 1,
      targetCoord: null,
      stunnedTurns: 0,
      searchTurnsRemaining: 0,
      howlCooldown: 0,
      lastSeenPlayerPos: null,
    };

    const eventBus = new EventBus();
    // Noise at 8, 5 (Euclidean distance is 3, but path distance through gap is > 20)
    const noiseEvent = { x: 8, y: 5, radius: 4, source: 'player' };

    updateMonsterFSM(
      crawler,
      floor,
      { x: 15, y: 15 },
      [noiseEvent],
      [],
      eventBus
    );

    expect(crawler.state).toBe('PATROL');
  });

  it('transitions to CHASE when gaining line of sight to player', () => {
    const floor = createMockFloor();
    const crawler: Monster = {
      id: 'crawler_1',
      type: 'crawler',
      x: 5,
      y: 5,
      state: 'PATROL',
      hp: 1,
      maxHp: 1,
      damage: 1,
      targetCoord: null,
      stunnedTurns: 0,
      searchTurnsRemaining: 0,
      howlCooldown: 0,
      lastSeenPlayerPos: null,
    };

    const eventBus = new EventBus();
    // Player is in clear sight at 8, 5
    updateMonsterFSM(
      crawler,
      floor,
      { x: 8, y: 5 },
      [],
      [],
      eventBus
    );

    expect(crawler.state).toBe('CHASE');
    expect(crawler.targetCoord).toEqual({ x: 8, y: 5 });
  });

  it('CHASE -> SEARCH (8 turns) when losing line of sight', () => {
    const floor = createMockFloor();
    // Place wall blocking sight
    floor.tiles[5 * floor.width + 6] = 'WALL';

    const crawler: Monster = {
      id: 'crawler_1',
      type: 'crawler',
      x: 5,
      y: 5,
      state: 'CHASE',
      hp: 1,
      maxHp: 1,
      damage: 1,
      targetCoord: { x: 8, y: 5 },
      stunnedTurns: 0,
      searchTurnsRemaining: 0,
      howlCooldown: 0,
      lastSeenPlayerPos: { x: 8, y: 5 },
    };

    const eventBus = new EventBus();
    // Player behind wall at 8, 5
    updateMonsterFSM(
      crawler,
      floor,
      { x: 8, y: 5 },
      [],
      [],
      eventBus
    );

    expect(crawler.state).toBe('SEARCH');
    expect(crawler.searchTurnsRemaining).toBe(8);
  });

  it('SEARCH -> PATROL when 8 turns elapse without sight or noise', () => {
    const floor = createMockFloor();
    floor.tiles[5 * floor.width + 6] = 'WALL';

    const crawler: Monster = {
      id: 'crawler_1',
      type: 'crawler',
      x: 5,
      y: 5,
      state: 'SEARCH',
      hp: 1,
      maxHp: 1,
      damage: 1,
      targetCoord: { x: 5, y: 5 },
      stunnedTurns: 0,
      searchTurnsRemaining: 1, // Last turn of search
      howlCooldown: 0,
      lastSeenPlayerPos: { x: 8, y: 5 },
    };

    const eventBus = new EventBus();
    updateMonsterFSM(
      crawler,
      floor,
      { x: 18, y: 18 },
      [],
      [],
      eventBus
    );

    expect(crawler.state).toBe('PATROL');
    expect(crawler.searchTurnsRemaining).toBe(0);
  });
});

describe('Listener FSM Transitions (§4.5)', () => {
  it('remains stationary and triggers HOWL when hearing noise within 5 path tiles', () => {
    const floor = createMockFloor();
    const listener: Monster = {
      id: 'listener_1',
      type: 'listener',
      x: 10,
      y: 10,
      state: 'IDLE',
      hp: 2,
      maxHp: 2,
      damage: 1,
      targetCoord: null,
      stunnedTurns: 0,
      searchTurnsRemaining: 0,
      howlCooldown: 0,
      lastSeenPlayerPos: null,
    };

    const eventBus = new EventBus();
    const noiseEvent = { x: 12, y: 10, radius: 4, source: 'player' };

    updateMonsterFSM(
      listener,
      floor,
      { x: 2, y: 2 },
      [noiseEvent],
      [],
      eventBus
    );

    expect(listener.state).toBe('HOWL');
    expect(listener.x).toBe(10);
    expect(listener.y).toBe(10); // Stationary!
  });

  it('alert howl transitions all monsters in 10 tiles to SUSPICIOUS', () => {
    const floor = createMockFloor();
    const listener: Monster = {
      id: 'listener_1',
      type: 'listener',
      x: 10,
      y: 10,
      state: 'HOWL',
      hp: 2,
      maxHp: 2,
      damage: 1,
      targetCoord: { x: 12, y: 10 },
      stunnedTurns: 0,
      searchTurnsRemaining: 0,
      howlCooldown: 0,
      lastSeenPlayerPos: null,
    };

    const otherCrawler: Monster = {
      id: 'crawler_nearby',
      type: 'crawler',
      x: 13,
      y: 10,
      state: 'PATROL',
      hp: 1,
      maxHp: 1,
      damage: 1,
      targetCoord: null,
      stunnedTurns: 0,
      searchTurnsRemaining: 0,
      howlCooldown: 0,
      lastSeenPlayerPos: null,
    };

    const eventBus = new EventBus();
    // Update listener howling
    updateMonsterFSM(
      listener,
      floor,
      { x: 2, y: 2 },
      [],
      [],
      eventBus,
      [listener, otherCrawler]
    );

    expect(otherCrawler.state).toBe('SUSPICIOUS');
    expect(otherCrawler.targetCoord).toEqual({ x: 12, y: 10 });
    expect(listener.state).toBe('IDLE');
    expect(listener.howlCooldown).toBe(5);
  });
});

describe('Stalker FSM (§4.5)', () => {
  it('follows player breadcrumb history trail at 1 step per 2 turns', () => {
    const floor = createMockFloor();
    const stalker: Monster = {
      id: 'stalker_1',
      type: 'stalker',
      x: 5,
      y: 5,
      state: 'STALK',
      hp: 3,
      maxHp: 3,
      damage: 1,
      targetCoord: null,
      stunnedTurns: 0,
      searchTurnsRemaining: 0,
      howlCooldown: 0,
      lastSeenPlayerPos: null,
      stepTurnCounter: 0,
    };

    const playerHistory = [
      { x: 6, y: 5 },
      { x: 7, y: 5 },
      { x: 8, y: 5 },
    ];

    const eventBus = new EventBus();

    // Turn 1: does not move (moves every 2 turns)
    updateMonsterFSM(
      stalker,
      floor,
      { x: 9, y: 5 },
      [],
      playerHistory,
      eventBus
    );
    expect(stalker.x).toBe(5);
    expect(stalker.y).toBe(5);

    // Turn 2: moves towards breadcrumb trail
    updateMonsterFSM(
      stalker,
      floor,
      { x: 9, y: 5 },
      [],
      playerHistory,
      eventBus
    );
    expect(stalker.x).toBe(6);
    expect(stalker.y).toBe(5);
  });
});

describe('Disturbance (Biến cố) Formula (§4.5)', () => {
  it('calculates dangerP accurately across depths and dread', () => {
    // dangerP(depth, dread) = min(0.6, 0.05 + 0.04 * depth + 0.002 * dread)
    expect(calculateDangerP(1, 0)).toBeCloseTo(0.09, 3);
    expect(calculateDangerP(5, 50)).toBeCloseTo(0.35, 3);
    // Upper bound clamped at 0.6
    expect(calculateDangerP(12, 100)).toBeCloseTo(0.6, 3);
  });
});

describe('Combat Collisions, Stun & Invulnerability (§4.5)', () => {
  it('inflicts 1 damage to player, stuns monster for 3 turns, grants 2 invulnerable turns', () => {
    const monster: Monster = {
      id: 'm1',
      type: 'crawler',
      x: 5,
      y: 5,
      state: 'CHASE',
      hp: 1,
      maxHp: 1,
      damage: 1,
      targetCoord: { x: 5, y: 5 },
      stunnedTurns: 0,
      searchTurnsRemaining: 0,
      howlCooldown: 0,
      lastSeenPlayerPos: null,
    };

    const eventBus = new EventBus();
    const result = resolveMonsterCollisions(
      [monster],
      { x: 5, y: 5 },
      2, // player HP
      0, // invulnerable turns
      eventBus
    );

    expect(result.playerHp).toBe(1);
    expect(result.playerInvulnerableTurns).toBe(2);
    expect(monster.stunnedTurns).toBe(3);
  });

  it('prevents damage when player has invulnerability turns', () => {
    const monster: Monster = {
      id: 'm1',
      type: 'crawler',
      x: 5,
      y: 5,
      state: 'CHASE',
      hp: 1,
      maxHp: 1,
      damage: 1,
      targetCoord: { x: 5, y: 5 },
      stunnedTurns: 0,
      searchTurnsRemaining: 0,
      howlCooldown: 0,
      lastSeenPlayerPos: null,
    };

    const eventBus = new EventBus();
    const result = resolveMonsterCollisions(
      [monster],
      { x: 5, y: 5 },
      1, // player HP
      1, // already invulnerable
      eventBus
    );

    expect(result.playerHp).toBe(1); // No damage taken!
  });
});
