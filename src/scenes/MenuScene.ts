/**
 * MenuScene for DEEPER.
 * Main title screen displaying banked gold treasury and run start prompt.
 */

import Phaser from 'phaser';
import { defaultSaveStore } from '../services/SaveStore';
import { PALETTE, hexToNumber } from '../utils/palette';
import { t } from '../i18n';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const save = defaultSaveStore.load();

    // Background fill
    this.add.rectangle(0, 0, width, height, hexToNumber(PALETTE.background)).setOrigin(0);

    // Title
    this.add
      .text(width / 2, 38, t('game.title_display'), {
        fontSize: '20px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(width / 2, 58, t('game.subtitle').toUpperCase(), {
        fontSize: '8px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Treasury Vault Display Card
    const cardY = 96;
    this.add
      .rectangle(width / 2, cardY, 180, 28, hexToNumber(PALETTE.panel), 0.9)
      .setStrokeStyle(1, hexToNumber(PALETTE.panelBorder))
      .setOrigin(0.5);

    this.add
      .text(width / 2, cardY, t('menu.treasury', { gold: save.bankedGold }).toUpperCase(), {
        fontSize: '9px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Start prompt
    const promptText = this.add
      .text(width / 2, 146, t('menu.press_start'), {
        fontSize: '8px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtle pulsing animation on prompt
    this.tweens.add({
      targets: promptText,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Start run trigger
    let started = false;
    const startRun = () => {
      if (started) return;
      started = true;
      this.scene.start('RunScene', {
        seed: Date.now(),
        depth: 1,
        bankedGold: save.bankedGold,
      });
    };

    this.input.keyboard?.once('keydown', startRun);
    this.input.once('pointerdown', startRun);
  }
}
