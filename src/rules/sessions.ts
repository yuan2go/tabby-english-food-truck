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
    heard: false,
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
  concurrency: 1 | 2 = 1,
  menu?: RequestId[],
): GameState {
  s.session = {
    activity,
    chapter,
    support,
    concurrency,
    menu: menu ?? endlessPool(unlocked, 'less'),
    family: CHAPTERS[chapter]?.family ?? 'juice',
    unlocked: [...unlocked],
    seed: seed >>> 0,
    cursor: 0,
    served: 0,
    lastRequest: '',
  };
  s.mode = activity === 'endless' || concurrency === 2 ? 'service' : 'practice';
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
      i < concurrency ? 'waiting' : 'queued',
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
  const pool = endlessPool(s.session.unlocked, s.session.support).filter((r) =>
    s.session.menu.includes(r),
  );
  if (!pool.length) return;
  // Existing customers stay when support increases; replace them only up to
  // the new policy's concurrency, without deleting an in-progress order.
  const max = s.session.concurrency;
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

/** Existing jobs and food are never removed by a change of support or load. */
export function applyPolicy(s: GameState, support: Support, concurrency: 1 | 2): void {
  s.session.support = support;
  s.session.concurrency = concurrency;
  s.orders = s.orders.map((o) => (o.status === 'waiting' ? { ...o } : o));
  for (const o of s.orders) {
    if (o.status !== 'waiting') continue;
    if (support !== 'less')
      o.support = [
        ...new Set([
          ...o.support,
          'picture-request',
          ...(support === 'demonstration' ? ['guided'] : []),
        ]),
      ].slice(-24);
  }
  // A legacy one-tray layout changes only at an idle action boundary.
  if (concurrency === 2 && !s.actor.current && !s.helper && !s.trays.some((t) => t.remaining))
    s.mode = 'service';
  if (s.mode === 'service' || concurrency === 1) replenish(s);
}
