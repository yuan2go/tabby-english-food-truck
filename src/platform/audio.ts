import type { GameController } from './controller';
export const AUDIO_VERSION = 'samantha-dev-1';
export class ForegroundAudio {
  enabled = true;
  failure = '';
  active: string | null = null;
  private player: HTMLAudioElement | null = null;
  private epoch = 0;
  private context: AudioContext | null = null;
  constructor(private readonly controller: GameController) {}
  async play(id: string): Promise<void> {
    this.stop();
    if (!this.enabled || document.hidden) return;
    const epoch = ++this.epoch;
    const player = new Audio(`${import.meta.env.BASE_URL}audio/${id}.wav`);
    this.player = player;
    this.active = id;
    player.preload = 'auto';
    player.onended = () => {
      if (epoch !== this.epoch) return;
      this.record(id, 'completed');
      this.player = null;
      this.active = null;
      this.controller.notify();
    };
    player.onerror = () => {
      if (epoch !== this.epoch) return;
      this.fail(id);
    };
    try {
      await player.play();
      if (epoch !== this.epoch) {
        player.pause();
        return;
      }
      this.failure = '';
      this.record(id, 'started');
    } catch {
      if (epoch === this.epoch) this.fail(id);
    }
  }
  private fail(id: string): void {
    this.record(id, 'failed');
    this.failure = '声音没有播放成功。可以重听，或点“文字帮助”。';
    this.player = null;
    this.active = null;
    this.controller.notify();
  }
  private record(id: string, status: 'started' | 'completed' | 'interrupted' | 'failed'): void {
    this.controller.command({ type: 'audio', audio: { id, version: AUDIO_VERSION, status } });
  }
  stop(): void {
    const id = this.active;
    this.epoch++;
    if (this.player) {
      this.player.pause();
      this.player.onended = null;
      this.player.onerror = null;
      this.player.removeAttribute('src');
      this.player.load();
    }
    this.player = null;
    this.active = null;
    if (id) this.record(id, 'interrupted');
  }
  effect(kind: 'place' | 'start' | 'success'): void {
    if (!this.enabled || document.hidden) return;
    try {
      this.context ??= new AudioContext();
      void this.context.resume().catch(() => {});
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'sine';
      const now = this.context.currentTime;
      oscillator.frequency.setValueAtTime(
        kind === 'start' ? 170 : kind === 'success' ? 660 : 440,
        now,
      );
      oscillator.frequency.exponentialRampToValueAtTime(kind === 'success' ? 990 : 250, now + 0.12);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start();
      oscillator.stop(now + 0.2);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    } catch {
      /* Optional effect failure never changes language or game rules. */
    }
  }
  destroy(): void {
    this.stop();
    void this.context?.close();
    this.context = null;
  }
}
