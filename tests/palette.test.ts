import { describe, it, expect } from 'vitest';
import { DEEPER_24, PALETTE, isValidHexColor } from '../src/utils/palette';

describe('DEEPER-24 Palette', () => {
  it('defines exactly 24 unique colors', () => {
    expect(DEEPER_24).toHaveLength(24);
    const uniqueColors = new Set(DEEPER_24.map((c) => c.toLowerCase()));
    expect(uniqueColors.size).toBe(24);
  });

  it('contains valid 6-character hex color codes', () => {
    for (const color of DEEPER_24) {
      expect(isValidHexColor(color)).toBe(true);
    }
  });

  it('maps essential semantic roles to valid DEEPER-24 indices', () => {
    expect(DEEPER_24).toContain(PALETTE.background);
    expect(DEEPER_24).toContain(PALETTE.goldAccent);
    expect(DEEPER_24).toContain(PALETTE.danger);
    expect(DEEPER_24).toContain(PALETTE.text);
    expect(DEEPER_24).toContain(PALETTE.panel);
  });
});

