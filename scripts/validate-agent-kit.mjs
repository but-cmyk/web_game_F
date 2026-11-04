// Validates the Antigravity agent kit: skills, rules, AGENTS.md, .gitignore, legacy workflows.
// Usage: node scripts/validate-agent-kit.mjs   (exit code 1 on any error)
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return null;
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim();
  }
  return data;
}

// 1. AGENTS.md
const agents = join(ROOT, 'AGENTS.md');
if (!existsSync(agents)) err('AGENTS.md is missing at repo root');
else if (statSync(agents).size > 24000) err('AGENTS.md exceeds 24,000 bytes');

// 2. Skills
const skillsDir = join(ROOT, '.agents', 'skills');
if (!existsSync(skillsDir)) err('.agents/skills/ is missing');
else {
  const folders = readdirSync(skillsDir).filter((f) => statSync(join(skillsDir, f)).isDirectory());
  if (folders.length === 0) err('No skill folders found');
  for (const f of folders) {
    const file = join(skillsDir, f, 'SKILL.md');
    if (!existsSync(file)) { err(`${f}: SKILL.md missing`); continue; }
    const text = readFileSync(file, 'utf8');
    const fm = parseFrontmatter(text);
    if (!fm) { err(`${f}: missing YAML frontmatter`); continue; }
    if (!fm.description) err(`${f}: frontmatter has no description`);
    else if (fm.description.length < 80) warn(`${f}: description is short (${fm.description.length} chars); make it more specific`);
    else if (fm.description.length > 900) warn(`${f}: description is very long (${fm.description.length} chars)`);
    if (fm.name && fm.name !== f) err(`${f}: name "${fm.name}" does not match folder name`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(f)) err(`${f}: folder name must be kebab-case`);
    const lines = text.split(/\r?\n/).length;
    if (lines > 500) err(`${f}: SKILL.md has ${lines} lines (max 500); move detail into resources/`);
  }
}

// 3. Rules
const rulesDir = join(ROOT, '.agents', 'rules');
const TRIGGERS = new Set(['always_on', 'model_decision', 'glob', 'manual']);
if (existsSync(rulesDir)) {
  for (const f of readdirSync(rulesDir).filter((x) => x.endsWith('.md'))) {
    const file = join(rulesDir, f);
    const text = readFileSync(file, 'utf8');
    const fm = parseFrontmatter(text);
    if (!fm) { err(`rules/${f}: missing frontmatter (rule would be silently discarded)`); continue; }
    if (!TRIGGERS.has(fm.trigger)) err(`rules/${f}: invalid trigger "${fm.trigger}" (allowed: ${[...TRIGGERS].join(', ')})`);
    if (fm.trigger === 'glob' && !fm.globs) err(`rules/${f}: trigger glob requires globs`);
    if (fm.trigger === 'model_decision' && !fm.description) err(`rules/${f}: model_decision requires description`);
    if (Buffer.byteLength(text) > 24000) err(`rules/${f}: exceeds 24,000 bytes`);
  }
} else warn('.agents/rules/ not found');

// 4. Legacy workflows must not exist (stopped working on 2026-10-19)
if (existsSync(join(ROOT, '.agents', 'workflows'))) err('.agents/workflows/ exists; use skills instead');

// 5. .gitignore must not hide .agents
const gi = join(ROOT, '.gitignore');
if (existsSync(gi)) {
  const bad = readFileSync(gi, 'utf8').split(/\r?\n/).some((l) => /^\/?\.agents\/?\*?$/.test(l.trim()));
  if (bad) err('.gitignore ignores .agents/ (Antigravity will not index it)');
}

for (const w of warnings) console.warn('WARN  ' + w);
for (const e of errors) console.error('ERROR ' + e);
console.log(errors.length ? `\nFAILED: ${errors.length} error(s)` : '\nOK: agent kit is valid');
process.exit(errors.length ? 1 : 0);
