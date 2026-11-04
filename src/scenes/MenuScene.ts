/**
 * MenuScene for DEEPER.
 * Main title screen displaying banked gold treasury, run start prompt,
 * and shortcuts for Codex (Odds) and Shop (Meta-Upgrades).
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
      .text(width / 2, 32, t('game.title_display'), {
        fontSize: '20px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(width / 2, 50, t('game.subtitle').toUpperCase(), {
        fontSize: '8px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Treasury Vault Display Card
    const cardY = 78;
    this.add
      .rectangle(width / 2, cardY, 190, 22, hexToNumber(PALETTE.panel), 0.9)
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

    // Nav Buttons Row 1 (y = 106)
    const btnY1 = 106;

    // Codex Button (Col 1)
    const codexBtn = this.add
      .rectangle(width / 2 - 70, btnY1, 134, 18, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.focus))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2 - 70, btnY1, t('menu.codex_button'), {
        fontSize: '6.5px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Shop Button (Col 2)
    const shopBtn = this.add
      .rectangle(width / 2 + 70, btnY1, 134, 18, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.goldAccent))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2 + 70, btnY1, t('menu.shop_button'), {
        fontSize: '6.5px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Nav Buttons Row 2 (y = 128)
    const btnY2 = 128;

    // The Mirror Button (Col 1)
    const mirrorBtn = this.add
      .rectangle(width / 2 - 70, btnY2, 134, 18, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.goldHighlight))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2 - 70, btnY2, t('menu.mirror_btn').toUpperCase(), {
        fontSize: '6.5px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Tutorial Button (Col 2)
    const tutorialBtn = this.add
      .rectangle(width / 2 + 70, btnY2, 134, 18, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.text))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2 + 70, btnY2, t('menu.tutorial_btn').toUpperCase(), {
        fontSize: '6.5px',
        color: PALETTE.text,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Start prompt
    const promptText = this.add
      .text(width / 2, 150, t('menu.press_start'), {
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

    // Start run / navigation
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

    const openShop = () => {
      if (transitioning) return;
      transitioning = true;
      this.scene.start('ShopScene');
    };

    const openMirror = () => {
      if (transitioning) return;
      transitioning = true;
      this.scene.start('MirrorScene');
    };

    const openTutorial = () => {
      if (transitioning) return;
      transitioning = true;
      this.scene.start('TutorialScene');
    };

    codexBtn.on('pointerdown', () => openCodex());
    shopBtn.on('pointerdown', () => openShop());
    mirrorBtn.on('pointerdown', () => openMirror());
    tutorialBtn.on('pointerdown', () => openTutorial());

    // Keyboard controls
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (transitioning) return;
      if (event.key === 'c' || event.key === 'C') {
        openCodex();
      } else if (event.key === 's' || event.key === 'S') {
        openShop();
      } else if (event.key === 'm' || event.key === 'M') {
        openMirror();
      } else if (event.key === 't' || event.key === 'T') {
        openTutorial();
      } else if (event.key === ' ' || event.key === 'Enter') {
        startRun();
      }
    });

    // Pointer controls
    this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      if (transitioning) return;
      if (
        currentlyOver.includes(codexBtn) ||
        currentlyOver.includes(shopBtn) ||
        currentlyOver.includes(mirrorBtn) ||
        currentlyOver.includes(tutorialBtn)
      )
        return;
      startRun();
    });
  }
}
