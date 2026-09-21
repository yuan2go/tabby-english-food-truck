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
  expect(await sequence).toBe('cancelled');
  Player.all[2]?.onended?.();
  expect(await replay).toBe('completed');
  expect(
    events.filter(
      (e) => e.type === 'audio' && e.audio.id === 'request-apple' && e.audio.status === 'completed',
    ),
  ).toHaveLength(0);
});
it('refusal, missing clip and mute settle without waiting for an invented timer', async () => {
  Player.rejected = true;
  expect(await audio.sequence(['chapter-juice', 'request-apple'])).toBe('completed');
  expect(audio.active).toBeNull();
  expect(await audio.play('not-a-resource')).toBe('failed');
  audio.set('voice', false);
  expect(await audio.play('apple')).toBe('muted');
  expect(events.filter((e) => e.type === 'audio' && e.audio.status === 'started')).toHaveLength(0);
});
it('skip and background stop cancel speech and late callbacks cannot provide playback evidence', async () => {
  const started = vi.fn();
  const playing = audio.play('apple', started);
  audio.stop();
  await Promise.resolve();
  expect(await playing).toBe('interrupted');
  expect(started).not.toHaveBeenCalled();
  vi.stubGlobal('document', { hidden: true });
  expect(await audio.sequence(['apple', 'banana'])).toBe('cancelled');
  expect(Player.all).toHaveLength(1);
});
