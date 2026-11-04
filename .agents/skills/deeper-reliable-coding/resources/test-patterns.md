# Test Patterns for DEEPER

Read this when writing unit, property-style, or regression tests in `tests/`.

## 1. Table-Driven Unit Testing
Use table fixtures to verify formulas across boundary extremes:
```ts
describe('oilCostPerStep', () => {
  const cases = [
    { depth: 1, expected: 1.15 },
    { depth: 6, expected: 1.90 },
    { depth: 12, expected: 2.80 },
  ];
  test.each(cases)('calculates cost at depth $depth', ({ depth, expected }) => {
    expect(oilCostPerStep(depth)).toBeCloseTo(expected, 2);
  });
});
```

## 2. Seeded Loop Property Verification (100 Seeds)
Verify invariants across 100 procedural seeds without external property libraries:
```ts
test('100 seeded maps guarantee stairs reachability', () => {
  for (let s = 1; s <= 100; s++) {
    const map = generateDungeon(new Rng(s));
    expect(hasValidPathToStairs(map)).toBe(true);
  }
});
```

## 3. Finite State Machine (FSM) Transition Testing
Test one discrete transition per test block:
```ts
test('Crawler transitions from PATROL to SUSPICIOUS upon hearing noise', () => {
  const crawler = createCrawler({ state: 'PATROL' });
  const event = { type: 'NOISE', distance: 3, maxDistance: 4 };
  const next = crawlerFSM.transition(crawler, event);
  expect(next.state).toBe('SUSPICIOUS');
});
```

## 4. Wall-Blocking Noise Tests
Assert that noise propagation evaluates BFS pathing rather than Euclidean line-of-sight:
```ts
test('Noise does not penetrate solid wall', () => {
  const grid = createTestGridWithSolidDividingWall();
  const reached = propagateNoiseBFS(grid, { x: 2, y: 5 }, 4);
  expect(reached.has('4,5')).toBe(false); // behind the wall
});
```

## 5. Mutation Thinking
Before finalizing any test, ask: *"If I alter the formula by +1 or invert the inequality sign in the implementation, will this test unequivocally fail?"* If no, make the assertion stricter.
