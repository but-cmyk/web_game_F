---
name: deeper-code-review
description: "Structured code review for DEEPER in two modes, self-review of your own diff before handoff and a read-only audit of a branch or milestone. Checks spec conformance against docs/IMPLEMENTATION_PLAN.md, correctness, determinism, architecture rules (no Phaser in src/core, no Math.random in core, numbers in JSON), ethics and accessibility, test quality, performance and maintainability, using an automated mechanical scan plus a severity-ranked findings table with file and line evidence. Use before closing any milestone, after finishing a feature, when the user says review, audit, check my code or PR, and whenever you are about to write the final report. Never edit files while reviewing unless explicitly asked."
---
# Deeper Code Review

Read first: docs/IMPLEMENTATION_PLAN.md sections 3, 4.11, 7, 9 and the milestone's acceptance list in section 5.

## 1. Operating Modes
- **Self-Review Mode**: Triggered automatically before milestone completion. Author may fix identified BLOCKER and MAJOR issues within the approved scope.
- **Audit Mode**: Triggered when the owner requests an audit or review. Strictly read-only; no files are modified. Ends with a structured report.

## 2. Review Procedure
1. **Scope Inspection**: Check diff stat against the base commit (`git merge-base HEAD master`). List modified files; ignore lockfiles.
2. **Mechanical Scan**: Run the automated rule checker:
   ```bash
   node .agents/skills/deeper-code-review/scripts/mechanical-review.mjs --changed
   ```
   Treat any reported `ERROR` as a blocker unless proven to be a false positive.
3. **Execute Comprehensive Checks**: Run `npm run check` directly in this session.
4. **Structured Review Passes**: Evaluate code across 7 sequential dimensions detailed in [review-checklist.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-code-review/resources/review-checklist.md):
   - Spec conformance against `docs/IMPLEMENTATION_PLAN.md`
   - Algorithmic correctness and edge-case handling
   - Determinism and core isolation (no Phaser in `src/core`, seeded `Rng`)
   - Ethics and accessibility guardrails (plan §4.11)
   - Test quality (mutation verification, no skipped tests)
   - Performance and resource pooling
   - Code maintainability and localization completeness

## 3. Findings Format & Severities
Record findings using the format in [findings-template.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-code-review/resources/findings-template.md):
- **BLOCKER**: Violates `[LOCKED]` specs, ethics rules, causes crashes, or breaks the Definition of Done.
- **MAJOR**: Functional defect, formula inaccuracy, or random table lacking tests.
- **MINOR**: Inefficient pattern, code smell, or incomplete error context.
- **NIT**: Small style inconsistency or non-blocking suggestion.
- **Requirement**: Every finding must cite explicit file, line, and code evidence. Merged findings capped at 15 items.

## 4. Verdicts & Resolution Loop
- **PASS**: No blockers or majors; minor follow-ups logged to `docs/STATUS.md`.
- **PASS WITH FOLLOW-UPS**: Minor improvements noted for subsequent milestones.
- **CHANGES REQUESTED**: Any BLOCKER or MAJOR finding blocks milestone sign-off.
- In self-review mode, address BLOCKER/MAJOR findings within the approved plan scope (up to 3 rounds). Rerun checks and copy the final verdict into the milestone walkthrough.
