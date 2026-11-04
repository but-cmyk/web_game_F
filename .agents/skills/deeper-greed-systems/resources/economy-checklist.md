# Economy Verification Checklist

Read this checklist prior to committing any economy or loot changes.

- [ ] Has the item/curse/bargain been added to the appropriate file in `src/data/`?
- [ ] Are all weights strictly positive numbers with explicit probabilities?
- [ ] Do matching localized keys exist in both `src/i18n/vi.json` and `src/i18n/en.json`?
- [ ] Does the Codex unit test pass, verifying that in-game documentation reflects the new item?
- [ ] Have you verified that all bargain dialogs display exact numerical costs and rewards?
- [ ] Have you run `scripts/balance-sim.ts` for at least 1,000 simulated runs?
- [ ] Is the mixed policy death rate maintained within the 55-65% target window?
- [ ] Is there an absence of any dominant strategy yielding > 1.5x expected gold?
- [ ] Have you logged all changes in `docs/BALANCE_LOG.md`?

