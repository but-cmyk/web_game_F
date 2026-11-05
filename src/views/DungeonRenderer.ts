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
import { GoldPile, OilFlask, Chest, BargainPedestal } from '../core/loot';
import { Monster } from '../core/monsters';
import { Hallucination } from '../core/hallucinations';
import { BiomeDefinition, getBiomeForDepth } from '../core/biomes';
import { DEEPER_24, PALETTE, hexToNumber } from '../utils/palette';

export const TILE_SIZE = 16;

export class DungeonRenderer {
  private scene: Phaser.Scene;
  private floor: DungeonFloor;
  private biome: BiomeDefinition;
  private tileImages: Phaser.GameObjects.Image[] = [];
  private goldImages: Map<string, Phaser.GameObjects.Image> = new Map();
  private flaskImages: Map<string, Phaser.GameObjects.Image> = new Map();
  private chestImages: Map<string, Phaser.GameObjects.Image> = new Map();
  private pedestalImage: Phaser.GameObjects.Image | null = null;
  private monsterImages: Map<string, Phaser.GameObjects.Image> = new Map();
  private monsterOverheads: Map<string, Phaser.GameObjects.Image> = new Map();
  private hallucinationImages: Map<string, Phaser.GameObjects.Image> = new Map();
  private playerSprite: Phaser.GameObjects.Image | null = null;

  constructor(scene: Phaser.Scene, floor: DungeonFloor, depth: number = 1) {
    this.scene = scene;
    this.floor = floor;
    this.biome = getBiomeForDepth(depth);

    this.ensureProceduralTextures();
    this.createDungeonGrid();
  }

  public setDepth(depth: number): void {
    this.biome = getBiomeForDepth(depth);
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
    if (!this.scene.textures.exists('tile_oil_flask')) {
      this.generateOilFlaskTexture();
    }
    if (!this.scene.textures.exists('tile_chest')) {
      this.generateChestTexture();
    }
    if (!this.scene.textures.exists('tile_cursed_chest')) {
      this.generateCursedChestTexture();
    }
    if (!this.scene.textures.exists('tile_bargain_altar')) {
      this.generateBargainAltarTexture();
    }
    if (!this.scene.textures.exists('spr_crawler')) {
      this.generateCrawlerTexture();
    }
    if (!this.scene.textures.exists('spr_listener')) {
      this.generateListenerTexture();
    }
    if (!this.scene.textures.exists('spr_stalker')) {
      this.generateStalkerTexture();
    }
    if (!this.scene.textures.exists('spr_phantom')) {
      this.generatePhantomTexture();
    }
    if (!this.scene.textures.exists('icon_alert')) {
      this.generateStatusIcons();
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

  private generateOilFlaskTexture(): void {
    const canvas = this.scene.textures.createCanvas('tile_oil_flask', TILE_SIZE, TILE_SIZE);
    if (!canvas) return;
    const ctx = canvas.context;

    ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Flask neck and stopper (#5e3e11 Dark Bronze)
    ctx.fillStyle = DEEPER_24[9];
    ctx.fillRect(7, 3, 2, 2); // Stopper
    ctx.fillRect(6, 5, 4, 2); // Lip

    // Glass bulb outline (#352d27 & #161311)
    ctx.fillStyle = DEEPER_24[3];
    ctx.fillRect(5, 7, 6, 6);

    // Glowing amber oil inside (#e09f3e & #f4d06f Radiant Gold)
    ctx.fillStyle = DEEPER_24[11];
    ctx.fillRect(6, 8, 4, 4);
    ctx.fillStyle = DEEPER_24[12];
    ctx.fillRect(6, 9, 3, 3);

    // Glass reflection / glint (#fff1b0)
    ctx.fillStyle = DEEPER_24[13];
    ctx.fillRect(6, 7, 1, 2);

    canvas.refresh();
  }

  private generateChestTexture(): void {
    const canvas = this.scene.textures.createCanvas('tile_chest', TILE_SIZE, TILE_SIZE);
    if (!canvas) return;
    const ctx = canvas.context;
    ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Chest wooden body (#5e3e11 & #9e6b22)
    ctx.fillStyle = DEEPER_24[9];
    ctx.fillRect(2, 4, 12, 10);
    ctx.fillStyle = DEEPER_24[10];
    ctx.fillRect(3, 5, 10, 8);

    // Metal reinforcement bands (#4a3e35 & #e09f3e)
    ctx.fillStyle = DEEPER_24[4];
    ctx.fillRect(2, 4, 12, 1);
    ctx.fillRect(2, 8, 12, 1);
    ctx.fillRect(4, 4, 1, 10);
    ctx.fillRect(11, 4, 1, 10);

    // Bronze Lock (#f4d06f Radiant Gold, #fff1b0 Sparkle)
    ctx.fillStyle = DEEPER_24[12];
    ctx.fillRect(7, 7, 2, 3);
    ctx.fillStyle = DEEPER_24[13];
    ctx.fillRect(7, 7, 1, 1);

    canvas.refresh();
  }

  private generateCursedChestTexture(): void {
    const canvas = this.scene.textures.createCanvas('tile_cursed_chest', TILE_SIZE, TILE_SIZE);
    if (!canvas) return;
    const ctx = canvas.context;
    ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Obsidian body (#161311 & #2f1b25)
    ctx.fillStyle = DEEPER_24[1];
    ctx.fillRect(2, 4, 12, 10);
    ctx.fillStyle = DEEPER_24[14];
    ctx.fillRect(3, 5, 10, 8);

    // Cursed crimson veins / bands (#992b45 & #d04648)
    ctx.fillStyle = DEEPER_24[16];
    ctx.fillRect(2, 4, 12, 1);
    ctx.fillRect(2, 8, 12, 1);
    ctx.fillRect(4, 4, 1, 10);
    ctx.fillRect(11, 4, 1, 10);

    // Glowing skull lock (#d04648 Crimson Flame & eye sockets)
    ctx.fillStyle = DEEPER_24[17];
    ctx.fillRect(6, 6, 4, 4);
    ctx.fillStyle = DEEPER_24[0];
    ctx.fillRect(7, 7, 1, 1);
    ctx.fillRect(8, 7, 1, 1);
    ctx.fillStyle = DEEPER_24[18];
    ctx.fillRect(7, 9, 2, 1);

    canvas.refresh();
  }

  private generateBargainAltarTexture(): void {
    const canvas = this.scene.textures.createCanvas('tile_bargain_altar', TILE_SIZE, TILE_SIZE);
    if (!canvas) return;
    const ctx = canvas.context;
    ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Base stone pedestal (#241e1a & #352d27)
    ctx.fillStyle = DEEPER_24[2];
    ctx.fillRect(2, 11, 12, 4);
    ctx.fillStyle = DEEPER_24[3];
    ctx.fillRect(4, 7, 8, 5);
    ctx.fillStyle = DEEPER_24[4];
    ctx.fillRect(3, 5, 10, 3);

    // Ritual brazier bowl (#161311)
    ctx.fillStyle = DEEPER_24[1];
    ctx.fillRect(4, 4, 8, 2);

    // Mystic flame (#992b45 Deep Wine, #d04648 Crimson Flame, #f4d06f Amber)
    ctx.fillStyle = DEEPER_24[16];
    ctx.fillRect(6, 2, 4, 3);
    ctx.fillStyle = DEEPER_24[17];
    ctx.fillRect(7, 1, 2, 3);
    ctx.fillStyle = DEEPER_24[12];
    ctx.fillRect(7, 2, 2, 1);

    canvas.refresh();
  }

  private generateCrawlerTexture(): void {
    const canvas = this.scene.textures.createCanvas('spr_crawler', TILE_SIZE, TILE_SIZE);
    if (!canvas) return;
    const ctx = canvas.context;
    ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Spindly arachnid legs (#161311 Deep Shadow)
    ctx.fillStyle = DEEPER_24[1];
    ctx.fillRect(2, 4, 3, 1);
    ctx.fillRect(1, 5, 2, 1);
    ctx.fillRect(11, 4, 3, 1);
    ctx.fillRect(13, 5, 2, 1);
    ctx.fillRect(2, 11, 3, 1);
    ctx.fillRect(1, 12, 2, 1);
    ctx.fillRect(11, 11, 3, 1);
    ctx.fillRect(13, 12, 2, 1);

    // Carapace body (#635347 Weathered Rock & #352d27)
    ctx.fillStyle = DEEPER_24[5];
    ctx.fillRect(4, 5, 8, 6);
    ctx.fillStyle = DEEPER_24[3];
    ctx.fillRect(5, 6, 6, 4);

    // Glowing predator eyes (PALETTE.danger #d90429)
    ctx.fillStyle = hexToNumber(PALETTE.danger).toString(16).padStart(6, '0');
    ctx.fillStyle = PALETTE.danger;
    ctx.fillRect(5, 6, 2, 1);
    ctx.fillRect(9, 6, 2, 1);

    canvas.refresh();
  }

  private generateListenerTexture(): void {
    const canvas = this.scene.textures.createCanvas('spr_listener', TILE_SIZE, TILE_SIZE);
    if (!canvas) return;
    const ctx = canvas.context;
    ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Stationary stone base (#241e1a Dark Slate)
    ctx.fillStyle = DEEPER_24[2];
    ctx.fillRect(4, 8, 8, 7);
    ctx.fillStyle = DEEPER_24[4];
    ctx.fillRect(5, 9, 6, 5);

    // Acoustic horn / ear funnel (#9e6b22 Tarnished Gold & #e09f3e Warm Amber)
    ctx.fillStyle = DEEPER_24[10];
    ctx.fillRect(3, 3, 10, 4);
    ctx.fillStyle = DEEPER_24[11];
    ctx.fillRect(5, 2, 6, 2);
    ctx.fillRect(7, 1, 2, 1);

    // Central listening eye / aperture (#0a0908 Void)
    ctx.fillStyle = DEEPER_24[0];
    ctx.fillRect(7, 4, 2, 2);

    canvas.refresh();
  }

  private generateStalkerTexture(): void {
    const canvas = this.scene.textures.createCanvas('spr_stalker', TILE_SIZE, TILE_SIZE);
    if (!canvas) return;
    const ctx = canvas.context;
    ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Tall shadowy shroud (#161311 & #1a1429 Abyssal Trench)
    ctx.fillStyle = DEEPER_24[20];
    ctx.fillRect(4, 2, 8, 12);
    ctx.fillStyle = DEEPER_24[1];
    ctx.fillRect(5, 3, 6, 10);

    // Ethereal purple eyes (#7456b8 Abyssal Highlight)
    ctx.fillStyle = PALETTE.abyss;
    ctx.fillRect(6, 5, 1, 2);
    ctx.fillRect(9, 5, 1, 2);

    canvas.refresh();
  }

  private generatePhantomTexture(): void {
    const canvas = this.scene.textures.createCanvas('spr_phantom', TILE_SIZE, TILE_SIZE);
    if (!canvas) return;
    const ctx = canvas.context;
    ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Smoke / mist phantom (#806d5c Muted Stone)
    ctx.fillStyle = DEEPER_24[6];
    ctx.fillRect(5, 3, 6, 10);
    ctx.fillRect(4, 5, 8, 6);
    ctx.fillStyle = DEEPER_24[7];
    ctx.fillRect(6, 6, 4, 4);

    canvas.refresh();
  }

  private generateStatusIcons(): void {
    // Alert Icon (!)
    const canvasAlert = this.scene.textures.createCanvas('icon_alert', 8, 8);
    if (canvasAlert) {
      const ctx = canvasAlert.context;
      ctx.clearRect(0, 0, 8, 8);
      ctx.fillStyle = PALETTE.danger;
      ctx.fillRect(3, 1, 2, 4);
      ctx.fillRect(3, 6, 2, 1);
      canvasAlert.refresh();
    }

    // Suspicious Icon (?)
    const canvasSuspicious = this.scene.textures.createCanvas('icon_suspicious', 8, 8);
    if (canvasSuspicious) {
      const ctx = canvasSuspicious.context;
      ctx.clearRect(0, 0, 8, 8);
      ctx.fillStyle = PALETTE.goldAccent;
      ctx.fillRect(2, 1, 4, 1);
      ctx.fillRect(5, 2, 1, 2);
      ctx.fillRect(3, 4, 2, 1);
      ctx.fillRect(3, 6, 2, 1);
      canvasSuspicious.refresh();
    }
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
        if (this.floor.tiles[i] === 'WALL' && this.biome.wall_tint) {
          img.setTint(hexToNumber(this.biome.wall_tint));
        } else if (this.floor.tiles[i] === 'FLOOR' && this.biome.floor_tint) {
          img.setTint(hexToNumber(this.biome.floor_tint));
        } else {
          img.clearTint();
        }
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

    // Update oil flask lighting
    for (const img of this.flaskImages.values()) {
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

    // Update chest lighting
    for (const img of this.chestImages.values()) {
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

    // Update bargain pedestal lighting
    if (this.pedestalImage) {
      const x = Math.floor(this.pedestalImage.x / TILE_SIZE);
      const y = Math.floor(this.pedestalImage.y / TILE_SIZE);
      const idx = toIndex(x, y, this.floor.width);

      if (fog.visible[idx]) {
        this.pedestalImage.setVisible(true);
        this.pedestalImage.setAlpha(1.0);
        this.pedestalImage.clearTint();
      } else if (fog.explored[idx]) {
        this.pedestalImage.setVisible(true);
        this.pedestalImage.setAlpha(0.35);
        this.pedestalImage.setTint(memoryTint);
      } else {
        this.pedestalImage.setVisible(false);
      }
    }

    // Update monster lighting (monsters only visible when lit)
    for (const [id, img] of this.monsterImages.entries()) {
      const x = Math.floor(img.x / TILE_SIZE);
      const y = Math.floor(img.y / TILE_SIZE);
      const idx = toIndex(x, y, this.floor.width);
      const isVisible = Boolean(fog.visible[idx]);
      img.setVisible(isVisible);

      const overhead = this.monsterOverheads.get(id);
      if (overhead) {
        overhead.setVisible(isVisible);
      }
    }

    // Update hallucination lighting
    for (const img of this.hallucinationImages.values()) {
      const x = Math.floor(img.x / TILE_SIZE);
      const y = Math.floor(img.y / TILE_SIZE);
      const idx = toIndex(x, y, this.floor.width);
      img.setVisible(Boolean(fog.visible[idx]));
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

  /**
   * Synchronizes oil flask sprites with current active flasks on the floor.
   */
  public syncOilFlasks(flasks: readonly OilFlask[], fog: FogOfWar): void {
    const activeIds = new Set<string>();
    const memoryTint = hexToNumber(PALETTE.panelBorder);

    for (const flask of flasks) {
      activeIds.add(flask.id);
      let img = this.flaskImages.get(flask.id);

      if (!img) {
        img = this.scene.add.image(flask.x * TILE_SIZE, flask.y * TILE_SIZE, 'tile_oil_flask');
        img.setOrigin(0, 0);
        img.setDepth(5);
        this.flaskImages.set(flask.id, img);
      }

      const idx = toIndex(flask.x, flask.y, this.floor.width);
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

    for (const [id, img] of this.flaskImages.entries()) {
      if (!activeIds.has(id)) {
        img.destroy();
        this.flaskImages.delete(id);
      }
    }
  }

  /**
   * Synchronizes chest sprites (normal and cursed) with current active chests on the floor.
   */
  public syncChests(chests: readonly Chest[], fog: FogOfWar): void {
    const activeIds = new Set<string>();
    const memoryTint = hexToNumber(PALETTE.panelBorder);

    for (const chest of chests) {
      if (chest.isOpen) continue;
      activeIds.add(chest.id);
      let img = this.chestImages.get(chest.id);

      const textureKey = chest.isCursed ? 'tile_cursed_chest' : 'tile_chest';

      if (!img) {
        img = this.scene.add.image(chest.x * TILE_SIZE, chest.y * TILE_SIZE, textureKey);
        img.setOrigin(0, 0);
        img.setDepth(5);
        this.chestImages.set(chest.id, img);
      } else if (img.texture.key !== textureKey) {
        img.setTexture(textureKey);
      }

      const idx = toIndex(chest.x, chest.y, this.floor.width);
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

    for (const [id, img] of this.chestImages.entries()) {
      if (!activeIds.has(id)) {
        img.destroy();
        this.chestImages.delete(id);
      }
    }
  }

  /**
   * Synchronizes devil's bargain pedestal on even floors.
   */
  public syncBargainPedestal(pedestal: BargainPedestal | null | undefined, fog: FogOfWar): void {
    const memoryTint = hexToNumber(PALETTE.panelBorder);

    if (!pedestal || pedestal.isUsed) {
      if (this.pedestalImage) {
        this.pedestalImage.destroy();
        this.pedestalImage = null;
      }
      return;
    }

    if (!this.pedestalImage) {
      this.pedestalImage = this.scene.add.image(pedestal.x * TILE_SIZE, pedestal.y * TILE_SIZE, 'tile_bargain_altar');
      this.pedestalImage.setOrigin(0, 0);
      this.pedestalImage.setDepth(5);
    } else {
      this.pedestalImage.setPosition(pedestal.x * TILE_SIZE, pedestal.y * TILE_SIZE);
    }

    const idx = toIndex(pedestal.x, pedestal.y, this.floor.width);
    if (fog.visible[idx]) {
      this.pedestalImage.setVisible(true);
      this.pedestalImage.setAlpha(1.0);
      this.pedestalImage.clearTint();
    } else if (fog.explored[idx]) {
      this.pedestalImage.setVisible(true);
      this.pedestalImage.setAlpha(0.35);
      this.pedestalImage.setTint(memoryTint);
    } else {
      this.pedestalImage.setVisible(false);
    }
  }

  /**
   * Synchronizes monster sprites and overhead status icons.
   */
  public syncMonsters(monsters: readonly Monster[], fog: FogOfWar): void {
    const activeIds = new Set<string>();

    for (const monster of monsters) {
      activeIds.add(monster.id);
      let img = this.monsterImages.get(monster.id);

      if (!img) {
        const tex =
          monster.type === 'crawler'
            ? 'spr_crawler'
            : monster.type === 'listener'
              ? 'spr_listener'
              : 'spr_stalker';
        img = this.scene.add.image(monster.x * TILE_SIZE, monster.y * TILE_SIZE, tex);
        img.setOrigin(0, 0);
        img.setDepth(7);
        this.monsterImages.set(monster.id, img);
      } else {
        img.setPosition(monster.x * TILE_SIZE, monster.y * TILE_SIZE);
      }

      const idx = toIndex(monster.x, monster.y, this.floor.width);
      const isVisible = Boolean(fog.visible[idx]);
      img.setVisible(isVisible);

      // Overhead state icons (? or !)
      let overhead = this.monsterOverheads.get(monster.id);
      if (monster.state === 'CHASE' || monster.state === 'SUSPICIOUS') {
        const iconTex = monster.state === 'CHASE' ? 'icon_alert' : 'icon_suspicious';
        if (!overhead) {
          overhead = this.scene.add.image(
            monster.x * TILE_SIZE + 4,
            monster.y * TILE_SIZE - 6,
            iconTex
          );
          overhead.setOrigin(0, 0);
          overhead.setDepth(8);
          this.monsterOverheads.set(monster.id, overhead);
        } else {
          overhead.setTexture(iconTex);
          overhead.setPosition(monster.x * TILE_SIZE + 4, monster.y * TILE_SIZE - 6);
        }
        overhead.setVisible(isVisible);
      } else if (overhead) {
        overhead.setVisible(false);
      }
    }

    for (const [id, img] of this.monsterImages.entries()) {
      if (!activeIds.has(id)) {
        img.destroy();
        this.monsterImages.delete(id);
        const overhead = this.monsterOverheads.get(id);
        if (overhead) {
          overhead.destroy();
          this.monsterOverheads.delete(id);
        }
      }
    }
  }

  /**
   * Synchronizes psychological phantom hallucinations.
   */
  public syncHallucinations(hallucinations: readonly Hallucination[], fog: FogOfWar): void {
    const activeIds = new Set<string>();

    for (const h of hallucinations) {
      activeIds.add(h.id);
      let img = this.hallucinationImages.get(h.id);

      if (!img) {
        img = this.scene.add.image(h.x * TILE_SIZE, h.y * TILE_SIZE, 'spr_phantom');
        img.setOrigin(0, 0);
        img.setDepth(7);
        img.setAlpha(0.65);
        this.hallucinationImages.set(h.id, img);
      } else {
        img.setPosition(h.x * TILE_SIZE, h.y * TILE_SIZE);
      }

      const idx = toIndex(h.x, h.y, this.floor.width);
      img.setVisible(Boolean(fog.visible[idx]));
    }

    for (const [id, img] of this.hallucinationImages.entries()) {
      if (!activeIds.has(id)) {
        img.destroy();
        this.hallucinationImages.delete(id);
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
    for (const img of this.flaskImages.values()) {
      img.destroy();
    }
    this.flaskImages.clear();
    for (const img of this.chestImages.values()) {
      img.destroy();
    }
    this.chestImages.clear();
    if (this.pedestalImage) {
      this.pedestalImage.destroy();
      this.pedestalImage = null;
    }
    for (const img of this.monsterImages.values()) {
      img.destroy();
    }
    this.monsterImages.clear();
    for (const overhead of this.monsterOverheads.values()) {
      overhead.destroy();
    }
    this.monsterOverheads.clear();
    for (const img of this.hallucinationImages.values()) {
      img.destroy();
    }
    this.hallucinationImages.clear();
    if (this.playerSprite) {
      this.playerSprite.destroy();
      this.playerSprite = null;
    }
  }

  /**
   * Spawns bounded gold particle burst (§5 M9).
   * Capped to 8 particles to strictly respect the 60 FPS performance budget.
   */
  public spawnGoldParticles(tileX: number, tileY: number): void {
    const pixelX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const pixelY = tileY * TILE_SIZE + TILE_SIZE / 2;
    const count = 8;
    for (let i = 0; i < count; i++) {
      const p = this.scene.add.rectangle(pixelX, pixelY, 2, 2, hexToNumber(PALETTE.goldHighlight));
      p.setDepth(150);
      const angle = (Math.PI * 2 * i) / count;
      const speed = Phaser.Math.Between(15, 30);
      this.scene.tweens.add({
        targets: p,
        x: pixelX + Math.cos(angle) * speed,
        y: pixelY + Math.sin(angle) * speed - 5,
        alpha: 0,
        scale: 0.5,
        duration: 350,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }
}

