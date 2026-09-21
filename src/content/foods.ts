import records from './foods.json' with { type: 'json' };
export const FOODS = records;
export const FOOD_GROUPS = [
  { id: 'fruit', name: '水果篮', audio: 'basket-fruit' },
  { id: 'vegetable', name: '菜园篮', audio: 'basket-vegetable' },
  { id: 'staple', name: '厨房篮', audio: 'basket-staple' },
  { id: 'flavor', name: '香甜篮', audio: 'basket-flavor' },
  { id: 'ready', name: '点心篮', audio: 'basket-ready' },
] as const;
export const foodConcept = (id: string) => FOODS.find((f) => f.id === id);
export const foodBatch = (id: string) => FOODS.filter((f) => f.batch === id);

/** Recipe variants retain a single food concept; containers never become foods. */
export const conceptForProduct = (product: string) =>
  FOODS.find((f) => f.productionObjects.includes(product));
