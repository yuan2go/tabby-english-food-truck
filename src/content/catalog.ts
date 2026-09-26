import { FOOD_REQUESTS } from './food-orders';
import { FOOD, type Product } from './recipes';

export type { Product } from './recipes';
export type Fruit = 'apple' | 'banana';
export const CONTENT_VERSION = 'm2.3-story-1';
export type Mode = 'guided' | 'practice' | 'service';
export const MODES: Record<Mode, { name: string; icon: string; trays: readonly (0 | 1)[] }> = {
  guided: { name: '跟着大咪做', icon: '🐾', trays: [0] },
  practice: { name: '帮客人准备食物', icon: '🍎', trays: [0] },
  service: { name: '小小餐车营业中', icon: '☀', trays: [0, 1] },
};
export const JUICE_MS = 5000;
export const REQUESTS = {
  ...FOOD_REQUESTS,
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
  'banana-juice': {
    text: 'Banana juice, please.',
    products: ['banana-juice'],
    explanation: '这位客人想要香蕉汁。',
    audio: 'request-banana-juice',
  },
  'cup-vanilla': {
    text: 'In a cup, please.',
    products: ['vanilla-cup'],
    explanation: '这页固定一球香草，孩子选择杯子。',
    audio: 'request-cup-vanilla',
  },
  'cone-vanilla': {
    text: 'In a cone, please.',
    products: ['vanilla-cone'],
    explanation: '这页固定一球香草，孩子选择蛋筒。',
    audio: 'request-cone-vanilla',
  },
  'vanilla-cup': {
    text: 'Vanilla ice cream, please.',
    products: ['vanilla-cup'],
    explanation: '一球香草，用菜单上的杯子装。',
    audio: 'request-vanilla-cup',
  },
  'vanilla-cone': {
    text: 'Vanilla ice cream in a cone, please.',
    products: ['vanilla-cone'],
    explanation: '香草冰淇淋，装在蛋筒里。',
    audio: 'request-vanilla-cone',
  },
  'strawberry-cup': {
    text: 'Strawberry ice cream, please.',
    products: ['strawberry-cup'],
    explanation: '草莓冰淇淋，装在杯里。',
    audio: 'request-strawberry-cup',
  },
  'double-cream': {
    text: 'Two scoops, vanilla and strawberry, please.',
    products: ['double-cream'],
    explanation: '杯里放一球香草、一球草莓。',
    audio: 'request-double-cream',
  },
  'banana-cream': {
    text: 'Vanilla ice cream with banana, please.',
    products: ['banana-cream'],
    explanation: '杯里放香草和香蕉配料。',
    audio: 'request-banana-cream',
  },
  sandwich: {
    text: 'A cheese sandwich, please.',
    products: ['sandwich'],
    explanation: '两片面包夹芝士。',
    audio: 'request-sandwich',
  },
  'salad-sandwich': {
    text: 'A lettuce and tomato sandwich, please.',
    products: ['salad-sandwich'],
    explanation: '两片面包夹生菜和番茄。',
    audio: 'request-salad-sandwich',
  },
  burger: {
    text: 'A burger with lettuce and tomato, please.',
    products: ['burger'],
    explanation: '圆面包夹熟饼、生菜和番茄。',
    audio: 'request-burger',
  },
  'cheese-burger': {
    text: 'A cheeseburger, please.',
    products: ['cheese-burger'],
    explanation: '圆面包夹熟饼和芝士。',
    audio: 'request-cheese-burger',
  },
} as const;
export type RequestId = keyof typeof REQUESTS;
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
