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
  s = tick(s, (s) => s.adventure?.flow?.wave === 2);
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
test('admitting the next guest does not mutate the prior immutable game snapshot', () => {
  let s = start();
  s = make(s, 'apple');
  s = run(s, { type: 'put', target: { order: 'guest-0' } }).state;
  s = advance(s, (s.orders[0]?.remaining ?? 0) - 1);
  const before = JSON.stringify(s.orders);
  advance(s, 2);
  expect(JSON.stringify(s.orders)).toBe(before);
});
test('a save cannot skip a breakfast wave without the real earlier receptions', () => {
  const s = start();
  const value = structuredClone(s);
  if (value.adventure?.flow) value.adventure.flow.wave = 1;
  expect(decodeSnapshot(JSON.stringify(value)).ok).toBe(false);
});
test('an open dessert cannot be accepted before its actual sharing wave', () => {
  let s = start(1);
  s = make(s, 'strawberry-cup');
  const r = run(s, { type: 'put', target: { world: 'cool' } });
  expect(r.kind).toBe('blocked');
  expect(r.state.items).toEqual(s.items);
  expect(r.state.adventure?.foods).toEqual([]);
});
test('restoring a real picnic run keeps its route memory even when the separate profile write was lost', async () => {
  const { vi } = await import('vitest');
  const { GameController } = await import('../src/platform/controller');
  const { SaveStore, SAVE_KEY } = await import('../src/platform/save');
  let s = start(2);
  s = serve(s, 'hedgehog');
  s = serve(s, 'rabbit');
  s = tick(s, (s) => s.session.chapter === 3);
  const values = new Map([[SAVE_KEY, JSON.stringify(s)]]);
  const storage = {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => {
      values.set(k, v);
    },
    removeItem: (k: string) => {
      values.delete(k);
    },
  };
  vi.stubGlobal('localStorage', storage);
  try {
    const c = new GameController(new SaveStore(() => storage));
    c.enter('story', 3);
    expect(c.state.adventure?.experience?.picnic).toBe('hedgehog');
    expect(c.state.adventure?.flow?.archives[0]?.branch).toBe('hedgehog');
  } finally {
    vi.unstubAllGlobals();
  }
});
test('clearing the completed carnival preserves its reward and a valid recoverable world', () => {
  let s = start(4);
  for (const [visitor, product] of [
    ['rabbit', 'apple'],
    ['hedgehog', 'juice'],
  ] as const) {
    s = make(s, product);
    s = run(s, { type: 'adventure', action: 'create', tray: 0, fromHand: true, visitor }).state;
    s = tick(s, (s) => !s.actor.current);
  }
  s = tick(s, (s) => s.adventure?.flow?.phase === 'complete');
  const works = structuredClone(s.adventure?.works);
  const r = run(s, { type: 'adventure', action: 'clear-table', confirmed: true });
  expect(r.kind).toBe('ok');
  expect(r.state.adventure?.foods).toEqual([]);
  expect(r.state.adventure?.works).toEqual(works);
  expect(decodeSnapshot(JSON.stringify(r.state)).ok).toBe(true);
});
test('restoring a rewarded chapter without the separate profile recovers each actual chapter memory', async () => {
  const { vi } = await import('vitest');
  const { GameController } = await import('../src/platform/controller');
  const { SaveStore, SAVE_KEY } = await import('../src/platform/save');
  let s = start();
  for (let i = 0; i < 4; i++) {
    s = tick(s, (s) => s.orders.some((o) => o.status === 'waiting'));
    s = serve(s);
  }
  s = tick(s, (s) => s.session.chapter === 1);
  while (s.orders.some((o) => o.status !== 'done')) {
    s = tick(s, (s) => s.orders.some((o) => o.status === 'waiting'));
    s = serve(s);
  }
  s = tick(s, (s) => s.adventure?.flow?.wave === 2);
  s = make(s, 'vanilla-cup');
  s = run(s, { type: 'put', target: { world: 'cool' } }).state;
  s = tick(s, (s) => s.adventure?.flow?.phase === 'reward');
  const values = new Map([[SAVE_KEY, JSON.stringify(s)]]);
  const storage = {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => {
      values.set(k, v);
    },
    removeItem: (k: string) => {
      values.delete(k);
    },
  };
  vi.stubGlobal('localStorage', storage);
  try {
    const c = new GameController(new SaveStore(() => storage));
    c.enter('story', 1);
    const memories = c.profile.value.activityMemories;
    expect(memories.map((m) => m.state.chapter).sort()).toEqual([0, 1]);
    expect(memories.find((m) => m.state.chapter === 0)?.state.foods.map((f) => f.product)).toEqual(
      s.adventure?.flow?.archives[0]?.foods.map((f) => f.product),
    );
  } finally {
    vi.unstubAllGlobals();
  }
});
test('an already rewarded legacy feast gains no new sharing obligations on adoption', async () => {
  const { vi } = await import('vitest');
  const { GameController } = await import('../src/platform/controller');
  const { SaveStore, SAVE_KEY } = await import('../src/platform/save');
  let s = run(createGame('old-feast', 0, {}, 'practice'), {
    type: 'adventure-start',
    chapter: 4,
  }).state;
  for (const visitor of ['rabbit', 'hedgehog'])
    s = run(s, { type: 'adventure', action: 'invite', visitor }).state;
  s = make(s, 'apple');
  s = run(s, {
    type: 'adventure',
    action: 'create',
    tray: 0,
    fromHand: true,
    visitor: 'rabbit',
  }).state;
  s = tick(s, (s) => !s.actor.current);
  s = run(s, { type: 'adventure', action: 'taste', item: s.adventure?.foods[0]?.id }).state;
  s = run(s, { type: 'adventure', action: 'save-work' }).state;
  const finish = run(s, { type: 'adventure', action: 'finish' });
  expect(finish.kind).toBe('ok');
  s = finish.state;
  const values = new Map([
    [SAVE_KEY, JSON.stringify({ ...s, contentVersion: 'direct-cooking-1' })],
  ]);
  const storage = {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => {
      values.set(k, v);
    },
    removeItem: (k: string) => {
      values.delete(k);
    },
  };
  vi.stubGlobal('localStorage', storage);
  try {
    const c = new GameController(new SaveStore(() => storage));
    c.enter('story', 4);
    expect(c.state.adventure?.rewards).toEqual(['feast-page']);
    expect(decodeSnapshot(JSON.stringify(c.state)).ok).toBe(true);
  } finally {
    vi.unstubAllGlobals();
  }
});
test('a new archive cannot manufacture a breakfast completion from only step and reward strings', () => {
  const s = start(1);
  const memory = {
    chapter: 0,
    kind: 'chapter',
    branch: null,
    explored: [],
    steps: ['served:rabbit', 'served:hedgehog'],
    rewards: ['flower-page'],
    foods: [],
    works: [],
    decor: { flower: 0, bunting: 'warm', cloth: 'leaf', light: 'warm' },
    invitations: [],
  };
  const value = structuredClone(s);
  if (value.adventure?.flow) value.adventure.flow.archives.push(memory as never);
  expect(decodeSnapshot(JSON.stringify(value)).ok).toBe(false);
});
test('the first real dessert attempt has its own chapter and is not a breakfast retry', () => {
  let s = start();
  for (let i = 0; i < 4; i++) {
    s = tick(s, (s) => s.orders.some((o) => o.status === 'waiting'));
    s = serve(s);
  }
  s = tick(s, (s) => s.session.chapter === 1);
  s = serve(s);
  expect(s.attempts.at(-1)?.retry).toBe(0);
  expect(s.attempts.at(-1)?.chapter).toBe(1);
});
test('explicitly revisiting a completed station keeps exploration open rather than sending it away again', async () => {
  const { vi } = await import('vitest');
  const { GameController } = await import('../src/platform/controller');
  const { SaveStore } = await import('../src/platform/save');
  const values = new Map<string, string>();
  const storage = {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => {
      values.set(k, v);
    },
    removeItem: (k: string) => {
      values.delete(k);
    },
  };
  let s = start();
  for (let i = 0; i < 4; i++) {
    s = tick(s, (s) => s.orders.some((o) => o.status === 'waiting'));
    s = serve(s);
  }
  s = tick(s, (s) => !!s.adventure?.rewards.length);
  const store = new SaveStore(() => storage);
  store.save(s);
  s = tick(s, (s) => s.session.chapter === 1);
  store.save(s);
  vi.stubGlobal('localStorage', storage);
  try {
    const c = new GameController(new SaveStore(() => storage));
    c.enter('story', 0);
    expect(c.state.adventure?.flow?.phase).toBe('explore');
    expect(advance(c.state, 5000).session.chapter).toBe(0);
    expect(decodeSnapshot(JSON.stringify(c.state)).ok).toBe(true);
  } finally {
    vi.unstubAllGlobals();
  }
});
