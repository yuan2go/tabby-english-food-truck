import type { AdventureExperience } from './adventure-experience';
import type { RequestId } from './catalog';
import type { Family, Product } from './recipes';
import type { StoryFlow } from './story-flow';
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
    title: '早餐派对',
    goal: '听需要，把水果送给朋友。',
    reward: 'flower-page',
    family: 'juice',
    orders: [
      { request: 'apple', visitor: 'rabbit' },
      { request: 'banana', visitor: 'hedgehog' },
    ],
  },
  {
    id: 1,
    title: '冰淇淋狂欢',
    goal: '杯子、蛋筒、球数与配料，亲手做出甜点。',
    reward: 'bunting-page',
    family: 'ice',
    orders: [{ request: 'vanilla-cone', visitor: 'rabbit' }],
  },
  {
    id: 2,
    title: '野餐接力',
    goal: '你先帮谁？两份三明治做好，一起去野餐。',
    reward: 'picnic-page',
    family: 'sandwich',
    orders: [
      { request: 'sandwich', visitor: 'rabbit' },
      { request: 'salad-sandwich', visitor: 'hedgehog' },
    ],
  },
  {
    id: 3,
    title: '黄昏餐车',
    goal: '开煎锅，也能同时准备果汁。',
    reward: 'light-page',
    family: 'burger',
    orders: [
      { request: 'cheese-burger', visitor: 'rabbit' },
      { request: 'juice', visitor: 'hedgehog' },
    ],
  },
  {
    id: 4,
    title: '美食嘉年华',
    goal: '老朋友回来了，为他们做一份分享拼盘。',
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
  | 'hand'
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
  tastedBy?: Visitor;
  recipient?: Visitor;
}
export interface Work {
  id: string;
  foods: WorldFood[];
  signature: string;
}
export interface AdventureState {
  flow?: StoryFlow;
  experience?: AdventureExperience;
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
