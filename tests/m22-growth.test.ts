import { expect, it } from 'vitest';
import { REQUESTS } from '../src/content/catalog';
import { endlessPool } from '../src/content/chapters';
import { emptyProfile, ProfileStore } from '../src/platform/profile';
import { advance, createGame, dispatch } from '../src/rules/game';
import { configureSession } from '../src/rules/sessions';
import { decodeSnapshot } from '../src/rules/snapshot';

it('migrates schema5 with real reserved juice without losing or duplicating the destination', () => {
  let s = createGame('migration');
  for (const command of [
    { type: 'prepare-cup' } as const,
    { type: 'move', source: { supply: 'apple' }, destination: { machine: 'apple' } } as const,
    { type: 'start-machine', tray: 1 } as const,
  ])
    s = dispatch(s, { id: String(s.revision), runId: s.runId, command }).state;
  const old = { ...s, schemaVersion: 5, session: { ...s.session } };
  Reflect.deleteProperty(old.session, 'language');
  const decoded = decodeSnapshot(JSON.stringify(old));
  expect(decoded.ok).toBe(true);
  if (!decoded.ok) throw Error(decoded.reason);
  expect(decoded.state.items).toEqual(s.items);
  expect(decoded.state.routing.machine).toEqual({ tray: 1, slot: 0 });
  expect(advance(decoded.state, 5000).items.map((i) => [i.product, i.location])).toEqual([
    ['juice', 'tray:1:0'],
  ]);
});
it('flavor pool fixes cup; container pool fixes vanilla, independently of assistance', () => {
  const flavor = endlessPool(['juice', 'ice'], 'flavor').filter(
    (id) => id.includes('cream') || id.includes('cup') || id.includes('cone'),
  );
  const container = endlessPool(['juice', 'ice'], 'container').filter(
    (id) => id.includes('cream') || id.includes('cup') || id.includes('cone'),
  );
  expect(flavor).toEqual(['vanilla-cup', 'strawberry-cup']);
  expect(container).toEqual(['cup-vanilla', 'cone-vanilla']);
});
it('changing language and help keeps accepted tasks, food, seed and cursor', () => {
  let s = configureSession(createGame('policy'), 'endless', 0, 'pictures', ['juice'], 71, 1, [
    'apple',
  ]);
  s = dispatch(s, {
    id: 'food',
    runId: s.runId,
    command: { type: 'move', source: { supply: 'banana' }, destination: { tray: 0 } },
  }).state;
  const before = structuredClone(s);
  s = dispatch(s, {
    id: 'language',
    runId: s.runId,
    command: { type: 'language', language: 'combined' },
  }).state;
  s = dispatch(s, {
    id: 'help',
    runId: s.runId,
    command: { type: 'policy', support: 'less', concurrency: 1 },
  }).state;
  expect(s.orders).toEqual(before.orders);
  expect(s.items).toEqual(before.items);
  expect(s.session.cursor).toBe(before.session.cursor);
  expect(s.session.seed).toBe(71);
});
it('fresh profile does not silently introduce banana or juice; explicit menu introduction unlocks only that request', () => {
  const data = new Map<string, string>();
  const p = new ProfileStore(() => ({
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => {
      data.set(k, v);
    },
    removeItem: (k) => {
      data.delete(k);
    },
  }));
  expect(p.menu()).toEqual(['apple']);
  p.present('menu:banana');
  expect(p.menu()).toEqual(['apple', 'banana']);
  expect(p.value.observations).toEqual([]);
  expect(p.menu().every((id) => id in REQUESTS)).toBe(true);
});

it('v2 ice lesson resumes the same flavor and support, without granting fresh-fruit knowledge', () => {
  const old = {
    ...emptyProfile(),
    version: 2,
    learnedUnits: ['strawberry', 'vanilla'],
    presented: ['strawberry', 'vanilla'],
    lessons: {
      oldIce: {
        request: 'strawberry-cup',
        units: ['strawberry', 'cup'],
        index: 0,
        phase: 'try',
        step: 0,
        tries: 1,
        nextAttempt: 2,
        support: ['answer-help'],
      },
    },
  };
  const raw = JSON.stringify(old);
  const p = new ProfileStore(() => ({
    getItem: () => raw,
    setItem: () => {},
    removeItem: () => {},
  }));
  expect(p.blocked).toBe(false);
  expect(p.raw).toBe(raw);
  expect(p.value.lessons.oldIce?.units).toEqual(['strawberry-scoop', 'cup']);
  expect(p.value.lessons.oldIce?.support).toEqual(['answer-help']);
  expect(p.value.lessons.oldIce?.nextAttempt).toBe(2);
  expect(p.value.learnedUnits).toEqual(['strawberry-scoop', 'legacy-v2:vanilla']);
  expect(p.value.presented).not.toContain('strawberry');
});
it('promoting a single-customer story allocates free seats and produces a restorable snapshot', () => {
  let s = configureSession(
    createGame('seats', 1, {}, 'practice'),
    'story',
    0,
    'pictures',
    ['juice'],
    11,
    1,
  );
  const accepted = structuredClone(s.orders[0]);
  s = dispatch(s, {
    id: 'two',
    runId: s.runId,
    command: { type: 'policy', support: 'pictures', concurrency: 2 },
  }).state;
  s = advance(s, 16);
  expect(s.orders[0]).toEqual(accepted);
  expect(new Set(s.orders.filter((o) => o.status === 'waiting').map((o) => o.seat)).size).toBe(2);
  expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
});
