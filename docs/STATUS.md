# DEEPER — Status
Last updated: 2026-11-05 · Current milestone: M10

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
| M10 | review | milestone/M10 | Social corpse system, daily seeds, survivor leaderboard, ethics & privacy |
| M11 | todo | milestone/M11 | QA, release packaging, final audit |

## Known issues
None at present.

## Open questions for the owner (max 5)
None at present.

## Handoff notes for the next conversation
Milestone M10 completed & verified:
- **Social Corpse Retrieval System**: Death locations recorded as `PlayerCorpse`. Procedural sprite `tile_corpse` rendered in `DungeonRenderer`. Stepping onto fallen corpse recovers 50% lost gold (`recoverableGold = Math.round(lostGold * 0.5)`), plays chime/particles, and marks corpse as looted without duplication. Verified by unit tests.
- **UTC Daily Seed Generator**: Deterministic 32-bit positive integer seed derived from UTC date `YYYY-MM-DD` via FNV-1a. Accessible via `MenuScene` button `[D] DAILY DELVE` or shortcut `D`. Zero streak penalties, zero guilt notifications (§4.11 Rule 3).
- **Survivor Hall of Fame Leaderboard**: Ranked strictly by depth reached and runs survived — **never ranked by gold greed** (§4.10). Decoupled `RemoteStore` interface with default offline `LocalRemoteStore` and optional REST `SupabaseRemoteStore` with automatic silent offline fallback. Accessible via `LeaderboardScene` (`[L]`).
- **45-Minute Break Reminder**: Tracks continuous exploration session time. Displays gentle, dismissible reminder modal after ~45 minutes of continuous play (max once per hour), gated by `settings.breakReminder` (§4.11 Rule 6).
- **Data Privacy & Ethical Consent**: Opt-in anonymous telemetry toggle (`settings.telemetryConsent`), zero PII gathered, ephemeral anonymous UUID v4, explicit "Wipe All Data" button with confirmation modal in `SettingsScene`, and full privacy schema documented in `docs/TELEMETRY_SCHEMA.md` (§4.11 Rule 7).
- **Verification Gates**:
  - `npm run check` 100% green (typecheck, eslint, 28/28 vitest suites, 154/154 tests passing, production build successful).
  - Mechanical review passed with 0 errors (`core-clock`, `core-math-random`, `core-imports-phaser`).
  - Browser smoke test verified in headless Chrome via CDP generating `smoke-m10.png`.
