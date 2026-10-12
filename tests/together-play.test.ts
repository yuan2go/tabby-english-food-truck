import { describe, expect, it } from 'vitest';
import { type Product, RECIPES } from '../src/content/recipes';
import { queueActor } from '../src/rules/actions';
import { adventureReady, receiveAdventure } from '../src/rules/adventure';
import { advance, createGame, dispatch } from '../src/rules/game';
import { decodeSnapshot, validateState } from '../src/rules/snapshot';
import type { Command, GameState, Location } from '../src/rules/types';

let serial = 0;
const command = (s: GameState, c: unknown) =>
  dispatch(s, { runId: s.runId, id: `together-${++serial}`, command: c as Command });
const held = (s: GameState) => s.items.filter((i) => i.location.startsWith('hand:'));
const pickup = (s: GameState, supply: string) => command(s, { type: 'pickup', source: { supply } });
const put = (s: GameState, target: unknown) => command(s, { type: 'put', target });
function breakfast() {
  const s = createGame('together', 0, {}, 'practice');
  return command(s, { type: 'adventure-start', chapter: 0 }).state;
}

describe('real hand ownership and explicit targets', () => {
  it('takes a unique real item and restores that same held item after reload', () => {
    const r = pickup(breakfast(), 'apple');
    expect(r.kind).toBe('ok');
    expect(held(r.state).map((i) => i.product)).toEqual(['apple']);
    expect(r.state.items).toHaveLength(1);
    const decoded = decodeSnapshot(JSON.stringify(r.state));
    expect(decoded.ok).toBe(true);
    if (decoded.ok) expect(held(decoded.state)).toEqual(held(r.state));
  });
  it('adds explicitly picked portions without replacing an earlier item and respects capacity', () => {
    let s = pickup(breakfast(), 'apple').state;
    const first = held(s)[0]?.id;
    s = pickup(s, 'banana').state;
    s = pickup(s, 'apple').state;
    const blocked = pickup(s, 'banana');
    expect(blocked.kind).toBe('blocked');
    expect(blocked.state.items).toEqual(s.items);
    expect(held(s).map((i) => i.product)).toEqual(['apple', 'banana', 'apple']);
    expect(held(s)[0]?.id).toBe(first);
  });
  it('putting a mixed handful into an invalid device rolls back every portion', () => {
    let s = pickup(breakfast(), 'apple').state;
    s = pickup(s, 'banana').state;
    const r = put(s, { machine: 'apple' });
    expect(r.kind).toBe('blocked');
    expect(r.state.items).toEqual(s.items);
    expect(r.state.machine).toEqual(s.machine);
    expect(r.state.attempts).toEqual(s.attempts);
  });
  it('misdelivery preserves hand items and does not welcome a waiting visitor implicitly', () => {
    let s = breakfast();
    s = command(s, { type: 'adventure', action: 'welcome', visitor: 'rabbit' }).state;
    s = pickup(s, 'banana').state;
    const r = put(s, { order: 'guest-0' });
    expect(r.kind).toBe('mismatch');
    expect(held(r.state)).toEqual(held(s));
    expect(r.state.attempts).toHaveLength(1);
    expect(r.state.attempts[0]?.result).toBe('request-mismatch');
    const queued = put(r.state, { order: 'guest-1' });
    expect(queued.kind).toBe('blocked');
    expect(queued.state.orders[1]?.status).toBe('queued');
    expect(held(queued.state)).toEqual(held(s));
  });
  it('raw portions can be directly returned and never turn that action into a language attempt', () => {
    let s = pickup(breakfast(), 'apple').state;
    s = pickup(s, 'banana').state;
    const r = command(s, { type: 'return-hand' });
    expect(r.kind).toBe('ok');
    expect(r.state.items).toEqual([]);
    expect(r.state.attempts).toEqual([]);
  });
  it('makes a real juice with separate fruit and cup targets, a clock, and an explicit pickup', () => {
    let s = pickup(breakfast(), 'apple').state;
    s = put(s, { machine: 'apple' }).state;
    s = pickup(s, 'cup').state;
    expect(held(s).map((i) => i.product)).toEqual(['cup']);
    s = put(s, { machine: 'cup' }).state;
    s = command(s, { type: 'start-machine' }).state;
    expect(s.machine.status).toBe('processing');
    expect(s.items.map((i) => i.product)).toEqual(['apple', 'cup']);
    s = advance(s, 4999);
    expect(s.machine.status).toBe('processing');
    s = advance(s, 1);
    expect(s.machine.status).toBe('ready');
    const id = s.items.find((i) => i.product === 'juice')?.id;
    const r = command(s, { type: 'pickup', source: { item: id } });
    expect(r.kind).toBe('ok');
    expect(held(r.state).map((i) => i.product)).toEqual(['juice']);
    expect(r.state.machine.status).toBe('empty');
    expect(validateState(r.state)).toBe(true);
  });
  it('the visible ice device accepts its ingredients regardless of an unrelated active family', () => {
    let s = breakfast();
    s.session.unlocked.push('ice');
    s = pickup(s, 'cone').state;
    s = put(s, { station: 'ice' }).state;
    s = pickup(s, 'vanilla').state;
    const placed = put(s, { station: 'ice' });
    expect(placed.kind).toBe('ok');
    s = command(placed.state, { type: 'start-station', station: 'ice' }).state;
    s = advance(s, 1000);
    expect(s.items.map((i) => i.product)).toEqual(['vanilla-cone']);
    expect(s.session.family).toBe('juice');
  });
  it('delivers just the held portion while preserving other food on the preparation surface', () => {
    let s = breakfast();
    s = command(s, { type: 'adventure', action: 'welcome', visitor: 'rabbit' }).state;
    s = command(s, { type: 'move', source: { supply: 'banana' }, destination: { tray: 0 } }).state;
    s = pickup(s, 'apple').state;
    const offered = put(s, { order: 'guest-0' });
    expect(offered.kind).toBe('ok');
    expect(validateState(offered.state)).toBe(true);
    const received = advance(offered.state, 30000);
    expect(received.adventure?.foods.map((i) => i.product)).toEqual(['apple']);
    expect(received.items.map((i) => i.product)).toEqual(['banana']);
    expect(validateState(received)).toBe(true);
  });
});

describe('breakfast ending and this repository save migration', () => {
  it('world food also has a persistent hand owner and cannot mix with preparation inventory', () => {
    let s = createGame('world-hand', 0, {}, 'practice');
    s = command(s, { type: 'adventure-start', chapter: 4 }).state;
    s = command(s, { type: 'move', source: { supply: 'apple' }, destination: { tray: 0 } }).state;
    s = command(s, { type: 'adventure', action: 'create', tray: 0 }).state;
    s = advance(s, 30000);
    const id = s.adventure?.foods[0]?.id;
    s = command(s, { type: 'adventure', action: 'place', item: id, seat: 0 }).state;
    const picked = command(s, { type: 'adventure', action: 'pickup', item: id });
    expect(picked.kind).toBe('ok');
    expect(picked.state.adventure?.foods[0]?.place).toBe('hand');
    expect(decodeSnapshot(JSON.stringify(picked.state)).ok).toBe(true);
    expect(pickup(picked.state, 'banana').kind).toBe('blocked');
  });
  it('a picked exploration tool is actually held and remains held on reload', () => {
    let s = breakfast();
    s = command(s, { type: 'adventure', action: 'welcome', visitor: 'rabbit' }).state;
    s = pickup(s, 'apple').state;
    s = advance(put(s, { order: 'guest-0' }).state, 30000);
    s = command(s, { type: 'adventure', action: 'explore', object: 'drawer' }).state;
    const taken = command(s, { type: 'adventure', action: 'take-tool', object: 'seed' });
    expect(taken.kind).toBe('ok');
    expect((taken.state.adventure?.experience as unknown as { heldTool?: string })?.heldTool).toBe(
      'seed',
    );
    expect(decodeSnapshot(JSON.stringify(taken.state)).ok).toBe(true);
  });
  it('received breakfasts can finish without forcing planting or watering', () => {
    let s = breakfast();
    for (const [visitor, supply, order] of [
      ['rabbit', 'apple', 'guest-0'],
      ['hedgehog', 'banana', 'guest-1'],
    ]) {
      s = command(s, { type: 'adventure', action: 'welcome', visitor }).state;
      s = pickup(s, supply ?? '').state;
      const sent = put(s, { order });
      expect(sent.kind).toBe('ok');
      s = advance(sent.state, 30000);
    }
    expect(s.adventure?.steps).not.toContain('plant');
    expect(s.adventure && adventureReady(s.adventure)).toBe(true);
    const finished = command(s, { type: 'adventure', action: 'finish' });
    expect(finished.kind).toBe('ok');
    expect(finished.state.adventure?.rewards).toEqual(['flower-page']);
    expect(validateState(finished.state)).toBe(true);
  });
  it('migration preserves old food and does not invent exploration, attempts, or rewards', () => {
    const s = breakfast();
    const saved = command(s, {
      type: 'move',
      source: { supply: 'banana' },
      destination: { tray: 0 },
    }).state;
    const decoded = decodeSnapshot(
      JSON.stringify({ ...saved, contentVersion: 'adventure-experience-2' }),
    );
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.state.items).toEqual(saved.items);
      expect(decoded.state.orders).toEqual(saved.orders);
      expect(decoded.state.adventure?.steps).toEqual([]);
      expect(decoded.state.adventure?.rewards).toEqual([]);
      expect(decoded.state.attempts).toEqual([]);
    }
  });
  it('refuses an invalid hand slot rather than losing a held item during hydration', () => {
    const s = command(breakfast(), {
      type: 'move',
      source: { supply: 'apple' },
      destination: { tray: 0 },
    }).state;
    const invalid = structuredClone(s);
    if (!invalid.items[0]) throw Error('hand item must exist');
    invalid.items[0].location = 'hand:3' as Location;
    expect(decodeSnapshot(JSON.stringify(invalid)).ok).toBe(false);
  });
  it('rejects a save that invents capacity beyond the original hands and preparation spaces', () => {
    const s = breakfast();
    s.items = ['hand:0', 'hand:1', 'hand:2', 'tray:0:0', 'tray:0:1', 'tray:0:2', 'tray:1:0'].map(
      (location, i) => ({ id: `food-${i + 1}`, product: 'apple', location: location as Location }),
    );
    s.nextId = 8;
    expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(false);
  });
  it('refuses malformed hand delivery metadata rather than trusting a forged ownership flag', () => {
    let s = breakfast();
    s = command(s, { type: 'adventure', action: 'welcome', visitor: 'rabbit' }).state;
    s = pickup(s, 'apple').state;
    s = put(s, { order: 'guest-0' }).state;
    expect(
      decodeSnapshot(JSON.stringify(s).replace('"fromHand":true', '"fromHand":"yes"')).ok,
    ).toBe(false);
  });
});

it('holds decoration without applying it, retains it on an invalid placement and can return it', () => {
  let s = breakfast();
  s = command(s, {
    type: 'adventure',
    action: 'take-decoration',
    object: 'cloth',
    value: 'leaf',
  }).state;
  expect(s.adventure?.experience?.heldDecoration).toEqual({ kind: 'cloth', value: 'leaf' });
  expect(s.adventure?.steps).not.toContain('cloth');
  const invalid = command(s, { type: 'adventure', action: 'put-decoration' });
  expect(invalid.kind).toBe('blocked');
  expect(invalid.state.adventure?.experience?.heldDecoration).toEqual({
    kind: 'cloth',
    value: 'leaf',
  });
  expect(decodeSnapshot(JSON.stringify(invalid.state)).ok).toBe(true);
  const returned = command(invalid.state, { type: 'adventure', action: 'return-decoration' });
  expect(returned.state.adventure?.experience?.heldDecoration).toBeNull();
});
it('refuses snapshots that put a preparation item and activity object in the same hand', () => {
  const s = pickup(breakfast(), 'apple').state;
  if (!s.adventure?.experience) throw Error('experience');
  s.adventure.experience.tools = ['seed'];
  s.adventure.experience.heldTool = 'seed';
  expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(false);
});
it('actual recipient receipts already count as putting food before that friend in the dinner scene', () => {
  let s = createGame('dinner-position', 0, {}, 'practice');
  s = command(s, { type: 'adventure-start', chapter: 3 }).state;
  const a = s.adventure;
  if (!a) throw Error('dinner');
  // Exercise the existing clock receiver with real identities, without a presentation callback.
  receiveAdventure(
    s,
    [{ id: 'food-500', product: 'juice', location: 'delivery:0:0' }],
    'guest-1',
    'hedgehog',
  );
  expect(s.adventure?.steps).toContain('place:1');
  expect(s.adventure?.foods[0]?.place).toBe('guest-hedgehog');
});
it('migrates only already received old dinner positions without inventing attempts or rewards', () => {
  let s = createGame('migration-dinner', 0, {}, 'practice');
  s = command(s, { type: 'adventure-start', chapter: 3 }).state;
  function prepare(state: GameState, product: Product): GameState {
    const recipe = RECIPES.find((r) => r.output === product);
    if (!recipe) throw Error(product);
    for (const input of recipe.inputs) {
      if (input === 'cooked-patty') {
        state = prepare(state, input);
        continue;
      }
      state = command(state, {
        type: 'move',
        source: { supply: input },
        destination:
          recipe.station === 'machine'
            ? { machine: input === 'cup' ? 'cup' : 'apple' }
            : { station: recipe.station },
      }).state;
    }
    const r = command(
      state,
      recipe.station === 'machine'
        ? { type: 'start-machine', tray: 0 }
        : { type: 'start-station', station: recipe.station, tray: 0 },
    );
    expect(r.kind).toBe('ok');
    return advance(r.state, 30000);
  }
  for (const [visitor, product, order] of [
    ['rabbit', 'cheese-burger', 'guest-0'],
    ['hedgehog', 'juice', 'guest-1'],
  ] as const) {
    s = command(s, { type: 'adventure', action: 'welcome', visitor }).state;
    s = prepare(s, product);
    s = advance(command(s, { type: 'deliver', tray: 0, order }).state, 30000);
  }
  expect(validateState(s)).toBe(true);
  if (!s.adventure) throw Error('adventure');
  s.adventure.steps = s.adventure.steps.filter((v) => !v.startsWith('place:'));
  const before = JSON.stringify(s.attempts),
    foods = structuredClone(s.adventure.foods);
  const decoded = decodeSnapshot(
    JSON.stringify({ ...s, contentVersion: 'adventure-experience-2' }),
  );
  expect(decoded.ok).toBe(true);
  if (decoded.ok) {
    expect(decoded.state.adventure?.steps).toEqual(expect.arrayContaining(['place:0', 'place:1']));
    expect(decoded.state.adventure?.foods).toEqual(foods);
    expect(JSON.stringify(decoded.state.attempts)).toBe(before);
    expect(decoded.state.adventure?.rewards).toEqual([]);
  }
});
it('publishes return-job completion so a waiting menu introduction can appear without another click', () => {
  const s = createGame('return-notify', 0, {}, 'practice');
  queueActor(s, 'return', 'near-return', [{ point: s.actor.point, pose: 'idle', hold: 120 }], []);
  const revision = s.revision,
    next = advance(s, 120);
  expect(next.actor.current).toBeNull();
  expect(next.revision).toBeGreaterThan(revision);
});
it('a hand delivery uses a short same-table path and settles only at its real receive phase', () => {
  let s = breakfast();
  s = command(s, { type: 'adventure', action: 'welcome', visitor: 'rabbit' }).state;
  s = pickup(s, 'apple').state;
  s = put(s, { order: 'guest-0' }).state;
  const job = s.actor.current;
  if (!job) throw Error('job');
  expect(job.fromHand).toBe(true);
  expect(job.plan.duration).toBeLessThan(3500);
  let at = 0;
  for (const phase of job.plan.phases) {
    at += phase.duration;
    if (phase.event === 'receive') break;
  }
  const before = advance(s, at - 1);
  expect(before.adventure?.foods).toHaveLength(0);
  const received = advance(before, 1);
  expect(received.adventure?.foods.map((f) => f.product)).toEqual(['apple']);
  expect(received.attempts).toHaveLength(1);
});
it('one preparation target atomically uses both existing storage spaces without asking for a tray', () => {
  let s = createGame('split-prep', 0, {}, 'service');
  for (const tray of [0, 0, 1] as const)
    s = command(s, { type: 'move', source: { supply: 'apple' }, destination: { tray } }).state;
  for (const product of ['banana', 'apple', 'banana']) s = pickup(s, product).state;
  const before = s.items.map((i) => i.id).sort(),
    r = put(s, { preparation: true });
  expect(r.kind).toBe('ok');
  expect(held(r.state)).toHaveLength(0);
  expect(r.state.items.map((i) => i.id).sort()).toEqual(before);
  expect(validateState(r.state)).toBe(true);
});
it('cancelling a note preserves queued real world delivery ownership and destination during rebase', () => {
  let s = createGame('cancel-world', 0, {}, 'service');
  s = command(s, { type: 'adventure-start', chapter: 4 }).state;
  s = command(s, { type: 'picture-request', tray: 0, fruits: ['apple'] }).state;
  s = pickup(s, 'banana').state;
  s = put(s, { world: 'create' }).state;
  expect(validateState(s)).toBe(true);
  const r = command(s, { type: 'cancel-helper' });
  expect(r.state.actor.current?.worldTarget).toBe('create');
  expect(r.state.actor.current?.fromHand).toBe(true);
  expect(decodeSnapshot(JSON.stringify(r.state)).ok).toBe(true);
  const finished = advance(r.state, 30000);
  expect(
    finished.adventure?.foods.map((f) => ({
      product: f.product,
      place: f.place,
      source: f.source.split(':')[0],
    })),
  ).toEqual([{ product: 'banana', place: 'work', source: 'create' }]);
  expect(validateState(finished)).toBe(true);
});
it('cancelling a note also preserves a queued hand order and its receiving identity', () => {
  let s = createGame('cancel-order', 0, {}, 'service');
  s = command(s, { type: 'adventure-start', chapter: 0 }).state;
  s = command(s, { type: 'picture-request', tray: 0, fruits: ['banana'] }).state;
  s = pickup(s, 'apple').state;
  s = put(s, { order: 'guest-0' }).state;
  const r = command(s, { type: 'cancel-helper' });
  expect(r.state.actor.current?.order).toBe('guest-0');
  expect(r.state.actor.current?.fromHand).toBe(true);
  expect(decodeSnapshot(JSON.stringify(r.state)).ok).toBe(true);
  const settled = advance(r.state, 30000);
  expect(settled.adventure?.foods.map((f) => ({ product: f.product, place: f.place }))).toEqual([
    { product: 'apple', place: 'guest-rabbit' },
  ]);
  expect(settled.attempts).toHaveLength(1); // picture-based help does not submit English; only actual delivery does.
  expect(validateState(settled)).toBe(true);
});
