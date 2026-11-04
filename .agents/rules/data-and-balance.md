---
trigger: glob
globs: src/data/**
---
# Data & Economy Balance Rules

Maintain absolute integrity and transparency in all gameplay data under `src/data/`:

1. **Explicit Weights**: Every drop table, event pool, and curse list must specify exact, positive integer or float weights.
2. **Schema Uniformity**: Every identifier (`id`) must follow strict `snake_case`. Include matching i18n keys for display names and descriptions.
3. **No Hidden Modifiers**: Probability, loot multipliers, and stat scaling must be fully declared in JSON; never hide silent biases in runtime logic.
4. **Codex Synchronization**: The in-game Codex is automatically populated from these JSON schemas; tests must verify full parity.
5. **Logged Tuning**: Any numeric tweak requires a companion entry in `docs/BALANCE_LOG.md` recording the old/new values and simulation results.
6. **Simulation Verification**: From milestone M7 onwards, all balance adjustments must pass verification by `scripts/balance-sim.ts`.

