import { ADVENTURES, type Visitor } from '../content/adventure';
import { REQUESTS } from '../content/catalog';
import {
  type DialogueLine,
  type LineId,
  lineFor,
  revisitLine,
  type Speaker,
} from '../content/dialogue';
import { recipeFor } from '../content/recipes';
import type { ViewState } from '../game/input';
import { adventureReady, openCommission } from '../rules/adventure';
import type { GameState, Order } from '../rules/types';
import type { ForegroundAudio } from './audio';
import type { GameController } from './controller';
export interface DialogueTurn {
  key: string;
  line: DialogueLine;
  order?: string;
  historical?: boolean;
}
const turn = (s: GameState, id: LineId, suffix = '', role?: Speaker): DialogueTurn => ({
  key: `${s.runId}:${id}:${suffix || s.revision}`,
  line: { ...lineFor(id), ...(role ? { role } : {}) },
});
/** Only actual domain transitions speak results. No callback advances the world. */
export function dialogueEvents(old: GameState, s: GameState): DialogueTurn[] {
  if (old.runId !== s.runId) return [];
  const events: DialogueTurn[] = [];
  const oldJobs = [old.actor.current, ...old.actor.queue].filter(Boolean).map((j) => j?.plan.id);
  for (const j of [s.actor.current, ...s.actor.queue])
    if (j?.kind === 'delivery' && !oldJobs.includes(j.plan.id))
      events.push(turn(s, 'carry', j.plan.id));
  const job = old.actor.current;
  if (
    job?.kind === 'delivery' &&
    job.itemIds.length &&
    !s.items.some((i) => job.itemIds.includes(i.id))
  ) {
    const order = old.orders.find((o) => o.id === job.order);
    events.push(
      turn(
        s,
        job.worldTarget === 'create' ? 'share' : 'thanks',
        job.plan.id,
        job.worldTarget === 'create' ? 'dami' : (order?.visitor ?? 'guest'),
      ),
    );
  }
  const machines = [s.machine, ...Object.values(s.stations)];
  const prior = [old.machine, ...Object.values(old.stations)];
  for (const [i, machine] of machines.entries()) {
    if (machine.status === 'processing' && prior[i]?.status !== 'processing')
      events.push(turn(s, 'waiting', `${s.revision}:${i}`));
    if (machine.status === 'ready' && prior[i]?.status === 'processing')
      events.push(turn(s, 'ready', `${s.revision}:${i}`));
  }
  const a = s.adventure,
    before = old.adventure;
  if (!a || !before) return events;
  for (const object of a.explored.filter((id) => !before.explored.includes(id)))
    events.push(
      turn(
        s,
        object === 'basket'
          ? 'opened-basket'
          : object === 'recipe'
            ? 'opened-recipe'
            : a.chapter === 0
              ? 'found-flower'
              : a.chapter === 3
                ? 'found-light'
                : 'found-seats',
        object,
      ),
    );
  for (const f of a.foods)
    if (f.tasted && before.foods.some((p) => p.id === f.id && !p.tasted))
      events.push(turn(s, 'taste', f.id));
  const results: Record<string, LineId> = {
    plant: 'planted',
    bunting: 'hung',
    light: 'lit',
    cloth: 'spread',
    unpack: 'unpacked',
  };
  for (const [step, id] of Object.entries(results))
    if (a.steps.includes(step) && !before.steps.includes(step)) events.push(turn(s, id, step));
  for (const f of a.foods)
    if (
      f.place.startsWith('table:') &&
      before.foods.some((p) => p.id === f.id && p.place !== f.place)
    )
      events.push(turn(s, 'placed', `${f.id}:${f.place}`));
  if (a.works.length && a.works.at(-1)?.id !== before.works.at(-1)?.id)
    events.push(turn(s, 'saved', a.works.at(-1)?.id));
  if (a.rewards.length && !before.rewards.length) events.push(turn(s, 'feast', 'finish'));
  return events;
}
export function actionPrompt(s: GameState): DialogueLine | null {
  const a = s.adventure;
  if (!a) return null;
  const has = (id: string) => a.steps.includes(id);
  if (a.rewards.length || a.kind === 'shop') return lineFor('open-create');
  let id: LineId = 'welcome';
  if (a.chapter === 0 && (has('served:rabbit') || has('served:hedgehog')))
    id = !a.explored.includes('drawer') ? 'drawer' : !has('plant') ? 'plant' : 'try';
  if (a.chapter === 1)
    id = !has('cool')
      ? 'open-cool'
      : !a.explored.includes('recipe')
        ? 'recipe'
        : !has('taste')
          ? 'try'
          : 'bunting';
  if (a.chapter === 2 && a.branch)
    id =
      a.branch === 'rabbit'
        ? !a.explored.includes('basket')
          ? 'basket'
          : !has('pack')
            ? 'open-pack'
            : !has('unpack')
              ? 'unpack'
              : 'cloth'
        : !a.explored.includes('drawer')
          ? 'drawer'
          : !has('place:0') || !has('place:1')
            ? 'place'
            : 'cloth';
  if (a.chapter === 3 && (has('served:rabbit') || has('served:hedgehog')))
    id = !a.explored.includes('drawer')
      ? 'drawer'
      : !has('place:0') || !has('place:1')
        ? 'place'
        : 'light';
  if (a.chapter === 4)
    id =
      !a.invitations.includes('rabbit') || !a.invitations.includes('hedgehog')
        ? 'invite'
        : !has('create')
          ? 'open-create'
          : !a.foods.some((f) => f.place.startsWith('table:'))
            ? 'place'
            : !has('taste')
              ? 'try'
              : 'save';
  if (adventureReady(a)) id = 'feast';
  return lineFor(id);
}
export function commissionLine(s: GameState): DialogueLine | null {
  const c = openCommission(s.adventure);
  return c
    ? lineFor(c.action === 'cool' ? 'open-cool' : c.action === 'pack' ? 'open-pack' : 'open-create')
    : null;
}
export function preparationLine(s: GameState, prep: ViewState['prep']): DialogueLine | null {
  if (!prep || prep === 'tray') return null;
  if (prep === 'machine') {
    if (s.machine.status === 'processing' || s.machine.status === 'ready') return null;
    const foods = s.items.filter((f) => f.location.startsWith('machine:'));
    return lineFor(
      recipeFor(
        'machine',
        foods.map((f) => f.product),
      )
        ? 'start'
        : foods.some((f) => f.product === 'cup')
          ? 'fruit'
          : 'cup',
    );
  }
  if (s.stations[prep].status === 'processing' || s.stations[prep].status === 'ready') return null;
  return recipeFor(
    prep,
    s.items.filter((f) => f.location.startsWith(`station:${prep}:`)).map((f) => f.product),
  )
    ? lineFor('start')
    : null;
}
/** Presentation state is bounded and ephemeral; one existing audio owner handles all playback. */
export class DialogueDirector {
  current: DialogueTurn | null = null;
  recent: DialogueTurn[] = [];
  private last: GameState;
  private surface: 'off' | 'kitchen' | 'yard' = 'off';
  private seen = new Set<string>();
  private pendingRequest: string | null = null;
  private unsubscribe: () => void;
  constructor(
    private controller: GameController,
    private audio: ForegroundAudio,
  ) {
    this.last = controller.state;
    this.unsubscribe = controller.subscribe(() => this.sync());
  }
  setSurface(surface: 'off' | 'kitchen' | 'yard'): void {
    if (surface === this.surface) return;
    // A teaching/menu/chapter panel already owns the same audio channel. Its
    // child effect may start before this surface effect; do not cancel that voice.
    const presentation =
      surface === 'off' &&
      [...this.controller.pauses].some((r) => ['teaching', 'growth', 'opening'].includes(r));
    if (!presentation) this.audio.stop();
    this.surface = surface;
    this.pendingRequest = null;
    this.current = null;
    if (surface === 'yard') this.prompt();
    this.controller.notify();
  }
  show(t: DialogueTurn, automatic = false): void {
    if (automatic && this.seen.has(t.key)) {
      if (!this.current) {
        this.current = t;
        this.controller.notify();
      }
      return;
    }
    const available = !document.hidden && !this.controller.pauses.size;
    const allowed = available && this.audio.enabled && this.audio.settings.voice;
    this.pendingRequest = t.order && !allowed && !this.seen.has(t.key) ? t.key : null;
    if (allowed || !t.order) this.seen.add(t.key);
    if (this.seen.size > 64) this.seen.delete(this.seen.values().next().value ?? '');
    this.current = t;
    this.recent = [...this.recent.filter((r) => r.key !== t.key), t].slice(-6);
    this.controller.notify();
    if (this.current?.key === t.key && available && (allowed || !automatic))
      void this.audio.play(t.line.audio, undefined, t.order);
  }
  request(order: Order, automatic = false): void {
    const r = REQUESTS[order.request];
    this.show(
      {
        key: `${this.controller.state.runId}:request:${order.id}`,
        order: order.id,
        line: { ...r, role: order.visitor ?? 'guest', trigger: 'order' },
      },
      automatic,
    );
  }
  prompt(automatic = true): void {
    const line = actionPrompt(this.controller.state);
    if (line)
      this.show({ key: `${this.controller.state.runId}:prompt:${line.audio}`, line }, automatic);
  }
  invite(visitor: Visitor): void {
    const memories = this.controller.profile.value.activityMemories.filter(
      (m) => m.runId !== this.controller.state.runId,
    );
    const food = memories
      .flatMap((m) =>
        m.state.foods.filter((f) => {
          const index = ADVENTURES[m.state.chapter]?.orders.findIndex((o) => o.visitor === visitor);
          return (
            f.place === `guest-${visitor}` ||
            (index !== undefined && index >= 0 && f.source === `guest-${index}`)
          );
        }),
      )
      .at(-1);
    this.show({
      key: `${this.controller.state.runId}:invite:${visitor}`,
      line: { ...revisitLine(food?.product), role: visitor },
    });
  }
  replay(t = this.current): void {
    if (t && this.surface !== 'off' && !this.controller.pauses.size)
      this.show(
        t.order &&
          !this.controller.state.orders.some((o) => o.id === t.order && o.status === 'waiting')
          ? { ...t, historical: true }
          : t,
      );
  }
  private sync(): void {
    const s = this.controller.state,
      old = this.last;
    this.last = s;
    if (old.runId !== s.runId) {
      this.audio.stop();
      this.current = null;
      this.recent = [];
      this.seen.clear();
      this.pendingRequest = null;
      if (this.surface === 'yard') this.prompt();
      return;
    }
    if (
      this.current?.order &&
      !this.current.historical &&
      !s.orders.some((o) => o.id === this.current?.order && o.status === 'waiting')
    ) {
      this.audio.stop();
      this.current = null;
    }
    if (this.surface === 'off') return;
    if (
      this.pendingRequest === this.current?.key &&
      this.audio.enabled &&
      this.audio.settings.voice &&
      !document.hidden &&
      !this.controller.pauses.size
    ) {
      const pending = this.current;
      this.pendingRequest = null;
      this.show(pending, true);
    }
    const events = dialogueEvents(old, s);
    for (const e of events)
      this.recent = [...this.recent.filter((r) => r.key !== e.key), e].slice(-6);
    const latest =
      events.find((e) => ['imm-thanks', 'imm-share', 'imm-taste'].includes(e.line.audio)) ??
      events.at(-1);
    if (latest) this.show(latest, true);
  }
  destroy(): void {
    this.unsubscribe();
  }
}
