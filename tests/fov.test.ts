import { describe, it, expect } from 'vitest';
import { computeFOV, createFogOfWar, updateFogOfWar } from '../src/core/fov';
import { toIndex, Coord } from '../src/core/grid';

describe('Line of Sight & Circular FOV', () => {
  const width = 20;
  const height = 20;

  it('reveals tiles within circular radius and hides tiles beyond radius in open space', () => {
    const origin: Coord = { x: 10, y: 10 };
    const radius = 5;
    const isOpaque = () => false; // Open room, no walls

    const visible = computeFOV(origin, radius, isOpaque, width, height);

    // Origin is visible
    expect(visible.has(toIndex(10, 10, width))).toBe(true);

    // Tile at distance 3 is visible
    expect(visible.has(toIndex(10, 7, width))).toBe(true);
    expect(visible.has(toIndex(13, 10, width))).toBe(true);

    // Tile at distance 5 is visible
    expect(visible.has(toIndex(10, 5, width))).toBe(true);
    expect(visible.has(toIndex(15, 10, width))).toBe(true);

    // Tile at distance 6 is hidden (outside radius)
    expect(visible.has(toIndex(10, 4, width))).toBe(false);
    expect(visible.has(toIndex(16, 10, width))).toBe(false);

    // Corner at dx=4, dy=4 has distance = sqrt(32) ≈ 5.65 > 5, must be hidden
    expect(visible.has(toIndex(14, 14, width))).toBe(false);
  });

  it('occludes tiles behind a wall while keeping the wall itself visible', () => {
    const origin: Coord = { x: 10, y: 10 };
    const radius = 5;
    // Place a vertical wall segment at x = 12, y in [8..12]
    const isOpaque = (c: Coord) => c.x === 12 && c.y >= 8 && c.y <= 12;

    const visible = computeFOV(origin, radius, isOpaque, width, height);

    // Origin is visible
    expect(visible.has(toIndex(10, 10, width))).toBe(true);

    // Floor in front of wall is visible
    expect(visible.has(toIndex(11, 10, width))).toBe(true);

    // Wall tile itself is visible
    expect(visible.has(toIndex(12, 10, width))).toBe(true);

    // Floor tile directly behind wall is occluded
    expect(visible.has(toIndex(13, 10, width))).toBe(false);
    expect(visible.has(toIndex(14, 10, width))).toBe(false);
  });

  it('correctly manages Fog of War: marks visible and retains explored memory', () => {
    const fog = createFogOfWar(width, height);
    const radius = 5;
    const isOpaque = () => false;

    // Step 1: Player at (5, 5)
    const fov1 = computeFOV({ x: 5, y: 5 }, radius, isOpaque, width, height);
    updateFogOfWar(fog, fov1);

    const tileAt55 = toIndex(5, 5, width);
    const tileAt56 = toIndex(5, 6, width);
    const tileAt1818 = toIndex(18, 18, width);

    expect(fog.visible[tileAt55]).toBe(true);
    expect(fog.explored[tileAt55]).toBe(true);
    expect(fog.visible[tileAt56]).toBe(true);
    expect(fog.explored[tileAt56]).toBe(true);
    expect(fog.visible[tileAt1818]).toBe(false);
    expect(fog.explored[tileAt1818]).toBe(false);

    // Step 2: Player moves far away to (18, 18)
    const fov2 = computeFOV({ x: 18, y: 18 }, radius, isOpaque, width, height);
    updateFogOfWar(fog, fov2);

    // (5, 5) is no longer visible, but remains explored!
    expect(fog.visible[tileAt55]).toBe(false);
    expect(fog.explored[tileAt55]).toBe(true);

    // (18, 18) is now visible and explored
    expect(fog.visible[tileAt1818]).toBe(true);
    expect(fog.explored[tileAt1818]).toBe(true);
  });
});
