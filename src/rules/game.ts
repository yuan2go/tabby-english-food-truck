import {
  CONTENT_VERSION,
  HELPER_MS,
  JUICE_MS,
  MODES,
  type Mode,
  type Product,
  REQUESTS,
  RETURN_MS,
  type RequestId,
  requestsFor,
} from '../content/catalog';
import { parseTokens } from '../content/phrases';
import type {
  Attempt,
  Destination,
  Envelope,
  GameState,
  Item,
  Location,
  Result,
  TrayId,
} from './types';
export function createGame(
  runId: string,
  variant: 0 | 1 = 0,
  priorSupport: Partial<Record<RequestId, string[]>> = {},
  mode: Mode = 'service',
): GameState {
  const requests = requestsFor(mode, variant);
  return {
    schemaVersion: 2,
    contentVersion: CONTENT_VERSION,
    mode,
    history: structuredClone(priorSupport),
    runId,
    revision: 0,
    nextId: mode === 'guided' && variant === 1 ? 2 : 1,
    variant,
    gameTime: 0,
    items:
      mode === 'guided' && variant === 1
        ? [{ id: 'food-1', product: 'cup', location: 'machine:cup' }]
        : [],
    orders: requests.map((request, index) => ({
      id: `guest-${index}`,
      request,
      seat: mode === 'service' ? (index as TrayId) : variant,
      status: mode === 'service' || index === 0 ? 'waiting' : 'queued',
      remaining: 0,
      support: [
        ...new Set([
          ...(priorSupport[request] ?? []),
          ...(mode === 'guided'
            ? ['guided', 'picture-request', ...(variant === 1 ? ['guided-preparation'] : [])]
            : []),
        ]),
      ],
    })),
    machine: {
      status: mode === 'guided' && variant === 1 ? 'loaded' : 'empty',
      remaining: 0,
      jobId: null,
    },
    helper: null,
    trays: [{ remaining: 0 }, { remaining: 0 }],
    receipts: [],
    attempts: [],
    audio: [],
    lessons: [],
    noteSupport: [],
  };
}
export const trayItems = (s: GameState, tray: TrayId) =>
  s.items.filter((i) => i.location.startsWith(`tray:${tray}:`));
export function freeSlots(s: GameState, tray: TrayId): (0 | 1 | 2)[] {
  if (!MODES[s.mode].trays.includes(tray)) return [];
  return ([0, 1, 2] as const).filter(
    (slot) =>
      !s.items.some((i) => i.location === `tray:${tray}:${slot}`) &&
      !(s.helper?.tray === tray && s.helper.slots.includes(slot)),
  );
}
export function matchProducts(actual: readonly Product[], expected: readonly Product[]): boolean {
  return (
    actual.length === expected.length &&
    [...actual].sort().join('|') === [...expected].sort().join('|')
  );
}
function nextId(s: GameState, prefix: string): string {
  return `${prefix}-${s.nextId++}`;
}
function attempt(s: GameState, a: Omit<Attempt, 'runId' | 'gameTime' | 'retry'>): void {
  s.attempts.push({
    ...a,
    runId: s.runId,
    gameTime: s.gameTime,
    retry: s.attempts.filter(
      (t) =>
        t.activity === a.activity &&
        (a.activity === 'note' || t.input.startsWith(a.input.split(':')[0] ?? '')),
    ).length,
  });
  s.attempts = s.attempts.slice(-80);
}
function syncMachine(s: GameState): void {
  if (s.machine.status === 'processing' || s.machine.status === 'ready') return;
  s.machine.status = s.items.some((i) => i.location.startsWith('machine:')) ? 'loaded' : 'empty';
}
export function dispatch(current: GameState, e: Envelope): Result {
  if (e.runId !== current.runId)
    return { state: current, kind: 'stale', message: '这次操作属于之前的一局。' };
  if (current.receipts.includes(e.id)) return { state: current, kind: 'duplicate', message: '' };
  const s = structuredClone(current);
  s.receipts = [...s.receipts, e.id].slice(-64);
  const result = (kind: Result['kind'], message: string): Result => {
    for (const o of s.orders)
      if (o.support.length || o.status !== 'queued')
        s.history[o.request] = [
          ...new Set([
            ...(s.history[o.request] ?? []),
            ...o.support,
            ...(o.status !== 'queued' ? ['seen-before'] : []),
          ]),
        ].slice(-24);
    s.revision++;
    return { state: s, kind, message };
  };
  const c = e.command;
  if (c.type === 'support') {
    for (const o of s.orders)
      if (c.order === 'all' || o.id === c.order)
        o.support = [...new Set([...o.support, c.reason])].slice(-24);
    return result('ok', '已记录这次文字或示范支持。');
  }
  if (c.type === 'lesson') {
    s.lessons = [...new Set([...s.lessons, c.lesson])].slice(-24);
    return result('ok', '先认识，再动手。');
  }
  if (c.type === 'note-support') {
    s.noteSupport = [...new Set([...s.noteSupport, c.reason])].slice(-24);
    return result('ok', '便签帮助已记录。');
  }
  if (c.type === 'audio') {
    s.audio = [...s.audio, { ...c.audio, gameTime: s.gameTime }].slice(-80);
    return result('ok', '');
  }
  if (c.type === 'move') {
    const source = c.source;
    const existing = 'item' in source ? s.items.find((i) => i.id === source.item) : undefined;
    if ('item' in c.source && !existing) return result('blocked', '物品已不在原处，请重新选择。');
    const product = existing?.product ?? ('supply' in c.source ? c.source.supply : 'apple');
    if (!existing && product === 'juice') return result('blocked', '果汁需要用苹果和杯子制作。');
    if (existing?.location === 'helper')
      return result('blocked', '小猫还在拿这份水果，可以取消便签。');
    if (existing?.location.startsWith('machine:') && s.machine.status === 'processing')
      return result('blocked', '果汁正在制作，等杯子装好再拿。');
    if (existing?.location.startsWith('tray:')) {
      const tray = Number(existing.location.split(':')[1]) as TrayId;
      if (s.trays[tray].remaining > 0)
        return result('blocked', '托盘正在回来，另一个托盘可以继续用。');
    }
    if ('discard' in c.destination) {
      if (!existing) return result('blocked', '放回就好，不需要从原料格清理。');
      if (product === 'juice' && !c.destination.confirmed)
        return result('confirm', '要清理这杯果汁并重新准备吗？');
      s.items = s.items.filter((i) => i.id !== existing.id);
      if (s.machine.status === 'ready' && existing.location === 'machine:cup')
        s.machine = { status: 'empty', remaining: 0, jobId: null };
      syncMachine(s);
      return result('ok', product === 'juice' ? '已清理，可以重新制作。' : '已放回原料。');
    }
    const location = destination(s, c.destination, product, existing);
    if (typeof location !== 'string') return result('blocked', location.reason);
    if (existing) {
      const fromMachine = existing.location === 'machine:cup' && s.machine.status === 'ready';
      existing.location = location;
      if (fromMachine) s.machine = { status: 'empty', remaining: 0, jobId: null };
    } else s.items.push({ id: nextId(s, 'food'), product, location });
    syncMachine(s);
    return result('ok', '放好了。');
  }
  if (c.type === 'start-machine') {
    if (s.machine.status === 'processing') return result('blocked', '正在制作，你可以准备另一盘。');
    if (s.machine.status === 'ready') return result('blocked', '先拿走成品，才能再做一杯。');
    if (!s.items.some((i) => i.location === 'machine:apple' && i.product === 'apple'))
      return result('blocked', '先把苹果放进上面的入口。');
    if (!s.items.some((i) => i.location === 'machine:cup' && i.product === 'cup'))
      return result('blocked', '还缺一个空杯，放到出汁口下。');
    s.machine = { status: 'processing', remaining: JUICE_MS, jobId: nextId(s, 'juice') };
    return result('ok', '果汁机开始了。现在也能准备水果。');
  }
  if (c.type === 'cancel-helper') {
    if (!s.helper) return result('blocked', '小猫现在没有取料任务。');
    const ids = s.helper.itemIds;
    s.items = s.items.filter((i) => !ids.includes(i.id));
    s.helper = null;
    return result('ok', '便签已撤回，水果放回，盘位已释放。');
  }
  if (c.type === 'note' || c.type === 'picture-request') {
    if (!MODES[s.mode].trays.includes(c.tray)) return result('blocked', '这次只用一只托盘。');
    if (
      c.type === 'picture-request' &&
      (!c.fruits.length ||
        c.fruits.length > 2 ||
        c.fruits.some((f) => f !== 'apple' && f !== 'banana'))
    )
      return result('blocked', '选一份或两份水果。');
    const phrase =
      c.type === 'note'
        ? parseTokens(c.tokens)
        : { kind: 'valid' as const, fruits: c.fruits, normalized: 'picture-request' };
    if (c.type === 'picture-request') {
      s.noteSupport = [...new Set([...s.noteSupport, 'picture-request'])];
      for (const o of s.orders)
        if (o.status === 'waiting') o.support = [...new Set([...o.support, 'picture-assistant'])];
    }
    if (phrase.kind !== 'valid') {
      if (phrase.kind !== 'incomplete')
        attempt(s, {
          activity: 'note',
          input: c.type === 'note' ? c.tokens.join(' ') : 'picture-request',
          result: phrase.kind,
          support: [...s.noteSupport],
        });
      if (phrase.kind === 'language-adjust')
        s.noteSupport = [...new Set([...s.noteSupport, 'grammar-explanation'])];
      return result(phrase.kind, phrase.message);
    }
    const slots = freeSlots(s, c.tray);
    const blocked = s.helper
      ? '小猫正在取料。等一下，或撤回上一张便签。'
      : s.trays[c.tray].remaining > 0
        ? '这只托盘还没回来。'
        : slots.length < phrase.fruits.length
          ? '托盘不够放。先移走水果，或换一只托盘。'
          : '';
    if (c.type === 'note')
      attempt(s, {
        activity: 'note',
        input: phrase.normalized,
        result: blocked ? 'world-blocked' : 'completed',
        support: [...s.noteSupport],
      });
    if (blocked) return result('blocked', blocked);
    const items: Item[] = phrase.fruits.map((product) => ({
      id: nextId(s, 'food'),
      product,
      location: 'helper',
    }));
    s.helper = {
      id: nextId(s, 'helper'),
      tray: c.tray,
      slots: slots.slice(0, items.length),
      itemIds: items.map((i) => i.id),
      remaining: HELPER_MS,
    };
    s.items.push(...items);
    return result('ok', `小猫读懂了，正在送往${c.tray + 1}号托盘。`);
  }
  if (c.type === 'deliver') {
    const order = s.orders.find((o) => o.id === c.order);
    if (order?.status !== 'waiting') return result('blocked', '这位客人已经收到食物。');
    if (s.trays[c.tray].remaining > 0) return result('blocked', '托盘还在回来。');
    if (s.helper?.tray === c.tray)
      return result('blocked', '小猫预留了这只托盘。等它放好，或撤回便签。');
    const items = trayItems(s, c.tray);
    const expected = REQUESTS[order.request].products;
    if (items.length < expected.length) return result('incomplete', '盘里还没准备齐，可以接着放。');
    const match = matchProducts(
      items.map((i) => i.product),
      expected,
    );
    attempt(s, {
      activity: 'delivery',
      input: `${order.id}:${items.map((i) => i.product).join(',')}`,
      result: match ? 'completed' : 'request-mismatch',
      support: [...order.support],
    });
    if (!match) {
      order.support = [...new Set([...order.support, 'mismatch-explanation'])];
      return result('mismatch', `${REQUESTS[order.request].explanation} 食物留在盘里，可以调整。`);
    }
    s.items = s.items.filter((i) => !items.some((t) => t.id === i.id));
    s.trays[c.tray].remaining = RETURN_MS;
    order.status = 'leaving';
    order.remaining = RETURN_MS;
    return result('ok', 'Thank you! 客人收到啦。');
  }
  return result('blocked', '无法执行这次操作。');
}
function destination(
  s: GameState,
  dest: Exclude<Destination, { discard: true }>,
  product: Product,
  existing: Item | undefined,
): Location | { reason: string } {
  if ('tray' in dest) {
    if (!MODES[s.mode].trays.includes(dest.tray)) return { reason: '这次只用一只托盘。' };
    if (product === 'cup') return { reason: '空杯放到果汁机右侧的杯座。' };
    if (s.trays[dest.tray].remaining > 0) return { reason: '托盘正在回来，试试另一盘。' };
    const slot = freeSlots(s, dest.tray)[0];
    if (slot === undefined) return { reason: '托盘满了。先选一个食品放回，或移到另一盘。' };
    return `tray:${dest.tray}:${slot}`;
  }
  if (s.machine.status === 'processing' || s.machine.status === 'ready')
    return { reason: '机器正在工作或有成品，先取走成品。' };
  if (product !== (dest.machine === 'apple' ? 'apple' : 'cup'))
    return {
      reason:
        dest.machine === 'apple' ? '这个入口放苹果；其他水果可直接装盘。' : '这里需要一个空杯。',
    };
  const location: Location = `machine:${dest.machine}`;
  if (s.items.some((i) => i.location === location && i.id !== existing?.id))
    return { reason: '这里已经放好了，可以开始制作或取回。' };
  return location;
}
export function advance(current: GameState, milliseconds: number): GameState {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return current;
  // Only the small clock/task branches change per frame. Items and evidence retain identity.
  const s: GameState = {
    ...current,
    gameTime: current.gameTime + milliseconds,
    machine: { ...current.machine },
    helper: current.helper ? { ...current.helper } : null,
    trays: [{ ...current.trays[0] }, { ...current.trays[1] }],
    orders: current.orders.map((o) => (o.status === 'leaving' ? { ...o } : o)),
  };
  let changed = false;
  if (s.machine.status === 'processing') {
    s.machine.remaining = Math.max(0, s.machine.remaining - milliseconds);
    if (!s.machine.remaining) {
      s.items = s.items
        .filter((i) => i.location !== 'machine:apple')
        .map((i) => (i.location === 'machine:cup' ? { ...i } : i));
      const cup = s.items.find((i) => i.location === 'machine:cup');
      if (cup) cup.product = 'juice';
      s.machine.status = 'ready';
      s.machine.jobId = null;
      changed = true;
    }
  }
  if (s.helper) {
    s.helper.remaining = Math.max(0, s.helper.remaining - milliseconds);
    if (!s.helper.remaining) {
      const h = s.helper;
      s.items = s.items.map((i) => (h.itemIds.includes(i.id) ? { ...i } : i));
      for (const [index, id] of h.itemIds.entries()) {
        const item = s.items.find((i) => i.id === id);
        const slot = h.slots[index];
        if (item && slot !== undefined) item.location = `tray:${h.tray}:${slot}`;
      }
      s.helper = null;
      changed = true;
    }
  }
  for (const tray of s.trays) {
    const before = tray.remaining;
    tray.remaining = Math.max(0, before - milliseconds);
    if (before && !tray.remaining) changed = true;
  }
  for (const order of s.orders)
    if (order.status === 'leaving') {
      order.remaining = Math.max(0, order.remaining - milliseconds);
      if (!order.remaining) {
        order.status = 'done';
        changed = true;
      }
    }
  if (
    s.mode !== 'service' &&
    !s.orders.some((o) => o.status === 'waiting' || o.status === 'leaving')
  ) {
    const next = s.orders.findIndex((o) => o.status === 'queued');
    if (next >= 0) {
      s.orders = s.orders.map((o, i) => (i === next ? { ...o, status: 'waiting' } : o));
      changed = true;
    }
  }
  if (changed) s.revision++;
  return s;
}
