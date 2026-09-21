import { expect, it } from 'vitest';
import { advance, createGame, dispatch, freeSlots } from '../src/rules/game';
import { decodeSnapshot, validateState } from '../src/rules/snapshot';
import type { Command, GameState } from '../src/rules/types';

const command = (s: GameState, c: Command) =>
  dispatch(s, { id: `test-${s.revision}`, runId: s.runId, command: c });
it('reserves the chosen tray; survives refresh, switching, full remaining slots and completes exactly once', () => {
  let s = createGame('routing');
  for (const c of [
    { type: 'prepare-cup' },
    { type: 'move', source: { supply: 'apple' }, destination: { machine: 'apple' } },
    { type: 'start-machine', tray: 1 },
  ] as Command[])
    s = command(s, c).state;
  expect(s.routing.machine).toEqual({ tray: 1, slot: 0 });
  expect(freeSlots(s, 1)).toEqual([1, 2]);
  for (let n = 0; n < 2; n++)
    s = command(s, { type: 'move', source: { supply: 'banana' }, destination: { tray: 1 } }).state;
  const blocked = command(s, {
    type: 'move',
    source: { supply: 'apple' },
    destination: { tray: 1 },
  });
  expect(blocked.kind).toBe('blocked');
  s = blocked.state;
  expect(validateState(s)).toBe(true);
  const decoded = decodeSnapshot(JSON.stringify(s));
  expect(decoded.ok).toBe(true);
  if (!decoded.ok) throw Error(decoded.reason);
  s = advance(decoded.state, 5000);
  expect(s.items.map((i) => [i.product, i.location])).toEqual([
    ['juice', 'tray:1:0'],
    ['banana', 'tray:1:1'],
    ['banana', 'tray:1:2'],
  ]);
  expect(s.routing.machine).toBeNull();
  expect(validateState(s)).toBe(true);
  expect(advance(s, 5000).items).toHaveLength(3);
});
it('full destination blocks start without consuming inputs and cannot submit a reserved plate', () => {
  let s = createGame('full');
  for (let n = 0; n < 3; n++)
    s = command(s, { type: 'move', source: { supply: 'apple' }, destination: { tray: 0 } }).state;
  s = command(s, { type: 'prepare-cup' }).state;
  s = command(s, {
    type: 'move',
    source: { supply: 'apple' },
    destination: { machine: 'apple' },
  }).state;
  expect(command(s, { type: 'start-machine', tray: 0 }).kind).toBe('blocked');
  expect(s.items).toHaveLength(5);
  s = command(s, { type: 'start-machine', tray: 1 }).state;
  expect(command(s, { type: 'deliver', tray: 1, order: 'guest-0' }).kind).toBe('blocked');
  const corrupt = structuredClone(s);
  corrupt.items.push({ id: 'food-99', product: 'apple', location: 'tray:1:0' });
  expect(validateState(corrupt)).toBe(false);
});
it('schema4 in-flight jobs retain their exit and original food identities, without invented routing', () => {
  let s = createGame('old');
  s = command(s, { type: 'prepare-cup' }).state;
  s = command(s, {
    type: 'move',
    source: { supply: 'apple' },
    destination: { machine: 'apple' },
  }).state;
  s = command(s, { type: 'start-machine' }).state;
  const old: Record<string, unknown> = { ...s, schemaVersion: 4, contentVersion: 'm2.1' };
  delete old.routing;
  const decoded = decodeSnapshot(JSON.stringify(old));
  expect(decoded.ok).toBe(true);
  if (!decoded.ok) throw Error(decoded.reason);
  expect(decoded.state.routing.machine).toBeNull();
  expect(advance(decoded.state, 5000).items[0]?.location).toBe('machine:cup');
});
