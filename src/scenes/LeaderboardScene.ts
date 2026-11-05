/**
 * LeaderboardScene for DEEPER (§5 M10).
 * Displays survivor hall of fame ranked by depth reached and runs survived.
 * Strictly compliant with §4.10 & §4.11 Rule 3: gold greed is never used to rank survivors.
 */

import Phaser from 'phaser';
import { defaultSaveStore } from '../services/SaveStore';
import { LocalRemoteStore, SurvivorRecord } from '../services/RemoteStore';
import { SupabaseRemoteStore } from '../services/SupabaseRemoteStore';
import { PALETTE, hexToNumber } from '../utils/palette';
import { t } from '../i18n';

export class LeaderboardScene extends Phaser.Scene {
  private survivors: readonly SurvivorRecord[] = [];

  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Dark Background
    this.add.rectangle(0, 0, width, height, hexToNumber(PALETTE.background)).setOrigin(0);

    // Title
    this.add
      .text(width / 2, 14, t('leaderboard.title'), {
        fontSize: '10px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle / Ethical ranking rule indicator
    this.add
      .text(width / 2, 25, t('leaderboard.subtitle').toUpperCase(), {
        fontSize: '5.5px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Divider line
    this.add
      .rectangle(width / 2, 33, 290, 1, hexToNumber(PALETTE.panelBorder))
      .setOrigin(0.5);

    // Back to Menu Button
    const backBtn = this.add
      .rectangle(width / 2, height - 14, 150, 16, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.focus))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, height - 14, t('leaderboard.back_btn').toUpperCase(), {
        fontSize: '6.5px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const returnToMenu = () => {
      this.scene.start('MenuScene');
    };

    backBtn.on('pointerdown', returnToMenu);

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' ||
        event.key === ' ' ||
        event.key === 'Enter' ||
        event.key === 'l' ||
        event.key === 'L'
      ) {
        returnToMenu();
      }
    });

    this.loadAndRenderSurvivors(width, height);
  }

  private async loadAndRenderSurvivors(width: number, height: number): Promise<void> {
    const save = defaultSaveStore.load();
    const localStore = new LocalRemoteStore(save.survivors ?? []);
    const remoteStore = new SupabaseRemoteStore('', '', localStore);

    try {
      this.survivors = await remoteStore.fetchTopSurvivors(8);
    } catch {
      this.survivors = await localStore.fetchTopSurvivors(8);
    }

    this.renderTable(width, height);
  }

  private renderTable(width: number, height: number): void {
    const tableHeaderY = 42;
    const colRank = 24;
    const colName = 65;
    const colDepth = 150;
    const colRuns = 205;
    const colArchetype = 265;

    // Table Header
    this.add
      .text(colRank, tableHeaderY, t('leaderboard.col_rank'), {
        fontSize: '6px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(colName, tableHeaderY, t('leaderboard.col_player'), {
        fontSize: '6px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    this.add
      .text(colDepth, tableHeaderY, t('leaderboard.col_depth'), {
        fontSize: '6px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(colRuns, tableHeaderY, t('leaderboard.col_survived'), {
        fontSize: '6px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(colArchetype, tableHeaderY, t('leaderboard.col_archetype'), {
        fontSize: '6px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Header divider line
    this.add
      .rectangle(width / 2, tableHeaderY + 7, 280, 1, hexToNumber(PALETTE.panelBorder))
      .setOrigin(0.5);

    if (this.survivors.length === 0) {
      this.add
        .text(width / 2, height / 2 + 10, t('leaderboard.empty'), {
          fontSize: '6.5px',
          color: PALETTE.textDim,
          fontFamily: 'monospace',
          wordWrap: { width: 260 },
          align: 'center',
        })
        .setOrigin(0.5);
      return;
    }

    const rowStartY = 57;
    const rowGap = 12;

    this.survivors.forEach((record, idx) => {
      const y = rowStartY + idx * rowGap;
      const rankColor =
        idx === 0
          ? PALETTE.goldHighlight
          : idx === 1
            ? PALETTE.goldAccent
            : idx === 2
              ? PALETTE.focus
              : PALETTE.textDim;

      // Rank
      this.add
        .text(colRank, y, `#${idx + 1}`, {
          fontSize: '6.5px',
          color: rankColor,
          fontFamily: 'monospace',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      // Player / Anonymous Name
      this.add
        .text(colName, y, record.playerName, {
          fontSize: '6.5px',
          color: PALETTE.text,
          fontFamily: 'monospace',
        })
        .setOrigin(0, 0.5);

      // Depth
      this.add
        .text(colDepth, y, `D:${record.depthReached}`, {
          fontSize: '6.5px',
          color: PALETTE.goldHighlight,
          fontFamily: 'monospace',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      // Runs Survived
      this.add
        .text(colRuns, y, `${record.runsSurvived}x`, {
          fontSize: '6.5px',
          color: PALETTE.focus,
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);

      // Archetype (abbreviated if long)
      const archText = record.archetypeId.length > 12 ? record.archetypeId.slice(0, 11) + '…' : record.archetypeId;
      this.add
        .text(colArchetype, y, archText, {
          fontSize: '6px',
          color: PALETTE.textDim,
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);
    });
  }
}
