---
name: deeper-greed-systems
description: "Rules for DEEPER's greed mechanics: depth-scaled loot value, cursed chests, devil's bargains, extraction stations and rope, shop and meta upgrades, the odds Codex, and economy balancing. Use whenever touching gold, loot tables, events, upgrades, prices, extraction or death rules, or any probability shown to the player. Odds must always stay transparent."
---
# Deeper Greed Systems

Read first: docs/IMPLEMENTATION_PLAN.md sections 4.6, 4.7, 4.8, 4.11, 5 (M6, M7).

## 1. Core Economy Invariants [LOCKED]
- **Pure Virtual Currency**: No real money or loot boxes.
- **Exact Transparency**: Every chest, curse, and devil's bargain must display full numerical odds and costs before player confirmation.
- **Single Source Codex**: The in-game Codex is programmatically constructed from the exact JSON files used by the runtime engine. A unit test must fail if they diverge.
- **Extraction vs Death**: Extracting banks 100% of carried gold. Death loses all carried gold, but permanently banked gold is never penalized.

## 2. Loot Scaling & Curves
- Base Gold: `lootValue(depth) = round(10 * 1.3^(depth - 1))`.
- Cursed Chests: Value multiplier ×1.5 with 1 of 4 curses chosen with equal 25% probability.
- Devil's Bargains: 8 discrete bargains presented with explicit cost/benefit pairs (e.g., pay 30% oil, receive 4x lootValue gold). Decline option is always available and equally prominent.

## 3. Meta-Progression & Shop
- Persistent upgrades (Lantern Capacity, Soft Shoes, Starting Rope, Extra Heart, Stair Compass, Reserve Oil) purchased solely with banked gold.
- Prices scale exponentially per tier; values documented in `src/data/upgrades.json`.

## 4. Procedure for Economy Additions
Refer to [economy-checklist.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-greed-systems/resources/economy-checklist.md) when introducing items, curses, bargains, or upgrades:
1. Define entry in `src/data/*.json` with snake_case ID and explicit weights.
2. Add localization keys in `src/i18n/vi.json` and `en.json`.
3. Write unit tests asserting generation probability and value scaling.
4. Execute `scripts/balance-sim.ts` across bot policies.
5. Record changes and simulation outputs into `docs/BALANCE_LOG.md`.
6. Assert Codex synchronization test.

## 5. Dominant Strategy Detection
- No strategy (Cautious, Greedy, or Mixed) may achieve > 1.5x the expected gold return of the Mixed policy.
- If Greedy bot death rate drops below 80% or Cautious extraction exceeds expectations, re-balance risk curves in `src/data/*.json`.

## 6. Dopamine Feedback Boundaries
- Allowed: Melodic pentatonic pitch increments on consecutive gold pickups (capped at 5 steps).
- Forbidden: Fake "near-miss" slot animations, deceptive loss-framed streaks, or artificially biased coin flips.
