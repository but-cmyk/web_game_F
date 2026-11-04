/**
 * MenuScene for DEEPER.
 * Main title screen displaying banked gold treasury, run start prompt,
 * and Codex shortcut for 100% transparent game odds.
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
      .text(width / 2, 34, t('game.title_display'), {
        fontSize: '20px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(width / 2, 54, t('game.subtitle').toUpperCase(), {
        fontSize: '8px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Treasury Vault Display Card
    const cardY = 86;
    this.add
      .rectangle(width / 2, cardY, 180, 24, hexToNumber(PALETTE.panel), 0.9)
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

    // Codex Button
    const codexY = 118;
    const codexBtn = this.add
      .rectangle(width / 2, codexY, 210, 20, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.focus))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, codexY, t('menu.codex_button'), {
        fontSize: '8px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Start prompt
    const promptText = this.add
      .text(width / 2, 152, t('menu.press_start'), {
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

    // Start run / codex navigation
    let transitioning = false;

    const startRun = () => {
      if (transitioning) return;
      transitioning = true;
      this.scene.start('RunScene', {
        seed: Date.now(),
        depth: 1,
        bankedGold: save.bankedGold,
      });
    };

    const openCodex = () => {
      if (transitioning) return;
      transitioning = true;
      this.scene.start('CodexScene');
    };

    codexBtn.on('pointerdown', () => {
      openCodex();
    });

    // Keyboard controls
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (transitioning) return;
      if (event.key === 'c' || event.key === 'C') {
        openCodex();
      } else if (event.key === ' ' || event.key === 'Enter') {
        startRun();
      }
    });

    // Pointer controls
    this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      if (transitioning) return;
      if (currentlyOver.includes(codexBtn)) return;
      startRun();
    });
  }
}
