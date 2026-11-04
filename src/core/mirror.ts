/**
 * The Mirror Core Telemetry & Metrics for DEEPER.
 * Calculates fear/greed metrics, personal rolling baseline, archetype mapping,
 * and neutral non-judgmental observation copy.
 * Pure TypeScript, zero Phaser imports, zero Math.random.
 */

export interface RawDecisionCounts {
  bypassedExit: number;
  cursedAccepted: number;
  bargainsAccepted: number;
  pushedOnHighDread: number;
  earlyExit: number;
  bargainsDeclined: number;
  chestsSkipped: number;
  sneakSteps: number;
  totalSteps: number;
}

export interface DecisionMetricsResult {
  readonly greedRaw: number;
  readonly fearRaw: number;
  readonly sneakRatio: number;
}

export interface RunMirrorMetric {
  readonly greedRaw: number;
  readonly fearRaw: number;
  readonly depth: number;
  readonly gold: number;
  readonly outcome: 'extracted' | 'died';
  readonly timestamp?: number;
}

export interface RollingBaseline {
  readonly status: 'forming' | 'ready';
  readonly runCount: number;
  readonly meanGreedRaw: number;
  readonly meanFearRaw: number;
  readonly meanDepth: number;
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

/**
 * Calculates raw greed and fear scores according to §4.9:
 * greedRaw = 3*bypassedExit + 2*cursedAccepted + 1*bargainsAccepted + 2*pushedOnHighDread
 * fearRaw  = 3*earlyExit + 1*bargainsDeclined + 1*chestsSkipped + round(10*sneakRatio)
 */
export function calculateGreedFearMetrics(counts: RawDecisionCounts): DecisionMetricsResult {
  const sneakRatio = counts.totalSteps > 0 ? counts.sneakSteps / counts.totalSteps : 0;

  const greedRaw =
    3 * counts.bypassedExit +
    2 * counts.cursedAccepted +
    1 * counts.bargainsAccepted +
    2 * counts.pushedOnHighDread;

  const fearRaw =
    3 * counts.earlyExit +
    1 * counts.bargainsDeclined +
    1 * counts.chestsSkipped +
    Math.round(10 * sneakRatio);

  return {
    greedRaw,
    fearRaw,
    sneakRatio,
  };
}

/**
 * Normalizes raw metric points to a 0 - 100 percentage scale for UI display and archetype mapping.
 */
export function normalizeMetricScore(raw: number, maxReference = 15): number {
  if (maxReference <= 0) return 0;
  const ratio = Math.max(0, raw / maxReference);
  return Math.min(100, Math.round(ratio * 100));
}

/**
 * Computes rolling baseline over player's last 10 completed runs.
 * First 3 runs return 'forming' state.
 */
export function calculateRollingBaseline(history: readonly RunMirrorMetric[]): RollingBaseline {
  if (!history || history.length < 3) {
    return {
      status: 'forming',
      runCount: history ? history.length : 0,
      meanGreedRaw: 0,
      meanFearRaw: 0,
      meanDepth: 0,
    };
  }

  const window = history.slice(-10);
  const count = window.length;

  const totalGreed = window.reduce((sum, r) => sum + r.greedRaw, 0);
  const totalFear = window.reduce((sum, r) => sum + r.fearRaw, 0);
  const totalDepth = window.reduce((sum, r) => sum + r.depth, 0);

  return {
    status: 'ready',
    runCount: count,
    meanGreedRaw: totalGreed / count,
    meanFearRaw: totalFear / count,
    meanDepth: totalDepth / count,
  };
}

/**
 * Matches player's normalized (0-100) scores against archetypes in mirror.json.
 */
export function determineArchetype(
  greedScore: number,
  fearScore: number,
  archetypes: readonly ArchetypeDefinition[]
): ArchetypeDefinition {
  for (const def of archetypes) {
    const greedPass =
      (def.greed_min === undefined || greedScore >= def.greed_min) &&
      (def.greed_max === undefined || greedScore <= def.greed_max);

    const fearPass =
      (def.fear_min === undefined || fearScore >= def.fear_min) &&
      (def.fear_max === undefined || fearScore <= def.fear_max);

    if (greedPass && fearPass) {
      return def;
    }
  }

  // Fallback: pick archetype with minimum Euclidean distance in (greed, fear) space
  let closest = archetypes[0];
  let minDistance = Number.POSITIVE_INFINITY;

  for (const def of archetypes) {
    const targetG =
      def.greed_min !== undefined && def.greed_max !== undefined
        ? (def.greed_min + def.greed_max) / 2
        : def.greed_min ?? def.greed_max ?? 50;

    const targetF =
      def.fear_min !== undefined && def.fear_max !== undefined
        ? (def.fear_min + def.fear_max) / 2
        : def.fear_min ?? def.fear_max ?? 50;

    const dist = Math.hypot(greedScore - targetG, fearScore - targetF);
    if (dist < minDistance) {
      minDistance = dist;
      closest = def;
    }
  }

  return closest;
}

/**
 * Generates neutral, behavioral observation statement comparing current run to baseline.
 * Strictly adheres to §4.9: describes the action, never labels the player.
 */
export function generateObservationCopy(
  current: RunMirrorMetric,
  baseline: RollingBaseline,
  lang: 'vi' | 'en'
): string {
  if (baseline.status === 'forming') {
    return lang === 'vi'
      ? 'Đang hình thành đường cơ sở qua những chuyến thám hiểm đầu tiên.'
      : 'Baseline forming across your initial expeditions.';
  }

  const depthDiff = current.depth - baseline.meanDepth;
  const roundedDiff = Math.abs(Math.round(depthDiff));

  if (roundedDiff >= 1) {
    if (depthDiff > 0) {
      return lang === 'vi'
        ? `Lần này bạn xuống sâu hơn ${roundedDiff} tầng so với mức trung bình của bạn.`
        : `This run you ventured ${roundedDiff} floors deeper than your personal baseline.`;
    } else {
      return lang === 'vi'
        ? `Lần này bạn dừng sớm hơn ${roundedDiff} tầng so với mức trung bình của bạn.`
        : `This run you exited ${roundedDiff} floors earlier than your personal baseline.`;
    }
  }

  // If depth is similar, compare greed/risk
  const greedDiff = current.greedRaw - baseline.meanGreedRaw;
  if (greedDiff > 2) {
    return lang === 'vi'
      ? 'Lần này bạn chấp nhận nhiều rủi ro hơn để tìm kiếm tài nguyên.'
      : 'This run you took more risks pursuing resources than usual.';
  }

  const fearDiff = current.fearRaw - baseline.meanFearRaw;
  if (fearDiff > 2) {
    return lang === 'vi'
      ? 'Lần này bạn thận trọng hơn trước bóng tối và tiếng ồn.'
      : 'This run you prioritized caution against darkness and noise.';
  }

  return lang === 'vi'
    ? 'Lần này bạn duy trì nhịp độ quen thuộc tương đương mức trung bình.'
    : 'This run you maintained a steady pace consistent with your average.';
}
