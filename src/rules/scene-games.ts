import {
  type SceneLevel,
  type SceneObject,
  type ScenePlace,
  type SceneTask,
  sceneLevel,
} from '../content/scene-levels';
export interface SceneAttempt {
  id: string;
  round: number;
  target: string;
  dimension: 'memory' | 'listening' | 'meaning' | 'operation';
  result: boolean;
  support: string[];
  heard: boolean;
}
export interface SceneState {
  version: 1;
  id: string;
  levelId: string;
  seed: number;
  round: number;
  phase: 'intro' | 'meaning' | 'observe' | 'covered' | 'play' | 'feedback' | 'done';
  mode: 'task' | 'free';
  objects: SceneObject[];
  support: string[];
  carry: string[];
  heard: boolean;
  attempts: SceneAttempt[];
  nextAttempt: number;
  receipts: number[];
  undo: SceneObject[][];
  feedback: string;
  paused: boolean;
  actor: { action: string; object: string; serial: number };
}
export type SceneCommand =
  | {
      type:
        | 'start'
        | 'play'
        | 'cover'
        | 'reveal'
        | 'reobserve'
        | 'help'
        | 'undo'
        | 'deliver'
        | 'check'
        | 'next'
        | 'free';
      token?: string;
    }
  | { type: 'take'; object: string; token?: string }
  | { type: 'place'; place: ScenePlace; token?: string }
  | { type: 'operate'; action: string; object: string; token?: string }
  | { type: 'pause'; value: boolean }
  | { type: 'heard'; value: boolean };
const copy = (objects: readonly SceneObject[]) => objects.map((o) => ({ ...o }));
export const sceneTask = (s: SceneState): SceneTask => {
  const level = sceneLevel(s.levelId);
  if (!level) throw Error('Unknown scene');
  return level.tasks[s.round] ?? (level.tasks[0] as SceneTask);
};
export const createScene = (level: SceneLevel, id: string, seed: number): SceneState => ({
  version: 1,
  id,
  levelId: level.id,
  seed,
  round: 0,
  phase: 'intro',
  mode: 'task',
  objects: copy(level.tasks[0]?.objects ?? []),
  support: [],
  carry: [],
  heard: false,
  attempts: [],
  nextAttempt: 0,
  receipts: [],
  undo: [],
  feedback: '',
  paused: false,
  actor: { action: 'idle', object: '', serial: 0 },
});
const addSupport = (s: SceneState, id: string): SceneState => ({
  ...s,
  support: [...new Set([...s.support, id])],
  carry: [...new Set([...s.carry, id])],
});
export function sceneSolved(task: SceneTask, s: SceneState): boolean {
  const kind = sceneLevel(s.levelId)?.kind;
  if (kind === 'hunt')
    return (task.targets ?? []).every(
      (id) => s.objects.find((o) => o.id === id)?.place === 'basket',
    );
  if (kind === 'memory')
    return (
      (task.missing ?? []).every((id) => s.objects.find((o) => o.id === id)?.place === 'table') &&
      s.objects
        .filter((o) => o.place === 'table')
        .every((o) => task.objects.find((base) => base.id === o.id)?.place === 'table')
    );
  if (kind === 'sort') return s.objects.every((o) => task.legal?.[o.id]?.includes(o.place));
  if (kind === 'design')
    return (task.arrangement ?? []).every((goal) => {
      const items = s.objects.filter((o) => o.place === goal.place);
      return (
        (!goal.reference || s.objects.find((o) => o.id === goal.reference)?.place === 'on') &&
        items.filter(
          (o) =>
            (!goal.id || o.id === goal.id) &&
            (!goal.word || o.word === goal.word) &&
            (!goal.color || o.color === goal.color) &&
            (!goal.size || o.size === goal.size),
        ).length === goal.count &&
        items.every((o) =>
          (task.arrangement ?? []).some(
            (g) =>
              g.place === o.place &&
              (!g.id || o.id === g.id) &&
              (!g.word || o.word === g.word) &&
              (!g.color || o.color === g.color) &&
              (!g.size || o.size === g.size),
          ),
        )
      );
    });
  const o = s.objects.find((o) => o.id === task.goal?.object);
  return (
    !!o &&
    (!task.goal?.state ||
      o.state === task.goal.state ||
      (task.goal.state === 'filled' && o.state === 'stirred')) &&
    (!task.goal?.place || o.place === task.goal.place)
  );
}
function changed(
  s: SceneState,
  objects: SceneObject[],
  action: string,
  object: string,
): SceneState {
  return {
    ...s,
    objects,
    undo: [...s.undo, copy(s.objects)].slice(-12),
    feedback: '',
    actor: { action, object, serial: s.actor.serial + 1 },
  };
}
const placed = (s: SceneState) => s.objects.find((o) => o.place === 'hand');
const places: ScenePlace[] = [
  'bank',
  'hand',
  'basket',
  'table',
  'shelf',
  'garden',
  'kitchen',
  'on',
  'under',
  'in',
  'beside',
  'box',
  'sink',
  'board',
  'patio',
  'guest',
];
const allowedPlaces = (kind: string): readonly ScenePlace[] =>
  kind === 'sort'
    ? ['bank', 'shelf', 'garden', 'kitchen', 'basket']
    : kind === 'design'
      ? ['bank', 'on', 'under', 'in', 'beside']
      : kind === 'theatre'
        ? ['bank', 'on', 'under', 'in', 'beside', 'sink', 'board', 'patio']
        : kind === 'memory'
          ? ['bank', 'table']
          : ['bank'];
export function sceneCommand(s: SceneState, c: SceneCommand): SceneState {
  const level = sceneLevel(s.levelId);
  if (!level) return s;
  if (c.type === 'pause') return { ...s, paused: c.value };
  if (s.paused) return s;
  if (c.type === 'heard')
    return c.value
      ? { ...s, heard: true }
      : addSupport({ ...s, heard: false }, 'audio-unavailable');
  if ('token' in c && c.token && c.token !== `${s.id}:${s.round}`) return s;
  if (c.type === 'start')
    return s.phase === 'intro'
      ? {
          ...addSupport(s, 'meaning-picture'),
          phase: level.kind === 'memory' ? 'observe' : 'play',
        }
      : s;
  if (c.type === 'help')
    return addSupport({ ...s, feedback: '看看图示和动作，再自己试试。' }, 'answer-help');
  if (c.type === 'free')
    return level.kind === 'design'
      ? {
          ...s,
          mode: 'free',
          phase: 'play',
          support: [...s.carry],
          receipts: [],
          feedback: '自由布置没有标准答案。',
        }
      : s;
  if (c.type === 'play')
    return s.phase === 'meaning'
      ? {
          ...addSupport(s, 'meaning-picture'),
          phase: level.kind === 'memory' ? 'observe' : 'play',
          heard: false,
          feedback: '',
        }
      : s;
  if (c.type === 'cover')
    return s.phase === 'observe' ? { ...s, phase: 'covered', undo: [], feedback: '' } : s;
  if (c.type === 'reveal') {
    if (s.phase !== 'covered') return s;
    const missing = sceneTask(s).missing ?? [];
    return {
      ...s,
      phase: 'play',
      objects: s.objects.map((o) => ({ ...o, place: missing.includes(o.id) ? 'bank' : o.place })),
      undo: [],
      feedback: '',
    };
  }
  if (c.type === 'reobserve' && level.kind === 'memory' && s.phase === 'play')
    return {
      ...addSupport(s, 'memory-relook'),
      phase: 'observe',
      objects: copy(sceneTask(s).objects),
      undo: [],
    };
  if (c.type === 'next') {
    if (s.phase !== 'feedback') return s;
    if (s.round === level.tasks.length - 1) return { ...s, phase: 'done' };
    const next = s.round + 1;
    return {
      ...s,
      round: next,
      phase: level.kind === 'memory' ? 'observe' : 'play',
      objects: level.kind === 'theatre' ? s.objects : copy(level.tasks[next]?.objects ?? []),
      support: [...new Set([...s.carry, 'meaning-picture'])],
      heard: false,
      undo: [],
      feedback: '',
      actor: { action: 'idle', object: '', serial: s.actor.serial },
    };
  }
  if (s.phase !== 'play') return s;
  if (c.type === 'undo') {
    const skipTake =
      !!s.undo.at(-1)?.some((o) => o.place === 'hand') && !placed(s) && s.undo.length >= 2;
    const count = skipTake ? 2 : 1;
    const objects = s.undo.at(-count);
    return objects
      ? { ...s, objects: copy(objects), undo: s.undo.slice(0, -count), feedback: '' }
      : s;
  }
  if (c.type === 'take') {
    const o = s.objects.find((o) => o.id === c.object);
    if (!o || o.place === 'hand') return s;
    if (o.place === 'box' && s.objects.find((o) => o.id === 'box')?.state !== 'open')
      return { ...s, feedback: '盒子还关着，先打开盒子。' };
    if (o.place === 'guest') return { ...s, feedback: '已经分享给朋友了。' };
    const held = placed(s);
    if (held) return { ...s, feedback: '手里还有一件，先放下或撤回。' };
    return changed(
      s,
      s.objects.map((x) => (x.id === o.id ? { ...x, place: 'hand' } : x)),
      'take',
      o.id,
    );
  }
  if (c.type === 'place') {
    const held = placed(s);
    if (!held || !allowedPlaces(level.kind).includes(c.place)) return s;
    return changed(
      s,
      s.objects.map((x) => (x.id === held.id ? { ...x, place: c.place } : x)),
      'put',
      held.id,
    );
  }
  if (c.type === 'operate') {
    if (level.kind !== 'theatre') return s;
    const o = s.objects.find((o) => o.id === c.object),
      held = placed(s);
    if (!o) return s;
    let state = o.state,
      place = o.place,
      valid = false;
    if (c.action === 'open' || c.action === 'close') {
      valid =
        ['box', 'door', 'drawer', 'book', 'basket'].includes(o.word) &&
        o.state !== (c.action === 'open' ? 'open' : 'closed');
      state = c.action === 'open' ? 'open' : 'closed';
    } else if (c.action === 'pour') {
      valid =
        held?.word === 'jug' &&
        held.state === 'filled' &&
        o.word === 'cup' &&
        o.place === 'on' &&
        o.state === 'empty';
      state = 'filled';
    } else if (c.action === 'stir') {
      valid =
        held?.word === 'spoon' && o.word === 'cup' && o.place === 'on' && o.state === 'filled';
      state = 'stirred';
    } else if (c.action === 'wash') {
      valid = o.word === 'bowl' && o.place === 'sink' && o.state === 'dirty';
      state = 'clean';
    } else if (c.action === 'cut') {
      valid =
        held?.word === 'knife' && o.word === 'apple' && o.place === 'board' && o.state === 'whole';
      state = 'cut';
    } else if (c.action === 'carry') {
      valid = o.word === 'basket' && o.place !== 'patio' && o.state === 'open';
      place = 'patio';
    } else if (c.action === 'share') {
      valid =
        o.word === 'apple' &&
        o.state === 'cut' &&
        s.objects.some((x) => x.word === 'basket' && x.place === 'patio') &&
        o.place !== 'guest';
      place = 'guest';
    }
    if (!valid) return { ...s, feedback: '物件还没准备好。看看它的位置、手里的工具或是否打开。' };
    return changed(
      s,
      s.objects.map((x) => (x.id === o.id ? { ...x, state, place } : x)),
      c.action,
      o.id,
    );
  }
  if (c.type === 'deliver' && level.kind === 'hunt') {
    const held = placed(s);
    if (!held) return { ...s, feedback: '先拿起一件，再交给篮子。' };
    const task = sceneTask(s),
      correct = task.targets?.includes(held.id) ?? false;
    const next = correct
      ? changed(
          s,
          s.objects.map((o) => (o.id === held.id ? { ...o, place: 'basket' } : o)),
          'deliver',
          held.id,
        )
      : s;
    return attempted(
      next,
      correct,
      correct ? '继续找下一件。' : '这件和请求不同，可以放回。',
      correct && !sceneSolved(task, next),
    );
  }
  if (c.type === 'check') {
    if (s.mode === 'free') return { ...s, feedback: '你的餐桌留下来了，还可以接着摆。' };
    const task = sceneTask(s);
    // An unfinished arrangement is an operation condition, not a language error.
    if (level.kind === 'sort' && s.objects.some((o) => o.place === 'bank' || o.place === 'hand'))
      return { ...s, feedback: '还有物件没归位，可以继续摆。' };
    if (level.kind === 'theatre' && !sceneSolved(task, s))
      return { ...s, feedback: '动作还没有做到，看看物件状态再试。' };
    return attempted(s, sceneSolved(task, s), '可以再看一看，撤回或请大咪演示。');
  }
  return s;
}
function attempted(s: SceneState, result: boolean, feedback: string, partial = false): SceneState {
  const level = sceneLevel(s.levelId),
    task = sceneTask(s);
  const dimension =
    level?.kind === 'memory'
      ? 'memory'
      : level?.kind === 'theatre'
        ? 'operation'
        : level?.kind === 'sort'
          ? 'meaning'
          : 'listening';
  const support = [...new Set([...s.support, ...(!s.heard ? ['audio-not-observed'] : [])])];
  const attempt: SceneAttempt = {
    id: `${s.id}:${s.nextAttempt}`,
    round: s.round,
    target: task.words.join('|'),
    dimension,
    result,
    support,
    heard: s.heard,
  };
  return {
    ...s,
    phase: result && !partial ? 'feedback' : 'play',
    feedback: partial ? feedback : result ? '物件到位了！' : feedback,
    attempts: [...s.attempts, attempt].slice(-64),
    nextAttempt: s.nextAttempt + 1,
    receipts: result && !partial ? [...new Set([...s.receipts, s.round])] : s.receipts,
    support: result ? s.support : [...new Set([...s.support, 'difference-feedback'])],
  };
}
export function replayScene(s: SceneState, id: string): SceneState {
  const level = sceneLevel(s.levelId);
  if (!level) return s;
  return {
    ...createScene(level, id, s.seed),
    carry: [...new Set([...s.carry, ...s.support, ...s.attempts.flatMap((a) => a.support)])],
    support: [...new Set([...s.carry, ...s.support, ...s.attempts.flatMap((a) => a.support)])],
  };
}
export function validateScene(value: unknown): value is SceneState {
  if (!value || typeof value !== 'object') return false;
  const s = value as SceneState,
    level = sceneLevel(s.levelId);
  if (!level) return false;
  const strings = (a: unknown, max: number): a is string[] =>
    Array.isArray(a) &&
    a.length <= max &&
    a.every((v) => typeof v === 'string' && v.length <= 160) &&
    new Set(a).size === a.length;
  if (
    s.version !== 1 ||
    typeof s.id !== 'string' ||
    s.id.length > 100 ||
    !Number.isInteger(s.seed) ||
    s.seed < 0 ||
    s.seed > 4294967295 ||
    !Number.isInteger(s.round) ||
    s.round < 0 ||
    s.round >= level.tasks.length ||
    !['intro', 'meaning', 'observe', 'covered', 'play', 'feedback', 'done'].includes(s.phase) ||
    !['task', 'free'].includes(s.mode) ||
    (s.mode === 'free' && level.kind !== 'design') ||
    (['observe', 'covered'].includes(s.phase) && level.kind !== 'memory') ||
    !strings(s.support, 24) ||
    !strings(s.carry, 24) ||
    typeof s.heard !== 'boolean' ||
    typeof s.paused !== 'boolean' ||
    typeof s.feedback !== 'string' ||
    s.feedback.length > 240
  )
    return false;
  const base = level.kind === 'theatre' ? level.tasks[0]?.objects : level.tasks[s.round]?.objects;
  const objects = (a: unknown): a is SceneObject[] =>
    Array.isArray(a) &&
    a.length === base?.length &&
    new Set(a.map((o) => o?.id)).size === a.length &&
    a.filter((o) => o?.place === 'hand').length <= 1 &&
    a.every(
      (o) =>
        o &&
        base?.some(
          (b) => b.id === o.id && b.word === o.word && b.color === o.color && b.size === o.size,
        ) &&
        places.includes(o.place) &&
        ['whole', 'open', 'closed', 'empty', 'filled', 'stirred', 'dirty', 'clean', 'cut'].includes(
          o.state,
        ),
    );
  if (
    !objects(s.objects) ||
    !Array.isArray(s.undo) ||
    s.undo.length > 12 ||
    !s.undo.every(objects) ||
    !s.actor ||
    typeof s.actor.action !== 'string' ||
    s.actor.action.length > 30 ||
    typeof s.actor.object !== 'string' ||
    (!s.objects.some((o) => o.id === s.actor.object) && s.actor.object !== '') ||
    !Number.isInteger(s.actor.serial) ||
    s.actor.serial < 0 ||
    s.actor.serial > 1e7
  )
    return false;
  if (
    !Array.isArray(s.receipts) ||
    s.receipts.length > level.tasks.length ||
    new Set(s.receipts).size !== s.receipts.length ||
    s.receipts.some((n) => !Number.isInteger(n) || n < 0 || n > s.round) ||
    !Array.isArray(s.attempts) ||
    s.attempts.length > 64 ||
    !Number.isInteger(s.nextAttempt) ||
    s.nextAttempt < s.attempts.length ||
    s.nextAttempt > 1e7
  )
    return false;
  if (
    s.attempts.some(
      (a) =>
        !a ||
        typeof a.id !== 'string' ||
        a.id.length > 160 ||
        !Number.isInteger(a.round) ||
        a.round < 0 ||
        a.round > s.round ||
        a.target !== level.tasks[a.round]?.words.join('|') ||
        !['memory', 'listening', 'meaning', 'operation'].includes(a.dimension) ||
        typeof a.result !== 'boolean' ||
        !strings(a.support, 24) ||
        typeof a.heard !== 'boolean',
    ) ||
    new Set(s.attempts.map((a) => a.id)).size !== s.attempts.length
  )
    return false;
  if (
    s.mode === 'task' &&
    ['feedback', 'done'].includes(s.phase) &&
    (!s.receipts.includes(s.round) || !sceneSolved(sceneTask(s), s))
  )
    return false;
  if (
    s.mode === 'task' &&
    Array.from({ length: s.round }, (_, i) => i).some((i) => !s.receipts.includes(i))
  )
    return false;
  return s.phase !== 'done' || s.receipts.length === level.tasks.length;
}
