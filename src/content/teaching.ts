import type { RequestId } from './catalog';
import type { FOOD_REQUESTS } from './food-orders';
import { FOODS, foodBatch } from './foods';
import { ITEM_AUDIO, WORDS } from './learning';
import { FOOD, type Product, RECIPES } from './recipes';

export interface MeaningChoice {
  id: string;
  products: readonly Product[];
}
export interface LearningUnit {
  id: string;
  text: string;
  audio: string;
  prompt: string;
  products: readonly Product[];
  choices: readonly MeaningChoice[];
  accepts: string;
  prerequisite: 'recognition' | 'quantity' | 'combination';
  support: readonly string[];
  feedback: string;
}
const pair = (
  id: string,
  product: Product,
  other: Product,
  text: string = FOOD[product][1],
  audio: string = ITEM_AUDIO[product],
): LearningUnit => ({
  id,
  text,
  audio,
  prompt: `try-${id}`,
  products: [product],
  choices: [
    { id, products: [product] },
    { id: `contrast-${other}`, products: [other] },
  ],
  accepts: id,
  prerequisite: 'recognition',
  support: ['meaning-picture', 'demonstration'],
  feedback: '就是这位食物朋友。',
});
export const UNITS: Record<string, LearningUnit> = {
  ...Object.fromEntries(
    FOODS.map((f) => [
      f.id,
      pair(
        f.id,
        f.product as Product,
        (foodBatch(f.batch).find((x) => x.id !== f.id)?.product ?? 'apple') as Product,
        f.text,
        f.audio,
      ),
    ]),
  ),
  apple: pair('apple', 'apple', 'banana'),
  banana: pair('banana', 'banana', 'apple'),
  juice: pair('juice', 'juice', 'apple', 'juice', 'name-juice'),
  'ice-cream': pair('ice-cream', 'vanilla-cone', 'juice', 'ice cream', 'word-ice-cream'),
  vanilla: pair('vanilla', 'vanilla', 'strawberry'),
  strawberry: pair('strawberry', 'strawberry', 'vanilla'),
  cup: pair('cup', 'cup', 'cone'),
  cone: pair('cone', 'cone', 'cup'),
  bread: pair('bread', 'bread', 'cheese'),
  cheese: pair('cheese', 'cheese', 'bread'),
  lettuce: pair('lettuce', 'lettuce', 'tomato'),
  tomato: pair('tomato', 'tomato', 'lettuce'),
  bun: pair('bun', 'bun', 'bread'),
  patty: pair('patty', 'patty', 'cooked-patty'),
  'cooked-patty': pair('cooked-patty', 'cooked-patty', 'patty'),
  sandwich: pair('sandwich', 'sandwich', 'burger', 'sandwich', 'word-sandwich'),
  burger: pair('burger', 'burger', 'sandwich'),
  ...Object.fromEntries(
    ([1, 2] as const).map((n) => {
      const id = n === 1 ? 'one' : 'two';
      return [
        id,
        {
          id,
          text: id,
          audio: `name-${id}`,
          prompt: `try-${id}`,
          products: Array<Product>(n).fill('apple'),
          choices: [
            { id: 'one', products: ['apple'] },
            { id: 'two', products: ['apple', 'apple'] },
          ],
          accepts: id,
          prerequisite: 'quantity',
          support: ['quantity-picture'],
          feedback: '看看眼前的份数，再用到餐车里。',
        } satisfies LearningUnit,
      ];
    }),
  ),
  and: {
    id: 'and',
    text: 'and',
    audio: 'name-and',
    prompt: 'try-and',
    products: ['apple', 'banana'],
    choices: [
      { id: 'together', products: ['apple', 'banana'] },
      { id: 'only', products: ['apple'] },
    ],
    accepts: 'together',
    prerequisite: 'combination',
    support: ['combination-picture'],
    feedback: '两种都在，这里用 and 连起来。',
  },
};
export const REQUEST_UNITS: Record<RequestId, readonly string[]> = {
  ...(Object.fromEntries(
    FOODS.filter((f) => ['direct', 'prepared'].includes(f.role)).map((f) => [
      'food-' + f.id,
      [f.id],
    ]),
  ) as Record<keyof typeof FOOD_REQUESTS, string[]>),
  apple: ['apple'],
  banana: ['banana'],
  two: ['apple', 'one', 'two'],
  fruit: ['apple', 'banana', 'and'],
  juice: ['apple', 'juice', 'cup'],
  'banana-juice': ['banana', 'juice', 'cup'],
  'vanilla-cone': ['ice-cream', 'vanilla', 'cone'],
  'strawberry-cup': ['strawberry', 'cup'],
  'double-cream': ['vanilla', 'strawberry', 'one', 'two', 'and', 'cup'],
  'banana-cream': ['vanilla', 'banana', 'cup'],
  sandwich: ['bread', 'cheese', 'sandwich'],
  'salad-sandwich': ['lettuce', 'tomato', 'and', 'sandwich'],
  burger: ['bun', 'patty', 'cooked-patty', 'lettuce', 'tomato', 'burger'],
  'cheese-burger': ['bun', 'patty', 'cooked-patty', 'cheese', 'burger'],
};
export const acceptsChoice = (unit: LearningUnit, choice: string) =>
  unit.choices.some((c) => c.id === choice) && choice === unit.accepts;
export const preparationSteps = (product: Product) => {
  const recipe = RECIPES.find((r) => r.output === product);
  return recipe
    ? [...recipe.inputs.flatMap((p) => RECIPES.filter((r) => r.output === p)), recipe]
    : [];
};
export const introducedWords = (presented: readonly string[]) =>
  WORDS.filter((w) => presented.includes(w.id)).map((w) => w.id);

/** Repeated pictured portions have stable occurrence identities, just like material portions. */
export function teachingFigures(products: readonly Product[]) {
  const counts = new Map<Product, number>();
  return products.map((product) => {
    const occurrence = counts.get(product) ?? 0;
    counts.set(product, occurrence + 1);
    return { id: `${product}-${occurrence}`, product };
  });
}

for (const f of FOODS) {
  const unit = UNITS[f.id];
  if (unit && unit.audio === f.audio) unit.prompt = f.audio;
}
