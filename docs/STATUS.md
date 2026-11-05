# DEEPER — Status
Last updated: 2026-11-05 · Current milestone: M9

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
| M9 | review | milestone/M9 | Biomes, polish, touch controls, settings |
| M10 | todo | milestone/M10 | Social corpse system, data consent |
| M11 | todo | milestone/M11 | QA, release packaging, final audit |

## Known issues
None at present.

## Open questions for the owner (max 5)
None at present.

## Handoff notes for the next conversation
Milestone M9 completed & verified:
- Core biome resolution and palette swaps for 3 depth-scaled biomes (Stone Dungeon, Fungal Cavern, Abyssal Trench).
- Expanded side events system with 10 random events and Exploration trigger.
- Juice & polish: Hitstop micro-pause (60ms), bounded gold particle burst (capped to 8), and screen shake/flash gated strictly behind Settings.
- Virtual TouchControls (D-pad + mode buttons) responsive on mobile viewports (360x640).
- SettingsScene with volume controls, accessibility toggles (reduceFlash, reduceShake, highContrast), live language toggle (vi/en), and SaveStore persistence.
- Full verification: `npm run check` green, 25/25 test suites passing (145 tests), mechanical review 0 errors, browser smoke test verified with `smoke-m9.png`. Ready for review to close M9 and move to M10.
