import { expect, it } from 'vitest';
import { advance, createGame, dispatch } from '../src/rules/game';
import { eligibleWord } from '../src/rules/minigames';
import { configureSession } from '../src/rules/sessions';
import { decodeSnapshot, validateState } from '../src/rules/snapshot';
import type { Command, GameState } from '../src/rules/types';

let serial = 0;
const send = (state: GameState, command: Command) =>
  dispatch(state, { runId: state.runId, id: `closure-${++serial}`, command });

it('two later-story guests choose separate plates while juice and ice run in parallel', () => {
  let state = configureSession(
    createGame('later-story'),
    'story',
    4,
    'pictures',
    ['juice', 'ice', 'sandwich', 'burger'],
    19,
    2,
  );
  expect(state.mode).toBe('service');
  expect(
    state.orders.filter((order) => order.status === 'waiting').map((order) => order.request),
  ).toEqual(['juice', 'vanilla-cone']);
  state = send(state, { type: 'prepare-cup' }).state;
  state = send(state, {
    type: 'move',
    source: { supply: 'apple' },
    destination: { machine: 'apple' },
  }).state;
  state = send(state, { type: 'start-machine', tray: 0 }).state;
  state = send(state, { type: 'family', family: 'ice' }).state;
  state = send(state, {
    type: 'move',
    source: { supply: 'cone' },
    destination: { station: 'ice' },
  }).state;
  state = send(state, {
    type: 'move',
    source: { supply: 'vanilla' },
    destination: { station: 'ice' },
  }).state;
  state = send(state, { type: 'start-station', station: 'ice', tray: 1 }).state;
  expect(state.routing.machine).toEqual({ tray: 0, slot: 0 });
  expect(state.routing.ice).toEqual({ tray: 1, slot: 0 });
  const restored = decodeSnapshot(JSON.stringify(state));
  expect(restored.ok).toBe(true);
  if (!restored.ok) return;
  state = advance(restored.state, 5000);
  expect(state.items.map((item) => [item.product, item.location]).sort()).toEqual(
    [
      ['juice', 'tray:0:0'],
      ['vanilla-cone', 'tray:1:0'],
    ].sort(),
  );
  const wrong = send(state, { type: 'deliver', tray: 0, order: 'guest-1' });
  expect(wrong.kind).toBe('mismatch');
  expect(wrong.state.items).toEqual(state.items);
  state = send(wrong.state, { type: 'deliver', tray: 1, order: 'guest-1' }).state;
  state = send(state, { type: 'deliver', tray: 0, order: 'guest-0' }).state;
  expect(state.orders.slice(0, 2).every((order) => order.status === 'leaving')).toBe(true);
  state = advance(state, 20000);
  expect(state.orders.slice(0, 2).every((order) => order.status === 'done')).toBe(true);
  expect(state.items).toHaveLength(0);
  expect(state.orders.filter((order) => order.status === 'waiting')).toHaveLength(2);
  expect(validateState(state)).toBe(true);
});

it('request playback start and failure cannot become listening evidence', () => {
  let state = createGame('playback-fact', 0, {}, 'guided');
  for (const status of ['started', 'failed', 'interrupted', 'muted', 'skipped'] as const)
    state = send(state, {
      type: 'audio',
      audio: { id: 'request-apple', version: 'dev', status },
    }).state;
  expect(state.orders[0]?.heard).toBe(false);
  expect(state.orders[0]?.support).toContain('audio-unavailable');
  expect(state.orders[0]?.support).toContain('muted-visual');
  expect(state.orders[0]?.support).toContain('skipped-visual');
  expect(decodeSnapshot(JSON.stringify(state)).ok).toBe(true);
  state = send(state, {
    type: 'audio',
    audio: { id: 'request-apple', version: 'dev', status: 'completed' },
  }).state;
  expect(state.orders[0]?.heard).toBe(true);
  expect(state.orders[0]?.support).toContain('audio-unavailable');
});

it('phrase focus is eligible only after the phrase foundation is selected', () => {
  expect(eligibleWord('ice-cream', 'spell', 'partial', 'new')).toBe(false);
  expect(eligibleWord('ice-cream', 'spell', 'partial', 'phrases')).toBe(true);
  expect(eligibleWord('ice-cream', 'match', 'demo', 'new')).toBe(true);
});
