/**
 * RunScene for DEEPER.
 * Main roguelike exploration scene: dungeon floor rendering, player movement,
 * fear & oil mechanics, noise waves, gold collection, chests, devil's bargains,
 * escape rope channeling, and camera tracking.
 */

import Phaser from 'phaser';
import { Rng } from '../core/rng';
import { generateDungeon, DungeonFloor } from '../core/mapgen';
import { EventBus } from '../core/events';
import { TurnResolver, DungeonState, PlayerAction, MovementMode } from '../core/turn';
import { FogOfWar, createFogOfWar, updateFogOfWar, computeFOV } from '../core/fov';
import { toIndex } from '../core/grid';
import {
  spawnGoldPiles,
  spawnOilFlasks,
  spawnChests,
  spawnBargainPedestal,
  Chest,
  BargainPedestal,
} from '../core/loot';
import { spawnMonsters } from '../core/monsters';
import { calculateLightRadius } from '../core/fear';
import { applyCurseLightModifier } from '../core/curses';
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
  private curseText!: Phaser.GameObjects.Text;
  private ropeText!: Phaser.GameObjects.Text;
  private channelingText!: Phaser.GameObjects.Text;

  // Active interaction modal container
  private activeModal: Phaser.GameObjects.Container | null = null;

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
    const chests = spawnChests(this.floor, depth, this.rng);
    const bargainPedestal = spawnBargainPedestal(this.floor, depth, this.rng);
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
      chests,
      bargainPedestal,
      activeCurses: [],
      ropeCount: 0,
      escapeRopeTurnsRemaining: 0,
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
    this.dungeonRenderer.syncChests(this.state.chests ?? [], this.fog);
    this.dungeonRenderer.syncBargainPedestal(this.state.bargainPedestal, this.fog);
    this.dungeonRenderer.syncMonsters(this.state.monsters ?? [], this.fog);
    this.dungeonRenderer.syncHallucinations(this.state.hallucinations ?? [], this.fog);

    // Setup presentation, HUD, controls, and audio listeners
    this.setupCamera();
    this.setupHUD();
    this.setupInput();
    this.setupAudioAndEvents();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.closeModal();
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

    this.eventBus.on('ChestOpened', (payload) => {
      defaultAudioDirector.playGoldChime();
      if (payload.isCursed) {
        this.postFX.triggerHeartbeatPulse();
        const reduceMotion = defaultSaveStore.load().reduceMotion;
        if (!reduceMotion) {
          this.cameras.main.shake(120, 0.005);
        }
      }
    });

    this.eventBus.on('BargainResolved', (payload) => {
      if (payload.accepted) {
        defaultAudioDirector.playGoldChime();
      }
    });

    this.eventBus.on('ExtractStarted', () => {
      defaultAudioDirector.playGoldChime();
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
      .text(138, 3, t('hud.mode', { mode: t(modeKey) }).toUpperCase(), {
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
      .text(196, 3, t('hud.carried_gold', { gold: this.state.carriedGold }).toUpperCase(), {
        fontSize: '7px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(101);

    // Depth indicator
    this.depthText = this.add
      .text(244, 3, t('hud.depth', { depth: this.state.depth }).toUpperCase(), {
        fontSize: '7px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(101);

    // FPS counter
    this.fpsText = this.add
      .text(284, 3, t('hud.fps', { fps: 60 }), {
        fontSize: '7px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
      })
      .setScrollFactor(0)
      .setDepth(101);

    // Curses pill indicator (sub-row)
    this.curseText = this.add
      .text(4, 16, '', {
        fontSize: '6px',
        color: PALETTE.danger,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(101)
      .setVisible(false);

    // Escape rope pill indicator
    this.ropeText = this.add
      .text(60, 16, '', {
        fontSize: '6px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(101)
      .setVisible(false);

    // Channeling Rope banner (pulsing)
    this.channelingText = this.add
      .text(160, 16, '', {
        fontSize: '7px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102)
      .setVisible(false);

    // Controls Hint (bottom center)
    this.add
      .text(160, 172, t('hud.controls_hint') + ' | [R] ROPE', {
        fontSize: '7px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);
  }

  private cycleMovementMode(): void {
    if (this.activeModal) return;
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

    // Curses pill
    const curseCount = this.state.activeCurses?.length ?? 0;
    if (curseCount > 0) {
      this.curseText.setText(t('hud.curses', { count: curseCount }).toUpperCase());
      this.curseText.setVisible(true);
    } else {
      this.curseText.setVisible(false);
    }

    // Rope pill
    const ropeCount = this.state.ropeCount ?? 0;
    if (ropeCount > 0) {
      this.ropeText.setText(t('hud.rope', { count: ropeCount }).toUpperCase());
      this.ropeText.setVisible(true);
    } else {
      this.ropeText.setVisible(false);
    }

    // Channeling banner
    const channelTurns = this.state.escapeRopeTurnsRemaining ?? 0;
    if (channelTurns > 0) {
      this.channelingText.setText(t('hud.channeling_rope', { turns: channelTurns }).toUpperCase());
      this.channelingText.setVisible(true);
    } else {
      this.channelingText.setVisible(false);
    }

    if ((this.state.playerInvulnerableTurns ?? 0) > 0) {
      this.playerSprite.setAlpha(0.65);
    } else {
      this.playerSprite.setAlpha(1.0);
    }
  }

  private setupInput(): void {
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
        // Handle modal keyboard inputs
        if (this.activeModal) {
          if (event.key === 'Escape' || event.code === 'Escape') {
            this.closeModal();
          }
          return;
        }

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
          case 'KeyR':
            action = { type: 'USE_ROPE' };
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
              // Check chest interaction adjacent
              const adjacentChest = this.state.chests?.find(
                (c) =>
                  !c.isOpen &&
                  Math.abs(c.x - this.state.playerPos.x) <= 1 &&
                  Math.abs(c.y - this.state.playerPos.y) <= 1
              );
              if (adjacentChest) {
                this.handleChestInteraction(adjacentChest);
                return;
              }

              // Check bargain pedestal adjacent
              const pedestal = this.state.bargainPedestal;
              if (
                pedestal &&
                !pedestal.isUsed &&
                Math.abs(pedestal.x - this.state.playerPos.x) <= 1 &&
                Math.abs(pedestal.y - this.state.playerPos.y) <= 1
              ) {
                this.showBargainModal(pedestal);
                return;
              }

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
      if (this.activeModal) return;

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
      this.dungeonRenderer.syncChests(this.state.chests ?? [], this.fog);
      this.dungeonRenderer.syncBargainPedestal(this.state.bargainPedestal, this.fog);
      this.dungeonRenderer.syncMonsters(this.state.monsters ?? [], this.fog);
      this.dungeonRenderer.syncHallucinations(this.state.hallucinations ?? [], this.fog);

      // Check auto-interaction if stepped onto chest or altar
      const chestAtPos = this.state.chests?.find(
        (c) => !c.isOpen && c.x === this.state.playerPos.x && c.y === this.state.playerPos.y
      );
      if (chestAtPos) {
        this.handleChestInteraction(chestAtPos);
      } else {
        const pedestal = this.state.bargainPedestal;
        if (
          pedestal &&
          !pedestal.isUsed &&
          pedestal.x === this.state.playerPos.x &&
          pedestal.y === this.state.playerPos.y
        ) {
          this.showBargainModal(pedestal);
        }
      }
    }
    this.updateHUD();
  }

  private handleChestInteraction(chest: Chest): void {
    if (chest.isOpen) return;

    if (chest.isCursed) {
      this.showCursedChestModal(chest);
    } else {
      this.stepAction({ type: 'OPEN_CHEST', chestId: chest.id });
    }
  }

  private showCursedChestModal(chest: Chest): void {
    this.closeModal();

    const container = this.add.container(160, 90).setScrollFactor(0).setDepth(200);
    this.activeModal = container;

    // Dim background overlay
    const overlay = this.add
      .rectangle(0, 0, 320, 180, hexToNumber(PALETTE.background), 0.7)
      .setOrigin(0.5);

    // Modal frame
    const frame = this.add
      .rectangle(0, 0, 240, 96, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.danger))
      .setOrigin(0.5);

    const title = this.add
      .text(0, -32, t('dialog.cursed_chest_prompt').toUpperCase(), {
        fontSize: '7px',
        color: PALETTE.danger,
        fontFamily: 'monospace',
        fontStyle: 'bold',
        wordWrap: { width: 220 },
        align: 'center',
      })
      .setOrigin(0.5);

    // Button 1: Open Chest
    const openBtn = this.add
      .rectangle(-55, 20, 95, 20, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.goldAccent))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const openText = this.add
      .text(-55, 20, t('action.open_chest'), {
        fontSize: '7px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    openBtn.on('pointerdown', () => {
      this.closeModal();
      this.stepAction({ type: 'OPEN_CHEST', chestId: chest.id });
    });

    // Button 2: Decline / Step Away
    const declineBtn = this.add
      .rectangle(55, 20, 95, 20, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.panelBorder))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const declineText = this.add
      .text(55, 20, t('action.decline'), {
        fontSize: '7px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    declineBtn.on('pointerdown', () => {
      this.closeModal();
    });

    container.add([overlay, frame, title, openBtn, openText, declineBtn, declineText]);
  }

  private showBargainModal(pedestal: BargainPedestal): void {
    if (pedestal.isUsed || pedestal.bargains.length < 2) return;
    this.closeModal();

    const container = this.add.container(160, 90).setScrollFactor(0).setDepth(200);
    this.activeModal = container;

    // Dim background overlay
    const overlay = this.add
      .rectangle(0, 0, 320, 180, hexToNumber(PALETTE.background), 0.7)
      .setOrigin(0.5);

    // Modal frame
    const frame = this.add
      .rectangle(0, 0, 280, 128, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.goldAccent))
      .setOrigin(0.5);

    const title = this.add
      .text(0, -50, t('dialog.bargain_title').toUpperCase(), {
        fontSize: '8px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const b1 = pedestal.bargains[0];
    const b2 = pedestal.bargains[1];

    // Bargain 1 button
    const btn1 = this.add
      .rectangle(0, -22, 260, 24, hexToNumber(PALETTE.background), 0.9)
      .setStrokeStyle(1, hexToNumber(PALETTE.goldAccent))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const b1Name = b1.nameKey ? t(b1.nameKey) : b1.id;
    const b1Cost = b1.costKey ? t(b1.costKey) : b1.costType;
    const b1Reward = b1.rewardKey ? t(b1.rewardKey) : b1.rewardType;

    const btn1Text1 = this.add
      .text(-120, -27, `[1] ${b1Name}`, {
        fontSize: '7px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    const btn1Text2 = this.add
      .text(-120, -17, `${t('codex.label_cost')}: ${b1Cost}  |  ${t('codex.label_reward')}: ${b1Reward}`, {
        fontSize: '6px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
      })
      .setOrigin(0, 0.5);

    btn1.on('pointerdown', () => {
      this.closeModal();
      this.stepAction({ type: 'RESOLVE_BARGAIN', bargainId: b1.id, accepted: true });
    });

    // Bargain 2 button
    const btn2 = this.add
      .rectangle(0, 10, 260, 24, hexToNumber(PALETTE.background), 0.9)
      .setStrokeStyle(1, hexToNumber(PALETTE.goldAccent))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const b2Name = b2.nameKey ? t(b2.nameKey) : b2.id;
    const b2Cost = b2.costKey ? t(b2.costKey) : b2.costType;
    const b2Reward = b2.rewardKey ? t(b2.rewardKey) : b2.rewardType;

    const btn2Text1 = this.add
      .text(-120, 5, `[2] ${b2Name}`, {
        fontSize: '7px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    const btn2Text2 = this.add
      .text(-120, 15, `${t('codex.label_cost')}: ${b2Cost}  |  ${t('codex.label_reward')}: ${b2Reward}`, {
        fontSize: '6px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
      })
      .setOrigin(0, 0.5);

    btn2.on('pointerdown', () => {
      this.closeModal();
      this.stepAction({ type: 'RESOLVE_BARGAIN', bargainId: b2.id, accepted: true });
    });

    // Safe Decline button
    const declineBtn = this.add
      .rectangle(0, 42, 260, 20, hexToNumber(PALETTE.background), 0.9)
      .setStrokeStyle(1, hexToNumber(PALETTE.panelBorder))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const declineText = this.add
      .text(0, 42, `[ESC / 3] ${t('dialog.bargain_decline')}`, {
        fontSize: '7px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    declineBtn.on('pointerdown', () => {
      this.closeModal();
      this.stepAction({ type: 'RESOLVE_BARGAIN', bargainId: b1.id, accepted: false });
    });

    container.add([
      overlay,
      frame,
      title,
      btn1,
      btn1Text1,
      btn1Text2,
      btn2,
      btn2Text1,
      btn2Text2,
      declineBtn,
      declineText,
    ]);
  }

  private closeModal(): void {
    if (this.activeModal) {
      this.activeModal.destroy();
      this.activeModal = null;
    }
  }

  public advanceToNextFloor(): void {
    this.closeModal();
    this.state.depth += 1;
    this.rng = this.rng.fork('depth_' + this.state.depth);
    this.floor = generateDungeon(this.rng, this.state.depth);
    this.state.floor = this.floor;
    this.state.playerPos = { ...this.floor.entrance };
    this.state.playerHistory = [{ ...this.floor.entrance }];
    this.state.goldPiles = spawnGoldPiles(this.floor, this.state.depth, this.rng);
    this.state.oilFlasks = spawnOilFlasks(this.floor, this.state.depth, this.rng);
    this.state.chests = spawnChests(this.floor, this.state.depth, this.rng);
    this.state.bargainPedestal = spawnBargainPedestal(this.floor, this.state.depth, this.rng);
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
    this.dungeonRenderer.syncChests(this.state.chests ?? [], this.fog);
    this.dungeonRenderer.syncBargainPedestal(this.state.bargainPedestal, this.fog);
    this.dungeonRenderer.syncMonsters(this.state.monsters ?? [], this.fog);
    this.dungeonRenderer.syncHallucinations(this.state.hallucinations ?? [], this.fog);
    this.updateHUD();
  }

  private recomputeFOV(): void {
    let radius = calculateLightRadius(this.state.oil, this.state.maxOil, this.state.dread);
    radius = applyCurseLightModifier(radius, this.state.activeCurses ?? []);

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

    // If stairs were revealed by a bargain (Mind Cleansing)
    if (this.state.stairsRevealed) {
      const stairsIdx = toIndex(this.floor.stairsDown.x, this.floor.stairsDown.y, this.floor.width);
      this.fog.explored[stairsIdx] = true;
      this.fog.visible[stairsIdx] = true;
    }

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
