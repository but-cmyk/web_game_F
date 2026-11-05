# DEEPER — Status
Last updated: 2026-11-05 · Current milestone: M11

| Milestone | State (todo/doing/review/done) | Branch | Notes |
|---|---|---|---|
| M0 | done | milestone/M0 | Bootstrap complete, canvas 320x180, palette DEEPER-24 |
| M1 | done | milestone/M1 | Engine foundations, Rng, Grid, SaveStore, Data loaders |
| M2 | done | milestone/M2 | Procedural BSP dungeon, turn resolution, FOV, Fog of War, RunScene |
| M3 | done | milestone/M3 | Single run loop, gold collection, extraction, banking, Menu/Summary scenes |
| M4 | done | milestone/M4 | Fear I: Oil, Dread, AudioDirector, PostFX, noise rings |
| M5 | done | milestone/M5 | Fear II: Monsters FSM & Hallucinations |
| M6 | done | milestone/M6 | Greed I: Loot curves, Curses, Bargains, Codex |
| M7 | done | milestone/M7 | Greed II: Shop, Meta upgrades, Balance sim verified |
| M8 | done | milestone/M8 | Mirror screen & Tutorial |
| M9 | done | milestone/M9 | Biomes, polish, touch controls, settings |
| M10 | done | milestone/M10 | Social corpse system, daily seeds, survivor leaderboard, ethics & privacy |
| M11 | review | milestone/M11 | QA, release packaging, final audit |

## Known issues
None at present.

## Open questions for the owner (max 5)
None at present.

## Handoff notes for the next conversation
Milestone M11 completed & verified:
- **Final Monte Carlo Balance Simulation (1,000 runs)**: Calibrated risk-reward across all policies (`cautious`, `greedy`, `mixed`). Validated that Mixed death rate is 60.6% (target 55-65%), Greedy death rate is 99.7% (target >= 80%), and Non-Dominance Invariant holds at 0.86x (<= 1.5x of mixed yield). Logged in `docs/BALANCE_LOG.md`.
- **Standalone Release Packager (`npm run package`)**: Zero-dependency Node.js script `scripts/package-release.mjs` generates `release/deeper-v0.1.0-itch.zip` directly from `dist/`. Packaged zip size is **369.4 KB** (strictly conforming to the <= 5 MB budget limit; < 8% of budget).
- **Release Documentation & Legal Attributions**:
  - `README.md`: Bilingual (vi/en) comprehensive game overview, mechanics, controls, architecture, and dev commands.
  - `CREDITS.md`: Full attributions for Phaser 3, DEEPER-24 palette, WebAudio sound director, and open-source licenses.
  - `LICENSE`: Standard MIT license.
  - `docs/RELEASE_CHECKLIST.md`: Formal verification checklist certifying all §7 release gates.
- **Automated Performance & Accessibility Smoke Test (`scripts/smoke-test-m11.mjs`)**: Verified cold start on simulated 4G (< 3.0s), steady 60 FPS under 4x CPU throttle, virtual touch controls on 360x640 mobile portrait viewport, and 100% offline execution. Generated `smoke-m11.png`.
- **Quality Gates**:
  - `npm run check` green: 0 type errors, 0 lint warnings, 29/29 vitest suites passing (159/159 tests), production build verified.
  - Mechanical review passed with 0 errors.
