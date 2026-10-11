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
  form: 'phone' | 'short' | 'tablet' | 'desktop';
  stage: Region;
  dialogue: Region;
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
  actorHeight: number;
}
const center = (r: Region): Point => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
/** Shared physical-tool and activity handoff row; targets never cover each other. */
export function kitchenActions(l: Layout, toolCount: number, commission: boolean) {
  const r = l.regions.action;
  if (!commission) return { tools: r, handoff: null };
  const width = Math.min(l.width - 16, Math.max(r.width, toolCount * 44 + 80));
  const x = Math.max(8, r.x + r.width - width);
  const handoffWidth = Math.min(132, width - toolCount * 44 - 8);
  return {
    tools: { ...r, x, width: width - handoffWidth - 8 },
    handoff: { ...r, x: x + width - handoffWidth, width: handoffWidth },
  };
}
/** All positions are allocated from measured content space, in CSS pixels.
 * The host owns viewport and safe-area accounting; this function never subtracts it again. */
function physicalLayout(
  width: number,
  height: number,
  mode: Mode = 'service',
  viewport = { width, height },
): Omit<Layout, 'dialogue'> {
  const landscape = width > height * 1.2;
  const r = (x: number, y: number, w: number, h: number): Region => ({ x, y, width: w, height: h });
  const form: Layout['form'] =
    viewport.width >= 1100 && viewport.height >= 650
      ? 'desktop'
      : viewport.width >= 700 && viewport.height >= 600
        ? 'tablet'
        : landscape
          ? 'short'
          : 'phone';
  const stage =
    form === 'desktop'
      ? r((width - Math.min(width - 32, 1060)) / 2, 0, Math.min(width - 32, 1060), height)
      : r(0, 0, width, height);
  const top = r(8, 4, width - 16, 52);
  let regions: Layout['regions'];
  if (form === 'desktop') {
    const x = stage.x,
      sw = stage.width,
      workY = Math.max(180, height * 0.25),
      supplyY = Math.min(height - 122, Math.max(workY + 310, height * 0.76));
    regions = {
      top,
      guests: r(x + 25, 68, sw * 0.34, workY - 58),
      work: r(x + sw * 0.3, workY, sw * 0.39, 245),
      trays: r(x + sw * 0.69, workY + 115, sw * 0.29, 230),
      action: r(x + sw * 0.7, workY + 307, sw * 0.28, 54),
      supplies: r(x + sw * 0.2, supplyY, sw * 0.58, 86),
      feedback: r(x + 20, height - 36, sw - 40, 30),
    };
  } else if (form === 'tablet') {
    const workY = Math.max(185, height * 0.25);
    const supplyY = Math.min(height - 132, workY + 470);
    regions = {
      top,
      guests: r(16, 90, width * 0.3, workY - 60),
      work: r(width * 0.26, workY, width * 0.43, 245),
      trays: r(width * 0.68, workY + 55, width * 0.3 - 10, 220),
      action: r(width * 0.69, workY + 300, width * 0.29 - 10, 50),
      supplies: r(18, supplyY, width - 36, 84),
      feedback: r(8, height - 30, width - 16, 28),
    };
  } else if (!landscape) {
    const extra = Math.max(0, height - 565);
    const deficit = Math.max(0, 565 - height);
    let y = 60;
    const row = (h: number) => {
      const v = r(8, y, width - 16, h);
      y += h + 4;
      return v;
    };
    regions = {
      top,
      guests: row(64 + extra * 0.35 - deficit * 0.35),
      work: row(149 + extra * 0.45),
      trays: row(119 + extra * 0.2 - deficit * 0.65),
      action: row(48),
      supplies: row(72),
      feedback: row(28),
    };
  } else {
    const bottom = height - 102;
    regions = {
      top,
      guests: r(8, 60, width * 0.2 - 12, bottom - 60),
      work: r(width * 0.21, 60, width * 0.28, bottom - 60),
      trays: r(width * 0.5, 60, width * 0.5 - 8, bottom - 108),
      action: r(width * 0.5, bottom - 48, width * 0.5 - 8, 48),
      supplies: r(8, bottom + 4, width - 16, 68),
      feedback: r(8, height - 28, width - 16, 28),
    };
  }
  // A stable recovery slot beside the ingredients, not over the selected food.
  regions.supplies = { ...regions.supplies, width: regions.supplies.width - 56 };
  const g = regions.guests,
    w = regions.work,
    t = regions.trays;
  if (form === 'phone') regions.feedback = r(8, height - 47, width - 16, 42);
  const single = mode !== 'service';
  const guests: [Point, Point] = [
    {
      x: g.x + g.width * (form === 'desktop' ? 0.3 : form === 'short' ? 0.25 : 0.18),
      y:
        g.y +
        (landscape
          ? Math.min(105, g.height * 0.56)
          : form === 'phone'
            ? g.height / 2
            : g.height - 40),
    },
    {
      x: g.x + g.width * (form === 'desktop' ? 0.68 : form === 'short' ? 0.75 : 0.48),
      y:
        g.y +
        (landscape
          ? Math.min(105, g.height * 0.56)
          : form === 'phone'
            ? g.height / 2
            : g.height - 40),
    },
  ];
  if (single)
    guests[0] = guests[1] = { x: g.x + g.width * (landscape ? 0.5 : 0.28), y: guests[0].y };
  let trayWidth = landscape
    ? form === 'desktop'
      ? Math.min(210, (t.width - 16) / (single ? 1 : 2))
      : Math.min(176, (t.width - 20) / 2)
    : single
      ? Math.min(190, t.width)
      : Math.min(185, (t.width - 10) / 2);
  let trays: [Point, Point] =
    landscape || form === 'tablet'
      ? [
          {
            x: single ? t.x + t.width * 0.5 : t.x + t.width * 0.25,
            y:
              form === 'desktop' || form === 'tablet'
                ? Math.min(t.y + t.height * 0.58, regions.action.y - 104)
                : regions.action.y - 96,
          },
          {
            x: t.x + t.width * 0.75,
            y:
              form === 'desktop' || form === 'tablet'
                ? Math.min(t.y + t.height * 0.58, regions.action.y - 104)
                : regions.action.y - 96,
          },
        ]
      : [
          {
            x: single ? width / 2 : t.x + t.width * 0.25,
            y: Math.min(t.y + t.height / 2 - 30, regions.action.y - 104),
          },
          { x: t.x + t.width * 0.75, y: Math.min(t.y + t.height / 2 - 30, regions.action.y - 104) },
        ];
  // Portrait Pad has room for two complete vertical trays, not six squeezed
  // food targets across a narrow rail. Keep the same 96px block and controls.
  if (form === 'tablet' && !landscape) {
    trayWidth = Math.min(190, t.width);
    const last = regions.action.y - 104;
    trays = [
      { x: t.x + t.width / 2, y: single ? last : last - 108 },
      { x: t.x + t.width / 2, y: last },
    ];
  }
  if (single) trays[1] = { ...trays[0] };
  const machine = {
    x: w.x + w.width * (landscape || form === 'tablet' ? 0.5 : 0.29),
    y: w.y + (form === 'desktop' || form === 'tablet' ? 96 : 58),
  };
  const helper =
    form === 'desktop'
      ? { x: w.x + w.width * 0.82, y: regions.supplies.y - 34 }
      : form === 'tablet'
        ? { x: w.x - 15, y: w.y + 230 }
        : landscape
          ? { x: g.x + g.width * 0.92, y: g.y + g.height - 34 }
          : {
              x: g.x + g.width * 0.84,
              y:
                g.y +
                g.height -
                4 -
                Math.min(130, g.height - 8) / 2 +
                28 * Math.min(1.1, Math.max(0.8, w.height / 180)),
            };
  const supplies = [0, 1, 2].map((i) => ({
    x: regions.supplies.x + (regions.supplies.width * (i + 0.5)) / 3,
    y: center(regions.supplies).y,
  })) as [Point, Point, Point];
  return {
    width,
    height,
    landscape,
    form,
    stage,
    regions,
    guests,
    machine,
    helper,
    trays,
    supplies,
    clear: center(regions.feedback),
    trayWidth,
    guestHeight:
      form === 'desktop' ? 130 : Math.max(48, Math.min(form === 'short' ? 52 : 90, g.height - 44)),
    actorHeight:
      form === 'desktop'
        ? 170
        : landscape
          ? Math.min(125, g.height - 30)
          : Math.min(130, g.height - 8),
    scale:
      form === 'desktop'
        ? 1.45
        : form === 'tablet'
          ? 1.3
          : Math.min(1.2, Math.max(0.8, w.height / 180)),
  };
}
/** One food strip above two distinct 48px actions, within the allocated 96px.
 * Shared by drawing, hit testing and motion; contents never retain old anchors. */
export function traySurface(l: Layout, tray: 0 | 1) {
  const p = l.trays[tray];
  const width = Math.min(148, (l.trayWidth - 8) / 2);
  return {
    food: { x: p.x, y: p.y + 25 },
    plate: { x: p.x, y: p.y + 32 },
    destination: { x: p.x + (width + 8) / 2, y: p.y + 72, width, height: 48 },
    handle: { x: p.x - (width + 8) / 2, y: p.y + 72, width, height: 48 },
  };
}
export function recoveryControl(l: Layout): Region {
  const r = l.regions.supplies;
  return { x: r.x + r.width + 8, y: r.y + (r.height - 48) / 2, width: 48, height: 48 };
}
export function supplyPoint(l: Layout, index: number, count: number): Point {
  const r = l.regions.supplies;
  return { x: r.x + (r.width * (index + 0.5)) / count, y: r.y + r.height / 2 };
}
/** Saved action plans use the original logical stage. A piecewise affine projection
 * maps its named rows to the same measured rows as the stationary objects. */
export function projectActor(p: ActorPoint, l: Layout): Point {
  const first = traySurface(l, 0).plate;
  const second = traySurface(l, 1).plate;
  const blend = Math.min(1, Math.max(0, (p.x - 0.205) / 0.49));
  const tray = {
    x: first.x + (second.x - first.x) * blend,
    y: first.y + (second.y - first.y) * blend,
  };
  const rows = [0, 0.23, 0.43, 0.68, 0.85, 1];
  const ys = [
    0,
    l.guests[0].y,
    l.helper.y,
    tray.y,
    l.regions.supplies.y + l.regions.supplies.height / 2,
    l.height,
  ];
  let i = 0;
  while (i < rows.length - 2 && p.y > (rows[i + 1] ?? 1)) i++;
  const a = rows[i] ?? 0,
    b = rows[i + 1] ?? 1,
    t = (p.y - a) / (b - a);
  const y = (ys[i] ?? 0) + ((ys[i + 1] ?? l.height) - (ys[i] ?? 0)) * t;
  if (!l.landscape) {
    const xs = [
      p.x * l.width,
      l.guests[p.x > 0.5 ? 1 : 0].x,
      l.helper.x + (p.x - 0.73) * l.width,
      tray.x,
      p.x * l.width,
      p.x * l.width,
    ];
    return { x: (xs[i] ?? 0) + ((xs[i + 1] ?? 0) - (xs[i] ?? 0)) * t, y };
  }
  const anchors = [
    { x: p.x * l.width, y: 0 },
    { x: l.regions.guests.x + p.x * l.regions.guests.width, y: l.guests[0].y },
    { x: l.helper.x + (p.x - 0.73) * l.width * 0.4, y: l.helper.y },
    tray,
    { x: p.x * l.width, y: l.regions.supplies.y + 34 },
    { x: p.x * l.width, y: l.height },
  ];
  const x0 = anchors[i] ?? l.helper,
    x1 = anchors[i + 1] ?? l.helper;
  return { x: x0.x + (x1.x - x0.x) * t, y: x0.y + (x1.y - x0.y) * t };
}

/** Allocate sentence space before physical objects; Canvas and DOM share this projection. */
export function layoutFor(width: number, height: number, mode: Mode = 'service'): Layout {
  const short = width > height * 1.2 && height < 600;
  if (short) {
    const side = Math.min(260, width * 0.29);
    const l = physicalLayout(width - side, height, mode);
    const dx = side;
    for (const name of Object.keys(l.regions) as (keyof Layout['regions'])[])
      if (name !== 'top') l.regions[name].x += dx;
    for (const p of [
      ...new Set([...l.guests, l.machine, l.helper, ...l.trays, ...l.supplies, l.clear]),
    ])
      p.x += dx;
    l.stage.x += dx;
    l.width = width;
    l.regions.top.width = width - 16;
    return { ...l, dialogue: { x: 8, y: 60, width: side - 16, height: height - 70 } };
  }
  const reserve = 132;
  const l = physicalLayout(width, height - reserve, mode, { width, height });
  for (const name of Object.keys(l.regions) as (keyof Layout['regions'])[])
    if (name !== 'top') l.regions[name].y += reserve;
  for (const p of [...new Set(l.guests), l.machine, l.helper, ...l.trays, ...l.supplies, l.clear])
    p.y += reserve;
  l.height = height;
  l.stage.height = height;
  return { ...l, dialogue: { x: l.stage.x + 8, y: 60, width: l.stage.width - 16, height: 124 } };
}
