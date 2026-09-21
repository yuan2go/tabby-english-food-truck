import type { StationId } from '../content/recipes';
import type { GameState, Location, TrayId } from './types';
export type OutputTarget = { tray: TrayId; slot: 0 | 1 | 2 } | { station: 'board'; slot: number };
export type Routing = Record<'machine' | StationId, OutputTarget | null>;
export const emptyRouting = (): Routing => ({ machine: null, ice: null, board: null, grill: null });
export const targetLocation = (t: OutputTarget): Location =>
  'tray' in t ? `tray:${t.tray}:${t.slot}` : `station:${t.station}:${t.slot}`;
export const reserved = (s: GameState, location: Location) =>
  Object.values(s.routing).some((t) => t && targetLocation(t) === location);
export function reserveOutput(s: GameState, id: keyof Routing, tray: TrayId): boolean {
  if (s.routing[id]) return false;
  if (id === 'grill') {
    if (['processing', 'ready'].includes(s.stations.board.status)) return false;
    const slot = [0, 1, 2, 3, 4].find(
      (n) =>
        !s.items.some((i) => i.location === `station:board:${n}`) &&
        !reserved(s, `station:board:${n}`),
    );
    if (slot === undefined) return false;
    s.routing[id] = { station: 'board', slot };
    return true;
  }
  if (s.trays[tray].remaining || (s.mode !== 'service' && tray !== 0)) return false;
  const slot = ([0, 1, 2] as const).find(
    (n) =>
      !s.items.some((i) => i.location === `tray:${tray}:${n}`) &&
      !reserved(s, `tray:${tray}:${n}`) &&
      !(s.helper?.tray === tray && s.helper.slots.includes(n)),
  );
  if (slot === undefined) return false;
  s.routing[id] = { tray, slot };
  return true;
}
/** A committed transition, never an animation callback. Invalid destination keeps food ready. */
export function routeReady(s: GameState): boolean {
  let changed = false;
  for (const id of ['machine', 'ice', 'board', 'grill'] as const) {
    const target = s.routing[id],
      device = id === 'machine' ? s.machine : s.stations[id];
    if (!target || device.status !== 'ready') continue;
    const location = targetLocation(target);
    if (
      s.items.some((i) => i.location === location) ||
      ('tray' in target
        ? s.trays[target.tray].remaining > 0
        : ['processing', 'ready'].includes(s.stations.board.status))
    )
      continue;
    const item = s.items.find((i) =>
      id === 'machine' ? i.location === 'machine:cup' : i.location.startsWith(`station:${id}:`),
    );
    if (!item) continue;
    s.items = s.items.map((i) => (i.id === item.id ? { ...i, location } : i));
    s.routing[id] = null;
    if (id === 'machine') s.machine = { status: 'empty', remaining: 0, jobId: null };
    else s.stations[id] = { status: 'empty', remaining: 0, recipe: null };
    if ('station' in target) s.stations.board.status = 'loaded';
    changed = true;
  }
  return changed;
}
