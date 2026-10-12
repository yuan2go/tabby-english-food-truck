import { describe, expect, it } from 'vitest';
import { type Product, RECIPES } from '../src/content/recipes';
import { activityObstacle } from '../src/rules/adventure-guidance';
import { advance, createGame, dispatch, trayItems } from '../src/rules/game';
import { decodeSnapshot, validateState } from '../src/rules/snapshot';
import type { Command, GameState } from '../src/rules/types';

// Catch premature branching, relaxed strict matching, duplicated food and rewards.
let serial = 0;
const cmd = (s: GameState, command: Command) =>
  dispatch(s, { id: `t-${++serial}`, runId: s.runId, command });
const start = (chapter = 2) => {
  const initial = createGame('adventure', 0, {}, 'practice');
  initial.session.concurrency = 2;
  const r = cmd(initial, {
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
    s = act(s, 'take-tool', { object: 'seed' }).state;
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
    const frozen = structuredClone(s);
    if (!ids[0] || !ids[2]) throw Error('placed foods');
    const blocked = { action: 'place', item: ids[0], seat: 2 } as const;
    expect(act(s, blocked.action, blocked).kind).toBe('blocked');
    expect(activityObstacle(s, blocked)).toMatchObject({
      id: 'occupied',
      products: ['apple'],
      select: ids[2],
      target: 'pickup',
    });
    expect(s).toEqual(frozen);
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
    const received = s.adventure?.foods[0];
    if (!received) throw Error('received sandwich');
    const blockedPlace = { action: 'place', item: received.id, seat: 0 } as const;
    expect(act(s, 'place', blockedPlace).kind).toBe('blocked');
    expect(activityObstacle(s, blockedPlace)).toMatchObject({ id: 'basket', target: 'basket' });
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
    expect(s.adventure?.experience?.picnic).toBe('rabbit');
    s = act(s, 'invite', { visitor: 'rabbit' }).state;
    expect(s.adventure?.experience?.needs.find((n) => n.visitor === 'rabbit')).toMatchObject({
      kind: 'savory',
      basis: 'packing',
    });
    expect(s.items).toHaveLength(0);
    expect(validateState(s)).toBe(true);
  });
  it('hedgehog path needs two distinct seats and cannot recycle delivered food', () => {
    let s = deliver(start(), 1, 'salad-sandwich');
    s = act(s, 'explore', { object: 'drawer' }).state;
    s = act(s, 'take-tool', { object: 'mat' }).state;
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
  it.each(['m2.3-story-1', 'm2.4-adventure-1'])(
    'migrates schema6 %s without inventing adventure completion',
    (version) => {
      const old = JSON.parse(JSON.stringify(createGame('old')));
      old.schemaVersion = 6;
      old.contentVersion = version;
      delete old.adventure;
      const r = decodeSnapshot(JSON.stringify(old));
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(r.state.adventure).toBeNull();
      expect(r.state.schemaVersion).toBe(7);
      expect(r.state.orders.map((o) => o.request)).toEqual(['juice', 'fruit']);
    },
  );
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
  s = act(s, 'take-tool', { object: 'mat' }).state;
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

it('new breakfast uses actual drawer tools and watering without duplicating food', () => {
  let s = deliver(start(0), 0, 'apple');
  s = deliver(s, 1, 'banana');
  s = act(s, 'explore', { object: 'drawer' }).state;
  expect(act(s, 'plant', { seat: 1 }).kind).toBe('blocked');
  s = act(s, 'take-tool', { object: 'seed' }).state;
  s = act(s, 'plant', { seat: 1 }).state;
  expect(act(s, 'finish').kind).toBe('ok'); // Breakfast can end before optional watering.
  expect(act(s, 'water').kind).toBe('blocked');
  s = act(s, 'take-tool', { object: 'watering-can' }).state;
  const ids = s.adventure?.foods.map((f) => f.id);
  s = act(s, 'water').state;
  expect(act(s, 'water').kind).toBe('duplicate');
  expect(act(s, 'finish').kind).toBe('ok');
  expect(s.adventure?.foods.map((f) => f.id)).toEqual(ids);
  expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
});
it('friend sharing validates an open need and keeps wrong food and repeated tasting stable', () => {
  let s = start(4);
  s = act(s, 'invite', { visitor: 'rabbit' }).state;
  s = make(s, 'banana');
  s = make(s, 'juice');
  s = wait(act(s, 'create', { tray: 0 }).state);
  const banana = s.adventure?.foods.find((f) => f.product === 'banana');
  const juice = s.adventure?.foods.find((f) => f.product === 'juice');
  if (!banana || !juice) throw Error('real food');
  const before = structuredClone(s.adventure?.foods);
  expect(act(s, 'share', { item: juice.id, visitor: 'rabbit' }).kind).toBe('blocked');
  expect(s.adventure?.foods).toEqual(before);
  expect(activityObstacle(s, { action: 'share', item: juice.id, visitor: 'rabbit' })).toMatchObject(
    { id: 'choice', products: ['apple', 'banana'], audio: 'imm-sharing-fruit' },
  );
  s = act(s, 'share', { item: banana.id, visitor: 'rabbit' }).state;
  expect(s.adventure?.foods.find((f) => f.id === banana.id)?.place).toBe('table:0');
  expect(act(s, 'share', { item: banana.id, visitor: 'rabbit' }).kind).toBe('duplicate');
  s = act(s, 'taste', { item: banana.id, visitor: 'rabbit' }).state;
  const tasted = structuredClone(s.adventure);
  expect(act(s, 'taste', { item: banana.id, visitor: 'rabbit' }).kind).toBe('duplicate');
  expect(s.adventure).toEqual(tasted);
  expect(s.attempts).toHaveLength(0);
  expect(s.items).toHaveLength(0);
  expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
});
it('an earlier incomplete adventure gains no new tool or use fact on migration', () => {
  const s = deliver(start(0), 0, 'apple');
  const old = JSON.parse(JSON.stringify(s));
  old.contentVersion = 'playable-adventure-1';
  delete old.adventure.experience;
  const recovered = decodeSnapshot(JSON.stringify(old));
  expect(recovered.ok).toBe(true);
  if (!recovered.ok) return;
  expect(recovered.state.adventure?.experience?.tools).toEqual([]);
  expect(recovered.state.adventure?.experience?.used).toEqual([]);
  expect(recovered.state.adventure?.rewards).toEqual([]);
  expect(recovered.state.adventure?.foods).toEqual(old.adventure.foods);
});
it('sweet comparisons require two genuinely different creations and survive interruption', () => {
  let s = start(1);
  expect(act(s, 'compare').kind).toBe('blocked');
  s = deliver(s, 0, 'vanilla-cone');
  expect(act(s, 'compare').kind).toBe('blocked');
  s = make(s, 'vanilla-cup');
  s = wait(act(s, 'cool', { tray: 0 }).state);
  s = act(s, 'compare').state;
  expect(s.adventure?.experience?.used).toContain('compare');
  expect(act(s, 'compare').kind).toBe('duplicate');
  const restored = decodeSnapshot(JSON.stringify(s));
  expect(restored.ok).toBe(true);
  if (!restored.ok) return;
  expect(restored.state.adventure?.foods).toEqual(s.adventure?.foods);
});
it('cooperation carries a real found tool without changing cooking, orders or food', () => {
  let s = deliver(start(3), 0, 'cheese-burger');
  expect(act(s, 'cooperate', { visitor: 'rabbit', object: 'lantern' }).kind).toBe('blocked');
  s = act(s, 'explore', { object: 'drawer' }).state;
  s = act(s, 'take-tool', { object: 'lantern' }).state;
  const before = structuredClone(s);
  s = act(s, 'cooperate', { visitor: 'rabbit', object: 'lantern' }).state;
  expect(s.adventure?.experience?.helpers).toEqual([{ visitor: 'rabbit', role: 'lantern' }]);
  expect(s.items).toEqual(before.items);
  expect(s.orders).toEqual(before.orders);
  expect(s.adventure?.foods).toEqual(before.adventure?.foods);
  expect(act(s, 'cooperate', { visitor: 'rabbit', object: 'cups' }).kind).toBe('duplicate');
});
it('invalid tasting identity cannot corrupt a recoverable portion', () => {
  let s = start(4);
  s = make(s, 'banana');
  s = wait(act(s, 'create', { tray: 0 }).state);
  const id = s.adventure?.foods[0]?.id;
  if (!id) throw Error('food');
  const before = structuredClone(s.adventure);
  const result = act(s, 'taste', { item: id, visitor: 'unknown' });
  expect(result.kind).toBe('blocked');
  expect(result.state.adventure).toEqual(before);
  expect(decodeSnapshot(JSON.stringify(result.state)).ok).toBe(true);
});
it('unfinished free creation can put away experiments without losing service food or recipes', () => {
  let s = start(4);
  s = act(s, 'invite', { visitor: 'rabbit' }).state;
  for (let batch = 0; batch < 4; batch++) {
    for (let n = 0; n < 3; n++) s = make(s, 'juice');
    s = wait(act(s, 'create', { tray: 0 }).state);
  }
  expect(s.adventure?.foods).toHaveLength(12);
  s = act(s, 'save-work').state;
  const works = structuredClone(s.adventure?.works);
  expect(act(s, 'clear-table').kind).toBe('confirm');
  s = act(s, 'clear-table', { confirmed: true }).state;
  expect(s.adventure?.foods).toHaveLength(0);
  expect(s.adventure?.works).toEqual(works);
  expect(act(s, 'finish').kind).toBe('blocked');
  s = make(s, 'banana');
  s = wait(act(s, 'create', { tray: 0 }).state);
  expect(s.adventure?.foods).toHaveLength(1);
  expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
});
it('a shared-meal receipt retains each actual eater and food location', () => {
  let s = deliver(start(0), 0, 'apple');
  s = deliver(s, 1, 'banana');
  s = act(s, 'explore', { object: 'drawer' }).state;
  s = act(s, 'take-tool', { object: 'seed' }).state;
  s = act(s, 'plant', { seat: 0 }).state;
  s = act(s, 'take-tool', { object: 'watering-can' }).state;
  s = act(s, 'water').state;
  s = act(s, 'finish').state;
  expect(s.adventure?.experience?.moments.at(-1)?.foods.map((f) => [f.product, f.visitor])).toEqual(
    [
      ['apple', 'rabbit'],
      ['banana', 'hedgehog'],
    ],
  );
  expect(s.adventure?.foods.map((f) => f.tastedBy)).toEqual(['rabbit', 'hedgehog']);
});

it('hanging shade flags moves both actual desserts once and recolouring preserves their seats', () => {
  let s = deliver(start(1), 0, 'vanilla-cone');
  s = make(s, 'strawberry-cup');
  s = wait(act(s, 'cool', { tray: 0 }).state);
  s = act(s, 'explore', { object: 'recipe' }).state;
  s = act(s, 'taste', { item: s.adventure?.foods[1]?.id }).state;
  const ids = s.adventure?.foods.map((f) => f.id);
  s = act(s, 'bunting', { value: 'cool' }).state;
  expect(s.adventure?.foods.map((f) => f.place)).toEqual(['table:0', 'table:1']);
  const moved = structuredClone(s.adventure?.foods);
  s = act(s, 'bunting', { value: 'warm' }).state;
  expect(s.adventure?.foods).toEqual(moved);
  expect(s.adventure?.foods.map((f) => f.id)).toEqual(ids);
  expect(s.items).toEqual([]);
  expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
});

it('a completed feast survives clearing and old-version migration without inventing new activity facts', () => {
  let s = start(4);
  s = act(s, 'invite', { visitor: 'rabbit' }).state;
  s = act(s, 'invite', { visitor: 'hedgehog' }).state;
  s = make(s, 'banana');
  s = wait(act(s, 'create', { tray: 0 }).state);
  const id = s.adventure?.foods[0]?.id;
  s = act(s, 'share', { visitor: 'rabbit', item: id }).state;
  s = act(s, 'taste', { item: id }).state;
  s = act(s, 'save-work').state;
  s = act(s, 'finish').state;
  expect(s.adventure?.rewards).toEqual(['feast-page']);
  s = act(s, 'clear-table', { confirmed: true }).state;
  expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
  const old = JSON.parse(JSON.stringify(s));
  old.contentVersion = 'playable-adventure-1';
  delete old.adventure.experience;
  const restored = decodeSnapshot(JSON.stringify(old));
  expect(restored.ok).toBe(true);
  if (!restored.ok) return;
  expect(restored.state.adventure?.rewards).toEqual(['feast-page']);
  expect(restored.state.adventure?.foods).toEqual([]);
  expect(restored.state.adventure?.experience?.used).toEqual([]);
});

it('an already tasted portion cannot fulfil a fresh sharing need', () => {
  let s = act(start(4), 'invite', { visitor: 'rabbit' }).state;
  s = make(s, 'banana');
  s = wait(act(s, 'create', { tray: 0 }).state);
  const id = s.adventure?.foods[0]?.id;
  s = act(s, 'taste', { item: id }).state;
  const foods = structuredClone(s.adventure?.foods);
  expect(act(s, 'share', { item: id, visitor: 'rabbit' }).kind).toBe('blocked');
  expect(s.adventure?.foods).toEqual(foods);
  expect(s.adventure?.experience?.needs[0]?.fulfilled).toEqual([]);
});

it('same-session return needs remember desserts actually received, even after putting the food away', () => {
  let s = deliver(start(1), 0, 'vanilla-cone');
  s = make(s, 'strawberry-cup');
  s = wait(act(s, 'cool', { tray: 0 }).state);
  s = act(s, 'explore', { object: 'recipe' }).state;
  s = act(s, 'compare').state;
  s = act(s, 'taste', { item: s.adventure?.foods[1]?.id }).state;
  s = act(s, 'bunting', { value: 'cool' }).state;
  s = act(s, 'finish').state;
  s = act(s, 'clear-table', { confirmed: true }).state;
  s = act(s, 'invite', { visitor: 'hedgehog' }).state;
  expect(s.adventure?.experience?.needs[0]).toMatchObject({
    visitor: 'hedgehog',
    kind: 'cool',
    basis: 'treat',
  });
  expect(s.adventure?.experience?.known).toEqual(['vanilla-cone', 'strawberry-cup']);
});

it('clearing a free shop releases the consumed sharing slot for a genuinely new portion', () => {
  const initial = createGame('free-share');
  initial.session.concurrency = 1;
  let s = cmd(initial, { type: 'adventure-start', chapter: 0, kind: 'shop' } as Command).state;
  s = act(s, 'invite', { visitor: 'rabbit' }).state;
  s = make(s, 'apple');
  s = wait(act(s, 'create', { tray: 0 }).state);
  s = act(s, 'share', { item: s.adventure?.foods[0]?.id, visitor: 'rabbit' }).state;
  s = act(s, 'taste', { item: s.adventure?.foods[0]?.id }).state;
  s = act(s, 'save-work').state;
  const oldId = s.adventure?.foods[0]?.id;
  s = act(s, 'clear-table', { confirmed: true }).state;
  s = make(s, 'banana');
  s = wait(act(s, 'create', { tray: 0 }).state);
  const newId = s.adventure?.foods[0]?.id;
  expect(newId).not.toBe(oldId);
  const again = act(s, 'share', { item: newId, visitor: 'rabbit' });
  expect(again.kind).toBe('ok');
  expect(again.state.adventure?.experience?.needs[0]?.fulfilled).toEqual([newId]);
  expect(again.state.adventure?.works).toHaveLength(1);
  expect(again.state.items).toEqual([]);
});
