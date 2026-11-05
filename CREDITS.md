# CREDITS & ATTRIBUTIONS

DEEPER is a 2D pixel-art roguelike web game exploring the psychological tension between Fear and Greed through push-your-luck subterranean exploration.

---

## 1. Core Engine & Libraries

- **Phaser 3 Game Framework**:
  - Copyright (c) 2011–2026 Richard Davey, Photon Storm Ltd.
  - License: MIT License (`https://opensource.org/licenses/MIT`)
  - Repository: `https://github.com/photonstorm/phaser`
- **TypeScript**:
  - Copyright (c) Microsoft Corporation.
  - License: Apache License 2.0
- **Vite & Vitest**:
  - Copyright (c) 2019–present, Yuxi (Evan) You and Vite contributors.
  - License: MIT License

---

## 2. Visual Art & Palette

- **DEEPER-24 Palette**:
  - Procedural 24-color subterranean palette specifically curated for high contrast, photosensitivity safety, and distinct subterranean biomes (Stone Dungeon, Bioluminescent Fungal Cavern, Abyssal Trench).
  - All sprites, tiles, UI cards, and particles are procedurally generated in-engine via HTML5 Canvas buffers to ensure zero external image dependencies and sub-400KB distribution sizes.
- **Photosensitivity & Accessibility Compliance**:
  - Conforms to WCAG 2.3.1 (Three Flashes or Below Threshold).
  - High contrast palette modes and reduced motion options toggleable in Settings.

---

## 3. Audio & Music Architecture

- **WebAudio Sound Director (`AudioDirector`)**:
  - 100% procedurally synthesized audio using the Web Audio API (`AudioContext`). Zero external mp3/wav files required.
  - Procedural sound generators:
    - Dynamic footstep synthesis modulated by movement mode (Sneak, Walk, Run).
    - Gold chime harmonic bell synthesis with sparkling overtone decay.
    - Low-frequency heartbeat tension oscillator reactive to Dread levels ($\ge 70$).
    - Arachnid skitter, Listener resonant howl, and Stalker spectral hum synthesis.
    - Hallucination whisper evaporation pink noise filtering.
  - Full volume balance control (Master, SFX, Ambient) persisted in local storage.

---

## 4. Ethical Game Design

- Strict adherence to `.agents/rules/ethics-guardrails.md`:
  - **No Real Money / Microtransactions / Loot Boxes**.
  - **100% Transparent Odds** generated directly from JSON balance data.
  - **Zero Manipulative Retention**: No fake near-miss feedback, no streak penalties, no guilt notifications.
  - **45-Minute Playtime Rest Reminders** for player eye and mind well-being.
  - **Strict Opt-In Telemetry & Instant Data Wipe** for total privacy.
