import type { Mode, RequestId } from '../content/catalog';
import { type Activity, CHAPTERS, type Support } from '../content/chapters';
import { storyLevel } from '../content/story-levels';
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
  message = '听一听，准备好，再把整盘递给客人。';
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
    if (this.pauses.size || delta <= 0 || delta > 250) return;
    const previous = this.state.revision;
    this.state = advance(this.state, delta);
    if (
      this.state.session.activity === 'story' &&
      this.state.orders.every((o) => o.status === 'done')
    ) {
      if (this.state.session.levelId)
        this.profile.completeLevel(this.state.session.levelId, this.state.session.storyChoice ?? 0);
      else if (!this.profile.value.completed.includes(this.state.session.chapter))
        this.profile.complete(this.state.session.chapter);
    }
    if (this.state.revision !== previous) {
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
  ): void {
    this.save.save(this.state);
    this.profile.value.support = support;
    if (activity === 'endless') this.profile.value.concurrency = concurrency;
    this.profile.save();
    const level = activity === 'story' ? storyLevel(levelId) : undefined;
    const key = `${activity}-${chapter}${level ? `-${level.id}` : ''}`;
    const stored = this.save.loadSession(key);
    const choice = level ? (this.profile.value.storyChoices[level.id] ?? 0) : 0;
    const previous =
      replay || (level?.choice && stored?.session.storyChoice !== choice) ? null : stored;
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
        this.profile.menu(),
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
    this.state.session.menu = this.profile.menu();
    this.state.session.language = this.profile.value.language;
    applyPolicy(this.state, support, concurrency);
    this.savedGame = Boolean(previous);
    this.checkpoint = 0;
    this.message = level?.situation ?? '选好备餐位置，点食材就能放进去。';
    this.save.save(this.state);
    this.notify();
  }
  private recordAttempts(prior: Set<string>): void {
    for (const a of this.state.attempts.filter((a) => !prior.has(a.id))) {
      this.profile.observe({
        id: a.id,
        dimension: a.activity === 'delivery' ? 'listening' : 'structure',
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
          this.state.session.menu = this.profile.menu();
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
