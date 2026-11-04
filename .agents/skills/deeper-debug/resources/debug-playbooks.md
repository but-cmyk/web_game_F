# Debug Playbooks (14 Common Symptoms)

Read this resource when diagnosing gameplay, rendering, or test failures.

1. **Blank Canvas**: Check DOM parent element; verify initial scene starts in Phaser config; inspect console for asset load rejections.
2. **Blurry / Uneven Pixels**: Verify `pixelArt: true` and `roundPixels: true`; ensure integer zoom scale factor; disable CSS bilinear filtering.
3. **Canvas Off-Center / Wrong Scale**: Check `scale.mode: Phaser.Scale.FIT` and `scale.autoCenter: Phaser.Scale.CENTER_BOTH`; inspect window resize listeners.
4. **Input Not Firing**: Verify scene input enabled; check if active DOM modal overlay blocks pointer events; confirm keyboard focus.
5. **Input Fires Twice**: Check for duplicate event listener registrations without shutdown cleanup; verify keydown debounce logic.
6. **Audio Silent**: Verify user gesture unlocked WebAudio AudioContext; check master volume and mute settings in `SaveStore`.
7. **Effect Lingers After Scene Exit**: Ensure tweens, particle emitters, and screen tint overlays are destroyed on `scene.events.on('shutdown')`.
8. **Core and Scene Out of Sync**: Compare sequence of events returned by `TurnResolver.step` against scene event subscribers.
9. **Flaky Unit Test**: Look for unseeded `Math.random` or `Date.now`; check for shared mutable fixture objects between test cases.
10. **FPS Drops / Stutter**: Inspect per-frame object allocation inside `update()`; check particle count cap; confirm texture pooling.
11. **Memory Growth Across Runs**: Check uncleaned Phaser scene textures or uncleared global event bus listeners.
12. **Save Fails to Load After Version Bump**: Check migration functions in `SaveStore`; ensure default values fill newly introduced schema keys.
13. **Wrong Gold or Oil Value**: Trace calculation to `lootValue(depth)` or `oilCostPerStep`; check for unrounded floating-point accumulation.
14. **Monster Stuck in State**: Trace FSM transitions; check if LOS obstruction logic correctly toggles `CHASE` to `SEARCH`.

