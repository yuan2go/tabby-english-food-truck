import { expect, it } from 'vitest';
import { MINI_LEVELS } from '../src/content/mini-levels';
import { sceneLevel } from '../src/content/scene-levels';
import { COURSE_KEY, MiniStore, SCENE_KEY } from '../src/platform/minis';
import { createCourse, replayCourse, startCourse } from '../src/rules/mini-course';
import { createScene, sceneCommand, validateScene } from '../src/rules/scene-games';

const level = sceneLevel('hunt-0');
if (!level) throw Error('hunt');
it('refresh preserves held objects, help, seed and old course progress without awarding new content', () => {
  const data = new Map<string, string>();
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
  const original = new MiniStore(() => storage);
  const old = MINI_LEVELS[0];
  if (!old) throw Error('old');
  original.saveCourse(startCourse(createCourse(old, 'old')));
  let s = createScene(level, 'new', 4);
  s = sceneCommand(s, { type: 'start' });
  s = sceneCommand(s, { type: 'play' });
  s = sceneCommand(s, { type: 'help' });
  s = sceneCommand(s, { type: 'take', object: 'cup' });
  original.saveScene(s);
  const restored = new MiniStore(() => storage);
  expect(restored.scenes['hunt-0']?.objects.find((o) => o.id === 'cup')?.place).toBe('hand');
  expect(restored.scenes['hunt-0']?.support).toContain('answer-help');
  expect(restored.scenes['hunt-0']?.seed).toBe(4);
  expect(restored.completedScenes).toEqual([]);
  expect(restored.courses[old.id]?.phase).toBe('meaning');
  expect(data.has(COURSE_KEY)).toBe(true);
});
it('protects a future scene raw while legacy courses remain writable', () => {
  const raw = '{"version":999,"scenes":{},"completed":[]}';
  const data = new Map([[SCENE_KEY, raw]]);
  const storage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
    removeItem: () => {},
  };
  const store = new MiniStore(() => storage);
  store.saveScene(createScene(level, 'temporary', 5));
  expect(store.sceneBlocked).toBe(true);
  expect(data.get(SCENE_KEY)).toBe(raw);
  expect(store.export().protectedSceneRaw).toBe(raw);
  const old = MINI_LEVELS[0];
  if (!old) throw Error('old');
  store.saveCourse(createCourse(old, 'old'));
  expect(data.has(COURSE_KEY)).toBe(true);
  expect(data.get(SCENE_KEY)).toBe(raw);
});
it('keeps refusal progress in memory and retries without changing a target', () => {
  let refused = true;
  const data = new Map<string, string>();
  const store = new MiniStore(() => ({
    getItem: () => null,
    setItem: (k, v) => {
      if (refused) throw Error('quota');
      data.set(k, v);
    },
    removeItem: () => {},
  }));
  store.saveScene(createScene(level, 'run', 9));
  expect(store.scenes['hunt-0']?.seed).toBe(9);
  expect(store.issue).toContain('内存');
  refused = false;
  store.retryScenes();
  expect(store.issue).toBe('');
  expect(JSON.parse(data.get(SCENE_KEY) ?? '{}').scenes['hunt-0'].seed).toBe(9);
});
it('cannot wash course help through restart or the meaning phase', () => {
  const l = MINI_LEVELS[0];
  if (!l) throw Error('course');
  const old = { ...createCourse(l, 'old'), support: ['answer-help'] };
  const fresh = startCourse(replayCourse(l, old, 'replay'));
  expect(fresh.support).toContain('answer-help');
});
it('pauses input and rejects forged completion or a stale round command', () => {
  let s = sceneCommand(createScene(level, 'run', 9), { type: 'start' });
  s = sceneCommand(s, { type: 'play' });
  s = sceneCommand(s, { type: 'pause', value: true });
  expect(sceneCommand(s, { type: 'take', object: 'cup' })).toEqual(s);
  expect(validateScene({ ...s, phase: 'done' })).toBe(false);
  s = sceneCommand(s, { type: 'pause', value: false });
  s = sceneCommand(s, { type: 'take', object: 'cup' });
  s = sceneCommand(s, { type: 'deliver' });
  s = sceneCommand(s, { type: 'next' });
  expect(sceneCommand(s, { type: 'deliver', token: 'run:0' })).toEqual(s);
});

it('quantity composition judges actual content and count regardless of placement order', async () => {
  const { miniLevel } = await import('../src/content/mini-levels');
  const { composeCourse, submitCourse, playCourse, quantityProducts } = await import(
    '../src/rules/mini-course'
  );
  const l = miniLevel('quantity-fruit-mix');
  if (!l) throw Error('quantity');
  let s = playCourse(startCourse(createCourse(l, 'composition')));
  expect(quantityProducts(l, s)).toContain('apple');
  s = composeCourse(l, s, 'banana');
  s = composeCourse(l, s, 'apple');
  s = submitCourse(l, s);
  expect(s.phase).toBe('feedback');
  expect(s.attempts[0]?.task).toBe(true);
  expect(composeCourse(l, s, 'apple')).toEqual(s);
  let wrong = playCourse(startCourse(createCourse(l, 'count')));
  wrong = composeCourse(l, wrong, 'apple');
  wrong = composeCourse(l, wrong, 'apple');
  wrong = submitCourse(l, wrong);
  expect(wrong.phase).toBe('play');
  expect(wrong.attempts[0]?.task).toBe(false);
});
it('support survives bounded attempt history and later rounds', async () => {
  const { playCourse, submitCourse, nextCourse } = await import('../src/rules/mini-course');
  const l = MINI_LEVELS[0];
  if (!l) throw Error('level');
  let s = playCourse(startCourse(createCourse(l, 'supported')));
  s = { ...s, support: [...s.support, 'answer-help'] };
  s = submitCourse(l, s, l.targets[0]);
  s = playCourse(nextCourse(l, s));
  const wrong = l.pool.find((id) => id !== l.targets[1]);
  if (!wrong) throw Error('wrong');
  for (let i = 0; i < 70; i++) s = submitCourse(l, s, wrong);
  expect(replayCourse(l, s, 'again').support).toContain('answer-help');
});
it('all vocabulary courses with repeated attempts can be saved and restored', async () => {
  const { VOCAB_COURSES } = await import('../src/content/vocabulary-courses');
  const { playCourse, submitCourse, nextCourse, coursePool, courseTarget } = await import(
    '../src/rules/mini-course'
  );
  const data = new Map<string, string>();
  const storage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
    removeItem: () => {},
  };
  const store = new MiniStore(() => storage);
  for (const l of VOCAB_COURSES) {
    let s = startCourse(createCourse(l, l.id));
    while (s.phase !== 'done') {
      s = playCourse(s);
      const wrong = coursePool(l, s).find(
        (id) => id !== courseTarget(l, s) && !s.used.includes(id),
      );
      if (wrong) for (let i = 0; i < 6; i++) s = submitCourse(l, s, wrong);
      s = submitCourse(l, s, courseTarget(l, s));
      s = nextCourse(l, s);
    }
    store.saveCourse(s);
  }
  const restored = new MiniStore(() => storage);
  expect(restored.courseBlocked).toBe(false);
  expect(Object.keys(restored.courses)).toHaveLength(VOCAB_COURSES.length);
});
it('paused courses reject queued phase changes as well as submissions', async () => {
  const { playCourse, nextCourse, submitCourse } = await import('../src/rules/mini-course');
  const l = MINI_LEVELS[0];
  if (!l) throw Error('level');
  const intro = { ...createCourse(l, 'paused'), paused: true };
  expect(startCourse(intro)).toEqual(intro);
  const meaning = { ...startCourse({ ...intro, paused: false }), paused: true };
  expect(playCourse(meaning)).toEqual(meaning);
  const success = {
    ...submitCourse(l, playCourse({ ...meaning, paused: false }), l.targets[0]),
    paused: true,
  };
  expect(nextCourse(l, success)).toEqual(success);
});
