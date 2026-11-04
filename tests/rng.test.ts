import { describe, it, expect } from 'vitest';
import { Rng } from '../src/core/rng';

describe('Rng (Seeded Deterministic PRNG)', () => {
  it('generates identical sequence from identical numeric seed', () => {
    const rngA = new Rng(12345);
    const rngB = new Rng(12345);

    const seqA = Array.from({ length: 10 }, () => rngA.next());
    const seqB = Array.from({ length: 10 }, () => rngB.next());

    expect(seqA).toEqual(seqB);
  });

  it('generates distinct sequences from different seeds', () => {
    const rngA = new Rng(12345);
    const rngB = new Rng(54321);

    const valA = rngA.next();
    const valB = rngB.next();

    expect(valA).not.toBe(valB);
  });

  it('accepts string seed and produces consistent sequence', () => {
    const rngA = new Rng('daily-2026-11-04');
    const rngB = new Rng('daily-2026-11-04');

    expect(rngA.next()).toBe(rngB.next());
    expect(rngA.nextInt(1, 100)).toBe(rngB.nextInt(1, 100));
  });

  it('clamps next() strictly to [0, 1) range', () => {
    const rng = new Rng(999);
    for (let i = 0; i < 1000; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('produces integers within inclusive [min, max] range', () => {
    const rng = new Rng(777);
    const results = new Set<number>();
    for (let i = 0; i < 500; i++) {
      const val = rng.nextInt(3, 7);
      expect(val).toBeGreaterThanOrEqual(3);
      expect(val).toBeLessThanOrEqual(7);
      expect(Number.isInteger(val)).toBe(true);
      results.add(val);
    }
    // All numbers 3, 4, 5, 6, 7 should be hit over 500 trials
    expect(results.size).toBe(5);
  });

  it('forks an independent deterministic child stream', () => {
    const masterA = new Rng(42);
    const masterB = new Rng(42);

    const lootStreamA = masterA.fork('loot');
    const lootStreamB = masterB.fork('loot');

    expect(lootStreamA.next()).toBe(lootStreamB.next());
    expect(lootStreamA.nextInt(10, 50)).toBe(lootStreamB.nextInt(10, 50));

    // Master stream progresses independently
    expect(masterA.next()).toBe(masterB.next());
  });

  it('picks elements uniformly from array', () => {
    const rng = new Rng(101);
    const items = ['sword', 'shield', 'potion', 'gold'] as const;
    const picked = rng.pick(items);
    expect(items).toContain(picked);
  });

  it('throws invariant error when picking from empty array', () => {
    const rng = new Rng(101);
    expect(() => rng.pick([])).toThrow();
  });
});

