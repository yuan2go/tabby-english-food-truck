/** A small serial action plan, shared by rules and presentation. Coordinates are
 * normalized stage anchors so rotation projects the same phase into a new layout. */
export interface ActorPoint {
  x: number;
  y: number;
}
export interface ActorStop {
  point: ActorPoint;
  pose: string;
  hold: number;
  event?: string;
}
export interface ActorPhase {
  from: ActorPoint;
  to: ActorPoint;
  pose: string;
  duration: number;
  event?: string;
}
export interface ActorPlan {
  id: string;
  phases: ActorPhase[];
  duration: number;
}
export interface ActorFrame {
  point: ActorPoint;
  pose: string;
  phase: number;
  progress: number;
  moving: boolean;
  event?: string;
}
export const HOME = { x: 0.73, y: 0.43 };
export function buildPlan(id: string, from: ActorPoint, stops: readonly ActorStop[]): ActorPlan {
  const phases: ActorPhase[] = [];
  let at = { ...from };
  for (const stop of stops) {
    const distance = Math.hypot(stop.point.x - at.x, (stop.point.y - at.y) * 1.4);
    if (distance > 0.001)
      phases.push({
        from: { ...at },
        to: { ...stop.point },
        pose: 'carry',
        duration: Math.max(240, (distance / 0.32) * 1000),
      });
    if (stop.hold > 0)
      phases.push({
        from: { ...stop.point },
        to: { ...stop.point },
        pose: stop.pose,
        duration: stop.hold,
        ...(stop.event ? { event: stop.event } : {}),
      });
    at = { ...stop.point };
  }
  if (!phases.length) phases.push({ from: at, to: at, pose: 'idle', duration: 1 });
  return { id, phases, duration: phases.reduce((sum, p) => sum + p.duration, 0) };
}
export function samplePlan(plan: ActorPlan, elapsed: number): ActorFrame {
  let time = Math.max(0, elapsed);
  for (const [index, p] of plan.phases.entries()) {
    if (time <= p.duration || index === plan.phases.length - 1) {
      const t = Math.min(1, time / p.duration);
      const ease = t * t * (3 - 2 * t);
      return {
        point: {
          x: p.from.x + (p.to.x - p.from.x) * ease,
          y: p.from.y + (p.to.y - p.from.y) * ease,
        },
        pose: p.pose,
        phase: index,
        progress: t,
        moving: p.from.x !== p.to.x || p.from.y !== p.to.y,
        ...(p.event ? { event: p.event } : {}),
      };
    }
    time -= p.duration;
  }
  throw new Error('Empty actor plan');
}
export class ActorScheduler {
  plan: ActorPlan | null = null;
  elapsed = 0;
  private queue: { id: string; stops: ActorStop[] }[] = [];
  frame: ActorFrame;
  constructor(point: ActorPoint = HOME) {
    this.frame = { point: { ...point }, pose: 'idle', phase: 0, progress: 0, moving: false };
  }
  schedule(id: string, stops: ActorStop[], interrupt = false): void {
    if (this.plan && !interrupt) {
      if (this.queue.length < 4) this.queue.push({ id, stops });
      return;
    }
    if (interrupt) this.queue = [];
    this.plan = buildPlan(id, this.frame.point, stops);
    this.elapsed = 0;
    this.frame = samplePlan(this.plan, 0);
  }
  follow(plan: ActorPlan, elapsed: number): void {
    this.plan = plan;
    this.elapsed = elapsed;
    this.frame = samplePlan(plan, elapsed);
  }
  advance(delta: number): void {
    if (!this.plan || delta <= 0) return;
    this.elapsed = Math.min(this.plan.duration, this.elapsed + delta);
    this.frame = samplePlan(this.plan, this.elapsed);
    if (this.elapsed >= this.plan.duration) {
      this.plan = null;
      const next = this.queue.shift();
      if (next) this.schedule(next.id, next.stops);
    }
  }
  cancel(): void {
    this.plan = null;
    this.queue = [];
    this.schedule('return', [{ point: HOME, pose: 'idle', hold: 120 }], true);
  }
}
