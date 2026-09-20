import { randomAt } from '../content/chapters';
import { WORDS, wordById } from '../content/learning';
export type MiniKind = 'match' | 'spell';
export type Difficulty = 'demo' | 'partial' | 'independent';
export type MatchMode = 'listen' | 'word-picture' | 'bilingual';
export interface MiniState {
  version: 1;
  kind: MiniKind;
  difficulty: Difficulty;
  mode: MatchMode;
  seed: number;
  round: number;
  stage: 'intro' | 'meaning' | 'play' | 'feedback' | 'done';
  words: string[];
  draft: string[];
  fixed: string[];
  support: string[];
  attempts: { round: number; target: string; result: boolean; support: string[] }[];
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
export function createMini(
  kind: MiniKind,
  difficulty: Difficulty,
  seed: number,
  mode: MatchMode = 'listen',
): MiniState {
  return {
    version: 1,
    kind,
    difficulty,
    mode,
    seed,
    round: 0,
    stage: 'intro',
    words: shuffle(WORDS, seed)
      .slice(0, 4)
      .map((w) => w.id),
    draft: [],
    fixed: [],
    support: [],
    attempts: [],
    selected: null,
    feedback: '',
    correct: false,
  };
}
export const targetWord = (s: MiniState) =>
  wordById(s.words[s.round] ?? 'apple') ?? {
    id: 'apple',
    text: 'apple',
    chinese: '苹果',
    image: 'apple' as const,
    audio: 'apple',
  };
export const letters = (s: MiniState) =>
  shuffle(
    [...targetWord(s).text.replaceAll(' ', '').toUpperCase()].map((text, i) => ({
      id: `letter-${s.round}-${i}`,
      text,
    })),
    s.seed + s.round,
  );
export const options = (s: MiniState) =>
  shuffle(
    shuffle(
      WORDS.filter((w) => w.id !== targetWord(s).id),
      s.seed + s.round * 23,
    )
      .slice(0, 3)
      .concat(targetWord(s)),
    s.seed + s.round * 17,
  );
export function beginRound(s: MiniState): MiniState {
  return {
    ...s,
    stage: 'meaning',
    draft: [],
    fixed: [],
    support: [],
    selected: null,
    feedback: '',
    correct: false,
  };
}
export function playRound(s: MiniState): MiniState {
  const next: MiniState = {
    ...s,
    stage: 'play',
    draft: [],
    fixed: [],
    support:
      s.difficulty === 'demo' ? ['demonstration'] : s.difficulty === 'partial' ? ['partial'] : [],
  };
  if (s.kind === 'spell' && s.difficulty === 'partial') {
    next.fixed = [`letter-${s.round}-0`];
    next.draft = [...next.fixed];
  }
  return next;
}
export function submitMini(s: MiniState, answer?: string): MiniState {
  if (s.stage !== 'play') return s;
  const word = targetWord(s);
  const bank = letters(s);
  const spelling = s.draft.map((id) => bank.find((l) => l.id === id)?.text ?? '').join('');
  if (s.kind === 'spell' && spelling.length < word.text.replaceAll(' ', '').length)
    return { ...s, feedback: '字母还没放齐，接着试试。' };
  const correct =
    s.kind === 'match'
      ? answer === word.id
      : spelling === word.text.replaceAll(' ', '').toUpperCase();
  const support = [...s.support];
  const attempt = { round: s.round, target: word.id, result: correct, support };
  return {
    ...s,
    stage: correct ? 'feedback' : 'play',
    correct,
    attempts: [...s.attempts, attempt].slice(-40),
    support: correct ? s.support : [...new Set([...s.support, 'difference-feedback'])],
    feedback: correct
      ? '找到了！再听一遍，记住这份心意。'
      : s.kind === 'match'
        ? '这两个还不是一对。听一听，再试试。'
        : '字母顺序还需要调整，点字母可以撤回。',
  };
}
export function nextRound(s: MiniState): MiniState {
  return s.round === s.words.length - 1
    ? { ...s, stage: 'done' }
    : beginRound({ ...s, round: s.round + 1 });
}
export function validateMini(v: unknown): v is MiniState {
  if (!v || typeof v !== 'object') return false;
  const s = v as Partial<MiniState>;
  if (
    s.version !== 1 ||
    !['match', 'spell'].includes(s.kind ?? '') ||
    !['demo', 'partial', 'independent'].includes(s.difficulty ?? '') ||
    !['listen', 'word-picture', 'bilingual'].includes(s.mode ?? '') ||
    !Number.isInteger(s.seed) ||
    Number(s.seed) < 0 ||
    Number(s.seed) > 4294967295 ||
    !Number.isInteger(s.round) ||
    Number(s.round) < 0 ||
    Number(s.round) > 3 ||
    !['intro', 'meaning', 'play', 'feedback', 'done'].includes(s.stage ?? '') ||
    !Array.isArray(s.words) ||
    s.words.length !== 4 ||
    s.words.some((w) => !wordById(w)) ||
    new Set(s.words).size !== 4 ||
    !Array.isArray(s.draft) ||
    s.draft.length > 12 ||
    new Set(s.draft).size !== s.draft.length ||
    !Array.isArray(s.fixed) ||
    !Array.isArray(s.support) ||
    s.support.length > 8 ||
    !s.support.every((x) => typeof x === 'string') ||
    !Array.isArray(s.attempts) ||
    s.attempts.length > 40 ||
    typeof s.feedback !== 'string' ||
    typeof s.correct !== 'boolean' ||
    (s.selected !== null && s.selected !== 'target') ||
    s.feedback.length > 200
  )
    return false;
  const bank = letters(s as MiniState);
  return (
    s.draft.every((id) => bank.some((l) => l.id === id)) &&
    new Set(s.fixed).size === s.fixed.length &&
    s.fixed.every((id) => s.draft?.includes(id)) &&
    s.attempts.every(
      (a) =>
        a &&
        Number.isInteger(a.round) &&
        a.round >= 0 &&
        a.round < 4 &&
        a.target === s.words?.[a.round] &&
        typeof a.result === 'boolean' &&
        Array.isArray(a.support) &&
        a.support.length <= 8 &&
        a.support.every((x) => typeof x === 'string' && x.length < 100),
    )
  );
}
