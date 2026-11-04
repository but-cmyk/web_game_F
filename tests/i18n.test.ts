import { describe, it, expect, beforeEach } from 'vitest';
import { t, setLocale, getLocale } from '../src/i18n';
import viCatalog from '../src/i18n/vi.json';
import enCatalog from '../src/i18n/en.json';

describe('i18n Localization', () => {
  beforeEach(() => {
    setLocale('vi');
  });

  it('defaults to Vietnamese locale', () => {
    expect(getLocale()).toBe('vi');
  });

  it('retrieves localized string for active locale', () => {
    setLocale('vi');
    expect(t('game.title')).toBe('DEEPER — Sâu Thêm Chút Nữa');

    setLocale('en');
    expect(t('game.title')).toBe('DEEPER — Into the Dark');
  });

  it('interpolates dynamic parameters correctly', () => {
    setLocale('vi');
    expect(t('hud.depth', { depth: 3 })).toBe('Tầng 3');

    setLocale('en');
    expect(t('hud.depth', { depth: 3 })).toBe('Floor 3');
  });

  it('falls back to key if translation is missing', () => {
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('enforces 100% key parity between vi.json and en.json', () => {
    const viKeys = Object.keys(viCatalog).sort();
    const enKeys = Object.keys(enCatalog).sort();

    expect(viKeys).toEqual(enKeys);
  });
});

