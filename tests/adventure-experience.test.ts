import { afterEach, expect, it, vi } from 'vitest';
import { GameController } from '../src/platform/controller';
import { SaveStore } from '../src/platform/save';
import { advance, createGame, dispatch } from '../src/rules/game';
import { decodeSnapshot } from '../src/rules/snapshot';
import type { Command, GameState } from '../src/rules/types';

// Regression targets: controller discarding concurrency, hard-coded dual entry,
// fixed auto-queue determining the picnic branch and policy destroying accepted jobs.
let serial = 0;
const command = (s: GameState, command: Command) =>
  dispatch(s, { id: `experience-${++serial}`, runId: s.runId, command });
function start(guests: 1 | 2) {
  const s = createGame('experience');
  s.session.concurrency = guests;
  return command(s, { type: 'adventure-start', chapter: 2 }).state;
}
afterEach(() => vi.unstubAllGlobals());
it('story controller passes single guest independently from less assistance', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
  vi.stubGlobal('localStorage', storage);
  const c = new GameController(new SaveStore(() => storage));
  c.enter('story', 2, 'less', false, 1);
  expect(c.state.session.concurrency).toBe(1);
  expect(c.state.orders.filter((o) => o.status === 'waiting')).toHaveLength(0);
  c.command({ type: 'adventure', action: 'welcome', visitor: 'hedgehog' });
  expect(c.state.orders.find((o) => o.visitor === 'hedgehog')?.status).toBe('waiting');
  expect(c.state.orders.find((o) => o.visitor === 'rabbit')?.status).toBe('queued');
  expect(c.state.adventure?.branch).toBeNull();
});
it('single mode never chooses a friend via elapsed time or playback', () => {
  let s = start(1);
  s = advance(s, 30000);
  expect(s.orders.every((o) => o.status === 'queued')).toBe(true);
  s = command(s, {
    type: 'audio',
    audio: { id: 'request-sandwich', status: 'completed', version: 'dev' },
  }).state;
  expect(s.adventure?.branch).toBeNull();
  s = command(s, { type: 'adventure', action: 'welcome', visitor: 'hedgehog' }).state;
  expect(command(s, { type: 'adventure', action: 'welcome', visitor: 'rabbit' }).kind).toBe(
    'blocked',
  );
  expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
});
it('dual to single retains accepted requests, food and progress; single to dual admits pending friends', () => {
  let s = start(1);
  s = command(s, { type: 'adventure', action: 'welcome', visitor: 'hedgehog' }).state;
  s = command(s, { type: 'move', source: { supply: 'banana' }, destination: { tray: 0 } }).state;
  const original = structuredClone(s);
  s = command(s, { type: 'policy', support: 'pictures', concurrency: 2 }).state;
  expect(s.orders.filter((o) => o.status === 'waiting')).toHaveLength(2);
  s = command(s, { type: 'policy', support: 'less', concurrency: 1 }).state;
  expect(s.orders.filter((o) => o.status === 'waiting')).toHaveLength(2);
  expect(s.orders.map((o) => [o.id, o.request, o.visitor])).toEqual(
    original.orders.map((o) => [o.id, o.request, o.visitor]),
  );
  expect(s.items).toEqual(original.items);
  expect(s.adventure).toEqual(original.adventure);
  expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
});
