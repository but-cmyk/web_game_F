---
name: deeper-orchestrator
description: "Operating protocol for building the DEEPER pixel web game milestone by milestone (M0-M11). Use at the start of ANY work session in this repository, whenever the user mentions a milestone, \"continue the plan\", \"next step\", status, planning, review or handoff, and before starting, verifying or closing any milestone, even if the user does not name this skill."
---
# Deeper Orchestrator

Read first: docs/IMPLEMENTATION_PLAN.md sections 1, 3, 5, 6, 7.

## Overview
This skill governs the end-to-end lifecycle of every milestone in DEEPER. You must strictly execute milestones in single, focused sessions without jumping ahead.

## Session Startup
1. Inspect `docs/STATUS.md`, verify current state, and identify the milestone ID. If none is specified, select the first milestone marked `todo`. If ambiguous, clarify with the owner once.
2. Read the milestone specification in `docs/IMPLEMENTATION_PLAN.md` §5 and gameplay numbers in §4.

## Phase 1 — Plan (Mandatory Stop)
Create an implementation plan artifact containing:
- Goal in exactly one sentence.
- Explicit list of files to create or modify.
- Unit and integration tests to write by name.
- New dependencies (justified) or "none".
- Identified technical risks and at most 3 questions for the owner.
- Verification plan (`npm run check` and browser smoke steps).
**STOP:** Wait for the owner's exact confirmation `APPROVED` before proceeding.

## Phase 2 — Build
1. Create and switch to the target branch: `git checkout -b milestone/<ID>`.
2. Implement with minimal, targeted diffs.
3. Apply test-driven development for all formulas and random distributions: write failing tests first.
4. Keep `src/core/` pure TypeScript: no Phaser imports, all randomness via `Rng`.
5. Keep numeric balance figures in `src/data/*.json`.
6. Record out-of-scope ideas under `docs/STATUS.md` "Ideas"; do not build unplanned features.
7. Commit at every green test with conventional messages (e.g., `feat(core): ...`, `test(fear): ...`).

## Efficiency Rules for Fast Models
- Never deliberate at length over trivial edits; make targeted file reads instead of reading the entire repo.
- When two design options are equally valid, select the simpler one and record the rationale in `docs/DECISIONS.md`.
- Stop after 2 failed approaches; report findings to the owner rather than entering a speculative loop.

## Phase 3 — Verify
1. Run `npm run check` (typecheck + lint + test + build).
2. Execute the browser smoke procedure outlined in [browser-smoke-procedure.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-orchestrator/resources/browser-smoke-procedure.md). Take screenshots and inspect console logs for zero errors.
3. For M4 onwards, run the balance simulator and log metrics to `docs/BALANCE_LOG.md`.
4. If a failure occurs, diagnose cleanly with at most 3 fix attempts before escalating. Never weaken assertions or targets.

## Phase 4 — Handoff
1. Update `docs/STATUS.md` with state, known issues, and handoff notes.
2. Record any plan deviations in `docs/DECISIONS.md`.
3. Create a walkthrough artifact summarizing changes, test outputs, and screenshots.
4. Provide the final report in Vietnamese (at most 15 lines) using the template in [final-report-template.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-orchestrator/resources/final-report-template.md).
5. **STOP:** Do not begin the next milestone.

## Escalation Triggers
Immediately stop and ask the owner when encountering:
- Any requested change to `[LOCKED]` items.
- Any conflict with `.agents/rules/ethics-guardrails.md`.
- Third-party asset licensing uncertainties or credential management.
- Destructive commands or subjective disputes over gameplay feel.

## Context Hygiene & Resumption
- When session context approaches ~60%, write handoff notes into `docs/STATUS.md` and request a new conversation.
- When resuming an interrupted milestone, inspect `git log` and `docs/STATUS.md`, verify green tests, and continue from the latest green commit.

