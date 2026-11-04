# Screen & Overlay Inventory

Read this when designing or modifying any screen in `src/scenes/` or `src/views/`.

| Screen / Overlay | Primary Job | Primary Action | Key Information Elements | Milestone |
|---|---|---|---|---|
| **Boot** | Initialize engine & display title | Start boot sequence | Title graphic, DEEPER-24 palette swatches | M0 |
| **Menu** | Entry portal & seed selection | "Start Run" | Play button, Daily seed, Meta shop link, Settings | M3 |
| **Tutorial** | Teach core loop in 3 minutes | "Next Step" / "Skip" | Oil meter explanation, Dread thresholds, Escape | M8 |
| **Run HUD** | Live situational awareness | Move / Toggle Mode | HP, Oil meter, Dread meter, Carried gold, Depth | M3 |
| **Bargain Modal** | Present Devil's offer | "Accept" or "Decline" | Explicit cost, explicit reward, decline button | M6 |
| **Chest Modal** | Present cursed chest choice | "Open" or "Leave" | Gold multiplier, 4 possible curses with odds | M6 |
| **Pause Overlay** | Freeze game & access settings | "Resume" | Volume slider, reduce-motion toggle, exit to menu | M4 |
| **Extract Confirm** | Confirm run termination | "Confirm Extract" | Carried gold to bank, return prompt | M3 |
| **Run Summary** | Tally outcome & losses | "View Mirror" | Depth reached, gold banked/lost, death cause | M3 |
| **Mirror Screen** | Behavioral psychological review | "Share Archetype" | Fear score, Greed score, Archetype card, Copy | M8 |
| **Codex** | Encyclopedia of odds | "Back" | All drop tables, item odds, curse probabilities | M6 |
| **Meta Shop** | Purchase persistent upgrades | "Buy Upgrade" | Current bank balance, available upgrades, costs | M7 |
| **Settings** | Accessibility & preferences | "Save & Back" | Audio volume, reduce flashing, reduce shake, lang | M9 |
| **Consent Screen** | Anonymous telemetry opt-in | "Accept" / "Decline" | Explanation, anonymous ID, delete data button | M10 |
| **Break Reminder** | Encourage player well-being | "Dismiss" / "Take Break" | Time played counter, friendly break suggestion | M10 |

