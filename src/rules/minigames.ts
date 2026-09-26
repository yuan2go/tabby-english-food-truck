import { randomAt } from '../content/chapters';
import { WORDS, wordById } from '../content/learning';
export type MiniKind = 'match' | 'spell';
export type Difficulty = 'demo' | 'partial' | 'independent';
export type MatchMode = 'listen' | 'word-picture' | 'bilingual';
export type Foundation = 'new' | 'letters' | 'phrases';
export interface MiniAttempt {
  id: string;
  round: number;
  target: string;
  result: boolean;
  support: string[];
  heard: boolean;
}
export interface MiniState {
  version: 2;
  id: string;
  kind: MiniKind;
  difficulty: Difficulty;
  mode: MatchMode;
  foundation: Foundation;
  seed: number;
  round: number;
  stage: 'intro' | 'meaning' | 'play' | 'feedback' | 'done';
  carry: Record<string, string[]>;
  vocabulary: string[];
  words: string[];
  draft: string[];
  fixed: string[];
  support: string[];
  attempts: MiniAttempt[];
  nextAttempt: number;
  heard: boolean;
  selected: string | null;
  feedback: string;
  correct: boolean;
}
export function shuffle<T>(input: readonly T[], seed: number): T[] {
  const list = [...input];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(randomAt(seed, i) * (i + 1));
    [list[i], list[j]] = [list[j] as T, list[i] as T];
  }
  return list;
}
export function eligibleWord(
  id: string,
  kind: MiniKind,
  difficulty: Difficulty,
  foundation: Foundation,
): boolean {
  const word = wordById(id);
  if (!word) return false;
  if (kind === 'match') return true;
  const max =
    foundation === 'new'
      ? difficulty === 'demo'
        ? 6
        : 5
      : foundation === 'letters'
        ? difficulty === 'independent'
          ? 7
          : 8
        : 12;
  return (
    word.text.replaceAll(' ', '').length <= max &&
    (foundation === 'phrases' || !word.text.includes(' '))
  );
}
export function createMini(
  kind: MiniKind,
  difficulty: Difficulty,
  seed: number,
  mode: MatchMode = 'listen',
  introduced: readonly string[] = ['apple', 'banana'],
  foundation: Foundation = 'new',
  id = `mini-${seed}-${kind}-${mode}`,
): MiniState {
  const available = WORDS.filter((w) => introduced.includes(w.id));
  const vocabulary = (
    available.length >= 2 ? available : WORDS.filter((w) => ['apple', 'banana'].includes(w.id))
  ).map((w) => w.id);
  const candidates = vocabulary.filter((id) => eligibleWord(id, kind, difficulty, foundation));
  const pool = candidates.length ? candidates : ['apple'];
  if (!candidates.length && !vocabulary.includes('apple')) vocabulary.push('apple');
  const shuffled = shuffle(pool, seed);
  const words = Array.from({ length: 4 }, (_, i) => shuffled[i % shuffled.length] as string);
  return {
    version: 2,
    id,
    kind,
    difficulty,
    mode,
    foundation,
    seed,
    round: 0,
    stage: 'intro',
    carry: {},
    vocabulary,
    words,
    draft: [],
    fixed: [],
    support: [],
    attempts: [],
    nextAttempt: 0,
    heard: false,
    selected: null,
    feedback: '',
    correct: false,
  };
}
export const targetWord = (s: MiniState) =>
  wordById(s.words[s.round] ?? 'apple') ??
  WORDS.find((w) => w.id === 'apple') ?? {
    id: 'apple',
    text: 'apple',
    chinese: '苹果',
    image: 'apple' as const,
    audio: 'apple',
  };
/** Slot groups retain phrase boundaries. Spaces are printed, never selectable tiles. */
export function wordGroups(s: MiniState): number[][] {
  let offset = 0;
  return targetWord(s)
    .text.split(' ')
    .map((word) => [...word].map(() => offset++));
}
export const letters = (s: MiniState) =>
  shuffle(
    [...targetWord(s).text.replaceAll(' ', '').toUpperCase()].map((text, i) => ({
      id: `letter-${s.round}-${i}`,
      text,
      index: i,
    })),
    s.seed + s.round,
  );
export const options = (s: MiniState) => {
  const count = s.difficulty === 'demo' ? 2 : s.difficulty === 'partial' ? 3 : 4;
  return shuffle(
    shuffle(
      WORDS.filter((w) => s.vocabulary.includes(w.id) && w.id !== targetWord(s).id),
      s.seed + s.round * 23,
    )
      .slice(0, count - 1)
      .concat(targetWord(s)),
    s.seed + s.round * 17,
  );
};
export function beginRound(s: MiniState): MiniState {
  if (s.stage === 'meaning' || s.stage === 'play') return s;
  return {
    ...s,
    stage: 'meaning',
    draft: [],
    fixed: [],
    support: [...(s.carry[s.words[s.round] ?? ''] ?? [])],
    heard: false,
    selected: null,
    feedback: '',
    correct: false,
  };
}
export function playRound(s: MiniState): MiniState {
  if (s.stage === 'play' || s.stage === 'feedback' || s.stage === 'done') return s;
  const bank = [...letters(s)].sort((a, b) => a.index - b.index);
  const fixed =
    s.kind === 'spell' && s.difficulty !== 'independent'
      ? bank
          .filter((_, i) => (s.difficulty === 'demo' ? i < bank.length - 1 : i % 2 === 0))
          .map((l) => l.id)
      : [];
  const support = [
    ...new Set([
      ...s.support,
      ...(s.difficulty === 'demo'
        ? ['demonstration']
        : s.difficulty === 'partial'
          ? ['partial']
          : []),
      ...(s.kind === 'match' && s.difficulty !== 'independent' ? ['meaning-picture'] : []),
    ]),
  ];
  return {
    ...s,
    stage: 'play',
    draft: s.kind === 'spell' ? bank.map((l) => (fixed.includes(l.id) ? l.id : '')) : [],
    fixed,
    support,
    feedback: '',
  };
}
export function editLetter(s: MiniState, id: string, to: number | null): MiniState {
  if (
    s.stage !== 'play' ||
    s.kind !== 'spell' ||
    s.fixed.includes(id) ||
    !letters(s).some((l) => l.id === id)
  )
    return s;
  const draft = [...s.draft];
  while (draft.length < letters(s).length) draft.push('');
  const from = draft.indexOf(id);
  if (to === null) {
    if (from >= 0) draft[from] = '';
    return { ...s, draft, feedback: '' };
  }
  if (!Number.isInteger(to) || to < 0 || to >= draft.length || s.fixed.includes(draft[to] ?? ''))
    return s;
  const displaced = draft[to] ?? '';
  if (from >= 0) draft[from] = displaced;
  draft[to] = id;
  return { ...s, draft, feedback: '' };
}
export function submitMini(s: MiniState, answer?: string): MiniState {
  if (s.stage !== 'play') return s;
  const word = targetWord(s),
    bank = letters(s);
  if (s.kind === 'match' && !options(s).some((w) => w.id === answer)) return s;
  if (s.kind === 'spell' && (s.draft.length !== bank.length || s.draft.some((id) => !id)))
    return { ...s, feedback: '字母还没放齐，接着试试。' };
  const phrase = wordGroups(s)
    .map((group) => group.map((i) => bank.find((l) => l.id === s.draft[i])?.text ?? '').join(''))
    .join(' ');
  const correct = s.kind === 'match' ? answer === word.id : phrase === word.text.toUpperCase();
  const support = [
    ...new Set([
      ...s.support,
      ...(s.kind === 'spell' ? ['letter-bank'] : []),
      ...(s.kind === 'match' && s.mode === 'listen' && !s.heard ? ['audio-not-observed'] : []),
    ]),
  ];
  const attempt = {
    id: `${s.id}:attempt:${s.nextAttempt}`,
    round: s.round,
    target: word.id,
    result: correct,
    support,
    heard: s.heard,
  };
  return {
    ...s,
    stage: correct ? 'feedback' : 'play',
    correct,
    attempts: [...s.attempts, attempt].slice(-40),
    nextAttempt: s.nextAttempt + 1,
    support: correct ? s.support : [...new Set([...s.support, 'difference-feedback'])],
    feedback: correct
      ? '找到了！可以再听一遍。'
      : s.kind === 'match'
        ? '再听一听，也可以请大咪帮忙。'
        : '再摆一摆字母，点已放的字母可以撤回。',
  };
}
export function nextRound(s: MiniState): MiniState {
  if (s.stage !== 'feedback') return s;
  const carry = { ...s.carry };
  delete carry[targetWord(s).id];
  s = { ...s, carry };
  return s.round === s.words.length - 1
    ? { ...s, stage: 'done' }
    : beginRound({ ...s, round: s.round + 1, stage: 'intro' });
}
export function validateMini(v: unknown): v is MiniState {
  if (!v || typeof v !== 'object') return false;
  const s = v as Partial<MiniState>;
  const ids = (v: unknown, max: number): v is string[] =>
    Array.isArray(v) && v.length <= max && v.every((x) => typeof x === 'string' && x.length < 160);
  if (
    !s.carry ||
    typeof s.carry !== 'object' ||
    Object.keys(s.carry).length > 50 ||
    Object.entries(s.carry).some(([k, v]) => !wordById(k) || !ids(v, 24)) ||
    s.version !== 2 ||
    typeof s.id !== 'string' ||
    s.id.length > 120 ||
    !['match', 'spell'].includes(s.kind ?? '') ||
    !['demo', 'partial', 'independent'].includes(s.difficulty ?? '') ||
    !['listen', 'word-picture', 'bilingual'].includes(s.mode ?? '') ||
    !['new', 'letters', 'phrases'].includes(s.foundation ?? '') ||
    !Number.isInteger(s.seed) ||
    Number(s.seed) < 0 ||
    Number(s.seed) > 4294967295 ||
    !Number.isInteger(s.round) ||
    Number(s.round) < 0 ||
    Number(s.round) > 3 ||
    !['intro', 'meaning', 'play', 'feedback', 'done'].includes(s.stage ?? '') ||
    !ids(s.words, 4) ||
    s.words.length !== 4 ||
    s.words.some((w) => !wordById(w)) ||
    !ids(s.vocabulary, 50) ||
    s.vocabulary.length < 1 ||
    s.vocabulary.some((w) => !wordById(w)) ||
    s.words.some((w) => !s.vocabulary?.includes(w)) ||
    !ids(s.draft, 12) ||
    !ids(s.fixed, 12) ||
    !ids(s.support, 24) ||
    !Array.isArray(s.attempts) ||
    s.attempts.length > 40 ||
    !Number.isInteger(s.nextAttempt) ||
    Number(s.nextAttempt) < s.attempts.length ||
    Number(s.nextAttempt) > 1e9 ||
    typeof s.heard !== 'boolean' ||
    typeof s.feedback !== 'string' ||
    s.feedback.length > 240 ||
    typeof s.correct !== 'boolean' ||
    !(s.selected === null || s.selected === 'target')
  )
    return false;
  const state = s as MiniState,
    bank = letters(state),
    filled = s.draft.filter(Boolean);
  if (
    new Set(filled).size !== filled.length ||
    filled.some((id) => !bank.some((l) => l.id === id)) ||
    new Set(s.fixed).size !== s.fixed.length ||
    s.fixed.some((id) => s.draft?.[bank.find((l) => l.id === id)?.index ?? -1] !== id)
  )
    return false;
  if (
    s.kind === 'spell' &&
    ['play', 'feedback'].includes(s.stage ?? '') &&
    s.draft.length !== bank.length
  )
    return false;
  if (s.kind === 'match' && (s.draft.length || s.fixed.length)) return false;
  if (s.stage === 'done' && s.round !== 3) return false;
  return (
    new Set(s.attempts.map((a) => a?.id)).size === s.attempts.length &&
    s.attempts.every(
      (a) =>
        a &&
        typeof a.id === 'string' &&
        a.id.length < 160 &&
        Number.isInteger(a.round) &&
        a.round >= 0 &&
        a.round <= 3 &&
        a.target === s.words?.[a.round] &&
        typeof a.result === 'boolean' &&
        ids(a.support, 24) &&
        typeof a.heard === 'boolean',
    )
  );
}
/** M2's compact letter draft can be placed into known word slots without guessing results. */
export function decodeMini(raw: string): MiniState | null {
  if (raw.length > 60000) return null;
  try {
    const v = JSON.parse(raw);
    if (validateMini(v)) return v;
    if (
      v?.version !== 1 ||
      !Array.isArray(v.words) ||
      v.words.length !== 4 ||
      v.words.some((id: unknown) => typeof id !== 'string' || !wordById(id)) ||
      !Array.isArray(v.draft) ||
      !Array.isArray(v.attempts) ||
      !Array.isArray(v.support)
    )
      return null;
    const next = {
      ...v,
      version: 2,
      id: `legacy-${v.seed}-${v.kind}-${v.mode}`,
      foundation: 'phrases',
      carry: {},
      vocabulary: WORDS.map((w) => w.id),
      nextAttempt: v.attempts.length,
      heard: false,
    };
    if (next.kind === 'spell' && ['play', 'feedback'].includes(next.stage))
      next.draft = Array.from({ length: letters(next).length }, (_, i) => v.draft[i] ?? '');
    next.support = [...new Set([...v.support, 'legacy-condition-unverified'])];
    next.attempts = v.attempts.map((a: MiniAttempt, i: number) => ({
      ...a,
      id: `mini-${v.seed}-${v.kind}-${i}`,
      heard: false,
      support: [...new Set([...a.support, 'legacy-condition-unverified'])],
    }));
    return validateMini(next) ? next : null;
  } catch {
    return null;
  }
}

export function restartMini(s: MiniState, id: string): MiniState {
  const carry = { ...s.carry };
  if (s.stage === 'meaning' || s.stage === 'play') {
    const target = targetWord(s).id;
    carry[target] = [...new Set([...(carry[target] ?? []), ...s.support])];
  }
  const fresh = createMini(s.kind, s.difficulty, s.seed, s.mode, s.vocabulary, s.foundation, id);
  return { ...fresh, words: [...s.words], carry };
}
