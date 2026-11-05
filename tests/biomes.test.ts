import { describe, it, expect } from 'vitest';
import { getBiomeForDepth, BiomeDefinition } from '../src/core/biomes';
import biomesData from '../src/data/biomes.json';

describe('Biome System (§4.1, M9)', () => {
  const biomes = biomesData.biomes as BiomeDefinition[];

  it('contains at least 3 depth-scaled biomes', () => {
    expect(biomes.length).toBeGreaterThanOrEqual(3);
  });

  it('resolves Stone Dungeon for depths 1 to 4', () => {
    for (let depth = 1; depth <= 4; depth++) {
      const biome = getBiomeForDepth(depth, biomes);
      expect(biome.id).toBe('stone_dungeon');
      expect(biome.ambient_color).toBeDefined();
    }
  });

  it('resolves Fungal Cavern for depths 5 to 8', () => {
    for (let depth = 5; depth <= 8; depth++) {
      const biome = getBiomeForDepth(depth, biomes);
      expect(biome.id).toBe('fungal_cavern');
    }
  });

  it('resolves Abyssal Trench for depths 9 to 12', () => {
    for (let depth = 9; depth <= 12; depth++) {
      const biome = getBiomeForDepth(depth, biomes);
      expect(biome.id).toBe('abyssal_trench');
    }
  });

  it('clamps out-of-range depths safely to nearest biome boundary', () => {
    const biome0 = getBiomeForDepth(0, biomes);
    expect(biome0.id).toBe('stone_dungeon');

    const biome15 = getBiomeForDepth(15, biomes);
    expect(biome15.id).toBe('abyssal_trench');
  });
});
