import { describe, expect, it } from 'vitest';
import { type Product, RECIPES } from '../src/content/recipes';
import { advance, createGame, dispatch, trayItems } from '../src/rules/game';
import { decodeSnapshot, validateState } from '../src/rules/snapshot';
import type { Command, GameState } from '../src/rules/types';

// Catch premature branching, relaxed strict matching, duplicated food and rewards.
let serial = 0;
const cmd = (s: GameState, command: Command) =>
  dispatch(s, { id: `t-${++serial}`, runId: s.runId, command });
const start = (chapter = 2) => {
  const r = cmd(createGame('adventure', 0, {}, 'practice'), {
    type: 'adventure-start',
    chapter,
  } as Command);
  expect(r.kind).toBe('ok');
  return r.state;
};
const act = (s: GameState, action: string, extra = {}) =>
  cmd(s, { type: 'adventure', action, ...extra } as Command);
const wait = (s: GameState) => advance(s, 30000);
function make(s: GameState, product: Product, tray: 0 | 1 = 0): GameState {
  const r = RECIPES.find((r) => r.output === product);
  if (!r) return cmd(s, { type: 'move', source: { supply: product }, destination: { tray } }).state;
  s = cmd(s, { type: 'family', family: r.family }).state;
  for (const input of r.inputs) {
    if (input === 'cooked-patty') {
      s = make(s, input, tray);
      continue;
    }
    s = cmd(s, {
      type: 'move',
      source: { supply: input },
      destination:
        r.station === 'machine'
          ? { machine: input === 'cup' ? 'cup' : 'apple' }
          : { station: r.station },
    }).state;
  }
  const started = cmd(
    s,
    r.station === 'machine'
      ? { type: 'start-machine', tray }
      : { type: 'start-station', station: r.station, tray },
  );
  expect(started.kind).toBe('ok');
  return wait(started.state);
}
function deliver(s: GameState, index: number, product: Product): GameState {
  s = make(s, product);
  const order = s.orders[index];
  if (!order) throw Error('order');
  const r = cmd(s, { type: 'deliver', tray: 0, order: order.id });
  expect(r.kind).toBe('ok');
  return wait(r.state);
}
describe('adventure causal rules', () => {
  it('breakfast delivery opens the flower drawer, not the initial click', () => {
    let s = start(0);
    expect(act(s, 'explore', { object: 'drawer' }).kind).toBe('blocked');
    expect(act(s, 'plant', { seat: 0 }).kind).toBe('blocked');
    s = deliver(s, 0, 'apple');
    s = act(s, 'explore', { object: 'drawer' }).state;
    expect(act(s, 'plant', { seat: 0 }).kind).toBe('ok');
  });
  it('a full table can pick up and rearrange a portion without returning it to the kitchen', () => {
    let s = start(4);
    for (const p of ['apple', 'banana', 'apple'] as const) s = make(s, p);
    s = wait(act(s, 'create', { tray: 0 }).state);
    const ids = s.adventure?.foods.map((f) => f.id) ?? [];
    ids.forEach((item, seat) => {
      s = act(s, 'place', { item, seat }).state;
    });
    expect(act(s, 'pickup', { item: ids[1] }).kind).toBe('ok');
    s = act(s, 'pickup', { item: ids[1] }).state;
    s = act(s, 'place', { item: ids[0], seat: 1 }).state;
    s = act(s, 'place', { item: ids[1], seat: 0 }).state;
    expect(s.adventure?.foods.map((f) => f.place)).toEqual(['table:1', 'table:0', 'table:2']);
    expect(s.items).toHaveLength(0);
    expect(validateState(s)).toBe(true);
  });
  it('does not branch on a mismatch or before the real receive phase', () => {
    let s = start();
    s = make(s, 'salad-sandwich');
    const wrong = cmd(s, { type: 'deliver', tray: 0, order: 'guest-0' });
    expect(wrong.kind).toBe('mismatch');
    expect(trayItems(wrong.state, 0)).toHaveLength(1);
    expect(wrong.state.adventure?.branch).toBeNull();
    const sent = cmd(wrong.state, { type: 'deliver', tray: 0, order: 'guest-1' });
    expect(sent.state.adventure?.branch).toBeNull();
    const received = wait(sent.state);
    expect(received.adventure?.branch).toBe('hedgehog');
    expect(received.adventure?.foods.map((f) => f.product)).toEqual(['salad-sandwich']);
    expect(received.items).toHaveLength(0);
    expect(validateState(received)).toBe(true);
  });
  it.each([
    ['rabbit', 0, 'sandwich'],
    ['hedgehog', 1, 'salad-sandwich'],
  ] as const)('keeps accepted orders stable after %s is served first', (branch, index, product) => {
    const s = start();
    const requests = s.orders.map((o) => o.request);
    const next = deliver(s, index, product);
    expect(next.adventure?.branch).toBe(branch);
    expect(next.orders.map((o) => o.request)).toEqual(requests);
  });
  it('rabbit path needs real two-part packing, then merges with the same picnic reward', () => {
    let s = deliver(start(), 0, 'sandwich');
    expect(act(s, 'pack', { tray: 0 }).kind).toBe('blocked');
    s = act(s, 'explore', { object: 'basket' }).state;
    s = make(s, 'apple');
    expect(act(s, 'pack', { tray: 0 }).kind).toBe('incomplete');
    s = make(s, 'salad-sandwich');
    const packed = act(s, 'pack', { tray: 0 });
    expect(packed.kind).toBe('ok');
    s = wait(packed.state);
    expect(s.adventure?.foods.filter((f) => f.place === 'basket').map((f) => f.product)).toEqual([
      'apple',
      'salad-sandwich',
    ]);
    s = deliver(s, 1, 'salad-sandwich');
    s = act(s, 'unpack').state;
    s = act(s, 'cloth', { value: 'leaf' }).state;
    s = act(s, 'finish').state;
    expect(s.adventure?.rewards).toEqual(['picnic-page']);
    expect(s.items).toHaveLength(0);
    expect(validateState(s)).toBe(true);
  });
  it('hedgehog path needs two distinct seats and cannot recycle delivered food', () => {
    let s = deliver(start(), 1, 'salad-sandwich');
    s = act(s, 'explore', { object: 'drawer' }).state;
    const first = s.adventure?.foods[0];
    if (!first) throw Error('food');
    s = act(s, 'place', { item: first.id, seat: 0 }).state;
    expect(act(s, 'finish').kind).toBe('blocked');
    s = deliver(s, 0, 'sandwich');
    const second = s.adventure?.foods[1];
    if (!second) throw Error('food');
    expect(act(s, 'place', { item: second.id, seat: 0 }).kind).toBe('blocked');
    s = act(s, 'place', { item: second.id, seat: 1 }).state;
    s = act(s, 'cloth', { value: 'sun' }).state;
    s = act(s, 'finish').state;
    expect(s.adventure?.rewards).toEqual(['picnic-page']);
    expect(
      cmd(s, { type: 'move', source: { item: first.id }, destination: { tray: 0 } }).kind,
    ).toBe('blocked');
  });
  it('accepts declared ice alternatives but rejects extra food and records no language attempt', () => {
    let s = start(1);
    s = make(s, 'strawberry-cup');
    const prior = s.attempts.length;
    const r = act(s, 'cool', { tray: 0 });
    expect(r.kind).toBe('ok');
    s = wait(r.state);
    expect(s.adventure?.foods[0]?.product).toBe('strawberry-cup');
    expect(s.attempts).toHaveLength(prior);
    expect(act(s, 'cool', { tray: 0 }).kind).toBe('blocked');
  });
  it('free works keep actual composition, placement and tasting without copying food', () => {
    let s = start(4);
    s = act(s, 'invite', { visitor: 'rabbit' }).state;
    s = act(s, 'invite', { visitor: 'hedgehog' }).state;
    s = make(s, 'banana');
    s = make(s, 'juice');
    s = wait(act(s, 'create', { tray: 0 }).state);
    const ids = s.adventure?.foods.map((f) => f.id) ?? [];
    s = act(s, 'place', { item: ids[0], seat: 2 }).state;
    s = act(s, 'taste', { item: ids[0] }).state;
    s = act(s, 'save-work').state;
    s = act(s, 'save-work').state;
    expect(s.adventure?.works).toHaveLength(1);
    expect(s.adventure?.works[0]?.foods.map((f) => [f.product, f.place, f.tasted])).toEqual([
      ['banana', 'table:2', true],
      ['juice', 'work', false],
    ]);
    expect(s.items).toHaveLength(0);
    expect(s.attempts).toHaveLength(0);
    expect(validateState(s)).toBe(true);
  });
  it('roundtrips mid-delivery and never awards twice', () => {
    let s = start();
    s = make(s, 'sandwich');
    s = cmd(s, { type: 'deliver', tray: 0, order: 'guest-0' }).state;
    const loaded = decodeSnapshot(JSON.stringify(s));
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    s = wait(loaded.state);
    const again = decodeSnapshot(JSON.stringify(s));
    if (!again.ok) throw Error(again.reason);
    expect(wait(again.state).adventure?.foods).toEqual(s.adventure?.foods);
    expect(validateState(s)).toBe(true);
  });
  it('strict delivery receipts stay recoverable through each receive and return phase', () => {
    let s = make(start(), 'sandwich');
    s = cmd(s, { type: 'deliver', tray: 0, order: 'guest-0' }).state;
    while (s.actor.current) {
      const saved = decodeSnapshot(JSON.stringify(s));
      expect(saved.ok, `elapsed ${s.actor.current.elapsed}`).toBe(true);
      if (!saved.ok) throw Error(saved.reason);
      s = advance(saved.state, 100);
    }
    expect(s.adventure?.foods).toHaveLength(1);
    expect(s.adventure?.branch).toBe('rabbit');
  });
  it('can recover every phase of an open commission, including the received food', () => {
    let s = make(start(1), 'strawberry-cup');
    s = act(s, 'cool', { tray: 0 }).state;
    while (s.actor.current) {
      expect(validateState(s), `delivery elapsed ${s.actor.current.elapsed}`).toBe(true);
      const saved = decodeSnapshot(JSON.stringify(s));
      expect(saved.ok).toBe(true);
      if (!saved.ok) throw Error(saved.reason);
      s = advance(saved.state, 100);
    }
    expect(s.adventure?.steps).toContain('cool');
    expect(s.adventure?.foods).toHaveLength(1);
    expect(s.items).toHaveLength(0);
  });
  it('migrates the old schema6 world without inventing adventure completion', () => {
    const old = JSON.parse(JSON.stringify(createGame('old')));
    old.schemaVersion = 6;
    old.contentVersion = 'm2.3-story-1';
    delete old.adventure;
    const r = decodeSnapshot(JSON.stringify(old));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.adventure).toBeNull();
    expect(r.state.schemaVersion).toBe(7);
    expect(r.state.orders.map((o) => o.request)).toEqual(['juice', 'fruit']);
  });
  it('rejects duplicate world ownership and forged activity receipts', () => {
    const s = deliver(start(), 0, 'sandwich');
    const duplicate = structuredClone(s);
    const f = duplicate.adventure?.foods[0];
    if (!f) throw Error('food');
    duplicate.items.push({ id: f.id, product: f.product, location: 'tray:0:0' });
    expect(validateState(duplicate)).toBe(false);
    const forged = structuredClone(s);
    if (forged.adventure) forged.adventure.rewards = ['picnic-page'];
    expect(validateState(forged)).toBe(false);
  });
  it('rejects missing visitor identity and receipts from unreceived orders', () => {
    const s = start(0);
    const missing = structuredClone(s);
    if (missing.orders[0]) delete missing.orders[0].visitor;
    expect(validateState(missing)).toBe(false);
    const forged = structuredClone(s);
    if (forged.adventure) {
      forged.adventure.steps = ['served:rabbit', 'served:hedgehog', 'plant'];
      forged.adventure.explored = ['drawer'];
      forged.adventure.rewards = ['flower-page'];
    }
    expect(validateState(forged)).toBe(false);
  });
});

it('moving one food through two seats does not satisfy a two-friend table', () => {
  let s = deliver(start(), 1, 'salad-sandwich');
  s = deliver(s, 0, 'sandwich');
  s = act(s, 'explore', { object: 'drawer' }).state;
  const id = s.adventure?.foods[0]?.id;
  if (!id) throw Error('food');
  s = act(s, 'place', { item: id, seat: 0 }).state;
  s = act(s, 'place', { item: id, seat: 1 }).state;
  s = act(s, 'cloth', { value: 'leaf' }).state;
  expect(act(s, 'finish').kind).toBe('blocked');
});
it('a second creation saves its own three portions rather than merging every past dish', () => {
  let s = start(4);
  s = make(s, 'banana');
  s = wait(act(s, 'create', { tray: 0 }).state);
  s = act(s, 'save-work').state;
  s = make(s, 'apple');
  s = wait(act(s, 'create', { tray: 0 }).state);
  s = act(s, 'save-work').state;
  expect(s.adventure?.works.map((w) => w.foods.map((f) => f.product))).toEqual([
    ['banana'],
    ['apple'],
  ]);
});
