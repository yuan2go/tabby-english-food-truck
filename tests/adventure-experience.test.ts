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
it('continuous picnic presents both real needs without choosing the first receipt or changing assistance', () => {
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
  expect(c.state.session.concurrency).toBe(2);
  expect(c.state.session.support).toBe('less');
  expect(c.state.orders.filter((o) => o.status === 'waiting')).toHaveLength(2);
  c.command({
    type: 'audio',
    audio: { id: 'request-sandwich', status: 'completed', version: 'dev' },
  });
  expect(c.state.orders.find((o) => o.visitor === 'hedgehog')?.status).toBe('waiting');
  expect(c.state.orders.find((o) => o.visitor === 'rabbit')?.status).toBe('waiting');
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

it('a queued friend admitted after picture policy changes cannot be recorded as independent', () => {
  let s = createGame('queued-help');
  s.session.support = 'less';
  s.session.concurrency = 1;
  s = command(s, { type: 'adventure-start', chapter: 0 }).state;
  s = command(s, { type: 'policy', support: 'pictures', concurrency: 1 }).state;
  s = command(s, { type: 'adventure', action: 'welcome', visitor: 'rabbit' }).state;
  expect(s.orders[0]?.support).toContain('picture-request');
  s = command(s, { type: 'move', source: { supply: 'apple' }, destination: { tray: 0 } }).state;
  s = advance(s, 30000);
  s = command(s, { type: 'deliver', tray: 0, order: 'guest-0' }).state;
  s = advance(s, 30000);
  expect(s.attempts.at(-1)?.condition).toBe('assisted');
  expect(s.attempts.at(-1)?.support).toContain('picture-request');
});
