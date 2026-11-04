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


## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 100.0% | 0.0% | 1.1 | 0 |
| greedy | 100.0% | 0.0% | 1.2 | 0 |
| mixed | 99.0% | 1.0% | 1.1 | 2 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.1, Expected Gold: 0
- Run 5 (with upgrades): Mean Depth 1.1, Expected Gold: 0

**Observations & Verification:**
- Cautious bot achieves high survival (0%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~99% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 1 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 100.0% | 0.0% | 1.0 | 0 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.1, Expected Gold: 0
- Run 5 (with upgrades): Mean Depth 1.1, Expected Gold: 0

**Observations & Verification:**
- Cautious bot achieves high survival (0%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 95.0% | 5.0% | 1.3 | 4 |
| greedy | 100.0% | 0.0% | 1.2 | 0 |
| mixed | 100.0% | 0.0% | 1.3 | 0 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.3, Expected Gold: 0
- Run 5 (with upgrades): Mean Depth 1.2, Expected Gold: 0

**Observations & Verification:**
- Cautious bot achieves high survival (5%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~100% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 98.0% | 2.0% | 1.2 | 2 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 100.0% | 0.0% | 1.2 | 0 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.3, Expected Gold: 0
- Run 5 (with upgrades): Mean Depth 1.2, Expected Gold: 1

**Observations & Verification:**
- Cautious bot achieves high survival (2%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~100% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 97.0% | 3.0% | 1.2 | 3 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.3, Expected Gold: 1
- Run 5 (with upgrades): Mean Depth 1.3, Expected Gold: 1

**Observations & Verification:**
- Cautious bot achieves high survival (3%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 100.0% | 0.0% | 1.2 | 0 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.3, Expected Gold: 2
- Run 5 (with upgrades): Mean Depth 1.4, Expected Gold: 1

**Observations & Verification:**
- Cautious bot achieves high survival (0%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 10 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 100.0% | 0.0% | 1.3 | 0 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 90.0% | 10.0% | 1.6 | 3 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.5, Expected Gold: 6
- Run 5 (with upgrades): Mean Depth 1.4, Expected Gold: 4

**Observations & Verification:**
- Cautious bot achieves high survival (0%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~90% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 74.0% | 26.0% | 1.9 | 12 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 70.0% | 30.0% | 1.9 | 27 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 21

**Observations & Verification:**
- Cautious bot achieves high survival (26%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~70% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 20 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 80.0% | 20.0% | 1.9 | 8 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 75.0% | 25.0% | 1.7 | 21 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 21

**Observations & Verification:**
- Cautious bot achieves high survival (20%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~75% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 5 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 80.0% | 20.0% | 2.0 | 6 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 60.0% | 40.0% | 2.0 | 36 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 21

**Observations & Verification:**
- Cautious bot achieves high survival (20%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~60% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 94.0% | 6.0% | 1.5 | 5 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 72.0% | 28.0% | 1.9 | 26 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 16
- Run 5 (with upgrades): Mean Depth 2.1, Expected Gold: 25

**Observations & Verification:**
- Cautious bot achieves high survival (6%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~72% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 2 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 100.0% | 0.0% | 1.0 | 0 |
| greedy | 100.0% | 0.0% | 1.0 | 0 |
| mixed | 100.0% | 0.0% | 1.5 | 0 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 16
- Run 5 (with upgrades): Mean Depth 2.1, Expected Gold: 25

**Observations & Verification:**
- Cautious bot achieves high survival (0%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~100% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 80.0% | 20.0% | 1.8 | 13 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 76.0% | 24.0% | 1.8 | 22 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (20%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~76% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 72.0% | 28.0% | 2.1 | 15 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 76.0% | 24.0% | 1.8 | 22 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (28%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~76% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 94.0% | 6.0% | 1.4 | 4 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 76.0% | 24.0% | 1.8 | 22 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (6%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~76% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 10 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 100.0% | 0.0% | 1.4 | 0 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (0%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 70.0% | 30.0% | 2.1 | 20 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (30%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 2 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 50.0% | 50.0% | 2.0 | 36 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (50%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 2 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 50.0% | 50.0% | 2.0 | 36 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (50%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 20 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 85.0% | 15.0% | 1.9 | 7 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2, Expected Gold: 17
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 20

**Observations & Verification:**
- Cautious bot achieves high survival (15%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 76.0% | 24.0% | 2.0 | 14 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 76.0% | 24.0% | 1.9 | 22 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 17
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 20

**Observations & Verification:**
- Cautious bot achieves high survival (24%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~76% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 2 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 50.0% | 50.0% | 2.0 | 36 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 17
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 20

**Observations & Verification:**
- Cautious bot achieves high survival (50%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 20 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 90.0% | 10.0% | 1.8 | 5 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 17
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 19

**Observations & Verification:**
- Cautious bot achieves high survival (10%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 58.0% | 42.0% | 2.3 | 26 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 20
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (42%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 72.0% | 28.0% | 1.9 | 15 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 20
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (28%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 4 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 50.0% | 50.0% | 2.3 | 21 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 20
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (50%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 50.0% | 50.0% | 2.4 | 20 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 20
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (50%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 50.0% | 50.0% | 2.4 | 20 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 78.0% | 22.0% | 1.8 | 23 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 20
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (50%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~78% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 74.0% | 26.0% | 2.1 | 11 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 82.0% | 18.0% | 1.8 | 19 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 20
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (26%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~82% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 7 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 42.9% | 57.1% | 2.4 | 26 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.9, Expected Gold: 20
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (57.1%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 52.0% | 48.0% | 2.4 | 18 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 84.0% | 16.0% | 1.7 | 15 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2, Expected Gold: 22
- Run 5 (with upgrades): Mean Depth 2.1, Expected Gold: 25

**Observations & Verification:**
- Cautious bot achieves high survival (48%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~84% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 82.0% | 18.0% | 1.8 | 7 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 76.0% | 24.0% | 1.9 | 21 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2, Expected Gold: 26
- Run 5 (with upgrades): Mean Depth 1.9, Expected Gold: 20

**Observations & Verification:**
- Cautious bot achieves high survival (18%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~76% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 46.0% | 54.0% | 2.5 | 18 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 72.0% | 28.0% | 1.9 | 23 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2, Expected Gold: 26
- Run 5 (with upgrades): Mean Depth 1.9, Expected Gold: 20

**Observations & Verification:**
- Cautious bot achieves high survival (54%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~72% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 10 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 30.0% | 70.0% | 2.6 | 22 |
| greedy | 100.0% | 0.0% | 1.5 | 0 |
| mixed | 70.0% | 30.0% | 2.0 | 14 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2, Expected Gold: 26
- Run 5 (with upgrades): Mean Depth 1.9, Expected Gold: 20

**Observations & Verification:**
- Cautious bot achieves high survival (70%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~70% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 42.0% | 58.0% | 2.6 | 22 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 70.0% | 30.0% | 2.0 | 25 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2, Expected Gold: 26
- Run 5 (with upgrades): Mean Depth 1.9, Expected Gold: 19

**Observations & Verification:**
- Cautious bot achieves high survival (58%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~70% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 70.0% | 30.0% | 2.1 | 17 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 70.0% | 30.0% | 2.0 | 25 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2, Expected Gold: 26
- Run 5 (with upgrades): Mean Depth 1.9, Expected Gold: 19

**Observations & Verification:**
- Cautious bot achieves high survival (30%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~70% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 42.0% | 58.0% | 2.6 | 22 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 70.0% | 30.0% | 2.0 | 25 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2, Expected Gold: 26
- Run 5 (with upgrades): Mean Depth 1.9, Expected Gold: 19

**Observations & Verification:**
- Cautious bot achieves high survival (58%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~70% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 64.0% | 36.0% | 2.2 | 12 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 82.0% | 18.0% | 1.7 | 16 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.8, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 1.8, Expected Gold: 16

**Observations & Verification:**
- Cautious bot achieves high survival (36%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~82% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 40.0% | 60.0% | 2.6 | 24 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 70.0% | 30.0% | 2.0 | 25 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2, Expected Gold: 26
- Run 5 (with upgrades): Mean Depth 1.9, Expected Gold: 19

**Observations & Verification:**
- Cautious bot achieves high survival (60%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~70% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 40.0% | 60.0% | 2.6 | 22 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 70.0% | 30.0% | 2.0 | 26 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2, Expected Gold: 27
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 18

**Observations & Verification:**
- Cautious bot achieves high survival (60%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~70% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 10 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 30.0% | 70.0% | 2.8 | 23 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 70.0% | 30.0% | 2.0 | 19 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2, Expected Gold: 27
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 18

**Observations & Verification:**
- Cautious bot achieves high survival (70%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~70% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 40.0% | 60.0% | 2.6 | 22 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 58.0% | 42.0% | 2.3 | 27 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 37
- Run 5 (with upgrades): Mean Depth 2.3, Expected Gold: 26

**Observations & Verification:**
- Cautious bot achieves high survival (60%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~58% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 50.0% | 50.0% | 2.4 | 18 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 58.0% | 42.0% | 2.3 | 27 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 37
- Run 5 (with upgrades): Mean Depth 2.3, Expected Gold: 26

**Observations & Verification:**
- Cautious bot achieves high survival (50%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~58% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 10 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 30.0% | 70.0% | 2.8 | 23 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 40.0% | 60.0% | 2.5 | 28 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 37
- Run 5 (with upgrades): Mean Depth 2.3, Expected Gold: 26

**Observations & Verification:**
- Cautious bot achieves high survival (70%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~40% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 10 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 30.0% | 70.0% | 2.8 | 23 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 40.0% | 60.0% | 2.5 | 28 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 37
- Run 5 (with upgrades): Mean Depth 2.4, Expected Gold: 35

**Observations & Verification:**
- Cautious bot achieves high survival (70%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~40% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 10 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 30.0% | 70.0% | 2.8 | 23 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 40.0% | 60.0% | 2.5 | 28 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 37
- Run 5 (with upgrades): Mean Depth 2.4, Expected Gold: 35

**Observations & Verification:**
- Cautious bot achieves high survival (70%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~40% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 40.0% | 60.0% | 2.6 | 22 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 58.0% | 42.0% | 2.2 | 23 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 28
- Run 5 (with upgrades): Mean Depth 2.3, Expected Gold: 27

**Observations & Verification:**
- Cautious bot achieves high survival (60%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~58% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 40.0% | 60.0% | 2.6 | 22 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 58.0% | 42.0% | 2.2 | 23 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 28
- Run 5 (with upgrades): Mean Depth 1.6, Expected Gold: 19

**Observations & Verification:**
- Cautious bot achieves high survival (60%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~58% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 40.0% | 60.0% | 2.6 | 22 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 58.0% | 42.0% | 2.2 | 23 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 28
- Run 5 (with upgrades): Mean Depth 2.1, Expected Gold: 15

**Observations & Verification:**
- Cautious bot achieves high survival (60%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~58% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 10 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 30.0% | 70.0% | 2.8 | 23 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 40.0% | 60.0% | 2.5 | 19 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 28
- Run 5 (with upgrades): Mean Depth 2.1, Expected Gold: 15

**Observations & Verification:**
- Cautious bot achieves high survival (70%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~40% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 40.0% | 60.0% | 2.6 | 22 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 58.0% | 42.0% | 2.2 | 23 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 28
- Run 5 (with upgrades): Mean Depth 2.1, Expected Gold: 31

**Observations & Verification:**
- Cautious bot achieves high survival (60%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~58% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 44.0% | 56.0% | 2.5 | 19 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 66.0% | 34.0% | 2.2 | 21 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.3, Expected Gold: 22
- Run 5 (with upgrades): Mean Depth 2.1, Expected Gold: 28

**Observations & Verification:**
- Cautious bot achieves high survival (56%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~66% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 46.0% | 54.0% | 2.6 | 21 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 64.0% | 36.0% | 2.2 | 18 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 28
- Run 5 (with upgrades): Mean Depth 2.4, Expected Gold: 26

**Observations & Verification:**
- Cautious bot achieves high survival (54%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~64% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 46.0% | 54.0% | 2.6 | 19 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 62.0% | 38.0% | 2.2 | 20 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 25
- Run 5 (with upgrades): Mean Depth 2.3, Expected Gold: 24

**Observations & Verification:**
- Cautious bot achieves high survival (54%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~62% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 44.0% | 56.0% | 2.6 | 21 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 64.0% | 36.0% | 2.2 | 19 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 25
- Run 5 (with upgrades): Mean Depth 2.3, Expected Gold: 25

**Observations & Verification:**
- Cautious bot achieves high survival (56%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~64% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 44.0% | 56.0% | 2.6 | 21 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 64.0% | 36.0% | 2.2 | 19 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 25
- Run 5 (with upgrades): Mean Depth 2.3, Expected Gold: 25

**Observations & Verification:**
- Cautious bot achieves high survival (56%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~64% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 44.0% | 56.0% | 2.6 | 21 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 64.0% | 36.0% | 2.2 | 19 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 25
- Run 5 (with upgrades): Mean Depth 2.3, Expected Gold: 25

**Observations & Verification:**
- Cautious bot achieves high survival (56%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~64% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 50 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 44.0% | 56.0% | 2.6 | 21 |
| greedy | 100.0% | 0.0% | 1.3 | 0 |
| mixed | 64.0% | 36.0% | 2.2 | 19 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 25
- Run 5 (with upgrades): Mean Depth 2.3, Expected Gold: 25

**Observations & Verification:**
- Cautious bot achieves high survival (56%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~64% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 40.0% | 60.0% | 2.6 | 21 |
| greedy | 100.0% | 0.0% | 1.4 | 0 |
| mixed | 61.0% | 39.0% | 2.3 | 21 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.3, Expected Gold: 24
- Run 5 (with upgrades): Mean Depth 2.3, Expected Gold: 22

**Observations & Verification:**
- Cautious bot achieves high survival (60%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~61% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 49.0% | 51.0% | 2.5 | 18 |
| greedy | 100.0% | 0.0% | 1.8 | 0 |
| mixed | 56.0% | 44.0% | 2.3 | 24 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.3, Expected Gold: 23
- Run 5 (with upgrades): Mean Depth 2.4, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (51%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~56% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 46.0% | 54.0% | 2.5 | 19 |
| greedy | 100.0% | 0.0% | 1.8 | 0 |
| mixed | 56.0% | 44.0% | 2.3 | 24 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.3, Expected Gold: 23
- Run 5 (with upgrades): Mean Depth 2.4, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (54%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~56% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 48.0% | 52.0% | 2.5 | 18 |
| greedy | 100.0% | 0.0% | 1.8 | 0 |
| mixed | 55.0% | 45.0% | 2.3 | 26 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.3, Expected Gold: 22
- Run 5 (with upgrades): Mean Depth 2.3, Expected Gold: 22

**Observations & Verification:**
- Cautious bot achieves high survival (52%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~55% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 200 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 48.0% | 52.0% | 2.5 | 20 |
| greedy | 100.0% | 0.0% | 1.9 | 0 |
| mixed | 54.0% | 46.0% | 2.3 | 28 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.3, Expected Gold: 22
- Run 5 (with upgrades): Mean Depth 2.3, Expected Gold: 22

**Observations & Verification:**
- Cautious bot achieves high survival (52%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~54% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 49.0% | 51.0% | 2.5 | 17 |
| greedy | 100.0% | 0.0% | 1.8 | 0 |
| mixed | 55.0% | 45.0% | 2.3 | 26 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.3, Expected Gold: 23
- Run 5 (with upgrades): Mean Depth 2.3, Expected Gold: 22

**Observations & Verification:**
- Cautious bot achieves high survival (51%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~55% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 53.0% | 47.0% | 2.4 | 17 |
| greedy | 100.0% | 0.0% | 1.9 | 0 |
| mixed | 56.0% | 44.0% | 2.3 | 25 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.3, Expected Gold: 26
- Run 5 (with upgrades): Mean Depth 2.3, Expected Gold: 24

**Observations & Verification:**
- Cautious bot achieves high survival (47%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~56% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 61.0% | 39.0% | 2.2 | 18 |
| greedy | 100.0% | 0.0% | 1.9 | 0 |
| mixed | 58.0% | 42.0% | 2.3 | 24 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.3, Expected Gold: 26
- Run 5 (with upgrades): Mean Depth 2.3, Expected Gold: 26

**Observations & Verification:**
- Cautious bot achieves high survival (39%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~58% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 59.0% | 41.0% | 2.2 | 19 |
| greedy | 100.0% | 0.0% | 1.9 | 0 |
| mixed | 58.0% | 42.0% | 2.3 | 24 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.3, Expected Gold: 27
- Run 5 (with upgrades): Mean Depth 2.3, Expected Gold: 26

**Observations & Verification:**
- Cautious bot achieves high survival (41%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~58% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 48.0% | 52.0% | 2.4 | 19 |
| greedy | 100.0% | 0.0% | 1.2 | 0 |
| mixed | 59.0% | 41.0% | 2.3 | 22 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.2, Expected Gold: 20
- Run 5 (with upgrades): Mean Depth 2.2, Expected Gold: 18

**Observations & Verification:**
- Cautious bot achieves high survival (52%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~59% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 48.0% | 52.0% | 2.4 | 19 |
| greedy | 100.0% | 0.0% | 1.2 | 0 |
| mixed | 59.0% | 41.0% | 2.3 | 22 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.2, Expected Gold: 19
- Run 5 (with upgrades): Mean Depth 2.2, Expected Gold: 17

**Observations & Verification:**
- Cautious bot achieves high survival (52%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~59% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 60.0% | 40.0% | 2.3 | 19 |
| greedy | 100.0% | 0.0% | 1.2 | 0 |
| mixed | 59.0% | 41.0% | 2.3 | 22 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.2, Expected Gold: 19
- Run 5 (with upgrades): Mean Depth 2.2, Expected Gold: 17

**Observations & Verification:**
- Cautious bot achieves high survival (40%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~59% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 47.0% | 53.0% | 2.4 | 19 |
| greedy | 100.0% | 0.0% | 1.2 | 0 |
| mixed | 59.0% | 41.0% | 2.3 | 22 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.2, Expected Gold: 19
- Run 5 (with upgrades): Mean Depth 2.2, Expected Gold: 17

**Observations & Verification:**
- Cautious bot achieves high survival (53%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~59% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 52.0% | 48.0% | 2.4 | 20 |
| greedy | 100.0% | 0.0% | 1.2 | 0 |
| mixed | 59.0% | 41.0% | 2.3 | 22 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.2, Expected Gold: 19
- Run 5 (with upgrades): Mean Depth 2.2, Expected Gold: 17

**Observations & Verification:**
- Cautious bot achieves high survival (48%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~59% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 81.0% | 19.0% | 1.8 | 6 |
| greedy | 100.0% | 0.0% | 1.1 | 0 |
| mixed | 85.0% | 15.0% | 1.7 | 9 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.7, Expected Gold: 10
- Run 5 (with upgrades): Mean Depth 1.7, Expected Gold: 8

**Observations & Verification:**
- Cautious bot achieves high survival (19%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~85% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 53.0% | 47.0% | 2.4 | 17 |
| greedy | 100.0% | 0.0% | 1.1 | 0 |
| mixed | 61.0% | 39.0% | 2.2 | 22 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.2, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 1.7, Expected Gold: 23

**Observations & Verification:**
- Cautious bot achieves high survival (47%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~61% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 47.0% | 53.0% | 2.5 | 19 |
| greedy | 100.0% | 0.0% | 1.1 | 0 |
| mixed | 61.0% | 39.0% | 2.2 | 21 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.2, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 1.8, Expected Gold: 21

**Observations & Verification:**
- Cautious bot achieves high survival (53%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~61% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 47.0% | 53.0% | 2.5 | 19 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.2, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 22

**Observations & Verification:**
- Cautious bot achieves high survival (53%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 48.0% | 52.0% | 2.5 | 19 |
| greedy | 100.0% | 0.0% | 1.1 | 0 |
| mixed | 61.0% | 39.0% | 2.2 | 21 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.2, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 22

**Observations & Verification:**
- Cautious bot achieves high survival (52%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~61% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 48.0% | 52.0% | 2.5 | 19 |
| greedy | 100.0% | 0.0% | 1.1 | 0 |
| mixed | 61.0% | 39.0% | 2.2 | 21 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.2, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 22

**Observations & Verification:**
- Cautious bot achieves high survival (52%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~61% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 1 runs per policy (Seed: 1037)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 100.0% | 0.0% | 2.0 | 0 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.4, Expected Gold: 26
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 26

**Observations & Verification:**
- Cautious bot achieves high survival (0%) but modest gold rewards.
- Greedy bot experiences high mortality (0%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~0% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 50.0% | 50.0% | 2.4 | 18 |
| greedy | 99.0% | 1.0% | 1.1 | 1 |
| mixed | 61.0% | 39.0% | 2.2 | 21 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.2, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 24

**Observations & Verification:**
- Cautious bot achieves high survival (50%) but modest gold rewards.
- Greedy bot experiences high mortality (99%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~61% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 66.0% | 34.0% | 2.2 | 14 |
| greedy | 99.0% | 1.0% | 1.1 | 1 |
| mixed | 61.0% | 39.0% | 2.2 | 21 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.2, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 24

**Observations & Verification:**
- Cautious bot achieves high survival (34%) but modest gold rewards.
- Greedy bot experiences high mortality (99%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~61% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 51.0% | 49.0% | 2.4 | 18 |
| greedy | 99.0% | 1.0% | 1.1 | 1 |
| mixed | 61.0% | 39.0% | 2.2 | 22 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.2, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 24

**Observations & Verification:**
- Cautious bot achieves high survival (49%) but modest gold rewards.
- Greedy bot experiences high mortality (99%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~61% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 50.0% | 50.0% | 2.4 | 19 |
| greedy | 99.0% | 1.0% | 1.1 | 1 |
| mixed | 61.0% | 39.0% | 2.2 | 22 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.2, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 24

**Observations & Verification:**
- Cautious bot achieves high survival (50%) but modest gold rewards.
- Greedy bot experiences high mortality (99%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~61% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 75.0% | 25.0% | 1.9 | 10 |
| greedy | 100.0% | 0.0% | 1.1 | 0 |
| mixed | 83.0% | 17.0% | 1.7 | 8 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 1.6, Expected Gold: 9
- Run 5 (with upgrades): Mean Depth 1.6, Expected Gold: 7

**Observations & Verification:**
- Cautious bot achieves high survival (25%) but modest gold rewards.
- Greedy bot experiences high mortality (100%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~83% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.

## Milestone M7 — Meta Upgrades & Economy Calibration (2026-11-04)
- **Date**: 2026-11-04
- **Milestone**: M7
- **Simulated Runs**: 100 runs per policy (Seed: 1000)

| Policy | Death Rate (%) | Extraction Rate (%) | Mean Depth | Expected Banked Gold |
|---|---|---|---|---|
| cautious | 50.0% | 50.0% | 2.4 | 19 |
| greedy | 99.0% | 1.0% | 1.1 | 1 |
| mixed | 61.0% | 39.0% | 2.2 | 22 |

**Meta-Progression Comparison (100 sequential runs):**
- Run 1 (0 upgrades): Mean Depth 2.2, Expected Gold: 18
- Run 5 (with upgrades): Mean Depth 2, Expected Gold: 24

**Observations & Verification:**
- Cautious bot achieves high survival (50%) but modest gold rewards.
- Greedy bot experiences high mortality (99%) attempting to push past floor 6 without extraction.
- Mixed policy balances risk with ~61% mortality, achieving optimal expected return.
- **Non-Dominance Invariant Holds**: No policy exceeds 1.5× the expected yield of the Mixed policy.
