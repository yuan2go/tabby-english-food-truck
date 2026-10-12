import { type Product, RECIPES, recipeFor, type StationId } from '../content/recipes';
import { stationItems } from './cooking';
import type { GameState } from './types';

/** A manual assembly has a real output immediately; heat remains clock-owned. */
export function assemble(s: GameState, id: StationId): boolean {
  if (id === 'grill' || s.stations[id].status !== 'loaded') return false;
  const inputs = stationItems(s, id);
  const recipe = recipeFor(
    id,
    inputs.map((i) => i.product),
  );
  if (!recipe || !s.session.unlocked.includes(recipe.family) || !inputs[0]) return false;
  const ids = new Set(inputs.map((i) => i.id));
  s.items = s.items.filter((i) => !ids.has(i.id));
  s.items.push({ id: inputs[0].id, product: recipe.output, location: inputs[0].location });
  s.stations[id] = { recipe: recipe.id, status: 'ready', remaining: 0 };
  return true;
}

/** Ice cream can accept another scoop before pickup, only within existing recipes. */
export function extendIce(s: GameState, product: Product): boolean {
  const items = stationItems(s, 'ice');
  const output = items[0];
  const previous = RECIPES.find((r) => r.station === 'ice' && r.output === output?.product);
  if (
    items.length !== 1 ||
    !previous ||
    !output ||
    !recipeFor('ice', [...previous.inputs, product])
  )
    return false;
  s.items = s.items.filter((i) => i.id !== output.id);
  previous.inputs.forEach((p, slot) => {
    s.items.push({
      id: slot === 0 ? output.id : `food-${s.nextId++}`,
      product: p,
      location: `station:ice:${slot}`,
    });
  });
  s.stations.ice = { status: 'loaded', recipe: null, remaining: 0 };
  return true;
}
