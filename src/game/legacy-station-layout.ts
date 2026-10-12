// Historical saved-anchor geometry, kept for migration regression; no renderer or input.
import type { StationId } from '../content/recipes';
import type { Layout, Point } from './layout';
export function stationPoint(id: StationId, l: Layout): Point {
  const r = l.regions.work;
  return {
    x: r.x + r.width * (id === 'grill' ? 0.24 : id === 'board' ? 0.72 : 0.5),
    y: r.y + (l.form === 'desktop' || l.form === 'tablet' ? 96 : 52),
  };
}
export function stationActionPoint(id: StationId, l: Layout): Point {
  const p = stationPoint(id, l);
  return { x: p.x, y: Math.min(l.regions.work.y + l.regions.work.height - 24, p.y + 89 * l.scale) };
}
export function stationSlotPoint(id: StationId, slot: number, l: Layout): Point {
  const p = stationPoint(id, l);
  if (id === 'grill') return p;
  return { x: p.x + ((slot % 3) - 1) * 48, y: p.y + (slot < 3 ? -22 : 26) };
}
