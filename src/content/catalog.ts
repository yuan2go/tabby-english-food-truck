import { FOOD_REQUESTS } from './food-orders';
import { FOOD, type Product } from './recipes';
import { orderLine } from './request-language';

export type { Product } from './recipes';
export type Fruit = 'apple' | 'banana';
export const CONTENT_VERSION = 'continuous-gameplay-1';
export type Mode = 'guided' | 'practice' | 'service';
export const MODES: Record<Mode, { name: string; icon: string; trays: readonly (0 | 1)[] }> = {
  guided: { name: '跟着大咪做', icon: '🐾', trays: [0] },
  practice: { name: '帮客人准备食物', icon: '🍎', trays: [0] },
  service: { name: '小小餐车营业中', icon: '☀', trays: [0, 1] },
};
export const JUICE_MS = 5000;
const requestDefinitions = {
  ...FOOD_REQUESTS,
  apple: {
    products: ['apple'],
    explanation: '这位客人想要一个苹果。',
  },
  banana: {
    products: ['banana'],
    explanation: '这位客人想要一根香蕉。',
  },
  two: {
    products: ['apple', 'apple'],
    explanation: '这位客人想要两个苹果。',
  },
  juice: {
    products: ['juice'],
    explanation: '这位客人想要一杯苹果汁。',
  },
  fruit: {
    products: ['apple', 'banana'],
    explanation: '这位客人想要一个苹果和一根香蕉。',
  },
  'banana-juice': {
    products: ['banana-juice'],
    explanation: '这位客人想要香蕉汁。',
  },
  'cup-vanilla': {
    products: ['vanilla-cup'],
    explanation: '这页固定一球香草，孩子选择杯子。',
  },
  'cone-vanilla': {
    products: ['vanilla-cone'],
    explanation: '这页固定一球香草，孩子选择蛋筒。',
  },
  'vanilla-cup': {
    products: ['vanilla-cup'],
    explanation: '一球香草，用菜单上的杯子装。',
  },
  'vanilla-cone': {
    products: ['vanilla-cone'],
    explanation: '香草冰淇淋，装在蛋筒里。',
  },
  'strawberry-cup': {
    products: ['strawberry-cup'],
    explanation: '草莓冰淇淋，装在杯里。',
  },
  'double-cream': {
    products: ['double-cream'],
    explanation: '杯里放一球香草、一球草莓。',
  },
  'banana-cream': {
    products: ['banana-cream'],
    explanation: '杯里放香草和香蕉配料。',
  },
  sandwich: {
    products: ['sandwich'],
    explanation: '两片面包夹芝士。',
  },
  'salad-sandwich': {
    products: ['salad-sandwich'],
    explanation: '两片面包夹生菜和番茄。',
  },
  burger: {
    products: ['burger'],
    explanation: '圆面包夹熟饼、生菜和番茄。',
  },
  'cheese-burger': {
    products: ['cheese-burger'],
    explanation: '圆面包夹熟饼和芝士。',
  },
} as const;
export type RequestId = keyof typeof requestDefinitions;
/** Preserve products and request IDs; spoken text/audio derive from those exact products. */
export const REQUESTS = Object.fromEntries(
  Object.entries(requestDefinitions).map(([id, r]) => [id, { ...r, ...orderLine(r.products) }]),
) as {
  [K in RequestId]: Omit<(typeof requestDefinitions)[K], 'text' | 'audio'> &
    ReturnType<typeof orderLine>;
};
export const PRODUCT_NAMES = Object.fromEntries(
  Object.entries(FOOD).map(([id, names]) => [id, names[0]]),
) as Record<Product, string>;
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
