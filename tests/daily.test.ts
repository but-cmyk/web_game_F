import { describe, it, expect } from 'vitest';
import { getUtcDateString, getUtcDailySeed } from '../src/core/daily';

describe('UTC Daily Seed Generation (§3, §4.10, §5 M10)', () => {
  it('formats dates consistently to UTC YYYY-MM-DD format', () => {
    // 2026-11-05 00:30 UTC
    const date1 = new Date(Date.UTC(2026, 10, 5, 0, 30, 0));
    expect(getUtcDateString(date1)).toBe('2026-11-05');

    // 2026-11-05 23:59 UTC
    const date2 = new Date(Date.UTC(2026, 10, 5, 23, 59, 59));
    expect(getUtcDateString(date2)).toBe('2026-11-05');
  });

  it('produces identical deterministic seed for the same UTC date string', () => {
    const seedA = getUtcDailySeed('2026-11-05');
    const seedB = getUtcDailySeed('2026-11-05');

    expect(seedA).toBe(seedB);
    expect(seedA).toBeGreaterThan(0);
    expect(Number.isInteger(seedA)).toBe(true);
  });

  it('generates different seeds for distinct days', () => {
    const seed1 = getUtcDailySeed('2026-11-05');
    const seed2 = getUtcDailySeed('2026-11-06');
    const seed3 = getUtcDailySeed('2026-12-01');

    expect(seed1).not.toBe(seed2);
    expect(seed1).not.toBe(seed3);
  });
});
