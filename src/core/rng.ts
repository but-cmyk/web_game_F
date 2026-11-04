/**
 * Deterministic Pseudorandom Number Generator (PRNG) for DEEPER.
 * Uses 32-bit Mulberry32 algorithm.
 * Strictly zero Math.random() usage.
 */

function hashStringToSeed(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export class Rng {
  private state: number;

  constructor(seed: number | string) {
    if (typeof seed === 'string') {
      this.state = hashStringToSeed(seed);
    } else {
      this.state = (seed >>> 0) || 1;
    }
  }

  /**
   * Generates a floating-point number in [0, 1).
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates an integer in [min, max] inclusive.
   */
  nextInt(min: number, max: number): number {
    if (min > max) {
      throw new Error(`Rng.nextInt: min (${min}) cannot exceed max (${max})`);
    }
    const range = max - min + 1;
    return min + Math.floor(this.next() * range);
  }

  /**
   * Selects an element uniformly from an array.
   */
  pick<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error('Rng.pick: cannot pick from an empty array');
    }
    const idx = this.nextInt(0, array.length - 1);
    return array[idx];
  }

  /**
   * Forks an independent child RNG stream by hashing current state + namespace.
   * Preserves determinism across modular sub-systems without shifting other streams.
   */
  fork(namespace: string): Rng {
    const combinedSeed = `${this.state}:${namespace}`;
    return new Rng(combinedSeed);
  }
}
