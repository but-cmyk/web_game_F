/**
 * SummaryScene for DEEPER.
 * End-of-run breakdown screen displaying outcome (Extracted / Died),
 * depth reached, gold banked or lost, and updated vault balance.
 */

import Phaser from 'phaser';
import { PALETTE, hexToNumber } from '../utils/palette';
import { t } from '../i18n';

export interface SummarySceneData {
  readonly outcome: 'extracted' | 'died';
  readonly depth: number;
  readonly bankedGoldAdded: number;
  readonly lostGold: number;
  readonly totalBanked: number;
}

export class SummaryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SummaryScene' });
  }

  create(data: SummarySceneData): void {
    const { width, height } = this.scale;
    const isExtracted = data.outcome === 'extracted';

    // Dark background
    this.add.rectangle(0, 0, width, height, hexToNumber(PALETTE.background)).setOrigin(0);

    // Outcome Header
    const titleColor = isExtracted ? PALETTE.goldAccent : PALETTE.danger;
    const titleKey = isExtracted ? 'summary.title_extracted' : 'summary.title_died';

    this.add
      .text(width / 2, 28, t(titleKey), {
        fontSize: '14px',
        color: titleColor,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Summary Card Panel
    this.add
      .rectangle(width / 2, 90, 260, 80, hexToNumber(PALETTE.panel), 0.9)
      .setStrokeStyle(1, hexToNumber(PALETTE.panelBorder))
      .setOrigin(0.5);

    // Line 1: Depth reached
    this.add
      .text(width / 2, 66, t('summary.depth_reached', { depth: data.depth }).toUpperCase(), {
        fontSize: '8px',
        color: PALETTE.text,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Line 2: Gold banked or lost
    if (isExtracted) {
      this.add
        .text(
          width / 2,
          86,
          t('summary.gold_banked', { amount: data.bankedGoldAdded }).toUpperCase(),
          {
            fontSize: '9px',
            color: PALETTE.goldHighlight,
            fontFamily: 'monospace',
            fontStyle: 'bold',
          }
        )
        .setOrigin(0.5);
    } else {
      this.add
        .text(width / 2, 86, t('summary.gold_lost', { amount: data.lostGold }).toUpperCase(), {
          fontSize: '9px',
          color: PALETTE.danger,
          fontFamily: 'monospace',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
    }

    // Line 3: Total Treasury in vault
    this.add
      .text(
        width / 2,
        108,
        t('summary.total_treasury', { total: data.totalBanked }).toUpperCase(),
        {
          fontSize: '8px',
          color: PALETTE.textDim,
          fontFamily: 'monospace',
        }
      )
      .setOrigin(0.5);

    // Continue Prompt
    const continuePrompt = this.add
      .text(width / 2, 154, t('summary.continue_prompt'), {
        fontSize: '8px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: continuePrompt,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Return to Menu trigger
    let returned = false;
    const returnToMenu = () => {
      if (returned) return;
      returned = true;
      this.scene.start('MenuScene');
    };

    this.input.keyboard?.once('keydown', returnToMenu);
    this.input.once('pointerdown', returnToMenu);
  }
}

