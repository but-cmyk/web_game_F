# Structured Review Checklist (7 Passes)

Read this resource during Phase 3 verification or while performing code reviews.

## Pass 1: Spec Conformance
- [ ] Does every implemented feature match the acceptance criteria in `docs/IMPLEMENTATION_PLAN.md` §5?
- [ ] Are all numeric parameters pulled from `src/data/*.json` rather than hardcoded?
- [ ] Has any `[LOCKED]` specification been modified without recorded owner consent?

## Pass 2: Correctness & Boundaries
- [ ] Are grid coordinates bounded (`0 <= x < width && 0 <= y < height`)?
- [ ] Are integer math formulas rounded using the exact rounding mode specified?
- [ ] Are all division operations guarded against zero denominators?
- [ ] Are state transitions exhaustive with compile-time checks?

## Pass 3: Determinism & Architecture Isolation
- [ ] Is `src/core/` 100% free of Phaser imports?
- [ ] Is all gameplay randomness seeded via `Rng` forks?
- [ ] Are wall clocks (`Date.now()`, `performance.now()`) absent from core logic?
- [ ] Does identical seed + action input yield identical output events?

## Pass 4: Ethics & Accessibility (Plan §4.11)
- [ ] Point 1: Zero real-money or loot-box mechanics?
- [ ] Point 2: Are all probabilities explicit and verifiable in the Codex?
- [ ] Point 3: Absence of deceptive near-miss animations, forced timers, or guilt notifications?
- [ ] Point 4: Flashing <= 3/sec and camera shake fully disabled when toggled off?
- [ ] Point 5: Does every audio cue have a corresponding visual twin?
- [ ] Point 6: Is the 45-minute break reminder hook in place?
- [ ] Point 7: Is telemetry opt-in, anonymous, and purgeable?

## Pass 5: Test Quality
- [ ] Does every formula have boundary tests (0, max, negative)?
- [ ] Are there zero skipped (`it.skip`) or focused (`it.only`) tests?
- [ ] Would mutating a formula constant by +1 cause at least one test to fail?
- [ ] Are expected values derived from spec examples rather than copied from test outputs?

## Pass 6: Performance & Memory
- [ ] Are heavy object allocations avoided inside per-frame `update()` methods?
- [ ] Are scene listeners, timers, and tweens destroyed on shutdown?
- [ ] Are particle effects clamped to prevent mobile frame drops?

## Pass 7: Maintainability & Localization
- [ ] Are all user-facing strings referenced via `i18n` keys?
- [ ] Do `vi.json` and `en.json` maintain 1:1 key parity?
- [ ] Are TypeScript files kept under 300 lines?

