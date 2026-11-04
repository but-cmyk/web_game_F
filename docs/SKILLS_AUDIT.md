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

