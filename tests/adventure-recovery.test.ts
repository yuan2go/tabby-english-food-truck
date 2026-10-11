import { expect, it, vi } from 'vitest';
import { emptyAdventure } from '../src/content/adventure';
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
