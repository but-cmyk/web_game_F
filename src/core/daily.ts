/**
 * UTC Daily Seed Generation for DEEPER (§3, §4.10, §5 M10).
 * Generates a shared daily dungeon seed based on the UTC date (YYYY-MM-DD).
 * Zero streak penalties, zero guilt notifications (§4.11 Rule 3).
 * Pure TypeScript, zero Phaser imports.
 */

export function getUtcDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Deterministically hashes a UTC date string into a 32-bit positive integer seed.
 * Uses 32-bit FNV-1a hash algorithm.
 */
export function getUtcDailySeed(dateStr: string): number {
  let hash = 2166136261;
  for (let i = 0; i < dateStr.length; i++) {
    hash ^= dateStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) || 1;
}
