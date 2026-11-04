# Phaser Pixel Config Reference

Read this when configuring Phaser game instances and viewports.

## Core Game Configuration Object
```ts
import Phaser from 'phaser';

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 320,
  height: 180,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: '#0a0908',
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
};
```

## Rationale
- **320x180**: 16:9 native pixel resolution (exact 1/4 of 1280x720, 1/6 of 1920x1080) ensuring clean integer upscaling without subpixel artifacts.
- **`roundPixels: true`**: Prevents shimmering during camera panning.
- **HUD allocation**: 20px top banner, reserving 320x160 (20x10 tiles) for the playable dungeon view.
