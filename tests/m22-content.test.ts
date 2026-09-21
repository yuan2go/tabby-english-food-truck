import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { REQUESTS } from '../src/content/catalog';
import { FOOD_REQUESTS } from '../src/content/food-orders';
import { FOODS, foodBatch } from '../src/content/foods';
import {
  FOOD,
  foodAsset,
  PREPARED,
  type Product,
  RAW,
  RECIPES,
  SUPPLY_PAGES,
} from '../src/content/recipes';
import speech from '../src/content/speech.json';
import { REQUEST_UNITS } from '../src/content/teaching';
import { advance, createGame, dispatch } from '../src/rules/game';
import {
  beginRound,
  createMini,
  playRound,
  submitMini,
  targetWord,
  validateMini,
} from '../src/rules/minigames';
import { configureSession } from '../src/rules/sessions';
import { decodeSnapshot, validateState } from '../src/rules/snapshot';
import type { Command, GameState } from '../src/rules/types';

const cmd = (s: GameState, command: Command) =>
  dispatch(s, { id: `check-${s.revision}`, runId: s.runId, command });
it('registers exactly the authorized 50 concepts, not containers or recipe states', () => {
  expect(FOODS).toHaveLength(50);
  expect(new Set(FOODS.map((f) => f.id)).size).toBe(50);
  expect(new Set(FOODS.map((f) => f.image)).size).toBe(50);
  expect(FOODS.filter((f) => ['cup', 'cone', 'banana-juice'].includes(f.id))).toHaveLength(0);
  expect(FOODS.find((f) => f.id === 'ice-cream')?.text).toBe('ice cream');
});
describe.each(FOODS)('$id registration and actual practice', (f) => {
  it('resolves words, real images and speech, and has a reachable five-choice batch', () => {
    expect(f.product in FOOD).toBe(true);
    expect(foodAsset(f.product as Product)).toBe(f.image);
    expect(existsSync(`public/assets/${f.image}.webp`)).toBe(true);
    for (const [id, text] of [
      [f.audio, f.text],
      [f.contextAudio, f.context],
    ]) {
      const a = speech[id as keyof typeof speech];
      expect(a?.text).toBe(text);
      expect(readFileSync(`public/${a.path}`).subarray(0, 4).toString()).toBe('RIFF');
    }
    expect(foodBatch(f.batch)).toHaveLength(5);
    expect(f.unit).toBeTruthy();
    expect(f.entry).toBe('training/food-baskets');
    if (f.role === 'recognition') expect(Object.keys(FOOD_REQUESTS)).not.toContain(`food-${f.id}`);
    if (['direct', 'prepared'].includes(f.role)) expect(SUPPLY_PAGES.flat()).toContain(f.product);
    if (f.role === 'recipe') expect(RECIPES.some((r) => r.output === f.product)).toBe(true);
  });
  it('can be a real listening round and survives draft save without changing support', () => {
    const vocabulary = foodBatch(f.batch).map((x) => x.id);
    let s = createMini('match', 'independent', 1, 'listen', vocabulary, 'new');
    for (let seed = 1; targetWord(s).id !== f.id && seed < 200; seed++)
      s = createMini('match', 'independent', seed, 'listen', vocabulary, 'new');
    expect(targetWord(s).id).toBe(f.id);
    s = playRound(beginRound(s));
    s.support.push('meaning-picture');
    s.heard = true;
    expect(validateMini(JSON.parse(JSON.stringify(s)))).toBe(true);
    const result = submitMini(s, f.id);
    expect(result.correct).toBe(true);
    expect(result.attempts[0]?.support).toContain('meaning-picture');
  });
});
it.each(Object.keys(FOOD_REQUESTS) as (keyof typeof FOOD_REQUESTS)[])(
  '%s can be legitimately supplied and atomically served',
  (id) => {
    let s = configureSession(
      createGame(`serve-${id}`),
      'endless',
      0,
      'pictures',
      ['juice', 'ready'],
      17,
      1,
      [id],
    );
    const o = s.orders[0];
    if (!o) throw Error('order');
    expect(REQUEST_UNITS[id].length).toBeGreaterThan(0);
    for (const product of REQUESTS[id].products) {
      expect([...RAW, ...PREPARED]).toContain(product);
      const r = cmd(s, { type: 'move', source: { supply: product }, destination: { tray: 0 } });
      expect(r.kind).toBe('ok');
      s = r.state;
    }
    expect(validateState(s)).toBe(true);
    expect(decodeSnapshot(JSON.stringify(s)).ok).toBe(true);
    const r = cmd(s, { type: 'deliver', tray: 0, order: o.id });
    expect(r.kind).toBe('ok');
    s = r.state;
    for (let n = 0; n < 120; n++) s = advance(s, 200);
    expect(s.session.served).toBe(1);
    expect(s.items).toHaveLength(0);
    expect(s.attempts).toHaveLength(1);
    expect(validateState(s)).toBe(true);
  },
);
it('explicitly introduced three-item foundation varies and grows without deleting accepted work', () => {
  let s = configureSession(createGame('growth'), 'endless', 0, 'less', ['juice'], 99, 1, [
    'apple',
    'banana',
    'juice',
  ]);
  const seen = new Set<string>();
  for (let n = 0; n < 12; n++) {
    const o = s.orders.find((x) => x.status === 'waiting');
    if (!o) throw Error('waiting');
    seen.add(o.request);
    o.status = 'done';
    const before = s.items.map((x) => x.id);
    s = advance(s, 1);
    expect(s.items.map((x) => x.id)).toEqual(before);
  }
  expect([...seen]).toEqual(expect.arrayContaining(['apple', 'banana', 'juice']));
});
it('concept mappings include every recipe variant, and fresh strawberry teaching is never a scoop', async () => {
  const { conceptForProduct } = await import('../src/content/foods');
  const { UNITS } = await import('../src/content/teaching');
  for (const [product, concept] of [
    ['banana-juice', 'juice'],
    ['double-cream', 'ice-cream'],
    ['salad-sandwich', 'sandwich'],
    ['cheese-burger', 'burger'],
  ] as const)
    expect(conceptForProduct(product)?.id).toBe(concept);
  for (const f of FOODS) for (const p of f.productionObjects) expect(p in FOOD).toBe(true);
  expect(UNITS[REQUEST_UNITS['food-strawberry'][0] ?? '']?.products).toEqual(['fresh-strawberry']);
});
