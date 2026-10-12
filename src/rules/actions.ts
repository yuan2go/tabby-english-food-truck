import type { Mode } from '../content/catalog';
import { type ActorStop, buildPlan, HOME, samplePlan } from '../game/actor';
import { receiveAdventure } from './adventure';
import { experienceCommand, worldMoment } from './adventure-experience';
import type { ActorJob, GameState, TrayId } from './types';
export const trayAnchor = (tray: TrayId, mode: Mode = 'service') => ({
  x: mode === 'service' ? (tray === 0 ? 0.205 : 0.695) : 0.45,
  y: 0.68,
});
export const supplyAnchor = (product: string) => ({
  x: product === 'apple' ? 0.22 : 0.44,
  y: 0.74,
});
/** Queue only role actions; independent stations and the other tray keep running. */
export function queueActor(
  s: GameState,
  kind: ActorJob['kind'],
  id: string,
  stops: ActorStop[],
  itemIds: string[],
  tray?: TrayId,
  order?: string,
  fromHand?: true,
): number {
  if (s.actor.current?.kind === 'return' && !s.actor.queue.length) s.actor.current = null;
  const previous = s.actor.queue.at(-1) ?? s.actor.current;
  const from = previous ? samplePlan(previous.plan, previous.plan.duration).point : s.actor.point;
  const route = fromHand
    ? stops.map((stop) =>
        stop.event === 'lift'
          ? { ...stop, point: from, hold: 120 }
          : stop.event === 'return'
            ? { ...stop, point: HOME, hold: 120 }
            : stop,
      )
    : stops;
  const plan = buildPlan(
    id,
    from,
    route.map((stop, i) => (i === 0 && stop.pose === 'read' ? { ...stop, point: from } : stop)),
  );
  if (fromHand) {
    for (const phase of plan.phases)
      if (phase.from.x !== phase.to.x || phase.from.y !== phase.to.y)
        phase.duration = Math.max(180, phase.duration * 0.65);
    plan.duration = plan.phases.reduce((sum, phase) => sum + phase.duration, 0);
  }
  const job: ActorJob = {
    plan,
    elapsed: 0,
    kind,
    itemIds,
    ...(fromHand ? { fromHand: true as const } : {}),
    ...(tray !== undefined ? { tray } : {}),
    ...(order ? { order } : {}),
  };
  const delay =
    (s.actor.current ? s.actor.current.plan.duration - s.actor.current.elapsed : 0) +
    s.actor.queue.reduce((t, j) => t + j.plan.duration - j.elapsed, 0);
  if (s.actor.current) s.actor.queue.push(job);
  else s.actor.current = job;
  return delay + plan.duration;
}
export function advanceActor(s: GameState, delta: number): boolean {
  let time = delta;
  let changed = false;
  while (s.actor.current && time > 0) {
    const job = s.actor.current;
    const used = Math.min(time, job.plan.duration - job.elapsed);
    const before = job.elapsed;
    job.elapsed += used;
    if (job.kind === 'delivery' && job.itemIds.length) {
      let receiveAt = 0;
      for (const phase of job.plan.phases) {
        receiveAt += phase.duration;
        if (phase.event === 'receive') break;
      }
      if (before < receiveAt && job.elapsed >= receiveAt) {
        const received = s.items.filter((i) => job.itemIds.includes(i.id));
        const order = s.orders.find((o) => o.id === job.order);
        receiveAdventure(
          s,
          received,
          job.worldTarget ?? job.order ?? 'delivery',
          order?.visitor ??
            (order && s.adventure?.kind === 'shop'
              ? order.seat === 0
                ? 'rabbit'
                : 'hedgehog'
              : undefined),
          job.creationGroup ?? job.plan.id,
        );
        if (job.shareWith && received[0]) {
          const shared = experienceCommand(s, {
            type: 'adventure',
            action: 'share',
            visitor: job.shareWith,
            item: received[0].id,
          });
          if (shared?.kind !== 'ok') {
            const food = s.adventure?.foods.find((f) => f.id === received[0]?.id);
            if (food) {
              food.place = 'work';
              worldMoment(s, {
                kind: 'place',
                destination: 'work',
                visitor: job.shareWith,
                foods: [{ id: food.id, product: food.product }],
              });
            }
          }
        }
        s.items = s.items.filter((i) => !job.itemIds.includes(i.id));
        job.itemIds = [];
        changed = true;
      }
    }
    time -= used;
    s.actor.point = samplePlan(job.plan, job.elapsed).point;
    if (job.elapsed >= job.plan.duration) {
      changed = true;
      s.actor.current = s.actor.queue.shift() ?? null;
      if (!s.actor.current && job.kind !== 'return')
        queueActor(
          s,
          'return',
          `return-${job.plan.id}`,
          [{ point: HOME, pose: 'idle', hold: 120 }],
          [],
        );
    }
  }
  return changed;
}
export function cancelHelperActor(s: GameState): void {
  s.actor.queue = s.actor.queue.filter((j) => j.kind !== 'helper');
  if (s.actor.current?.kind === 'helper') {
    s.actor.current = null;
    // Rebase all queued plans, so no task starts from the cancelled destination.
    const queued = s.actor.queue;
    s.actor.queue = [];
    for (const j of queued) {
      const stops = j.plan.phases
        .filter((p) => p.from.x === p.to.x && p.from.y === p.to.y)
        .map((p) => ({
          point: p.to,
          pose: p.pose,
          hold: p.duration,
          ...(p.event ? { event: p.event } : {}),
        }));
      queueActor(s, j.kind, j.plan.id, stops, j.itemIds, j.tray, j.order, j.fromHand);
      const rebased = s.actor.queue.at(-1) ?? s.actor.current;
      if (rebased && j.worldTarget) rebased.worldTarget = j.worldTarget;
    }
  }
  alignActionTimers(s);
  if (!s.actor.current)
    queueActor(s, 'return', 'return', [{ point: HOME, pose: 'idle', hold: 100 }], []);
}

export function alignActionTimers(s: GameState): void {
  let time = 0;
  for (const j of [...(s.actor.current ? [s.actor.current] : []), ...s.actor.queue]) {
    time += j.plan.duration - j.elapsed;
    if (j.kind === 'helper' && s.helper) s.helper.remaining = time;
    if (j.kind === 'delivery' && j.tray !== undefined) {
      s.trays[j.tray].remaining = time;
      const order = s.orders.find((o) => o.id === j.order);
      if (order) order.remaining = time;
    }
  }
}
