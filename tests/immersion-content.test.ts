import { expect, it } from 'vitest';
import { REQUESTS } from '../src/content/catalog';
import { lineFor, lines, revisitLine, workCaption } from '../src/content/dialogue';
import { orderLine, productPhrase } from '../src/content/request-language';
import speech from '../src/content/speech.json';

it('complete requests express count, mass, combinations and strict container/flavor constraints', () => {
  expect(orderLine(['apple']).text).toBe('Can I have an apple, please?');
  expect(orderLine(['apple', 'apple']).text).toBe('Can I have two apples, please?');
  expect(orderLine(['juice']).text).toBe('Can I have some apple juice, please?');
  expect(orderLine(['apple', 'banana']).text).toBe('Can I have an apple and a banana, please?');
  expect(orderLine(['vanilla-cone']).text).toContain('in a cone');
  expect(orderLine(['vanilla-cup']).text).toContain('in a cup');
  expect(orderLine(['double-cream']).text).toContain('one vanilla and one strawberry');
  expect(productPhrase('orange', 1)).toBe('an orange');
  expect(productPhrase('milk', 1)).toBe('some milk');
  expect(() => orderLine(['patty'])).toThrow();
  expect(() => orderLine([])).toThrow();
});
it('every reachable order and dialogue resolves exactly the displayed whole sentence resource', () => {
  for (const r of Object.values(REQUESTS)) {
    expect(r.text).toBe(orderLine(r.products).text);
    expect(r.audio).toBe(orderLine(r.products).audio);
  }
  for (const line of [...Object.values(REQUESTS), ...lines]) {
    const clip = speech[line.audio as keyof typeof speech];
    expect(clip, line.audio).toBeDefined();
    expect(clip.text).toBe(line.text);
    expect(clip.status).toBe('DEVELOPMENT_TTS_UNREVIEWED');
  }
  expect(lineFor('open-cool').text).toContain('Any flavor');
  expect(lineFor('open-pack').text).toContain('a sandwich and a piece of fruit');
});
it('works and revisits describe actual foods; absent history never fabricates a memory', () => {
  expect(workCaption(['banana', 'juice'])).toBe('I made a banana and some apple juice.');
  expect(revisitLine(undefined)).toEqual(lineFor('welcome'));
  expect(revisitLine('sandwich').text).toBe('I remember your cheese sandwich.');
});
