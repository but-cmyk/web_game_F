---
name: deeper-mirror-telemetry
description: "Rules for DEEPER's Mirror screen and decision telemetry: decision log schema, greed and fear metrics, personal-baseline comparison, archetype cards, neutral non-judgmental copy, local share-image export, consent and privacy. Use whenever writing the run summary, metrics, analytics events, share cards, or any text that describes the player's behavior."
---
# Deeper Mirror & Telemetry

Read first: docs/IMPLEMENTATION_PLAN.md sections 4.9, 4.10, 4.11, 5 (M8, M10).

## 1. Decision Log Schema
Record run decision points cleanly into memory:
- Fields: `depth`, `oilFrac`, `dread`, `hp`, `carriedGold`, `action`, `context`.
- Captured at every significant branching point: floor transition, exit station encounter, bargain prompt, and chest discovery.

## 2. Fear and Greed Metric Calculation
Calculate raw metrics as defined in `docs/IMPLEMENTATION_PLAN.md` §4.9:
```
greedRaw = 3*bypassedExit + 2*cursedAccepted + 1*bargainsAccepted + 2*pushedOnHighDread
fearRaw  = 3*earlyExit + 1*bargainsDeclined + 1*chestsSkipped + round(10*sneakRatio)
```
- Compare scores strictly against the rolling mean of the player's last 10 runs.
- During the first 3 runs, display the neutral state: "Baseline forming".

## 3. Archetype Determination
- Map final metrics against thresholds defined in `src/data/mirror.json`:
  - High Greed, Low Fear: *The Gold Digger* (Kẻ Đào Vàng)
  - Low Greed, High Fear: *The Flamekeeper* (Người Giữ Lửa)
  - High Greed, High Fear: *The Trembling Walker* (Người Đi Trong Run Rẩy)
  - Low Greed, Low Fear: *The Calculator* (Kẻ Tính Toán)
- Mandatory Disclaimer: Every card must display "For entertainment purposes only; not a psychological assessment."

## 4. Copywriting Rules & Tone
Refer to [copy-guide.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-mirror-telemetry/resources/copy-guide.md):
- Describe the action, not the person: "This time you pushed 2 floors past your average" (NEVER "You are reckless/greedy").
- Strict Banned Words: Clinical terms (e.g., pathology, disorder, neurotic) and judgmental language are strictly forbidden, maintained in `src/data/banned-mirror-words.json` and enforced via automated tests.

## 5. Local Share-Image Generation
- Render shareable cards purely in-browser on an offscreen HTML canvas.
- Never upload share images automatically to any external server.

## 6. Privacy & Telemetry
- Interface: Abstract reporting behind `Analytics` interface defaulting to `NoopAnalytics`.
- Consent Screen: Explicit opt-in prompt with random UUID and immediate data purge option.

