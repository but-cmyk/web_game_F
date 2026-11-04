import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { RunScene } from './scenes/RunScene';
import { SummaryScene } from './scenes/SummaryScene';
import { CodexScene } from './scenes/CodexScene';
import { ShopScene } from './scenes/ShopScene';
import { MirrorScene } from './scenes/MirrorScene';
import { TutorialScene } from './scenes/TutorialScene';
import { hexToNumber, PALETTE } from './utils/palette';

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 320,
  height: 180,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: hexToNumber(PALETTE.background),
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 320,
    height: 180,
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
  scene: [BootScene, MenuScene, RunScene, SummaryScene, CodexScene, ShopScene, MirrorScene, TutorialScene],
};

declare global {
  interface Window {
    __PHASER_GAME__?: Phaser.Game;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(GAME_CONFIG);
  window.__PHASER_GAME__ = game;
});

