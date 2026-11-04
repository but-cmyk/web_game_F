/**
 * PostFX Presentation Effects for DEEPER.
 * Handles psychological tension effects:
 * - Dynamic vignette darkening with Dread level
 * - Heartbeat screen pulse (respects reduceMotion)
 * - Sensory redundant expanding noise rings
 * Built with Phaser 3 and DEEPER-24 palette.
 */

import Phaser from 'phaser';
import { hexToNumber, PALETTE } from '../utils/palette';

export class PostFX {
  private scene: Phaser.Scene;
  private vignette: Phaser.GameObjects.Graphics;
  private noiseGraphics: Phaser.GameObjects.Graphics;
  private reduceMotion: boolean;

  constructor(scene: Phaser.Scene, reduceMotion = false) {
    this.scene = scene;
    this.reduceMotion = reduceMotion;

    // Fixed-to-screen vignette overlay
    this.vignette = this.scene.add.graphics();
    this.vignette.setScrollFactor(0);
    this.vignette.setDepth(90);

    // World-space noise ring graphics
    this.noiseGraphics = this.scene.add.graphics();
    this.noiseGraphics.setDepth(15);
  }

  /**
   * Updates vignette intensity and borders based on Dread (0..100).
   */
  public updateDread(dread: number): void {
    this.vignette.clear();

    if (dread < 40) {
      return;
    }

    const { width, height } = this.scene.scale;
    // Intensity scales from 0.15 at Dread 40 to 0.7 at Dread 100
    const intensity = 0.15 + 0.55 * ((Math.min(100, dread) - 40) / 60);
    const borderColor = dread >= 70 ? hexToNumber(PALETTE.danger) : hexToNumber(PALETTE.background);

    // Vignette border shading
    const borderThickness = Math.round(12 + (dread / 100) * 16);

    this.vignette.lineStyle(borderThickness, borderColor, intensity);
    this.vignette.strokeRect(0, 0, width, height);

    // Dark corner vignettes
    this.vignette.fillStyle(hexToNumber(PALETTE.background), intensity * 0.8);
    this.vignette.fillRect(0, 0, borderThickness * 1.5, borderThickness * 1.5);
    this.vignette.fillRect(width - borderThickness * 1.5, 0, borderThickness * 1.5, borderThickness * 1.5);
    this.vignette.fillRect(0, height - borderThickness * 1.5, borderThickness * 1.5, borderThickness * 1.5);
    this.vignette.fillRect(width - borderThickness * 1.5, height - borderThickness * 1.5, borderThickness * 1.5, borderThickness * 1.5);
  }

  /**
   * Spawns sensory-redundant expanding soundwave ripple on world tile.
   */
  public spawnNoiseRipple(worldX: number, worldY: number, radiusTiles: number): void {
    const maxPixelRadius = radiusTiles * 16;
    const ring = this.scene.add.graphics();
    ring.setDepth(15);

    const animState = { radius: 4, alpha: 0.8 };

    this.scene.tweens.add({
      targets: animState,
      radius: maxPixelRadius,
      alpha: 0,
      duration: 350,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        ring.clear();
        ring.lineStyle(1.5, hexToNumber(PALETTE.focus), animState.alpha);
        ring.strokeCircle(worldX, worldY, animState.radius);
      },
      onComplete: () => {
        ring.destroy();
      },
    });
  }

  /**
   * Triggers camera pulse if reduceMotion is false (WCAG / ethics compliance).
   */
  public triggerHeartbeatPulse(): void {
    if (this.reduceMotion) {
      return;
    }

    const cam = this.scene.cameras.main;
    this.scene.tweens.add({
      targets: cam,
      zoom: 1.015,
      duration: 80,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
  }

  public setReduceMotion(reduce: boolean): void {
    this.reduceMotion = reduce;
  }

  public destroy(): void {
    this.vignette.destroy();
    this.noiseGraphics.destroy();
  }
}
