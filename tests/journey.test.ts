import { expect, it } from 'vitest';
import { preparationCue } from '../src/game/flow';
import { chapterJourney, continueLevel } from '../src/game/journey';
import { advance, createGame, dispatch } from '../src/rules/game';
import { configureSession } from '../src/rules/sessions';

const fresh = () =>
  configureSession(
    createGame('journey'),
    'story',
    0,
    'pictures',
    ['juice'],
    1,
    1,
    undefined,
    undefined,
    'c1-open-door',
  );
it('a scene consequence waits for the actual food receipt, then persists after the guest leaves', () => {
  let s = fresh();
  s = dispatch(s, {
    id: 'move',
    runId: s.runId,
    command: { type: 'move', source: { supply: 'apple' }, destination: { tray: 0 } },
  }).state;
  s = dispatch(s, {
    id: 'deliver',
    runId: s.runId,
    command: { type: 'deliver', tray: 0, order: 'guest-0' },
  }).state;
  expect(chapterJourney(s, []).received).toBe(0);
  for (let n = 0; n < 250 && s.orders[0]?.status !== 'done'; n++) s = advance(s, 100);
  expect(s.orders[0]?.status).toBe('done');
  expect(chapterJourney(s, []).received).toBe(1);
  expect(chapterJourney(s, ['c1-open-door', 'c1-open-door', 'c2-cup']).completed).toBe(1);
});
it('continuing resumes an unfinished task or directly starts the next unfinished page', () => {
  const s = fresh();
  expect(continueLevel(s, []).id).toBe('c1-open-door');
  const first = s.orders[0];
  if (!first) throw Error('missing order');
  first.status = 'done';
  expect(continueLevel(s, ['c1-open-door']).id).toBe('c1-first-juice');
});
it('guidance follows physical preparation and never picks an answer ingredient', () => {
  const s = fresh();
  expect(preparationCue(s, { prep: 'tray', selectedTray: 0, selected: null }).text).toContain(
    '点食材',
  );
  s.items.push({ id: 'a', product: 'banana', location: 'tray:0:0' });
  expect(
    preparationCue(s, { prep: 'tray', selectedTray: 0, selected: { tray: 0 } }).text,
  ).toContain('点朋友');
  expect(preparationCue(s, { prep: 'tray', selectedTray: 0, selected: null }).text).not.toContain(
    '苹果',
  );
});
it('a cup by itself is not shown as a machine ready to start', () => {
  const s = fresh();
  const withCup = dispatch(s, {
    id: 'cup',
    runId: s.runId,
    command: { type: 'prepare-cup' },
  }).state;
  expect(
    preparationCue(withCup, { prep: 'machine', selectedTray: 0, selected: null }).target,
  ).not.toBe('start');
});
