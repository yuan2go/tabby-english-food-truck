import products from './dialogue-products.json' with { type: 'json' };
export interface SpokenLine {
  text: string;
  audio: string;
  emphasis: readonly string[];
}
export const dialogueProducts = products;
export function productPhrase(product: string, count: number): string {
  if (!Object.hasOwn(products, product) || !Number.isInteger(count) || count < 1 || count > 3)
    throw new Error(`Unsupported spoken product/count: ${product}/${count}`);
  const noun = products[product as keyof typeof products];
  return count === 1 ? noun.one : `${['', 'one', 'two', 'three'][count]} ${noun.plural}`;
}
export function foodList(foods: readonly string[]): string {
  if (!foods.length || foods.length > 3) throw new Error('A spoken plate holds one to three foods');
  const counts = new Map<string, number>();
  for (const p of foods) counts.set(p, (counts.get(p) ?? 0) + 1);
  const parts = [...counts].map(([p, n]) => productPhrase(p, n));
  return parts.length < 3
    ? parts.join(' and ')
    : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;
}
export function orderLine(foods: readonly string[]): SpokenLine {
  const text = `Can I have ${foodList(foods)}, please?`;
  return {
    text,
    audio: `imm-order-${[...foods].sort().join('-')}`,
    emphasis: [
      ...new Set(foods.map((p) => products[p as keyof typeof products].name)),
      'two',
      'three',
    ],
  };
}
