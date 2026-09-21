export const FOOD = {
  apple: ['苹果', 'apple'],
  banana: ['香蕉', 'banana'],
  cup: ['空杯', 'cup'],
  juice: ['苹果汁', 'apple juice'],
  'banana-juice': ['香蕉汁', 'banana juice'],
  bread: ['面包', 'bread'],
  cheese: ['芝士', 'cheese'],
  lettuce: ['生菜', 'lettuce'],
  tomato: ['番茄', 'tomato'],
  bun: ['圆面包', 'bun'],
  patty: ['生饼', 'patty'],
  'cooked-patty': ['熟饼', 'cooked patty'],
  cone: ['蛋筒', 'cone'],
  vanilla: ['香草球', 'vanilla'],
  strawberry: ['草莓球', 'strawberry'],
  'vanilla-cone': ['香草蛋筒', 'vanilla ice cream'],
  'strawberry-cup': ['草莓冰淇淋杯', 'strawberry ice cream'],
  'double-cream': ['双球冰淇淋', 'two scoops of ice cream'],
  'banana-cream': ['香蕉冰淇淋', 'ice cream with banana'],
  sandwich: ['芝士三明治', 'cheese sandwich'],
  'salad-sandwich': ['蔬菜三明治', 'lettuce and tomato sandwich'],
  burger: ['汉堡', 'burger'],
  'cheese-burger': ['芝士汉堡', 'cheeseburger'],
} as const;
export type Product = keyof typeof FOOD;
export type Family = 'juice' | 'ice' | 'sandwich' | 'burger';
export type StationId = 'ice' | 'board' | 'grill';
export interface Recipe {
  id: string;
  family: Family;
  station: 'machine' | StationId;
  inputs: readonly Product[];
  output: Product;
  ms: number;
  action: string;
}
export const RECIPES: readonly Recipe[] = [
  {
    id: 'juice',
    family: 'juice',
    station: 'machine',
    inputs: ['apple', 'cup'],
    output: 'juice',
    ms: 5000,
    action: '榨汁',
  },
  {
    id: 'banana-juice',
    family: 'juice',
    station: 'machine',
    inputs: ['banana', 'cup'],
    output: 'banana-juice',
    ms: 5000,
    action: '榨汁',
  },
  {
    id: 'vanilla-cone',
    family: 'ice',
    station: 'ice',
    inputs: ['cone', 'vanilla'],
    output: 'vanilla-cone',
    ms: 1000,
    action: '接好冰淇淋',
  },
  {
    id: 'strawberry-cup',
    family: 'ice',
    station: 'ice',
    inputs: ['cup', 'strawberry'],
    output: 'strawberry-cup',
    ms: 1000,
    action: '接好冰淇淋',
  },
  {
    id: 'double-cream',
    family: 'ice',
    station: 'ice',
    inputs: ['cup', 'vanilla', 'strawberry'],
    output: 'double-cream',
    ms: 1300,
    action: '接好双球',
  },
  {
    id: 'banana-cream',
    family: 'ice',
    station: 'ice',
    inputs: ['cup', 'vanilla', 'banana'],
    output: 'banana-cream',
    ms: 1300,
    action: '装好配料',
  },
  {
    id: 'sandwich',
    family: 'sandwich',
    station: 'board',
    inputs: ['bread', 'bread', 'cheese'],
    output: 'sandwich',
    ms: 1200,
    action: '盖合',
  },
  {
    id: 'salad-sandwich',
    family: 'sandwich',
    station: 'board',
    inputs: ['bread', 'bread', 'lettuce', 'tomato'],
    output: 'salad-sandwich',
    ms: 1200,
    action: '盖合',
  },
  {
    id: 'patty',
    family: 'burger',
    station: 'grill',
    inputs: ['patty'],
    output: 'cooked-patty',
    ms: 3500,
    action: '煎好饼',
  },
  {
    id: 'burger',
    family: 'burger',
    station: 'board',
    inputs: ['bun', 'cooked-patty', 'lettuce', 'tomato'],
    output: 'burger',
    ms: 1200,
    action: '盖好汉堡',
  },
  {
    id: 'cheese-burger',
    family: 'burger',
    station: 'board',
    inputs: ['bun', 'cooked-patty', 'cheese'],
    output: 'cheese-burger',
    ms: 1200,
    action: '盖好汉堡',
  },
];
export const sameContents = (a: readonly Product[], b: readonly Product[]) =>
  a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');
export const recipeFor = (station: Recipe['station'], products: readonly Product[]) =>
  RECIPES.find((r) => r.station === station && sameContents(products, r.inputs));
export const RAW: readonly Product[] = [
  'apple',
  'banana',
  'cup',
  'bread',
  'cheese',
  'lettuce',
  'tomato',
  'bun',
  'patty',
  'cone',
  'vanilla',
  'strawberry',
];
export const isFinished = (product: Product) => !RAW.includes(product);
export const FAMILY_SUPPLIES: Record<Family, readonly Product[]> = {
  juice: ['apple', 'banana', 'cup'],
  ice: ['cone', 'cup', 'vanilla', 'strawberry', 'banana'],
  sandwich: ['bread', 'cheese', 'lettuce', 'tomato'],
  burger: ['bun', 'patty', 'cheese', 'lettuce', 'tomato'],
};
export const FAMILY_STATIONS: Record<Family, readonly StationId[]> = {
  juice: [],
  ice: ['ice'],
  sandwich: ['board'],
  burger: ['grill', 'board'],
};
export const foodAsset = (product: Product): string => product;
