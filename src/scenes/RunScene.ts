/**
 * RunScene for DEEPER.
 * Main roguelike exploration scene: dungeon floor rendering, player movement,
 * fear & oil mechanics, noise waves, gold collection, and camera tracking.
 */

import Phaser from 'phaser';
import { Rng } from '../core/rng';
import { generateDungeon, DungeonFloor } from '../core/mapgen';
import { EventBus } from '../core/events';
import { TurnResolver, DungeonState, PlayerAction, MovementMode } from '../core/turn';
import { FogOfWar, createFogOfWar, updateFogOfWar, computeFOV } from '../core/fov';
import { toIndex } from '../core/grid';
import { spawnGoldPiles, spawnOilFlasks } from '../core/loot';
import { spawnMonsters } from '../core/monsters';
import { calculateLightRadius } from '../core/fear';
import { DungeonRenderer, TILE_SIZE } from '../views/DungeonRenderer';
import { PostFX } from '../views/PostFX';
import { defaultAudioDirector } from '../audio/AudioDirector';
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
  private postFX!: PostFX;
  private playerSprite!: Phaser.GameObjects.Image;

  // HUD elements
  private hpText!: Phaser.GameObjects.Text;
  private oilText!: Phaser.GameObjects.Text;
  private dreadText!: Phaser.GameObjects.Text;
  private modeText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private depthText!: Phaser.GameObjects.Text;
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
    const oilFlasks = spawnOilFlasks(this.floor, depth, this.rng);
    const monsters = spawnMonsters(this.floor, depth, this.rng);
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
      oil: 100,
      maxOil: 100,
      dread: 0,
      goldPiles,
      oilFlasks,
      monsters,
      hallucinations: [],
      playerInvulnerableTurns: 0,
      playerHistory: [{ ...this.floor.entrance }],
      isExtracted: false,
      isDead: false,
      eventBus: this.eventBus,
      rng: this.rng,
    };

    this.fog = createFogOfWar(this.floor.width, this.floor.height);
    this.dungeonRenderer = new DungeonRenderer(this, this.floor);
    const reduceMotion =
      defaultSaveStore.load().reduceMotion ??
      (typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) ??
      false;
    this.postFX = new PostFX(this, reduceMotion);
    this.playerSprite = this.dungeonRenderer.createPlayerSprite(
      this.state.playerPos.x,
      this.state.playerPos.y
    );

    // Initial FOV and entity sync
    this.recomputeFOV();
    this.dungeonRenderer.syncGoldPiles(this.state.goldPiles, this.fog);
    this.dungeonRenderer.syncOilFlasks(this.state.oilFlasks, this.fog);
    this.dungeonRenderer.syncMonsters(this.state.monsters ?? [], this.fog);
    this.dungeonRenderer.syncHallucinations(this.state.hallucinations ?? [], this.fog);

    // Setup presentation, HUD, controls, and audio listeners
    this.setupCamera();
    this.setupHUD();
    this.setupInput();
    this.setupAudioAndEvents();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.postFX.destroy();
      this.dungeonRenderer.destroy();
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

  private setupAudioAndEvents(): void {
    const unlockAudio = () => {
      defaultAudioDirector.unlock();
    };
    this.input.once('pointerdown', unlockAudio);
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown', unlockAudio);
    }

    this.eventBus.on('StepTaken', (payload) => {
      defaultAudioDirector.playFootstep(payload.mode);
    });

    this.eventBus.on('GoldPicked', () => {
      defaultAudioDirector.playGoldChime();
    });

    this.eventBus.on('OilPicked', () => {
      defaultAudioDirector.playOilChime();
    });

    this.eventBus.on('NoiseEmitted', (payload) => {
      this.postFX.spawnNoiseRipple(
        payload.x * TILE_SIZE + TILE_SIZE / 2,
        payload.y * TILE_SIZE + TILE_SIZE / 2,
        payload.radius
      );
    });

    this.eventBus.on('DreadChanged', (payload) => {
      defaultAudioDirector.updateDread(payload.newDread);
      this.postFX.updateDread(payload.newDread);
      if (payload.newDread >= 70 && payload.newDread > payload.oldDread) {
        this.postFX.triggerHeartbeatPulse();
      }
    });

    this.eventBus.on('MonsterStateChanged', (payload) => {
      if (payload.newState === 'CHASE' || payload.newState === 'SUSPICIOUS') {
        defaultAudioDirector.playMonsterAlert(payload.newState);
      } else if (payload.newState === 'HOWL') {
        defaultAudioDirector.playListenerHowl();
      }
    });

    this.eventBus.on('MonsterAlerted', (payload) => {
      defaultAudioDirector.playMonsterAlert(payload.state);
    });

    this.eventBus.on('MonsterAttacked', () => {
      defaultAudioDirector.playPlayerHurt();
      const reduceMotion = defaultSaveStore.load().reduceMotion;
      if (!reduceMotion) {
        this.cameras.main.shake(120, 0.008);
      }
      this.tweens.add({
        targets: this.playerSprite,
        alpha: 0.2,
        duration: 60,
        yoyo: true,
        repeat: 1,
      });
    });

    this.eventBus.on('HallucinationEvaporated', () => {
      defaultAudioDirector.playHallucinationEvaporation();
    });

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

  private setupHUD(): void {
    // Top banner panel
    this.add
      .rectangle(0, 0, 320, 14, hexToNumber(PALETTE.background), 0.85)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(100);

    // HP indicator
    this.hpText = this.add
      .text(4, 3, t('hud.hp', { hp: this.state.hp }).toUpperCase(), {
        fontSize: '7px',
        color: PALETTE.danger,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(101);

    // Oil indicator
    this.oilText = this.add
      .text(38, 3, t('hud.oil', { oil: Math.round(this.state.oil) }).toUpperCase(), {
        fontSize: '7px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(101);

    // Dread indicator
    this.dreadText = this.add
      .text(88, 3, t('hud.dread', { dread: this.state.dread }).toUpperCase(), {
        fontSize: '7px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(101);

    // Movement mode indicator (clickable/tappable to cycle modes)
    const modeKey = `hud.mode_${this.state.movementMode}`;
    this.modeText = this.add
      .text(142, 3, t('hud.mode', { mode: t(modeKey) }).toUpperCase(), {
        fontSize: '7px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(101)
      .setInteractive({ useHandCursor: true });

    this.modeText.on('pointerdown', () => {
      this.cycleMovementMode();
    });

    // Carried Gold indicator
    this.goldText = this.add
      .text(206, 3, t('hud.carried_gold', { gold: this.state.carriedGold }).toUpperCase(), {
        fontSize: '7px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(101);

    // Depth indicator
    this.depthText = this.add
      .text(250, 3, t('hud.depth', { depth: this.state.depth }).toUpperCase(), {
        fontSize: '7px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(101);

    // FPS counter
    this.fpsText = this.add
      .text(288, 3, t('hud.fps', { fps: 60 }), {
        fontSize: '7px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
      })
      .setScrollFactor(0)
      .setDepth(101);

    // Controls Hint (bottom center)
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

  private cycleMovementMode(): void {
    const nextMode: Record<MovementMode, MovementMode> = {
      sneak: 'walk',
      walk: 'run',
      run: 'sneak',
    };
    this.stepAction({ type: 'SET_MODE', mode: nextMode[this.state.movementMode] });
  }

  private updateHUD(): void {
    this.hpText.setText(t('hud.hp', { hp: this.state.hp }).toUpperCase());

    const oilVal = Math.max(0, Math.round(this.state.oil));
    this.oilText.setText(t('hud.oil', { oil: oilVal }).toUpperCase());
    if (oilVal <= 20) {
      this.oilText.setColor(PALETTE.danger);
    } else if (oilVal <= 50) {
      this.oilText.setColor(PALETTE.goldAccent);
    } else {
      this.oilText.setColor(PALETTE.goldHighlight);
    }

    this.dreadText.setText(t('hud.dread', { dread: this.state.dread }).toUpperCase());
    if (this.state.dread >= 70) {
      this.dreadText.setColor(PALETTE.danger);
    } else if (this.state.dread >= 40) {
      this.dreadText.setColor(PALETTE.goldAccent);
    } else {
      this.dreadText.setColor(PALETTE.textDim);
    }

    const modeKey = `hud.mode_${this.state.movementMode}`;
    this.modeText.setText(t('hud.mode', { mode: t(modeKey) }).toUpperCase());
    this.goldText.setText(t('hud.carried_gold', { gold: this.state.carriedGold }).toUpperCase());
    this.depthText.setText(t('hud.depth', { depth: this.state.depth }).toUpperCase());

    if ((this.state.playerInvulnerableTurns ?? 0) > 0) {
      this.playerSprite.setAlpha(0.65);
    } else {
      this.playerSprite.setAlpha(1.0);
    }
  }

  private setupInput(): void {
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
          case 'KeyZ':
            action = { type: 'SET_MODE', mode: 'sneak' };
            break;
          case 'KeyX':
            action = { type: 'SET_MODE', mode: 'walk' };
            break;
          case 'KeyC':
            action = { type: 'SET_MODE', mode: 'run' };
            break;
          case 'ShiftLeft':
          case 'ShiftRight':
            this.cycleMovementMode();
            return;
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

      if (dist >= 20) {
        let action: PlayerAction | null = null;
        if (Math.abs(dx) > Math.abs(dy)) {
          action = { type: 'MOVE', direction: dx > 0 ? 'E' : 'W' };
        } else {
          action = { type: 'MOVE', direction: dy > 0 ? 'S' : 'N' };
        }
        this.stepAction(action);
      } else {
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
      this.dungeonRenderer.syncOilFlasks(this.state.oilFlasks, this.fog);
      this.dungeonRenderer.syncMonsters(this.state.monsters ?? [], this.fog);
      this.dungeonRenderer.syncHallucinations(this.state.hallucinations ?? [], this.fog);
    }
    this.updateHUD();
  }

  public advanceToNextFloor(): void {
    this.state.depth += 1;
    this.rng = this.rng.fork('depth_' + this.state.depth);
    this.floor = generateDungeon(this.rng, this.state.depth);
    this.state.floor = this.floor;
    this.state.playerPos = { ...this.floor.entrance };
    this.state.playerHistory = [{ ...this.floor.entrance }];
    this.state.goldPiles = spawnGoldPiles(this.floor, this.state.depth, this.rng);
    this.state.oilFlasks = spawnOilFlasks(this.floor, this.state.depth, this.rng);
    this.state.monsters = spawnMonsters(this.floor, this.state.depth, this.rng);
    this.state.hallucinations = [];

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
    this.dungeonRenderer.syncOilFlasks(this.state.oilFlasks, this.fog);
    this.dungeonRenderer.syncMonsters(this.state.monsters ?? [], this.fog);
    this.dungeonRenderer.syncHallucinations(this.state.hallucinations ?? [], this.fog);
    this.updateHUD();
  }

  private recomputeFOV(): void {
    const radius = calculateLightRadius(this.state.oil, this.state.maxOil, this.state.dread);
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

  public getState(): Readonly<DungeonState> {
    return this.state;
  }
}
