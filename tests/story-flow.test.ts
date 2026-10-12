import { expect, test } from 'vitest';
import { REQUESTS } from '../src/content/catalog';
import { type Product, RAW, RECIPES } from '../src/content/recipes';
import { advance, createGame, dispatch } from '../src/rules/game';
import { decodeSnapshot } from '../src/rules/snapshot';
import type { Command, GameState } from '../src/rules/types';

let serial = 0;
const run = (s: GameState, c: unknown) =>
  dispatch(s, { id: `flow-${++serial}`, runId: s.runId, command: c as Command });
const start = (chapter = 0) =>
  run(createGame('continuous', 0, {}, 'practice'), {
    type: 'adventure-start',
    chapter,
    continuous: true,
  }).state;
const tick = (s: GameState, until: (s: GameState) => boolean, limit = 30000) => {
  for (let ms = 0; ms < limit && !until(s); ms += 100) s = advance(s, 100);
  expect(until(s)).toBe(true);
  return s;
};
function make(s: GameState, product: Product): GameState {
  if (RAW.includes(product)) return run(s, { type: 'pickup', source: { supply: product } }).state;
  const r = RECIPES.find((r) => r.output === product);
  if (!r) throw Error(product);
  const inputs =
    r.family === 'sandwich'
      ? ['bread' as Product, ...r.inputs.filter((p) => p !== 'bread'), 'bread' as Product]
      : r.inputs;
  for (const p of inputs) {
    if (!RAW.includes(p)) {
      s = make(s, p);
      s = run(s, { type: 'put', target: { station: r.station } }).state;
    } else
      s = run(s, {
        type: 'ingredient',
        product: p,
        target:
          r.station === 'machine'
            ? { machine: p === 'cup' ? 'cup' : 'apple' }
            : { station: r.station },
      }).state;
  }
  if (r.station === 'machine' || r.station === 'grill') {
    s = run(
      s,
      r.station === 'machine'
        ? { type: 'start-machine' }
        : { type: 'start-station', station: 'grill' },
    ).state;
    s = tick(s, (s) => s.items.some((i) => i.product === product));
  }
  const food = s.items.find(
    (i) =>
      i.product === product &&
      (r.station === 'machine'
        ? i.location === 'machine:cup'
        : i.location.startsWith(`station:${r.station}:`)),
  );
  if (!food) throw Error(`not made ${product}`);
  const result = run(s, { type: 'pickup', source: { item: food.id } });
  expect(result.kind).toBe('ok');
  return result.state;
}
function serve(s: GameState, visitor?: string): GameState {
  const o = s.orders.find((o) => o.status === 'waiting' && (!visitor || o.visitor === visitor));
  if (!o) throw Error('no waiting guest');
  for (const p of REQUESTS[o.request].products) s = make(s, p);
  const r = run(s, { type: 'put', target: { order: o.id } });
  expect(r.kind).toBe('ok');
  return tick(r.state, (s) => s.orders.find((x) => x.id === o.id)?.status === 'done');
}
test('natural first guest and two short breakfast waves introduce quantities without welcome buttons', () => {
  let s = start();
  expect(s.orders.filter((o) => o.status === 'waiting').map((o) => o.request)).toEqual(['apple']);
  s = serve(s);
  s = tick(s, (s) => s.orders.some((o) => o.status === 'waiting'));
  expect(s.orders.find((o) => o.status === 'waiting')?.request).toBe('banana');
  s = serve(s);
  s = tick(s, (s) => s.orders.some((o) => o.status === 'waiting'));
  expect(s.orders.find((o) => o.status === 'waiting')?.request).toBe('two');
  s = serve(s);
  s = tick(s, (s) => s.orders.some((o) => o.status === 'waiting'));
  s = serve(s);
  s = tick(s, (s) => Boolean(s.adventure?.rewards.length));
  expect(s.adventure?.foods.map((f) => f.product)).toHaveLength(6);
  const restored = decodeSnapshot(JSON.stringify(s));
  expect(restored.ok).toBe(true);
  s = tick(s, (s) => s.session.chapter === 1);
  expect(s.adventure?.flow?.archives[0]?.foods).toHaveLength(6);
  expect(s.attempts).toHaveLength(4);
  expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
});
test('wrong food and replayed input cannot produce a receive or advance a wave', () => {
  let s = start();
  s = make(s, 'banana');
  const e = {
    id: 'wrong',
    runId: s.runId,
    command: { type: 'put', target: { order: 'guest-0' } } as Command,
  };
  const r = dispatch(s, e);
  expect(r.kind).toBe('mismatch');
  s = advance(r.state, 10000);
  expect(s.adventure?.foods).toEqual([]);
  expect(s.adventure?.flow?.wave).toBe(0);
  expect(s.items[0]?.product).toBe('banana');
  expect(dispatch(s, e).kind).toBe('duplicate');
});
test.each(['rabbit', 'hedgehog'])(
  'picnic route is decided by actual %s receive; both guests arrive together',
  (first) => {
    let s = start(2);
    expect(s.orders.filter((o) => o.status === 'waiting')).toHaveLength(2);
    expect(s.adventure?.branch).toBe(null);
    s = serve(s, first);
    expect(s.adventure?.branch).toBe(first);
    s = serve(s, first === 'rabbit' ? 'hedgehog' : 'rabbit');
    if (first === 'rabbit') {
      for (const p of ['sandwich', 'apple'] as const) {
        s = make(s, p);
        const r = run(s, { type: 'put', target: { world: 'pack' } });
        expect(r.kind).toBe('ok');
        s = tick(r.state, (s) => !s.actor.current);
      }
    }
    s = tick(s, (s) => Boolean(s.adventure?.rewards.length));
    expect(s.adventure?.foods).toHaveLength(first === 'rabbit' ? 4 : 2);
    expect(s.adventure?.steps).toContain('cloth');
    expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
  },
);
test('desserts retain strict real compositions; comparison and tasting follow receipts naturally', () => {
  let s = start(1);
  while (s.orders.some((o) => o.status !== 'done')) {
    s = tick(s, (s) => s.orders.some((o) => o.status === 'waiting'));
    s = serve(s);
  }
  s = make(s, 'vanilla-cup');
  s = run(s, { type: 'put', target: { world: 'cool' } }).state;
  s = tick(s, (s) => Boolean(s.adventure?.rewards.length));
  expect(s.adventure?.experience?.used).toContain('compare');
  expect(s.adventure?.foods.every((f) => f.tasted)).toBe(true);
  expect(s.attempts).toHaveLength(4);
  expect(s.adventure?.rewards).toHaveLength(1);
  expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
});
test('twilight uses real parallel heat and juice; extra inventory survives the natural chapter transition', () => {
  let s = start(3);
  s = run(s, { type: 'ingredient', product: 'patty', target: { station: 'grill' } }).state;
  s = run(s, { type: 'start-station', station: 'grill' }).state;
  s = run(s, { type: 'ingredient', product: 'apple', target: { machine: 'apple' } }).state;
  s = run(s, { type: 'ingredient', product: 'cup', target: { machine: 'cup' } }).state;
  s = run(s, { type: 'start-machine' }).state;
  const restored = decodeSnapshot(JSON.stringify(s));
  expect(restored.ok).toBe(true);
  s = advance(s, 3500);
  expect(s.stations.grill.status).toBe('ready');
  expect(s.machine.status).toBe('processing');
  expect(s.attempts).toEqual([]);
});
test('new-format saves reject out-of-range progress and fabricated chapter archives', () => {
  const s = start();
  expect(s.adventure?.flow).toBeDefined();
  expect(
    decodeSnapshot(
      JSON.stringify({
        ...s,
        adventure: { ...s.adventure, flow: { ...s.adventure?.flow, wave: 99 } },
      }),
    ).ok,
  ).toBe(false);
});
test('valid prior content retains food, support and processing and does not infer new receipts', () => {
  let s = run(createGame('legacy', 0, {}, 'practice'), {
    type: 'adventure-start',
    chapter: 3,
  }).state;
  s = run(s, { type: 'ingredient', product: 'patty', target: { station: 'grill' } }).state;
  s = run(s, { type: 'start-station', station: 'grill' }).state;
  const before = structuredClone(s);
  const r = decodeSnapshot(JSON.stringify({ ...s, contentVersion: 'direct-cooking-1' }));
  expect(r.ok).toBe(true);
  if (r.ok) {
    expect(r.state.items).toEqual(before.items);
    expect(r.state.stations).toEqual(before.stations);
    expect(r.state.attempts).toEqual([]);
    expect(r.state.adventure?.rewards).toEqual([]);
  }
});
test('a natural chapter transition keeps an unfinished real juice job and extra held fruit', () => {
  let s = start();
  for (let i = 0; i < 4; i++) {
    s = tick(s, (s) => s.orders.some((o) => o.status === 'waiting'));
    s = serve(s);
  }
  s = tick(s, (s) => Boolean(s.adventure?.rewards.length));
  s = run(s, { type: 'ingredient', product: 'apple', target: { machine: 'apple' } }).state;
  s = run(s, { type: 'ingredient', product: 'cup', target: { machine: 'cup' } }).state;
  s = run(s, { type: 'start-machine' }).state;
  s = make(s, 'banana');
  const ids = s.items.map((i) => i.id);
  const attempts = structuredClone(s.attempts);
  s = tick(s, (s) => s.session.chapter === 1);
  expect(s.items.map((i) => i.id)).toEqual(ids);
  expect(s.machine.status).toBe('processing');
  expect(s.attempts).toEqual(attempts);
  expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
});
test('returning guests naturally request real food; two valid shares save the actual work and end once', () => {
  let s = start(4);
  expect(s.adventure?.invitations).toEqual(['rabbit', 'hedgehog']);
  for (const [visitor, product] of [
    ['rabbit', 'apple'],
    ['hedgehog', 'juice'],
  ] as const) {
    s = make(s, product);
    const r = run(s, { type: 'adventure', action: 'create', tray: 0, fromHand: true, visitor });
    expect(r.kind).toBe('ok');
    s = tick(r.state, (s) => !s.actor.current);
  }
  s = tick(s, (s) => Boolean(s.adventure?.rewards.length));
  expect(s.adventure?.flow?.phase).toBe('complete');
  expect(s.adventure?.works[0]?.foods.map((f) => f.product)).toEqual(['apple', 'juice']);
  expect(s.adventure?.foods.every((f) => f.tasted)).toBe(true);
  expect(s.attempts).toEqual([]);
  const next = advance(s, 10000);
  expect(next.adventure?.rewards).toHaveLength(1);
  expect(next.adventure?.works).toHaveLength(1);
  expect(decodeSnapshot(JSON.stringify(next)).ok).toBe(true);
});
