import { expect, test } from 'vitest';
import { advance, createGame, dispatch } from '../src/rules/game';
import { decodeSnapshot } from '../src/rules/snapshot';
import type { Command, GameState } from '../src/rules/types';

let serial = 0;
const run = (s: GameState, c: unknown) =>
  dispatch(s, { id: `direct-${serial++}`, runId: s.runId, command: c as Command });
function kitchen() {
  const s = createGame('direct');
  s.session.unlocked = ['juice', 'ice', 'sandwich', 'burger'];
  return s;
}
const add = (s: GameState, product: string, station: string) =>
  run(s, { type: 'ingredient', product, target: { station } });
test('cup then flavor makes one real scoop; a legal second scoop extends it without a confirmation', () => {
  let s = kitchen();
  s = add(s, 'cup', 'ice').state;
  const cup = s.items[0]?.id;
  s = add(s, 'vanilla', 'ice').state;
  expect(s.items).toEqual([{ id: cup, product: 'vanilla-cup', location: 'station:ice:0' }]);
  expect(s.stations.ice.status).toBe('ready');
  s = add(s, 'strawberry', 'ice').state;
  expect(s.items).toEqual([{ id: cup, product: 'double-cream', location: 'station:ice:0' }]);
  expect(s.attempts).toEqual([]);
  expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
});
test('invalid extra scoop, flavor before container and occupied hand preserve actual ownership atomically', () => {
  let s = kitchen();
  const empty = s.items;
  let r = add(s, 'vanilla', 'ice');
  expect(r.kind).toBe('blocked');
  expect(r.state.items).toEqual(empty);
  s = add(s, 'cone', 'ice').state;
  s = add(s, 'vanilla', 'ice').state;
  r = add(s, 'strawberry', 'ice');
  expect(r.kind).toBe('blocked');
  expect(r.state.items).toEqual(s.items);
  expect(r.state.stations).toEqual(s.stations);
  s = run(s, { type: 'pickup', source: { supply: 'apple' } }).state;
  r = add(s, 'cup', 'ice');
  expect(r.kind).toBe('blocked');
  expect(r.state.items).toEqual(s.items);
});
test('last bread naturally closes a sandwich, malformed layers remain recoverable', () => {
  let s = kitchen();
  s = add(s, 'bread', 'board').state;
  s = add(s, 'cheese', 'board').state;
  expect(s.stations.board.status).toBe('loaded');
  s = add(s, 'bread', 'board').state;
  expect(s.items.map((i) => i.product)).toEqual(['sandwich']);
  expect(s.stations.board.status).toBe('ready');
  s = run(s, { type: 'pickup', source: { item: s.items[0]?.id } }).state;
  expect(s.items[0]?.location).toMatch(/^hand:/);
});
test('pan needs explicit heat and real clock before cooked meat can combine', () => {
  let s = kitchen();
  s = add(s, 'patty', 'grill').state;
  expect(s.stations.grill.status).toBe('loaded');
  s = advance(s, 4000);
  expect(s.items[0]?.product).toBe('patty');
  s = run(s, { type: 'start-station', station: 'grill' }).state;
  s = advance(s, 3499);
  expect(s.items[0]?.product).toBe('patty');
  s = advance(s, 1);
  expect(s.items[0]?.product).toBe('cooked-patty');
  s = run(s, {
    type: 'move',
    source: { item: s.items[0]?.id },
    destination: { station: 'board' },
  }).state;
  s = add(s, 'bun', 'board').state;
  s = add(s, 'cheese', 'board').state;
  expect(s.items.map((i) => i.product)).toEqual(['cheese-burger']);
});
test('juice still requires fruit, actual cup and a switch, with no preparation selection', () => {
  let s = kitchen();
  s = run(s, { type: 'ingredient', product: 'banana', target: { machine: 'apple' } }).state;
  s = run(s, { type: 'ingredient', product: 'cup', target: { machine: 'cup' } }).state;
  s = advance(s, 6000);
  expect(s.machine.status).toBe('loaded');
  s = run(s, { type: 'start-machine' }).state;
  s = advance(s, 5000);
  expect(s.items.map((i) => i.product)).toEqual(['banana-juice']);
});
test('the prior content snapshot keeps held food and in-flight heat without new activity receipts', () => {
  let s = kitchen();
  s = add(s, 'patty', 'grill').state;
  s = run(s, { type: 'start-station', station: 'grill' }).state;
  s = advance(s, 1000);
  const prior = { ...s, contentVersion: 'together-play-1' };
  const restored = decodeSnapshot(JSON.stringify(prior));
  expect(restored.ok).toBe(true);
  if (restored.ok) {
    expect(restored.state.items).toEqual(s.items);
    expect(restored.state.stations).toEqual(s.stations);
    expect(restored.state.attempts).toEqual(s.attempts);
  }
});
