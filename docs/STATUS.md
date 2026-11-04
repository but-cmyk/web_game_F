# DEEPER — Status
Last updated: 2026-11-04 · Current milestone: M5

| Milestone | State (todo/doing/review/done) | Branch | Notes |
|---|---|---|---|
| M0 | done | milestone/M0 | Bootstrap complete, canvas 320x180, palette DEEPER-24 |
| M1 | done | milestone/M1 | Engine foundations, Rng, Grid, SaveStore, Data loaders |
| M2 | done | milestone/M2 | Procedural BSP dungeon, turn resolution, FOV, Fog of War, RunScene |
| M3 | done | milestone/M3 | Single run loop, gold collection, extraction, banking, Menu/Summary scenes |
| M4 | done | milestone/M4 | Fear I: Oil, Dread, AudioDirector, PostFX, noise rings |
| M5 | done | milestone/M5 | Fear II: Monsters FSM & Hallucinations |
| M6 | todo | milestone/M6 | Greed I: Loot curves, Curses, Bargains, Codex |
| M7 | todo | milestone/M7 | Greed II: Shop, Meta upgrades, Balance sim |
| M8 | todo | milestone/M8 | Mirror screen & Tutorial |
| M9 | todo | milestone/M9 | Biomes, polish, touch controls, settings |
| M10 | todo | milestone/M10 | Social corpse system, data consent |
| M11 | todo | milestone/M11 | QA, release packaging, final audit |

## Known issues
None at present.

## Open questions for the owner (max 5)
None at present.

## Handoff notes for the next conversation
Milestone M5 implemented and verified on branch `milestone/M5`. All 100 unit/integration tests green, mechanical review 0 errors, browser smoke test verified monster FSMs (Crawler, Listener, Stalker), combat collisions, stun/invulnerability, and hallucinations. Ready for merge to `master` and transition to M6 (Greed I: Loot curves, Curses, Bargains, Codex).

