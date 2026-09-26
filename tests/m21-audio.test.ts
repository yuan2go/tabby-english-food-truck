import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createGame } from '../src/rules/game';
import type { Command } from '../src/rules/types';

vi.mock('../src/platform/build', () => ({
  resourceUrl: (folder: string, file: string) => `/${folder}/${file}`,
}));

import { ForegroundAudio } from '../src/platform/audio';
import type { GameController } from '../src/platform/controller';

class Player {
  static all: Player[] = [];
  static rejected = false;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  volume = 1;
  preload = '';
  paused = false;
  constructor(readonly src: string) {
    Player.all.push(this);
  }
  play() {
    return Player.rejected ? Promise.reject(Error('autoplay refused')) : Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  removeAttribute() {}
  load() {}
}
let audio: ForegroundAudio;
let events: Command[];
beforeEach(() => {
  Player.all = [];
  Player.rejected = false;
  events = [];
  vi.stubGlobal('document', { hidden: false });
  vi.stubGlobal('Audio', Player);
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {} });
  const controller = {
    state: createGame('audio'),
    pauses: new Set<string>(),
    subscribe: () => () => {},
    command: (c: Command) => events.push(c),
    notify: () => {},
  };
  audio = new ForegroundAudio(controller as unknown as GameController);
  vi.spyOn(audio, 'unlock').mockResolvedValue();
});
afterEach(() => {
  audio.destroy();
  vi.unstubAllGlobals();
});
it('foreground sequence waits on completion; explicit replay cancels the remaining narration', async () => {
  const sequence = audio.sequence(['chapter-juice', 'request-apple']);
  await Promise.resolve();
  expect(audio.active).toBe('chapter-juice');
  expect(Player.all).toHaveLength(1);
  Player.all[0]?.onended?.();
  await Promise.resolve();
  expect(audio.active).toBe('request-apple');
  const stale = Player.all[1]?.onended;
  const replay = audio.play('apple');
  stale?.();
  await Promise.resolve();
  expect(audio.active).toBe('apple');
  expect(await sequence).toBe('interrupted');
  Player.all[2]?.onended?.();
  expect(await replay).toBe('completed');
  expect(
    events.filter(
      (e) => e.type === 'audio' && e.audio.id === 'request-apple' && e.audio.status === 'completed',
    ),
  ).toHaveLength(0);
});
it('sequence stops at failure, missing clip and mute without playing later clips', async () => {
  Player.rejected = true;
  expect(await audio.sequence(['chapter-juice', 'request-apple'])).toBe('failed');
  expect(Player.all).toHaveLength(1);
  expect(audio.active).toBeNull();
  expect(await audio.play('not-a-resource')).toBe('failed');
  audio.set('voice', false);
  expect(await audio.sequence(['apple', 'banana'])).toBe('muted');
  expect(Player.all).toHaveLength(1);
  expect(events.filter((e) => e.type === 'audio' && e.audio.status === 'started')).toHaveLength(0);
});
it('skip, mute and background stop have distinct results; late callbacks cannot provide evidence', async () => {
  const started = vi.fn();
  const playing = audio.play('apple', started);
  const stale = Player.all[0]?.onended;
  audio.skip();
  await Promise.resolve();
  stale?.();
  expect(await playing).toBe('skipped');
  expect(events.some((e) => e.type === 'audio' && e.audio.status === 'skipped')).toBe(true);
  expect(started).not.toHaveBeenCalled();
  const sequence = audio.sequence(['apple', 'banana']);
  audio.set('voice', false);
  expect(await sequence).toBe('muted');
  expect(events.some((e) => e.type === 'audio' && e.audio.status === 'muted')).toBe(true);
  audio.set('voice', true);
  const interrupted = audio.play('apple');
  audio.stop();
  expect(await interrupted).toBe('interrupted');
  vi.stubGlobal('document', { hidden: true });
  expect(await audio.sequence(['apple', 'banana'])).toBe('interrupted');
  expect(events.filter((e) => e.type === 'audio' && e.audio.status === 'completed')).toHaveLength(
    0,
  );
});
