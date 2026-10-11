import type { RequestId } from './catalog';
import type { Family, Product } from './recipes';
export type Visitor = 'rabbit' | 'hedgehog' | 'elder';
export const VISITOR_NAMES: Record<Visitor, string> = {
  rabbit: '兔兔',
  hedgehog: '刺刺',
  elder: '长辈',
};
export interface AdventureChapter {
  id: number;
  title: string;
  goal: string;
  reward: string;
  family: Family;
  orders: readonly { request: RequestId; visitor: Visitor }[];
}
export const ADVENTURES: readonly AdventureChapter[] = [
  {
    id: 0,
    title: '晨光开门',
    goal: '送早餐，找到花苗，一起种迎客花',
    reward: 'flower-page',
    family: 'juice',
    orders: [
      { request: 'apple', visitor: 'rabbit' },
      { request: 'banana', visitor: 'hedgehog' },
    ],
  },
  {
    id: 1,
    title: '树荫甜点',
    goal: '尝不同口味，把分享彩旗挂起来',
    reward: 'bunting-page',
    family: 'ice',
    orders: [{ request: 'vanilla-cone', visitor: 'rabbit' }],
  },
  {
    id: 2,
    title: '野餐准备',
    goal: '帮朋友备餐，一起把野餐桌摆好',
    reward: 'picnic-page',
    family: 'sandwich',
    orders: [
      { request: 'sandwich', visitor: 'rabbit' },
      { request: 'salad-sandwich', visitor: 'hedgehog' },
    ],
  },
  {
    id: 3,
    title: '黄昏协作',
    goal: '安排煎制与饮品，把灯带到餐桌',
    reward: 'light-page',
    family: 'burger',
    orders: [
      { request: 'cheese-burger', visitor: 'rabbit' },
      { request: 'juice', visitor: 'hedgehog' },
    ],
  },
  {
    id: 4,
    title: '社区小食会',
    goal: '邀请老朋友，创作拼盘，留下食谱末页',
    reward: 'feast-page',
    family: 'juice',
    orders: [],
  },
];
export const EDIBLE: readonly Product[] = [
  'apple',
  'banana',
  'orange',
  'pear',
  'peach',
  'fresh-strawberry',
  'grape',
  'watermelon',
  'mango',
  'pineapple',
  'juice',
  'banana-juice',
  'vanilla-cup',
  'vanilla-cone',
  'strawberry-cup',
  'double-cream',
  'banana-cream',
  'sandwich',
  'salad-sandwich',
  'burger',
  'cheese-burger',
  'milk',
  'yogurt',
  'smoothie',
  'milkshake',
  'pizza',
  'salad',
  'cake',
  'cookie',
];
export const COOL_CHOICES: readonly Product[] = [
  'vanilla-cup',
  'strawberry-cup',
  'double-cream',
  'banana-cream',
];
export const FAMILIES: readonly Family[] = ['juice', 'ice', 'sandwich', 'burger'];
export type WorldPlace =
  | 'guest-rabbit'
  | 'guest-hedgehog'
  | 'guest-elder'
  | 'basket'
  | 'work'
  | 'table:0'
  | 'table:1'
  | 'table:2';
export interface WorldFood {
  id: string;
  product: Product;
  source: string;
  place: WorldPlace;
  tasted: boolean;
}
export interface Work {
  id: string;
  foods: WorldFood[];
  signature: string;
}
export interface AdventureState {
  chapter: number;
  kind: 'chapter' | 'shop';
  branch: 'rabbit' | 'hedgehog' | null;
  explored: string[];
  steps: string[];
  rewards: string[];
  foods: WorldFood[];
  works: Work[];
  decor: {
    flower: 0 | 1 | 2;
    bunting: 'warm' | 'cool';
    cloth: 'leaf' | 'sun';
    light: 'warm' | 'moon';
  };
  invitations: Visitor[];
}
export const emptyAdventure = (
  chapter: number,
  kind: AdventureState['kind'] = 'chapter',
): AdventureState => ({
  chapter,
  kind,
  branch: null,
  explored: [],
  steps: [],
  rewards: [],
  foods: [],
  works: [],
  decor: { flower: 0, bunting: 'warm', cloth: 'leaf', light: 'warm' },
  invitations: [],
});
export const workSignature = (foods: readonly WorldFood[]) =>
  foods.map((f) => `${f.id}:${f.product}:${f.place}:${f.tasted}`).join('|');
