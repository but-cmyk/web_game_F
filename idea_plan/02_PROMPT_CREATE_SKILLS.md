# PROMPT 02 — Tạo skill, luật và tài liệu theo dõi (CHƯA viết code game)

**Hướng dẫn dùng (cho bạn, không dán vào Antigravity):**

1. Điều kiện: repo đã có `docs/IMPLEMENTATION_PLAN.md` (chép từ `01_IMPLEMENTATION_PLAN.md`) và đã commit. Antigravity đang chọn **Gemini 3.8 Flash**, effort medium (nếu chọn được).
2. Mở **hội thoại mới**, dán toàn bộ phần nằm giữa `PROMPT START` và `PROMPT END`.
3. Agent tạo `AGENTS.md`, 3 rule, 7 skill (kèm thư mục `resources/`), 3 tài liệu theo dõi, script kiểm tra và `docs/SKILLS_AUDIT.md`, rồi **dừng** và báo cáo bằng tiếng Việt. Nó không được làm M0.
4. Bạn đọc `docs/SKILLS_AUDIT.md` (mô tả skill có kích hoạt đúng không), chạy `node scripts/validate-agent-kit.mjs`, xem nhánh `chore/agent-kit`, rồi merge.
5. Phần prompt viết bằng tiếng Anh vì model theo chỉ dẫn kỹ thuật tiếng Anh chính xác và tiết kiệm token hơn; agent vẫn trả lời bạn bằng tiếng Việt.
6. Nếu agent báo tài liệu chính thức của Antigravity khác với mô tả trong prompt, hãy tin tài liệu chính thức và để agent sửa theo.

---

PROMPT START

# TASK: Build the agent kit for the DEEPER project (skills + rules + tracking docs). Do NOT write any game code.

## Role
You are the senior engineer preparing the working environment for a long, milestone-based build of "DEEPER", a pixel roguelike web game. A different conversation will later implement the milestones using only what you create now. The quality of skill descriptions and instructions is the whole point of this task: write them so that a fast, cost-efficient model (Gemini 3.8 Flash) follows them precisely without wandering.

## Read first, in this order
1. `docs/IMPLEMENTATION_PLAN.md` (read the whole file). If it does not exist: STOP and tell me in Vietnamese, change nothing.
2. List the repo tree once. Do not modify anything outside the files named under "Deliverables".

## Hard constraints
- No game code. No `npm install`. No `package.json` edits. Only create the files listed under "Deliverables".
- Never create `.agents/workflows/` (legacy workflows stopped working on 2026-10-19). Never add `.agents` to `.gitignore`.
- Reply to me in Vietnamese. Every file you write is in English.
- Single source of truth: skills describe PROCEDURES and INVARIANTS and point to sections of `docs/IMPLEMENTATION_PLAN.md` for numbers. Do not copy numeric tables from the plan into skills (they would drift). Tiny invariants named in the briefs below are the only exception.
- Do not change anything the plan marks `[LOCKED]`.
- Be decisive. Do not re-read the repo repeatedly, do not write long explanations in chat, prefer tool calls. If two options are equally good, pick the simpler one and note it in `docs/DECISIONS.md`.

## Format facts (verified Oct 2026 from third-party documentation; if the IDE's own docs differ, follow the IDE docs, apply them, and tell me what differed)
- Skill = folder `.agents/skills/<kebab-name>/SKILL.md` with YAML frontmatter. `description` is required; `name` is optional and must equal the folder name if present. The description is ALL the agent sees until it decides to open the skill, so it must say what the skill does and when to use it, and be slightly pushy so it is not under-triggered.
- Optional subfolders: `scripts/`, `examples/`, `resources/`. Keep each SKILL.md under 300 lines (hard limit 500). Put long lists and tables in `resources/*.md` and link them from SKILL.md with one line saying when to read them.
- `AGENTS.md` at the repo root is always on and has no frontmatter. Files in `.agents/rules/*.md` need frontmatter with `trigger:` exactly one of `always_on`, `model_decision`, `glob`, `manual`. `glob` also needs `globs:`; `model_decision` also needs `description:`. A wrong trigger spelling (for example `alwaysOn`) is silently discarded. Max 24,000 bytes per rule file; always-on rules share a ~20,000-token budget, so keep them short.
- A skill can be invoked directly as `/<skill-name>`.

## Deliverables

### A. `AGENTS.md` (root, <= 90 lines, English)
Contents, in this order:
1. One-paragraph project summary and pointers: `docs/IMPLEMENTATION_PLAN.md` (spec), `docs/STATUS.md` (state), `docs/DECISIONS.md`, `docs/BALANCE_LOG.md`.
2. Commands (note that they exist only after M0): `npm run dev | build | typecheck | lint | test | check`.
3. Short repo layout (copy the tree idea from plan section 3).
4. Golden rules, numbered:
   1. One milestone per conversation. Never start the next one.
   2. Plan first: write a plan artifact, stop, wait for the exact word `APPROVED`.
   3. Scope fence: touch only files listed in the approved plan; log out-of-scope ideas in `docs/STATUS.md`, do not build them.
   4. `src/core` is pure TypeScript: no Phaser imports; all randomness through `Rng`; no `Math.random` in core.
   5. Numbers live in `src/data/*.json`; tune there, not in code.
   6. Write the test first for every formula and every random table.
   7. Never invent an API: when unsure about Phaser, read `node_modules/phaser/types/phaser.d.ts`; if you cannot find it, do not use it.
   8. No new dependency without a one-line justification in the plan artifact.
   9. Changing anything `[LOCKED]` needs my approval and an entry in `docs/DECISIONS.md`.
   10. Follow `.agents/rules/ethics-guardrails.md` always.
   11. Talk to me in Vietnamese; code, comments, commits, docs in English.
   12. Done means: `npm run check` green + browser smoke test + screenshot + STATUS updated.
5. A table of the 7 skills: name -> when to use (one line each).

### B. Rules (3 files)
1. `.agents/rules/ethics-guardrails.md`, `trigger: always_on`, <= 40 lines. Condense plan section 4.11 into 7 imperative bullets (no real money or loot boxes; odds always visible and generated from JSON; no manipulative mechanics such as fake near-misses, hidden rewards, timers, streak penalties, guilt notifications; flashing/shake gated by settings, <= 3 flashes/s, no jumpscares; every important sound has a visual equivalent and color is never the only signal; break reminder after ~45 min; telemetry opt-in, anonymous, deletable). Add: "If a request conflicts with any bullet, do the compliant part, explain the conflict to the owner, and ask."
2. `.agents/rules/typescript-style.md`, `trigger: glob`, `globs: src/**/*.ts`, <= 40 lines: strict TypeScript, no `any`, named exports, small pure functions in `src/core`, files < 300 lines, comments explain why not what, UI strings only via i18n keys, no Phaser import under `src/core` (add an ESLint `no-restricted-imports` rule in M0), errors are typed and never swallowed.
3. `.agents/rules/data-and-balance.md`, `trigger: glob`, `globs: src/data/**`, <= 40 lines: every random table has explicit weights; ids are snake_case; every entry has i18n keys for name and description; any numeric change requires a `docs/BALANCE_LOG.md` entry and a re-run of `balance-sim` (from M7 on); the Codex is generated from these files; never add a hidden modifier.

### C. Skills (7)
Create each as `.agents/skills/<name>/SKILL.md` plus the listed `resources/` files. Use the `description` text below VERBATIM. Write bodies in imperative mood, explain WHY for each non-obvious rule, and reference plan sections instead of repeating numbers. Each body must start with a line "Read first: docs/IMPLEMENTATION_PLAN.md section X" naming the relevant sections.

**Skill 1: `deeper-orchestrator`**
description: `Operating protocol for building the DEEPER pixel web game milestone by milestone (M0-M11). Use at the start of ANY work session in this repository, whenever the user mentions a milestone, "continue the plan", "next step", status, planning, review or handoff, and before starting, verifying or closing any milestone, even if the user does not name this skill.`
Body must contain:
- Session start: read `docs/STATUS.md`, plan section 4, and the milestone's section in plan section 5; confirm the milestone ID (if the user gave none, take the first `todo` in STATUS; if ambiguous, ask once).
- Plan phase: produce a plan artifact with goal (1 sentence), files to create/modify, tests to add (by name), new dependencies (justified) or "none", risks, at most 3 questions, then STOP and wait for the exact word `APPROVED`.
- Build phase: branch `milestone/Mx`; smallest possible diff; failing test first for formulas; commit at every green step with conventional messages; out-of-scope ideas go to STATUS "Ideas", not into code.
- Efficiency rules for a fast model: do not deliberate at length over trivial edits; do targeted file reads, not whole-repo reads; when options are equal choose the simpler and log it; stop exploring after 2 failed approaches and report instead of looping.
- Verify phase: run `npm run check`; run the browser smoke procedure (see resource); max 3 fix attempts per failure, then report the failure honestly.
- Handoff phase: update `docs/STATUS.md` and `docs/DECISIONS.md`; create the walkthrough artifact; final report in Vietnamese using the template; STOP.
- Escalate (ask the owner, do not guess) on: anything `[LOCKED]`, ethics rules, asset licenses, credentials or keys, destructive commands, gameplay feel disputes.
- Context hygiene: when context use reaches roughly 60%, write handoff notes into STATUS and tell the owner to open a new conversation.
- Resuming an interrupted milestone: read `git log`, STATUS, and the earlier plan artifact; continue from the last green commit; never redo finished work.
Resources: `resources/final-report-template.md` (Vietnamese template, <= 15 lines: done / tests / screenshot / deviations / known issues / questions / next), `resources/browser-smoke-procedure.md` (start dev server, open page, start a run, take >= 20 steps, screenshot, read console, stop server).

**Skill 2: `deeper-core-engine`**
description: `Implementation rules for DEEPER's engine layer: Phaser 3 + TypeScript scene setup, the 320x180 pixel-perfect canvas, seeded RNG, grid utilities, BSP dungeon generation, the turn pipeline, circular light and fog of war, save store and data loaders. Use whenever editing src/core, src/scenes, src/views, src/utils, src/services, map generation, movement, camera, rendering, save/load or seed logic.`
Body must contain: logic/render separation (core emits events, scenes replay them); all randomness via `Rng` with forks `floor:N`, `loot`, `ai`, `event`; determinism test pattern (same seed -> same map and same event log); the turn pipeline order from plan section 3; canvas configuration (width 320, height 180, `pixelArt`, `roundPixels`, integer scale, centered) with the rationale; BSP generation rules and the connectivity validation test over 100 seeds; stairs placement rule; light mask and line-of-sight approach and fog memory; `SaveStore` versioning and migration procedure; data loader validation; "Phaser API caution" procedure (check types, never invent APIs, avoid deprecated calls); touch input mapping.
Resources: `resources/phaser-pixel-config.md` (the config object and scale settings with explanations), `resources/mapgen-notes.md` (BSP parameters, corridor carving, validation steps).

**Skill 3: `deeper-fear-systems`**
description: `Rules for DEEPER's fear mechanics: oil lamp, light radius, the Dread meter and its thresholds, movement modes and noise propagation, monster AI state machines (Crawler, Listener, Stalker), hallucinations, post-processing effects and the audio director. Use whenever working on tension, darkness, monsters, noise, vignette/shake effects, heartbeat or ambient audio, or reduce-motion accessibility.`
Body must contain: pure services for oil, Dread, noise (no Phaser); noise travels by BFS path distance with walls blocking; monster FSM implemented as an explicit transition table with a test for every transition; "silence before the event" audio rule; hallucination rules (fakes never deal damage, vanish within 2 tiles, add Dread); every shake/flash/vignette effect gated by settings; no jumpscares; <= 3 flashes per second; every warning sound has a visual twin (icon pulse or caption); audio unlock after first user gesture; effect and particle caps for mobile performance; how to tune (edit data, rerun sim) and what never to change without approval.
Resources: `resources/monster-fsm-table.md` (states, events, transitions, actions), `resources/audio-cue-rules.md` (which cue, which visual twin, priority, ducking).

**Skill 4: `deeper-greed-systems`**
description: `Rules for DEEPER's greed mechanics: depth-scaled loot value, cursed chests, devil's bargains, extraction stations and rope, shop and meta upgrades, the odds Codex, and economy balancing. Use whenever touching gold, loot tables, events, upgrades, prices, extraction or death rules, or any probability shown to the player. Odds must always stay transparent.`
Body must contain: invariants (every random table lives in JSON with explicit weights; Codex generated from the same JSON with a test; every bargain and chest shows exact numbers before the choice; no hidden modifiers; no fake near-miss feedback; no real money; extraction ends the run; death loses only carried gold); procedure to add a loot item, curse, bargain or upgrade (data entry -> i18n keys -> test -> balance-sim -> BALANCE_LOG entry -> Codex check); how to detect a dominant strategy and what to do; allowed reward feedback (chime pitch rises with consecutive pickups, capped) and what is forbidden.
Resources: `resources/economy-checklist.md` (checks before changing any number).

**Skill 5: `deeper-mirror-telemetry`**
description: `Rules for DEEPER's Mirror screen and decision telemetry: decision log schema, greed and fear metrics, personal-baseline comparison, archetype cards, neutral non-judgmental copy, local share-image export, consent and privacy. Use whenever writing the run summary, metrics, analytics events, share cards, or any text that describes the player's behavior.`
Body must contain: the decision log schema and where each field is recorded; metric definitions and formulas by reference to plan section 4.9; baseline logic (rolling mean of the last 10 own runs; first 3 runs show "baseline forming"); archetype thresholds live in `src/data/mirror.json`; copy rules (describe the behavior in this run, never label the person; no clinical or judgmental words; the banned-words list is `src/data/banned-mirror-words.json` and a test enforces it; disclaimer "for entertainment, not a psychological assessment"); share image is generated locally on a canvas and never uploaded automatically; telemetry opt-in screen, random anonymous id, no personal data, deletion button; the `Analytics` interface with a no-op default.
Resources: `resources/copy-guide.md` (good vs bad examples in Vietnamese and English, tone rules, a starter banned-words list).

**Skill 6: `deeper-pixel-audio-pipeline`**
description: `How to produce and manage DEEPER's pixel art and sound without external tools: the DEEPER-24 palette, procedural placeholder tiles and sprites, asset manifest and naming, biome palette swaps, WebAudio-synthesized sound effects, and colorblind-safe and high-contrast variants. Use whenever adding or replacing sprites, tiles, UI art, palettes, fonts, sound effects or music.`
Body must contain: palette rules (our own 24-color palette in `palette.ts`; do not copy licensed palettes; every color used must come from it); placeholder generation via Phaser Graphics + `generateTexture` at 16x16; naming `tile_<biome>_<kind>`, `spr_<entity>_<anim>_<frame>`, `ui_<name>`; the asset manifest (key, size, source, license) and the rule that real art replaces placeholders by keeping the same keys and sizes; biome palette swap approach; synthesized SFX in `src/audio/sfx.ts` (oscillator + envelope + filter) with the 12 sounds from the resource; shape/icon differences so color is never the only signal; high-contrast option; every asset's license recorded in `CREDITS.md`.
Resources: `resources/sfx-spec.md` (12 sounds: name, waveform, frequency range, envelope, when played, visual twin), `resources/asset-manifest-schema.md`.

**Skill 7: `deeper-qa-balance-release`**
description: `QA, balance and release procedures for DEEPER: Vitest unit tests, the Monte Carlo balance simulator with bot policies, performance budgets, browser smoke tests, accessibility and i18n checks, build size limits, and itch.io/web packaging. Use whenever tuning numbers, writing tests, running checks, verifying a milestone, profiling, or preparing a release.`
Body must contain: test pyramid for this repo (what gets unit tests vs smoke tests); the balance-sim contract (CLI flags `--runs`, `--policy`, `--seed`; three policies cautious/greedy/mixed; JSON output with death rate, mean depth, extraction rate, expected banked gold per policy; how it reuses `src/core` with no Phaser); target metrics by reference to plan M7; performance budgets and how to measure (bundle analysis, throttled CPU 4x, mobile viewport 360x640); accessibility and i18n checks; the packaging command `npm run package` and what the zip must contain; failure-handling rule: report honestly, never weaken a test or a target to make a check pass.
Resources: `resources/balance-sim-contract.md`, `resources/release-checklist.md`.

### D. Tracking docs (English)
Create `docs/STATUS.md`, `docs/DECISIONS.md`, `docs/BALANCE_LOG.md` using the templates in plan section 8. In STATUS, list M0-M11 all as `todo`, with the branch name `milestone/Mx`.

### E. `scripts/validate-agent-kit.mjs`
Save EXACTLY this file (do not "improve" it):

```js
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
```

### F. `docs/SKILLS_AUDIT.md`
For each of the 7 skills write: name; description; 3 realistic user prompts that SHOULD activate it; 2 near-miss prompts that should NOT; and a one-line self-check of whether the description would match each. If any should-activate prompt would not match, rewrite the description (keep it under ~600 characters), and record the change.

## Process
1. In chat (<= 8 lines, Vietnamese) list the files you will create. Do not wait for approval; proceed.
2. Create in this order: tracking docs (D), validator (E), rules (B), skills with resources (C), `AGENTS.md` (A), audit (F).
3. Run `node scripts/validate-agent-kit.mjs`. Fix errors and warnings until it prints `OK`.
4. If this is a git repository: create branch `chore/agent-kit`, commit with message `chore(agent): add DEEPER agent kit`. Do not push.
5. Final report in Vietnamese (<= 15 lines): files created, validator output, any difference between this prompt and the IDE's official docs, deviations, and at most 3 open questions. Then STOP. Do not start M0 and do not install anything.

## Self-check before you finish
- Every SKILL.md has the verbatim description, is under 300 lines, starts with "Read first: ..." and links its resources with "read when ..." notes.
- No numeric tables copied from the plan into skills.
- No `.agents/workflows/`, and `.gitignore` does not ignore `.agents`.
- Rules have valid `trigger` values; `AGENTS.md` is <= 90 lines.
- No game code, no dependencies installed, nothing created outside the Deliverables.

PROMPT END
