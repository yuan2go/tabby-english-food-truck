import { FOODS } from './foods';
import { FOOD, type Product } from './recipes';
export interface Word {
  id: string;
  text: string;
  chinese: string;
  image: Product;
  audio: string;
}
export const WORDS: readonly Word[] = FOODS.map((f) => ({
  id: f.id,
  text: f.text,
  chinese: f.chinese,
  image: f.product as Product,
  audio: f.audio,
}));
export const wordById = (id: string) => WORDS.find((w) => w.id === id);
export const ITEM_AUDIO: Record<Product, string> = {
  ...(Object.fromEntries(FOODS.map((f) => [f.product, f.audio])) as Record<Product, string>),
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
