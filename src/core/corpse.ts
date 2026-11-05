/**
 * Social Corpse System for DEEPER (§4.10, §5 M10).
 * Stores player death markers on floors and allows recovering 50% of lost gold.
 * Pure TypeScript, zero Phaser imports.
 */

export interface PlayerCorpse {
  readonly id: string;
  readonly depth: number;
  readonly x: number;
  readonly y: number;
  readonly lostGold: number;
  readonly recoverableGold: number;
  readonly deathCause: string;
  readonly timestamp: number;
  isLooted: boolean;
}

export function createCorpse(
  depth: number,
  x: number,
  y: number,
  lostGold: number,
  deathCause: string,
  timestamp: number = 0
): PlayerCorpse {
  const recoverableGold = Math.round(lostGold * 0.5);
  return {
    id: `corpse_${depth}_${x}_${y}_${timestamp}`,
    depth,
    x,
    y,
    lostGold,
    recoverableGold,
    deathCause,
    timestamp,
    isLooted: false,
  };
}

export function lootCorpse(corpse: PlayerCorpse): {
  goldRecovered: number;
  updatedCorpse: PlayerCorpse;
} {
  if (corpse.isLooted) {
    return {
      goldRecovered: 0,
      updatedCorpse: corpse,
    };
  }

  const updatedCorpse: PlayerCorpse = {
    ...corpse,
    isLooted: true,
  };

  return {
    goldRecovered: corpse.recoverableGold,
    updatedCorpse,
  };
}

export function filterCorpsesForFloor(
  corpses: readonly PlayerCorpse[],
  depth: number
): PlayerCorpse[] {
  return corpses.filter((c) => c.depth === depth && !c.isLooted);
}
