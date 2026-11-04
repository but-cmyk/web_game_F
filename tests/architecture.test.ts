import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

interface Finding {
  rule: string;
  level: 'ERROR' | 'WARN';
  file: string;
  line: number;
  msg: string;
}

describe('Architecture & Core Isolation', () => {
  it('passes mechanical review with zero ERROR findings', () => {
    let findings: Finding[] = [];
    try {
      const output = execSync('node .agents/skills/deeper-code-review/scripts/mechanical-review.mjs --json', {
        encoding: 'utf8',
      });
      findings = JSON.parse(output);
    } catch (err: unknown) {
      const errorWithStdout = err as { stdout?: string };
      if (errorWithStdout.stdout) {
        findings = JSON.parse(errorWithStdout.stdout);
      } else {
        throw err;
      }
    }
    const errors = findings.filter((f) => f.level === 'ERROR');
    expect(errors).toHaveLength(0);
  });

  it('ensures .gitignore does not hide .agents', () => {
    if (existsSync('.gitignore')) {
      const gitignore = readFileSync('.gitignore', 'utf8');
      const lines = gitignore.split(/\r?\n/).map((l: string) => l.trim());
      const ignoresAgents = lines.some((l: string) => /^\/?\.agents\/?\*?$/.test(l));
      expect(ignoresAgents).toBe(false);
    }
  });
});
