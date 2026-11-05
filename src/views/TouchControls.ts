/**
 * Virtual Touch Controls for DEEPER (§5 M9).
 * Provides on-screen D-pad and movement mode toggles for mobile & touchscreens.
 * Responsive for 320x180 canvas scaled to mobile (360x640 portrait or landscape).
 */

import Phaser from 'phaser';
import { Direction } from '../core/grid';
import { MovementMode } from '../core/turn';
import { PALETTE, hexToNumber } from '../utils/palette';

export interface TouchControlsCallbacks {
  readonly onMove: (direction: Direction) => void;
  readonly onMode: (mode: MovementMode) => void;
}

export class TouchControls {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private callbacks: TouchControlsCallbacks;
  private modeButtons: Map<MovementMode, Phaser.GameObjects.Text> = new Map();
  private modeRects: Map<MovementMode, Phaser.GameObjects.Rectangle> = new Map();

  constructor(scene: Phaser.Scene, callbacks: TouchControlsCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;
    this.container = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(300);
    this.buildControls();
  }

  private buildControls(): void {
    const { width, height } = this.scene.scale;

    // 1. Virtual D-pad (Bottom-left area)
    const dpadCenterX = 34;
    const dpadCenterY = height - 26;
    const btnSize = 14;
    const offset = 14;

    const directions: { dir: Direction; label: string; x: number; y: number }[] = [
      { dir: 'N', label: '▲', x: dpadCenterX, y: dpadCenterY - offset },
      { dir: 'S', label: '▼', x: dpadCenterX, y: dpadCenterY + offset },
      { dir: 'W', label: '◀', x: dpadCenterX - offset, y: dpadCenterY },
      { dir: 'E', label: '▶', x: dpadCenterX + offset, y: dpadCenterY },
    ];

    for (const d of directions) {
      const bg = this.scene.add
        .rectangle(d.x, d.y, btnSize, btnSize, hexToNumber(PALETTE.panel), 0.7)
        .setStrokeStyle(1, hexToNumber(PALETTE.panelBorder))
        .setInteractive({ useHandCursor: true });

      const text = this.scene.add
        .text(d.x, d.y, d.label, {
          fontSize: '8px',
          color: PALETTE.goldHighlight,
          fontFamily: 'monospace',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      bg.on('pointerdown', () => {
        bg.setFillStyle(hexToNumber(PALETTE.goldAccent), 0.9);
        this.callbacks.onMove(d.dir);
      });

      bg.on('pointerup', () => {
        bg.setFillStyle(hexToNumber(PALETTE.panel), 0.7);
      });

      bg.on('pointerout', () => {
        bg.setFillStyle(hexToNumber(PALETTE.panel), 0.7);
      });

      this.container.add([bg, text]);
    }

    // 2. Movement Mode Buttons (Bottom-right area)
    const modes: { mode: MovementMode; label: string; x: number }[] = [
      { mode: 'sneak', label: 'Z', x: width - 52 },
      { mode: 'walk', label: 'X', x: width - 34 },
      { mode: 'run', label: 'C', x: width - 16 },
    ];
    const modeY = height - 14;

    for (const m of modes) {
      const bg = this.scene.add
        .rectangle(m.x, modeY, 14, 14, hexToNumber(PALETTE.panel), 0.7)
        .setStrokeStyle(1, hexToNumber(PALETTE.panelBorder))
        .setInteractive({ useHandCursor: true });

      const text = this.scene.add
        .text(m.x, modeY, m.label, {
          fontSize: '7px',
          color: PALETTE.text,
          fontFamily: 'monospace',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      bg.on('pointerdown', () => {
        this.callbacks.onMode(m.mode);
        this.setActiveMode(m.mode);
      });

      this.modeButtons.set(m.mode, text);
      this.modeRects.set(m.mode, bg);
      this.container.add([bg, text]);
    }

    // Set initial mode to walk
    this.setActiveMode('walk');
  }

  public setActiveMode(activeMode: MovementMode): void {
    for (const [mode, rect] of this.modeRects.entries()) {
      const isSelected = mode === activeMode;
      rect.setStrokeStyle(1, hexToNumber(isSelected ? PALETTE.goldHighlight : PALETTE.panelBorder));
      rect.setFillStyle(
        hexToNumber(isSelected ? PALETTE.goldAccent : PALETTE.panel),
        isSelected ? 0.9 : 0.7
      );
    }
  }

  public setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
