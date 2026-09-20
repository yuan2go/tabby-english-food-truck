import type { Mode, RequestId } from '../content/catalog';
import { advance, createGame, dispatch } from '../rules/game';
import type { Command, GameState, Result } from '../rules/types';
import { SaveStore } from './save';
export class GameController {
  state: GameState;
  readonly save: SaveStore;
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
    this.state = loaded?.ok ? loaded.state : createGame(runId(), 0, {}, 'guided');
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
    const result = dispatch(this.state, {
      id: `${this.state.runId}-cmd-${Date.now()}-${++this.serial}`,
      runId: this.state.runId,
      command,
    });
    this.state = result.state;
    if (result.message) this.message = result.message;
    if (command.type !== 'audio') this.save.save(this.state);
    this.notify();
    return result;
  }
  tick(delta: number): void {
    if (this.pauses.size || delta <= 0 || delta > 250) return;
    const previous = this.state.revision;
    this.state = advance(this.state, delta);
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
    for (const o of next.orders)
      o.support = [...new Set([...o.support, ...(next.history[o.request] ?? [])])].slice(-24);
    next.noteSupport = [...new Set([...next.noteSupport, ...this.state.noteSupport])].slice(-24);
    this.state = next;
    this.checkpoint = 0;
    this.savedGame = Boolean(previous);
    this.message = previous ? '接着上次，食物和小猫都在。' : '先看一看，再亲手试试。';
    this.save.save(this.state);
    this.notify();
  }
  restart(): void {
    const mode = this.state.mode,
      history = this.history(),
      noteSupport = this.state.noteSupport;
    this.save.reset();
    this.state = createGame(this.runId(), this.state.variant === 0 ? 1 : 0, history, mode);
    this.state.noteSupport = [...noteSupport];
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
