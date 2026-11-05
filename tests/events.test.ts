import { describe, it, expect, vi } from 'vitest';
import { EventBus, GameEventMap } from '../src/core/events';

describe('Typed EventBus', () => {
  it('delivers typed payload to registered listener', () => {
    const bus = new EventBus<GameEventMap>();
    const listener = vi.fn();

    bus.on('StepTaken', listener);
    bus.emit('StepTaken', {
      depth: 1,
      x: 10,
      y: 12,
      mode: 'walk',
      oilCost: 1.15,
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      depth: 1,
      x: 10,
      y: 12,
      mode: 'walk',
      oilCost: 1.15,
    });
  });

  it('unsubscribes listener via returned function or off() method', () => {
    const bus = new EventBus<GameEventMap>();
    const listener = vi.fn();

    const unsubscribe = bus.on('DreadChanged', listener);
    bus.emit('DreadChanged', { oldDread: 20, newDread: 30, reason: 'unlit' });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    bus.emit('DreadChanged', { oldDread: 30, newDread: 40, reason: 'unlit' });
    expect(listener).toHaveBeenCalledTimes(1); // not called again
  });

  it('executes multiple listeners in FIFO registration order', () => {
    const bus = new EventBus<GameEventMap>();
    const order: number[] = [];

    bus.on('GoldPicked', () => order.push(1));
    bus.on('GoldPicked', () => order.push(2));
    bus.on('GoldPicked', () => order.push(3));

    bus.emit('GoldPicked', { amount: 10, totalCarried: 10, x: 2, y: 3 });
    expect(order).toEqual([1, 2, 3]);
  });

  it('clears all listeners when clear() is invoked', () => {
    const bus = new EventBus<GameEventMap>();
    const fn1 = vi.fn();
    const fn2 = vi.fn();

    bus.on('RunEnded', fn1);
    bus.on('StepTaken', fn2);

    bus.clear();

    bus.emit('RunEnded', { outcome: 'extracted', depth: 3, bankedGold: 100, lostGold: 0 });
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).not.toHaveBeenCalled();
  });
});

import eventsData from '../src/data/events.json';
import { rollSideEvent, DungeonSideEvent } from '../src/core/events';
import { Rng } from '../src/core/rng';

describe('Side Events System (§5 M9)', () => {
  const events = eventsData.events as DungeonSideEvent[];

  it('contains at least 10 distinct side events', () => {
    expect(events.length).toBeGreaterThanOrEqual(10);
    const ids = new Set(events.map((e) => e.id));
    expect(ids.size).toBe(events.length);
  });

  it('has valid positive weights and localization keys for all events', () => {
    for (const evt of events) {
      expect(evt.weight).toBeGreaterThan(0);
      expect(evt.name_key.startsWith('event.')).toBe(true);
      expect(evt.desc_key.startsWith('event.')).toBe(true);
    }
  });

  it('rolls events deterministically with seeded Rng', () => {
    const rng1 = new Rng(98765);
    const rolled1 = rollSideEvent(rng1, events);

    const rng2 = new Rng(98765);
    const rolled2 = rollSideEvent(rng2, events);

    expect(rolled1.id).toBe(rolled2.id);
  });
});

