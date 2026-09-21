import { expect, it } from 'vitest';
import { stationPoint, stationSlotPoint } from '../src/game/KitchenView';
import { layoutFor, projectActor } from '../src/game/layout';

it.each([300, 342, 393])(
  'short landscape %s leaves separate trays with room for 44px food and handles',
  (height) => {
    const l = layoutFor(852, height, 'service');
    const [a, b] = l.trays;
    expect(Math.abs(a.x - b.x) >= l.trayWidth + 8 || Math.abs(a.y - b.y) >= 108).toBe(true);
    for (const p of l.trays) {
      expect(p.x - l.trayWidth / 2).toBeGreaterThanOrEqual(0);
      expect(p.x + l.trayWidth / 2).toBeLessThanOrEqual(852);
      expect(p.y + 52).toBeLessThanOrEqual(l.regions.action.y);
    }
  },
);
it('phone idle cat has its own space clear of the five board food positions', () => {
  const l = layoutFor(393, 565, 'service');
  const board = stationPoint('board', l);
  const cat = projectActor({ x: 0.73, y: 0.43 }, l);
  expect(cat.y - 28 * l.scale + l.actorHeight / 2).toBeLessThan(board.y - 44);
});

it('all five station ingredient hit areas remain independently selectable', () => {
  for (const [w, h] of [
    [393, 565],
    [852, 300],
    [1024, 768],
  ] as const) {
    const l = layoutFor(w, h);
    const points = Array.from({ length: 5 }, (_, i) => stationSlotPoint('board', i, l));
    for (let i = 0; i < 5; i++)
      for (let j = i + 1; j < 5; j++) {
        const a = points[i],
          b = points[j];
        if (!a || !b) throw Error('missing slot');
        expect(Math.abs(a.x - b.x) >= 44 || Math.abs(a.y - b.y) >= 44).toBe(true);
      }
  }
});
