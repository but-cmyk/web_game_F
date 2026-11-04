# Skills Audit — Trigger Evaluation & Verification

This document audits the triggering precision of each skill in the DEEPER agent kit, testing against realistic developer and owner prompts.

---

## 1. deeper-orchestrator
- **Description**: `"Operating protocol for building the DEEPER pixel web game milestone by milestone (M0-M11). Use at the start of ANY work session in this repository, whenever the user mentions a milestone, \"continue the plan\", \"next step\", status, planning, review or handoff, and before starting, verifying or closing any milestone, even if the user does not name this skill."`
- **Should Activate**:
  1. "Start working on milestone M2"
  2. "What is our current status and what's next?"
  3. "Let's plan the work for this session and close M1"
- **Should NOT Activate**:
  1. "Why is this Vitest unit test failing on line 42?" (Route to debug / core engine)
  2. "Adjust the monster scream volume" (Route to pixel audio / fear systems)
- **Self-Check**: Description clearly targets session starts, milestone tracking, planning, and handoff phrases.

---

## 2. deeper-core-engine
- **Description**: `"Implementation rules for DEEPER's engine layer: Phaser 3 + TypeScript scene setup, the 320x180 pixel-perfect canvas, seeded RNG, grid utilities, BSP dungeon generation, the turn pipeline, circular light and fog of war, save store and data loaders. Use whenever editing src/core, src/scenes, src/views, src/utils, src/services, map generation, movement, camera, rendering, save/load or seed logic."`
- **Should Activate**:
  1. "Implement the BSP dungeon carving algorithm in src/core/mapgen.ts"
  2. "Set up the TurnResolver to process player steps and oil deductions"
  3. "Configure the 320x180 integer-scaled camera viewport in Phaser"
- **Should NOT Activate**:
  1. "Add a new cursed chest option to the loot table" (Route to greed systems)
  2. "Tune the crawler monster chase speed" (Route to fear systems)
- **Self-Check**: Description explicitly lists engine systems, rendering setups, turn resolution, and grid mathematics.

---

## 3. deeper-fear-systems
- **Description**: `"Rules for DEEPER's fear mechanics: oil lamp, light radius, the Dread meter and its thresholds, movement modes and noise propagation, monster AI state machines (Crawler, Listener, Stalker), hallucinations, post-processing effects and the audio director. Use whenever working on tension, darkness, monsters, noise, vignette/shake effects, heartbeat or ambient audio, or reduce-motion accessibility."`
- **Should Activate**:
  1. "Add the Crawler patrol-to-chase finite state machine"
  2. "Implement the noise BFS propagation with wall blocking"
  3. "Increase the heartbeat rate when Dread exceeds 70"
- **Should NOT Activate**:
  1. "Change the gold drop curve on floor 8" (Route to greed systems)
  2. "Bundle the game for itch.io release" (Route to QA balance release)
- **Self-Check**: Keywords specifically cover monsters, noise, Dread, darkness, hallucinations, and audio tension.

---

## 4. deeper-greed-systems
- **Description**: `"Rules for DEEPER's greed mechanics: depth-scaled loot value, cursed chests, devil's bargains, extraction stations and rope, shop and meta upgrades, the odds Codex, and economy balancing. Use whenever touching gold, loot tables, events, upgrades, prices, extraction or death rules, or any probability shown to the player. Odds must always stay transparent."`
- **Should Activate**:
  1. "Implement the 8 Devil's Bargains with explicit cost-reward dialogs"
  2. "Update the extraction station logic on floors 3, 6, and 9"
  3. "Add the lantern capacity upgrade to the meta shop"
- **Should NOT Activate**:
  1. "Write the circular fog of war shader" (Route to core engine)
  2. "Calibrate the monster suspicion hearing radius" (Route to fear systems)
- **Self-Check**: Directly captures gold, chests, bargains, shop upgrades, extraction choices, and Codex odds.

---

## 5. deeper-mirror-telemetry
- **Description**: `"Rules for DEEPER's Mirror screen and decision telemetry: decision log schema, greed and fear metrics, personal-baseline comparison, archetype cards, neutral non-judgmental copy, local share-image export, consent and privacy. Use whenever writing the run summary, metrics, analytics events, share cards, or any text that describes the player's behavior."`
- **Should Activate**:
  1. "Implement the post-run Mirror screen with player archetype cards"
  2. "Calculate the Fear and Greed scores from the run action log"
  3. "Create the canvas-based local share card generator"
- **Should NOT Activate**:
  1. "Draw placeholder sprites for the crawler" (Route to pixel audio pipeline)
  2. "Implement the save game local storage adapter" (Route to core engine)
- **Self-Check**: Uniquely claims behavioral telemetry, decision scoring, archetype copy, and local card sharing.

---

## 6. deeper-pixel-audio-pipeline
- **Description**: `"How to produce and manage DEEPER's pixel art and sound without external tools: the DEEPER-24 palette, procedural placeholder tiles and sprites, asset manifest and naming, biome palette swaps, WebAudio-synthesized sound effects, and colorblind-safe and high-contrast variants. Use whenever adding or replacing sprites, tiles, UI art, palettes, fonts, sound effects or music."`
- **Should Activate**:
  1. "Generate 16x16 procedural placeholder tiles for the cavern biome"
  2. "Synthesize the 12 core sound effects using the WebAudio oscillator"
  3. "Set up the DEEPER-24 color palette definitions in palette.ts"
- **Should NOT Activate**:
  1. "Calculate loot drop chance based on depth" (Route to greed systems)
  2. "Run the Monte Carlo balance bot" (Route to QA balance release)
- **Self-Check**: Clear trigger boundary around visual assets, procedural graphics, audio synthesis, and color palettes.

---

## 7. deeper-qa-balance-release
- **Description**: `"QA, balance and release procedures for DEEPER: Vitest unit tests, the Monte Carlo balance simulator with bot policies, performance budgets, browser smoke tests, accessibility and i18n checks, build size limits, and itch.io/web packaging. Use whenever tuning numbers, writing tests, running checks, verifying a milestone, profiling, or preparing a release."`
- **Should Activate**:
  1. "Run the balance simulator script with 5,000 runs on mixed policy"
  2. "Verify that the build meets the 5 MB bundle size limit for itch.io"
  3. "Run browser smoke testing and check 60 FPS under CPU throttling"
- **Should NOT Activate**:
  1. "Draft the copy for the Gold Digger archetype" (Route to mirror telemetry)
  2. "Add a second sound effect when picking up gold" (Route to pixel audio pipeline)
- **Self-Check**: Comprehensive coverage of testing, balance simulation, performance profiling, and release packaging.

---

## Quality skills (prompt 02B)

### 8. deeper-ui-ux-design
- **Description**: `"UI/UX design rules for DEEPER's pixel interface, covering screen layout on the 320x180 canvas, HUD, menus, modal choices (bargains, chests), Codex, Mirror, Settings, tutorial, touch controls, readable pixel text including Vietnamese diacritics, risk and odds hierarchy, feedback and microcopy, accessibility, and visual review with browser screenshots at desktop size and 360x640. Use whenever creating or changing any screen, HUD element, button, dialog, label, icon, layout, font, UI animation or player-facing text, even for a small tweak. Palette and asset files belong to deeper-pixel-audio-pipeline, Mirror wording belongs to deeper-mirror-telemetry."`
- **Should Activate**:
  1. "Redesign the run HUD to fit oil, Dread, HP and gold on 320x180"
  2. "Create the cursed chest modal showing the four curse odds"
  3. "Check if the Vietnamese font clips stacked diacritics in the dialog"
- **Should NOT Activate**:
  1. "Pick 24 colors for the DEEPER palette" (Route to deeper-pixel-audio-pipeline)
  2. "The mirror copy sounds judgmental, make it neutral" (Route to deeper-mirror-telemetry)
- **Self-Check**: Covers all UI, HUD, screen layouts, fonts, touch targets, and visual reviews.

### 9. deeper-reliable-coding
- **Description**: `"Bug-prevention protocol for writing any DEEPER code. Covers the acceptance-first and test-first loop, smallest-diff edits, type-driven design with discriminated unions and exhaustive switches, no any, invariants and assertions, grid boundary and off-by-one checks, numeric clamping, determinism rules, Phaser lifecycle and cleanup, error handling, and a mandatory self-review before reporting done. Use BEFORE writing or editing any TypeScript, JSON data, config or test in this repository, including quick fixes, refactors and trivial changes, because most bugs come from skipping these steps. To diagnose an existing failure use deeper-debug, to review a finished diff use deeper-code-review."`
- **Should Activate**:
  1. "Implement the Rng class with seeded forks and tests"
  2. "Write the TurnResolver state step method"
  3. "Add type definitions and invariants for monster movement modes"
- **Should NOT Activate**:
  1. "Why is this unit test failing with a timeout?" (Route to deeper-debug)
  2. "Audit this pull request against the spec" (Route to deeper-code-review)
- **Self-Check**: Strongly triggers before writing or modifying any TypeScript code or data schemas.

### 10. deeper-debug
- **Description**: `"Systematic debugging procedure for DEEPER. Reproduce first, quote the exact error, replay deterministically from a seed plus an action log, list hypotheses, bisect with git, add minimal temporary instrumentation, fix the root cause with a regression test, and stop after 3 failed attempts. Includes Phaser and Vite pitfalls and symptom-to-cause playbooks such as blank canvas, blurry pixels, input not firing, silent audio, core and scene out of sync, flaky tests, FPS drops and save corruption. Use whenever something fails or looks wrong, such as a red npm run check, a failing test, a console error, a crash, a wrong number, a visual glitch, or a milestone check that stays red. Never guess a fix before reproducing."`
- **Should Activate**:
  1. "npm run check fails with a TypeScript error in TurnResolver"
  2. "The canvas is completely blank when opening the dev server"
  3. "Why does the crawler monster freeze after losing line of sight?"
- **Should NOT Activate**:
  1. "Review my code before I submit the milestone" (Route to deeper-code-review)
  2. "Write unit tests for the oil drain formula" (Route to deeper-reliable-coding)
- **Self-Check**: Directly targeted at investigating, reproducing, and fixing defects and red checks.

### 11. deeper-code-review
- **Description**: `"Structured code review for DEEPER in two modes, self-review of your own diff before handoff and a read-only audit of a branch or milestone. Checks spec conformance against docs/IMPLEMENTATION_PLAN.md, correctness, determinism, architecture rules (no Phaser in src/core, no Math.random in core, numbers in JSON), ethics and accessibility, test quality, performance and maintainability, using an automated mechanical scan plus a severity-ranked findings table with file and line evidence. Use before closing any milestone, after finishing a feature, when the user says review, audit, check my code or PR, and whenever you are about to write the final report. Never edit files while reviewing unless explicitly asked."`
- **Should Activate**:
  1. "Review my milestone branch before handoff"
  2. "Perform a read-only audit of milestone M2"
  3. "Run mechanical-review and audit spec conformance"
- **Should NOT Activate**:
  1. "Fix the TypeError on line 52" (Route to deeper-debug)
  2. "Build the modal confirmation dialogue" (Route to deeper-ui-ux-design)
- **Self-Check**: Specifically claims pre-handoff self-review, branch audits, and mechanical rule scans.

---

## Boundary Tests (11 Skills Routing)

| Ambiguous Prompt | Expected Skill(s) to Win | Rationale |
|---|---|---|
| "Make the bargain dialog show the numbers clearly" | `deeper-ui-ux-design` + `deeper-greed-systems` | UI design owns layout/clarity; greed systems owns exact data/costs |
| "The Mirror sentence sounds judgmental" | `deeper-mirror-telemetry` | Mirror tone, neutral copy, and banned words belong to mirror telemetry |
| "npm run check is red" | `deeper-debug` | Active check failure requires reproduction and root-cause debugging |
| "Write the Rng class" | `deeper-reliable-coding` + `deeper-core-engine` | Code authoring invokes reliable coding; engine owns math/seed specs |
| "Review my milestone branch" | `deeper-code-review` | Formal branch inspection invokes code-review audit mode |
| "Why is the monster stuck in SEARCH?" | `deeper-debug` + `deeper-fear-systems` | Bug investigation routes to debug with fear FSM domain context |
| "Generate placeholder tiles" | `deeper-pixel-audio-pipeline` | Procedural visual generation belongs to pixel audio pipeline |
| "Tune the greedy bot" | `deeper-qa-balance-release` | Bot policies and balance simulator belong to QA balance release |


