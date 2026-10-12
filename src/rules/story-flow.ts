import { ADVENTURES, type AdventureState, emptyAdventure, FAMILIES } from '../content/adventure';
import { REQUESTS } from '../content/catalog';
import {
  type ChapterMemory,
  flowOrders,
  REWARD_MS,
  STORY_WAVES,
  type StoryFlow,
  TASTE_MS,
  WAVE_GAP_MS,
  waveIndices,
} from '../content/story-flow';
import { adventureCommand, adventureReady, validAdventure } from './adventure';
import { addInvitationNeed, experienceCommand, hydrateExperience } from './adventure-experience';
import { admitAdventure } from './sessions';
import type { GameState } from './types';

export const storyExpectedOrders = (a: AdventureState) =>
  a.flow && !a.flow.legacy ? flowOrders(a) : (ADVENTURES[a.chapter]?.orders ?? []);
export function flowReceived(a: AdventureState): boolean {
  return storyExpectedOrders(a).every(
    (o, i) =>
      a.foods
        .filter((f) => f.source === `guest-${i}`)
        .map((f) => f.product)
        .sort()
        .join('|') === [...REQUESTS[o.request].products].sort().join('|'),
  );
}
/** Adopts old real state without rewriting requests, inventory, heat or receipts. */
export function enableStoryFlow(s: GameState, fresh = false): void {
  const a = s.adventure;
  if (!a || a.kind !== 'chapter' || a.flow) return;
  a.flow = {
    version: 1,
    wave: 0,
    phase: a.rewards.length ? (a.chapter === 4 ? 'complete' : 'reward') : 'service',
    until: a.rewards.length ? s.gameTime + REWARD_MS : 0,
    legacy: !fresh,
    archives: [],
  };
  if (!fresh && a.flow) a.flow.legacyChapter = a.chapter;
  if (a.rewards.length && a.flow) a.flow.completion = completionMemory(a, !fresh);
  if (fresh) initializeOrders(s);
  admitStoryGuests(s);
  if (a.chapter === 4) inviteReturningGuests(s);
}
function initializeOrders(s: GameState): void {
  const a = s.adventure;
  if (!a) return;
  s.orders = flowOrders(a).map((o, i) => ({
    ...o,
    id: `guest-${i}`,
    seat: (i % 2) as 0 | 1,
    status: 'queued',
    remaining: 0,
    heard: false,
    revisit: Boolean(s.history[o.request]?.length),
    support: s.session.support === 'demonstration' ? ['guided'] : [],
  }));
}
export function admitStoryGuests(s: GameState): boolean {
  const a = s.adventure;
  if (!a?.flow || a.flow.phase !== 'service') return false;
  const together =
    a.chapter === 2 || a.chapter === 3 || STORY_WAVES[a.chapter]?.[a.flow.wave]?.together;
  const max = together ? 2 : 1;
  s.mode = 'service';
  s.session.concurrency = max;
  let changed = false;
  for (const i of waveIndices(a)) {
    const o = s.orders[i];
    if (o?.status === 'queued' && admitAdventure(s, o.visitor)) changed = true;
  }
  return changed;
}
function inviteReturningGuests(s: GameState): void {
  const a = s.adventure;
  if (!a) return;
  for (const visitor of ['rabbit', 'hedgehog'] as const) {
    if (!a.invitations.includes(visitor)) a.invitations.push(visitor);
    addInvitationNeed(a, visitor);
  }
}
const idle = (s: GameState) =>
  !s.actor.current && !s.actor.queue.length && !s.helper && !s.trays.some((t) => t.remaining);
/** Clock-driven consequences of actual receipts; never called by an animation callback. */
export function advanceStoryFlow(s: GameState): boolean {
  const old = s.adventure;
  if (!old?.flow || old.flow.phase === 'complete' || old.flow.phase === 'explore') return false;
  const f = old.flow;
  const tastable = old.foods.filter(
    (food) =>
      !food.tasted &&
      food.place !== 'basket' &&
      food.place !== 'hand' &&
      (food.source.startsWith('guest-') || food.source === 'cool' || food.recipient) &&
      s.gameTime -
        (old.experience?.moments
          .slice()
          .reverse()
          .find((m) => m.kind === 'receive' && m.foods.some((x) => x.id === food.id))?.at ??
          s.gameTime) >=
        TASTE_MS,
  );
  const waiting =
    waveIndices(old).some((i) => s.orders[i]?.status === 'queued') &&
    s.orders.filter((o) => o.status === 'waiting' || o.status === 'leaving').length <
      s.session.concurrency;
  const done = waveIndices(old).every((i) => s.orders[i]?.status === 'done');
  if (!tastable.length && !waiting && !done && f.phase !== 'reward') return false;
  s.adventure = structuredClone(old);
  const a = s.adventure,
    flow = a.flow as StoryFlow;
  let changed = false;
  for (const food of tastable) {
    const r = adventureCommand(s, { type: 'adventure', action: 'taste', item: food.id });
    changed = r.kind === 'ok' || changed;
  }
  if (admitStoryGuests(s)) changed = true;
  if (flow.phase === 'reward') {
    if (s.gameTime < flow.until || !idle(s)) return changed;
    if (!flow.completion) return changed;
    flow.archives = [
      ...flow.archives,
      { ...flow.completion, works: structuredClone(a.works), decor: { ...a.decor } },
    ].slice(-4);
    const chapter = a.chapter + 1;
    const known = [...new Set([...(a.experience?.known ?? []), ...a.foods.map((x) => x.product)])];
    const picnic = a.chapter === 2 ? a.branch : (a.experience?.picnic ?? null);
    for (const order of s.orders)
      s.history[order.request] = [
        ...new Set([...(s.history[order.request] ?? []), ...order.support, 'seen-before']),
      ].slice(-24);
    s.adventure = emptyAdventure(chapter);
    s.adventure.flow = {
      ...flow,
      wave: 0,
      phase: 'service',
      until: 0,
      legacy: false,
    };
    delete s.adventure.flow.completion;
    hydrateExperience(s.adventure);
    if (s.adventure.experience) {
      s.adventure.experience.known = known;
      s.adventure.experience.picnic = picnic;
    }
    s.session.chapter = chapter;
    s.session.family = ADVENTURES[chapter]?.family ?? 'juice';
    s.session.unlocked = [...FAMILIES.slice(0, Math.min(chapter + 1, 4))];
    s.session.supplyPage = 0;
    initializeOrders(s);
    admitStoryGuests(s);
    if (chapter === 4) inviteReturningGuests(s);
    return true;
  }
  if (!done || !idle(s)) return changed;
  const waves = flow.legacy ? 1 : (STORY_WAVES[a.chapter]?.length ?? 1);
  if (flow.wave < waves - 1) {
    if (!flow.until) {
      flow.until = s.gameTime + WAVE_GAP_MS;
      return true;
    }
    if (s.gameTime < flow.until) return changed;
    flow.wave++;
    flow.until = 0;
    admitStoryGuests(s);
    return true;
  }
  // These operations have the same item/precondition checks as player exploration.
  if (a.chapter === 1 && a.steps.includes('cool')) {
    if (experienceCommand(s, { type: 'adventure', action: 'compare' })?.kind === 'ok')
      changed = true;
  }
  if (a.chapter === 2 && a.branch) {
    if (a.branch === 'rabbit') {
      if (!a.explored.includes('basket')) {
        a.explored.push('basket');
        changed = true;
      }
      if (a.steps.includes('pack') && !a.steps.includes('unpack'))
        changed =
          adventureCommand(s, { type: 'adventure', action: 'unpack' }).kind === 'ok' || changed;
    }
    if (!a.steps.includes('cloth') && (a.branch === 'hedgehog' || a.steps.includes('unpack')))
      changed =
        adventureCommand(s, {
          type: 'adventure',
          action: 'cloth',
          value: a.branch === 'rabbit' ? 'leaf' : 'sun',
        }).kind === 'ok' || changed;
  }
  if (a.chapter === 3 && flowReceived(a)) {
    if (!a.experience?.used.includes('cooperate'))
      changed =
        experienceCommand(s, {
          type: 'adventure',
          action: 'cooperate',
          object: 'lantern',
          visitor: 'rabbit',
        })?.kind === 'ok' || changed;
    if (!a.steps.includes('light'))
      changed =
        adventureCommand(s, { type: 'adventure', action: 'light', value: 'warm' }).kind === 'ok' ||
        changed;
  }
  if (
    a.chapter === 4 &&
    ['rabbit', 'hedgehog'].every((v) =>
      a.experience?.needs.some(
        (n) =>
          n.visitor === v &&
          n.fulfilled.length &&
          a.foods.some((x) => n.fulfilled.includes(x.id) && x.tasted),
      ),
    )
  ) {
    if (!a.steps.includes('save-work'))
      changed =
        adventureCommand(s, { type: 'adventure', action: 'save-work' }).kind === 'ok' || changed;
  }
  if (adventureReady(a) && !a.rewards.length) {
    if (a.chapter === 1 && !a.steps.includes('bunting'))
      adventureCommand(s, { type: 'adventure', action: 'bunting', value: 'cool' });
    if (adventureCommand(s, { type: 'adventure', action: 'finish' }).kind === 'ok') {
      recordStoryCompletion(s);
      return true;
    }
  }
  return changed;
}
/** An explicit visit to a rewarded chapter opens its real optional kitchen and props. */
export function exploreStory(s: GameState): void {
  const a = s.adventure;
  if (a?.flow?.completion && a.rewards.length) {
    a.flow.phase = 'explore';
    a.flow.until = 0;
  }
}
/** Immutable memory of the actual award moment; clearing the live table cannot erase it. */
function completionMemory(a: AdventureState, legacy: boolean): ChapterMemory {
  const { flow: _, ...state } = a;
  return {
    ...structuredClone(state),
    contract: legacy ? 'legacy-adventure' : 'continuous-gameplay-1',
  };
}
export function recordStoryCompletion(s: GameState): void {
  const a = s.adventure,
    flow = a?.flow;
  if (!a || !flow || !a.rewards.length || flow.completion) return;
  flow.phase = a.chapter === 4 ? 'complete' : 'reward';
  flow.until = s.gameTime + REWARD_MS;
  flow.completion = completionMemory(a, flow.legacy);
}
function validMemory(m: ChapterMemory): boolean {
  if (
    !m ||
    typeof m !== 'object' ||
    Object.hasOwn(m, 'flow') ||
    !['continuous-gameplay-1', 'legacy-adventure'].includes(m.contract) ||
    m.kind !== 'chapter' ||
    m.rewards?.length !== 1 ||
    !validAdventure(m)
  )
    return false;
  if (m.contract === 'legacy-adventure') return true;
  if (
    !flowOrders(m).every(
      (o, i) =>
        m.foods
          .filter((f) => f.source === `guest-${i}`)
          .map((f) => f.product)
          .sort()
          .join('|') === [...REQUESTS[o.request].products].sort().join('|'),
    )
  )
    return false;
  if (
    m.chapter === 4 &&
    !['rabbit', 'hedgehog'].every((v) =>
      m.experience?.needs.some(
        (n) =>
          n.visitor === v &&
          n.fulfilled.length === 1 &&
          m.foods.some((f) => n.fulfilled.includes(f.id) && f.tasted && f.recipient === v),
      ),
    )
  )
    return false;
  return true;
}
/** New archives retain receipt provenance; explicitly adopted legacy awards keep their contract. */
export function validStoryFlow(a: AdventureState): boolean {
  const f = a.flow;
  if (f === undefined) return true;
  if (!f || typeof f !== 'object') return false;
  return (
    a.kind === 'chapter' &&
    f.version === 1 &&
    typeof f.legacy === 'boolean' &&
    Number.isInteger(f.wave) &&
    f.wave >= 0 &&
    f.wave < (f.legacy ? 1 : (STORY_WAVES[a.chapter]?.length ?? 0)) &&
    ['service', 'reward', 'complete', 'explore'].includes(f.phase) &&
    Number.isFinite(f.until) &&
    f.until >= 0 &&
    f.until <= 1e12 &&
    (f.legacyChapter === undefined ||
      (Number.isInteger(f.legacyChapter) &&
        f.legacyChapter >= 0 &&
        f.legacyChapter <= a.chapter)) &&
    (!f.legacy || f.legacyChapter === a.chapter) &&
    (f.phase === 'service'
      ? !a.rewards.length && f.completion === undefined
      : a.rewards.length === 1 &&
        (f.phase !== 'complete' || a.chapter === 4) &&
        !!f.completion &&
        f.completion.chapter === a.chapter &&
        f.completion.contract === (f.legacy ? 'legacy-adventure' : 'continuous-gameplay-1') &&
        validMemory(f.completion)) &&
    Array.isArray(f.archives) &&
    f.archives.length <= 4 &&
    f.archives.every(
      (m, i) =>
        validMemory(m) &&
        m.chapter < a.chapter &&
        (!i || m.chapter > (f.archives[i - 1]?.chapter ?? -1)) &&
        (m.contract !== 'legacy-adventure' || (i === 0 && m.chapter === f.legacyChapter)),
    )
  );
}
