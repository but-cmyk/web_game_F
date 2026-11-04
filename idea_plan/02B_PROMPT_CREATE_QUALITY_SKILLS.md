# PROMPT 02B — Tạo 4 skill chất lượng: UI/UX, viết code ổn định, debug, review code (CHƯA viết code game)

**Hướng dẫn dùng (cho bạn, không dán vào Antigravity):**

1. Điều kiện: đã chạy xong prompt 02 và merge `chore/agent-kit`; `node scripts/validate-agent-kit.mjs` in `OK`. Nên chạy 02B **trước M0**; chạy sau cũng được vì nó không đụng vào code game.
2. Mở **hội thoại mới**, chọn **Gemini 3.8 Flash**, effort **high** (chỉ làm một lần, chất lượng chỉ dẫn quan trọng hơn tốc độ). Dán toàn bộ phần nằm giữa `PROMPT START` và `PROMPT END`.
3. Agent tạo 4 skill (mỗi skill có thư mục `resources/`), 2 script kiểm tra, cập nhật `AGENTS.md`, skill `deeper-orchestrator` và `docs/SKILLS_AUDIT.md`, rồi **dừng** và báo cáo bằng tiếng Việt.
4. Bạn kiểm tra, theo thứ tự:
   - `node scripts/validate-agent-kit.mjs` → `OK`
   - `node scripts/check-skill-yaml.mjs` → `OK` (bắt lỗi description không có ngoặc kép, xem mục "Vì sao có script YAML" bên dưới)
   - `node .agents/skills/deeper-code-review/scripts/mechanical-review.mjs --selftest` → `SELFTEST OK`
   - Đọc phần mới của `docs/SKILLS_AUDIT.md`, xem nhánh `chore/agent-kit-quality`, rồi merge.
5. Phần prompt bằng tiếng Anh để model bám chỉ dẫn chính xác; agent vẫn trả lời bạn bằng tiếng Việt.
6. Nếu agent báo tài liệu chính thức của Antigravity khác với mô tả trong prompt, hãy tin tài liệu chính thức và để agent sửa theo.

**Bốn skill này sửa điểm yếu nào của model Flash:**

| Điểm yếu hay gặp | Skill xử lý |
|---|---|
| Bịa API, sửa mà không đọc nơi gọi, báo "xong" khi chưa chạy lệnh nào, sửa test cho qua | `deeper-reliable-coding` |
| Đoán nguyên nhân, chồng nhiều bản vá, lặp vô hạn khi lỗi không hết | `deeper-debug` |
| Tự duyệt qua loa, khen chung chung, bỏ sót luật kiến trúc | `deeper-code-review` (kèm script quét cơ học) |
| UI đúng trong code nhưng đọc không nổi ở 320×180 hoặc 360×640, mất dấu tiếng Việt, nút chạm quá nhỏ, chỉ dùng màu để phân biệt | `deeper-ui-ux-design` |

**Lưu ý trung thực:** không skill nào đảm bảo "không có bug". Các skill này chỉ giảm bug bằng quy trình (test trước, diff nhỏ, kiểu chặt, tự review, quét cơ học, cổng kiểm tra bắt buộc). Playtest của người thật vẫn không thể thay thế.

**Sau khi merge, dùng thế nào:**

| Tình huống | Skill | Cách gọi |
|---|---|---|
| Sắp viết hoặc sửa bất kỳ code nào | `deeper-reliable-coding` | tự kích hoạt, hoặc gõ `/deeper-reliable-coding` |
| Làm màn hình, HUD, nút, hộp thoại, chữ hiển thị | `deeper-ui-ux-design` | `/deeper-ui-ux-design` |
| Test đỏ, `npm run check` đỏ, console báo lỗi, chơi thấy sai | `deeper-debug` | `/deeper-debug` |
| Xong tính năng hoặc milestone; hoặc bạn muốn rà soát | `deeper-code-review` | `/deeper-code-review` |

Các prompt `03_PROMPT_IMPLEMENT.md` (bản 1.1) đã gọi sẵn các skill này ở đúng pha.

**Vì sao có script YAML:** description của 6/7 skill trong prompt 02 chứa chuỗi `: ` (hai chấm + cách). Nếu agent ghi nó không có ngoặc kép, trình đọc YAML nghiêm ngặt có thể coi frontmatter là lỗi và bỏ skill mà không báo. Script `check-skill-yaml.mjs` bắt trường hợp này; 02B yêu cầu agent bọc ngoặc kép cho cả 11 description (chỉ đổi cách ghi, không đổi chữ).

**Một điểm thiết kế bạn nên quyết sớm (trước M9):** kế hoạch khoá canvas 320×180 **và** scale số nguyên. Trên điện thoại dọc 360×640, scale số nguyên lớn nhất là ×1, tức canvas chỉ rộng 320 px và nút chạm 16 px sẽ quá nhỏ. Skill UI đã dặn agent nêu câu hỏi này trong kế hoạch của M9 (đề xuất: giữ canvas, đặt nút ảo dạng lớp DOM ở phần trống bên dưới). Bạn không cần làm gì ở 02B.

---

PROMPT START

# TASK: Add four quality skills (UI/UX design, reliable coding, debugging, code review) to the DEEPER agent kit. Do NOT write any game code.

## Role
You are the senior engineer extending the agent kit that already exists in this repo (`AGENTS.md`, `.agents/rules/`, 7 `deeper-*` skills, tracking docs). Later conversations will implement milestones M0-M11 with a fast, cost-efficient model (Gemini 3.8 Flash) that follows written procedures literally. Your job is to write four skills that make that model write fewer bugs, debug methodically, review honestly and design readable, accessible pixel UI. The quality of descriptions and procedures is the whole point of this task.

## Failure modes the skills must counter (write every skill body against these)
1. Invents APIs or properties; edits code without reading its callers.
2. Says "done", "fixed" or "works" without having run a command in this session.
3. Weakens or deletes a test, lint rule or target to get green.
4. Stacks speculative fixes, loops on a failing approach, or rewrites a whole file for a small bug.
5. Leaves partial edits, placeholder comments such as "rest unchanged", stale imports, debug logging.
6. Reviews that praise generically, skip the spec, or report problems without evidence.
7. UI that looks right in code but is unreadable at 320x180 or 360x640, clips Vietnamese diacritics, uses colour as the only signal, or has tiny touch targets.
8. Deliberates at length over trivial edits but under-checks risky ones.

## Read first (at most 6 tool calls)
1. `docs/IMPLEMENTATION_PLAN.md`: sections 2, 3, 4.1, 4.11, 7, 9, and the headings of section 5. If the file is missing: STOP and tell me in Vietnamese, change nothing.
2. `AGENTS.md` and `.agents/skills/deeper-orchestrator/SKILL.md`.
3. `grep -h "^description:" .agents/skills/*/SKILL.md` to see the 7 existing descriptions, so the new ones do not overlap in triggering.
4. Run `node scripts/validate-agent-kit.mjs`. It must print `OK` before you start. If it does not: STOP and tell me.

## Hard constraints
- No game code. No `npm install`. No `package.json` edits. Phaser is NOT installed yet, so never state a Phaser API name as fact: describe Phaser issues as conceptual checks and tag any API name with "(verify in types)".
- Create or modify only the files listed under "Deliverables" (plus `docs/DECISIONS.md` if you must log a decision). Do not change the 7 existing skills, except the section appended in deliverable F and the re-quoting in deliverable G.
- Never create `.agents/workflows/`. Never add `.agents` to `.gitignore`.
- Reply to me in Vietnamese. Every file you write is in English.
- Single source of truth: skills describe PROCEDURES and INVARIANTS and point to plan sections for numbers. Do not copy numeric tables from the plan. The only exception is `resources/ui-tokens.md` in the UI skill, which is the one place for UI tokens (the plan has none); it must not repeat plan numbers such as canvas size or HUD height.
- Honest framing: no process guarantees bug-free code. Never write "bug-free" or "guaranteed" in any skill. Write "prevent", "reduce", "verify".
- Do not change anything the plan marks `[LOCKED]`.
- Be decisive. Do not re-read the repo repeatedly, do not write long explanations in chat, prefer tool calls. If two options are equally good, pick the simpler one and note it in `docs/DECISIONS.md`.

## Format facts (verified Oct 2026 from third-party documentation; if the IDE's own docs differ, follow the IDE docs, apply them, and tell me what differed)
- Skill = folder `.agents/skills/<kebab-name>/SKILL.md` with YAML frontmatter containing `name` (must equal the folder name) and `description`. The description is ALL the agent sees until it decides to open the skill, so it must say what the skill does and when to use it, and be a little pushy so it is not under-triggered.
- Write the description as ONE line, wrapped in double quotes (escape any inner double quote as `\"`). Unquoted values containing `: ` or ` #` are invalid YAML and can make a strict loader drop the skill silently.
- Optional subfolders: `scripts/`, `examples/`, `resources/`. Keep each SKILL.md under 300 lines (hard limit 500) and each resource file under 200 lines. Link every resource from SKILL.md with one line saying when to read it.
- A skill can be invoked directly as `/<skill-name>`.

## Deliverables

### A. Skill 8: `deeper-ui-ux-design`
description (use VERBATIM, quoted as above):
`UI/UX design rules for DEEPER's pixel interface, covering screen layout on the 320x180 canvas, HUD, menus, modal choices (bargains, chests), Codex, Mirror, Settings, tutorial, touch controls, readable pixel text including Vietnamese diacritics, risk and odds hierarchy, feedback and microcopy, accessibility, and visual review with browser screenshots at desktop size and 360x640. Use whenever creating or changing any screen, HUD element, button, dialog, label, icon, layout, font, UI animation or player-facing text, even for a small tweak. Palette and asset files belong to deeper-pixel-audio-pipeline, Mirror wording belongs to deeper-mirror-telemetry.`

Body must start with "Read first: docs/IMPLEMENTATION_PLAN.md sections 1 (pillars), 2, 4.1, 4.9, 4.11 and the current milestone in section 5." and contain:
- **Stance:** the UI serves the three pillars. Darkness is the main character, so gold and warnings are the only bright accents. The interface never pressures the player (no countdowns, no guilt wording, no pre-selected greedy option).
- **Procedure for every screen or UI change:** (1) write the screen's one job and its primary action in one sentence; (2) list the information needed at the moment of decision, ranked; (3) draw an ASCII wireframe on the logical canvas; (4) pull every size, spacing, colour role and duration from `resources/ui-tokens.md`, never from memory or ad hoc literals; (5) build from shared UI components (button, icon button, panel, modal choice card, meter, toast, tab list), creating one only if none fits; (6) cover the state matrix: default, focused, pressed, disabled, empty, error; (7) review with screenshots (see resource) and tick the checklist; (8) record unresolved design questions in the plan artifact, at most 3.
- **Decision-moment rules, with the reason for each:** cost and reward numbers appear before the choice, always in the same order (you pay, you get); decline is as visible as accept, same size, neutral label; at most 5 information chunks per decision; critical state (oil, Dread, HP, carried gold) is glanceable and uses icon plus number plus shape, never colour alone; numbers never shift the layout (fixed-width digits, reserved space).
- **Input parity:** every action is reachable by keyboard focus navigation and by touch; focus is always visible; nothing is hover-only (tooltips need a tap or long-press equivalent); the movement-mode toggle is reachable one-handed.
- **Text:** the only strings are i18n keys (`vi` default, `en` complete); design for 40% longer strings; sentence case; verbs name the action and stay consistent across the flow ("Extract" then "Extracted"); errors say what happened and what to do; no all-caps in Vietnamese because stacked diacritics clog at small sizes; font requirements and test strings are in the resource.
- **Accessibility floor (WCAG 2.2 as the yardstick):** text contrast at least 4.5:1 and meaningful graphics at least 3:1 (high-contrast option raises both); touch targets at least 44x44 CSS px (24x24 is the absolute minimum); no more than 3 flashes per second; all motion and shake respect the Settings toggles; every important sound has a visual twin (coordinate with `deeper-fear-systems`).
- **Motion:** UI motion only answers a player action, is short, and is removable by reduce-motion. No decorative loops. The one allowed loop is an icon pulse that serves as the visual twin of an audio cue.
- **Responsive rule and known tension:** the canvas size and integer scaling are `[LOCKED]`. On a 360x640 portrait phone the largest integer scale is x1, so the canvas is small and 16 px buttons are too small to touch. In the plan artifact of the first milestone that builds touch controls (M9, or earlier if the plan says so), raise this ONE question to the owner and propose: keep the canvas, render virtual buttons as a DOM overlay in the free space under it, sized to the touch minimum. Do not change any `[LOCKED]` item yourself.
- **Efficiency:** pick the simplest layout that passes the checklist; do not iterate on aesthetics beyond two screenshot rounds; ask the owner about feel disputes instead of looping.
Resources:
- `resources/ui-tokens.md` (single source of truth for UI tokens: spacing grid, at most two text sizes, outline width, layer order HUD < modal < toast < overlay, focus-ring style, touch minimum, motion durations, colour ROLES such as text, text-dim, danger, gold, panel, panel-border; map roles to DEEPER-24 indices once `palette.ts` exists in M0 and mark the table "TO FILL IN M0" until then)
- `resources/screen-inventory.md` (one entry per screen or overlay: Boot, Menu, Tutorial, Run HUD, Bargain modal, Chest modal, Pause, Extract confirm, Run summary, Mirror, Codex, Meta shop, Settings, Consent, Break reminder. For each: job, primary action, information in priority order, states, ethics and accessibility notes, milestone where it is built. Derive from the plan; at most 150 lines)
- `resources/ui-review-checklist.md` (28 to 36 yes/no items grouped by readability, hierarchy, input parity, transparency and ethics, accessibility, i18n, motion, performance, responsiveness)
- `resources/vietnamese-pixel-text.md` (font requirements: full precomposed Vietnamese coverage, readable at the smallest size, stacked diacritics not clipped, line height that keeps them; at least 12 test strings including the worst stacked cases; rule that any candidate font's licence and Vietnamese coverage are verified by rendering the test strings, recorded in `CREDITS.md`, and if none passes, ask the owner)
- `resources/screenshot-review-procedure.md` (browser steps at three viewports: desktop with the largest integer scale, a small desktop window, and 360x640 portrait; also with high-contrast on and reduce-motion on; what to look for; screenshots go in the walkthrough artifact and are not committed unless the owner asks)

### B. Skill 9: `deeper-reliable-coding`
description (VERBATIM, quoted):
`Bug-prevention protocol for writing any DEEPER code. Covers the acceptance-first and test-first loop, smallest-diff edits, type-driven design with discriminated unions and exhaustive switches, no any, invariants and assertions, grid boundary and off-by-one checks, numeric clamping, determinism rules, Phaser lifecycle and cleanup, error handling, and a mandatory self-review before reporting done. Use BEFORE writing or editing any TypeScript, JSON data, config or test in this repository, including quick fixes, refactors and trivial changes, because most bugs come from skipping these steps. To diagnose an existing failure use deeper-debug, to review a finished diff use deeper-code-review.`

Body must start with "Read first: docs/IMPLEMENTATION_PLAN.md sections 2, 3, 4.11, 7, 9." and contain:
- **The loop:** understand, state acceptance as checks, write the failing test, implement, verify with commands, self-review. One line of WHY for each step.
- **Before editing:** read the target file, its tests and its callers (targeted search, not a whole-repo read); check that a helper does not already exist; find the plan section that governs the behaviour; list the invariants that must still hold afterwards.
- **Tests first:** every formula and random table; per function cover the normal case, the boundaries (0, max, negative, empty), invalid input and determinism. Test names describe behaviour. Expected values come from the plan's worked examples, never from running the new code.
- **Type-driven design:** discriminated unions for states and events, exhaustive `switch` with a `never` check, readonly data, branded ids where mixing is likely, no `any`, no non-null assertion without a comment saying why it is safe.
- **Invariants:** assert them at module boundaries through one small `invariant()` helper in `src/utils` (propose adding it in the plan artifact if missing); clamp meters (oil, Dread, HP) in one place each.
- **Grids and numbers:** one coordinate convention (x right, y down, `(x, y)` order, index = y * width + x) written once and tested; bounds checks before indexing; inclusive or exclusive ranges stated in the function's name or doc; BFS distance off-by-one tests; integer math rounded exactly as the plan's formula says; never compare floats with equality; guard every division.
- **Determinism:** no wall clock or `Math.random` in `src/core`; do not rely on object key order for gameplay; named `Rng` forks so adding a roll in one system cannot shift another system's stream.
- **State:** core changes flow through `TurnResolver.step` and emit events; no hidden global singletons; pure functions do not mutate their inputs.
- **Phaser lifecycle (conceptual, verify API names in types):** everything registered in a scene's creation step is removed on shutdown (listeners, timers, tweens); never touch a destroyed object; no heavy allocation inside the per-frame update; texture keys exist before use; audio starts only after a user gesture.
- **Errors:** validate external data (JSON files, saved games) at the boundary with typed errors; never an empty `catch`; player-facing failures use i18n messages.
- **Edit hygiene for a fast model:** targeted edits, not whole-file rewrites of existing files; re-read the edited region afterwards; no placeholder comments; fix imports; run `npm run typecheck` after each group of files; commit at every green step.
- **Claims discipline:** never write "works", "fixed" or "done" unless a command output from this session shows it; quote the command and the result line.
- **Stop rules:** unsure about an API, read its types; if you cannot find it, do not use it. Two failed approaches: stop and report. Ambiguous spec: ask, at most 3 questions. Before reporting done, run `/deeper-code-review` in self-review mode.
Resources:
- `resources/bug-pattern-catalog.md` (at least 24 patterns, each with symptom, a bad snippet and a good snippet; cover off-by-one, grid index mix-ups, float drift, unguarded division, stale closure, mutation of shared state, iteration while mutating, unhandled async, event listener leak, missing cleanup, silent catch, wrong equality, time or random inside core, order dependence in tests, shared fixtures between tests, clamping in the wrong place)
- `resources/test-patterns.md` (table-driven tests, seeded loops over 100 seeds as property-style checks without new dependencies, event-log fixtures, one test per FSM transition, testing with a wall between noise source and listener, avoiding snapshot tests for gameplay, a mutation-thinking question to ask of every new test)
- `resources/pre-commit-checklist.md` (at most 25 lines, 15 items)

### C. Skill 10: `deeper-debug`
description (VERBATIM, quoted):
`Systematic debugging procedure for DEEPER. Reproduce first, quote the exact error, replay deterministically from a seed plus an action log, list hypotheses, bisect with git, add minimal temporary instrumentation, fix the root cause with a regression test, and stop after 3 failed attempts. Includes Phaser and Vite pitfalls and symptom-to-cause playbooks such as blank canvas, blurry pixels, input not firing, silent audio, core and scene out of sync, flaky tests, FPS drops and save corruption. Use whenever something fails or looks wrong, such as a red npm run check, a failing test, a console error, a crash, a wrong number, a visual glitch, or a milestone check that stays red. Never guess a fix before reproducing.`

Body must start with "Read first: docs/IMPLEMENTATION_PLAN.md sections 3 (turn pipeline, seeds), 7, 9." and contain:
- **Procedure:** capture, reproduce, hypothesise, isolate, fix, prove, prevent. Each step with one line of WHY.
- **Capture:** exact error text, the command, git commit, seed, action list, viewport, browser. Keep this as a short bug note (see template); unresolved ones go to `docs/STATUS.md` Known issues.
- **Reproduce:** for gameplay bugs record `{seed, actions[]}` and replay it through the core in a test (see resource); never claim a bug is fixed without a reproduction that failed before and passes after. If it cannot be reproduced, say so and add instrumentation rather than guessing.
- **Hypotheses:** at most 3, each with one cheap check that would separate it from the others; run the cheapest first; read the FIRST error of a cascade, not the last.
- **Isolate:** shrink the input (fewest actions, smallest map or seed); `git bisect` or `git log -p` on the suspect file; compare the core event log with what the scene rendered to decide which layer is wrong.
- **Instrumentation:** temporary only, prefixed `DEBUG:` so it is easy to find, removed before commit; the mechanical scan flags leftovers.
- **Fix:** at the layer that owns the bug; the smallest change; no symptom patches (for example clamping a value to hide a wrong calculation) unless the invariant says the clamp is correct; explain the cause in two sentences.
- **Prove:** the failing test now passes; run the full `npm run check`; rerun the browser smoke procedure; confirm nothing new in the console.
- **Prevent:** a regression test named `regression_<short_cause>`; if it is a general pattern, propose a catalog entry in `docs/STATUS.md` Ideas (do not edit another skill's files).
- **Stop rule:** after each failed attempt revert that attempt completely before trying another; never stack speculative fixes. After 3 failed attempts stop and report: symptom, reproduction, hypotheses eliminated with evidence, current suspects, what you need from the owner.
- **Flaky tests:** run the test 20 times; look for hidden nondeterminism (random, clock, async timing, shared state, map or set order); fix the cause, never add retries.
- **Escalate** instead of guessing: anything `[LOCKED]`, ethics rules, asset licences, credentials, destructive commands, disputes about gameplay feel.
- **Output:** the debug report in the resource template, at most 10 lines.
Resources:
- `resources/debug-playbooks.md` (at least 14 playbooks, each: symptom, first three checks, usual causes. Include blank canvas, blurry or uneven pixels, canvas not centred or wrong scale, input not firing, input fires twice, audio silent, effect still active after leaving a scene, core and scene out of sync, flaky test, FPS drop, memory growth, save fails to load after a version change, wrong gold or oil value, monster stuck in a state, map not connected)
- `resources/phaser-vite-pitfalls.md` (conceptual checks; tag every API name "(verify in types)"; include scene lifecycle and cleanup, texture generation order, scale and rounding settings, audio unlock, dev versus production build differences, asset paths, hot-reload leaving duplicate listeners)
- `resources/deterministic-replay.md` (the `{seed, actions[]}` log format, a `replay(seed, actions)` test helper kept in `tests/helpers/` once `TurnResolver` exists, how to turn a replay into a regression test, how to shrink a long action list)
- `resources/bug-report-template.md` (at most 12 lines: symptom, reproduction, expected, actual, root cause, fix, proof, regression test)

### D. Skill 11: `deeper-code-review`
description (VERBATIM, quoted):
`Structured code review for DEEPER in two modes, self-review of your own diff before handoff and a read-only audit of a branch or milestone. Checks spec conformance against docs/IMPLEMENTATION_PLAN.md, correctness, determinism, architecture rules (no Phaser in src/core, no Math.random in core, numbers in JSON), ethics and accessibility, test quality, performance and maintainability, using an automated mechanical scan plus a severity-ranked findings table with file and line evidence. Use before closing any milestone, after finishing a feature, when the user says review, audit, check my code or PR, and whenever you are about to write the final report. Never edit files while reviewing unless explicitly asked.`

Body must start with "Read first: docs/IMPLEMENTATION_PLAN.md sections 3, 4.11, 7, 9 and the milestone's acceptance list in section 5." and contain:
- **Modes:** self-review (default when called from the orchestrator) may fix findings inside the approved plan scope; audit (when the owner says review, audit or check) changes no files and ends with the report.
- **Procedure:** (0) scope: diff stat against the base (`git merge-base HEAD main`), list files, group by area if over about 600 changed lines, skip lock files and generated output; (1) mechanical scan: `node .agents/skills/deeper-code-review/scripts/mechanical-review.mjs --changed` (add `--base <ref>` to override the base; plain mode scans everything); treat every ERROR as a blocker unless you can show it is a false positive; the scan finds candidates only and a clean scan is not a clean review; (2) run `npm run check` yourself, never trust an earlier result; (3) review passes in this fixed order: spec conformance, correctness, determinism and architecture, ethics and accessibility (plus the UI checklist when UI changed), test quality, performance, maintainability. The questions for each pass are in the checklist resource.
- **Test-quality pass:** for each new test ask "if I break the formula by one, does a test fail?"; look for skipped or focused tests, tautologies, weak assertions, expected values copied from the implementation, tables without a test.
- **Findings format:** a table with columns number, severity, where (file:line), problem, why it matters, fix. Severities: BLOCKER (violates `[LOCKED]`, ethics, Definition of Done, data loss or crash), MAJOR (wrong behaviour, formula or table without a test), MINOR, NIT. Every finding needs evidence (code excerpt or command output); no evidence, no finding. Merge findings that share a root cause; at most 15; do not report what lint or the formatter already enforces; no praise padding; add a "What I verified" list of at most 5 lines.
- **Verdict:** PASS, PASS WITH FOLLOW-UPS, or CHANGES REQUESTED. Any BLOCKER or MAJOR means CHANGES REQUESTED.
- **Self-review loop:** fix BLOCKER and MAJOR findings within the approved plan scope, at most 3 rounds, rerun the scan and `npm run check` after each; put MINOR and NIT items in `docs/STATUS.md` Ideas; copy the verdict and the remaining findings into the walkthrough artifact.
- **Anti-patterns to avoid:** rubber-stamping, reviewing only the diff without checking the callers, style bikeshedding, hypothetical issues without evidence, rewriting the author's design.
- **Language:** the report to the owner is in Vietnamese; code identifiers and file paths stay verbatim.
Resources:
- `resources/review-checklist.md` (questions for each of the seven passes, 4 to 8 per pass, concrete and checkable; the ethics pass maps one item to each of the seven points of plan section 4.11)
- `resources/findings-template.md` (the table header, one worked example finding, and the verdict block)
- `scripts/mechanical-review.mjs` (save EXACTLY this file, do not "improve" it):

```js
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
```

### E. Update `AGENTS.md`
- In the skills table add four rows (`deeper-reliable-coding`: before writing or editing any code; `deeper-ui-ux-design`: any screen, HUD, dialog, label or touch control; `deeper-debug`: any failure or wrong behaviour; `deeper-code-review`: before the final report, or when asked to review).
- Add golden rule 13: "Quality gates: load /deeper-reliable-coding before editing code, /deeper-ui-ux-design for anything the player sees or reads, /deeper-debug on any failure (reproduce first), and /deeper-code-review in self-review mode before the final report. Never claim success without a command output from this session."
- Keep the file at or under 90 lines by tightening wording, never by deleting a rule.

### F. Update `deeper-orchestrator`
Append this section at the end of `.agents/skills/deeper-orchestrator/SKILL.md`, changing nothing else (the file must stay under 300 lines):

```
## Quality gates (added by prompt 02B)
- Before the first edit in the build phase, load `/deeper-reliable-coding`. For anything the player sees or reads (screen, HUD, dialog, label, touch control, UI sound cue), also load `/deeper-ui-ux-design`.
- When any check, test or smoke step fails, or something looks wrong, load `/deeper-debug` and follow it. Do not try fixes before reproducing.
- At the end of the verify phase, before handoff, load `/deeper-code-review` in self-review mode: run `node .agents/skills/deeper-code-review/scripts/mechanical-review.mjs --changed`, fix every BLOCKER and MAJOR inside the approved plan scope (at most 3 rounds), and copy the verdict and remaining findings into the walkthrough artifact.
- In the final report, list the verification commands you actually ran and their results. Never state that something works unless a command output in this session shows it.
- A request to review, audit or check a milestone means `/deeper-code-review` in audit mode: change no files.
```

### G. Re-quote the existing 7 descriptions
In each of the 7 existing `SKILL.md` files, wrap the `description` value in double quotes (escape inner double quotes). Do not change a single word of any description or body. Then add `name: <folder-name>` to the frontmatter if it is missing.

### H. Save `scripts/check-skill-yaml.mjs` EXACTLY (do not "improve" it)

```js
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
```

### I. Append to `docs/SKILLS_AUDIT.md`
Add a section "Quality skills (prompt 02B)". For each of the four new skills write: name; description; 3 realistic owner prompts that SHOULD activate it; 2 near-miss prompts that should NOT; and a one-line self-check of whether the description matches each. Then add a "Boundary tests" table of at least 8 ambiguous prompts across all 11 skills with the skill(s) expected to win, for example: "Make the bargain dialog show the numbers clearly" (`deeper-ui-ux-design` and `deeper-greed-systems`), "The Mirror sentence sounds judgmental" (`deeper-mirror-telemetry`, not UI), "npm run check is red" (`deeper-debug`), "Write the Rng class" (`deeper-reliable-coding` and `deeper-core-engine`), "Review my milestone branch" (`deeper-code-review`), "Why is the monster stuck in SEARCH?" (`deeper-debug` and `deeper-fear-systems`), "Generate placeholder tiles" (`deeper-pixel-audio-pipeline`, not UI), "Tune the greedy bot" (`deeper-qa-balance-release`). If any should-activate prompt would not match, rewrite the description (under about 800 characters), keep the SKILL.md and this audit consistent, and record the change.

## Process
1. In chat (at most 8 lines, Vietnamese) list the files you will create or modify. Do not wait for approval; proceed.
2. Order: the two scripts (D's script and H) first, then run `node .agents/skills/deeper-code-review/scripts/mechanical-review.mjs --selftest`; then the skills with their resources in the order B, C, D, A; then E, F, G, I.
3. Run, and fix until all pass: `node scripts/validate-agent-kit.mjs` (must print `OK`), `node scripts/check-skill-yaml.mjs` (must print `OK`), the selftest (must print `SELFTEST OK`), and `node .agents/skills/deeper-code-review/scripts/mechanical-review.mjs` (before M0 it must print that there is no `src/` yet and exit 0).
4. If this is a git repository: create branch `chore/agent-kit-quality` from the current HEAD, commit with message `chore(agent): add quality skills (ui-ux, reliable-coding, debug, code-review)`. Do not push.
5. Final report in Vietnamese (at most 15 lines): files created and modified, output of the four commands above, any difference between this prompt and the IDE's official docs, deviations, and at most 3 open questions. Then STOP. Do not start M0 and do not install anything.

## Self-check before you finish
- All four new SKILL.md files use the verbatim description, are single-line and double-quoted, have `name` equal to the folder name, are under 300 lines, start with "Read first: ...", and link each resource with a "read when ..." note.
- All 11 descriptions pass `check-skill-yaml.mjs`; no word of the 7 older descriptions or bodies changed, apart from the section appended to the orchestrator.
- No numeric tables copied from the plan; no Phaser API stated as fact without "(verify in types)".
- `AGENTS.md` is at most 90 lines and the orchestrator is under 300 lines.
- Both scripts are byte-for-byte as given; the selftest passes.
- No game code, no dependencies installed, nothing created outside the Deliverables, no `.agents/workflows/`.

PROMPT END
