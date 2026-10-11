import { expect, it } from 'vitest';
import { stationActionPoint, stationPoint, stationSlotPoint } from '../src/game/KitchenView';
import {
  layoutFor,
  projectActor,
  recoveryControl,
  supplyPoint,
  traySurface,
} from '../src/game/layout';

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

it('desktop and Pad tray handles stay above the entire device and commission row', () => {
  for (const [width, height] of [
    [1280, 720],
    [768, 1024],
    [1024, 768],
  ] as const) {
    const l = layoutFor(width, height, 'service');
    for (const tray of l.trays) expect(tray.y + 96).toBeLessThanOrEqual(l.regions.action.y - 8);
  }
});

it('food and both tray actions stay below the header and cannot overlap each other', () => {
  for (const [w, h] of [
    [852, 300],
    [852, 342],
    [852, 393],
    [768, 1024],
  ] as const) {
    const l = layoutFor(w, h);
    expect(l.trayWidth).toBeGreaterThanOrEqual(136);
    for (const tray of [0, 1] as const) {
      const a = traySurface(l, tray);
      expect(a.food.y - 23).toBeGreaterThanOrEqual(l.regions.top.y + l.regions.top.height);
      expect(a.food.y + 23).toBeLessThanOrEqual(a.handle.y - 24);
      expect(a.handle.width).toBeGreaterThanOrEqual(48);
      expect(a.handle.x + a.handle.width / 2 + 8).toBeLessThanOrEqual(
        a.destination.x - a.destination.width / 2 + 0.01,
      );
    }
  }
});

it('saved delivery anchors project to the actual food tray after rotation', () => {
  for (const [w, h] of [
    [393, 665],
    [768, 1024],
    [852, 300],
    [1280, 720],
  ] as const) {
    const l = layoutFor(w, h);
    for (const tray of [0, 1] as const) {
      const food = traySurface(l, tray).food;
      const actor = projectActor({ x: tray === 0 ? 0.205 : 0.695, y: 0.68 }, l);
      expect(actor.x).toBeCloseTo(food.x);
      expect(actor.y).toBeCloseTo(food.y + 7);
    }
  }
});

it('single-tray modes project their saved .45 anchor to the actual sole plate', () => {
  for (const mode of ['guided', 'practice'] as const) {
    for (const [w, h] of [
      [393, 665],
      [768, 1024],
      [852, 300],
      [1280, 720],
    ] as const) {
      const l = layoutFor(w, h, mode);
      expect(projectActor({ x: 0.45, y: 0.68 }, l)).toEqual(traySurface(l, 0).plate);
    }
  }
});

it('the 48px recovery action has its own slot beside the ingredient bank', () => {
  for (const [w, h] of [
    [393, 565],
    [852, 300],
    [768, 1024],
    [1280, 720],
  ] as const) {
    const l = layoutFor(w, h);
    const r = recoveryControl(l);
    expect(r.x).toBeGreaterThanOrEqual(l.regions.supplies.x + l.regions.supplies.width + 8);
    expect(r.x + 48).toBeLessThanOrEqual(w);
    expect(r.y + 48).toBeLessThanOrEqual(h);
    for (let i = 0; i < 5; i++) expect(supplyPoint(l, i, 5).x + 22).toBeLessThan(r.x);
  }
});

it('phone station selection and start are separate from its five ingredient positions', () => {
  const l = layoutFor(393, 665);
  for (const id of ['ice', 'board'] as const) {
    const device = stationPoint(id, l);
    const action = stationActionPoint(id, l);
    expect(action.y - 24).toBeGreaterThan(device.y + (95 * l.scale) / 2);
    for (let n = 0; n < 5; n++) {
      const food = stationSlotPoint(id, n, l);
      expect(Math.abs(food.x - action.x) >= 46 || food.y + 22 <= action.y - 24).toBe(true);
    }
  }
});
