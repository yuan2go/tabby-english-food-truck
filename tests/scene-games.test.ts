import { describe, expect, it } from 'vitest';
import { sceneLevel } from '../src/content/scene-levels';
import {
  createScene,
  replayScene,
  sceneCommand,
  sceneTask,
  validateScene,
} from '../src/rules/scene-games';

const open = (id: string) => {
  const level = sceneLevel(id);
  if (!level) throw Error(id);
  return sceneCommand(createScene(level, 'run', 7), { type: 'start' });
};
const act = (s: ReturnType<typeof open>, command: Parameters<typeof sceneCommand>[1]) =>
  sceneCommand(s, command);
const play = (id: string) => act(open(id), { type: 'play' });
describe('five scene mechanics preserve actual objects and learning boundaries', () => {
  it('hunt requires picking up then explicitly delivering; rejects duplicate round input', () => {
    let s = play('hunt-0');
    s = act(s, { type: 'deliver' });
    expect(s.attempts).toHaveLength(0);
    s = act(s, { type: 'take', object: 'cup' });
    expect(s.objects.find((o) => o.id === 'cup')?.place).toBe('hand');
    s = act(s, { type: 'deliver', token: 'run:0' });
    expect(s.phase).toBe('feedback');
    expect(s.objects.find((o) => o.id === 'cup')?.place).toBe('basket');
    expect(act(s, { type: 'deliver', token: 'run:0' })).toEqual(s);
    expect(s.attempts[0]?.support).toContain('audio-not-observed');
  });
  it('memory can be reobserved and mistakes affect memory, not listening', () => {
    let s = play('memory-0');
    expect(s.phase).toBe('observe');
    s = act(s, { type: 'cover' });
    s = act(s, { type: 'reveal' });
    expect(s.phase).toBe('play');
    s = act(s, { type: 'take', object: 'spoon' });
    s = act(s, { type: 'place', place: 'table' });
    s = act(s, { type: 'check' });
    expect(s.attempts[0]?.dimension).toBe('memory');
    expect(s.attempts[0]?.result).toBe(false);
    s = act(s, { type: 'reobserve' });
    expect(s.support).toContain('memory-relook');
    expect(s.phase).toBe('observe');
  });
  it('sorting accepts declared multiple uses and keeps unplaced objects recoverable', () => {
    let s = play('sort-1');
    s = act(s, { type: 'take', object: 'basket' });
    s = act(s, { type: 'place', place: 'garden' });
    expect(s.objects.find((o) => o.id === 'basket')?.place).toBe('garden');
    s = act(s, { type: 'check' });
    expect(s.phase).toBe('play');
    expect(s.feedback).toContain('还');
    s = act(s, { type: 'undo' });
    expect(s.objects.find((o) => o.id === 'basket')?.place).toBe('bank');
  });
  it('designer evaluates actual relative position and distinguishes free creation', () => {
    let s = play('design-0');
    s = act(s, { type: 'take', object: 'cup' });
    s = act(s, { type: 'place', place: 'under' });
    s = act(s, { type: 'check' });
    expect(s.attempts[0]?.result).toBe(false);
    s = act(s, { type: 'take', object: 'cup' });
    s = act(s, { type: 'place', place: 'on' });
    s = act(s, { type: 'check' });
    expect(s.phase).toBe('feedback');
    let free = act(open('design-0'), { type: 'free' });
    free = act(free, { type: 'take', object: 'cup' });
    free = act(free, { type: 'place', place: 'under' });
    free = act(free, { type: 'check' });
    expect(free.phase).toBe('play');
    expect(free.attempts).toHaveLength(0);
    expect(free.mode).toBe('free');
  });
  it('theatre uses state preconditions, not a fixed animation or word ordering', () => {
    let s = play('theatre-0');
    s = act(s, { type: 'take', object: 'ball' });
    expect(s.objects.find((o) => o.id === 'ball')?.place).toBe('box');
    expect(s.attempts).toHaveLength(0);
    s = act(s, { type: 'operate', action: 'open', object: 'box' });
    s = act(s, { type: 'check' });
    expect(s.phase).toBe('feedback');
    s = act(s, { type: 'next' });
    expect(s.objects.find((o) => o.id === 'box')?.state).toBe('open');
    s = act(s, { type: 'take', object: 'ball' });
    s = act(s, { type: 'check' });
    expect(s.phase).toBe('feedback');
  });
  it('pour requires a held vessel and a positioned cup; stir requires liquid and spoon', () => {
    let s = play('theatre-1');
    s = act(s, { type: 'operate', action: 'pour', object: 'cup' });
    expect(s.objects.find((o) => o.id === 'cup')?.state).toBe('empty');
    s = act(s, { type: 'take', object: 'cup' });
    s = act(s, { type: 'place', place: 'on' });
    s = act(s, { type: 'take', object: 'jug' });
    s = act(s, { type: 'operate', action: 'pour', object: 'cup' });
    expect(s.objects.find((o) => o.id === 'cup')?.state).toBe('filled');
    s = act(s, { type: 'operate', action: 'stir', object: 'cup' });
    expect(s.objects.find((o) => o.id === 'cup')?.state).toBe('filled');
    s = act(s, { type: 'place', place: 'on' });
    s = act(s, { type: 'take', object: 'spoon' });
    s = act(s, { type: 'operate', action: 'stir', object: 'cup' });
    expect(s.objects.find((o) => o.id === 'cup')?.state).toBe('stirred');
  });
  it('restore validates single ownership and does not refresh answers or remove help', () => {
    let s = act(play('hunt-0'), { type: 'help' });
    s = act(s, { type: 'take', object: 'cup' });
    const saved = JSON.parse(JSON.stringify(s));
    expect(validateScene(saved)).toBe(true);
    expect(sceneTask(saved).instruction).toBe('Bring me a cup, please.');
    expect(validateScene({ ...saved, objects: [...saved.objects, saved.objects[0]] })).toBe(false);
    const replay = replayScene(s, 'again');
    expect(replay.support).toContain('answer-help');
    expect(replay.phase).toBe('intro');
    expect(replay.receipts).toEqual([]);
  });
});

it('records each actual hunt handoff while a two-object goal remains incomplete', () => {
  let s = play('hunt-2');
  s = act(s, { type: 'take', object: 'cup' });
  s = act(s, { type: 'deliver' });
  expect(s.phase).toBe('play');
  expect(s.attempts).toHaveLength(1);
  expect(s.attempts[0]?.result).toBe(true);
  s = act(s, { type: 'take', object: 'bowl' });
  s = act(s, { type: 'deliver' });
  expect(s.objects.find((o) => o.id === 'bowl')?.place).toBe('hand');
  expect(s.attempts.at(-1)?.result).toBe(false);
});
it('memory has an explicit covered stage and waits for the player to reveal it', () => {
  let s = play('memory-0');
  s = act(s, { type: 'cover' });
  expect(s.phase).toBe('covered');
  expect(act(s, { type: 'take', object: 'cup' })).toEqual(s);
  s = act(s, { type: 'reveal' });
  expect(s.phase).toBe('play');
  expect(s.objects.find((o) => o.id === 'cup')?.place).toBe('bank');
});
it('early theatre actions remain reachable at subsequent confirmations', () => {
  let s = play('theatre-1');
  s = act(s, { type: 'take', object: 'cup' });
  s = act(s, { type: 'place', place: 'on' });
  s = act(s, { type: 'take', object: 'jug' });
  s = act(s, { type: 'operate', action: 'pour', object: 'cup' });
  s = act(s, { type: 'place', place: 'on' });
  s = act(s, { type: 'take', object: 'spoon' });
  s = act(s, { type: 'operate', action: 'stir', object: 'cup' });
  s = act(s, { type: 'check' });
  s = act(s, { type: 'next' });
  s = act(s, { type: 'check' });
  expect(s.phase).toBe('feedback');
  s = act(s, { type: 'next' });
  s = act(s, { type: 'check' });
  expect(s.phase).toBe('feedback');
});
it('beside plate needs the plate to remain on the table', () => {
  let s = play('design-2');
  for (const id of ['red-cup', 'big-bowl']) {
    s = act(s, { type: 'take', object: id });
    s = act(s, { type: 'place', place: 'on' });
    s = act(s, { type: 'check' });
    s = act(s, { type: 'next' });
    s = act(s, { type: 'play' });
  }
  s = act(s, { type: 'take', object: 'plate' });
  s = act(s, { type: 'place', place: 'under' });
  s = act(s, { type: 'take', object: 'white-cup' });
  s = act(s, { type: 'place', place: 'beside' });
  s = act(s, { type: 'check' });
  expect(s.phase).toBe('play');
  s = act(s, { type: 'take', object: 'plate' });
  s = act(s, { type: 'place', place: 'on' });
  s = act(s, { type: 'check' });
  expect(s.phase).toBe('feedback');
});
