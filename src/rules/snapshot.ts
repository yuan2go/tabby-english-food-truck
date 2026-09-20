import {
  CONTENT_VERSION,
  HELPER_MS,
  JUICE_MS,
  MODES,
  REQUESTS,
  RETURN_MS,
  requestsFor,
} from '../content/catalog';
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
    v.schemaVersion !== 2 ||
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
    v.items.length > 10 ||
    !v.items.every(
      (i) =>
        record(i) &&
        str(i.id) &&
        /^food-\d+$/.test(i.id) &&
        ['apple', 'banana', 'cup', 'juice'].includes(i.product as string) &&
        /^(tray:[01]:[012]|machine:(apple|cup)|helper)$/.test(String(i.location)),
    )
  )
    return false;
  if (
    !Array.isArray(v.orders) ||
    v.orders.length < 1 ||
    v.orders.length > 5 ||
    !v.orders.every(
      (o) =>
        record(o) &&
        str(o.id) &&
        Object.keys(REQUESTS).includes(o.request as string) &&
        [0, 1].includes(o.seat as number) &&
        ['queued', 'waiting', 'leaving', 'done'].includes(o.status as string) &&
        number(o.remaining, RETURN_MS) &&
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
    !v.trays.every((t) => record(t) && number(t.remaining, RETURN_MS))
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
      !number(v.helper.remaining, HELPER_MS) ||
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
    !v.attempts.every(
      (a) =>
        record(a) &&
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
  // Structural checks above establish the typed shape; relation checks below reject impossible worlds.
  const s = v as unknown as GameState;
  if (
    !unique(s.items.map((i) => i.id)) ||
    !unique(s.items.filter((i) => i.location !== 'helper').map((i) => i.location))
  )
    return false;
  if (s.items.some((i) => Number(i.id.slice(5)) >= s.nextId)) return false;
  const expected = requestsFor(s.mode, s.variant);
  if (
    s.orders.length !== expected.length ||
    s.orders.some(
      (o, i) =>
        o.request !== expected[i] ||
        o.id !== `guest-${i}` ||
        o.seat !== (s.mode === 'service' ? i : s.variant) ||
        (o.status === 'leaving' ? o.remaining <= 0 : o.remaining !== 0),
    )
  )
    return false;
  if (s.mode !== 'service') {
    if (s.orders.filter((o) => o.status === 'waiting' || o.status === 'leaving').length > 1)
      return false;
    const firstUnfinished = s.orders.findIndex((o) => o.status !== 'done');
    if (
      firstUnfinished >= 0 &&
      (s.orders[firstUnfinished]?.status === 'queued' ||
        s.orders.slice(firstUnfinished + 1).some((o) => o.status !== 'queued'))
    )
      return false;
    if (
      s.items.some((i) => i.location.startsWith('tray:1:')) ||
      s.helper?.tray === 1 ||
      s.trays[1].remaining
    )
      return false;
  } else if (s.orders.some((o) => o.status === 'queued')) return false;
  if (s.helper && !MODES[s.mode].trays.includes(s.helper.tray)) return false;
  if (
    s.items.some(
      (i) =>
        (i.location.startsWith('tray:') && i.product === 'cup') ||
        (i.location === 'machine:apple' && i.product !== 'apple'),
    )
  )
    return false;
  const apple = s.items.find((i) => i.location === 'machine:apple');
  const cup = s.items.find((i) => i.location === 'machine:cup');
  if (s.machine.status === 'empty' && (apple || cup)) return false;
  if (s.machine.status === 'loaded' && ((!apple && !cup) || (cup && cup.product !== 'cup')))
    return false;
  if (
    s.machine.status === 'processing' &&
    (!apple || cup?.product !== 'cup' || !s.machine.jobId || s.machine.remaining <= 0)
  )
    return false;
  if (s.machine.status === 'ready' && (apple || cup?.product !== 'juice')) return false;
  if (s.machine.status !== 'processing' && (s.machine.remaining !== 0 || s.machine.jobId !== null))
    return false;
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
  if (
    s.trays.some(
      (t, index) => t.remaining > 0 && s.items.some((i) => i.location.startsWith(`tray:${index}:`)),
    )
  )
    return false;
  return true;
}
export function decodeSnapshot(raw: string): DecodeResult {
  if (raw.length > 160_000) return { ok: false, reason: '存档太大，已保留原文供导出。', raw };
  try {
    const value: unknown = JSON.parse(raw);
    return validateState(value)
      ? { ok: true, state: value }
      : { ok: false, reason: '存档版本或物品关系不受支持，已保留原文。', raw };
  } catch {
    return { ok: false, reason: '存档损坏，已保留原文。', raw };
  }
}
