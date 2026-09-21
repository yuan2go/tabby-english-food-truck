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
  { id: 'juice', text: 'juice', chinese: '果汁', image: 'juice', audio: 'name-juice' },
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
export const ITEM_AUDIO: Record<Product, string> = {
  apple: 'apple',
  banana: 'banana',
  cup: 'word-cup',
  juice: 'juice',
  'banana-juice': 'word-banana-juice',
  bread: 'word-bread',
  cheese: 'word-cheese',
  lettuce: 'word-lettuce',
  tomato: 'word-tomato',
  bun: 'word-bun',
  patty: 'word-patty',
  'cooked-patty': 'word-cooked-patty',
  cone: 'word-cone',
  vanilla: 'word-vanilla',
  strawberry: 'word-strawberry',
  'vanilla-cone': 'word-vanilla-cone',
  'strawberry-cup': 'word-strawberry-cup',
  'double-cream': 'word-double-cream',
  'banana-cream': 'word-banana-cream',
  sandwich: 'name-cheese-sandwich',
  'salad-sandwich': 'word-salad-sandwich',
  burger: 'word-burger',
  'cheese-burger': 'word-cheese-burger',
};
export const lessonWords = (products: readonly Product[]) =>
  products.map((product) => ({ product, text: FOOD[product][1], audio: ITEM_AUDIO[product] }));
