import { CONTENT_VERSION, JUICE_MS, REQUESTS, requestsFor } from '../content/catalog';
import { CHAPTERS, endlessPool, requestFamily } from '../content/chapters';
import { FOOD, RAW, RECIPES, recipeFor } from '../content/recipes';
import { stationItems } from './cooking';
import { emptyRouting, targetLocation } from './routing';
import type { GameState } from './types';

const record = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 240;
const number = (v: unknown, max = 1e12): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max;
const integer = (v: unknown, max = 1e9): v is number => number(v, max) && Number.isInteger(v);
const strings = (v: unknown, max: number): v is string[] =>
  Array.isArray(v) && v.length <= max && v.every(str);
const unique = (v: readonly unknown[]) => new Set(v).size === v.length;
export type DecodeResult =
  | { ok: true; state: GameState }
  | { ok: false; reason: string; raw: string };
export function validateState(v: unknown): v is GameState {
  if (
    !record(v) ||
    v.schemaVersion !== 5 ||
    v.contentVersion !== CONTENT_VERSION ||
    !['guided', 'practice', 'service'].includes(v.mode as string) ||
    !record(v.history) ||
    Object.entries(v.history).some(([key, values]) => !(key in REQUESTS) || !strings(values, 24)) ||
    !str(v.runId) ||
    !integer(v.revision) ||
    !integer(v.nextId) ||
    (v.nextId as number) < 1 ||
    ![0, 1].includes(v.variant as number) ||
    !number(v.gameTime)
  )
    return false;
  if (
    !Array.isArray(v.items) ||
    v.items.length > 26 ||
    !v.items.every(
      (i) =>
        record(i) &&
        str(i.id) &&
        /^food-\d+$/.test(i.id) &&
        Object.hasOwn(FOOD, i.product as string) &&
        /^(tray:[01]:[012]|machine:(apple|cup)|helper|station:(ice|board|grill):[0-4]|delivery:[01]:[012])$/.test(
          String(i.location),
        ),
    )
  )
    return false;
  if (
    !Array.isArray(v.orders) ||
    v.orders.length < 1 ||
    v.orders.length > 8 ||
    !v.orders.every(
      (o) =>
        record(o) &&
        typeof o.revisit === 'boolean' &&
        typeof o.heard === 'boolean' &&
        str(o.id) &&
        Object.keys(REQUESTS).includes(o.request as string) &&
        [0, 1].includes(o.seat as number) &&
        ['queued', 'waiting', 'leaving', 'done'].includes(o.status as string) &&
        number(o.remaining, 120000) &&
        strings(o.support, 24) &&
        unique(o.support),
    )
  )
    return false;
  if (
    !record(v.machine) ||
    !['empty', 'loaded', 'processing', 'ready'].includes(v.machine.status as string) ||
    !number(v.machine.remaining, JUICE_MS) ||
    !(v.machine.jobId === null || str(v.machine.jobId))
  )
    return false;
  if (
    !Array.isArray(v.trays) ||
    v.trays.length !== 2 ||
    !v.trays.every((t) => record(t) && number(t.remaining, 120000))
  )
    return false;
  if (
    v.helper !== null &&
    (!record(v.helper) ||
      !str(v.helper.id) ||
      ![0, 1].includes(v.helper.tray as number) ||
      !Array.isArray(v.helper.slots) ||
      !v.helper.slots.length ||
      v.helper.slots.length > 2 ||
      !v.helper.slots.every((i) => [0, 1, 2].includes(i)) ||
      !unique(v.helper.slots) ||
      !strings(v.helper.itemIds, 2) ||
      v.helper.itemIds.length !== v.helper.slots.length ||
      !unique(v.helper.itemIds) ||
      !number(v.helper.remaining, 120000) ||
      v.helper.remaining === 0)
  )
    return false;
  if (
    !strings(v.receipts, 64) ||
    !unique(v.receipts) ||
    !strings(v.lessons, 24) ||
    !strings(v.noteSupport, 24)
  )
    return false;
  if (
    !Array.isArray(v.attempts) ||
    v.attempts.length > 80 ||
    !unique(v.attempts.map((a) => (record(a) ? a.id : undefined))) ||
    !v.attempts.every(
      (a) =>
        record(a) &&
        str(a.id) &&
        ['guided', 'assisted', 'independent-condition'].includes(a.condition as string) &&
        ['first', 'revisit'].includes(a.visit as string) &&
        a.audioQualified === false &&
        str(a.runId) &&
        ['delivery', 'note'].includes(a.activity as string) &&
        str(a.input) &&
        ['completed', 'world-blocked', 'request-mismatch', 'language-adjust', 'outside'].includes(
          a.result as string,
        ) &&
        strings(a.support, 24) &&
        integer(a.retry, 1e6) &&
        number(a.gameTime),
    )
  )
    return false;
  if (
    !Array.isArray(v.audio) ||
    v.audio.length > 80 ||
    !v.audio.every(
      (a) =>
        record(a) &&
        str(a.id) &&
        str(a.version) &&
        ['started', 'completed', 'interrupted', 'failed'].includes(a.status as string) &&
        number(a.gameTime),
    )
  )
    return false;
  if (
    !record(v.session) ||
    ![1, 2].includes(v.session.concurrency as number) ||
    !strings(v.session.menu, 20) ||
    !v.session.menu.length ||
    !unique(v.session.menu) ||
    v.session.menu.some((r) => !(r in REQUESTS)) ||
    !['story', 'endless', 'training'].includes(v.session.activity as string) ||
    !integer(v.session.chapter, 4) ||
    !['demonstration', 'pictures', 'less'].includes(v.session.support as string) ||
    !['juice', 'ice', 'sandwich', 'burger'].includes(v.session.family as string) ||
    !strings(v.session.unlocked, 4) ||
    !unique(v.session.unlocked) ||
    !v.session.unlocked.includes('juice') ||
    v.session.unlocked.some((f) => !['juice', 'ice', 'sandwich', 'burger'].includes(f)) ||
    !integer(v.session.seed, 4294967295) ||
    !integer(v.session.cursor) ||
    !integer(v.session.served) ||
    typeof v.session.lastRequest !== 'string'
  )
    return false;
  if (!record(v.routing) || Object.keys(v.routing).length !== 4) return false;
  for (const id of ['machine', 'ice', 'board', 'grill']) {
    const t = v.routing[id];
    if (t === null) continue;
    if (!record(t)) return false;
    if ('tray' in t) {
      if (![0, 1].includes(t.tray as number) || ![0, 1, 2].includes(t.slot as number)) return false;
    } else if (id !== 'grill' || t.station !== 'board' || !integer(t.slot, 4)) return false;
  }
  if (!record(v.stations)) return false;
  for (const id of ['ice', 'board', 'grill']) {
    const st = v.stations[id];
    if (
      !record(st) ||
      !['empty', 'loaded', 'processing', 'ready'].includes(st.status as string) ||
      !number(st.remaining, 5000) ||
      !(st.recipe === null || RECIPES.some((r) => r.id === st.recipe && r.station === id))
    )
      return false;
  }
  if (
    !record(v.actor) ||
    !point(v.actor.point) ||
    !Array.isArray(v.actor.queue) ||
    v.actor.queue.length > 3 ||
    !v.actor.queue.every(actorJob) ||
    !(v.actor.current === null || actorJob(v.actor.current))
  )
    return false;
  if (
    v.recycle !== null &&
    (!record(v.recycle) ||
      !str(v.recycle.id) ||
      !Object.hasOwn(FOOD, v.recycle.product as string) ||
      RAW.includes(v.recycle.product as never) ||
      v.recycle.location !== 'recycle')
  )
    return false;
  const s = v as unknown as GameState;
  const ids = s.items.map((i) => i.id);
  if (s.recycle) ids.push(s.recycle.id);
  if (
    !unique(ids) ||
    !unique(s.items.filter((i) => i.location !== 'helper').map((i) => i.location)) ||
    s.items.some((i) => Number(i.id.slice(5)) >= s.nextId)
  )
    return false;
  if (
    !unique(s.orders.map((o) => o.id)) ||
    s.orders.some((o) => (o.status === 'leaving' ? o.remaining <= 0 : o.remaining !== 0))
  )
    return false;
  const active = s.orders.filter((o) => o.status === 'waiting' || o.status === 'leaving');
  if (active.length > (s.mode === 'service' ? 2 : 1) || !unique(active.map((o) => o.seat)))
    return false;
  if (s.session.activity === 'story') {
    const expected = CHAPTERS[s.session.chapter]?.requests;
    if (
      !expected ||
      s.orders.length !== expected.length ||
      s.orders.some((o, i) => o.request !== expected[i] || o.id !== `guest-${i}`)
    )
      return false;
  } else if (s.session.activity === 'endless') {
    // A support change constrains future generation, not the validity of
    // already accepted orders. Their recipes must still be introduced.
    const pool = endlessPool(s.session.unlocked, 'less');
    if (
      s.orders.length > (s.mode === 'service' ? 2 : 1) ||
      s.orders.some(
        (o) =>
          !pool.includes(o.request) ||
          o.status === 'queued' ||
          o.status === 'done' ||
          !/^guest-\d+$/.test(o.id) ||
          Number(o.id.slice(6)) >= s.session.cursor,
      )
    )
      return false;
  } else {
    const actual = s.orders.map((o) => o.request).join('|');
    if (
      ![
        requestsFor(s.mode, s.variant).join('|'),
        'apple|banana|two|fruit|juice',
        CHAPTERS[s.session.chapter]?.requests.join('|'),
      ].includes(actual)
    )
      return false;
  }
  if (
    !s.session.unlocked.includes(s.session.family) ||
    s.orders.some((o) => !s.session.unlocked.includes(requestFamily(o.request)))
  )
    return false;
  if (
    s.mode !== 'service' &&
    (s.items.some((i) => i.location.startsWith('tray:1:')) ||
      s.helper?.tray === 1 ||
      s.trays[1].remaining)
  )
    return false;
  const targets = Object.values(s.routing).filter((t) => t !== null);
  if (!unique(targets.map(targetLocation))) return false;
  for (const [id, target] of Object.entries(s.routing)) {
    if (!target) continue;
    const device = id === 'machine' ? s.machine : s.stations[id as 'ice' | 'board' | 'grill'];
    if (
      !['processing', 'ready'].includes(device.status) ||
      s.items.some((i) => i.location === targetLocation(target))
    )
      return false;
    if (
      'tray' in target &&
      (s.trays[target.tray].remaining ||
        (s.mode !== 'service' && target.tray !== 0) ||
        (s.helper?.tray === target.tray && s.helper.slots.includes(target.slot)))
    )
      return false;
  }
  const apple = s.items.find((i) => i.location === 'machine:apple'),
    cup = s.items.find((i) => i.location === 'machine:cup');
  if (apple && !['apple', 'banana'].includes(apple.product)) return false;
  if (s.machine.status === 'empty' && (apple || cup)) return false;
  if (s.machine.status === 'loaded' && ((!apple && !cup) || (cup && cup.product !== 'cup')))
    return false;
  if (
    s.machine.status === 'processing' &&
    (!recipeFor('machine', [...(apple ? [apple.product] : []), ...(cup ? [cup.product] : [])]) ||
      !s.machine.jobId ||
      s.machine.remaining <= 0)
  )
    return false;
  if (
    s.machine.status === 'ready' &&
    (apple || !cup || !['juice', 'banana-juice'].includes(cup.product))
  )
    return false;
  if (s.machine.status !== 'processing' && (s.machine.remaining !== 0 || s.machine.jobId !== null))
    return false;
  for (const id of ['ice', 'board', 'grill'] as const) {
    const st = s.stations[id],
      items = stationItems(s, id),
      recipe = RECIPES.find((r) => r.id === st.recipe);
    if (st.status === 'empty' && (items.length || st.recipe || st.remaining)) return false;
    if (
      st.status === 'loaded' &&
      (!items.length ||
        st.remaining ||
        items.some((i) => !RECIPES.some((r) => r.station === id && r.inputs.includes(i.product))))
    )
      return false;
    if (
      st.status === 'processing' &&
      (!recipe ||
        recipeFor(
          id,
          items.map((i) => i.product),
        )?.id !== recipe.id ||
        st.remaining <= 0 ||
        st.remaining > recipe.ms)
    )
      return false;
    if (
      st.status === 'ready' &&
      (!recipe || items.length !== 1 || items[0]?.product !== recipe.output || st.remaining !== 0)
    )
      return false;
  }
  const held = s.items.filter((i) => i.location === 'helper');
  if (s.helper) {
    const h = s.helper;
    if (
      held.length !== h.itemIds.length ||
      held.some((i) => !h.itemIds.includes(i.id) || !['apple', 'banana'].includes(i.product)) ||
      h.slots.some((slot) => s.items.some((i) => i.location === `tray:${h.tray}:${slot}`)) ||
      s.trays[h.tray].remaining > 0
    )
      return false;
  } else if (held.length) return false;
  const jobs = [...(s.actor.current ? [s.actor.current] : []), ...s.actor.queue];
  if (
    !unique(jobs.map((j) => j.plan.id)) ||
    jobs.some((j) => j.itemIds.some((id) => !s.items.some((i) => i.id === id)))
  )
    return false;
  if (
    s.helper &&
    !jobs.some(
      (j) =>
        j.kind === 'helper' &&
        j.itemIds.length === s.helper?.itemIds.length &&
        j.itemIds.every((id) => s.helper?.itemIds.includes(id)),
    )
  )
    return false;
  if (
    s.items.some(
      (i) =>
        i.location.startsWith('delivery:') &&
        !jobs.some((j) => j.kind === 'delivery' && j.itemIds.includes(i.id)),
    )
  )
    return false;
  if (!s.actor.current && s.actor.queue.length) return false;
  let completion = 0;
  for (const [index, job] of jobs.entries()) {
    if (index > 0 && job.elapsed !== 0) return false;
    completion += job.plan.duration - job.elapsed;
    if (
      job.kind === 'helper' &&
      (!s.helper || job.tray !== s.helper.tray || Math.abs(s.helper.remaining - completion) > 0.05)
    )
      return false;
    if (
      job.kind === 'return' &&
      (job.itemIds.length || job.order !== undefined || job.tray !== undefined)
    )
      return false;
    if (job.kind === 'delivery') {
      const order = s.orders.find((o) => o.id === job.order);
      if (
        job.tray === undefined ||
        !order ||
        order.status !== 'leaving' ||
        Math.abs(order.remaining - completion) > 0.05 ||
        Math.abs(s.trays[job.tray].remaining - completion) > 0.05
      )
        return false;
      if (
        job.itemIds.some(
          (id) =>
            !s.items.some((i) => i.id === id && i.location.startsWith(`delivery:${job.tray}:`)),
        )
      )
        return false;
      const at = job.plan.phases.findIndex((p) => p.event === 'receive');
      if (at < 0) return false;
      const received =
        job.elapsed >= job.plan.phases.slice(0, at + 1).reduce((n, p) => n + p.duration, 0);
      if (received ? job.itemIds.length > 0 : job.itemIds.length === 0) return false;
    }
  }
  if (
    s.orders.some(
      (o) => o.status === 'leaving' && !jobs.some((j) => j.kind === 'delivery' && j.order === o.id),
    )
  )
    return false;
  if (!unique(jobs.filter((j) => j.kind === 'delivery').map((j) => j.tray))) return false;
  if (
    s.trays.some(
      (t, index) => t.remaining > 0 && !jobs.some((j) => j.kind === 'delivery' && j.tray === index),
    )
  )
    return false;
  if (
    s.trays.some(
      (t, index) => t.remaining > 0 && s.items.some((i) => i.location.startsWith(`tray:${index}:`)),
    )
  )
    return false;
  return true;
}
function point(v: unknown): boolean {
  return record(v) && number(v.x, 1) && number(v.y, 1);
}
function actorJob(v: unknown): boolean {
  if (
    !record(v) ||
    !['helper', 'delivery', 'return'].includes(v.kind as string) ||
    !number(v.elapsed, 120000) ||
    !strings(v.itemIds, 3) ||
    !unique(v.itemIds) ||
    !(v.tray === undefined || v.tray === 0 || v.tray === 1) ||
    !(v.order === undefined || str(v.order)) ||
    !record(v.plan) ||
    !str(v.plan.id) ||
    !number(v.plan.duration, 30000) ||
    !Array.isArray(v.plan.phases) ||
    !v.plan.phases.length ||
    v.plan.phases.length > 16
  )
    return false;
  if (
    !v.plan.phases.every(
      (p) =>
        record(p) &&
        point(p.from) &&
        point(p.to) &&
        ['idle', 'read', 'reach', 'place', 'carry', 'celebrate', 'greet', 'blocked'].includes(
          p.pose as string,
        ) &&
        number(p.duration, 10000) &&
        p.duration > 0 &&
        (p.event === undefined || str(p.event)),
    )
  )
    return false;
  const duration = v.plan.phases.reduce((sum, p) => sum + Number(p.duration), 0);
  return Math.abs(duration - Number(v.plan.duration)) < 0.01 && Number(v.elapsed) <= duration;
}
export function decodeSnapshot(raw: string): DecodeResult {
  if (raw.length > 160_000) return { ok: false, reason: '存档太大，已保留原文供导出。', raw };
  try {
    const value: unknown = JSON.parse(raw);
    if (
      record(value) &&
      value.schemaVersion === 3 &&
      value.contentVersion === 'm2.0' &&
      record(value.session)
    ) {
      // M2 encoded load in mode + support. Preserve the actual old policy, never infer scores.
      value.schemaVersion = 4;
      value.contentVersion = 'm2.1';
      value.session.concurrency =
        value.mode === 'service' && value.session.support === 'less' ? 2 : 1;
      value.session.menu = Array.isArray(value.session.unlocked)
        ? endlessPool(value.session.unlocked as GameState['session']['unlocked'], 'less')
        : [];
      if (Array.isArray(value.orders)) for (const o of value.orders) if (record(o)) o.heard = false;
      if (Array.isArray(value.attempts))
        for (const [i, a] of value.attempts.entries())
          if (record(a)) a.id = `${value.runId}:legacy:${i}`;
    }
    if (record(value) && value.schemaVersion === 4 && value.contentVersion === 'm2.1') {
      value.schemaVersion = 5;
      value.contentVersion = CONTENT_VERSION;
      value.routing = emptyRouting();
    }
    return validateState(value)
      ? { ok: true, state: value }
      : { ok: false, reason: '存档版本或物品关系不受支持，已保留原文。', raw };
  } catch {
    return { ok: false, reason: '存档损坏，已保留原文。', raw };
  }
}
