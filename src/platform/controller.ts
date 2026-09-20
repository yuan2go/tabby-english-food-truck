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
    this.state = loaded?.ok ? loaded.state : createGame(runId(), Math.random() < 0.5 ? 0 : 1);
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
    this.save.save(this.state);
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
    if (this.checkpoint >= 1000) {
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
  restart(): void {
    const support = Object.fromEntries(
      this.state.orders.map((o) => [o.request, [...new Set([...o.support, 'seen-in-prior-run'])]]),
    );
    this.save.reset();
    this.state = createGame(this.runId(), this.state.variant === 0 ? 1 : 0, support);
    this.savedGame = false;
    this.pauses.clear();
    this.checkpoint = 0;
    this.message = '新的一次开摊。两位客人的座位可能换了，先听一听。';
    this.save.save(this.state);
    this.notify();
  }
  destroy(): void {
    this.save.save(this.state);
    this.listeners.clear();
  }
}
