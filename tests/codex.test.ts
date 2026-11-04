import { describe, it, expect } from 'vitest';
import { getCodexData } from '../src/core/codex';
import cursesData from '../src/data/curses.json';
import bargainsData from '../src/data/bargains.json';
import enemiesData from '../src/data/enemies.json';
import itemsData from '../src/data/items.json';

describe('Odds Codex Single Source of Truth (§4.11, §5 M6)', () => {
  it('programmatically constructs Codex from exact JSON files without hardcoded drift', () => {
    const codex = getCodexData();

    expect(codex.enemies).toHaveLength(enemiesData.enemies.length);
    expect(codex.curses).toHaveLength(cursesData.curses.length);
    expect(codex.bargains).toHaveLength(bargainsData.bargains.length);
    expect(codex.items).toHaveLength(itemsData.items.length);
  });

  it('guarantees transparent odds for all 4 cursed chest curses summing strictly to 100%', () => {
    const codex = getCodexData();

    expect(codex.curses).toHaveLength(4);
    let totalPercentage = 0;
    for (const curse of codex.curses) {
      expect(curse.percentage).toBe(25);
      expect(curse.weight).toBe(25);
      totalPercentage += curse.percentage;
    }
    expect(totalPercentage).toBe(100);
  });

  it('provides explicit costs and rewards for all 8 devil bargains without hidden modifiers', () => {
    const codex = getCodexData();

    expect(codex.bargains).toHaveLength(8);
    for (const bargain of codex.bargains) {
      expect(typeof bargain.costType).toBe('string');
      expect(typeof bargain.rewardType).toBe('string');
      expect(Math.abs(bargain.costValue)).toBeGreaterThan(0);
      expect(Math.abs(bargain.rewardValue)).toBeGreaterThan(0);
    }
  });

  it('preserves transparent item multipliers matching items.json', () => {
    const codex = getCodexData();

    const rareGem = codex.items.find((i) => i.id === 'rare_gem');
    expect(rareGem?.id).toBe('rare_gem');
    expect(rareGem?.multiplier).toBe(4.0);

    const goldBar = codex.items.find((i) => i.id === 'gold_bar');
    expect(goldBar?.id).toBe('gold_bar');
    expect(goldBar?.multiplier).toBe(2.5);
  });
});
