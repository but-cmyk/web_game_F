import Phaser from 'phaser';
import { DEEPER_24, PALETTE, hexToNumber } from '../utils/palette';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Background fill
    this.add.rectangle(0, 0, width, height, hexToNumber(PALETTE.background)).setOrigin(0);

    // Title
    this.add
      .text(width / 2, 26, 'D E E P E R', {
        fontSize: '18px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(width / 2, 46, 'PUSH-YOUR-LUCK ROGUELIKE', {
        fontSize: '8px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Section header: Palette swatches
    this.add
      .text(width / 2, 68, 'PALETTE DEEPER-24', {
        fontSize: '8px',
        color: PALETTE.text,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Render 24 color swatch tiles (2 rows of 12 swatches)
    const cols = 12;
    const swatchWidth = 18;
    const swatchHeight = 14;
    const gap = 3;
    const gridWidth = cols * swatchWidth + (cols - 1) * gap;
    const startX = Math.round((width - gridWidth) / 2);
    const startY = 82;

    DEEPER_24.forEach((colorHex, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = startX + col * (swatchWidth + gap);
      const y = startY + row * (swatchHeight + gap);

      // Swatch border
      this.add
        .rectangle(x - 1, y - 1, swatchWidth + 2, swatchHeight + 2, hexToNumber(PALETTE.panelBorder))
        .setOrigin(0);

      // Color swatch fill
      this.add
        .rectangle(x, y, swatchWidth, swatchHeight, hexToNumber(colorHex))
        .setOrigin(0);
    });

    // Technical footer
    this.add
      .text(width / 2, 142, '320x180 PIXEL-PERFECT CANVAS', {
        fontSize: '8px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 156, 'M0 BOOTSTRAP COMPLETE · READY FOR M1', {
        fontSize: '8px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);
  }
}

