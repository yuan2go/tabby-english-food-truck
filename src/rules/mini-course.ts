import { REQUESTS, type RequestId } from '../content/catalog';
import { wordById } from '../content/learning';
import { type CourseKind, type MiniLevel, miniLevel } from '../content/mini-levels';
import { parsePhrase } from '../content/phrases';
import { shuffle } from './minigames';
export interface CourseAttempt {
  id: string;
  round: number;
  target: string;
  grammar: boolean;
  task: boolean;
  support: string[];
  heard: boolean;
}
export interface CourseState {
  version: 1;
  id: string;
  levelId: string;
  round: number;
  phase: 'intro' | 'meaning' | 'play' | 'feedback' | 'done';
  selected: string[];
  used: string[];
  support: string[];
  heard: boolean;
  feedback: string;
  attempts: CourseAttempt[];
  nextAttempt: number;
}
const seedFor = (id: string, round: number) =>
  [...id].reduce((n, c) => Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0, round + 2166136261);
export const courseTarget = (level: MiniLevel, state: CourseState) =>
  level.targets[state.round] ?? level.targets[0] ?? '';
export const courseKind = (level: MiniLevel, state: CourseState): Exclude<CourseKind, 'review'> =>
  level.kind === 'review' ? (level.taskKinds?.[state.round] ?? 'listen') : level.kind;
export const coursePool = (level: MiniLevel, state: CourseState): readonly string[] =>
  level.kind === 'review' ? (level.pools?.[state.round] ?? []) : level.pool;
export const createCourse = (level: MiniLevel, id: string): CourseState => ({
  version: 1,
  id,
  levelId: level.id,
  round: 0,
  phase: 'intro',
  selected: [],
  used: [],
  support: [],
  heard: false,
  feedback: '',
  attempts: [],
  nextAttempt: 0,
});
export function startCourse(state: CourseState): CourseState {
  if (state.phase !== 'intro') return state;
  return { ...state, phase: 'meaning', selected: [], support: [], heard: false, feedback: '' };
}
export function playCourse(state: CourseState): CourseState {
  if (state.phase !== 'meaning') return state;
  return { ...state, phase: 'play', support: [...new Set([...state.support, 'meaning-picture'])] };
}
export interface Tile {
  id: string;
  text: string;
}
const sentenceModel: Record<string, string> = {
  apple: 'An apple please',
  banana: 'A banana please',
  two: 'Two apples please',
  fruit: 'An apple and a banana please',
  juice: 'Apple juice please',
  'banana-juice': 'Banana juice please',
  'vanilla-cup': 'Vanilla ice cream in a cup please',
  'vanilla-cone': 'Vanilla ice cream in a cone please',
  'strawberry-cup': 'Strawberry ice cream in a cup please',
  'double-cream': 'Two scoops of ice cream please',
  sandwich: 'A cheese sandwich please',
  'salad-sandwich': 'A lettuce and tomato sandwich please',
  burger: 'A burger with lettuce and tomato please',
  'cheese-burger': 'A cheeseburger please',
};
export function tileBank(level: MiniLevel, state: CourseState): Tile[] {
  const target = courseTarget(level, state);
  const base =
    courseKind(level, state) === 'spell'
      ? [...(wordById(target)?.text.replaceAll(' ', '').toUpperCase() ?? '')]
      : (sentenceModel[target] ?? '').split(' ').concat(['please', 'and']);
  return shuffle(
    base.map((text, index) => ({ id: `tile-${state.round}-${index}`, text })),
    seedFor(level.id, state.round),
  );
}
export function toggleTile(level: MiniLevel, state: CourseState, id: string): CourseState {
  if (
    state.phase !== 'play' ||
    !['spell', 'sentence'].includes(courseKind(level, state)) ||
    !tileBank(level, state).some((tile) => tile.id === id)
  )
    return state;
  return {
    ...state,
    selected: state.selected.includes(id)
      ? state.selected.filter((tile) => tile !== id)
      : [...state.selected, id],
    feedback: '',
  };
}
export function normalizeSentence(input: string): string {
  return input
    .toLowerCase()
    .replace(/[.,!?，。？！]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
const alternatives: Record<string, readonly string[]> = {
  juice: ['apple juice please', 'a cup of apple juice please', 'can i have apple juice please'],
  'banana-juice': [
    'banana juice please',
    'a cup of banana juice please',
    'can i have banana juice please',
  ],
  'vanilla-cup': ['vanilla ice cream in a cup please', 'a cup of vanilla ice cream please'],
  'vanilla-cone': ['vanilla ice cream in a cone please', 'a cone of vanilla ice cream please'],
  'strawberry-cup': [
    'strawberry ice cream in a cup please',
    'a cup of strawberry ice cream please',
  ],
  'double-cream': ['two scoops of ice cream please', 'two scoops vanilla and strawberry please'],
  sandwich: ['a cheese sandwich please', 'a sandwich with cheese please'],
  'salad-sandwich': [
    'a lettuce and tomato sandwich please',
    'a sandwich with lettuce and tomato please',
  ],
  burger: ['a burger with lettuce and tomato please', 'a lettuce and tomato burger please'],
  'cheese-burger': ['a cheeseburger please', 'a cheese burger please'],
};
export function judgeSentence(target: string, text: string): { grammar: boolean; task: boolean } {
  const normalized = normalizeSentence(text);
  const fruit = parsePhrase(normalized);
  if (fruit.kind === 'valid') {
    const actual = [...fruit.fruits].sort().join('|');
    const expected =
      target in REQUESTS ? [...REQUESTS[target as RequestId].products].sort().join('|') : '';
    return { grammar: true, task: actual === expected };
  }
  for (const [request, phrases] of Object.entries(alternatives))
    if (phrases.some((phrase) => normalizeSentence(phrase) === normalized))
      return { grammar: true, task: target === request };
  return { grammar: false, task: false };
}
export function submitCourse(level: MiniLevel, state: CourseState, answer?: string): CourseState {
  if (state.phase !== 'play') return state;
  const target = courseTarget(level, state);
  const kind = courseKind(level, state);
  let grammar = true;
  let task = false;
  if (kind === 'spell' || kind === 'sentence') {
    const bank = tileBank(level, state);
    const text = state.selected
      .map((id) => bank.find((tile) => tile.id === id)?.text ?? '')
      .join(kind === 'spell' ? '' : ' ');
    if (kind === 'spell') {
      task = text === wordById(target)?.text.replaceAll(' ', '').toUpperCase();
      grammar = task;
    } else ({ grammar, task } = judgeSentence(target, text));
  } else {
    if (
      !answer ||
      !coursePool(level, state).includes(answer) ||
      (kind === 'pair' && state.used.includes(answer))
    )
      return state;
    task = answer === target;
  }
  const attempt: CourseAttempt = {
    id: `${state.id}:${state.nextAttempt}`,
    round: state.round,
    target,
    grammar,
    task,
    support: [...state.support],
    heard: state.heard,
  };
  return {
    ...state,
    phase: task ? 'feedback' : 'play',
    feedback: task
      ? '这份找对了。'
      : grammar
        ? '表达可以用，但这位朋友要的不同。再看情境。'
        : '词块顺序还要调整，可以撤回重摆。',
    attempts: [...state.attempts, attempt].slice(-64),
    nextAttempt: state.nextAttempt + 1,
    support: task ? state.support : [...new Set([...state.support, 'difference-feedback'])],
    used: task && kind === 'pair' ? [...state.used, target] : state.used,
  };
}
export function nextCourse(level: MiniLevel, state: CourseState): CourseState {
  if (state.phase !== 'feedback') return state;
  const next = state.round + 1;
  return next === level.targets.length
    ? { ...state, phase: 'done' }
    : {
        ...state,
        round: next,
        phase: 'meaning',
        selected: [],
        support: [],
        heard: false,
        feedback: '',
      };
}
export function validateCourse(value: unknown): value is CourseState {
  if (!value || typeof value !== 'object') return false;
  const s = value as CourseState;
  const level = miniLevel(s.levelId);
  return Boolean(
    level &&
      s.version === 1 &&
      typeof s.id === 'string' &&
      s.id.length < 100 &&
      Number.isInteger(s.round) &&
      s.round >= 0 &&
      s.round < level.targets.length &&
      ['intro', 'meaning', 'play', 'feedback', 'done'].includes(s.phase) &&
      Array.isArray(s.selected) &&
      s.selected.length <= 16 &&
      new Set(s.selected).size === s.selected.length &&
      s.selected.every((id) => tileBank(level, s).some((tile) => tile.id === id)) &&
      Array.isArray(s.used) &&
      s.used.length <= level.targets.length &&
      s.used.every((id) => level.targets.includes(id)) &&
      Array.isArray(s.support) &&
      s.support.length <= 20 &&
      s.support.every((id) => typeof id === 'string') &&
      typeof s.heard === 'boolean' &&
      typeof s.feedback === 'string' &&
      s.feedback.length <= 240 &&
      Array.isArray(s.attempts) &&
      s.attempts.length <= 64 &&
      s.attempts.every(
        (a) =>
          a &&
          typeof a.id === 'string' &&
          Number.isInteger(a.round) &&
          a.round >= 0 &&
          a.round < level.targets.length &&
          a.target === level.targets[a.round] &&
          typeof a.grammar === 'boolean' &&
          typeof a.task === 'boolean' &&
          Array.isArray(a.support) &&
          typeof a.heard === 'boolean',
      ) &&
      Number.isInteger(s.nextAttempt) &&
      s.nextAttempt >= s.attempts.length &&
      s.nextAttempt < 1e7 &&
      (s.phase !== 'done' || s.round === level.targets.length - 1) &&
      (courseKind(level, s) === 'spell' ||
        courseKind(level, s) === 'sentence' ||
        s.selected.length === 0) &&
      level.targets.every((id, round) =>
        (
          level.kind === 'review'
            ? level.taskKinds?.[round] === 'quantity' || level.taskKinds?.[round] === 'sentence'
            : level.kind === 'quantity' || level.kind === 'sentence'
        )
          ? id in REQUESTS
          : Boolean(wordById(id)),
      ),
  );
}
