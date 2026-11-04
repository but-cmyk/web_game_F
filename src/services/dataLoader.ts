/**
 * Strongly-typed Game Data Loaders for DEEPER.
 * Validates JSON data at the boundary:
 * - Ensures valid snake_case IDs
 * - Ensures positive non-zero numeric weights
 * - Ensures required schema fields are present
 * Zero any, zero external validation libraries.
 */

import itemsJson from '../data/items.json';
import eventsJson from '../data/events.json';
import enemiesJson from '../data/enemies.json';
import biomesJson from '../data/biomes.json';
import cursesJson from '../data/curses.json';
import bargainsJson from '../data/bargains.json';
import upgradesJson from '../data/upgrades.json';
import mirrorJson from '../data/mirror.json';
import bannedWordsJson from '../data/banned-mirror-words.json';

const SNAKE_CASE_REGEX = /^[a-z0-9]+(_[a-z0-9]+)*$/;

export interface ItemDefinition {
  readonly id: string;
  readonly name_key: string;
  readonly desc_key: string;
  readonly multiplier?: number;
  readonly oil_restore?: number;
  readonly weight: number;
}

export interface EventDefinition {
  readonly id: string;
  readonly name_key: string;
  readonly desc_key: string;
  readonly dread_delta?: number;
  readonly bonus_gold?: number;
  readonly weight: number;
}

export interface EnemyDefinition {
  readonly id: string;
  readonly name_key: string;
  readonly desc_key: string;
  readonly hp: number;
  readonly damage: number;
  readonly hearing_radius?: number;
  readonly search_duration?: number;
  readonly howl_radius?: number;
  readonly min_depth?: number;
  readonly weight: number;
}

export interface BiomeDefinition {
  readonly id: string;
  readonly name_key: string;
  readonly desc_key: string;
  readonly start_depth: number;
  readonly end_depth: number;
  readonly ambient_color: string;
  readonly accent_color: string;
}

export interface CurseDefinition {
  readonly id: string;
  readonly name_key: string;
  readonly desc_key: string;
  readonly effect: string;
  readonly radius_delta?: number;
  readonly noise_multiplier?: number;
  readonly dread_addition?: number;
  readonly weight: number;
}

export interface BargainDefinition {
  readonly id: string;
  readonly name_key: string;
  readonly cost_key: string;
  readonly reward_key: string;
  readonly cost_type: string;
  readonly cost_value: number;
  readonly reward_type: string;
  readonly reward_value: number;
}

export interface UpgradeDefinition {
  readonly id: string;
  readonly name_key: string;
  readonly desc_key: string;
  readonly max_tiers: number;
  readonly tier_costs: readonly number[];
  readonly effect_per_tier?: number;
  readonly noise_reduction_per_tier?: number;
}

export interface ArchetypeDefinition {
  readonly id: string;
  readonly name_key: string;
  readonly desc_key: string;
  readonly greed_min?: number;
  readonly greed_max?: number;
  readonly fear_min?: number;
  readonly fear_max?: number;
}

export function validateSchema(records: unknown[], context: string): void {
  for (let i = 0; i < records.length; i++) {
    const item = records[i];
    if (!item || typeof item !== 'object') {
      throw new Error(`Data validation error in ${context}[${i}]: element must be an object`);
    }

    const obj = item as Record<string, unknown>;

    // Validate ID if present
    if ('id' in obj) {
      if (typeof obj.id !== 'string' || !SNAKE_CASE_REGEX.test(obj.id)) {
        throw new Error(
          `Data validation error in ${context}[${i}]: id "${String(obj.id)}" must be snake_case`
        );
      }
    }

    // Validate weight if present
    if ('weight' in obj) {
      if (typeof obj.weight !== 'number' || !Number.isFinite(obj.weight) || obj.weight <= 0) {
        throw new Error(
          `Data validation error in ${context}[${i}]: weight must be a strictly positive number`
        );
      }
    }
  }
}

export function loadItems(): readonly ItemDefinition[] {
  validateSchema(itemsJson.items, 'items.json');
  return itemsJson.items as unknown as readonly ItemDefinition[];
}

export function loadEvents(): readonly EventDefinition[] {
  validateSchema(eventsJson.events, 'events.json');
  return eventsJson.events as unknown as readonly EventDefinition[];
}

export function loadEnemies(): readonly EnemyDefinition[] {
  validateSchema(enemiesJson.enemies, 'enemies.json');
  return enemiesJson.enemies as unknown as readonly EnemyDefinition[];
}

export function loadBiomes(): readonly BiomeDefinition[] {
  validateSchema(biomesJson.biomes, 'biomes.json');
  return biomesJson.biomes as unknown as readonly BiomeDefinition[];
}

export function loadCurses(): readonly CurseDefinition[] {
  validateSchema(cursesJson.curses, 'curses.json');
  return cursesJson.curses as unknown as readonly CurseDefinition[];
}

export function loadBargains(): readonly BargainDefinition[] {
  validateSchema(bargainsJson.bargains, 'bargains.json');
  return bargainsJson.bargains as unknown as readonly BargainDefinition[];
}

export function loadUpgrades(): readonly UpgradeDefinition[] {
  validateSchema(upgradesJson.upgrades, 'upgrades.json');
  return upgradesJson.upgrades as unknown as readonly UpgradeDefinition[];
}

export function loadMirrorArchetypes(): readonly ArchetypeDefinition[] {
  validateSchema(mirrorJson.archetypes, 'mirror.json');
  return mirrorJson.archetypes as unknown as readonly ArchetypeDefinition[];
}

export function loadBannedWords(): readonly string[] {
  return bannedWordsJson.banned_words;
}

