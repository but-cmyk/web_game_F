/**
 * RunScene for DEEPER.
 * Main roguelike exploration scene: dungeon floor rendering, player movement,
 * gold collection, multi-floor descent, extraction stations, and camera tracking.
 */

import Phaser from 'phaser';
import { Rng } from '../core/rng';
import { generateDungeon, DungeonFloor } from '../core/mapgen';
import { EventBus } from '../core/events';
import { TurnResolver, DungeonState, PlayerAction } from '../core/turn';
import { FogOfWar, createFogOfWar, updateFogOfWar, computeFOV } from '../core/fov';
import { toIndex } from '../core/grid';
import { spawnGoldPiles } from '../core/loot';
import { DungeonRenderer, TILE_SIZE } from '../views/DungeonRenderer';
import { defaultSaveStore } from '../services/SaveStore';
import { PALETTE, hexToNumber } from '../utils/palette';
import { t } from '../i18n';

export interface RunSceneData {
  readonly seed?: number;
  readonly depth?: number;
  readonly bankedGold?: number;
}

export class RunScene extends Phaser.Scene {
  private rng!: Rng;
  private floor!: DungeonFloor;
  private eventBus!: EventBus;
  private state!: DungeonState;
  private fog!: FogOfWar;
  private dungeonRenderer!: DungeonRenderer;
  private playerSprite!: Phaser.GameObjects.Image;

  // HUD elements
  private hpText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private depthText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  private fpsText!: Phaser.GameObjects.Text;

  // Touch gesture state
  private pointerDownX = 0;
  private pointerDownY = 0;

  constructor() {
    super({ key: 'RunScene' });
  }

  create(data?: RunSceneData): void {
    const seed = data?.seed ?? Date.now();
    const depth = data?.depth ?? 1;
    const bankedGold = data?.bankedGold ?? defaultSaveStore.load().bankedGold;

    this.rng = new Rng(seed);
    this.floor = generateDungeon(this.rng, depth);
    const goldPiles = spawnGoldPiles(this.floor, depth, this.rng);
    this.eventBus = new EventBus();

    this.state = {
      floor: this.floor,
      playerPos: { ...this.floor.entrance },
      movementMode: 'walk',
      turnCount: 0,
      depth,
      hp: 2,
      carriedGold: 0,
      bankedGold,
      goldPiles,
      isExtracted: false,
      isDead: false,
      eventBus: this.eventBus,
    };

    this.fog = createFogOfWar(this.floor.width, this.floor.height);
    this.dungeonRenderer = new DungeonRenderer(this, this.floor);
    this.playerSprite = this.dungeonRenderer.createPlayerSprite(
      this.state.playerPos.x,
      this.state.playerPos.y
    );

    // Initial FOV and gold sync
    this.recomputeFOV();
    this.dungeonRenderer.syncGoldPiles(this.state.goldPiles, this.fog);

    // Setup Camera
    this.setupCamera();

    // Setup HUD
    this.setupHUD();

    // Setup Keyboard & Touch Input
    this.setupInput();

    // Listen to RunEnded event to transition to SummaryScene
    this.eventBus.on('RunEnded', (payload) => {
      const currentSave = defaultSaveStore.load();
      const updatedSave = {
        ...currentSave,
        bankedGold: this.state.bankedGold,
        runsCompleted: currentSave.runsCompleted + (payload.outcome === 'extracted' ? 1 : 0),
        deaths: currentSave.deaths + (payload.outcome === 'died' ? 1 : 0),
      };
      defaultSaveStore.save(updatedSave);

      this.time.delayedCall(400, () => {
        this.scene.start('SummaryScene', {
          outcome: payload.outcome,
          depth: payload.depth,
          bankedGoldAdded: payload.bankedGold,
          lostGold: payload.lostGold,
          totalBanked: this.state.bankedGold,
        });
      });
    });
  }

  private setupCamera(): void {
    const cam = this.cameras.main;
    const worldW = this.floor.width * TILE_SIZE;
    const worldH = this.floor.height * TILE_SIZE;

    cam.setBounds(0, 0, worldW, worldH);
    cam.startFollow(this.playerSprite, true, 0.15, 0.15);
    cam.setBackgroundColor(hexToNumber(PALETTE.background));
  }

  private setupHUD(): void {
    // HUD Top Banner
    this.add
      .rectangle(0, 0, 320, 14, hexToNumber(PALETTE.background), 0.85)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(100);

    // HP indicator (left)
    this.hpText = this.add
      .text(8, 3, t('hud.hp', { hp: this.state.hp }).toUpperCase(), {
        fontSize: '8px',
        color: PALETTE.danger,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(101);

    // Carried Gold indicator
    this.goldText = this.add
      .text(54, 3, t('hud.carried_gold', { gold: this.state.carriedGold }).toUpperCase(), {
        fontSize: '8px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(101);

    // Depth indicator
    this.depthText = this.add
      .text(122, 3, t('hud.depth', { depth: this.state.depth }).toUpperCase(), {
        fontSize: '8px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(101);

    // Turn indicator
    this.turnText = this.add
      .text(182, 3, t('hud.turn', { turn: this.state.turnCount }).toUpperCase(), {
        fontSize: '8px',
        color: PALETTE.text,
        fontFamily: 'monospace',
      })
      .setScrollFactor(0)
      .setDepth(101);

    // FPS counter (upper-right)
    this.fpsText = this.add
      .text(320 - 46, 3, t('hud.fps', { fps: 60 }), {
        fontSize: '8px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
      })
      .setScrollFactor(0)
      .setDepth(101);

    // Mobile / Keyboard Hint (lower center, subtle)
    this.add
      .text(160, 172, t('hud.controls_hint'), {
        fontSize: '7px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);
  }

  private updateHUD(): void {
    this.hpText.setText(t('hud.hp', { hp: this.state.hp }).toUpperCase());
    this.goldText.setText(t('hud.carried_gold', { gold: this.state.carriedGold }).toUpperCase());
    this.depthText.setText(t('hud.depth', { depth: this.state.depth }).toUpperCase());
    this.turnText.setText(t('hud.turn', { turn: this.state.turnCount }).toUpperCase());
  }

  private setupInput(): void {
    // Keyboard listener
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
        let action: PlayerAction | null = null;
        switch (event.code) {
          case 'KeyW':
          case 'ArrowUp':
            action = { type: 'MOVE', direction: 'N' };
            break;
          case 'KeyS':
          case 'ArrowDown':
            action = { type: 'MOVE', direction: 'S' };
            break;
          case 'KeyA':
          case 'ArrowLeft':
            action = { type: 'MOVE', direction: 'W' };
            break;
          case 'KeyD':
          case 'ArrowRight':
            action = { type: 'MOVE', direction: 'E' };
            break;
          case 'Space':
          case 'Numpad5': {
            const isAtStairs =
              this.state.playerPos.x === this.floor.stairsDown.x &&
              this.state.playerPos.y === this.floor.stairsDown.y;
            const station = this.floor.extractionStation;
            const isAtStation =
              station !== undefined &&
              this.state.playerPos.x === station.x &&
              this.state.playerPos.y === station.y;

            if (isAtStation) {
              action = { type: 'EXTRACT' };
            } else if (isAtStairs) {
              action = { type: 'DESCEND' };
            } else {
              action = { type: 'WAIT' };
            }
            break;
          }
        }

        if (action) {
          this.stepAction(action);
        }
      });
    }

    // Touch swipe listener
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.pointerDownX = pointer.x;
      this.pointerDownY = pointer.y;
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const dx = pointer.x - this.pointerDownX;
      const dy = pointer.y - this.pointerDownY;
      const dist = Math.hypot(dx, dy);

      // Swipe detection threshold: 20 pixels
      if (dist >= 20) {
        let action: PlayerAction | null = null;
        if (Math.abs(dx) > Math.abs(dy)) {
          action = { type: 'MOVE', direction: dx > 0 ? 'E' : 'W' };
        } else {
          action = { type: 'MOVE', direction: dy > 0 ? 'S' : 'N' };
        }
        this.stepAction(action);
      } else {
        // Tap on player or current tile: check if stairs or extraction station
        const isAtStairs =
          this.state.playerPos.x === this.floor.stairsDown.x &&
          this.state.playerPos.y === this.floor.stairsDown.y;
        const station = this.floor.extractionStation;
        const isAtStation =
          station !== undefined &&
          this.state.playerPos.x === station.x &&
          this.state.playerPos.y === station.y;

        if (isAtStation) {
          this.stepAction({ type: 'EXTRACT' });
        } else if (isAtStairs) {
          this.stepAction({ type: 'DESCEND' });
        }
      }
    });
  }

  public stepAction(action: PlayerAction): void {
    const result = TurnResolver.step(this.state, action);

    if (result.advancedFloor) {
      this.advanceToNextFloor();
      return;
    }

    if (result.consumedTurn) {
      this.dungeonRenderer.updatePlayerPosition(this.state.playerPos.x, this.state.playerPos.y);
      this.recomputeFOV();
      this.dungeonRenderer.syncGoldPiles(this.state.goldPiles, this.fog);
      this.updateHUD();
    }
  }

  public advanceToNextFloor(): void {
    this.state.depth += 1;
    this.rng = this.rng.fork('depth_' + this.state.depth);
    this.floor = generateDungeon(this.rng, this.state.depth);
    this.state.floor = this.floor;
    this.state.playerPos = { ...this.floor.entrance };
    this.state.goldPiles = spawnGoldPiles(this.floor, this.state.depth, this.rng);

    this.fog = createFogOfWar(this.floor.width, this.floor.height);
    this.dungeonRenderer.destroy();
    this.dungeonRenderer = new DungeonRenderer(this, this.floor);
    this.playerSprite = this.dungeonRenderer.createPlayerSprite(
      this.state.playerPos.x,
      this.state.playerPos.y
    );

    this.setupCamera();
    this.recomputeFOV();
    this.dungeonRenderer.syncGoldPiles(this.state.goldPiles, this.fog);
    this.updateHUD();
  }

  private recomputeFOV(): void {
    const radius = 5; // Base lantern radius for M2/M3
    const isOpaque = (c: { x: number; y: number }) => {
      const idx = toIndex(c.x, c.y, this.floor.width);
      return this.floor.tiles[idx] === 'WALL';
    };

    const visibleTiles = computeFOV(
      this.state.playerPos,
      radius,
      isOpaque,
      this.floor.width,
      this.floor.height
    );

    updateFogOfWar(this.fog, visibleTiles);
    this.dungeonRenderer.updateLighting(this.fog);
  }

  override update(): void {
    const fps = Math.round(this.game.loop.actualFps);
    this.fpsText.setText(t('hud.fps', { fps }));
  }

  /**
   * Helper accessor for integration / smoke testing.
   */
  public getState(): Readonly<DungeonState> {
    return this.state;
  }
}
