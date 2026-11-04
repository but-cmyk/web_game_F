/**
 * DungeonRenderer for DEEPER.
 * Handles procedural 16x16 pixel textures, dungeon tile rendering,
 * player sprite display, and dynamic Fog of War lighting.
 * Built with Phaser 3 and the DEEPER-24 palette.
 */

import Phaser from 'phaser';
import { DungeonFloor, TileType } from '../core/mapgen';
import { FogOfWar } from '../core/fov';
import { toIndex } from '../core/grid';
import { GoldPile } from '../core/loot';
import { DEEPER_24, PALETTE, hexToNumber } from '../utils/palette';

export const TILE_SIZE = 16;

export class DungeonRenderer {
  private scene: Phaser.Scene;
  private floor: DungeonFloor;
  private tileImages: Phaser.GameObjects.Image[] = [];
  private goldImages: Map<string, Phaser.GameObjects.Image> = new Map();
  private playerSprite: Phaser.GameObjects.Image | null = null;

  constructor(scene: Phaser.Scene, floor: DungeonFloor) {
    this.scene = scene;
    this.floor = floor;

    this.ensureProceduralTextures();
    this.createDungeonGrid();
  }

  /**
   * Generates procedural 16x16 pixel textures if they don't already exist.
   */
  private ensureProceduralTextures(): void {
    if (!this.scene.textures.exists('tile_stone_floor')) {
      this.generateFloorTexture();
    }
    if (!this.scene.textures.exists('tile_stone_wall')) {
      this.generateWallTexture();
    }
    if (!this.scene.textures.exists('tile_stairs_down')) {
      this.generateStairsTexture();
    }
    if (!this.scene.textures.exists('tile_entrance')) {
      this.generateEntranceTexture();
    }
    if (!this.scene.textures.exists('tile_extraction_station')) {
      this.generateExtractionStationTexture();
    }
    if (!this.scene.textures.exists('tile_gold')) {
      this.generateGoldTexture();
    }
    if (!this.scene.textures.exists('spr_player')) {
      this.generatePlayerTexture();
    }
  }

  private generateFloorTexture(): void {
    const canvas = this.scene.textures.createCanvas('tile_stone_floor', TILE_SIZE, TILE_SIZE);
    if (!canvas) return;
    const ctx = canvas.context;

    // Base floor (#241e1a Dark Slate)
    ctx.fillStyle = DEEPER_24[2];
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Subtle stone flecks (#352d27 & #4a3e35)
    ctx.fillStyle = DEEPER_24[3];
    ctx.fillRect(3, 4, 2, 2);
    ctx.fillRect(11, 10, 2, 2);
    ctx.fillRect(8, 2, 1, 1);

    ctx.fillStyle = DEEPER_24[4];
    ctx.fillRect(4, 12, 1, 1);
    ctx.fillRect(12, 5, 1, 1);

    // Subtle edge borders (#161311 Deep Shadow)
    ctx.strokeStyle = DEEPER_24[1];
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

    canvas.refresh();
  }

  private generateWallTexture(): void {
    const canvas = this.scene.textures.createCanvas('tile_stone_wall', TILE_SIZE, TILE_SIZE);
    if (!canvas) return;
    const ctx = canvas.context;

    // Base stone wall (#352d27 Stone Wall Dark)
    ctx.fillStyle = DEEPER_24[3];
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Mortar lines (#161311 Deep Shadow)
    ctx.fillStyle = DEEPER_24[1];
    ctx.fillRect(0, 0, TILE_SIZE, 1);
    ctx.fillRect(0, 8, TILE_SIZE, 1);
    ctx.fillRect(0, 15, TILE_SIZE, 1);
    ctx.fillRect(8, 0, 1, 8);
    ctx.fillRect(0, 8, 1, 8);
    ctx.fillRect(15, 8, 1, 8);

    // Brick highlights (#4a3e35 Stone Wall Light)
    ctx.fillStyle = DEEPER_24[4];
    ctx.fillRect(1, 1, 6, 1);
    ctx.fillRect(9, 1, 6, 1);
    ctx.fillRect(1, 9, 13, 1);

    canvas.refresh();
  }

  private generateStairsTexture(): void {
    const canvas = this.scene.textures.createCanvas('tile_stairs_down', TILE_SIZE, TILE_SIZE);
    if (!canvas) return;
    const ctx = canvas.context;

    // Floor base
    ctx.fillStyle = DEEPER_24[2];
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Dark descending cavity (#0a0908 Subterranean Void)
    ctx.fillStyle = DEEPER_24[0];
    ctx.fillRect(3, 3, 10, 10);

    // Descending step edges in warm amber & gold
    ctx.fillStyle = DEEPER_24[10]; // Tarnished Gold
    ctx.fillRect(4, 4, 8, 2);

    ctx.fillStyle = DEEPER_24[11]; // Warm Amber
    ctx.fillRect(5, 7, 6, 2);

    ctx.fillStyle = DEEPER_24[12]; // Radiant Gold
    ctx.fillRect(6, 10, 4, 2);

    canvas.refresh();
  }

  private generateEntranceTexture(): void {
    const canvas = this.scene.textures.createCanvas('tile_entrance', TILE_SIZE, TILE_SIZE);
    if (!canvas) return;
    const ctx = canvas.context;

    // Floor base
    ctx.fillStyle = DEEPER_24[2];
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Rope ladder ascent markers (#806d5c Muted Stone & #e6d5bc Pale Chalk)
    ctx.fillStyle = DEEPER_24[6];
    ctx.fillRect(5, 1, 2, 14);
    ctx.fillRect(9, 1, 2, 14);

    ctx.fillStyle = DEEPER_24[8];
    ctx.fillRect(7, 3, 2, 2);
    ctx.fillRect(7, 7, 2, 2);
    ctx.fillRect(7, 11, 2, 2);

    canvas.refresh();
  }

  private generatePlayerTexture(): void {
    const canvas = this.scene.textures.createCanvas('spr_player', TILE_SIZE, TILE_SIZE);
    if (!canvas) return;
    const ctx = canvas.context;

    // Clear transparent
    ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Hood & Cloak (#4d3780 Abyssal Purple Mid)
    ctx.fillStyle = DEEPER_24[22];
    ctx.fillRect(5, 2, 6, 4); // Hood
    ctx.fillRect(4, 6, 8, 8); // Body

    // Cloak shadow hem (#2e214d Abyssal Indigo)
    ctx.fillStyle = DEEPER_24[21];
    ctx.fillRect(4, 12, 8, 2);

    // Face shadow & glowing eye (#161311 & #e6d5bc Pale Chalk)
    ctx.fillStyle = DEEPER_24[1];
    ctx.fillRect(6, 4, 4, 2);
    ctx.fillStyle = DEEPER_24[8];
    ctx.fillRect(7, 4, 1, 1);
    ctx.fillRect(8, 4, 1, 1);

    // Oil Lamp in hand (#5e3e11 Dark Bronze, #f4d06f Radiant Gold, #fff1b0 Sparkle)
    ctx.fillStyle = DEEPER_24[9];
    ctx.fillRect(11, 7, 3, 5); // Lamp frame
    ctx.fillStyle = DEEPER_24[12];
    ctx.fillRect(12, 8, 2, 3); // Amber flame
    ctx.fillStyle = DEEPER_24[13];
    ctx.fillRect(12, 9, 1, 1); // Sparkle highlight

    canvas.refresh();
  }

  private generateExtractionStationTexture(): void {
    const canvas = this.scene.textures.createCanvas('tile_extraction_station', TILE_SIZE, TILE_SIZE);
    if (!canvas) return;
    const ctx = canvas.context;

    // Floor base
    ctx.fillStyle = DEEPER_24[2];
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Wooden hoist scaffolding (#4a3e35 & #352d27)
    ctx.fillStyle = DEEPER_24[4];
    ctx.fillRect(2, 2, 2, 12);
    ctx.fillRect(12, 2, 2, 12);
    ctx.fillRect(2, 2, 12, 2);

    // Extraction winch & golden cable
    ctx.fillStyle = DEEPER_24[10];
    ctx.fillRect(6, 4, 4, 4);
    ctx.fillStyle = DEEPER_24[12];
    ctx.fillRect(7, 5, 2, 2);
    ctx.fillRect(7, 8, 2, 6);

    // Radiant amber beacon (#fff1b0)
    ctx.fillStyle = DEEPER_24[13];
    ctx.fillRect(7, 3, 2, 1);

    canvas.refresh();
  }

  private generateGoldTexture(): void {
    const canvas = this.scene.textures.createCanvas('tile_gold', TILE_SIZE, TILE_SIZE);
    if (!canvas) return;
    const ctx = canvas.context;

    ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Gold coin mound (#9e6b22 Tarnished, #e09f3e Warm Amber, #f4d06f Radiant Gold)
    ctx.fillStyle = DEEPER_24[10];
    ctx.fillRect(4, 9, 8, 4);
    ctx.fillStyle = DEEPER_24[11];
    ctx.fillRect(5, 7, 6, 4);
    ctx.fillStyle = DEEPER_24[12];
    ctx.fillRect(6, 6, 4, 3);

    // Sparkle flecks (#fff1b0 Highlight)
    ctx.fillStyle = DEEPER_24[13];
    ctx.fillRect(6, 7, 1, 1);
    ctx.fillRect(9, 9, 1, 1);

    canvas.refresh();
  }

  private getTextureForTile(type: TileType): string {
    switch (type) {
      case 'WALL':
        return 'tile_stone_wall';
      case 'FLOOR':
        return 'tile_stone_floor';
      case 'STAIRS_DOWN':
        return 'tile_stairs_down';
      case 'ENTRANCE':
        return 'tile_entrance';
      case 'EXTRACTION_STATION':
        return 'tile_extraction_station';
    }
  }

  /**
   * Instantiates image game objects for every tile in the dungeon floor.
   */
  private createDungeonGrid(): void {
    const { width, height, tiles } = this.floor;
    this.tileImages = new Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = toIndex(x, y, width);
        const textureKey = this.getTextureForTile(tiles[idx]);

        const img = this.scene.add.image(x * TILE_SIZE, y * TILE_SIZE, textureKey);
        img.setOrigin(0, 0);
        img.setDepth(0);
        // Initially hidden in Fog of War
        img.setVisible(false);

        this.tileImages[idx] = img;
      }
    }
  }

  /**
   * Spawns the player sprite at grid coordinates.
   */
  public createPlayerSprite(tileX: number, tileY: number): Phaser.GameObjects.Image {
    const pixelX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const pixelY = tileY * TILE_SIZE + TILE_SIZE / 2;

    this.playerSprite = this.scene.add.image(pixelX, pixelY, 'spr_player');
    this.playerSprite.setOrigin(0.5, 0.5);
    this.playerSprite.setDepth(10);

    return this.playerSprite;
  }

  /**
   * Updates player sprite position with smooth tween.
   */
  public updatePlayerPosition(tileX: number, tileY: number): void {
    if (!this.playerSprite) return;

    const targetX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const targetY = tileY * TILE_SIZE + TILE_SIZE / 2;

    this.scene.tweens.add({
      targets: this.playerSprite,
      x: targetX,
      y: targetY,
      duration: 70,
      ease: 'Power1',
    });
  }

  /**
   * Updates tile rendering according to current Fog of War state:
   * - Visible: alpha 1.0, full brightness
   * - Explored (memory): alpha 0.35, cold dimmed tint
   * - Unexplored: hidden (alpha 0)
   */
  public updateLighting(fog: FogOfWar): void {
    const totalTiles = this.tileImages.length;
    const memoryTint = hexToNumber(PALETTE.panelBorder);

    for (let i = 0; i < totalTiles; i++) {
      const img = this.tileImages[i];
      if (!img) continue;

      if (fog.visible[i]) {
        img.setVisible(true);
        img.setAlpha(1.0);
        img.clearTint();
      } else if (fog.explored[i]) {
        img.setVisible(true);
        img.setAlpha(0.35);
        img.setTint(memoryTint);
      } else {
        img.setVisible(false);
      }
    }

    // Update gold pile lighting
    for (const img of this.goldImages.values()) {
      const x = Math.floor(img.x / TILE_SIZE);
      const y = Math.floor(img.y / TILE_SIZE);
      const idx = toIndex(x, y, this.floor.width);

      if (fog.visible[idx]) {
        img.setVisible(true);
        img.setAlpha(1.0);
        img.clearTint();
      } else if (fog.explored[idx]) {
        img.setVisible(true);
        img.setAlpha(0.35);
        img.setTint(memoryTint);
      } else {
        img.setVisible(false);
      }
    }
  }

  /**
   * Synchronizes gold pile sprites with current active gold piles on the floor.
   */
  public syncGoldPiles(piles: readonly GoldPile[], fog: FogOfWar): void {
    const activeIds = new Set<string>();
    const memoryTint = hexToNumber(PALETTE.panelBorder);

    for (const pile of piles) {
      activeIds.add(pile.id);
      let img = this.goldImages.get(pile.id);

      if (!img) {
        img = this.scene.add.image(pile.x * TILE_SIZE, pile.y * TILE_SIZE, 'tile_gold');
        img.setOrigin(0, 0);
        img.setDepth(5);
        this.goldImages.set(pile.id, img);
      }

      // Update visibility according to fog
      const idx = toIndex(pile.x, pile.y, this.floor.width);
      if (fog.visible[idx]) {
        img.setVisible(true);
        img.setAlpha(1.0);
        img.clearTint();
      } else if (fog.explored[idx]) {
        img.setVisible(true);
        img.setAlpha(0.35);
        img.setTint(memoryTint);
      } else {
        img.setVisible(false);
      }
    }

    // Remove sprites for collected piles
    for (const [id, img] of this.goldImages.entries()) {
      if (!activeIds.has(id)) {
        img.destroy();
        this.goldImages.delete(id);
      }
    }
  }

  public destroy(): void {
    for (const img of this.tileImages) {
      img.destroy();
    }
    this.tileImages = [];
    for (const img of this.goldImages.values()) {
      img.destroy();
    }
    this.goldImages.clear();
    if (this.playerSprite) {
      this.playerSprite.destroy();
      this.playerSprite = null;
    }
  }
}

