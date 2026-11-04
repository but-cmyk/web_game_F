---
trigger: glob
globs: src/**/*.ts
---
# TypeScript Style Rules

Follow these standards across all TypeScript code in DEEPER:

1. **Strict Type Safety**: Use strict TypeScript without `any`. Use discriminated unions, precise interfaces, and exhaustive switch checks.
2. **Core Isolation**: Never import Phaser or view-layer code in `src/core/`. Keep core pure, deterministic, and driven solely by `TurnResolver.step`.
3. **No Dynamic / Hidden State**: All randomness must flow through `Rng`. Never use `Math.random` or wall-clock timestamps (`Date.now`) inside `src/core`.
4. **Clean Exports & Modularity**: Use named exports. Keep files under 300 lines. Break complex logic into small, testable pure functions.
5. **Localization Mandatory**: Never hard-code player-facing strings in UI/scenes. Reference localization keys via `src/i18n/vi.json` and `en.json`.
6. **Error Handling**: Use typed custom errors. Never write empty catch blocks (`catch (e) {}`); handle or propagate with clear context.
7. **Intentional Comments**: Write comments explaining *why* a design choice exists, not *what* the code visibly does.

