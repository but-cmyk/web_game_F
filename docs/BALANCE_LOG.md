# DEEPER — Balance Tuning Log

This log tracks every parameter adjustment made to gameplay data files under `src/data/*.json`, starting from Milestone M4 and onwards with automated simulations in M7.

Each entry must record:
- **Date**: YYYY-MM-DD
- **Milestone**: Mx
- **Changes**: File, JSON path, Old Value -> New Value
- **Simulation Results**: Runs count, Death rate (%), Mean depth reached, Extraction rate (%), Expected gold per policy (Cautious / Greedy / Mixed)
- **Observations / Commentary**: Evaluation against target metrics in `docs/IMPLEMENTATION_PLAN.md` §4 and §5.

---

## Initial Baselines (Pre-M0)
*No simulation data yet. Initial formula values are documented in `docs/IMPLEMENTATION_PLAN.md` §4.*
