/**
 * ShopScene for DEEPER.
 * Subterranean outpost meta-progression shop:
 * - 6 persistent upgrades purchased solely with banked vault gold
 * - Keyboard shortcuts [1-6], [ESC] to return
 * - Transparent pricing and zero real-money or predatory retention mechanics.
 */

import Phaser from 'phaser';
import { defaultSaveStore } from '../services/SaveStore';
import {
  getUpgradeDefs,
  getUpgradeTier,
  getNextTierCost,
  canPurchaseUpgrade,
  purchaseUpgrade,
} from '../core/upgrades';
import { defaultAudioDirector } from '../audio/AudioDirector';
import { PALETTE, hexToNumber } from '../utils/palette';
import { t } from '../i18n';

export class ShopScene extends Phaser.Scene {
  private vaultBalanceText!: Phaser.GameObjects.Text;
  private upgradeContainers: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'ShopScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const save = defaultSaveStore.load();

    // Background fill
    this.add.rectangle(0, 0, width, height, hexToNumber(PALETTE.background)).setOrigin(0);

    // Title
    this.add
      .text(width / 2, 10, t('shop.title').toUpperCase(), {
        fontSize: '9px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Vault Balance Display Card
    this.vaultBalanceText = this.add
      .text(width / 2, 22, t('shop.vault_balance', { gold: save.bankedGold }), {
        fontSize: '8px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Render upgrade boxes
    this.renderUpgradeList();

    // Footer Return Hint
    const returnHint = this.add
      .text(width / 2, 172, t('shop.back_hint'), {
        fontSize: '7px',
        color: PALETTE.textDim,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    returnHint.on('pointerdown', () => this.returnToMenu());

    // Keyboard bindings
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape' || event.code === 'Space') {
          this.returnToMenu();
          return;
        }

        const digit = parseInt(event.key, 10);
        if (!isNaN(digit) && digit >= 1 && digit <= 6) {
          const defs = getUpgradeDefs();
          const target = defs[digit - 1];
          if (target) {
            this.handlePurchase(target.id);
          }
        }
      });
    }
  }

  private renderUpgradeList(): void {
    for (const c of this.upgradeContainers) {
      c.destroy();
    }
    this.upgradeContainers = [];

    const save = defaultSaveStore.load();
    const defs = getUpgradeDefs();

    // 2 columns of 3 items
    // Col 1: x = 80, Col 2: x = 240
    // Rows: y = 50, 88, 126
    const positions = [
      { x: 82, y: 50 },
      { x: 82, y: 90 },
      { x: 82, y: 130 },
      { x: 238, y: 50 },
      { x: 238, y: 90 },
      { x: 238, y: 130 },
    ];

    defs.forEach((def, index) => {
      const pos = positions[index];
      if (!pos) return;

      const container = this.add.container(pos.x, pos.y);
      const tier = getUpgradeTier(save.upgrades, def.id);
      const nextCost = getNextTierCost(save.upgrades, def.id);
      const isMaxed = tier >= def.maxTiers;
      const canBuy = !isMaxed && save.bankedGold >= (nextCost ?? 0);

      // Card Box
      const box = this.add
        .rectangle(
          0,
          0,
          150,
          36,
          hexToNumber(PALETTE.panel),
          canBuy ? 0.95 : 0.6
        )
        .setStrokeStyle(1, hexToNumber(canBuy ? PALETTE.goldAccent : PALETTE.panelBorder))
        .setInteractive({ useHandCursor: canBuy });

      // Title & Shortcut: [1] Name
      const nameText = this.add
        .text(-70, -12, `[${index + 1}] ${t(def.nameKey)}`, {
          fontSize: '7px',
          color: canBuy ? PALETTE.goldHighlight : PALETTE.text,
          fontFamily: 'monospace',
          fontStyle: 'bold',
        })
        .setOrigin(0, 0.5);

      // Tier text: Tier X/Y
      const tierText = this.add
        .text(70, -12, t('shop.tier', { current: tier, max: def.maxTiers }), {
          fontSize: '6px',
          color: isMaxed ? PALETTE.focus : PALETTE.textDim,
          fontFamily: 'monospace',
        })
        .setOrigin(1, 0.5);

      // Description text
      const descText = this.add
        .text(-70, -2, t(def.descKey), {
          fontSize: '6px',
          color: PALETTE.textDim,
          fontFamily: 'monospace',
          wordWrap: { width: 140 },
        })
        .setOrigin(0, 0.5);

      // Cost or MAXED status
      const statusString = isMaxed
        ? t('shop.maxed')
        : t('shop.cost', { gold: nextCost ?? 0 });

      const costText = this.add
        .text(70, 10, statusString, {
          fontSize: '6px',
          color: isMaxed
            ? PALETTE.focus
            : canBuy
            ? PALETTE.goldAccent
            : PALETTE.danger,
          fontFamily: 'monospace',
          fontStyle: 'bold',
        })
        .setOrigin(1, 0.5);

      box.on('pointerdown', () => {
        this.handlePurchase(def.id);
      });

      container.add([box, nameText, tierText, descText, costText]);
      this.upgradeContainers.push(container);
    });
  }

  private handlePurchase(id: string): void {
    const save = defaultSaveStore.load();
    if (!canPurchaseUpgrade(save.bankedGold, save.upgrades, id)) {
      return;
    }

    const result = purchaseUpgrade(save, id);
    if (result.success) {
      defaultSaveStore.save(result.newSave);
      defaultAudioDirector.playGoldChime();

      // Refresh balance and shop list
      this.vaultBalanceText.setText(
        t('shop.vault_balance', { gold: result.newSave.bankedGold })
      );
      this.renderUpgradeList();
    }
  }

  private returnToMenu(): void {
    this.scene.start('MenuScene');
  }
}
