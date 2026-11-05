/**
 * MenuScene for DEEPER.
 * Main title screen displaying banked gold treasury, run start prompt,
 * and shortcuts for Codex, Shop, Mirror, Tutorial, Settings, Daily Delve, and Leaderboard.
 */

import Phaser from 'phaser';
import { defaultSaveStore } from '../services/SaveStore';
import { getUtcDateString, getUtcDailySeed } from '../core/daily';
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
      .text(width / 2, 26, t('game.title_display'), {
        fontSize: '18px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(width / 2, 42, t('game.subtitle').toUpperCase(), {
        fontSize: '7.5px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Treasury Vault Display Card
    const cardY = 64;
    this.add
      .rectangle(width / 2, cardY, 190, 20, hexToNumber(PALETTE.panel), 0.9)
      .setStrokeStyle(1, hexToNumber(PALETTE.panelBorder))
      .setOrigin(0.5);

    this.add
      .text(width / 2, cardY, t('menu.treasury', { gold: save.bankedGold }).toUpperCase(), {
        fontSize: '8px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Settings Button (Top-Right)
    const settingsBtn = this.add
      .text(width - 34, 12, t('menu.settings_btn').toUpperCase(), {
        fontSize: '6.5px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Nav Buttons Row 1 (y = 88)
    const btnY1 = 88;
    const colLeft = width / 2 - 70;
    const colRight = width / 2 + 70;
    const btnW = 134;
    const btnH = 15;

    // Codex Button (Col 1)
    const codexBtn = this.add
      .rectangle(colLeft, btnY1, btnW, btnH, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.focus))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(colLeft, btnY1, t('menu.codex_button'), {
        fontSize: '6.5px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Shop Button (Col 2)
    const shopBtn = this.add
      .rectangle(colRight, btnY1, btnW, btnH, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.goldAccent))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(colRight, btnY1, t('menu.shop_button'), {
        fontSize: '6.5px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Nav Buttons Row 2 (y = 107)
    const btnY2 = 107;

    // The Mirror Button (Col 1)
    const mirrorBtn = this.add
      .rectangle(colLeft, btnY2, btnW, btnH, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.goldHighlight))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(colLeft, btnY2, t('menu.mirror_btn').toUpperCase(), {
        fontSize: '6.5px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Tutorial Button (Col 2)
    const tutorialBtn = this.add
      .rectangle(colRight, btnY2, btnW, btnH, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.text))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(colRight, btnY2, t('menu.tutorial_btn').toUpperCase(), {
        fontSize: '6.5px',
        color: PALETTE.text,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Nav Buttons Row 3 (y = 126)
    const btnY3 = 126;

    // Daily Delve Button (Col 1)
    const dailyBtn = this.add
      .rectangle(colLeft, btnY3, btnW, btnH, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.goldHighlight))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(colLeft, btnY3, t('menu.daily_btn').toUpperCase(), {
        fontSize: '6.5px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Leaderboard Button (Col 2)
    const leaderboardBtn = this.add
      .rectangle(colRight, btnY3, btnW, btnH, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.focus))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(colRight, btnY3, t('menu.leaderboard_btn').toUpperCase(), {
        fontSize: '6.5px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Start prompt
    const promptText = this.add
      .text(width / 2, 150, t('menu.press_start'), {
        fontSize: '7.5px',
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

    // Navigation actions
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

    const startDailyRun = () => {
      if (transitioning) return;
      transitioning = true;
      const todayStr = getUtcDateString(new Date());
      const seed = getUtcDailySeed(todayStr);
      this.scene.start('RunScene', {
        seed,
        isDailyRun: true,
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

    const openSettings = () => {
      if (transitioning) return;
      transitioning = true;
      this.scene.start('SettingsScene');
    };

    const openLeaderboard = () => {
      if (transitioning) return;
      transitioning = true;
      this.scene.start('LeaderboardScene');
    };

    codexBtn.on('pointerdown', () => openCodex());
    shopBtn.on('pointerdown', () => openShop());
    mirrorBtn.on('pointerdown', () => openMirror());
    tutorialBtn.on('pointerdown', () => openTutorial());
    settingsBtn.on('pointerdown', () => openSettings());
    dailyBtn.on('pointerdown', () => startDailyRun());
    leaderboardBtn.on('pointerdown', () => openLeaderboard());

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
      } else if (event.key === 'o' || event.key === 'O') {
        openSettings();
      } else if (event.key === 'd' || event.key === 'D') {
        startDailyRun();
      } else if (event.key === 'l' || event.key === 'L') {
        openLeaderboard();
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
        currentlyOver.includes(tutorialBtn) ||
        currentlyOver.includes(settingsBtn) ||
        currentlyOver.includes(dailyBtn) ||
        currentlyOver.includes(leaderboardBtn)
      )
        return;
      startRun();
    });
  }
}
