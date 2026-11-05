/**
 * Biome Resolution & Visual Themes for DEEPER.
 * Resolves 3 depth-scaled biomes (§4.1):
 * - Depths 1-4: Stone Dungeon (damp, embers)
 * - Depths 5-8: Fungal Cavern (bioluminescent green, moss)
 * - Depths 9-12: Abyssal Trench (cold navy, violet)
 * Pure TypeScript, zero Phaser imports.
 */

import biomesData from '../data/biomes.json';

export interface BiomeDefinition {
  readonly id: string;
  readonly name_key: string;
  readonly desc_key: string;
  readonly start_depth: number;
  readonly end_depth: number;
  readonly ambient_color: string;
  readonly accent_color: string;
  readonly wall_tint?: string;
  readonly floor_tint?: string;
}

export function getAllBiomes(): readonly BiomeDefinition[] {
  return biomesData.biomes as readonly BiomeDefinition[];
}

export function getBiomeForDepth(
  depth: number,
  biomes: readonly BiomeDefinition[] = getAllBiomes()
): BiomeDefinition {
  if (biomes.length === 0) {
    throw new Error('No biomes defined in configuration.');
  }

  // Find matching biome for depth range
  const matched = biomes.find((b) => depth >= b.start_depth && depth <= b.end_depth);
  if (matched) {
    return matched;
  }

  // Clamp out of range depths
  if (depth < biomes[0].start_depth) {
    return biomes[0];
  }
  return biomes[biomes.length - 1];
}
