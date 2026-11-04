import { describe, it, expect } from 'vitest';
import {
  calculateGreedFearMetrics,
  calculateRollingBaseline,
  determineArchetype,
  generateObservationCopy,
  normalizeMetricScore,
  RunMirrorMetric,
  RawDecisionCounts,
} from '../src/core/mirror';
import mirrorJson from '../src/data/mirror.json';
import bannedWordsJson from '../src/data/banned-mirror-words.json';

describe('The Mirror Core Metrics & Formulas (§4.9)', () => {
  describe('calculateGreedFearMetrics formula', () => {
    it('calculates greedRaw and fearRaw strictly per §4.9 specification', () => {
      const counts: RawDecisionCounts = {
        bypassedExit: 2, // 3 * 2 = 6
        cursedAccepted: 1, // 2 * 1 = 2
        bargainsAccepted: 3, // 1 * 3 = 3
        pushedOnHighDread: 1, // 2 * 1 = 2
        earlyExit: 1, // 3 * 1 = 3
        bargainsDeclined: 2, // 1 * 2 = 2
        chestsSkipped: 1, // 1 * 1 = 1
        sneakSteps: 40,
        totalSteps: 100, // sneakRatio = 0.4 -> round(10 * 0.4) = 4
      };

      const result = calculateGreedFearMetrics(counts);

      // greedRaw = 3*2 + 2*1 + 1*3 + 2*1 = 6 + 2 + 3 + 2 = 13
      expect(result.greedRaw).toBe(13);

      // fearRaw = 3*1 + 1*2 + 1*1 + round(10*0.4) = 3 + 2 + 1 + 4 = 10
      expect(result.fearRaw).toBe(10);
    });

    it('handles zero events cleanly without NaN', () => {
      const counts: RawDecisionCounts = {
        bypassedExit: 0,
        cursedAccepted: 0,
        bargainsAccepted: 0,
        pushedOnHighDread: 0,
        earlyExit: 0,
        bargainsDeclined: 0,
        chestsSkipped: 0,
        sneakSteps: 0,
        totalSteps: 0,
      };

      const result = calculateGreedFearMetrics(counts);
      expect(result.greedRaw).toBe(0);
      expect(result.fearRaw).toBe(0);
      expect(result.sneakRatio).toBe(0);
    });
  });

  describe('normalizeMetricScore (0 - 100 scale)', () => {
    it('normalizes raw points to 0-100 range clamped', () => {
      expect(normalizeMetricScore(0)).toBe(0);
      expect(normalizeMetricScore(9, 15)).toBe(60);
      expect(normalizeMetricScore(15, 15)).toBe(100);
      expect(normalizeMetricScore(25, 15)).toBe(100); // Clamped at 100
    });
  });

  describe('calculateRollingBaseline', () => {
    it('returns "forming" baseline state during first 3 runs', () => {
      const history1: RunMirrorMetric[] = [];
      expect(calculateRollingBaseline(history1).status).toBe('forming');

      const history2: RunMirrorMetric[] = [
        { greedRaw: 5, fearRaw: 5, depth: 2, gold: 30, outcome: 'extracted' },
        { greedRaw: 8, fearRaw: 4, depth: 3, gold: 50, outcome: 'extracted' },
      ];
      expect(calculateRollingBaseline(history2).status).toBe('forming');
    });

    it('calculates accurate rolling mean for last 10 runs when history >= 3', () => {
      const history: RunMirrorMetric[] = [
        { greedRaw: 2, fearRaw: 8, depth: 2, gold: 20, outcome: 'extracted' },
        { greedRaw: 4, fearRaw: 6, depth: 2, gold: 25, outcome: 'extracted' },
        { greedRaw: 6, fearRaw: 4, depth: 3, gold: 40, outcome: 'extracted' },
        { greedRaw: 8, fearRaw: 2, depth: 4, gold: 60, outcome: 'extracted' },
      ];

      const baseline = calculateRollingBaseline(history);
      expect(baseline.status).toBe('ready');
      expect(baseline.runCount).toBe(4);
      // (2 + 4 + 6 + 8) / 4 = 5.0
      expect(baseline.meanGreedRaw).toBe(5);
      // (8 + 6 + 4 + 2) / 4 = 5.0
      expect(baseline.meanFearRaw).toBe(5);
      // (2 + 2 + 3 + 4) / 4 = 2.75
      expect(baseline.meanDepth).toBe(2.75);
    });

    it('limits rolling window to most recent 10 runs', () => {
      const history: RunMirrorMetric[] = [];
      for (let i = 1; i <= 15; i++) {
        history.push({
          greedRaw: i,
          fearRaw: 10,
          depth: 2,
          gold: 20,
          outcome: 'extracted',
        });
      }

      const baseline = calculateRollingBaseline(history);
      expect(baseline.status).toBe('ready');
      expect(baseline.runCount).toBe(10);
      // Last 10 runs are 6 to 15: sum = 105 / 10 = 10.5
      expect(baseline.meanGreedRaw).toBe(10.5);
    });
  });

  describe('determineArchetype (§4.9 & mirror.json)', () => {
    it('classifies Gold Digger (High Greed, Low Fear)', () => {
      const archetype = determineArchetype(75, 25, mirrorJson.archetypes);
      expect(archetype.id).toBe('gold_digger');
    });

    it('classifies Flamekeeper (Low Greed, High Fear)', () => {
      const archetype = determineArchetype(20, 70, mirrorJson.archetypes);
      expect(archetype.id).toBe('flamekeeper');
    });

    it('classifies Trembling Walker (High Greed, High Fear)', () => {
      const archetype = determineArchetype(80, 80, mirrorJson.archetypes);
      expect(archetype.id).toBe('trembling_walker');
    });

    it('classifies Calculator (Balanced / Moderate Greed & Fear)', () => {
      const archetype = determineArchetype(30, 30, mirrorJson.archetypes);
      expect(archetype.id).toBe('calculator');
    });
  });

  describe('Neutral Copy & Banned Words Enforcement (§4.9, §4.11)', () => {
    it('never contains any clinical, judgmental, or banned words in observation copy', () => {
      const banned = bannedWordsJson.banned_words.map((w) => w.toLowerCase());

      const sampleScenarios = [
        { currentDepth: 5, meanDepth: 2, currentGreed: 12, meanGreed: 4, currentFear: 2, meanFear: 8 },
        { currentDepth: 1, meanDepth: 4, currentGreed: 2, meanGreed: 10, currentFear: 10, meanFear: 3 },
        { currentDepth: 3, meanDepth: 3, currentGreed: 5, meanGreed: 5, currentFear: 5, meanFear: 5 },
      ];

      for (const scenario of sampleScenarios) {
        for (const lang of ['en', 'vi'] as const) {
          const text = generateObservationCopy(
            {
              greedRaw: scenario.currentGreed,
              fearRaw: scenario.currentFear,
              depth: scenario.currentDepth,
              gold: 50,
              outcome: 'extracted',
            },
            {
              status: 'ready',
              runCount: 5,
              meanGreedRaw: scenario.meanGreed,
              meanFearRaw: scenario.meanFear,
              meanDepth: scenario.meanDepth,
            },
            lang
          ).toLowerCase();

          for (const word of banned) {
            expect(text.includes(word)).toBe(false);
          }
        }
      }
    });

    it('displays neutral baseline forming message when history < 3', () => {
      const viText = generateObservationCopy(
        { greedRaw: 5, fearRaw: 5, depth: 2, gold: 30, outcome: 'extracted' },
        { status: 'forming', runCount: 1, meanGreedRaw: 0, meanFearRaw: 0, meanDepth: 0 },
        'vi'
      );
      expect(viText).toContain('đường cơ sở');

      const enText = generateObservationCopy(
        { greedRaw: 5, fearRaw: 5, depth: 2, gold: 30, outcome: 'extracted' },
        { status: 'forming', runCount: 1, meanGreedRaw: 0, meanFearRaw: 0, meanDepth: 0 },
        'en'
      );
      expect(enText.toLowerCase()).toContain('baseline');
    });
  });
});
