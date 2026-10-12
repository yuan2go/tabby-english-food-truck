import { describe, expect, it } from 'vitest';
import { adventureReady } from '../src/rules/adventure';
import { advance, createGame, dispatch } from '../src/rules/game';
import { decodeSnapshot, validateState } from '../src/rules/snapshot';
import type { Command, GameState, Location } from '../src/rules/types';

let serial = 0;
const command = (s: GameState, c: unknown) =>
  dispatch(s, { runId: s.runId, id: `together-${++serial}`, command: c as Command });
const held = (s: GameState) => s.items.filter(i => i.location.startsWith('hand:'));
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
    expect(held(r.state).map(i => i.product)).toEqual(['apple']);
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
    expect(held(s).map(i => i.product)).toEqual(['apple', 'banana', 'apple']);
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
    expect(held(s).map(i => i.product)).toEqual(['cup']);
    s = put(s, { machine: 'cup' }).state;
    s = command(s, { type: 'start-machine' }).state;
    expect(s.machine.status).toBe('processing');
    expect(s.items.map(i => i.product)).toEqual(['apple', 'cup']);
    s = advance(s, 4999);
    expect(s.machine.status).toBe('processing');
    s = advance(s, 1);
    expect(s.machine.status).toBe('ready');
    const id = s.items.find(i => i.product === 'juice')?.id;
    const r = command(s, { type: 'pickup', source: { item: id } });
    expect(r.kind).toBe('ok');
    expect(held(r.state).map(i => i.product)).toEqual(['juice']);
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
    expect(s.items.map(i => i.product)).toEqual(['vanilla-cone']);
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
    expect(received.adventure?.foods.map(i => i.product)).toEqual(['apple']);
    expect(received.items.map(i => i.product)).toEqual(['banana']);
    expect(validateState(received)).toBe(true);
  });
});

describe('breakfast ending and this repository save migration', () => {
  it('received breakfasts can finish without forcing planting or watering', () => {
    let s = breakfast();
    for (const [visitor, supply, order] of [
      ['rabbit', 'apple', 'guest-0'], ['hedgehog', 'banana', 'guest-1'],
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
    const saved = command(s, { type: 'move', source: { supply: 'banana' }, destination: { tray: 0 } }).state;
    const decoded = decodeSnapshot(JSON.stringify({ ...saved, contentVersion: 'adventure-experience-2' }));
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
    const s = command(breakfast(), { type: 'move', source: { supply: 'apple' }, destination: { tray: 0 } }).state;
    const invalid = structuredClone(s);
    if (!invalid.items[0]) throw Error('hand item must exist');
    invalid.items[0].location = 'hand:3' as Location;
    expect(decodeSnapshot(JSON.stringify(invalid)).ok).toBe(false);
  });
  it('rejects a save that invents capacity beyond the original hands and preparation spaces', () => {
    const s = breakfast();
    s.items = ['hand:0','hand:1','hand:2','tray:0:0','tray:0:1','tray:0:2','tray:1:0'].map((location,i)=>({id:`food-${i+1}`,product:'apple',location:location as Location}));
    s.nextId = 8;
    expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(false);
  });
  it('refuses malformed hand delivery metadata rather than trusting a forged ownership flag', () => {
    let s = breakfast();
    s = command(s, { type: 'adventure', action: 'welcome', visitor: 'rabbit' }).state;
    s = pickup(s, 'apple').state;
    s = put(s, { order: 'guest-0' }).state;
    expect(decodeSnapshot(JSON.stringify(s).replace('"fromHand":true','"fromHand":"yes"')).ok).toBe(false);
  });
});
