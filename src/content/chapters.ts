import type { RequestId } from './catalog';
import { FOOD_REQUESTS } from './food-orders';
import type { Family } from './recipes';
export type Activity = 'story' | 'endless' | 'training';
export type Language = 'flavor' | 'container' | 'combined';
export type Support = 'demonstration' | 'pictures' | 'less';
export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  family: Family;
  requests: readonly RequestId[];
  introduced: readonly string[];
  gift: string;
  line: string;
  audio: string;
}
export const CHAPTERS: readonly Chapter[] = [
  {
    id: 0,
    title: '晨光果汁',
    subtitle: '把第一杯心意送出去',
    family: 'juice',
    requests: ['apple', 'juice', 'banana-juice', 'fruit'],
    introduced: ['apple', 'banana', 'juice'],
    gift: '窗台小花',
    line: '长辈的老客人来了。用水果做一杯清凉的问候吧。',
    audio: 'chapter-juice',
  },
  {
    id: 1,
    title: '树荫冰淇淋',
    subtitle: '一球、两球，都是好心情',
    family: 'ice',
    requests: ['vanilla-cup', 'strawberry-cup', 'vanilla-cone', 'double-cream', 'banana-cream'],
    introduced: ['ice-cream', 'one', 'two', 'and'],
    gift: '彩色遮阳旗',
    line: '午后的树荫下，朋友们想尝不同口味。',
    audio: 'chapter-ice',
  },
  {
    id: 2,
    title: '野餐三明治',
    subtitle: '面包中间的小秘密',
    family: 'sandwich',
    requests: ['sandwich', 'salad-sandwich', 'juice'],
    introduced: ['bread', 'cheese', 'sandwich'],
    gift: '野餐桌布',
    line: '朋友带来了野餐篮。一起夹好面包，带上果汁。',
    audio: 'chapter-sandwich',
  },
  {
    id: 3,
    title: '黄昏汉堡',
    subtitle: '让香味留住这条小街',
    family: 'burger',
    requests: ['cheese-burger', 'burger', 'sandwich'],
    introduced: ['burger', 'lettuce', 'tomato'],
    gift: '暖暖灯串',
    line: '煎台亮起来了。先等饼做好，再帮小猫组装汉堡。',
    audio: 'chapter-burger',
  },
  {
    id: 4,
    title: '社区小食会',
    subtitle: '每位朋友都有一份心意',
    family: 'juice',
    requests: ['juice', 'vanilla-cone', 'sandwich', 'cheese-burger'],
    introduced: ['thank-you'],
    gift: '大家的合影',
    line: '食谱里留下了四道菜。请老朋友一起到小院吃饭吧！',
    audio: 'chapter-picnic',
  },
];
export const requestFamily = (request: RequestId): Family =>
  request in FOOD_REQUESTS
    ? 'ready'
    : [
          'cup-vanilla',
          'cone-vanilla',
          'vanilla-cup',
          'strawberry-cup',
          'vanilla-cone',
          'double-cream',
          'banana-cream',
        ].includes(request)
      ? 'ice'
      : ['sandwich', 'salad-sandwich'].includes(request)
        ? 'sandwich'
        : ['burger', 'cheese-burger'].includes(request)
          ? 'burger'
          : 'juice';
export function endlessPool(families: readonly Family[], language: Language): RequestId[] {
  const pool: RequestId[] = ['apple', 'banana', 'juice', 'banana-juice'];
  if (language === 'combined') pool.push('two', 'fruit');
  if (families.includes('ice'))
    pool.push(
      ...(language === 'flavor'
        ? (['vanilla-cup', 'strawberry-cup'] as const)
        : language === 'container'
          ? (['cup-vanilla', 'cone-vanilla'] as const)
          : ([
              'cup-vanilla',
              'cone-vanilla',
              'vanilla-cup',
              'vanilla-cone',
              'strawberry-cup',
              'double-cream',
              'banana-cream',
            ] as const)),
    );
  if (families.includes('sandwich')) pool.push('sandwich', 'salad-sandwich');
  if (families.includes('burger')) pool.push('burger', 'cheese-burger');
  if (families.includes('ready')) pool.push(...(Object.keys(FOOD_REQUESTS) as RequestId[]));
  return pool;
}
export function randomAt(seed: number, cursor: number): number {
  let x = (seed + Math.imul(cursor + 1, 0x9e3779b9)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
  x = Math.imul(x ^ (x >>> 15), 0x735a2d97);
  return ((x ^ (x >>> 15)) >>> 0) / 4294967296;
}
