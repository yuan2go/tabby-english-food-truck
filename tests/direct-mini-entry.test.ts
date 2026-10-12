import { expect, test } from 'vitest';
import { ALL_MINI_LEVELS } from '../src/content/mini-levels';
import { SCENE_LEVELS } from '../src/content/scene-levels';
import { createCourse, enterCourse } from '../src/rules/mini-course';
import { createScene, sceneCommand } from '../src/rules/scene-games';

test('scene start immediately makes the physical scene operable without fabricating attempts', () => {
  const level = SCENE_LEVELS.find((l) => l.kind === 'hunt');
  if (!level) throw Error('hunt level');
  const s = sceneCommand(createScene(level, 'direct-mini', 1), { type: 'start' });
  expect(s.phase).toBe('play');
  expect(s.objects).toEqual(level.tasks[0]?.objects);
  expect(s.attempts).toEqual([]);
  expect(s.support).toContain('meaning-demonstration');
});
test('a course enters its playable task with its meaning pictures accounted for', () => {
  const level = ALL_MINI_LEVELS[0];
  if (!level) throw Error('course');
  const s = enterCourse(createCourse(level, 'direct-course'));
  expect(s.phase).toBe('play');
  expect(s.support).toContain('meaning-picture');
  expect(s.attempts).toEqual([]);
});
test('memory still has a real observation stage and only a player cover hides the objects', () => {
  const level = SCENE_LEVELS.find((l) => l.kind === 'memory');
  if (!level) throw Error('memory level');
  const s = sceneCommand(createScene(level, 'memory', 1), { type: 'start' });
  expect(s.phase).toBe('observe');
  expect(sceneCommand(s, { type: 'cover' }).phase).toBe('covered');
});
