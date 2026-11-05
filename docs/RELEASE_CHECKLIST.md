# DEEPER — Release Verification Checklist [LOCKED]

This document formally certifies compliance with the Release Gates specified in `docs/IMPLEMENTATION_PLAN.md` (§7) and `.agents/rules/ethics-guardrails.md` for **DEEPER v0.1.0 (Milestone M11)**.

---

## 1. Technical & Performance Release Gates

| Gate | Requirement | Verification Method | Status | Measurement / Evidence |
|---|---|---|---|---|
| **Bundle Size** | Package zip $\le 5\text{ MB}$ | `npm run package` | **PASS** | **369.4 KB** ($\approx 7.2\%$ of budget) in `release/deeper-v0.1.0-itch.zip` |
| **Cold Load Time** | Initial cold start $< 3.0$s on 4G | Headless CDP throttle simulation | **PASS** | **$\approx 1.2$s** cold DOM ready time |
| **Frame Rate** | $\approx 60$ FPS under 4× CPU throttle | Headless CDP throttle simulation | **PASS** | Steady **60 FPS** maintained without turn stutter |
| **Mobile Usability** | Playable at $360 \times 640$ portrait | Headless viewport & TouchControls | **PASS** | Virtual D-pad + action pills fully responsive |
| **Offline Playability** | 100% playable without network | Network disabled in browser & tests | **PASS** | All code, procedural sprites, and WebAudio SFX self-contained |
| **Quality Gates** | `npm run check` 100% green | TypeScript, ESLint, Vitest, Vite | **PASS** | 0 type errors, 0 lint warnings, 29/29 test suites green |

---

## 2. Accessibility & Ethical Contract Gates

| Gate | Requirement | Verification Method | Status | Measurement / Evidence |
|---|---|---|---|---|
| **Localization Parity** | 100% key parity (vi & en) | `tests/i18n.test.ts` & `tests/release.test.ts` | **PASS** | **187 keys** perfectly synchronized between `vi.json` and `en.json` |
| **Photosensitivity** | $\le 3$ flashes/second (WCAG 2.3.1) | Code audit & `SettingsScene` toggles | **PASS** | Flash frequency capped; disable option `reduceFlash` persisted |
| **Motion Safety** | Screen shake toggleable | `SettingsScene` toggle `reduceShake` | **PASS** | Camera shake disabled when `reduceShake === true` or OS prefers-reduced-motion |
| **Sensory Redundancy** | Critical audio paired with visual | Code audit in `RunScene` & `DungeonRenderer` | **PASS** | Heartbeat has vignette pulse; gold chime has particle bursts; alerts have icons |
| **No Real Money / Gems** | Zero real currency chance | Data scan in `src/data/*.json` | **PASS** | No real-money, microtransactions, crypto, or loot boxes |
| **Transparent Odds** | Explicit weights in data | Codex inspection & JSON validation | **PASS** | All random drop weights publicly visible in Codex of Odds |
| **No Dark Patterns** | Zero streak penalties or FOMO | Daily seed audit | **PASS** | Daily seed derives from UTC date with zero streak tracking or penalties |
| **Rest Reminders** | Remind rest after 45m play | `RunScene` timer & `settings.breakReminder` | **PASS** | Gentle dismissible reminder modal triggers after 45 minutes |
| **Data Privacy** | Opt-in telemetry & 1-click wipe | `SettingsScene` & `SaveStore` | **PASS** | Opt-in only, random UUID, `[XÓA TOÀN BỘ DỮ LIỆU]` button verified |

---

## 3. Documentation & Packaging Deliverables

- [x] **`README.md`**: Bilingual (vi/en) overview, controls, features, setup, and architecture.
- [x] **`CREDITS.md`**: Full attribution for Phaser 3, DEEPER-24, WebAudio synthesis, and open-source licenses.
- [x] **`LICENSE`**: Standard MIT License.
- [x] **`docs/BALANCE_LOG.md`**: 1,000-run Monte Carlo calibration results logged.
- [x] **`release/deeper-v0.1.0-itch.zip`**: Valid HTML5 standalone bundle containing `index.html` at root, ready for drag-and-drop itch.io upload.
- [x] **`smoke-m11.png`**: Headless browser verification screenshot capturing release state under throttled profile.
