# DEEPER — Architecture & Design Decisions

This document records architectural, technical, and gameplay decisions that diverge from or elaborate on `docs/IMPLEMENTATION_PLAN.md`.

Each entry must include:
- **Date**: YYYY-MM-DD
- **Milestone**: Mx or setup phase
- **Decision**: What was chosen
- **Rationale**: Why it was chosen
- **Alternatives considered**: What was rejected and why
- **Approved by**: Owner or pre-approved constraint

---

## 2026-11-04 · Setup · Agent Kit Architecture
- **Decision**: Adopt the 11-skill dual-stage agent kit architecture (`02` base skills followed by `02B` quality skills) with strict separation of concerns.
- **Rationale**: Mitigate Flash model failure modes (hallucinated APIs, speculative fixes, unreadable low-res UI) while enforcing strict isolation of core logic from Phaser.
- **Alternatives considered**: Single monolithic prompt (rejected due to context bloat and reduced adherence).
- **Approved by**: Pre-approved in `docs/IMPLEMENTATION_PLAN.md` §6.

