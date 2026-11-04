---
name: deeper-fear-systems
description: "Rules for DEEPER's fear mechanics: oil lamp, light radius, the Dread meter and its thresholds, movement modes and noise propagation, monster AI state machines (Crawler, Listener, Stalker), hallucinations, post-processing effects and the audio director. Use whenever working on tension, darkness, monsters, noise, vignette/shake effects, heartbeat or ambient audio, or reduce-motion accessibility."
---
# Deeper Fear Systems

Read first: docs/IMPLEMENTATION_PLAN.md sections 4.2, 4.3, 4.4, 4.5, 4.11, 5 (M4, M5).

## 1. Pure Services for Fear Mechanics
Isolate all fear logic in pure TypeScript under `src/core/`:
- **Oil System**: Tracks capacity, deductions per step (`1 + 0.15 * depth` modulated by movement mode), and light radius calculation (`2 + round(4 * oil / oilMax)`).
- **Dread System (0-100)**: Accumulates in unlit tiles (+2) and monster visibility (+10); recovers in torchlight (-3).
- **Noise System**: Emits noise events based on move mode (Sneak: 2 tiles; Walk: 4 tiles; Run: 7 tiles). Propagates strictly via **BFS grid path distance with walls blocking**, never straight-line Euclidean distance. Dread at 100 doubles emission radius.

## 2. Monster AI State Machines (FSM)
Refer to [monster-fsm-table.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-fear-systems/resources/monster-fsm-table.md) for explicit transition states:
- **Crawler**: `PATROL -> SUSPICIOUS -> CHASE -> SEARCH (8 turns) -> PATROL`.
- **Listener**: Stationary. On noise within 5 tiles, emits an alert howl setting all monsters within 10 tiles to `SUSPICIOUS`.
- **Stalker**: Tracks recent player trail history, moving 1 step every 2 turns.
- **Testing Requirement**: Every state transition must have an explicit deterministic unit test.

## 3. Hallucination Mechanics
- Triggered when Dread >= 70 (15% chance every 5 steps).
- Fake monsters **never deal damage**; they evaporate into smoke when within <= 2 tiles of the player, penalizing +5 Dread.

## 4. Visual Effects & Accessibility Controls
- Post-processing effects (vignette, noise, subtle pulse) must strictly respect player Settings: `reduceFlashing` and `reduceShake`.
- **Flashing Limit**: Never exceed 3 flashes/second (WCAG 2.3.1).
- **No Jumpscares**: Build sustainable, psychological dread; do not use cheap full-screen flash/scream tactics.
- Particle caps: Maximum 30 concurrent particles to preserve 60 FPS on mobile devices.

## 5. Audio Director & Sensory Redundancy
Refer to [audio-cue-rules.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-fear-systems/resources/audio-cue-rules.md):
- WebAudio synthesis: Dynamic heartbeat tempo tied to Dread value.
- **Silence Before Threat**: When a monster enters `CHASE`, mute ambient audio for 1 turn before sounding alarm cues.
- Audio Unlock: Gate audio context initialization behind the player's first user gesture.
- **Visual Twin**: Every critical audio warning (heartbeat, monster scream, stalker whisper) must have a simultaneous visual equivalent (pulsing HUD indicator, vignette tint, or screen caption).

## 6. Tuning Discipline
Tune fear numbers in `src/data/enemies.json` and `src/data/biomes.json`. Never alter locked formulas in `docs/IMPLEMENTATION_PLAN.md` §4 without owner approval and log entry.

