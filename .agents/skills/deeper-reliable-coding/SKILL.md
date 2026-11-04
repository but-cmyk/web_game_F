---
name: deeper-reliable-coding
description: "Bug-prevention protocol for writing any DEEPER code. Covers the acceptance-first and test-first loop, smallest-diff edits, type-driven design with discriminated unions and exhaustive switches, no any, invariants and assertions, grid boundary and off-by-one checks, numeric clamping, determinism rules, Phaser lifecycle and cleanup, error handling, and a mandatory self-review before reporting done. Use BEFORE writing or editing any TypeScript, JSON data, config or test in this repository, including quick fixes, refactors and trivial changes, because most bugs come from skipping these steps. To diagnose an existing failure use deeper-debug, to review a finished diff use deeper-code-review."
---
# Deeper Reliable Coding

Read first: docs/IMPLEMENTATION_PLAN.md sections 2, 3, 4.11, 7, 9.

## 1. The Acceptance & Test-First Loop
Follow this sequential cycle for every change:
1. **Understand Requirements**: Read spec and define acceptance criteria upfront to prevent scope drift.
2. **State Acceptance Checks**: Formulate concrete pass/fail criteria before modifying files.
3. **Write Failing Test First**: Assert the desired behavior to ensure the test detects regressions.
4. **Implement Minimal Diff**: Write the simplest code that passes the test without extraneous refactoring.
5. **Verify with Commands**: Run typecheck, lint, and tests; never assume correctness without command output.
6. **Mandatory Self-Review**: Inspect diff against invariants before claiming completion.

## 2. Pre-Edit Scoping
- Targeted inspection: Read target file, corresponding test file, and direct callers.
- Verify whether existing helper functions in `src/utils/` already address the requirement.
- Identify governing plan section and enumerate invariants that must hold after the edit.

## 3. Test-First Discipline
Refer to [test-patterns.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-reliable-coding/resources/test-patterns.md):
- Cover nominal cases, boundary conditions (0, maximum, negative, empty collections), and invalid inputs.
- Derive expected numerical outputs strictly from worked examples in `docs/IMPLEMENTATION_PLAN.md`, never by recording whatever the newly written code produces.
- Assert determinism: repeated runs with the same seed must produce identical results.

## 4. Type-Driven Safety & Invariants
- Use discriminated unions for all state transitions and game events.
- Enforce exhaustive `switch` blocks with a compile-time `never` assertion.
- Ban `any`. Use precise types or `unknown` narrowed with type guards.
- No non-null assertions (`!`) without an adjacent explanatory comment.
- Assert boundaries using `invariant(condition, message)` from `src/utils/`.
- Clamp gameplay meters (oil, Dread, HP) strictly at system boundaries in one canonical location.

## 5. Grid Conventions & Numerical Safety
- Coordinate standard: x-axis positive right, y-axis positive down, `(x, y)` parameter order.
- Linear index formula: `index = y * width + x`. Assert `0 <= x < width && 0 <= y < height`.
- Guard all division against division by zero: `denominator !== 0 ? numerator / denominator : fallback`.
- Integer rounding: Match rounding mode (`Math.round`, `Math.floor`, `Math.ceil`) exactly to plan formulas. Never compare floating-point values with strict equality (`===`).

## 6. Determinism & Lifecycle Rules
- Zero wall-clock calls (`Date.now()`, `performance.now()`) or `Math.random()` in `src/core/`.
- Do not rely on JavaScript object key iteration order for gameplay logic.
- Fork named `Rng` child instances so sub-rolls do not pollute parallel streams.
- **Phaser Lifecycle (verify in types)**: Every listener, timer, or tween registered in scene creation must be destroyed during shutdown. Never access destroyed objects.

## 7. Error Handling & Edit Hygiene
- Validate JSON files and save schemas at the boundary with custom typed errors; never swallow errors in silent `catch` blocks.
- Perform targeted edits; never rewrite entire multi-hundred line files for minor changes.
- Remove all temporary `DEBUG:` logging, fix imports, and run `npm run typecheck` after each edit.

## 8. Claims Discipline & Stop Rules
- **Never claim success without evidence**: Never state "works" or "fixed" unless verified by command execution output in this session.
- If an API is uncertain, verify in `phaser.d.ts`. If not found, do not hallucinate it.
- Stop and report after 2 failed approaches instead of looping.
- Run `/deeper-code-review` in self-review mode before declaring completion.
- Consult [bug-pattern-catalog.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-reliable-coding/resources/bug-pattern-catalog.md) and [pre-commit-checklist.md](file:///c:/Users/PC/OneDrive/Desktop/web_game__F/.agents/skills/deeper-reliable-coding/resources/pre-commit-checklist.md) before every commit.
