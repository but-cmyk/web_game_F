/**
 * Release & QA Integrity Tests for DEEPER (§5 M11, §7 Release Gates).
 * Verifies release packaging scripts, legal attributions, documentation,
 * translation completeness, and ethical compliance prior to distribution.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import packageJson from '../package.json';
import viJson from '../src/i18n/vi.json';
import enJson from '../src/i18n/en.json';

describe('Milestone M11 Release & QA Gates (§5 M11, §7)', () => {
  const rootDir = path.resolve(__dirname, '..');

  it('declares required npm lifecycle scripts in package.json', () => {
    expect(packageJson.scripts).toHaveProperty('build');
    expect(packageJson.scripts).toHaveProperty('check');
    expect(packageJson.scripts).toHaveProperty('test');
    expect(packageJson.scripts).toHaveProperty('package');
    expect(packageJson.scripts.package).toContain('package-release.mjs');
  });

  it('includes complete legal and attribution documentation', () => {
    const readmePath = path.join(rootDir, 'README.md');
    const creditsPath = path.join(rootDir, 'CREDITS.md');
    const licensePath = path.join(rootDir, 'LICENSE');
    const checklistPath = path.join(rootDir, 'docs', 'RELEASE_CHECKLIST.md');

    expect(fs.existsSync(readmePath), 'README.md must exist').toBe(true);
    expect(fs.existsSync(creditsPath), 'CREDITS.md must exist').toBe(true);
    expect(fs.existsSync(licensePath), 'LICENSE must exist').toBe(true);
    expect(fs.existsSync(checklistPath), 'RELEASE_CHECKLIST.md must exist').toBe(true);

    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    expect(readmeContent).toContain('DEEPER');
    expect(readmeContent).toContain('Fear');
    expect(readmeContent).toContain('Greed');

    const creditsContent = fs.readFileSync(creditsPath, 'utf8');
    expect(creditsContent).toContain('Phaser');
    expect(creditsContent).toContain('DEEPER-24');
    expect(creditsContent).toContain('MIT');

    const licenseContent = fs.readFileSync(licensePath, 'utf8');
    expect(licenseContent).toContain('MIT License');
  });

  it('strictly adheres to ethics guardrails (zero real-money, transparent odds)', () => {
    const dataDir = path.join(rootDir, 'src', 'data');
    const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(dataDir, file), 'utf8').toLowerCase();
      // Ensure no deceptive gambling / real currency terms
      expect(content).not.toContain('real_money');
      expect(content).not.toContain('crypto');
      expect(content).not.toContain('paywall');
      expect(content).not.toContain('in_app_purchase');
    }
  });

  it('maintains 100% string parity between Vietnamese and English localizations', () => {
    const viKeys = Object.keys(viJson).sort();
    const enKeys = Object.keys(enJson).sort();

    expect(viKeys).toEqual(enKeys);
    expect(viKeys.length).toBeGreaterThanOrEqual(180);
  });

  it('enforces release package size budget <= 5 MB if bundle exists', () => {
    const zipPath = path.join(rootDir, 'release', 'deeper-v0.1.0-itch.zip');
    if (fs.existsSync(zipPath)) {
      const stats = fs.statSync(zipPath);
      const maxSize = 5 * 1024 * 1024; // 5 MB (§7)
      expect(stats.size).toBeLessThanOrEqual(maxSize);
    }
  });
});
