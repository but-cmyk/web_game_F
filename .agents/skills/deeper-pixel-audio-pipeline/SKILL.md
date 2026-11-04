---
name: deeper-pixel-audio-pipeline
description: "How to produce and manage DEEPER's pixel art and sound without external tools: the DEEPER-24 palette, procedural placeholder tiles and sprites, asset manifest and naming, biome palette swaps, WebAudio-synthesized sound effects, and colorblind-safe and high-contrast variants. Use whenever adding or replacing sprites, tiles, UI art, palettes, fonts, sound effects or music."
---
# Deeper Pixel & Audio Pipeline

Read first: docs/IMPLEMENTATION_PLAN.md sections 2, 4.1, 4.11, 5 (M0, M2, M4, M6, M9).

## 1. The DEEPER-24 Palette
- Defined in `src/utils/palette.ts` (24 indexed hex colors).
- All visuals (tiles, sprites, UI elements) must draw exclusively from these 24 shades.
- Never use third-party copyrighted palettes; maintain internal harmony across dark stone, gold accents, and bio-glow.

## 2. Procedural Placeholder Art
- Generate placeholder textures in code via `Phaser.GameObjects.Graphics` and `generateTexture(key, 16, 16)`.
- Use geometric glyphs, high-contrast borders, and distinctive shapes to indicate entity roles.
- Naming Convention:
  - Tiles: `tile_<biome>_<kind>` (e.g., `tile_stone_floor`, `tile_fungus_wall`)
  - Sprites: `spr_<entity>_<anim>_<frame>` (e.g., `spr_crawler_walk_0`)
  - UI: `ui_<name>` (e.g., `ui_heart_full`, `ui_oil_meter`)

## 3. Asset Manifest & Asset Invariants
Refer to [asset-manifest-schema.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-pixel-audio-pipeline/resources/asset-manifest-schema.md):
- Every visual asset must be declared in the manifest schema with key, dimension, source, and license.
- Real pixel art supplied later must match the exact key and 16x16 dimension without breaking code call sites.
- All asset attributions and licenses must be recorded in `CREDITS.md`.

## 4. Biome Palette Swapping
Shift mood across floor tiers via color indexing:
- **Biome 1 (Floors 1-4)**: Warm stone (dark ochre, brown, warm gold accents).
- **Biome 2 (Floors 5-8)**: Fungal caverns (bioluminescent green, moss, pale teal).
- **Biome 3 (Floors 9-12)**: The Abyss (cold abyssal purple, slate blue, chilling cyan).

## 5. WebAudio Synthesized SFX
Refer to [sfx-spec.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-pixel-audio-pipeline/resources/sfx-spec.md) for synthesis parameters:
- Generate all 12 core audio effects in `src/audio/sfx.ts` via native WebAudio API (`OscillatorNode`, `GainNode`, `BiquadFilterNode`).
- Zero external audio files required for core operation.

## 6. Accessibility & Contrast
- Never rely on color alone: Pair hazard or item indicators with unique geometric silhouettes or badges.
- Include a High-Contrast mode in Settings that bumps luminance borders by +30%.
