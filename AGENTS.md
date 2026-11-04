# DEEPER Project Guidelines

DEEPER is a 2D pixel-art roguelike web game (Phaser 3 + TypeScript + Vite) exploring the psychological tension between Fear and Greed through push-your-luck dungeon crawling. Reference `docs/IMPLEMENTATION_PLAN.md` for full specs, `docs/STATUS.md` for live milestone progress, `docs/DECISIONS.md` for architecture records, and `docs/BALANCE_LOG.md` for economy tuning logs.

## Commands (Available from M0 onwards)
`npm run dev` (start dev server) | `build` (bundle app) | `typecheck` (check types) | `lint` (ESLint) | `test` (Vitest) | `check` (typecheck + lint + test + build)

## Repository Structure
```
.agents/       rules and skills kit
docs/          IMPLEMENTATION_PLAN, STATUS, DECISIONS, BALANCE_LOG, SKILLS_AUDIT
scripts/       validation, balance simulation, and packaging scripts
src/core/      pure TypeScript logic (Rng, grid, mapgen, turn, monsters, loot, mirror)
src/scenes/    Phaser scenes (Boot, Menu, Run, Extract, Mirror, Codex, Meta)
src/views/     presentation layer (lighting, post-FX, HUD, touch controls)
src/data/      gameplay numbers, loot tables, and balance schemas (JSON)
src/audio/     AudioDirector and WebAudio synthesized SFX
tests/         deterministic unit and integration tests
```

## Golden Rules
1. **One Milestone Per Session**: Never start or anticipate the next milestone.
2. **Plan First**: Output a milestone plan artifact, stop, and wait for exact word `APPROVED`.
3. **Scope Fence**: Edit only files declared in the approved plan; log extra ideas in `docs/STATUS.md`.
4. **Core Isolation**: `src/core` is pure TypeScript (zero Phaser imports, zero `Math.random`, all RNG via `Rng`).
5. **Data Driven**: Gameplay numbers live in `src/data/*.json`; tune balance in JSON, not in code.
6. **Test First**: Write failing unit tests before implementing any formula or random table.
7. **No Hallucinated APIs**: Verify Phaser methods in `node_modules/phaser/types/phaser.d.ts`; never guess.
8. **Justify Dependencies**: Every new dependency requires a one-line justification in the plan artifact.
9. **Lock Discipline**: Changing anything `[LOCKED]` requires owner consent and a `docs/DECISIONS.md` entry.
10. **Ethical Contract**: Strictly obey `.agents/rules/ethics-guardrails.md` at all times.
11. **Language Protocol**: Converse with owner in Vietnamese; write code, comments, commits, and docs in English.
12. **Definition of Done**: `npm run check` green + browser smoke test + screenshot + STATUS updated.

## Skills Directory
| Skill | When to Use |
|---|---|
| `deeper-orchestrator` | Milestone lifecycle, planning, verification, and session handoffs |
| `deeper-core-engine` | Engine architecture, canvas setup, seeded RNG, grid, BSP mapgen, turn pipeline |
| `deeper-fear-systems` | Oil lamp, Dread meter, noise BFS propagation, monster FSM, audio director |
| `deeper-greed-systems` | Loot scaling, cursed chests, bargains, shop upgrades, Codex synchronization |
| `deeper-mirror-telemetry` | Mirror screen, greed/fear metrics, archetype cards, neutral copy, privacy |
| `deeper-pixel-audio-pipeline` | DEEPER-24 palette, procedural visual placeholders, WebAudio SFX synthesis |
| `deeper-qa-balance-release` | Vitest testing, balance simulation, performance profiling, packaging |
