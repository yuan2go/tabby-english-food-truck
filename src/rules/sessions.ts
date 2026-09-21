import type { RequestId } from '../content/catalog';
import { type Activity, CHAPTERS, endlessPool, randomAt, type Support } from '../content/chapters';
import type { Family } from '../content/recipes';
import type { GameState, Order, TrayId } from './types';
export function orderFor(
  s: GameState,
  request: RequestId,
  index: number,
  seat: TrayId,
  status: Order['status'],
): Order {
  return {
    id: `guest-${index}`,
    request,
    seat,
    status,
    remaining: 0,
    revisit: Boolean(s.history[request]?.length),
    support:
      s.session.support === 'demonstration'
        ? ['guided', 'picture-request']
        : s.session.support === 'pictures'
          ? ['picture-request']
          : [],
  };
}
export function configureSession(
  s: GameState,
  activity: Activity,
  chapter: number,
  support: Support,
  unlocked: Family[],
  seed: number,
): GameState {
  s.session = {
    activity,
    chapter,
    support,
    family: CHAPTERS[chapter]?.family ?? 'juice',
    unlocked: [...unlocked],
    seed: seed >>> 0,
    cursor: 0,
    served: 0,
    lastRequest: '',
  };
  s.mode = support === 'less' && (activity === 'endless' || chapter === 4) ? 'service' : 'practice';
  s.items = [];
  s.machine = { status: 'empty', remaining: 0, jobId: null };
  const requests: readonly RequestId[] =
    activity === 'story'
      ? (CHAPTERS[chapter]?.requests ?? ['apple'])
      : activity === 'training'
        ? chapter === 0
          ? ['apple', 'banana', 'two', 'fruit', 'juice']
          : (CHAPTERS[chapter]?.requests ?? ['apple'])
        : [];
  s.orders = requests.map((r, i) =>
    orderFor(
      s,
      r,
      i,
      (s.mode === 'service' ? i % 2 : s.variant) as TrayId,
      i < (s.mode === 'service' ? 2 : 1) ? 'waiting' : 'queued',
    ),
  );
  if (activity === 'endless') replenish(s);
  return s;
}
export function replenish(s: GameState): void {
  if (s.session.activity !== 'endless') return;
  const done = s.orders.filter((o) => o.status === 'done');
  s.session.served += done.length;
  s.orders = s.orders.filter((o) => o.status !== 'done');
  const pool = endlessPool(s.session.unlocked, s.session.support);
  // Existing customers stay when support increases; replace them only up to
  // the new policy's concurrency, without deleting an in-progress order.
  const max = s.mode === 'service' && s.session.support === 'less' ? 2 : 1;
  while (s.orders.length < max) {
    const cursor = s.session.cursor++;
    let request = pool[Math.floor(randomAt(s.session.seed, cursor) * pool.length)] ?? 'apple';
    if (request === s.session.lastRequest)
      request = pool[(pool.indexOf(request) + 1) % pool.length] ?? 'apple';
    const seat = ([0, 1] as const).find((seat) => !s.orders.some((o) => o.seat === seat)) ?? 0;
    s.orders.push(orderFor(s, request, cursor, seat, 'waiting'));
    s.session.lastRequest = request;
  }
}
