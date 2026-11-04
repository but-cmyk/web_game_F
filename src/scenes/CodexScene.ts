/**
 * CodexScene for DEEPER.
 * In-game transparent odds reference directly displaying data-driven values:
 * - Enemies (Crawler, Listener, Stalker)
 * - Curses (4 outcomes with equal 25% odds)
 * - Devil's Bargains (8 transparent cost/reward exchanges)
 * - Items & Multipliers
 * Pure Phaser 3 scene with 320x180 resolution.
 */

import Phaser from 'phaser';
import { getCodexData, CodexData } from '../core/codex';
import { PALETTE, hexToNumber } from '../utils/palette';
import { t } from '../i18n';

export type CodexTab = 'enemies' | 'curses' | 'bargains' | 'items';

export class CodexScene extends Phaser.Scene {
  private codexData!: CodexData;
  private activeTab: CodexTab = 'curses';
  private contentContainer!: Phaser.GameObjects.Container;
  private tabButtons: Map<CodexTab, Phaser.GameObjects.Text> = new Map();

  constructor() {
    super({ key: 'CodexScene' });
  }

  create(): void {
    this.codexData = getCodexData();

    // Background panel
    this.add
      .rectangle(0, 0, 320, 180, hexToNumber(PALETTE.background))
      .setOrigin(0);

    // Header Title
    this.add
      .text(160, 10, t('codex.title').toUpperCase(), {
        fontSize: '10px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Tab Bar (y = 24)
    this.createTabBar();

    // Content Container
    this.contentContainer = this.add.container(0, 38);

    // Render active tab content
    this.renderTabContent();

    // Footer Return Hint
    const returnHint = this.add
      .text(160, 172, t('codex.back_hint'), {
        fontSize: '7px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    returnHint.on('pointerdown', () => this.returnToMenu());

    // Input bindings
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
        switch (event.code) {
          case 'Escape':
          case 'Space':
            this.returnToMenu();
            break;
          case 'Digit1':
            this.switchTab('curses');
            break;
          case 'Digit2':
            this.switchTab('bargains');
            break;
          case 'Digit3':
            this.switchTab('enemies');
            break;
          case 'Digit4':
            this.switchTab('items');
            break;
        }
      });
    }
  }

  private createTabBar(): void {
    const tabs: { key: CodexTab; labelKey: string; x: number }[] = [
      { key: 'curses', labelKey: 'codex.tab_curses', x: 42 },
      { key: 'bargains', labelKey: 'codex.tab_bargains', x: 120 },
      { key: 'enemies', labelKey: 'codex.tab_enemies', x: 198 },
      { key: 'items', labelKey: 'codex.tab_items', x: 276 },
    ];

    for (const tab of tabs) {
      const btn = this.add
        .text(tab.x, 24, t(tab.labelKey).toUpperCase(), {
          fontSize: '7px',
          color: tab.key === this.activeTab ? PALETTE.goldHighlight : PALETTE.textDim,
          fontFamily: 'monospace',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => this.switchTab(tab.key));
      this.tabButtons.set(tab.key, btn);
    }
  }

  private switchTab(tab: CodexTab): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;

    for (const [key, btn] of this.tabButtons.entries()) {
      btn.setColor(key === tab ? PALETTE.goldHighlight : PALETTE.textDim);
    }

    this.renderTabContent();
  }

  private renderTabContent(): void {
    this.contentContainer.removeAll(true);

    let yOffset = 0;

    switch (this.activeTab) {
      case 'curses': {
        for (const curse of this.codexData.curses) {
          const name = this.add.text(12, yOffset, `${t(curse.nameKey)} [${curse.percentage}%]`, {
            fontSize: '8px',
            color: PALETTE.danger,
            fontFamily: 'monospace',
            fontStyle: 'bold',
          });
          const desc = this.add.text(12, yOffset + 11, t(curse.descKey), {
            fontSize: '7px',
            color: PALETTE.text,
            fontFamily: 'monospace',
            wordWrap: { width: 296 },
          });

          this.contentContainer.add([name, desc]);
          yOffset += 30;
        }
        break;
      }

      case 'bargains': {
        for (let i = 0; i < Math.min(4, this.codexData.bargains.length); i++) {
          const b = this.codexData.bargains[i];
          const name = this.add.text(12, yOffset, t(b.nameKey), {
            fontSize: '8px',
            color: PALETTE.goldAccent,
            fontFamily: 'monospace',
            fontStyle: 'bold',
          });
          const cost = this.add.text(12, yOffset + 10, `${t('codex.label_cost')}: ${t(b.costKey)}`, {
            fontSize: '7px',
            color: PALETTE.danger,
            fontFamily: 'monospace',
          });
          const reward = this.add.text(12, yOffset + 19, `${t('codex.label_reward')}: ${t(b.rewardKey)}`, {
            fontSize: '7px',
            color: PALETTE.focus,
            fontFamily: 'monospace',
          });

          this.contentContainer.add([name, cost, reward]);
          yOffset += 31;
        }
        break;
      }

      case 'enemies': {
        for (const enemy of this.codexData.enemies) {
          const name = this.add.text(12, yOffset, `${t(enemy.nameKey)} (HP: ${enemy.hp}, DMG: ${enemy.damage})`, {
            fontSize: '8px',
            color: PALETTE.danger,
            fontFamily: 'monospace',
            fontStyle: 'bold',
          });
          const desc = this.add.text(12, yOffset + 11, t(enemy.descKey), {
            fontSize: '7px',
            color: PALETTE.text,
            fontFamily: 'monospace',
            wordWrap: { width: 296 },
          });

          this.contentContainer.add([name, desc]);
          yOffset += 32;
        }
        break;
      }

      case 'items': {
        for (const item of this.codexData.items) {
          const mult = item.multiplier ? `×${item.multiplier}` : `+${item.oilRestore} Oil`;
          const name = this.add.text(12, yOffset, `${t(item.nameKey)} [${mult}]`, {
            fontSize: '8px',
            color: PALETTE.goldHighlight,
            fontFamily: 'monospace',
            fontStyle: 'bold',
          });
          const desc = this.add.text(12, yOffset + 11, t(item.descKey), {
            fontSize: '7px',
            color: PALETTE.text,
            fontFamily: 'monospace',
            wordWrap: { width: 296 },
          });

          this.contentContainer.add([name, desc]);
          yOffset += 28;
        }
        break;
      }
    }
  }

  private returnToMenu(): void {
    this.scene.start('MenuScene');
  }
}

