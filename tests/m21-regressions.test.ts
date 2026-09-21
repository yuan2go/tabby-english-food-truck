import { expect, it } from 'vitest';
import { lessonWords } from '../src/content/learning';
import { GameController } from '../src/platform/controller';
import { SaveStore } from '../src/platform/save';
import { beginRound, createMini, playRound } from '../src/rules/minigames';

it('object names never substitute a full request or guessed missing word resource', () => {
  expect(lessonWords(['sandwich'])[0]?.audio).toBe('name-cheese-sandwich');
});
it('returning to endless can increase concurrency without clearing its accepted order', () => {
  const values = new Map<string, string>();
  const c = new GameController(
    new SaveStore(() => ({
      getItem: (k) => values.get(k) ?? null,
      setItem: (k, v) => {
        values.set(k, v);
      },
      removeItem: (k) => {
        values.delete(k);
      },
    })),
    () => 'm21-policy',
  );
  c.enter('endless', 0, 'pictures');
  const original = c.state.orders[0];
  c.enter('endless', 0, 'less', false, 2);
  expect(c.state.mode).toBe('service');
  expect(c.state.orders).toHaveLength(2);
  expect(c.state.session.concurrency).toBe(2);
  expect(c.state.orders).toContainEqual(original);
});
it('returning to the same mini attempt cannot clear its help', () => {
  const s = {
    ...playRound(beginRound(createMini('spell', 'independent', 4))),
    support: ['answer-help'],
  };
  expect(playRound(s).support).toContain('answer-help');
});
