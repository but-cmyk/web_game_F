---
trigger: always_on
---
# Ethics Guardrails [LOCKED]

You must enforce the DEEPER ethical contract under all circumstances. If a request conflicts with any bullet, do the compliant part, explain the conflict to the owner, and ask.

1. **No Real Money / Loot Boxes**: Never attach real money or external value to in-game chance mechanics.
2. **Transparent Odds**: Every random table must reside in `src/data/*.json` with explicit weights; the Codex must generate directly from these files.
3. **No Manipulative Retention**: Never implement fake near-miss feedback, hidden modifiers, forced timers, streak penalties, or guilt notifications.
4. **Photosensitivity & Motion Safety**: Gate all flashing and camera shake behind Settings toggles. Never exceed 3 flashes/second (WCAG 2.3.1) and never use jumpscares.
5. **Sensory Redundancy**: Every critical audio cue must have a distinct visual twin (icon pulse or caption). Never distinguish game elements by color alone.
6. **Player Well-being**: Include a break reminder after ~45 minutes of continuous play (max once per hour, dismissible).
7. **Privacy & Consent**: Telemetry is strictly opt-in, stores zero personal data, generates random anonymous IDs, and includes a data wipe button.
