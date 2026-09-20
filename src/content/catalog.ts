export type Product = 'apple' | 'banana' | 'cup' | 'juice';
export type Fruit = 'apple' | 'banana';
export const CONTENT_VERSION = 'm1.2';
export type Mode = 'guided' | 'practice' | 'service';
export const MODES: Record<Mode, { name: string; icon: string; trays: readonly (0 | 1)[] }> = {
  guided: { name: '跟着小猫做', icon: '🐾', trays: [0] },
  practice: { name: '帮客人准备食物', icon: '🍎', trays: [0] },
  service: { name: '小小餐车营业中', icon: '☀', trays: [0, 1] },
};
export const JUICE_MS = 5000;
export const HELPER_MS = 2000;
export const RETURN_MS = 800;
export const REQUESTS = {
  apple: {
    text: 'An apple, please.',
    products: ['apple'],
    explanation: '这位客人想要一个苹果。',
    audio: 'request-apple',
  },
  banana: {
    text: 'A banana, please.',
    products: ['banana'],
    explanation: '这位客人想要一根香蕉。',
    audio: 'request-banana',
  },
  two: {
    text: 'Two apples, please.',
    products: ['apple', 'apple'],
    explanation: '这位客人想要两个苹果。',
    audio: 'two',
  },
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

export function requestsFor(mode: Mode, variant: 0 | 1): RequestId[] {
  if (mode === 'guided') return [variant === 0 ? 'apple' : 'juice'];
  if (mode === 'practice')
    return variant === 0
      ? ['apple', 'banana', 'two', 'fruit', 'juice']
      : ['banana', 'apple', 'two', 'juice', 'fruit'];
  return variant === 0 ? ['juice', 'fruit'] : ['fruit', 'juice'];
}
