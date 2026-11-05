/**
 * SettingsScene for DEEPER (§5 M9 & M10).
 * Controls game audio, accessibility toggles (photosensitivity & motion safety),
 * language selection (vi / en), 45-minute break reminders (§4.11 Rule 6),
 * and opt-in anonymous telemetry consent & data wipe (§4.11 Rule 7).
 * Strict compliance with .agents/rules/ethics-guardrails.md.
 */

import Phaser from 'phaser';
import { defaultSaveStore, GameSettings, DEFAULT_SETTINGS } from '../services/SaveStore';
import { t, setLocale, getLocale, Locale } from '../i18n';
import { defaultAudioDirector } from '../audio/AudioDirector';
import { PALETTE, hexToNumber } from '../utils/palette';

export class SettingsScene extends Phaser.Scene {
  private settings!: GameSettings;
  private activeModal: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: 'SettingsScene' });
  }

  create(): void {
    const save = defaultSaveStore.load();
    this.settings = save.settings ? { ...save.settings } : { ...DEFAULT_SETTINGS };

    this.renderSettingsUI();

    // ESC or Backspace returns to MenuScene (unless modal is open)
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (this.activeModal) {
        if (event.key === 'Escape') {
          this.closeModal();
        }
        return;
      }
      if (event.key === 'Escape' || event.key === 'Backspace') {
        this.returnToMenu();
      }
    });
  }

  private renderSettingsUI(): void {
    this.children.removeAll();

    const { width, height } = this.scale;

    // Dark Background
    this.add.rectangle(0, 0, width, height, hexToNumber(PALETTE.background)).setOrigin(0);

    // Title
    this.add
      .text(width / 2, 11, t('settings.title').toUpperCase(), {
        fontSize: '9px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Divider line
    this.add
      .rectangle(width / 2, 19, 280, 1, hexToNumber(PALETTE.panelBorder))
      .setOrigin(0.5);

    const startY = 28;
    const rowGap = 11.5;
    const labelX = 22;
    const controlX = width - 22;

    // 1. Master Volume
    this.createVolumeRow(
      labelX,
      controlX,
      startY,
      t('settings.master_vol'),
      this.settings.masterVolume,
      (newVol) => {
        this.settings = { ...this.settings, masterVolume: newVol };
        this.saveSettings();
        defaultAudioDirector.setMasterVolume(newVol);
        this.renderSettingsUI();
      }
    );

    // 2. SFX Volume
    this.createVolumeRow(
      labelX,
      controlX,
      startY + rowGap,
      t('settings.sfx_vol'),
      this.settings.sfxVolume,
      (newVol) => {
        this.settings = { ...this.settings, sfxVolume: newVol };
        this.saveSettings();
        defaultAudioDirector.setSfxVolume(newVol);
        this.renderSettingsUI();
      }
    );

    // 3. Ambient Volume
    this.createVolumeRow(
      labelX,
      controlX,
      startY + rowGap * 2,
      t('settings.ambient_vol'),
      this.settings.ambientVolume,
      (newVol) => {
        this.settings = { ...this.settings, ambientVolume: newVol };
        this.saveSettings();
        this.renderSettingsUI();
      }
    );

    // 4. Reduce Flash (Photosensitivity Guardrail)
    this.createToggleRow(
      labelX,
      controlX,
      startY + rowGap * 3,
      t('settings.reduce_flash'),
      this.settings.reduceFlash,
      (val) => {
        this.settings = { ...this.settings, reduceFlash: val };
        this.saveSettings();
        this.renderSettingsUI();
      }
    );

    // 5. Reduce Shake (Motion Sickness Guardrail)
    this.createToggleRow(
      labelX,
      controlX,
      startY + rowGap * 4,
      t('settings.reduce_shake'),
      this.settings.reduceShake,
      (val) => {
        this.settings = { ...this.settings, reduceShake: val };
        this.saveSettings();
        this.renderSettingsUI();
      }
    );

    // 6. High Contrast
    this.createToggleRow(
      labelX,
      controlX,
      startY + rowGap * 5,
      t('settings.high_contrast'),
      this.settings.highContrast,
      (val) => {
        this.settings = { ...this.settings, highContrast: val };
        this.saveSettings();
        this.renderSettingsUI();
      }
    );

    // 7. Language Selector (vi / en)
    this.createLanguageRow(labelX, controlX, startY + rowGap * 6);

    // 8. 45-Min Break Reminder (§4.11 Rule 6)
    this.createToggleRow(
      labelX,
      controlX,
      startY + rowGap * 7,
      t('settings.break_reminder'),
      this.settings.breakReminder ?? true,
      (val) => {
        this.settings = { ...this.settings, breakReminder: val };
        this.saveSettings();
        this.renderSettingsUI();
      }
    );

    // 9. Opt-in Anonymous Telemetry (§4.11 Rule 7)
    this.createToggleRow(
      labelX,
      controlX,
      startY + rowGap * 8,
      t('settings.telemetry_consent'),
      this.settings.telemetryConsent ?? false,
      (val) => {
        this.settings = { ...this.settings, telemetryConsent: val };
        this.saveSettings();
        this.renderSettingsUI();
      }
    );

    // 10. Wipe All Data Button (§4.11 Rule 7)
    const wipeBtnY = startY + rowGap * 9 + 4;
    const wipeBtn = this.add
      .rectangle(width / 2, wipeBtnY, 150, 13, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.danger))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, wipeBtnY, t('settings.wipe_data_btn'), {
        fontSize: '6px',
        color: PALETTE.danger,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    wipeBtn.on('pointerdown', () => this.showWipeConfirmModal());

    // Back to Menu Button
    const backBtn = this.add
      .rectangle(width / 2, height - 12, 140, 15, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.focus))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, height - 12, t('settings.back_btn').toUpperCase(), {
        fontSize: '6.5px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    backBtn.on('pointerdown', () => this.returnToMenu());
  }

  private createVolumeRow(
    labelX: number,
    controlX: number,
    y: number,
    label: string,
    currentVal: number,
    onChange: (val: number) => void
  ): void {
    this.add
      .text(labelX, y, label, {
        fontSize: '6px',
        color: PALETTE.text,
        fontFamily: 'monospace',
      })
      .setOrigin(0, 0.5);

    const pct = Math.round(currentVal * 100);

    const downBtn = this.add
      .text(controlX - 38, y, '[-]', {
        fontSize: '6.5px',
        color: currentVal > 0 ? PALETTE.goldHighlight : PALETTE.textDim,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(controlX - 18, y, `${pct}%`, {
        fontSize: '6px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    const upBtn = this.add
      .text(controlX, y, '[+]', {
        fontSize: '6.5px',
        color: currentVal < 1.0 ? PALETTE.goldHighlight : PALETTE.textDim,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    downBtn.on('pointerdown', () => {
      const next = Math.max(0, Math.round((currentVal - 0.1) * 10) / 10);
      onChange(next);
    });

    upBtn.on('pointerdown', () => {
      const next = Math.min(1.0, Math.round((currentVal + 0.1) * 10) / 10);
      onChange(next);
    });
  }

  private createToggleRow(
    labelX: number,
    controlX: number,
    y: number,
    label: string,
    enabled: boolean,
    onToggle: (val: boolean) => void
  ): void {
    this.add
      .text(labelX, y, label, {
        fontSize: '6px',
        color: PALETTE.text,
        fontFamily: 'monospace',
      })
      .setOrigin(0, 0.5);

    const textLabel = enabled ? t('settings.on') : t('settings.off');
    const color = enabled ? PALETTE.goldHighlight : PALETTE.textDim;

    const btn = this.add
      .text(controlX - 8, y, `[ ${textLabel} ]`, {
        fontSize: '6.5px',
        color,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      onToggle(!enabled);
    });
  }

  private createLanguageRow(labelX: number, controlX: number, y: number): void {
    this.add
      .text(labelX, y, t('settings.language'), {
        fontSize: '6px',
        color: PALETTE.text,
        fontFamily: 'monospace',
      })
      .setOrigin(0, 0.5);

    const currentLang = getLocale();
    const btn = this.add
      .text(controlX - 16, y, `[ ${currentLang === 'vi' ? 'TIẾNG VIỆT' : 'ENGLISH'} ]`, {
        fontSize: '6.5px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      const newLang: Locale = currentLang === 'vi' ? 'en' : 'vi';
      setLocale(newLang);
      this.settings = { ...this.settings, language: newLang };
      this.saveSettings();
      this.renderSettingsUI();
    });
  }

  private showWipeConfirmModal(): void {
    this.closeModal();

    const { width, height } = this.scale;
    const container = this.add.container(width / 2, height / 2).setDepth(200);
    this.activeModal = container;

    // Dark backdrop
    const overlay = this.add
      .rectangle(0, 0, width, height, hexToNumber(PALETTE.background), 0.8)
      .setOrigin(0.5);

    // Modal frame
    const frame = this.add
      .rectangle(0, 0, 240, 80, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.danger))
      .setOrigin(0.5);

    const title = this.add
      .text(0, -26, t('settings.wipe_confirm_title'), {
        fontSize: '7px',
        color: PALETTE.danger,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const msg = this.add
      .text(0, -8, t('settings.wipe_confirm_msg'), {
        fontSize: '5.5px',
        color: PALETTE.text,
        fontFamily: 'monospace',
        wordWrap: { width: 220 },
        align: 'center',
      })
      .setOrigin(0.5);

    // Cancel Button
    const cancelBtn = this.add
      .rectangle(-55, 20, 80, 16, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.focus))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const cancelText = this.add
      .text(-55, 20, t('settings.wipe_cancel_btn'), {
        fontSize: '6.5px',
        color: PALETTE.focus,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    cancelBtn.on('pointerdown', () => this.closeModal());

    // Confirm Wipe Button
    const confirmBtn = this.add
      .rectangle(55, 20, 80, 16, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.danger))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const confirmText = this.add
      .text(55, 20, t('settings.wipe_confirm_btn'), {
        fontSize: '6.5px',
        color: PALETTE.danger,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    confirmBtn.on('pointerdown', () => {
      defaultSaveStore.clear();
      this.settings = { ...DEFAULT_SETTINGS };
      this.saveSettings();
      this.closeModal();
      this.renderSettingsUI();
      this.showToast(t('settings.wiped_toast'));
    });

    container.add([overlay, frame, title, msg, cancelBtn, cancelText, confirmBtn, confirmText]);
  }

  private closeModal(): void {
    if (this.activeModal) {
      this.activeModal.destroy();
      this.activeModal = null;
    }
  }

  private showToast(message: string): void {
    const { width } = this.scale;
    const toast = this.add
      .text(width / 2, 28, message, {
        fontSize: '6.5px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        backgroundColor: '#161311ee',
        padding: { x: 6, y: 3 },
      })
      .setDepth(250)
      .setOrigin(0.5);

    this.tweens.add({
      targets: toast,
      alpha: 0,
      y: 20,
      delay: 1500,
      duration: 500,
      onComplete: () => toast.destroy(),
    });
  }

  private saveSettings(): void {
    const save = defaultSaveStore.load();
    defaultSaveStore.save({
      ...save,
      settings: this.settings,
      reduceMotion: this.settings.reduceShake,
    });
  }

  private returnToMenu(): void {
    this.scene.start('MenuScene');
  }
}
