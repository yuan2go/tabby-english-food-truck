import type { GameState } from '../rules/types';
export interface StageRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface TogetherLayout {
  guests: StageRect[];
  seats: StageRect[];
  bubbles: StageRect[];
  table: StageRect;
  preparation: StageRect;
  supplies: StageRect;
  dami: StageRect;
  hand: StageRect;
  pause: StageRect;
  footer: StageRect;
  short: boolean;
}
export function togetherLayout(width: number, height: number, count = 2): TogetherLayout {
  const short = height < 500 && width > 600;
  const inset = Math.max(10, (width - 1040) / 2);
  const w = width - inset * 2;
  const sceneWidth = short ? w * 0.42 : w;
  const tableY = short ? height * 0.56 : height * 0.27;
  const body = Math.min(
    short ? 125 : 205,
    height * (short ? 0.34 : 0.18),
    sceneWidth / (count + 0.35),
  );
  const actorWidth = Math.min(200, (sceneWidth / count) * 0.76);
  const guests = Array.from({ length: count }, (_, i) => ({
    x: inset + (sceneWidth * (i + 0.5)) / count - actorWidth / 2,
    y: tableY - body + 30,
    width: actorWidth,
    height: body,
  }));
  const seats = guests.map((r) => {
    const width = Math.max(104, Math.min(112, r.width * 0.56));
    return {
      x: r.x + (r.width - width) / 2,
      y: tableY + 4,
      width,
      height: 52,
    };
  });
  const bubbles = guests.map((r) => {
    const width = Math.min(330, sceneWidth / count - 8);
    return { x: r.x + r.width / 2 - width / 2, y: short ? 47 : 49, width, height: short ? 58 : 75 };
  });
  const preparation = short
    ? { x: inset + w * 0.48, y: 100, width: w * 0.52, height: height - 200 }
    : {
        x: inset,
        y: tableY + Math.min(60, height * 0.09) + 54,
        width: w,
        height: Math.max(130, height - tableY - Math.min(60, height * 0.09) - 89),
      };
  const dami = short
    ? { x: inset + w * 0.34, y: height - 172, width: w * 0.13, height: 135 }
    : {
        x: inset + w / 2 - Math.min(110, w * 0.26) / 2,
        y: tableY - 45,
        width: Math.min(110, w * 0.26),
        height: Math.min(90, height * 0.14),
      };
  return {
    guests,
    seats,
    bubbles,
    table: { x: inset, y: tableY, width: sceneWidth, height: Math.min(60, height * 0.09) },
    preparation,
    supplies: short
      ? { x: preparation.x, y: height - 93, width: preparation.width, height: 60 }
      : { x: inset, y: height - 96, width: w * 0.72, height: 64 },
    dami,
    hand: { x: dami.x - 5, y: dami.y + 65, width: dami.width + 5, height: 62 },
    pause: { x: width - 62, y: 3, width: 52, height: 48 },
    footer: { x: inset, y: height - 30, width: w, height: 28 },
    short,
  };
}

/** Both sprite and carried food read the same actual delivery-clock projection. */
export function togetherDamiRect(s: GameState, l: TogetherLayout): StageRect {
  const job = s.actor.current;
  if (job?.kind !== 'delivery') return l.dami;
  const order = s.orders.find((o) => o.id === job.order);
  const target =
    job.worldTarget === 'create'
      ? { x: l.table.x + l.table.width * 0.36, y: l.table.y + l.table.height - 52 }
      : job.worldTarget === 'pack'
        ? { x: l.table.x + 104, y: l.table.y + l.table.height }
        : l.seats[
            job.worldTarget === 'cool'
              ? 1
              : order?.visitor
                ? order.visitor === 'hedgehog'
                  ? 1
                  : order.visitor === 'elder'
                    ? 2
                    : 0
                : (order?.seat ?? 0)
          ];
  if (!target) return l.dami;
  let received = 0;
  for (const phase of job.plan.phases) {
    received += phase.duration;
    if (phase.event === 'receive') break;
  }
  const progress =
    job.elapsed <= received
      ? Math.min(1, job.elapsed / Math.max(1, received))
      : Math.max(0, 1 - (job.elapsed - received) / Math.max(1, job.plan.duration - received));
  return {
    ...l.dami,
    x: l.dami.x + (target.x - l.dami.x) * progress * 0.72,
    y: l.dami.y + (target.y - l.dami.y) * progress * 0.4,
  };
}
