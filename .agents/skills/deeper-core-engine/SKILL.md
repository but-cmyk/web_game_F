---
name: deeper-core-engine
description: "Implementation rules for DEEPER's engine layer: Phaser 3 + TypeScript scene setup, the 320x180 pixel-perfect canvas, seeded RNG, grid utilities, BSP dungeon generation, the turn pipeline, circular light and fog of war, save store and data loaders. Use whenever editing src/core, src/scenes, src/views, src/utils, src/services, map generation, movement, camera, rendering, save/load or seed logic."
---
# Deeper Core Engine

Read first: docs/IMPLEMENTATION_PLAN.md sections 2, 3, 4.1, 5 (M0-M3).

## 1. Logic and Render Separation
Keep all core logic under `src/core/` pure TypeScript:
- **No Phaser Imports**: Never import Phaser inside `src/core/`. Enforced via architecture checks.
- **Event-Driven Presentation**: Core routines return pure event sequences (`StepTaken`, `NoiseEmitted`, `DreadChanged`, `GoldPicked`, etc.). Scenes in `src/scenes/` and `src/views/` only replay and visualize these events.

## 2. Seeded Randomness & Determinism
- **Centralized RNG**: All procedural decisions must use the `Rng` wrapper (`src/core/rng.ts`).
- **Hierarchical Streams**: Fork seeds deterministically: `rng.fork('floor:N')`, `fork('loot')`, `fork('ai')`, `fork('event')`. Daily seed is hashed from `YYYY-MM-DD` (UTC).
- **Determinism Contract**: A given seed and action sequence must produce identical map layouts and identical event logs across all environments.

## 3. The Turn Pipeline
All gameplay progression executes via `TurnResolver.step(action)` in this strict order:
1. Player movement / action execution
2. Oil consumption deduction
3. Noise emission and BFS propagation
4. Dread accumulation and threshold check
5. Monster AI turns (state updates, movement, attacks)
6. Loot pickup and environmental interactions
7. Defeat / extraction evaluation

## 4. Canvas & Pixel-Art Rendering
Refer to [phaser-pixel-config.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-core-engine/resources/phaser-pixel-config.md) when setting up the Phaser game configuration:
- Logical resolution: 320x180 pixels.
- Tile size: 16x16 pixels.
- Flags: `pixelArt: true`, `roundPixels: true`.
- Scaling: Integer scale modes, centered within viewport.

## 5. BSP Dungeon Generation & Stairs Placement
Refer to [mapgen-notes.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-core-engine/resources/mapgen-notes.md) when implementing or tuning dungeon layout:
- Floor dimensions: 40x30 tiles.
- Partitioning: Binary Space Partitioning (BSP) into rooms and connecting corridors.
- Stairs Rule: Exit stairs must be placed at a BFS path distance >= 60% of map diameter from entry.
- Connectivity Validation: Automated unit tests must verify 100 consecutive random seeds without isolated chambers.

## 6. Circular Lighting & Fog of War
- Render line-of-sight and illumination using circular geometry masks centered on player.
- Track tile visibility states: Hidden (unseen), Visible (currently lit), and Explored (fog-of-war memory).

## 7. Storage & Data Loaders
- `SaveStore` interface: Implemented via `localStorage` with versioned schema and migration callbacks, falling back gracefully to in-memory store.
- Schema Validation: Parse all `src/data/*.json` through strict typed loaders, validating IDs, positive weights, and required keys.

## 8. Phaser API Caution
- When interacting with Phaser APIs, inspect `node_modules/phaser/types/phaser.d.ts`.
- Never guess method signatures or properties; use documented Phaser 3 patterns.
- Map touch/swipe gestures directly to grid direction events.

