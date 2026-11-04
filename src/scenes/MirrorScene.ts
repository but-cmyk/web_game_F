/**
 * MirrorScene for DEEPER.
 * End-of-run psychological reflection screen displaying:
 * - Dual comparative bars (Greed & Fear) vs 10-run personal baseline.
 * - Archetype Card with transparent thresholds.
 * - Neutral behavioral observation copy (no clinical / judgmental labelling).
 * - Mandatory disclaimer.
 * - Local in-browser offscreen canvas share card generation (zero network).
 */

import Phaser from 'phaser';
import { PALETTE, hexToNumber } from '../utils/palette';
import { t, getLocale } from '../i18n';
import { defaultSaveStore } from '../services/SaveStore';
import {
  calculateRollingBaseline,
  determineArchetype,
  generateObservationCopy,
  normalizeMetricScore,
  RunMirrorMetric,
  ArchetypeDefinition,
} from '../core/mirror';
import mirrorJson from '../data/mirror.json';

export interface MirrorSceneData {
  readonly mirrorMetric?: RunMirrorMetric;
}

export class MirrorScene extends Phaser.Scene {
  private currentMetric!: RunMirrorMetric;
  private currentArchetype!: ArchetypeDefinition;
  private currentGreedScore!: number;
  private currentFearScore!: number;
  private observationText!: string;

  constructor() {
    super({ key: 'MirrorScene' });
  }

  create(data?: MirrorSceneData): void {
    const { width, height } = this.scale;
    const save = defaultSaveStore.load();
    const history = save.recentRunMetrics ?? [];

    this.currentMetric =
      data?.mirrorMetric ??
      (history.length > 0
        ? history[history.length - 1]
        : {
            greedRaw: 0,
            fearRaw: 0,
            depth: 1,
            gold: 0,
            outcome: 'extracted',
          });

    this.currentGreedScore = normalizeMetricScore(this.currentMetric.greedRaw);
    this.currentFearScore = normalizeMetricScore(this.currentMetric.fearRaw);

    const baseline = calculateRollingBaseline(history);
    const archetypes = mirrorJson.archetypes as readonly ArchetypeDefinition[];
    this.currentArchetype = determineArchetype(
      this.currentGreedScore,
      this.currentFearScore,
      archetypes
    );

    const lang = getLocale() === 'vi' ? 'vi' : 'en';
    this.observationText = generateObservationCopy(this.currentMetric, baseline, lang);

    // Dark Background
    this.add.rectangle(0, 0, width, height, hexToNumber(PALETTE.background)).setOrigin(0);

    // Header
    this.add
      .text(width / 2, 12, t('mirror.title'), {
        fontSize: '11px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // 1. Archetype Card Panel (y: 24 to 68)
    this.add
      .rectangle(width / 2, 46, 290, 42, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.goldAccent))
      .setOrigin(0.5);

    this.add
      .text(width / 2, 34, t(this.currentArchetype.name_key).toUpperCase(), {
        fontSize: '9px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 47, t(this.currentArchetype.desc_key), {
        fontSize: '6.5px',
        color: PALETTE.text,
        fontFamily: 'monospace',
        wordWrap: { width: 275 },
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 59, `"${this.observationText}"`, {
        fontSize: '6px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
        fontStyle: 'italic',
      })
      .setOrigin(0.5);

    // 2. Comparative Bars Panel (y: 72 to 134)
    this.add
      .rectangle(width / 2, 102, 290, 60, hexToNumber(PALETTE.panel), 0.9)
      .setStrokeStyle(1, hexToNumber(PALETTE.panelBorder))
      .setOrigin(0.5);

    // Greed Bar
    const barX = 90;
    const barWidth = 140;
    const barHeight = 8;

    this.add.text(22, 83, t('mirror.greed_label'), {
      fontSize: '7px',
      color: PALETTE.goldAccent,
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });

    // Greed Bar Background
    this.add
      .rectangle(barX, 87, barWidth, barHeight, hexToNumber(PALETTE.background))
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, hexToNumber(PALETTE.panelBorder));

    // Greed Bar Fill
    const greedFillW = Math.max(2, Math.round((barWidth * this.currentGreedScore) / 100));
    this.add
      .rectangle(barX, 87, greedFillW, barHeight - 2, hexToNumber(PALETTE.goldAccent))
      .setOrigin(0, 0.5);

    this.add.text(barX + barWidth + 6, 83, `${this.currentGreedScore}%`, {
      fontSize: '7px',
      color: PALETTE.goldAccent,
      fontFamily: 'monospace',
    });

    // Fear Bar
    this.add.text(22, 101, t('mirror.fear_label'), {
      fontSize: '7px',
      color: PALETTE.danger,
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });

    // Fear Bar Background
    this.add
      .rectangle(barX, 105, barWidth, barHeight, hexToNumber(PALETTE.background))
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, hexToNumber(PALETTE.panelBorder));

    // Fear Bar Fill
    const fearFillW = Math.max(2, Math.round((barWidth * this.currentFearScore) / 100));
    this.add
      .rectangle(barX, 105, fearFillW, barHeight - 2, hexToNumber(PALETTE.danger))
      .setOrigin(0, 0.5);

    this.add.text(barX + barWidth + 6, 101, `${this.currentFearScore}%`, {
      fontSize: '7px',
      color: PALETTE.danger,
      fontFamily: 'monospace',
    });

    // Baseline Indicators (vertical tick marks if baseline ready)
    if (baseline.status === 'ready') {
      const baseGreedScore = normalizeMetricScore(baseline.meanGreedRaw);
      const baseFearScore = normalizeMetricScore(baseline.meanFearRaw);

      // Greed baseline tick
      const bgX = barX + Math.round((barWidth * baseGreedScore) / 100);
      this.add
        .rectangle(bgX, 87, 2, barHeight + 4, hexToNumber(PALETTE.focus))
        .setOrigin(0.5);

      // Fear baseline tick
      const bfX = barX + Math.round((barWidth * baseFearScore) / 100);
      this.add
        .rectangle(bfX, 105, 2, barHeight + 4, hexToNumber(PALETTE.focus))
        .setOrigin(0.5);

      this.add
        .text(
          width / 2,
          123,
          t('mirror.baseline_avg', {
            greed: baseGreedScore,
            fear: baseFearScore,
          }),
          {
            fontSize: '6px',
            color: PALETTE.textDim,
            fontFamily: 'monospace',
          }
        )
        .setOrigin(0.5);
    } else {
      this.add
        .text(
          width / 2,
          123,
          t('mirror.baseline_forming', { current: baseline.runCount }),
          {
            fontSize: '6px',
            color: PALETTE.focus,
            fontFamily: 'monospace',
          }
        )
        .setOrigin(0.5);
    }

    // 3. Mandatory Disclaimer
    this.add
      .text(width / 2, 142, t('mirror.disclaimer'), {
        fontSize: '5.5px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // 4. Action Buttons
    // Share Card Button
    const shareBtn = this.add
      .text(65, 160, t('mirror.share_btn'), {
        fontSize: '7px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    shareBtn.on('pointerdown', () => {
      this.exportLocalShareCard();
    });

    // Return to Menu Prompt
    const returnPrompt = this.add
      .text(220, 160, t('mirror.return_prompt'), {
        fontSize: '7px',
        color: PALETTE.text,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: returnPrompt,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    const returnToMenu = () => {
      this.scene.start('MenuScene');
    };

    returnPrompt.on('pointerdown', returnToMenu);
    this.input.keyboard?.on('keydown-ESC', returnToMenu);
    this.input.keyboard?.on('keydown-SPACE', returnToMenu);
    this.input.keyboard?.on('keydown-ENTER', returnToMenu);
    this.input.keyboard?.on('keydown-S', () => {
      this.exportLocalShareCard();
    });
  }

  /**
   * Generates and downloads a 320x180 local share card image via an offscreen HTML canvas.
   * Strictly client-side, zero network calls.
   */
  public exportLocalShareCard(): void {
    if (typeof document === 'undefined') return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark background
      ctx.fillStyle = '#0e0d13';
      ctx.fillRect(0, 0, 640, 360);

      // Border
      ctx.strokeStyle = '#423c4a';
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, 624, 344);

      // Title
      ctx.fillStyle = '#e8c170';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DEEPER — THE PSYCHOLOGICAL MIRROR', 320, 45);

      // Archetype Card Box
      ctx.fillStyle = '#1c1b24';
      ctx.fillRect(40, 70, 560, 90);
      ctx.strokeStyle = '#e8c170';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 70, 560, 90);

      // Archetype Title & Description
      ctx.fillStyle = '#ffd541';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(t(this.currentArchetype.name_key).toUpperCase(), 320, 100);

      ctx.fillStyle = '#dcd8e0';
      ctx.font = '13px monospace';
      ctx.fillText(t(this.currentArchetype.desc_key), 320, 125);

      ctx.fillStyle = '#7accd7';
      ctx.font = 'italic 12px monospace';
      ctx.fillText(`"${this.observationText}"`, 320, 146);

      // Bars
      const drawBar = (y: number, label: string, score: number, color: string) => {
        ctx.fillStyle = color;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(label, 60, y + 16);

        ctx.fillStyle = '#0e0d13';
        ctx.fillRect(160, y, 360, 22);
        ctx.strokeStyle = '#423c4a';
        ctx.lineWidth = 2;
        ctx.strokeRect(160, y, 360, 22);

        ctx.fillStyle = color;
        const fillW = Math.max(4, Math.round((360 * score) / 100));
        ctx.fillRect(161, y + 1, fillW - 2, 20);

        ctx.fillStyle = color;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${score}%`, 535, y + 16);
      };

      drawBar(180, t('mirror.greed_label'), this.currentGreedScore, '#e8c170');
      drawBar(220, t('mirror.fear_label'), this.currentFearScore, '#cf573c');

      // Disclaimer
      ctx.fillStyle = '#726d7d';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(t('mirror.disclaimer'), 320, 285);

      ctx.fillStyle = '#ffd541';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('https://github.com/but-cmyk/web_game_F', 320, 320);

      // Trigger local download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `deeper-mirror-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.warn('Share card export skipped or failed:', err);
    }
  }
}
