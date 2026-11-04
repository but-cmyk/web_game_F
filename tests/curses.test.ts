import { describe, it, expect } from 'vitest';
import {
  rollCursedChestCurse,
  applyCurseLightModifier,
  applyCurseNoiseModifier,
  applyFloorTransitionCurses,
  Curse,
} from '../src/core/curses';
import { Rng } from '../src/core/rng';
import { EventBus } from '../src/core/events';

describe('Cursed Chests & Curses System (§4.6)', () => {
  it('rolls 1 of 4 curses with equal 25% distribution across 1000 trials', () => {
    const counts: Record<string, number> = {
      stalker_haunt: 0,
      blindness: 0,
      heavy_footsteps: 0,
      darkness_tax: 0,
    };

    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      const rng = new Rng(i * 17 + 1);
      const curse = rollCursedChestCurse(rng);
      counts[curse.id] = (counts[curse.id] || 0) + 1;
    }

    for (const key of Object.keys(counts)) {
      const ratio = counts[key] / trials;
      expect(ratio).toBeGreaterThan(0.20);
      expect(ratio).toBeLessThan(0.30);
    }
  });

  describe('Curse Runtime Modifiers', () => {
    it('blindness curse reduces light radius by 1 (minimum 1)', () => {
      const activeCurses: Curse[] = [{ id: 'blindness', effect: 'reduce_light_radius', radiusDelta: -1 }];

      expect(applyCurseLightModifier(6, activeCurses)).toBe(5);
      expect(applyCurseLightModifier(2, activeCurses)).toBe(1);
      expect(applyCurseLightModifier(1, activeCurses)).toBe(1); // Min 1
    });

    it('heavy_footsteps curse increases noise radius by +50%', () => {
      const activeCurses: Curse[] = [{ id: 'heavy_footsteps', effect: 'increase_noise', noiseMultiplier: 1.5 }];

      // Sneak: 2 -> round(2 * 1.5) = 3
      expect(applyCurseNoiseModifier(2, activeCurses)).toBe(3);
      // Walk: 4 -> round(4 * 1.5) = 6
      expect(applyCurseNoiseModifier(4, activeCurses)).toBe(6);
      // Run: 7 -> round(7 * 1.5) = 11 (or 10.5 rounded to 11)
      expect(applyCurseNoiseModifier(7, activeCurses)).toBe(11);
    });

    it('darkness_tax curse adds +20 Dread upon floor transition, clamped to 100', () => {
      const activeCurses: Curse[] = [{ id: 'darkness_tax', effect: 'floor_transition_dread', dreadAddition: 20 }];
      const eventBus = new EventBus();

      expect(applyFloorTransitionCurses(10, activeCurses, eventBus)).toBe(30);
      expect(applyFloorTransitionCurses(90, activeCurses, eventBus)).toBe(100);
    });
  });
});

