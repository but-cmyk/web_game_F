/**
 * Interactive Tutorial Scene for DEEPER.
 * Provides a 3-minute guided interactive tutorial on a scripted, pre-authored floor.
 * Teaches movement, noise rings & modes (Sneak/Walk/Run), lamp oil & Dread, chest opening, and extraction.
 * Fully skippable at any time via [ESC] or on-screen button.
 */

import Phaser from 'phaser';
import { DungeonFloor } from '../core/mapgen';
import { createTutorialFloor, evaluateTutorialProgress, TutorialStage, TutorialState } from '../core/tutorial';
import { TurnResolver, DungeonState, PlayerAction } from '../core/turn';
import { Direction, toIndex } from '../core/grid';
import { EventBus } from '../core/events';
import { createFogOfWar, updateFogOfWar, computeFOV, FogOfWar } from '../core/fov';
import { calculateLightRadius } from '../core/fear';
import { DungeonRenderer } from '../views/DungeonRenderer';
import { defaultAudioDirector } from '../audio/AudioDirector';
import { defaultSaveStore } from '../services/SaveStore';
import { PALETTE, hexToNumber } from '../utils/palette';
import { t } from '../i18n';

export class TutorialScene extends Phaser.Scene {
  private floor!: DungeonFloor;
  private state!: DungeonState;
  private fog!: FogOfWar;
  private dungeonRenderer!: DungeonRenderer;
  private playerSprite!: Phaser.GameObjects.Image;
  private eventBus!: EventBus;

  private tutorialState!: TutorialState;
  private currentStage!: TutorialStage;
  private bannerText!: Phaser.GameObjects.Text;
  private stageSubtext!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'TutorialScene' });
  }

  create(): void {
    const { width } = this.scale;

    this.floor = createTutorialFloor();
    this.eventBus = new EventBus();

    this.tutorialState = {
      stepsTaken: 0,
      modeChanged: false,
      oilCollected: false,
      chestOpened: false,
      extracted: false,
    };
    this.currentStage = 'MOVE_BASICS';

    this.state = {
      floor: this.floor,
      playerPos: { ...this.floor.entrance },
      movementMode: 'walk',
      turnCount: 0,
      depth: 1,
      hp: 2,
      carriedGold: 0,
      bankedGold: 0,
      oil: 100,
      maxOil: 100,
      dread: 0,
      goldPiles: [{ id: 'tut_gold_1', x: 17, y: 5, amount: 25 }],
      oilFlasks: [{ id: 'tut_oil_1', x: 15, y: 5, amount: 15 }],
      chests: [{ id: 'tut_chest_1', x: 22, y: 12, goldValue: 50, isOpen: false, isCursed: false }],
      isExtracted: false,
      isDead: false,
      eventBus: this.eventBus,
      playerHistory: [{ ...this.floor.entrance }],
    };

    this.fog = createFogOfWar(this.floor.width, this.floor.height);
    this.dungeonRenderer = new DungeonRenderer(this, this.floor);

    this.playerSprite = this.dungeonRenderer.createPlayerSprite(
      this.state.playerPos.x,
      this.state.playerPos.y
    );

    this.cameras.main.startFollow(this.playerSprite, true, 0.15, 0.15);
    this.cameras.main.setBounds(0, 0, this.floor.width * 16, this.floor.height * 16);

    this.recomputeFOV();
    this.dungeonRenderer.syncGoldPiles(this.state.goldPiles, this.fog);
    this.dungeonRenderer.syncOilFlasks(this.state.oilFlasks, this.fog);
    this.dungeonRenderer.syncChests(this.state.chests ?? [], this.fog);

    // Audio and Event Wiring
    this.eventBus.on('GoldPicked', () => {
      defaultAudioDirector.playGoldChime();
    });

    this.eventBus.on('OilPicked', () => {
      defaultAudioDirector.playOilChime();
      this.tutorialState.oilCollected = true;
      this.checkStageProgression();
    });

    this.eventBus.on('ChestOpened', () => {
      defaultAudioDirector.playGoldChime();
      this.tutorialState.chestOpened = true;
      this.checkStageProgression();
    });

    // 1. HUD & Instructional Banners (Fixed to Screen)
    const hudContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(200);

    // Banner Background
    const bannerBg = this.add
      .rectangle(width / 2, 14, 280, 24, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.goldAccent));

    this.bannerText = this.add
      .text(width / 2, 9, t('tutorial.stage_move'), {
        fontSize: '7.5px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.stageSubtext = this.add
      .text(width / 2, 19, 'Bước 1/5: Làm quen với chuyển động hầm ngục', {
        fontSize: '6px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Skip Button (Top Right)
    const skipBtn = this.add
      .text(width - 24, 8, t('tutorial.skip_btn'), {
        fontSize: '6.5px',
        color: PALETTE.danger,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    skipBtn.on('pointerdown', () => this.completeTutorial(true));

    hudContainer.add([bannerBg, this.bannerText, this.stageSubtext, skipBtn]);

    // Input Wiring
    this.setupInputs();
  }

  private setupInputs(): void {
    if (!this.input.keyboard) return;

    // Movement directions
    const dirMap: Record<string, Direction> = {
      UP: 'N',
      DOWN: 'S',
      LEFT: 'W',
      RIGHT: 'E',
      W: 'N',
      S: 'S',
      A: 'W',
      D: 'E',
    };

    for (const [key, dir] of Object.entries(dirMap)) {
      this.input.keyboard.on(`keydown-${key}`, () => {
        this.stepAction({ type: 'MOVE', direction: dir });
      });
    }

    // Modes: Z (sneak), X (walk), C (run)
    this.input.keyboard.on('keydown-Z', () => {
      this.setMode('sneak');
    });
    this.input.keyboard.on('keydown-X', () => {
      this.setMode('walk');
    });
    this.input.keyboard.on('keydown-C', () => {
      this.setMode('run');
    });

    // Skip with ESC
    this.input.keyboard.on('keydown-ESC', () => {
      this.completeTutorial(true);
    });
  }

  private setMode(mode: 'sneak' | 'walk' | 'run'): void {
    this.state.movementMode = mode;
    this.tutorialState.modeChanged = true;
    defaultAudioDirector.playFootstep(mode);
    this.checkStageProgression();
  }

  private stepAction(action: PlayerAction): void {
    if (this.currentStage === 'COMPLETED') return;

    const res = TurnResolver.step(this.state, action);

    if (res.consumedTurn) {
      this.tutorialState.stepsTaken += 1;
      this.dungeonRenderer.updatePlayerPosition(this.state.playerPos.x, this.state.playerPos.y);
      this.recomputeFOV();
      this.dungeonRenderer.syncGoldPiles(this.state.goldPiles, this.fog);
      this.dungeonRenderer.syncOilFlasks(this.state.oilFlasks, this.fog);
      this.dungeonRenderer.syncChests(this.state.chests ?? [], this.fog);

      // Check auto chest interaction when stepped onto or adjacent
      if (this.state.chests) {
        for (const chest of this.state.chests) {
          if (!chest.isOpen && chest.x === this.state.playerPos.x && chest.y === this.state.playerPos.y) {
            TurnResolver.step(this.state, { type: 'OPEN_CHEST', chestId: chest.id });
          }
        }
      }

      // Check extraction station
      const st = this.floor.extractionStation;
      if (st && this.state.playerPos.x === st.x && this.state.playerPos.y === st.y) {
        this.tutorialState.extracted = true;
      }

      this.checkStageProgression();
    }
  }

  private checkStageProgression(): void {
    const nextStage = evaluateTutorialProgress(this.currentStage, this.state.playerPos, this.tutorialState);
    if (nextStage !== this.currentStage) {
      this.currentStage = nextStage;
      this.updateBanner();

      if (this.currentStage === 'COMPLETED') {
        this.completeTutorial(false);
      }
    }
  }

  private updateBanner(): void {
    switch (this.currentStage) {
      case 'MOVE_BASICS':
        this.bannerText.setText(t('tutorial.stage_move'));
        this.stageSubtext.setText('Bước 1/5: Dùng phím Mũi tên hoặc WASD để di chuyển');
        break;
      case 'MOVEMENT_MODES':
        this.bannerText.setText(t('tutorial.stage_modes'));
        this.stageSubtext.setText('Bước 2/5: Nhấn [Z] Rón rén, [X] Đi bộ, hoặc [C] Chạy');
        break;
      case 'OIL_AND_DREAD':
        this.bannerText.setText(t('tutorial.stage_oil'));
        this.stageSubtext.setText('Bước 3/5: Tiến về phía trước nhặt bình dầu');
        break;
      case 'OPEN_CHEST':
        this.bannerText.setText(t('tutorial.stage_chest'));
        this.stageSubtext.setText('Bước 4/5: Tiến về căn phòng phía nam mở rương gỗ');
        break;
      case 'EXTRACTION':
        this.bannerText.setText(t('tutorial.stage_extract'));
        this.stageSubtext.setText('Bước 5/5: Bước vào Trạm Khai Thác màu vàng để thoát');
        break;
      case 'COMPLETED':
        this.bannerText.setText(t('tutorial.stage_completed'));
        this.stageSubtext.setText('Hoàn thành! Đang trở về menu...');
        break;
    }
  }

  private completeTutorial(skipped: boolean): void {
    const save = defaultSaveStore.load();
    defaultSaveStore.save({
      ...save,
      hasCompletedTutorial: true,
    });

    if (!skipped) {
      defaultAudioDirector.playGoldChime();
    }

    this.time.delayedCall(skipped ? 0 : 1200, () => {
      this.scene.start('MenuScene');
    });
  }

  private recomputeFOV(): void {
    const lightRadius = calculateLightRadius(this.state.oil, this.state.maxOil, this.state.dread);
    const isOpaque = (c: { x: number; y: number }) => {
      const idx = toIndex(c.x, c.y, this.floor.width);
      return this.floor.tiles[idx] === 'WALL';
    };
    const visibleTiles = computeFOV(
      this.state.playerPos,
      lightRadius,
      isOpaque,
      this.floor.width,
      this.floor.height
    );
    updateFogOfWar(this.fog, visibleTiles);
    this.dungeonRenderer.updateLighting(this.fog);
  }
}
