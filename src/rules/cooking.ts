import {
  FAMILY_STATIONS,
  type Product,
  RAW,
  RECIPES,
  recipeFor,
  type StationId,
} from '../content/recipes';
import { reserved } from './routing';
import type { GameState, Item, Location } from './types';
export const stationItems = (s: GameState, id: StationId) =>
  s.items.filter((i) => i.location.startsWith(`station:${id}:`));
export function stationDestination(
  s: GameState,
  id: StationId,
  product: Product,
): Location | { reason: string } {
  if (!FAMILY_STATIONS[s.session.family].includes(id)) return { reason: '先选需要的备餐台。' };
  const station = s.stations[id];
  if (station.status === 'processing' || station.status === 'ready')
    return { reason: '等制作完成，取走成品后再准备。' };
  const items = stationItems(s, id);
  if (items.length >= 5) return { reason: '备餐台满了，点选原料放回。' };
  if (
    !RECIPES.some(
      (r) => r.station === id && r.family === s.session.family && r.inputs.includes(product),
    )
  )
    return { reason: '这份食物不放在这里，可放到托盘或退回。' };
  const slot = [0, 1, 2, 3, 4].find(
    (n) =>
      !items.some((i) => i.location === `station:${id}:${n}`) && !reserved(s, `station:${id}:${n}`),
  );
  if (slot === undefined) return { reason: '台面满了。' };
  return `station:${id}:${slot}`;
}
export function syncStations(s: GameState): void {
  for (const id of ['ice', 'board', 'grill'] as const) {
    const st = s.stations[id];
    if (st.status === 'processing') continue;
    const items = stationItems(s, id);
    st.status = items.length ? (st.status === 'ready' ? 'ready' : 'loaded') : 'empty';
    if (!items.length) {
      st.recipe = null;
      st.remaining = 0;
    }
  }
}
export function startStation(s: GameState, id: StationId): { ok: boolean; message: string } {
  const st = s.stations[id];
  if (st.status === 'processing' || st.status === 'ready')
    return { ok: false, message: '先等一等或取走成品。' };
  const recipe = recipeFor(
    id,
    stationItems(s, id).map((i) => i.product),
  );
  if (!recipe)
    return {
      ok: false,
      message:
        id === 'grill'
          ? '放一份生饼，再按煎制。'
          : '食材组合还没准备好。可以看食谱或点选原料放回。',
    };
  st.recipe = recipe.id;
  st.remaining = recipe.ms;
  st.status = 'processing';
  return { ok: true, message: `${recipe.action}开始了，还能准备另一盘。` };
}
export function advanceStations(s: GameState, delta: number): boolean {
  let changed = false;
  for (const id of ['ice', 'board', 'grill'] as const) {
    const st = s.stations[id];
    if (st.status !== 'processing') continue;
    st.remaining = Math.max(0, st.remaining - delta);
    if (st.remaining) continue;
    const recipe = RECIPES.find((r) => r.id === st.recipe);
    const inputs = stationItems(s, id);
    if (!recipe || !inputs[0]) continue;
    const output: Item = { id: inputs[0].id, product: recipe.output, location: `station:${id}:0` };
    s.items = s.items.filter((i) => !inputs.some((input) => input.id === i.id));
    s.items.push(output);
    st.status = 'ready';
    changed = true;
  }
  return changed;
}
export function itemLocked(s: GameState, item: Item): boolean {
  if (item.location.startsWith('delivery:')) return true;
  if (item.location.startsWith('station:'))
    return s.stations[item.location.split(':')[1] as StationId].status === 'processing';
  return false;
}
export const canSupply = (product: Product) => RAW.includes(product);
