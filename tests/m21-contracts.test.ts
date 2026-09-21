import { expect, it } from 'vitest';
import { REQUESTS } from '../src/content/catalog';
import { ITEM_AUDIO, WORDS } from '../src/content/learning';
import { FOOD } from '../src/content/recipes';
import speech from '../src/content/speech.json';
import { preparationSteps, REQUEST_UNITS, UNITS } from '../src/content/teaching';
import { MINI_KEY, MiniStore } from '../src/platform/minis';
import { advance, createGame, dispatch } from '../src/rules/game';
import {
  beginRound,
  createMini,
  decodeMini,
  editLetter,
  letters,
  nextRound,
  options,
  playRound,
  restartMini,
  submitMini,
  targetWord,
  validateMini,
  wordGroups,
} from '../src/rules/minigames';
import { applyPolicy, configureSession } from '../src/rules/sessions';
import { decodeSnapshot, validateState } from '../src/rules/snapshot';

it('all projected names, intermediate products, prompts and requests resolve to explicit audio', () => {
  for (const [p, id] of Object.entries(ITEM_AUDIO)) {
    expect(Object.hasOwn(speech, id), p).toBe(true);
    expect(speech[id as keyof typeof speech].text).toBe(FOOD[p as keyof typeof FOOD][1]);
  }
  for (const w of WORDS) expect(speech[w.audio as keyof typeof speech]?.text).toBe(w.text);
  for (const r of Object.keys(REQUESTS) as (keyof typeof REQUESTS)[]) {
    expect(speech[REQUESTS[r].audio as keyof typeof speech]?.text).toBe(REQUESTS[r].text);
    for (const id of REQUEST_UNITS[r]) expect(UNITS[id]).toBeDefined();
  }
  for (const u of Object.values(UNITS)) {
    expect(Object.hasOwn(speech, u.audio)).toBe(true);
    expect(Object.hasOwn(speech, u.prompt)).toBe(true);
    expect(u.choices.some((c) => c.id === u.accepts)).toBe(true);
  }
  expect(preparationSteps('cheese-burger').map((r) => ITEM_AUDIO[r.output])).toEqual([
    'word-cooked-patty',
    'word-cheese-burger',
  ]);
});
it('multiword slots, repeated identities, partial assistance and keyboard/drag edit semantics agree', () => {
  const ids = WORDS.map((w) => w.id);
  const base = Array.from({ length: 100 }, (_, seed) =>
    createMini('spell', 'partial', seed, 'listen', ids, 'phrases'),
  ).find((s) => s.words[0] === 'ice-cream');
  if (!base) throw Error('phrase pool');
  let s = playRound(beginRound(base));
  expect(wordGroups(s).map((g) => g.length)).toEqual([3, 5]);
  expect(s.fixed.length).toBe(4);
  const movable = letters(s).filter((l) => !s.fixed.includes(l.id));
  for (const l of movable) s = editLetter(s, l.id, l.index);
  expect(validateMini(s)).toBe(true);
  const first = movable[0];
  if (!first) throw Error('movable letter');
  s = editLetter(s, first.id, null);
  expect(submitMini(s).attempts).toHaveLength(0);
  s = editLetter(s, first.id, first.index);
  s = submitMini(s);
  expect(s.correct).toBe(true);
  expect(s.attempts[0]?.support).toContain('partial');
  const next = nextRound(s);
  expect(next.round).toBe(1);
  expect(next.draft).toHaveLength(0);
  const beginner = createMini('spell', 'independent', 2, 'listen', ids, 'new');
  expect(beginner.words.every((id) => !id.includes('cream') && !id.includes('sandwich'))).toBe(
    true,
  );
  expect(createMini('spell', 'independent', 2, 'listen', ids, 'phrases').vocabulary).toContain(
    'ice-cream',
  );
});
it('restart keeps unfinished help but a new completed revisit does not inherit target answers', () => {
  let s = playRound(beginRound(createMini('match', 'independent', 5)));
  s = { ...s, support: ['answer-help'] };
  const restarted = playRound(beginRound(restartMini(s, 'new-run')));
  expect(restarted.support).toContain('answer-help');
  const finished = submitMini(s, targetWord(s).id);
  expect(playRound(beginRound(restartMini(finished, 'new-visit'))).support).not.toContain(
    'answer-help',
  );
});
it('direct matching accepts options and records missing playback conditions honestly', () => {
  let s = playRound(beginRound(createMini('match', 'independent', 5)));
  expect(options(s).length).toBe(2);
  const response = submitMini(s, targetWord(s).id);
  expect(response.correct).toBe(true);
  expect(response.attempts[0]?.support).toContain('audio-not-observed');
  s = { ...s, heard: true };
  expect(submitMini(s, targetWord(s).id).attempts[0]?.support).toEqual([]);
});
it('separate mini sessions retain memory under storage denial, protect corrupt originals and export drafts', () => {
  const refused = new MiniStore(() => {
    throw Error('denied');
  });
  const spell = playRound(beginRound(createMini('spell', 'partial', 2)));
  refused.save(spell);
  refused.save(createMini('match', 'demo', 3));
  expect(refused.sessions.spell).toEqual(spell);
  expect(refused.export().sessions.spell?.fixed.length).toBeGreaterThan(0);
  const values = new Map([[MINI_KEY, '{broken']]);
  const store = new MiniStore(() => ({
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => {
      values.set(k, v);
    },
    removeItem: (k) => {
      values.delete(k);
    },
  }));
  store.save(spell);
  expect(values.get(MINI_KEY)).toBe('{broken');
  expect(store.export().protectedRaw).toBe('{broken');
  expect(store.sessions.spell).toEqual(spell);
  expect(decodeMini('{')).toBeNull();
});
it('business policy keeps material, seed, cursor and actor time while both directions remain restorable', () => {
  let s = configureSession(createGame('policy'), 'endless', 0, 'pictures', ['juice'], 22, 1);
  s = dispatch(s, {
    id: 'put',
    runId: s.runId,
    command: { type: 'move', source: { supply: 'apple' }, destination: { tray: 1 } },
  }).state;
  const items = structuredClone(s.items),
    seed = s.session.seed,
    order = s.orders[0];
  if (!order) throw Error('order');
  applyPolicy(s, 'less', 2);
  expect(s.orders).toHaveLength(2);
  expect(s.orders[0]?.id).toBe(order.id);
  expect(s.items).toEqual(items);
  expect(s.session.seed).toBe(seed);
  applyPolicy(s, 'demonstration', 1);
  expect(s.orders).toHaveLength(2);
  expect(validateState(s)).toBe(true);
  const restored = decodeSnapshot(JSON.stringify(s));
  expect(restored.ok).toBe(true);
  const cursor = s.session.cursor;
  applyPolicy(s, 'pictures', 1);
  expect(s.session.cursor).toBe(cursor);
  expect(advance(s, 50).items).toBe(s.items);
});
it('schema3 migration preserves timers and inventory and never invents playback evidence', () => {
  const current = configureSession(createGame('migration'), 'endless', 0, 'less', ['juice'], 45, 2);
  const old = JSON.parse(JSON.stringify(current));
  old.schemaVersion = 3;
  old.contentVersion = 'm2.0';
  delete old.session.concurrency;
  delete old.session.menu;
  for (const o of old.orders) delete o.heard;
  const decoded = decodeSnapshot(JSON.stringify(old));
  if (!decoded.ok) throw Error(decoded.reason);
  expect(decoded.state.session.concurrency).toBe(2);
  expect(decoded.state.orders.every((o) => !o.heard)).toBe(true);
  expect(decoded.state.session.seed).toBe(45);
  expect(decoded.state.items).toEqual(current.items);
});

it('clock advancement shares immutable plans but never mutates prior actor tasks', () => {
  let s = configureSession(createGame('actor-copy'), 'endless', 0, 'pictures', ['juice'], 11, 1, [
    'apple',
  ]);
  s = dispatch(s, {
    id: 'food',
    runId: s.runId,
    command: { type: 'move', source: { supply: 'apple' }, destination: { tray: 0 } },
  }).state;
  const order = s.orders[0];
  if (!order) throw Error('order');
  s = dispatch(s, {
    id: 'deliver',
    runId: s.runId,
    command: { type: 'deliver', tray: 0, order: order.id },
  }).state;
  const prior = structuredClone(s);
  const advanced = advance(s, 60);
  expect(s).toEqual(prior);
  expect(advanced.actor.current?.plan).toBe(s.actor.current?.plan);
  expect(advanced.actor.current?.elapsed).toBe(60);
});
it('automatic empty cup has one explicit rule-owned location and does not choose fruit', () => {
  const s = configureSession(createGame('cup'), 'training', 0, 'pictures', ['juice'], 1);
  const next = dispatch(s, { id: 'cup', runId: s.runId, command: { type: 'prepare-cup' } }).state;
  expect(next.items).toEqual([{ id: next.items[0]?.id, product: 'cup', location: 'machine:cup' }]);
  expect(next.machine.status).toBe('loaded');
  expect(next.attempts).toHaveLength(0);
  expect(validateState(next)).toBe(true);
  const again = dispatch(next, {
    id: 'cup2',
    runId: s.runId,
    command: { type: 'prepare-cup' },
  }).state;
  expect(again.items).toEqual(next.items);
});
