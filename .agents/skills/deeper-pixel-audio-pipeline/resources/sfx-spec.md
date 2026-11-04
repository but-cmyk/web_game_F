# Synthesized SFX Specification (12 Core Sounds)

Read this when implementing synthesized sound routines in `src/audio/sfx.ts`.

| # | Sound Name | Oscillator Wave | Frequency Range | ADSR Envelope | Trigger Event | Visual Twin |
|---|---|---|---|---|---|---|
| 1 | `sfx_step_sneak` | Sine | 80 -> 40 Hz | A: 5ms, D: 30ms, R: 10ms | Sneak move | Tiny dust puff |
| 2 | `sfx_step_walk` | Triangle | 120 -> 60 Hz | A: 5ms, D: 45ms, R: 15ms | Walk move | Medium step ring |
| 3 | `sfx_step_run` | Sawtooth (filtered) | 180 -> 70 Hz | A: 5ms, D: 60ms, R: 20ms | Run move | Large step shockwave |
| 4 | `sfx_gold_chime` | Sine | 523 -> 659 -> 784 Hz | A: 2ms, D: 80ms, R: 60ms | Gold pickup | Sparkle particle burst |
| 5 | `sfx_heartbeat` | Sine | 55 -> 40 Hz | A: 10ms, D: 100ms, R: 50ms | Dread pulse | Red border throb |
| 6 | `sfx_monster_alert` | Sawtooth | 350 -> 600 Hz | A: 10ms, D: 150ms, R: 50ms | Monster CHASE | Eye alert icon |
| 7 | `sfx_chest_open` | Square (filtered) | 220 -> 440 Hz | A: 5ms, D: 120ms, R: 40ms | Chest unlock | Chest lid flip |
| 8 | `sfx_curse_trigger` | Sawtooth (detuned) | 150 -> 90 Hz | A: 20ms, D: 300ms, R: 100ms | Curse accepted | Dark miasma shroud |
| 9 | `sfx_damage` | Noise + Square | 200 -> 50 Hz | A: 2ms, D: 120ms, R: 50ms | Player hit | Screen shake + flash |
| 10 | `sfx_extract_station`| Sine chord | 330, 440, 550 Hz | A: 50ms, D: 400ms, R: 200ms | Exit approached | Golden ray beam |
| 11 | `sfx_rope_use` | Triangle | 250 -> 500 Hz | A: 30ms, D: 250ms, R: 80ms | Rope escape | Ascending arrow |
| 12 | `sfx_menu_select` | Sine | 440 -> 880 Hz | A: 2ms, D: 40ms, R: 20ms | Button pressed | Inverted button border |
