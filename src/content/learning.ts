import { FOOD, type Product } from './recipes';
export interface Word {
  id: string;
  text: string;
  chinese: string;
  image: Product;
  audio: string;
}
export const WORDS: readonly Word[] = [
  { id: 'apple', text: 'apple', chinese: '苹果', image: 'apple', audio: 'apple' },
  { id: 'banana', text: 'banana', chinese: '香蕉', image: 'banana', audio: 'banana' },
  { id: 'juice', text: 'juice', chinese: '果汁', image: 'juice', audio: 'juice' },
  {
    id: 'ice-cream',
    text: 'ice cream',
    chinese: '冰淇淋',
    image: 'vanilla-cone',
    audio: 'word-ice-cream',
  },
  { id: 'bread', text: 'bread', chinese: '面包', image: 'bread', audio: 'word-bread' },
  { id: 'cheese', text: 'cheese', chinese: '芝士', image: 'cheese', audio: 'word-cheese' },
  {
    id: 'sandwich',
    text: 'sandwich',
    chinese: '三明治',
    image: 'sandwich',
    audio: 'word-sandwich',
  },
  { id: 'burger', text: 'burger', chinese: '汉堡', image: 'burger', audio: 'word-burger' },
];
export const wordById = (id: string) => WORDS.find((w) => w.id === id);
export const lessonWords = (products: readonly Product[]) =>
  products.map((p) => ({
    product: p,
    text: FOOD[p][1],
    audio: p === 'apple' || p === 'banana' || p === 'juice' ? p : `word-${p}`,
  }));
export const LEARNING_MAP = {
  meaning: {
    presentation: 'image+voice+real-action',
    attempt: 'choose ingredient',
    support: 'picture/demonstration',
    revisit: 'new guest and recipe',
  },
  listening: {
    presentation: 'hear request',
    attempt: 'explicit delivery',
    support: 'caption/target-picture/difference',
    revisit: 'shuffled seat and composition',
  },
  structure: {
    presentation: 'one/two/and in visible quantities',
    attempt: 'explicit token request',
    support: 'grammar explanation',
    revisit: 'different ingredients',
  },
  spelling: {
    presentation: 'meaning and pronunciation first',
    attempt: 'explicit letter submission',
    support: 'demonstration/partial',
    revisit: 'shuffled independent letter IDs',
  },
  operation: {
    presentation: 'station inputs/process/output',
    attempt: 'make/collect/deliver',
    support: 'recipe',
    revisit: 'different recipe',
  },
} as const;

/** Small teaching units used by the recipe panel and the adult observation log. */
export const LANGUAGE_UNITS = {
  apple: ['apple', 'an apple'],
  banana: ['banana', 'a banana'],
  two: ['one', 'two', 'two apples'],
  fruit: ['apple', 'banana', 'and'],
  juice: ['juice', 'apple juice'],
  'banana-juice': ['banana', 'juice'],
  'vanilla-cone': ['ice cream', 'vanilla', 'cone'],
  'strawberry-cup': ['strawberry', 'cup'],
  'double-cream': ['two scoops', 'and'],
  'banana-cream': ['banana', 'with'],
  sandwich: ['bread', 'cheese', 'sandwich'],
  'salad-sandwich': ['lettuce', 'tomato', 'and'],
  burger: ['burger', 'lettuce', 'tomato'],
  'cheese-burger': ['burger', 'cheese'],
} as const;
