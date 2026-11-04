# Audio Cue & Visual Twin Specification

Read this when connecting audio events to rendering in `src/audio/` and `src/views/`.

| Audio Cue | Frequency / Synthesis | Visual Twin | Priority | Ducking |
|---|---|---|---|---|
| **Heartbeat** | 50-80 Hz sin pulse, BPM tied to Dread | Red vignette pulse & HUD Dread meter throbbing | Medium | None |
| **Monster Alarm** | 400-800 Hz harsh saw screech | Flashing monster eye icon in top HUD | High | Ducks ambient by 80% |
| **Stalker Whisper** | Filtered white noise sweep | Ghostly purple border shimmer | High | Ducks ambient by 50% |
| **Gold Pickup** | Rising pentatonic chime (440-880 Hz) | Gold spark particle burst & HUD increment | Low | None |
| **Exit Approaching** | Warm resonant hum | Torch glow pulsation at room edge | Low | None |

## Sensory Rules
- Color alone is never the only signal (pair color tint with shape/icon pulses).
- When `reduceFlashing` is enabled in Settings, clamp pulse opacity to <= 15% without abrupt jumps.
