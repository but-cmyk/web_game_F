# Pre-Commit Checklist (15 Items)

Read and verify these 15 items before committing changes:

- [ ] 1. Target files and their direct callers inspected.
- [ ] 2. Core logic completely isolated from Phaser imports.
- [ ] 3. Zero `Math.random()` or wall-clock calls in `src/core/`.
- [ ] 4. All numbers placed in `src/data/*.json`, not hard-coded.
- [ ] 5. Failing tests written before implementation of formulas.
- [ ] 6. Table-driven edge cases tested (0, negative, max).
- [ ] 7. Discriminated unions used with exhaustive switch checks.
- [ ] 8. No `any` types or unasserted type suppressions.
- [ ] 9. Meter values (oil, Dread, HP) clamped at domain boundaries.
- [ ] 10. Coordinates follow `(x, y)` convention with bounds checks.
- [ ] 11. Division operations guarded against zero denominators.
- [ ] 12. Temporary `DEBUG:` logs and console outputs removed.
- [ ] 13. Player strings bound to i18n keys (`vi.json` and `en.json`).
- [ ] 14. `npm run typecheck` and `npm run test` run and PASS.
- [ ] 15. Diff reviewed using mechanical review scan.

