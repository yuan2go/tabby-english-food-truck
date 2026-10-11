import { readFileSync } from 'node:fs';
import { expect, it, vi } from 'vitest';
import { emptyAdventure } from '../src/content/adventure';
import { kitchenActions, layoutFor } from '../src/game/layout';
import { GameController } from '../src/platform/controller';
import { emptyProfile, ProfileStore } from '../src/platform/profile';
import { SaveStore } from '../src/platform/save';
import { advance, createGame, dispatch } from '../src/rules/game';
import { configureSession } from '../src/rules/sessions';
import { decodeSnapshot } from '../src/rules/snapshot';
import type { Command } from '../src/rules/types';

// Catch session-key collisions, fabricated migration rewards, and menu changes rewriting orders.
it('normal story entry starts an activity and resumes the same items after a mode switch', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => {
      values.set(k, v);
    },
    removeItem: (k: string) => {
      values.delete(k);
    },
  };
  vi.stubGlobal('localStorage', storage);
  const c = new GameController(new SaveStore(() => storage), () => 'recovery-run');
  c.enter('story', 2, 'pictures');
  expect(c.state.adventure?.chapter).toBe(2);
  c.command({ type: 'family', family: 'juice' });
  c.command({ type: 'move', source: { supply: 'banana' }, destination: { tray: 0 } });
  const before = structuredClone(c.state);
  c.enter('training', 0, 'pictures');
  c.enter('story', 2, 'pictures');
  expect(c.state.runId).toBe(before.runId);
  expect(c.state.items).toEqual(before.items);
  expect(c.state.adventure).toEqual(before.adventure);
  const reloaded = new GameController(new SaveStore(() => storage));
  reloaded.enter('story', 2, 'pictures');
  expect(reloaded.state.items).toEqual(before.items);
  vi.unstubAllGlobals();
});
it('legacy service remains reachable after entering and reloading a new adventure', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => {
      values.set(k, v);
    },
    removeItem: (k: string) => {
      values.delete(k);
    },
  };
  vi.stubGlobal('localStorage', storage);
  const save = new SaveStore(() => storage);
  let old = configureSession(
    createGame('old-story'),
    'story',
    2,
    'pictures',
    ['juice', 'ice', 'sandwich'],
    1,
  );
  old = dispatch(old, {
    id: 'fruit',
    runId: old.runId,
    command: { type: 'move', source: { supply: 'banana' }, destination: { tray: 0 } },
  }).state;
  save.save(old);
  const c = new GameController(save, () => 'new-adventure');
  c.enter('story', 0);
  const restored = new GameController(new SaveStore(() => storage));
  expect(restored.save.legacyStoryKey()).toBe('story-2');
  restored.resumeLegacyStory();
  expect(restored.state.runId).toBe('old-story');
  expect(restored.state.items).toEqual(old.items);
  expect(restored.state.adventure).toBeNull();
  vi.unstubAllGlobals();
});
it('old profile chapters remain historical and grant no new activity reward', () => {
  const p = emptyProfile();
  p.completed = [0, 1, 2, 3, 4];
  const raw = JSON.stringify(p);
  const store = new ProfileStore(() => ({
    getItem: () => raw,
    setItem: () => {},
    removeItem: () => {},
  }));
  expect(store.value.completed).toEqual([0, 1, 2, 3, 4]);
  expect(store.value.activityMemories).toEqual([]);
});
it('replay retains note assistance and a selected opening menu applies to the first guests', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => {
      values.set(k, v);
    },
    removeItem: (k: string) => {
      values.delete(k);
    },
  };
  vi.stubGlobal('localStorage', storage);
  const c = new GameController(new SaveStore(() => storage));
  c.enter('story', 4);
  c.command({ type: 'note-support', reason: 'grammar-explanation' });
  c.enter('story', 4, 'less', true);
  expect(c.state.noteSupport).toContain('grammar-explanation');
  c.profile.present('menu:banana');
  c.enter('endless', 0, 'pictures', false, 2, undefined, { menu: ['banana'], theme: 'fruit' });
  expect(c.state.orders.map((o) => o.request)).toEqual(['banana', 'banana']);
  expect(c.state.session.menu).toEqual(['banana']);
  expect(decodeSnapshot(JSON.stringify(c.state)).ok).toBe(true);
  c.enter('endless', 0, 'pictures', true, 1, undefined, { menu: ['banana'], theme: 'fruit' });
  const originalGuest = structuredClone(c.state.orders[0]);
  c.enter('training', 0);
  c.enter('endless', 0, 'pictures', false, 2, undefined, { menu: ['apple'], theme: 'fruit' });
  expect(c.state.orders[0]).toEqual(originalGuest);
  expect(c.state.orders[1]?.request).toBe('apple');
  vi.unstubAllGlobals();
});
it('bounded replay memories keep the latest receipt of every completed chapter', () => {
  const store = new ProfileStore(() => ({
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }));
  const breakfast = emptyAdventure(0);
  breakfast.steps = ['served:rabbit', 'served:hedgehog', 'plant'];
  breakfast.rewards = ['flower-page'];
  store.rememberActivity('breakfast-run', breakfast);
  for (let n = 0; n < 20; n++) {
    const feast = emptyAdventure(4);
    feast.steps = ['create', 'taste', 'save-work'];
    feast.invitations = ['rabbit', 'hedgehog'];
    feast.rewards = ['feast-page'];
    store.rememberActivity(`feast-${n}`, feast);
  }
  expect(store.value.activityMemories).toHaveLength(16);
  expect(store.value.activityMemories.some((m) => m.state.chapter === 0)).toBe(true);
});
it('selected menu and theme affect only new orders and stop accepting has a natural empty ending', () => {
  let s = configureSession(createGame('shop'), 'endless', 0, 'pictures', ['juice'], 1, 1, [
    'apple',
    'banana',
    'juice',
  ]);
  const original = structuredClone(s.orders);
  let r = dispatch(s, {
    id: 'policy',
    runId: s.runId,
    command: { type: 'shop-policy', menu: ['banana'], theme: 'fruit', accepting: false } as Command,
  });
  expect(r.kind).toBe('ok');
  s = r.state;
  expect(s.orders).toEqual(original);
  const request = s.orders[0];
  if (!request) throw Error('order');
  // This hand-written generator fixture represents an already-received order, not UI completion.
  s.orders[0] = { ...request, status: 'done' };
  s = advance(s, 1);
  expect(s.orders).toHaveLength(0);
  expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
  r = dispatch(s, {
    id: 'open',
    runId: s.runId,
    command: { type: 'shop-policy', menu: ['banana'], theme: 'fruit', accepting: true } as Command,
  });
  expect(r.kind).toBe('ok');
  expect(r.state.orders.map((o) => o.request)).toEqual(['banana']);
  const invalid = dispatch(r.state, {
    id: 'bad-menu',
    runId: s.runId,
    command: { type: 'shop-policy', menu: ['burger'], theme: 'all', accepting: true } as Command,
  });
  expect(invalid.kind).toBe('blocked');
  expect(invalid.state.orders.map((o) => o.request)).toEqual(['banana']);
});

it('first activity food is observed as first exposure and replay as a revisit', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => {
      values.set(k, v);
    },
    removeItem: (k: string) => {
      values.delete(k);
    },
  };
  vi.stubGlobal('localStorage', storage);
  let run = 0;
  const c = new GameController(new SaveStore(() => storage), () => `exposure-${++run}`);
  for (const replay of [false, true]) {
    if (replay) {
      for (let n = 0; n < 161; n++)
        c.profile.observe({
          id: `ordinary-note-${n}`,
          dimension: 'structure',
          target: 'fruit-request',
          result: 'incomplete',
          support: [],
          visit: 'first',
          audioQualified: false,
        });
    }
    c.enter('story', 0, 'pictures', replay);
    c.pauses.clear();
    c.command({ type: 'move', source: { supply: 'apple' }, destination: { tray: 0 } });
    c.command({ type: 'deliver', tray: 0, order: c.state.orders[0]?.id ?? '' });
    for (let tick = 0; tick < 180; tick++) c.tick(100);
    expect(
      c.profile.value.observations.filter((o) => o.id.startsWith('world:')).at(-1)?.visit,
    ).toBe(replay ? 'revisit' : 'first');
  }
  expect(new ProfileStore(() => storage).value.receivedProducts).toEqual(['apple']);
  vi.unstubAllGlobals();
});

it('migrates real PR10 archived session snapshots without changing food, actor or support', () => {
  let checked = 0;
  for (const file of ['tabby-before-parallel.storage.json', 'tabby-before-overlap.storage.json']) {
    const archive = JSON.parse(
      readFileSync(
        new URL(
          `../docs/evidence/adventure-direct-input/execution-artifacts/checkpoints/${file}`,
          import.meta.url,
        ),
        'utf8',
      ),
    );
    for (const origin of archive.origins)
      for (const entry of origin.localStorage) {
        if (!entry.name.startsWith('tabby.foodtruck.save.m2')) continue;
        const original = JSON.parse(entry.value);
        if (original.schemaVersion !== 6 || original.contentVersion !== 'm2.4-adventure-1')
          continue;
        const decoded = decodeSnapshot(entry.value);
        expect(decoded.ok, entry.name).toBe(true);
        if (!decoded.ok) throw Error(decoded.reason);
        expect(decoded.state.adventure).toBeNull();
        for (const field of [
          'items',
          'actor',
          'routing',
          'orders',
          'history',
          'noteSupport',
        ] as const)
          expect(decoded.state[field]).toEqual(original[field]);
        checked++;
      }
  }
  expect(checked).toBeGreaterThan(0);
});
it('physical tools and activity handoff remain separate touch targets', () => {
  for (const size of [
    [390, 844],
    [768, 1024],
    [1440, 900],
  ] as const) {
    const l = layoutFor(size[0], size[1]);
    const areas = kitchenActions(l, 5, true);
    expect(areas.handoff?.width).toBeGreaterThanOrEqual(44);
    expect(areas.tools.width / 5).toBeGreaterThanOrEqual(44);
    expect(areas.tools.x + areas.tools.width).toBeLessThan(areas.handoff?.x ?? 0);
    expect(areas.handoff && areas.handoff.x + areas.handoff.width).toBeLessThanOrEqual(l.width - 8);
  }
});
