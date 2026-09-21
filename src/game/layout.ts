import type { Mode } from '../content/catalog';
import type { ActorPoint } from './actor';
export interface Point {
  x: number;
  y: number;
}
export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface Layout {
  width: number;
  height: number;
  landscape: boolean;
  scale: number;
  regions: Record<'top' | 'guests' | 'work' | 'trays' | 'action' | 'supplies' | 'feedback', Region>;
  guests: [Point, Point];
  machine: Point;
  helper: Point;
  trays: [Point, Point];
  supplies: [Point, Point, Point];
  clear: Point;
  trayWidth: number;
  guestHeight: number;
}
const center = (r: Region): Point => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
/** All positions are allocated from measured content space, in CSS pixels.
 * The host owns viewport and safe-area accounting; this function never subtracts it again. */
export function layoutFor(width: number, height: number, mode: Mode = 'service'): Layout {
  const landscape = width > height * 1.2;
  const r = (x: number, y: number, w: number, h: number): Region => ({ x, y, width: w, height: h });
  const top = r(8, 4, width - 16, 52);
  let regions: Layout['regions'];
  if (!landscape) {
    const extra = Math.max(0, height - 608);
    let y = 60;
    const row = (h: number) => {
      const v = r(8, y, width - 16, h);
      y += h + 4;
      return v;
    };
    regions = {
      top,
      guests: row(108 + extra * 0.35),
      work: row(154 + extra * 0.45),
      trays: row(96 + extra * 0.2),
      action: row(48),
      supplies: row(72),
      feedback: row(42),
    };
  } else {
    const bottom = height - 102;
    regions = {
      top,
      guests: r(8, 60, width * 0.31 - 12, bottom - 60),
      work: r(width * 0.32, 60, width * 0.34, bottom - 60),
      trays: r(width * 0.68, 60, width * 0.31 - 8, bottom - 116),
      action: r(width * 0.68, bottom - 52, width * 0.31 - 8, 48),
      supplies: r(8, bottom + 4, width - 16, 68),
      feedback: r(8, height - 28, width - 16, 28),
    };
  }
  const g = regions.guests,
    w = regions.work,
    t = regions.trays;
  const single = mode !== 'service';
  const guests: [Point, Point] = [
    { x: g.x + g.width * 0.25, y: g.y + (landscape ? 55 : g.height - 40) },
    { x: g.x + g.width * 0.75, y: g.y + (landscape ? 55 : g.height - 40) },
  ];
  if (single) guests[0] = guests[1] = { x: g.x + g.width / 2, y: guests[0].y };
  const trayWidth = landscape
    ? Math.min(200, t.width)
    : single
      ? Math.min(190, t.width)
      : Math.min(185, (t.width - 10) / 2);
  const trays: [Point, Point] = landscape
    ? [
        { x: t.x + t.width / 2, y: t.y + 32 },
        { x: t.x + t.width / 2, y: t.y + t.height - 26 },
      ]
    : [
        { x: single ? width / 2 : t.x + t.width * 0.25, y: t.y + t.height / 2 },
        { x: t.x + t.width * 0.75, y: t.y + t.height / 2 },
      ];
  const machine = { x: w.x + w.width * (landscape ? 0.5 : 0.29), y: w.y + 58 };
  const helper = landscape
    ? { x: g.x + g.width * 0.62, y: g.y + g.height - 34 }
    : { x: w.x + w.width * 0.79, y: w.y + 70 };
  const supplies = [0, 1, 2].map((i) => ({
    x: regions.supplies.x + (regions.supplies.width * (i + 0.5)) / 3,
    y: center(regions.supplies).y,
  })) as [Point, Point, Point];
  return {
    width,
    height,
    landscape,
    regions,
    guests,
    machine,
    helper,
    trays,
    supplies,
    clear: center(regions.feedback),
    trayWidth,
    guestHeight: Math.min(80, g.height - 48),
    scale: Math.min(1.1, Math.max(0.8, w.height / 180)),
  };
}
export function supplyPoint(l: Layout, index: number, count: number): Point {
  const r = l.regions.supplies;
  return { x: r.x + (r.width * (index + 0.5)) / count, y: r.y + r.height / 2 };
}
/** Saved action plans use the original logical stage. A piecewise affine projection
 * maps its named rows to the same measured rows as the stationary objects. */
export function projectActor(p: ActorPoint, l: Layout): Point {
  const rows = [0, 0.23, 0.43, 0.68, 0.85, 1];
  const ys = [
    0,
    l.guests[0].y,
    l.helper.y,
    l.trays[0].y,
    l.regions.supplies.y + l.regions.supplies.height / 2,
    l.height,
  ];
  let i = 0;
  while (i < rows.length - 2 && p.y > (rows[i + 1] ?? 1)) i++;
  const a = rows[i] ?? 0,
    b = rows[i + 1] ?? 1,
    t = (p.y - a) / (b - a);
  const y = (ys[i] ?? 0) + ((ys[i + 1] ?? l.height) - (ys[i] ?? 0)) * t;
  if (!l.landscape) return { x: p.x * l.width, y };
  const anchors = [
    { x: p.x * l.width, y: 0 },
    { x: l.regions.guests.x + p.x * l.regions.guests.width, y: l.guests[0].y },
    { x: l.helper.x + (p.x - 0.73) * l.width * 0.4, y: l.helper.y },
    { x: l.trays[p.x > 0.5 ? 1 : 0].x, y: l.trays[p.x > 0.5 ? 1 : 0].y },
    { x: p.x * l.width, y: l.regions.supplies.y + 34 },
    { x: p.x * l.width, y: l.height },
  ];
  const x0 = anchors[i]!,
    x1 = anchors[i + 1]!;
  return { x: x0.x + (x1.x - x0.x) * t, y: x0.y + (x1.y - x0.y) * t };
}
