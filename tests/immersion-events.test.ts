import { expect, it } from 'vitest';
import { emptyAdventure } from '../src/content/adventure';
import { actionPrompt, dialogueEvents } from '../src/platform/dialogue';
import { startAdventure } from '../src/rules/adventure';
import { advance, createGame, dispatch } from '../src/rules/game';

it('delivery submission does not thank or taste; receipt alone thanks without changing rules', () => {
  let s = createGame('immersion');
  startAdventure(s, 0);
  const cmd = (command: Parameters<typeof dispatch>[1]['command']) => {
    const before = s;
    s = dispatch(s, { id: `c${s.revision}`, runId: s.runId, command }).state;
    return dialogueEvents(before, s);
  };
  cmd({ type: 'move', source: { supply: 'apple' }, destination: { tray: 0 } });
  expect(
    cmd({ type: 'deliver', tray: 0, order: s.orders[0]?.id ?? '' }).some(
      (e) => e.line.audio === 'imm-thanks',
    ),
  ).toBe(false);
  let receipt = false;
  for (let n = 0; n < 150; n++) {
    const old = s;
    s = advance(s, 100);
    const events = dialogueEvents(old, s);
    if (events.some((e) => e.line.audio === 'imm-thanks')) receipt = true;
    expect(events.some((e) => e.line.audio === 'imm-taste')).toBe(false);
  }
  expect(receipt).toBe(true);
});
it('yard prompts follow prerequisites and successful differences only', () => {
  const old = createGame('yard');
  old.adventure = emptyAdventure(0);
  expect(actionPrompt(old)?.audio).not.toBe('imm-drawer');
  old.adventure.steps.push('served:rabbit');
  expect(actionPrompt(old)?.audio).toBe('imm-drawer');
  const opened = dispatch(old, {
    id: 'open',
    runId: old.runId,
    command: { type: 'adventure', action: 'explore', object: 'drawer' },
  }).state;
  expect(dialogueEvents(old, opened).map((e) => e.line.audio)).toContain('imm-found-flower');
  expect(actionPrompt(opened)?.audio).toBe('imm-plant');
  const repeated = dispatch(opened, {
    id: 'repeat',
    runId: opened.runId,
    command: { type: 'adventure', action: 'explore', object: 'drawer' },
  }).state;
  expect(dialogueEvents(opened, repeated)).toEqual([]);
  opened.adventure?.foods.push({
    id: 'apple',
    product: 'apple',
    source: 'create:1',
    place: 'work',
    tasted: false,
  });
  const tasted = structuredClone(opened);
  if (tasted.adventure?.foods[0]) tasted.adventure.foods[0].tasted = true;
  expect(dialogueEvents(opened, tasted).map((e) => e.line.audio)).toContain('imm-taste');
});
it('preparation instructions describe available objects before the action rather than an order answer', async () => {
  const { preparationLine } = await import('../src/platform/dialogue');
  const s = createGame('prep');
  expect(preparationLine(s, 'machine')?.audio).toBe('imm-cup');
  s.items.push({ id: 'cup', product: 'cup', location: 'machine:cup' });
  expect(preparationLine(s, 'machine')?.audio).toBe('imm-fruit');
  s.items.push({ id: 'apple', product: 'apple', location: 'machine:apple' });
  expect(preparationLine(s, 'machine')?.audio).toBe('imm-start');
});
