---
name: deeper-qa-balance-release
description: "QA, balance and release procedures for DEEPER: Vitest unit tests, the Monte Carlo balance simulator with bot policies, performance budgets, browser smoke tests, accessibility and i18n checks, build size limits, and itch.io/web packaging. Use whenever tuning numbers, writing tests, running checks, verifying a milestone, profiling, or preparing a release."
---
# Deeper QA, Balance & Release

Read first: docs/IMPLEMENTATION_PLAN.md sections 2, 4.11, 5 (M0, M7, M11), 7.

## 1. Testing Pyramid Strategy
- **Unit Tests (Vitest)**: Cover 100% of core formulas (oil drain, Dread increments, loot curves), state machine transitions, seeded determinism, grid calculations, and JSON schema integrity. Run fast without Phaser dependencies.
- **Integration Tests**: Simulate end-to-end turns in `src/core/` across 100 seeds.
- **Browser Smoke Tests**: Verify canvas rendering, input handling, audio unlock, and 60 FPS performance in a real headless or local browser.

## 2. Monte Carlo Balance Simulator
Refer to [balance-sim-contract.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-qa-balance-release/resources/balance-sim-contract.md):
- Implemented in `scripts/balance-sim.ts`, directly executing `src/core/` without rendering overhead.
- Supports CLI flags: `--runs <N>`, `--policy <cautious|greedy|mixed>`, `--seed <seed>`.
- Evaluates death rate, average depth reached, extraction rate, and expected banked gold per run.

## 3. Balance Target Thresholds (Milestone M7)
- **Mixed Policy**: 55-65% death rate in first 5 runs.
- **Greedy Policy**: >= 80% death rate.
- **Cautious Policy**: >= 70% extraction rate with lower expected gold return.
- **Non-Dominance Invariant**: No policy may achieve > 1.5x the expected banked gold of the Mixed policy.

## 4. Performance Budgets
- **Bundle Size**: Final packaged zip bundle must be <= 5 MB.
- **Load Time**: Cold initial load < 3 seconds on simulated 4G mobile.
- **Frame Rate**: Maintain steady 60 FPS even under simulated 4x CPU throttling.
- **Mobile Usability**: Completely playable on 360x640 portrait viewport via touch.

## 5. Accessibility & Localization Integrity
- Full localization parity between `src/i18n/vi.json` and `src/i18n/en.json`. Tests must fail if any translation key is missing.
- Photosensitivity: Flashing effects <= 3 flashes/second; camera shake completely toggleable.

## 6. Release Packaging & Honest Reporting
Refer to [release-checklist.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-qa-balance-release/resources/release-checklist.md):
- Command: `npm run package` outputs a standalone, offline-capable HTML5 zip package suitable for itch.io and web distribution.
- **Never Weaken Quality Gates**: If a balance target or unit test fails, report the actual numbers honestly. Never soften assertions or modify criteria to force a green result.
