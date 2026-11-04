import { describe, it, expect } from 'vitest';
import {
  loadItems,
  loadEvents,
  loadEnemies,
  loadBiomes,
  loadCurses,
  loadBargains,
  loadUpgrades,
  loadMirrorArchetypes,
  loadBannedWords,
  validateSchema,
} from '../src/services/dataLoader';

describe('Data Loaders & Schema Validation', () => {
  it('loads and validates all 9 game data schemas without errors', () => {
    expect(loadItems().length).toBeGreaterThan(0);
    expect(loadEvents().length).toBeGreaterThan(0);
    expect(loadEnemies().length).toBeGreaterThan(0);
    expect(loadBiomes().length).toBe(3);
    expect(loadCurses().length).toBe(4);
    expect(loadBargains().length).toBe(8);
    expect(loadUpgrades().length).toBe(6);
    expect(loadMirrorArchetypes().length).toBe(4);
    expect(loadBannedWords().length).toBeGreaterThan(0);
  });

  it('rejects data with non-snake_case IDs', () => {
    const invalidData = [
      { id: 'camelCaseId', name_key: 'x', desc_key: 'y' },
    ];
    expect(() => validateSchema(invalidData, 'test')).toThrow(/snake_case/);
  });

  it('rejects data with non-positive or non-number weights', () => {
    const zeroWeight = [
      { id: 'item_one', weight: 0 },
    ];
    expect(() => validateSchema(zeroWeight, 'test')).toThrow(/positive number/);

    const negativeWeight = [
      { id: 'item_two', weight: -5 },
    ];
    expect(() => validateSchema(negativeWeight, 'test')).toThrow(/positive number/);
  });
});

