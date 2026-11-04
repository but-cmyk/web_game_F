# Phaser & Vite Pitfalls Reference

Read this when troubleshooting engine lifecycle, bundler quirks, or asset serving issues.

## 1. Scene Lifecycle & Teardown
- Everything registered in `scene.create()` (listeners, timers, tweens) must be explicitly cleaned up during `scene.events.once('shutdown', ...)` (verify in types).
- Accessing a destroyed Game Object triggers silent rendering drops or runtime exceptions.

## 2. Dynamic Texture Generation
- Textures generated via `graphics.generateTexture()` must be registered in the `TextureManager` before being assigned to Sprites or Tilemaps (verify in types).
- Regenerating an existing texture key without destroying the old one causes texture leaks.

## 3. Scale & Subpixel Rounding
- In Vite dev mode, browser window resizing can produce fractional canvas dimensions unless integer scaling is locked in game config.
- Always verify `pixelArt: true` and `roundPixels: true` (verify in types).

## 4. Audio Unlock & User Gestures
- Browsers block WebAudio playback until an explicit user interaction (click, keypress, touch).
- Do not initialize sound playback in the `Boot` scene before player input.

## 5. Hot Module Replacement (HMR) Quirks
- Vite HMR may re-execute scene files without restarting the Phaser instance, creating duplicate keyboard and mouse listeners.
- Always do a clean browser refresh (`Ctrl+F5`) to verify fixes.

