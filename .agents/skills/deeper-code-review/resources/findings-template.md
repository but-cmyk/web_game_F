# Code Review Findings Template

Use this table and summary block when reporting code review findings:

## Review Summary
- **Base Commit**: `<hash>`
- **Files Inspected**: `<count> files`
- **Mechanical Scan**: `0 errors, N warnings`
- **Verification Commands Executed**:
  - `npm run check` -> PASS
  - `node .agents/skills/deeper-code-review/scripts/mechanical-review.mjs --changed` -> PASS

## Findings Table
| # | Severity | Location | Problem Description | Rationale / Impact | Recommended Fix |
|---|---|---|---|---|---|
| 1 | BLOCKER | `src/core/turn.ts:45` | Import of Phaser GameObjects in core | Violates core isolation architecture | Pass event coordinates to scene layer |
| 2 | MAJOR | `src/data/curses.json:12` | Weight omitted for curse B3 | Non-deterministic odds breakdown | Add explicit positive weight |
| 3 | MINOR | `src/views/hud.ts:78` | Direct color hex used instead of palette | Inconsistent with DEEPER-24 theme | Use `PALETTE.goldAccent` |

## Verdict
**VERDICT: CHANGES REQUESTED** (Blocker finding #1 must be resolved before sign-off).
