// Mechanical review for DEEPER: fast regex checks for architecture, determinism and hygiene rules.
// It finds candidates; a human-style review still decides. ERROR = must fix or justify, WARN = look at it.
// Usage:
//   node .agents/skills/deeper-code-review/scripts/mechanical-review.mjs                scan src/ and tests/
//   node .agents/skills/deeper-code-review/scripts/mechanical-review.mjs --changed      only files changed vs merge-base(main)
//   node .agents/skills/deeper-code-review/scripts/mechanical-review.mjs --changed --base <git-ref>
//   node .agents/skills/deeper-code-review/scripts/mechanical-review.mjs --json
//   node .agents/skills/deeper-code-review/scripts/mechanical-review.mjs --selftest     verify the scanner itself
// Exit code 1 if any ERROR. WARN never fails the run.
import { readdirSync, readFileSync, existsSync, statSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';

const isTs = (p) => /\.tsx?$/.test(p);
const isSrc = (p) => /^src\/.+\.tsx?$/.test(p);
const isCore = (p) => /^src\/core\/.+\.tsx?$/.test(p);
const isTest = (p) => /^tests\/.+\.tsx?$/.test(p) || /^src\/.+\.(test|spec)\.tsx?$/.test(p);
const isViewLayer = (p) => /^src\/(scenes|views)\/.+\.tsx?$/.test(p);
const isData = (p) => /^src\/data\/.+\.json$/.test(p);
const I18N_KEY = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/i;

// Each rule: id, level, where (path predicate), re (global regex), raw (scan comments too), keep (optional match filter), msg.
const RULES = [
  { id: 'core-imports-phaser', level: 'ERROR', where: isCore, re: /from\s+['"]phaser['"]|require\(\s*['"]phaser['"]\s*\)|import\(\s*['"]phaser['"]\s*\)/g, msg: 'src/core must not import Phaser (plan sections 2 and 3)' },
  { id: 'core-imports-view', level: 'ERROR', where: isCore, re: /from\s+['"][^'"]*\/(scenes|views)\/[^'"]*['"]/g, msg: 'src/core must not import from scenes/ or views/' },
  { id: 'core-math-random', level: 'ERROR', where: isCore, re: /\bMath\.random\s*\(/g, msg: 'Math.random is banned in src/core; use Rng' },
  { id: 'core-clock', level: 'ERROR', where: isCore, re: /\b(?:Date\.now|performance\.now)\s*\(|new\s+Date\s*\(/g, msg: 'Wall clock breaks determinism in core; pass time in as a parameter' },
  { id: 'core-timers', level: 'WARN', where: isCore, re: /\b(?:setTimeout|setInterval|requestAnimationFrame)\s*\(/g, msg: 'Timers in core make logic async and untestable; drive logic by turns' },
  { id: 'view-math-random', level: 'WARN', where: (p) => isSrc(p) && !isCore(p) && !isTest(p), re: /\bMath\.random\s*\(/g, keepRaw: (line) => !/cosmetic/i.test(line), msg: 'Gameplay randomness must use Rng; mark purely cosmetic uses with a "cosmetic" comment' },
  { id: 'any-type', level: 'ERROR', where: isTs, re: /:\s*any\b|\bas\s+any\b|<any>|\bany\[\]|Array<any>|Record<[^>]*,\s*any>/g, msg: 'No any; use a precise type or unknown plus narrowing' },
  { id: 'ts-ignore', level: 'ERROR', where: isTs, raw: true, re: /@ts-ignore|@ts-nocheck/g, msg: 'Do not silence the type checker; fix the type' },
  { id: 'ts-expect-error', level: 'WARN', where: isTs, raw: true, re: /@ts-expect-error|eslint-disable/g, msg: 'Suppression needs a one-line reason and should be rare' },
  { id: 'empty-catch', level: 'ERROR', where: isTs, re: /catch\s*(?:\([^)]*\))?\s*\{\s*\}/g, msg: 'Errors must not be swallowed' },
  { id: 'console-debug', level: 'WARN', where: (p) => isSrc(p) && !isTest(p), re: /\bconsole\.(?:log|debug)\s*\(/g, msg: 'Remove debug logging before commit' },
  { id: 'todo-marker', level: 'WARN', where: isTs, raw: true, re: /\b(?:TODO|FIXME|HACK|XXX)\b/g, msg: 'Resolve it or move it to docs/STATUS.md Ideas' },
  { id: 'dynamic-code', level: 'ERROR', where: isSrc, re: /\beval\s*\(|new\s+Function\s*\(/g, msg: 'No dynamic code execution' },
  { id: 'inner-html', level: 'WARN', where: isSrc, re: /\.innerHTML\s*=/g, msg: 'innerHTML with dynamic text is an injection risk; use textContent' },
  { id: 'direct-storage', level: 'WARN', where: (p) => isSrc(p) && !p.startsWith('src/services/') && !isTest(p), re: /\b(?:localStorage|sessionStorage|indexedDB)\b/g, msg: 'Persist through SaveStore (src/services), not directly' },
  { id: 'hardcoded-ui-string', level: 'WARN', where: isViewLayer, re: /\.(?:text|setText)\(\s*(?:[^,()]+,\s*[^,()]+,\s*)?(['"`])((?:(?!\1).)*)\1/g, keep: (m) => /[A-Za-z\u00C0-\u1EF9]/.test(m[2]) && !I18N_KEY.test(m[2]), msg: 'Player-facing text must come from i18n keys' },
  { id: 'test-skipped', level: 'ERROR', where: isTest, re: /\b(?:it|test|describe)\.(?:skip|only)\b|\bx(?:it|describe)\s*\(|\bf(?:it|describe)\s*\(/g, msg: 'Skipped or focused test; never weaken tests to pass' },
  { id: 'test-tautology', level: 'ERROR', where: isTest, re: /expect\(\s*(true|false|1|0)\s*\)\.(?:toBe|toEqual)\(\s*\1\s*\)/g, msg: 'Assertion can never fail' },
  { id: 'test-weak-assert', level: 'WARN', where: isTest, re: /\.(?:toBeTruthy|toBeDefined)\(\)/g, msg: 'Weak assertion; assert the actual value' },
  { id: 'secret-like', level: 'ERROR', where: (p) => isTs(p) || /\.(json|mjs)$/.test(p), raw: true, re: /\b(?:api[_-]?key|secret|token|password)\b['"]?\s*[:=]\s*(['"`])[A-Za-z0-9_\-/+=]{16,}\1/gi, msg: 'Looks like a committed secret; use environment variables' },
];

const lineOf = (text, index) => text.slice(0, index).split('\n').length;
const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"`\\])\/\/.*$/gm, (m, p1) => p1 + ' '.repeat(m.length - p1.length));

function walk(root, dir, out) {
  const abs = join(root, dir);
  if (!existsSync(abs)) return out;
  for (const name of readdirSync(abs)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
    const rel = `${dir}/${name}`;
    if (statSync(join(root, rel)).isDirectory()) walk(root, rel, out);
    else if (/\.(tsx?|json|mjs)$/.test(name)) out.push(rel);
  }
  return out;
}

function checkData(rel, text, add) {
  let json;
  try { json = JSON.parse(text); } catch (e) { add('data-invalid-json', 'ERROR', rel, 1, `Invalid JSON: ${e.message}`); return; }
  const visit = (node, path) => {
    if (Array.isArray(node)) node.forEach((n, i) => visit(n, `${path}[${i}]`));
    else if (node && typeof node === 'object') {
      if (typeof node.id === 'string' && !/^[a-z0-9]+(_[a-z0-9]+)*$/.test(node.id)) add('data-id-case', 'ERROR', rel, 1, `id "${node.id}" at ${path} must be snake_case`);
      if ('weight' in node && !(typeof node.weight === 'number' && node.weight > 0)) add('data-weight', 'ERROR', rel, 1, `weight at ${path} must be a number > 0`);
      for (const [k, v] of Object.entries(node)) visit(v, `${path}.${k}`);
    }
  };
  visit(json, '$');
}

export function scan(root, { only = null } = {}) {
  const findings = [];
  const add = (rule, level, file, line, msg) => findings.push({ rule, level, file, line, msg });
  const all = [...walk(root, 'src', []), ...walk(root, 'tests', [])];
  const testIndex = all.filter(isTest).map((p) => p.toLowerCase());
  const files = only ? all.filter((f) => only.includes(f)) : all;
  for (const rel of files) {
    const raw = readFileSync(join(root, rel), 'utf8');
    if (isData(rel)) { checkData(rel, raw, add); continue; }
    if (!isTs(rel)) continue;
    const code = stripComments(raw);
    const rawLines = raw.split('\n');
    for (const r of RULES) {
      if (!r.where(rel)) continue;
      for (const m of (r.raw ? raw : code).matchAll(r.re)) {
        if (r.keep && !r.keep(m)) continue;
        const line = lineOf(r.raw ? raw : code, m.index);
        if (r.keepRaw && !r.keepRaw(rawLines[line - 1] || '')) continue;
        add(r.id, r.level, rel, line, r.msg);
      }
    }
    const lines = rawLines.length;
    if (isSrc(rel) && !isTest(rel) && lines > 300) add('file-length', 'WARN', rel, 1, `${lines} lines; keep files under 300 lines`);
    const core = rel.match(/^src\/core\/(?:.+\/)?([^/]+)\.ts$/);
    if (core && !['index', 'types'].includes(core[1]) && !testIndex.some((t) => t.includes(core[1].toLowerCase()))) {
      add('core-missing-test', 'WARN', rel, 1, `No test file mentioning "${core[1]}" under tests/`);
    }
  }
  return findings;
}

function changedFiles(base) {
  const sh = (cmd) => {
    try { return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').map((s) => s.trim()).filter(Boolean); }
    catch { return null; }
  };
  let ref = base;
  if (!ref) for (const b of ['main', 'master']) { const r = sh(`git merge-base HEAD ${b}`); if (r && r[0]) { ref = r[0]; break; } }
  if (!ref) ref = 'HEAD';
  const tracked = sh(`git diff --name-only --diff-filter=ACMR ${ref}`);
  if (tracked === null) return null;
  return [...new Set([...tracked, ...(sh('git ls-files --others --exclude-standard') || [])])];
}

function selftest() {
  const root = mkdtempSync(join(tmpdir(), 'deeper-review-'));
  const put = (rel, text) => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), text); };
  put('src/core/bad.ts', "import Phaser from 'phaser';\nconst a = Math.random();\nconst t = Date.now();\nconst x: any = 1;\ntry { run(); } catch (e) {}\n// Math.random in a comment is fine\n");
  put('src/core/good.ts', 'export const add = (a: number, b: number): number => a + b;\n');
  put('src/scenes/menu.ts', "this.add.text(10, 10, 'Start the run');\nthis.add.text(10, 30, t('menu.start'));\nconsole.log('x');\nconst s = localStorage.getItem('k');\n");
  put('tests/bad.test.ts', "it.skip('x', () => {});\nexpect(true).toBe(true);\n");
  put('src/data/items.json', '{"items":[{"id":"BadId","weight":0}]}');
  put('src/services/store.ts', "const k = { apiKey: 'abcd1234abcd1234abcd1234' };\n");
  const found = scan(root);
  rmSync(root, { recursive: true, force: true });
  const has = (rule, file) => found.some((f) => f.rule === rule && f.file === file);
  const expected = [
    ['core-imports-phaser', 'src/core/bad.ts'], ['core-math-random', 'src/core/bad.ts'], ['core-clock', 'src/core/bad.ts'],
    ['any-type', 'src/core/bad.ts'], ['empty-catch', 'src/core/bad.ts'], ['hardcoded-ui-string', 'src/scenes/menu.ts'],
    ['console-debug', 'src/scenes/menu.ts'], ['direct-storage', 'src/scenes/menu.ts'], ['test-skipped', 'tests/bad.test.ts'],
    ['test-tautology', 'tests/bad.test.ts'], ['data-id-case', 'src/data/items.json'], ['data-weight', 'src/data/items.json'],
    ['secret-like', 'src/services/store.ts'], ['core-missing-test', 'src/core/good.ts'],
  ];
  const problems = expected.filter(([r, f]) => !has(r, f)).map(([r, f]) => `MISSED ${r} in ${f}`);
  if (found.filter((f) => f.file === 'src/core/good.ts' && f.level === 'ERROR').length) problems.push('FALSE POSITIVE on src/core/good.ts');
  if (found.filter((f) => f.rule === 'core-math-random').length !== 1) problems.push('Math.random in a comment was flagged, or the real one was missed');
  if (found.some((f) => f.rule === 'hardcoded-ui-string' && f.line === 2)) problems.push('i18n key flagged as hard-coded string');
  problems.forEach((p) => console.error('SELFTEST FAIL ' + p));
  console.log(problems.length ? `\nSELFTEST FAILED: ${problems.length} problem(s)` : `SELFTEST OK: ${expected.length} expected findings detected, no false positives on clean code`);
  process.exit(problems.length ? 1 : 0);
}

const args = process.argv.slice(2);
if (args.includes('--selftest')) selftest();
const root = process.cwd();
if (!existsSync(join(root, 'src'))) { console.log('No src/ directory yet; nothing to scan.'); process.exit(0); }
let only = null;
if (args.includes('--changed')) {
  const b = args.indexOf('--base');
  only = changedFiles(b >= 0 ? args[b + 1] : null);
  if (only === null) console.warn('WARN  git unavailable; scanning everything instead of changed files');
}
const findings = scan(root, { only }).sort((a, b) => (a.level === b.level ? 0 : a.level === 'ERROR' ? -1 : 1));
if (args.includes('--json')) console.log(JSON.stringify(findings, null, 2));
else {
  for (const f of findings) console.log(`${f.level.padEnd(5)} ${f.rule.padEnd(20)} ${f.file}:${f.line}  ${f.msg}`);
  const e = findings.filter((f) => f.level === 'ERROR').length;
  console.log(`\n${e} error(s), ${findings.length - e} warning(s), ${new Set(findings.map((f) => f.file)).size} file(s) with findings`);
}
process.exit(findings.some((f) => f.level === 'ERROR') ? 1 : 0);

