# Mapgen Notes & BSP Guidelines

Read this when writing or modifying procedural dungeon generation.

## Parameters
- **Grid size**: 40 tiles wide by 30 tiles high.
- **BSP recursion**: Split tree depth 3 to 4, alternating vertical and horizontal cuts.
- **Room bounds**: Minimum room size 4x4, maximum room size 10x8, with 1-tile boundary padding.
- **Corridors**: L-shaped or direct 1-tile wide connections between sibling leaf nodes.

## Stairs Distance Verification
1. Locate start room center (spawn position).
2. Calculate map diameter via bounding box Manhattan / Chebyshev upper bound.
3. Perform BFS traversal from start position to all reachable floor tiles.
4. Stairs must be placed at a candidate tile where `bfsDistance(start, stairs) >= 0.60 * mapDiameter`.

## Connectivity Test Pattern
Run 100 seeded iterations in Vitest:
```ts
for (let seed = 1; seed <= 100; seed++) {
  const map = generateDungeon(new Rng(seed));
  expect(isFullyConnected(map)).toBe(true);
  expect(canReachStairs(map)).toBe(true);
}
```
All walkable floor tiles must belong to a single connected component.
