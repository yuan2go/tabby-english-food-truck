import { ADVENTURES, emptyAdventure, FAMILIES } from '../content/adventure';
import type { Mode, RequestId } from '../content/catalog';
import { type Activity, CHAPTERS, type Support } from '../content/chapters';
import { type ShopTheme, themeAllows } from '../content/free-shop';
import { storyLevel, storySituation } from '../content/story-levels';
import { startAdventure } from '../rules/adventure';
import { hydrateExperience } from '../rules/adventure-experience';
import { advance, createGame, dispatch } from '../rules/game';
import { applyPolicy, configureSession } from '../rules/sessions';
import type { Command, GameState, Result } from '../rules/types';
import { MiniStore } from './minis';
import { ProfileStore } from './profile';
import { SaveStore } from './save';
export class GameController {
  state: GameState;
  readonly save: SaveStore;
  readonly minis = new MiniStore(() => localStorage);
  readonly profile = new ProfileStore(() => localStorage);
  readonly pauses = new Set<string>(['home']);
  message = '点朋友听需要，拿起食品，再点目标。';
  savedGame = false;
  private serial = 0;
  private checkpoint = 0;
  private listeners = new Set<() => void>();
  constructor(
    save = new SaveStore(() => localStorage),
    private readonly runId: () => string = () => crypto.randomUUID(),
  ) {
    this.save = save;
    const loaded = save.load();
    this.savedGame = loaded?.ok === true;
    this.state = loaded?.ok
      ? loaded.state
      : configureSession(
          createGame(runId(), 0, {}, 'practice'),
          'training',
          0,
          this.profile.value.support,
          this.profile.value.introduced,
          1,
        );
  }
  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  notify(): void {
    for (const fn of this.listeners) fn();
  }
  command(command: Command): Result {
    const priorAttempts = new Set(this.state.attempts.map((a) => a.id));
    const result = dispatch(this.state, {
      id: `${this.state.runId}-cmd-${Date.now()}-${++this.serial}`,
      runId: this.state.runId,
      command,
    });
    this.state = result.state;
    if (result.message) this.message = result.message;
    this.recordAttempts(priorAttempts);
    this.syncActivity();
    if (command.type !== 'audio') this.save.save(this.state);
    if (
      result.kind === 'ok' &&
      (command.type === 'start-machine' || command.type === 'start-station')
    ) {
      const target =
        command.type === 'start-machine'
          ? 'juice'
          : (this.state.stations[command.station].recipe ?? command.station);
      this.profile.tutorial(`operation-${target}`);
      this.profile.observe({
        id: `operation:${this.state.runId}:${this.state.revision}`,
        dimension: 'operation',
        target,
        result: 'process-started',
        support: [],
        visit: this.profile.value.exposure.includes(target) ? 'revisit' : 'first',
        audioQualified: false,
      });
    }
    this.notify();
    return result;
  }
  tick(delta: number): void {
    if (this.pauses.size || !Number.isFinite(delta) || delta <= 0 || delta > 1000) return;
    // Active rendering can be slow. Bound each step instead of freezing every slow frame.
    // Lifecycle pauses and discarded resume frames still prevent suspended-time catch-up.
    delta = Math.min(delta, 250);
    const previous = this.state.revision;
    const receiving = this.state.orders.filter((o) => o.status !== 'done').map((o) => o.id);
    const helper = this.state.helper;
    this.state = advance(this.state, delta);
    if (
      receiving.some((id) => this.state.orders.some((o) => o.id === id && o.status === 'done')) &&
      this.message === '大咪正把这份心意送过去。'
    )
      this.message = '朋友收到啦！可以接着准备。';
    if (helper && !this.state.helper && this.message.includes('正在把食品带到制作承放区'))
      this.message = '食品放好了，点它拿起，再点目标。';
    if (
      !this.state.adventure &&
      this.state.session.activity === 'story' &&
      this.state.orders.every((o) => o.status === 'done')
    ) {
      if (this.state.session.levelId)
        this.profile.completeLevel(this.state.session.levelId, this.state.session.storyChoice ?? 0);
      else if (!this.profile.value.completed.includes(this.state.session.chapter))
        this.profile.complete(this.state.session.chapter);
    }
    if (this.state.revision !== previous) {
      this.syncActivity();
      this.save.save(this.state);
      this.notify();
    }
    this.checkpoint += delta;
    if (this.checkpoint >= 2000) {
      this.checkpoint = 0;
      const issue = this.save.issue;
      this.save.save(this.state);
      if (issue !== this.save.issue) this.notify();
    }
  }
  private syncActivity(): void {
    const a = this.state.adventure;
    if (!a) return;
    this.profile.rememberActivity(this.state.runId, a);
    for (const food of a.foods) {
      const id = `world:${this.state.runId}:${food.id}`;
      if (this.profile.value.observedIds.includes(id)) continue;
      const revisit = this.profile.value.receivedProducts.includes(food.product);
      if (!revisit) this.profile.value.receivedProducts.push(food.product);
      this.profile.observe({
        id,
        dimension: 'operation',
        target: food.source,
        result: `received:${food.product}`,
        support: [],
        visit: revisit ? 'revisit' : 'first',
        audioQualified: false,
      });
    }
  }
  private enterAdventure(
    chapter: number,
    support: Support,
    replay: boolean,
    concurrency: 1 | 2,
  ): void {
    if (!ADVENTURES[chapter]) return;
    this.save.save(this.state);
    const stored = this.save.loadSession(`story-${chapter}-adventure`);
    if (this.save.blocked) return;
    const history = this.history();
    this.state = !replay && stored ? stored : createGame(this.runId(), 0, history, 'practice');
    if (!this.state.adventure) {
      this.state.session.support = support;
      this.state.session.concurrency = concurrency;
      startAdventure(this.state, chapter);
    }
    applyPolicy(this.state, support, concurrency);
    if (this.state.adventure) {
      hydrateExperience(this.state.adventure);
      const e = this.state.adventure.experience;
      if (e) {
        e.known = [...this.profile.value.receivedProducts];
        e.picnic =
          this.profile.value.activityMemories
            .filter((m) => m.state.chapter === 2 && m.state.rewards.length)
            .at(-1)?.state.branch ?? null;
      }
    }
    if (stored) {
      this.state.noteSupport = [
        ...new Set([...this.state.noteSupport, ...stored.noteSupport]),
      ].slice(-24);
      if (
        replay &&
        (stored.noteSupport.length || stored.attempts.some((a) => a.activity === 'note'))
      )
        this.state.noteSupport = [
          ...new Set([...this.state.noteSupport, 'seen-in-prior-run']),
        ].slice(-24);
      for (const order of this.state.orders) {
        const prior = stored.orders.find((o) => o.id === order.id && o.status !== 'done');
        if (prior) order.support = [...new Set([...order.support, ...prior.support])].slice(-24);
      }
    }
    for (const family of FAMILIES.slice(0, Math.min(chapter + 1, 4)))
      this.profile.introduce(family);
    this.profile.value.support = support;
    this.profile.save();
    this.savedGame = Boolean(!replay && stored);
    this.checkpoint = 0;
    this.message = ADVENTURES[chapter]?.goal ?? '';
    this.syncActivity();
    this.save.save(this.state);
    this.notify();
  }
  resumeLegacyStory(): boolean {
    this.save.save(this.state);
    const key = this.save.legacyStoryKey();
    const stored = key ? this.save.loadSession(key) : null;
    if (!stored || stored.adventure || stored.session.activity !== 'story') return false;
    this.state = stored;
    this.checkpoint = 0;
    this.savedGame = true;
    this.message = '原营业的订单、食品和加工都在，接着准备。';
    this.save.save(this.state);
    this.notify();
    return true;
  }
  pause(reason: string, paused: boolean): void {
    if (paused) {
      this.pauses.add(reason);
      this.save.save(this.state);
    } else this.pauses.delete(reason);
    this.notify();
  }
  private history(): GameState['history'] {
    const history = structuredClone(this.state.history);
    if (!this.state.gameTime && !this.state.attempts.length && !this.state.lessons.length)
      return history;
    for (const order of this.state.orders)
      if (order.status !== 'queued')
        history[order.request] = [
          ...new Set([...(history[order.request] ?? []), ...order.support, 'seen-in-prior-run']),
        ].slice(-24);
    return history;
  }
  switchMode(mode: Mode): void {
    if (mode === this.state.mode) return;
    this.save.save(this.state);
    const history = this.history();
    const previous = this.save.loadMode(mode);
    if (this.save.blocked) {
      this.notify();
      return;
    }
    const next =
      previous ??
      createGame(this.runId(), mode === 'guided' ? 0 : Math.random() < 0.5 ? 0 : 1, history, mode);
    for (const request of Object.keys(history) as RequestId[])
      next.history[request] = [
        ...new Set([...(next.history[request] ?? []), ...(history[request] ?? [])]),
      ].slice(-24);
    this.state = next;
    this.checkpoint = 0;
    this.savedGame = Boolean(previous);
    this.message = previous ? '接着上次，食物和大咪都在。' : '先看一看，再亲手试试。';
    this.save.save(this.state);
    this.notify();
  }
  enter(
    activity: Activity,
    chapter = 0,
    support: Support = this.profile.value.support,
    replay = false,
    concurrency: 1 | 2 = this.profile.value.concurrency,
    levelId?: string,
    shop?: { menu: RequestId[]; theme: ShopTheme },
  ): void {
    if (activity === 'story' && !levelId) {
      this.enterAdventure(chapter, support, replay, concurrency);
      return;
    }
    if (
      shop &&
      (!shop.menu.length ||
        new Set(shop.menu).size !== shop.menu.length ||
        shop.menu.some((r) => !this.profile.menu().includes(r)) ||
        !shop.menu.some((r) => themeAllows(shop.theme, r)))
    ) {
      this.message = '先选熟悉的食品和可供应的主题。';
      this.notify();
      return;
    }
    this.save.save(this.state);
    this.profile.value.support = support;
    if (activity === 'endless') this.profile.value.concurrency = concurrency;
    this.profile.save();
    const level = activity === 'story' ? storyLevel(levelId) : undefined;
    const key = `${activity}-${chapter}${level ? `-${level.id}` : ''}`;
    const stored = this.save.loadSession(key);
    const choice = level?.followUp
      ? (this.profile.value.resolvedStoryChoices[level.followUp.from] ?? 0)
      : level
        ? (this.profile.value.storyChoices[level.id] ?? 0)
        : 0;
    const previous = replay ? null : stored;
    if (this.save.blocked) return;
    const history = this.history();
    this.state =
      previous ??
      configureSession(
        createGame(this.runId(), Math.random() < 0.5 ? 0 : 1, history, 'practice'),
        activity,
        chapter,
        support,
        this.profile.value.introduced,
        Math.floor(Math.random() * 4294967296),
        concurrency,
        shop ? shop.menu.filter((r) => themeAllows(shop.theme, r)) : this.profile.menu(),
        this.profile.value.language,
        level?.id,
        choice,
      );
    // Assistance belongs to the unfinished request, even after replay or a support change.
    if (stored) {
      this.state.noteSupport = [...new Set([...this.state.noteSupport, ...stored.noteSupport])];
      for (const order of this.state.orders) {
        const prior = stored.orders.find(
          (o) => o.id === order.id && o.request === order.request && o.status !== 'done',
        );
        if (prior) order.support = [...new Set([...order.support, ...prior.support])].slice(-24);
      }
    }
    // Introduced content is a preparation entitlement, never an assessment result.
    const family = CHAPTERS[chapter]?.family ?? 'juice';
    if (activity === 'story') this.profile.introduce(family);
    this.state.session.unlocked = [...this.profile.value.introduced];
    if (!this.state.session.shop)
      this.state.session.menu = shop ? [...shop.menu] : this.profile.menu();
    if (shop) {
      // Opening preferences apply before filling newly available seats. The
      // restored orders themselves remain unchanged, even outside this menu.
      this.state.session.menu = [...shop.menu];
      this.state.session.knownMenu = this.profile.menu();
      this.state.session.shop = { accepting: true, theme: shop.theme };
    }
    this.state.session.language = this.profile.value.language;
    if (activity === 'endless' && !this.state.adventure)
      this.state.adventure = emptyAdventure(4, 'shop');
    if (this.state.adventure) {
      hydrateExperience(this.state.adventure);
      const e = this.state.adventure.experience;
      if (e) {
        e.known = [...this.profile.value.receivedProducts];
        e.picnic =
          this.profile.value.activityMemories
            .filter((m) => m.state.chapter === 2 && m.state.rewards.length)
            .at(-1)?.state.branch ?? null;
      }
    }
    applyPolicy(this.state, support, concurrency);
    this.savedGame = Boolean(previous);
    this.checkpoint = 0;
    this.message = level
      ? storySituation(level, this.state.session.storyChoice ?? 0)
      : '选好备餐位置，点食材就能放进去。';
    this.save.save(this.state);
    this.notify();
  }
  private recordAttempts(prior: Set<string>): void {
    for (const a of this.state.attempts.filter((a) => !prior.has(a.id))) {
      this.profile.observe({
        id: a.id,
        dimension:
          a.activity === 'delivery'
            ? a.support.includes('caption-visible')
              ? 'meaning'
              : 'listening'
            : 'structure',
        target:
          a.activity === 'delivery'
            ? (this.state.orders.find((o) => a.input.startsWith(`${o.id}:`))?.request ?? 'request')
            : 'fruit-request',
        result: a.result,
        support: a.support,
        visit: a.visit,
        audioQualified: false,
      });
      if (a.activity === 'delivery' && a.result === 'completed') {
        const request = this.state.orders.find((o) => a.input.startsWith(`${o.id}:`))?.request;
        if (request) {
          this.profile.present(`menu:${request}`);
          const order = this.state.orders.find((o) => a.input.startsWith(`${o.id}:`));
          const key = `${this.state.runId}:${order?.id}`;
          const lesson = this.profile.value.lessons[key];
          if (lesson?.phase === 'practice') {
            this.profile.lesson(key, { ...lesson, phase: 'done' });
            this.profile.tutorial(`request-${request}`);
          }
          if (!this.state.session.shop) this.state.session.menu = this.profile.menu();
        }
      }
    }
  }
  restart(): void {
    const mode = this.state.mode,
      history = this.history(),
      noteSupport = this.state.noteSupport;
    this.save.reset();
    this.state = createGame(this.runId(), this.state.variant === 0 ? 1 : 0, history, mode);
    this.state.noteSupport = [...new Set([...noteSupport])].slice(-24);
    for (const o of this.state.orders)
      o.support = [
        ...new Set([
          ...o.support,
          ...(history[o.request] ?? []).filter((v) => !v.startsWith('seen-')),
        ]),
      ];
    this.savedGame = false;
    this.pauses.clear();
    this.checkpoint = 0;
    this.message = '新的一次开摊。先听一听。';
    this.save.save(this.state);
    this.notify();
  }
  destroy(): void {
    this.save.save(this.state);
    this.listeners.clear();
  }
}
