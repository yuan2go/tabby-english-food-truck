import type { GameState } from '../rules/types';
import { resourceUrl } from './build';
import type { GameController } from './controller';
export const AUDIO_VERSION = 'samantha-dev-1';
export type SoundSetting = 'master' | 'voice' | 'music' | 'ambience' | 'effects';
export type Effect =
  | 'press'
  | 'place'
  | 'insert'
  | 'start'
  | 'success'
  | 'ready'
  | 'arrive'
  | 'cat'
  | 'gentle';
const defaults: Record<SoundSetting, boolean> = {
  master: true,
  voice: true,
  music: true,
  ambience: true,
  effects: true,
};
const SETTINGS_KEY = 'tabby.foodtruck.audio.v2';
/** One owner for all sound lifetimes. No sound callback changes inventory. */
export class ForegroundAudio {
  settings = { ...defaults };
  failure = '';
  active: string | null = null;
  private player: HTMLAudioElement | null = null;
  private epoch = 0;
  private context: AudioContext | null = null;
  private buses: Record<'music' | 'ambience' | 'machine' | 'effects', GainNode> | null = null;
  private loops = new Map<string, AudioBufferSourceNode>();
  private buffers = new Map<string, AudioBuffer>();
  private effects = new Map<OscillatorNode, GainNode>();
  private unsubscribe: () => void;
  private last: GameState;
  private unlocked = false;
  private disposed = false;
  get enabled(): boolean {
    return this.settings.master;
  }
  set enabled(value: boolean) {
    this.set('master', value);
  }
  constructor(private readonly controller: GameController) {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null');
      if (raw && typeof raw === 'object')
        for (const key of Object.keys(defaults) as SoundSetting[])
          if (key in raw && typeof Reflect.get(raw, key) === 'boolean')
            this.settings[key] = Reflect.get(raw, key);
    } catch {
      /* Settings failure is non-fatal. */
    }
    this.last = controller.state;
    this.unsubscribe = controller.subscribe(() => this.sync());
  }
  set(key: SoundSetting, value: boolean): void {
    this.settings[key] = value;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      /* Keep session settings. */
    }
    if (!this.enabled || !this.settings.voice) this.stop();
    if (!this.enabled || !this.settings.effects) this.stopEffects();
    this.sync();
  }
  async unlock(): Promise<void> {
    if (this.disposed || !this.enabled) return;
    try {
      if (!this.context) {
        this.context = new AudioContext();
        const context = this.context;
        const bus = () => {
          const gain = context.createGain();
          gain.connect(context.destination);
          return gain;
        };
        this.buses = { music: bus(), ambience: bus(), machine: bus(), effects: bus() };
      }
      await this.context.resume();
      if (this.disposed) return;
      this.unlocked = this.context.state === 'running';
      this.sync();
    } catch {
      this.failure = '声音暂时无法启动。可再次打开声音，或用图示帮助。';
      this.controller.notify();
    }
  }
  async play(id: string): Promise<void> {
    this.stop();
    if (!this.enabled || !this.settings.voice || document.hidden || this.disposed) return;
    void this.unlock();
    const epoch = ++this.epoch,
      player = new Audio(resourceUrl('audio', `${id}.wav`));
    this.player = player;
    this.active = id;
    player.volume = 0.8;
    player.preload = 'auto';
    this.duck();
    player.onended = () => {
      if (epoch !== this.epoch) return;
      this.player = null;
      this.active = null;
      this.record(id, 'completed');
      this.duck();
    };
    player.onerror = () => {
      if (epoch === this.epoch) this.fail(id);
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
    this.epoch++;
    if (this.player) {
      this.player.pause();
      this.player.onended = null;
      this.player.onerror = null;
    }
    this.player = null;
    this.active = null;
    this.failure = '声音没有播放成功。可以重听，或点“图示帮助”。';
    this.record(id, 'failed');
    this.duck();
  }
  private record(id: string, status: 'started' | 'completed' | 'interrupted' | 'failed'): void {
    if (!this.disposed)
      this.controller.command({ type: 'audio', audio: { id, version: AUDIO_VERSION, status } });
  }
  stop(): void {
    const id = this.active;
    this.epoch++;
    this.active = null;
    if (this.player) {
      this.player.pause();
      this.player.onended = null;
      this.player.onerror = null;
      this.player.removeAttribute('src');
      this.player.load();
    }
    this.player = null;
    if (id) this.record(id, 'interrupted');
    this.duck();
    if (document.hidden || this.controller.pauses.size) {
      this.stopLoops();
      this.stopEffects();
    }
  }
  private duck(): void {
    if (!this.context || !this.buses) return;
    const now = this.context.currentTime,
      voice = Boolean(this.active);
    this.buses.music.gain.setTargetAtTime(voice ? 0.025 : 0.09, now, 0.04);
    this.buses.ambience.gain.setTargetAtTime(voice ? 0.018 : 0.045, now, 0.04);
    this.buses.machine.gain.setTargetAtTime(voice ? 0.025 : 0.09, now, 0.04);
    this.buses.effects.gain.value = voice ? 0.1 : 0.2;
  }
  private loopBuffer(kind: string): AudioBuffer {
    const old = this.buffers.get(kind);
    if (old) return old;
    const context = this.context;
    if (!context) throw new Error('Audio is not unlocked');
    const seconds = kind === 'music' ? 16 : kind === 'ambience' ? 8 : 1;
    const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate),
      data = buffer.getChannelData(0);
    const notes = [
      261.63, 329.63, 392, 329.63, 293.66, 392, 440, 392, 329.63, 261.63, 293.66, 329.63, 392,
      329.63, 293.66, 261.63,
    ];
    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      if (kind === 'music') {
        const local = t % 1,
          f = notes[Math.floor(t)] ?? 261.63;
        const env = Math.min(1, local / 0.02) * Math.exp(-local * 5);
        data[i] =
          (Math.sin(t * f * Math.PI * 2) + 0.2 * Math.sin(t * f * Math.PI * 4)) * env * 0.55;
      } else if (kind === 'ambience') {
        const a = t % 2,
          env = Math.max(0, 1 - Math.abs(a - 0.3) / 0.2);
        data[i] =
          Math.sin(2 * Math.PI * (1450 * t + 25 * Math.sin(2 * Math.PI * 2 * t))) * env * 0.15 +
          Math.sin(2 * Math.PI * 65 * t) * 0.05;
      } else
        data[i] =
          (Math.sin(2 * Math.PI * 75 * t) * 0.5 + Math.sin(2 * Math.PI * 150 * t) * 0.15) *
          (0.75 + 0.25 * Math.sin(2 * Math.PI * 8 * t));
    }
    this.buffers.set(kind, buffer);
    return buffer;
  }
  private loop(kind: 'music' | 'ambience' | 'machine', enabled: boolean): void {
    const existing = this.loops.get(kind);
    if (!enabled) {
      if (existing) {
        existing.stop();
        existing.disconnect();
        this.loops.delete(kind);
      }
      return;
    }
    if (existing || !this.context || !this.buses) return;
    const source = this.context.createBufferSource();
    source.buffer = this.loopBuffer(kind);
    source.loop = true;
    source.connect(this.buses[kind]);
    source.start();
    this.loops.set(kind, source);
  }
  private stopLoops(): void {
    for (const source of this.loops.values()) {
      source.stop();
      source.disconnect();
    }
    this.loops.clear();
  }
  private stopEffects(): void {
    for (const [oscillator, gain] of this.effects) {
      oscillator.onended = null;
      try {
        oscillator.stop();
      } catch {
        /* already stopped */
      }
      oscillator.disconnect();
      gain.disconnect();
    }
    this.effects.clear();
  }
  private sync(): void {
    if (this.disposed) return;
    const s = this.controller.state,
      old = this.last;
    this.last = s;
    const canRun =
      this.enabled && this.unlocked && !document.hidden && this.controller.pauses.size === 0;
    if (old.runId !== s.runId) {
      this.stop();
      this.stopLoops();
      this.stopEffects();
    }
    if (!canRun) {
      this.stopLoops();
      this.stopEffects();
      return;
    }
    this.duck();
    this.loop('music', this.settings.music);
    this.loop('ambience', this.settings.ambience);
    this.loop('machine', this.settings.effects && s.machine.status === 'processing');
    if (old.runId === s.runId) {
      if (old.machine.status !== 'processing' && s.machine.status === 'processing')
        this.effect('start');
      if (old.machine.status === 'processing' && s.machine.status === 'ready') this.effect('ready');
      if (!old.helper && s.helper) this.effect('cat');
      if (old.helper && !s.helper && s.items.some((i) => old.helper?.itemIds.includes(i.id)))
        this.effect('place');
      if (
        s.orders.some(
          (o) =>
            o.status === 'leaving' && old.orders.find((p) => p.id === o.id)?.status === 'waiting',
        )
      )
        this.effect('success');
      if (
        s.orders.some(
          (o) =>
            o.status === 'waiting' && old.orders.find((p) => p.id === o.id)?.status === 'queued',
        )
      )
        this.effect('arrive');
    }
  }
  effect(kind: Effect): void {
    if (!this.enabled || !this.settings.effects || document.hidden || this.disposed) return;
    if (this.context?.state !== 'running') {
      void this.unlock();
      return;
    }
    if (this.effects.size >= 6 || !this.buses) return;
    try {
      const frequencies: Record<Effect, [number, number]> = {
        press: [420, 350],
        place: [520, 310],
        insert: [330, 200],
        start: [170, 230],
        success: [660, 990],
        ready: [740, 1100],
        arrive: [620, 780],
        cat: [440, 580],
        gentle: [330, 294],
      };
      const oscillator = this.context.createOscillator(),
        gain = this.context.createGain(),
        now = this.context.currentTime;
      const [from, to] = frequencies[kind],
        duration = kind === 'press' ? 0.055 : kind === 'success' ? 0.3 : 0.15;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(from, now);
      oscillator.frequency.exponentialRampToValueAtTime(to, now + duration);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      oscillator.connect(gain);
      gain.connect(this.buses.effects);
      this.effects.set(oscillator, gain);
      oscillator.start();
      oscillator.stop(now + duration);
      oscillator.onended = () => {
        this.effects.delete(oscillator);
        oscillator.disconnect();
        gain.disconnect();
      };
    } catch {
      /* Optional effects never affect rule results. */
    }
  }
  diagnostics(): object {
    return {
      active: this.active,
      loops: [...this.loops.keys()],
      settings: this.settings,
      context: this.context?.state ?? 'not-created',
      musicGain: this.buses?.music.gain.value,
      machineGain: this.buses?.machine.gain.value,
      effects: this.effects.size,
    };
  }
  destroy(): void {
    this.unsubscribe();
    this.stop();
    this.stopLoops();
    this.stopEffects();
    this.disposed = true;
    void this.context?.close();
    this.context = null;
  }
}
