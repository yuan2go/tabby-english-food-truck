import { FOODS } from './foods';
import extra from './vocabulary-extra.json';
export interface VocabularyWord {
  id: string;
  text: string;
  chinese: string;
  plural: string | null;
  group: string;
  visual: string;
  context: string;
  image: string;
  audio: string;
  contextAudio: string;
  difficulty: number;
  prerequisites: string[];
  batch: string;
  entry: string;
  review: string;
}
/** Learning concepts never become Products or supply entries. */
export const VOCABULARY: readonly VocabularyWord[] = [
  ...FOODS.map((f) => ({ ...f, visual: 'object', group: 'food' })),
  ...extra,
];
export const vocabularyWord = (id: string) => VOCABULARY.find((w) => w.id === id);
export const VOCAB_COLORS: Record<string, string> = {
  red: '#c64d43',
  yellow: '#eac557',
  blue: '#6d9fba',
  green: '#6e9369',
  purple: '#9673a7',
  pink: '#dd9da6',
  brown: '#9b7454',
  black: '#494c47',
  white: '#f4f1e6',
};
export const VOCAB_NUMBERS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };
