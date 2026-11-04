// Flags skill descriptions that are unsafe as YAML (a plain value containing ": " or " #" can be rejected by strict parsers).
// Usage: node scripts/check-skill-yaml.mjs   (exit code 1 on any problem)
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), '.agents', 'skills');
if (!existsSync(dir)) { console.error('ERROR .agents/skills/ is missing'); process.exit(1); }
let bad = 0;
for (const name of readdirSync(dir)) {
  const file = join(dir, name, 'SKILL.md');
  if (!existsSync(file)) continue;
  const fm = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const line = fm && fm[1].split(/\r?\n/).find((l) => l.startsWith('description:'));
  if (!line) { console.error(`ERROR ${name}: no single-line description in frontmatter`); bad++; continue; }
  const value = line.slice('description:'.length).trim();
  const quoted = /^"(?:[^"\\]|\\.)*"$/.test(value) || /^'(?:[^']|'')*'$/.test(value);
  if (!quoted && !/^["']/.test(value) && (/: /.test(value) || / #/.test(value) || /^[>|[{&*!%@`]/.test(value))) {
    console.error(`ERROR ${name}: unquoted description is unsafe YAML; wrap the whole value in double quotes`);
    bad++;
  }
  if (/^["']/.test(value) && !quoted) { console.error(`ERROR ${name}: description has unbalanced or unescaped quotes`); bad++; }
}
console.log(bad ? `\nFAILED: ${bad} problem(s)` : 'OK: all skill descriptions are YAML-safe');
process.exit(bad ? 1 : 0);
