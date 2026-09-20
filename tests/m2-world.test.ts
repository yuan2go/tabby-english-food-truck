import { describe, expect, it } from 'vitest';
import { REQUESTS } from '../src/content/catalog';
import { CHAPTERS, type Support } from '../src/content/chapters';
import { type Family, type Product, RAW, RECIPES } from '../src/content/recipes';
import { advance, createGame, dispatch, trayItems } from '../src/rules/game';
import {
  beginRound,
  createMini,
  letters,
  nextRound,
  playRound,
  submitMini,
  targetWord,
  validateMini,
} from '../src/rules/minigames';
import { configureSession } from '../src/rules/sessions';
import { decodeSnapshot, validateState } from '../src/rules/snapshot';
import type { Command, GameState, Source } from '../src/rules/types';

let seq = 0;
function send(s: GameState, command: Command) {
  const r = dispatch(s, { runId: s.runId, id: `m2-${++seq}`, command });
  expect(validateState(r.state), JSON.stringify({ command, result: r.kind, state: r.state })).toBe(
    true,
  );
  return r;
}
function make(s: GameState, product: Product): [GameState, Source] {
  if (RAW.includes(product)) return [s, { supply: product }];
  const r = RECIPES.find((r) => r.output === product);
  if (!r) throw Error(product);
  s = send(s, { type: 'family', family: r.family }).state;
  for (const input of [...r.inputs].reverse()) {
    const [next, source] = make(s, input);
    s = next;
    s = send(s, {
      type: 'move',
      source,
      destination:
        r.station === 'machine'
          ? { machine: input === 'cup' ? 'cup' : 'apple' }
          : { station: r.station },
    }).state;
  }
  s = send(
    s,
    r.station === 'machine'
      ? { type: 'start-machine' }
      : { type: 'start-station', station: r.station },
  ).state;
  const duplicate = send(
    s,
    r.station === 'machine'
      ? { type: 'start-machine' }
      : { type: 'start-station', station: r.station },
  );
  expect(duplicate.kind).toBe('blocked');
  s = advance(s, Math.floor(r.ms / 2));
  const restored = decodeSnapshot(JSON.stringify(s));
  if (!restored.ok) throw Error(restored.reason);
  expect(advance(restored.state, r.ms)).toEqual(advance(s, r.ms));
  s = advance(restored.state, r.ms);
  expect(validateState(s)).toBe(true);
  const item = s.items.find(
    (i) =>
      i.product === product &&
      (r.station === 'machine'
        ? i.location === 'machine:cup'
        : i.location.startsWith(`station:${r.station}:`)),
  );
  if (!item) throw Error(product);
  return [s, { item: item.id }];
}
const families: Family[] = ['juice', 'ice', 'sandwich', 'burger'];
describe('M2 content-driven world', () => {
  it('every recipe consumes real inputs, makes one output and restores mid process', () => {
    for (const r of RECIPES) {
      let s = configureSession(createGame('recipe'), 'story', 4, 'pictures', families, 8);
      const [next, source] = make(s, r.output);
      s = next;
      expect(s.items).toHaveLength(1);
      expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
      s = send(s, { type: 'move', source, destination: { tray: 0 } }).state;
      expect(trayItems(s, 0)).toHaveLength(1);
      expect(
        send(s, { type: 'move', source, destination: { discard: true, confirmed: false } }).kind,
      ).toBe('confirm');
      s = send(s, { type: 'move', source, destination: { discard: true, confirmed: true } }).state;
      expect(s.recycle?.product).toBe(r.output);
      s = send(s, { type: 'restore-cleared', tray: 0 }).state;
      expect(trayItems(s, 0)[0]?.product).toBe(r.output);
      expect(s.recycle).toBeNull();
    }
  });
  it('all four chapters and community ending complete by commands, no product/answer injection', () => {
    for (const chapter of CHAPTERS) {
      let s = configureSession(
        createGame(`chapter-${chapter.id}`),
        'story',
        chapter.id,
        'pictures',
        families,
        12,
      );
      for (const request of chapter.requests) {
        const order = s.orders.find((o) => o.status === 'waiting');
        if (!order) throw Error('waiting');
        expect(order.request).toBe(request);
        for (const product of REQUESTS[request].products) {
          const [next, source] = make(s, product);
          s = send(next, { type: 'move', source, destination: { tray: 0 } }).state;
        }
        const delivery = send(s, { type: 'deliver', tray: 0, order: order.id });
        expect(delivery.kind).toBe('ok');
        s = advance(delivery.state, delivery.state.trays[0].remaining);
        expect(validateState(s)).toBe(true);
      }
      expect(s.orders.every((o) => o.status === 'done')).toBe(true);
      expect(s.items).toHaveLength(0);
    }
  });
  it('100 endless orders stay reachable, deterministic across refresh and bounded', () => {
    for (const support of ['pictures', 'less'] as Support[]) {
      let s = configureSession(
        createGame(`endless-${support}`),
        'endless',
        0,
        support,
        families,
        88,
      );
      const seen = new Set<string>();
      for (let n = 0; n < 100; n++) {
        const order = s.orders.find((o) => o.status === 'waiting');
        if (!order) throw Error('waiting');
        seen.add(order.request);
        for (const p of REQUESTS[order.request].products) {
          const [next, source] = make(s, p);
          s = send(next, { type: 'move', source, destination: { tray: 0 } }).state;
        }
        s = send(s, { type: 'deliver', tray: 0, order: order.id }).state;
        const raw = decodeSnapshot(JSON.stringify(s));
        if (!raw.ok) throw Error(raw.reason);
        const finish = advance(raw.state, raw.state.trays[0].remaining);
        expect(advance(s, s.trays[0].remaining)).toEqual(finish);
        s = finish;
        expect(validateState(s)).toBe(true);
        expect(s.orders.length).toBeLessThanOrEqual(2);
        expect(s.items).toHaveLength(0);
        expect(s.attempts.length).toBeLessThanOrEqual(80);
        expect(s.receipts.length).toBeLessThanOrEqual(64);
      }
      expect(seen.size).toBeGreaterThan(6);
      expect(s.session.served).toBe(100);
    }
  });
  it('helper and delivery serialize from current position, reserve only needed tray and survive snapshots', () => {
    let s = createGame('overlap');
    s = send(s, { type: 'picture-request', tray: 0, fruits: ['apple'] }).state;
    s = send(s, { type: 'move', source: { supply: 'banana' }, destination: { tray: 1 } }).state;
    s = send(s, { type: 'move', source: { supply: 'apple' }, destination: { tray: 1 } }).state;
    s = send(s, { type: 'deliver', tray: 1, order: 'guest-1' }).state;
    expect(s.actor.queue).toHaveLength(1);
    const from = s.actor.point;
    s = advance(s, 16);
    expect(Math.hypot(s.actor.point.x - from.x, s.actor.point.y - from.y)).toBeLessThan(0.02);
    expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
    s = advance(s, Math.max(s.helper?.remaining ?? 0, s.trays[1].remaining));
    expect(s.orders[1]?.status).toBe('done');
    expect(trayItems(s, 0)).toHaveLength(1);
    expect(s.actor.queue).toHaveLength(0);
    expect(validateState(s)).toBe(true);
  });
  it('rejects impossible recipe tasks, duplicates, future versions and mismatched outputs', () => {
    const s = configureSession(createGame('bad'), 'story', 1, 'pictures', families, 4);
    expect(validateState({ ...s, schemaVersion: 4 })).toBe(false);
    expect(
      validateState({
        ...s,
        stations: {
          ...s.stations,
          ice: { status: 'processing', recipe: 'burger', remaining: 1200 },
        },
      }),
    ).toBe(false);
    expect(validateState({ ...s, actor: { ...s.actor, point: { x: NaN, y: 0 } } })).toBe(false);
  });
});
describe('M2 deterministic minigames', () => {
  it('four spelling rounds support repeated IDs, withdrawal, retry and return snapshots', () => {
    let s = beginRound(createMini('spell', 'independent', 7));
    for (let n = 0; n < 4; n++) {
      s = playRound(s);
      const word = targetWord(s);
      const used: string[] = [];
      for (const ch of word.text.replaceAll(' ', '').toUpperCase()) {
        const letter = letters(s).find((l) => l.text === ch && !used.includes(l.id));
        if (!letter) throw Error(ch);
        used.push(letter.id);
      }
      expect(new Set(used).size).toBe(used.length);
      s = { ...s, draft: used };
      expect(validateMini(JSON.parse(JSON.stringify(s)))).toBe(true);
      s = submitMini(s);
      expect(s.correct).toBe(true);
      expect(s.attempts.at(-1)?.support).toEqual([]);
      s = nextRound(s);
    }
    expect(s.stage).toBe('done');
    expect(s.attempts).toHaveLength(4);
  });
  it('help survives refresh, incomplete is not language failure and duplicate letters are rejected', () => {
    let s = playRound(beginRound(createMini('spell', 'partial', 4)));
    s = submitMini(s);
    expect(s.attempts).toHaveLength(0);
    expect(s.fixed).toHaveLength(1);
    expect(validateMini({ ...s, draft: [s.fixed[0], s.fixed[0]] })).toBe(false);
    let match = playRound(beginRound(createMini('match', 'independent', 8)));
    match = submitMini(match, 'wrong');
    expect(match.support).toContain('difference-feedback');
    match = submitMini(JSON.parse(JSON.stringify(match)), targetWord(match).id);
    expect(match.attempts.at(-1)?.support).toContain('difference-feedback');
  });
});
