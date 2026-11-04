/**
 * Odds Codex Data Model Generator for DEEPER.
 * Directly ingests runtime JSON definitions (enemies, curses, bargains, items)
 * and guarantees 100% transparent probabilities with zero hidden modifiers.
 * Pure TypeScript, zero Phaser imports.
 */

import cursesData from '../data/curses.json';
import bargainsData from '../data/bargains.json';
import enemiesData from '../data/enemies.json';
import itemsData from '../data/items.json';

export interface CodexEnemy {
  readonly id: string;
  readonly nameKey: string;
  readonly descKey: string;
  readonly hp: number;
  readonly damage: number;
  readonly weight: number;
  readonly hearingRadius?: number;
  readonly minDepth?: number;
}

export interface CodexCurse {
  readonly id: string;
  readonly nameKey: string;
  readonly descKey: string;
  readonly effect: string;
  readonly weight: number;
  readonly percentage: number;
}

export interface CodexBargain {
  readonly id: string;
  readonly nameKey: string;
  readonly costKey: string;
  readonly rewardKey: string;
  readonly costType: string;
  readonly costValue: number;
  readonly rewardType: string;
  readonly rewardValue: number;
}

export interface CodexItem {
  readonly id: string;
  readonly nameKey: string;
  readonly descKey: string;
  readonly multiplier?: number;
  readonly oilRestore?: number;
  readonly weight: number;
}

export interface CodexData {
  readonly enemies: readonly CodexEnemy[];
  readonly curses: readonly CodexCurse[];
  readonly bargains: readonly CodexBargain[];
  readonly items: readonly CodexItem[];
}

/**
 * Returns the fully hydrated and synchronized Codex datasets.
 */
export function getCodexData(): CodexData {
  const enemies: CodexEnemy[] = enemiesData.enemies.map((e) => ({
    id: e.id,
    nameKey: e.name_key,
    descKey: e.desc_key,
    hp: e.hp,
    damage: e.damage,
    weight: e.weight,
    hearingRadius: 'hearing_radius' in e ? (e as { hearing_radius: number }).hearing_radius : undefined,
    minDepth: 'min_depth' in e ? (e as { min_depth: number }).min_depth : undefined,
  }));

  const totalCurseWeight = cursesData.curses.reduce((sum, c) => sum + c.weight, 0);
  const curses: CodexCurse[] = cursesData.curses.map((c) => ({
    id: c.id,
    nameKey: c.name_key,
    descKey: c.desc_key,
    effect: c.effect,
    weight: c.weight,
    percentage: Math.round((c.weight / totalCurseWeight) * 100),
  }));

  const bargains: CodexBargain[] = bargainsData.bargains.map((b) => ({
    id: b.id,
    nameKey: b.name_key,
    costKey: b.cost_key,
    rewardKey: b.reward_key,
    costType: b.cost_type,
    costValue: b.cost_value,
    rewardType: b.reward_type,
    rewardValue: b.reward_value,
  }));

  const items: CodexItem[] = itemsData.items.map((i) => ({
    id: i.id,
    nameKey: i.name_key,
    descKey: i.desc_key,
    multiplier: 'multiplier' in i ? (i as { multiplier: number }).multiplier : undefined,
    oilRestore: 'oil_restore' in i ? (i as { oil_restore: number }).oil_restore : undefined,
    weight: i.weight,
  }));

  return {
    enemies,
    curses,
    bargains,
    items,
  };
}
