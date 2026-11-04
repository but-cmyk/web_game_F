# Deterministic Replay Specification

Read this when writing tests to reproduce and resolve gameplay bugs.

## Replay Log Format
```json
{
  "seed": 42091,
  "floor": 1,
  "actions": [
    { "type": "MOVE", "dir": "NORTH", "mode": "WALK" },
    { "type": "MOVE", "dir": "EAST", "mode": "SNEAK" },
    { "type": "INTERACT", "target": "CHEST" }
  ]
}
```

## Replay Test Pattern
```ts
import { TurnResolver } from '../src/core/turn';
import { Rng } from '../src/core/rng';

test('reproduces crawler getting stuck on corner', () => {
  const rng = new Rng(42091);
  const state = initializeDungeon(rng);
  
  for (const action of bugLog.actions) {
    TurnResolver.step(state, action);
  }
  
  // Assert expected fix condition
  expect(state.monsters[0].state).not.toBe('STUCK');
});
```

## Shrinking Action Logs
When an error occurs during a long run:
1. Binary-chop the action array to locate the earliest turn where state deviates from expected invariants.
2. Remove extraneous intermediate movements that do not alter the failing interaction.
