import { expect, it } from 'vitest';
import { insertToken } from '../src/app/note-order';

it('uses original insertion boundaries for front/back/end and distinct duplicate tokens', () => {
  const ids = ['apple-1', 'and', 'apple-2', 'please'];
  expect(insertToken(ids, 'apple-1', 3)).toEqual(['and', 'apple-2', 'apple-1', 'please']);
  expect(insertToken(ids, 'apple-1', 4)).toEqual(['and', 'apple-2', 'please', 'apple-1']);
  expect(insertToken(ids, 'apple-2', 0)).toEqual(['apple-2', 'apple-1', 'and', 'please']);
  expect(insertToken(ids, 'and', 2)).toEqual(ids);
  expect(insertToken(ids, 'banana', 0)).toEqual(['banana', ...ids]);
  expect(insertToken(ids, 'banana', 99)).toEqual([...ids, 'banana']);
  expect(ids).toEqual(['apple-1', 'and', 'apple-2', 'please']);
});
