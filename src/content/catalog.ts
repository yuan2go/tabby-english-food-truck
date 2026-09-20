export type Product = 'apple' | 'banana' | 'cup' | 'juice';
export type Fruit = 'apple' | 'banana';
export const CONTENT_VERSION = 'm1.1';
export const JUICE_MS = 5000;
export const HELPER_MS = 2000;
export const RETURN_MS = 800;
export const REQUESTS = {
  juice: {
    text: 'Apple juice, please.',
    products: ['juice'],
    explanation: '这位客人想要一杯苹果汁。',
    audio: 'request-juice',
  },
  fruit: {
    text: 'An apple and a banana, please.',
    products: ['apple', 'banana'],
    explanation: '这位客人想要一个苹果和一根香蕉。',
    audio: 'request-fruit',
  },
} as const;
export type RequestId = keyof typeof REQUESTS;
export const PRODUCT_NAMES: Record<Product, string> = {
  apple: '苹果',
  banana: '香蕉',
  cup: '空杯',
  juice: '苹果汁',
};
export const WORDS = [
  'an',
  'a',
  'one',
  'two',
  'apple',
  'apples',
  'banana',
  'bananas',
  'and',
  'please',
  'an',
  'a',
  'apple',
  'banana',
] as const;
export const TOKENS = WORDS.map((text, i) => ({ id: `word-${i}`, text }));
