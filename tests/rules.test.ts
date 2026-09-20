import { describe, expect, it } from 'vitest';
import { TOKENS } from '../src/content/catalog';
import { parsePhrase, parseTokens } from '../src/content/phrases';
import { GameController } from '../src/platform/controller';
import { SAVE_KEY, SaveStore } from '../src/platform/save';
import { advance, createGame, dispatch, freeSlots, trayItems } from '../src/rules/game';
import { decodeSnapshot, validateState } from '../src/rules/snapshot';
import type { Command, GameState, TrayId } from '../src/rules/types';

let sequence = 0;
const send = (s: GameState, command: Command) =>
  dispatch(s, { runId: s.runId, id: `test-${++sequence}`, command });
const put = (s: GameState, supply: 'apple' | 'banana', tray: TrayId) =>
  send(s, { type: 'move', source: { supply }, destination: { tray } }).state;
function juice(s = createGame('test')): GameState {
  s = send(s, {
    type: 'move',
    source: { supply: 'apple' },
    destination: { machine: 'apple' },
  }).state;
  s = send(s, { type: 'move', source: { supply: 'cup' }, destination: { machine: 'cup' } }).state;
  return send(s, { type: 'start-machine' }).state;
}
const tokens = (text: string) => {
  const used = new Set<string>();
  return text.split(' ').map((word) => {
    const token = TOKENS.find((t) => t.text === word && !used.has(t.id));
    if (!token) throw new Error(word);
    used.add(token.id);
    return token.id;
  });
};
function memoryStore() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
  };
}
describe('T01–T03 ownership, clocks, recipes and orders', () => {
  it('creates supply only on valid placement, capacity and command deduplication hold', () => {
    let s = createGame('r');
    const e = {
      id: 'same',
      runId: 'r',
      command: { type: 'move', source: { supply: 'banana' }, destination: { machine: 'apple' } },
    } as const;
    s = dispatch(s, e).state;
    expect(s.items).toHaveLength(0);
    for (let n = 0; n < 4; n++) s = put(s, 'apple', 0);
    expect(trayItems(s, 0)).toHaveLength(3);
    const r = send(s, { type: 'move', source: { supply: 'banana' }, destination: { tray: 1 } });
    const id = r.state.receipts.at(-1) ?? '';
    expect(dispatch(r.state, { ...e, id }).kind).toBe('duplicate');
    expect(validateState(r.state)).toBe(true);
  });
  it('consumes one apple, preserves cup id, blocks duplicate batches, no offline callback', () => {
    let s = juice();
    const cupId = s.items.find((i) => i.product === 'cup')?.id;
    expect(send(s, { type: 'start-machine' }).kind).toBe('blocked');
    s = advance(s, 4999);
    expect(s.machine.status).toBe('processing');
    s = advance(s, 1);
    expect(s.items).toEqual([{ id: cupId, product: 'juice', location: 'machine:cup' }]);
    expect(send(s, { type: 'start-machine' }).kind).toBe('blocked');
    expect(advance(s, 10000).items).toEqual(s.items);
    expect(
      dispatch(s, { id: 'old', runId: 'old-run', command: { type: 'start-machine' } }).kind,
    ).toBe('stale');
    expect(validateState(s)).toBe(true);
  });
  it('requires a cup, supports pre-process returns and confirmed finished disposal', () => {
    let s = send(createGame('x'), {
      type: 'move',
      source: { supply: 'apple' },
      destination: { machine: 'apple' },
    }).state;
    expect(send(s, { type: 'start-machine' }).message).toContain('空杯');
    const item = s.items[0];
    if (!item) throw new Error('apple');
    s = send(s, {
      type: 'move',
      source: { item: item.id },
      destination: { discard: true, confirmed: false },
    }).state;
    expect(s.machine.status).toBe('empty');
    s = advance(juice(s), 5000);
    const cup = s.items[0];
    if (!cup) throw new Error('cup');
    expect(
      send(s, {
        type: 'move',
        source: { item: cup.id },
        destination: { discard: true, confirmed: false },
      }).kind,
    ).toBe('confirm');
    s = send(s, {
      type: 'move',
      source: { item: cup.id },
      destination: { discard: true, confirmed: true },
    }).state;
    expect(s.items).toHaveLength(0);
    expect(s.machine.status).toBe('empty');
  });
  it('reserves all helper slots, binds destination and releases on cancel or completion', () => {
    let s = put(createGame('x'), 'banana', 0);
    s = send(s, { type: 'note', tray: 0, tokens: tokens('two apples') }).state;
    expect(freeSlots(s, 0)).toHaveLength(0);
    expect(s.items.filter((i) => i.location === 'helper')).toHaveLength(2);
    expect(send(s, { type: 'deliver', tray: 0, order: 'guest-1' }).kind).toBe('blocked');
    expect(send(s, { type: 'note', tray: 1, tokens: tokens('an apple') }).kind).toBe('blocked');
    expect(put(s, 'apple', 0).items).toHaveLength(3);
    const complete = advance(s, 2000);
    expect(trayItems(complete, 0)).toHaveLength(3);
    expect(trayItems(complete, 1)).toHaveLength(0);
    expect(validateState(complete)).toBe(true);
    const cancel = send(s, { type: 'cancel-helper' }).state;
    expect(cancel.items).toHaveLength(1);
    expect(freeSlots(cancel, 0)).toHaveLength(2);
    expect(cancel.attempts).toHaveLength(1);
    s = put(cancel, 'apple', 0);
    const blocked = send(s, { type: 'note', tray: 0, tokens: tokens('two apples') });
    expect(blocked.state.helper).toBeNull();
    expect(blocked.state.items).toHaveLength(2);
    expect(blocked.state.attempts.at(-1)?.result).toBe('world-blocked');
  });
  it('matches a multiset, retains all mismatching food, and never auto-transfers', () => {
    let s = put(put(createGame('x'), 'banana', 0), 'apple', 0);
    const wrong = send(s, { type: 'deliver', tray: 0, order: 'guest-0' });
    expect(wrong.kind).toBe('mismatch');
    expect(wrong.state.items).toHaveLength(2);
    expect(wrong.state.orders.every((o) => o.status === 'waiting')).toBe(true);
    s = send(wrong.state, { type: 'deliver', tray: 0, order: 'guest-1' }).state;
    expect(s.items).toHaveLength(0);
    expect(s.orders[1]?.status).toBe('leaving');
    expect(send(s, { type: 'deliver', tray: 0, order: 'guest-1' }).kind).toBe('blocked');
    expect(validateState(s)).toBe(true);
    const extra = put(put(put(createGame('z'), 'apple', 0), 'banana', 0), 'apple', 0);
    expect(send(extra, { type: 'deliver', tray: 0, order: 'guest-1' }).kind).toBe('mismatch');
    expect(
      send(put(createGame('q'), 'apple', 0), { type: 'deliver', tray: 0, order: 'guest-1' }).state
        .attempts,
    ).toHaveLength(0);
  });
  it('serial and interleaved paths both finish; clock permits work during processing', () => {
    for (const interleaved of [false, true]) {
      let s = juice();
      if (!interleaved) s = advance(s, 5000);
      s = put(put(s, 'banana', 1), 'apple', 1);
      s = send(s, { type: 'deliver', tray: 1, order: 'guest-1' }).state;
      if (interleaved) expect(s.machine.status).toBe('processing');
      s = advance(s, 5000);
      const cup = s.items.find((i) => i.product === 'juice');
      if (!cup) throw new Error('juice');
      s = send(s, { type: 'move', source: { item: cup.id }, destination: { tray: 0 } }).state;
      s = send(s, { type: 'deliver', tray: 0, order: 'guest-0' }).state;
      s = advance(s, 800);
      expect(s.orders.every((o) => o.status === 'done')).toBe(true);
      expect(validateState(s)).toBe(true);
    }
  });
});
describe('T04–T05 finite language and honest support', () => {
  it.each([
    'An apple, please.',
    'one apple',
    'Two apples!',
    'please a banana',
    'a banana and an apple',
    'an apple and a banana',
    'two bananas',
  ])('accepts %s', (phrase) => expect(parsePhrase(phrase).kind).toBe('valid'));
  it('separates morphology, incomplete, outside and duplicate token ownership', () => {
    expect(parsePhrase('one apples').kind).toBe('language-adjust');
    expect(parsePhrase('a apple').kind).toBe('language-adjust');
    expect(parsePhrase('an').kind).toBe('incomplete');
    expect(parsePhrase('three apples').kind).toBe('outside');
    expect(parseTokens(['word-0', 'word-0']).kind).toBe('outside');
    expect(parseTokens(tokens('an apple and an apple')).kind).toBe('valid');
  });
  it('does not count replay or world errors as language failure; preserves support on refresh and restart', () => {
    let s = put(createGame('x'), 'apple', 0);
    s = send(s, { type: 'deliver', tray: 0, order: 'guest-0' }).state;
    expect(s.orders[0]?.support).toContain('mismatch-explanation');
    s = send(s, {
      type: 'audio',
      audio: { id: 'request-juice', version: 'dev-1', status: 'started' },
    }).state;
    expect(s.attempts).toHaveLength(1);
    const decoded = decodeSnapshot(JSON.stringify(s));
    expect(decoded.ok).toBe(true);
    const storage = memoryStore();
    storage.setItem(SAVE_KEY, JSON.stringify(s));
    const controller = new GameController(new SaveStore(() => storage), () => 'new');
    controller.restart();
    expect(controller.state.orders.find((o) => o.request === 'juice')?.support).toContain(
      'mismatch-explanation',
    );
  });
});
describe('T02/T10 validated snapshots and host clock', () => {
  it('restores processing and reservations repeatedly without spawning or offline credit', () => {
    let s = send(juice(), { type: 'note', tray: 1, tokens: tokens('an apple and a banana') }).state;
    s = advance(s, 850);
    for (let i = 0; i < 3; i++) {
      const decoded = decodeSnapshot(JSON.stringify(s));
      if (!decoded.ok) throw new Error(decoded.reason);
      s = decoded.state;
    }
    expect(s.machine.remaining).toBe(4150);
    expect(s.helper?.remaining).toBe(1150);
    expect(s.items).toHaveLength(4);
    s = advance(s, 1150);
    expect(trayItems(s, 1)).toHaveLength(2);
    expect(validateState(s)).toBe(true);
  });
  it('rejects corrupt/future snapshots and inconsistent ownership/reservations', () => {
    expect(decodeSnapshot('{').ok).toBe(false);
    const s = juice();
    for (const mutate of [
      (v: GameState) => {
        v.items.push({ ...v.items[0] } as (typeof v.items)[number]);
      },
      (v: GameState) => {
        v.machine.remaining = -2;
      },
      (v: GameState) => {
        v.orders[0] = { ...v.orders[1] } as (typeof v.orders)[number];
      },
    ]) {
      const v = structuredClone(s);
      mutate(v);
      expect(validateState(v)).toBe(false);
    }
    expect(decodeSnapshot(JSON.stringify({ ...s, schemaVersion: 2 })).ok).toBe(false);
    expect(decodeSnapshot(JSON.stringify({ ...s, audio: [{ status: 'fake' }] })).ok).toBe(false);
  });
  it('freezes all tasks on help/background, drops large delta, persists remaining time', () => {
    const memory = memoryStore();
    memory.setItem(SAVE_KEY, JSON.stringify(juice()));
    const c = new GameController(new SaveStore(() => memory));
    c.tick(100);
    expect(c.state.machine.remaining).toBe(5000);
    c.pause('home', false);
    c.tick(100);
    expect(c.state.machine.remaining).toBe(4900);
    c.pause('hidden', true);
    c.tick(100);
    expect(c.state.machine.remaining).toBe(4900);
    c.pause('hidden', false);
    c.tick(10000);
    expect(c.state.machine.remaining).toBe(4900);
    c.pause('help', true);
    c.tick(100);
    expect(c.state.machine.remaining).toBe(4900);
  });
  it('preserves invalid raw saves and tolerates rejected storage', () => {
    const m = memoryStore();
    m.setItem(SAVE_KEY, '{broken');
    const store = new SaveStore(() => m);
    store.load();
    expect(store.save(createGame('x'))).toBe(false);
    expect(m.getItem(SAVE_KEY)).toBe('{broken');
    const refused = new SaveStore(() => {
      throw new Error('denied');
    });
    expect(refused.load()).toBeNull();
    expect(refused.save(createGame('x'))).toBe(false);
    expect(refused.issue).toContain('导出');
  });
});
