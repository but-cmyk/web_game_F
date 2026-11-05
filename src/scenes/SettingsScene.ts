/**
 * SettingsScene for DEEPER (§5 M9).
 * Controls game audio, accessibility toggles (photosensitivity & motion safety),
 * and language selection (vi / en).
 * Strict compliance with .agents/rules/ethics-guardrails.md.
 */

import Phaser from 'phaser';
import { defaultSaveStore, GameSettings, DEFAULT_SETTINGS } from '../services/SaveStore';
import { t, setLocale, getLocale, Locale } from '../i18n';
import { defaultAudioDirector } from '../audio/AudioDirector';
import { PALETTE, hexToNumber } from '../utils/palette';

export class SettingsScene extends Phaser.Scene {
  private settings!: GameSettings;

  constructor() {
    super({ key: 'SettingsScene' });
  }

  create(): void {
    const save = defaultSaveStore.load();
    this.settings = save.settings ? { ...save.settings } : { ...DEFAULT_SETTINGS };

    this.renderSettingsUI();

    // ESC or Backspace returns to MenuScene
    this.input.keyboard?.on('keydown-ESC', () => this.returnToMenu());
    this.input.keyboard?.on('keydown-BACKSPACE', () => this.returnToMenu());
  }

  private renderSettingsUI(): void {
    this.children.removeAll();

    const { width, height } = this.scale;

    // Dark Background
    this.add.rectangle(0, 0, width, height, hexToNumber(PALETTE.background)).setOrigin(0);

    // Title
    this.add
      .text(width / 2, 14, t('settings.title').toUpperCase(), {
        fontSize: '10px',
        color: PALETTE.goldHighlight,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Divider line
    this.add
      .rectangle(width / 2, 23, 280, 1, hexToNumber(PALETTE.panelBorder))
      .setOrigin(0.5);

    const startY = 36;
    const rowGap = 16;
    const labelX = 26;
    const controlX = width - 26;

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

    // Back to Menu Button
    const backBtn = this.add
      .rectangle(width / 2, height - 16, 140, 18, hexToNumber(PALETTE.panel), 0.95)
      .setStrokeStyle(1, hexToNumber(PALETTE.focus))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, height - 16, t('settings.back_btn').toUpperCase(), {
        fontSize: '7px',
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
        fontSize: '6.5px',
        color: PALETTE.text,
        fontFamily: 'monospace',
      })
      .setOrigin(0, 0.5);

    // [ - ] [ 80% ] [ + ]
    const pct = Math.round(currentVal * 100);

    const downBtn = this.add
      .text(controlX - 44, y, '[-]', {
        fontSize: '7px',
        color: currentVal > 0 ? PALETTE.goldHighlight : PALETTE.textDim,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(controlX - 22, y, `${pct}%`, {
        fontSize: '6.5px',
        color: PALETTE.goldAccent,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    const upBtn = this.add
      .text(controlX, y, '[+]', {
        fontSize: '7px',
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
        fontSize: '6.5px',
        color: PALETTE.text,
        fontFamily: 'monospace',
      })
      .setOrigin(0, 0.5);

    const textLabel = enabled ? t('settings.on') : t('settings.off');
    const color = enabled ? PALETTE.goldHighlight : PALETTE.textDim;

    const btn = this.add
      .text(controlX - 10, y, `[ ${textLabel} ]`, {
        fontSize: '7px',
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
        fontSize: '6.5px',
        color: PALETTE.text,
        fontFamily: 'monospace',
      })
      .setOrigin(0, 0.5);

    const currentLang = getLocale();
    const btn = this.add
      .text(controlX - 18, y, `[ ${currentLang === 'vi' ? 'TIẾNG VIỆT' : 'ENGLISH'} ]`, {
        fontSize: '7px',
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
