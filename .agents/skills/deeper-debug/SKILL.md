---
name: deeper-debug
description: "Systematic debugging procedure for DEEPER. Reproduce first, quote the exact error, replay deterministically from a seed plus an action log, list hypotheses, bisect with git, add minimal temporary instrumentation, fix the root cause with a regression test, and stop after 3 failed attempts. Includes Phaser and Vite pitfalls and symptom-to-cause playbooks such as blank canvas, blurry pixels, input not firing, silent audio, core and scene out of sync, flaky tests, FPS drops and save corruption. Use whenever something fails or looks wrong, such as a red npm run check, a failing test, a console error, a crash, a wrong number, a visual glitch, or a milestone check that stays red. Never guess a fix before reproducing."
---
# Deeper Debug

Read first: docs/IMPLEMENTATION_PLAN.md sections 3 (turn pipeline, seeds), 7, 9.

## 1. The Systematic Debugging Cycle
Execute these steps strictly in order; never guess a patch without reproduction:
1. **Capture**: Record exact error text, command, seed, and actions to avoid solving the wrong problem.
2. **Reproduce**: Write a test or script that deterministically triggers the bug before editing code.
3. **Hypothesize**: Formulate up to 3 distinct hypotheses and test the cheapest one first.
4. **Isolate**: Minimize the failing input and determine whether the fault lives in core logic or presentation.
5. **Fix**: Address root cause at the owning architectural layer with the minimal diff.
6. **Prove**: Confirm the reproduction test passes and all check commands run green.
7. **Prevent**: Institutionalize a regression test named `regression_<short_cause>` to prevent recurrence.

## 2. Capture & Reproduction
- Document context: Seed, action log, commit hash, viewport size, and browser environment.
- For core logic bugs, reconstruct `{ seed, actions[] }` and replay via `TurnResolver.step` in a unit test. See [deterministic-replay.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-debug/resources/deterministic-replay.md).
- If a bug cannot be reproduced, halt and add temporary diagnostics rather than speculating.

## 3. Hypotheses & Isolation
- Limit to at most 3 hypotheses.
- Inspect the FIRST error message in a compiler or test cascade, not the last.
- Use `git bisect` or `git log -p <file>` to isolate recent regressions.
- Temporary instrumentation must be prefixed with `DEBUG:` and removed before commit.

## 4. Root Cause Fix & Verification
- Fix at the layer that owns the invariant (e.g., clamp Dread in `DreadSystem`, not in the Phaser text display).
- Never stack speculative patches on top of each other. If an attempt fails, revert it completely before trying another.
- Verify with `npm run check` and rerun browser smoke testing.

## 5. Stop Rule & Escalation
- **Maximum 3 Failed Fix Attempts**: If 3 attempts fail, stop immediately. Report the exact reproduction steps, eliminated hypotheses, and current findings using [bug-report-template.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-debug/resources/bug-report-template.md).
- Escalate immediately on: `[LOCKED]` constraints, ethics contract issues, asset licensing, or disputes about game feel.

## 6. Flaky Tests
- Re-run suspect test 20 times in a loop.
- Eliminate hidden nondeterminism: unseeded randomness, wall clock, async timers, or shared state fixtures.
- Never add retries to mask flakiness.

## 7. Playbooks & Pitfalls
- Consult [debug-playbooks.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-debug/resources/debug-playbooks.md) for 14 common symptom-to-cause guides.
- Consult [phaser-vite-pitfalls.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-debug/resources/phaser-vite-pitfalls.md) for rendering and lifecycle traps.

