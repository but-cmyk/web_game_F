# Bug Pattern Catalog (24 Prevention Rules)

Read this catalog when authoring new routines or inspecting edge cases.

1. **Off-by-One in Ranges**: Bad: `for (let i = 0; i <= arr.length; i++)`. Good: `for (let i = 0; i < arr.length; i++)`.
2. **Grid Index Inversion**: Bad: `idx = x * width + y`. Good: `idx = y * width + x`.
3. **Missing Grid Bounds Guard**: Bad: `grid[y][x] = 1`. Good: `if (x >= 0 && x < width && y >= 0 && y < height) grid[y][x] = 1`.
4. **Float Equality Comparison**: Bad: `if (oilFrac === 0.3)`. Good: `if (Math.abs(oilFrac - 0.3) < 1e-6)`.
5. **Unguarded Division**: Bad: `return remaining / total`. Good: `return total > 0 ? remaining / total : 0`.
6. **Stale Closure in Handlers**: Bad: `btn.on('click', () => use(currentHp))`. Good: `btn.on('click', () => use(this.getState().hp))`.
7. **Mutating State in Pure Core**: Bad: `function update(state) { state.hp--; return state; }`. Good: `function update(state) { return { ...state, hp: state.hp - 1 }; }`.
8. **Modifying Array During Iteration**: Bad: `monsters.forEach((m, i) => { if (m.dead) monsters.splice(i, 1); })`. Good: `const survivors = monsters.filter(m => !m.dead)`.
9. **Unhandled Promise Rejection**: Bad: `saveData()`. Good: `saveData().catch(err => handleSaveError(err))`.
10. **Event Listener Memory Leak**: Bad: `emitter.on('event', fn)`. Good: Add listener and call `emitter.off('event', fn)` in scene shutdown.
11. **Dangling Scene Timers**: Bad: `this.time.addEvent({ ... })` without reference. Good: Store handle and call `timer.remove()` in destroy.
12. **Silent Catch**: Bad: `try { load() } catch (e) {}`. Good: `try { load() } catch (e) { logger.warn('Load failed, resetting state', e); resetState(); }`.
13. **Strict Equality on Objects**: Bad: `if (coordA === coordB)`. Good: `if (coordA.x === coordB.x && coordA.y === coordB.y)`.
14. **Wall Clock in Core**: Bad: `const now = Date.now()`. Good: Pass logical turn counter `turn: number` into resolution.
15. **Math.random in Core**: Bad: `if (Math.random() < 0.25)`. Good: `if (rng.next() < 0.25)`.
16. **Test Interdependence**: Bad: Reusing global mutated test state across `it()` blocks. Good: Create fresh fixtures in `beforeEach()`.
17. **Shared Object Reference Mutation**: Bad: `const pos = enemy.pos; pos.x += 1;`. Good: `enemy.pos = { x: enemy.pos.x + 1, y: enemy.pos.y };`.
18. **Clamping at Presentation Instead of Core**: Bad: Clamping Dread to 100 in the UI text widget. Good: Clamp inside `DreadSystem.add()` directly.
19. **Swallowing Assertion Errors**: Bad: `try { expect(true).toBe(false) } catch {}`. Good: Allow assertion failures to bubble.
20. **Unchecked JSON Key Cast**: Bad: `const data = JSON.parse(str) as Item;`. Good: Validate shape using a schema validator before casting.
21. **Unbounded Particle Creation**: Bad: Spawning unlimited particles per gold chime. Good: Pool particles and clamp max active to 30.
22. **Overwriting Saved State During Migration**: Bad: Blindly copying old fields over new schema defaults. Good: Apply explicit version migration step-by-step.
23. **Non-Exhaustive Switch**: Bad: `switch(type) { case 'A': ... }`. Good: Include `default: assertNever(type);`.
24. **Hardcoded Color in View**: Bad: `this.add.rectangle(x, y, w, h, 0xff0000)`. Good: Use palette index `PALETTE.danger`.

