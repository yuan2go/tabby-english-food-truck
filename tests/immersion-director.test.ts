import { afterEach, beforeEach, expect, it, vi } from 'vitest';

vi.mock('../src/platform/build', () => ({ resourceUrl: (f: string, p: string) => `/${f}/${p}` }));

import { REQUESTS } from '../src/content/catalog';
import { ForegroundAudio } from '../src/platform/audio';
import { GameController } from '../src/platform/controller';
import { DialogueDirector } from '../src/platform/dialogue';
import { SaveStore } from '../src/platform/save';
import { createGame, dispatch } from '../src/rules/game';

class Player {
  static all: Player[] = [];
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  volume = 1;
  preload = '';
  paused = false;
  constructor(readonly src: string) {
    Player.all.push(this);
  }
  play() {
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  removeAttribute() {}
  load() {}
}
let controller: GameController, audio: ForegroundAudio, director: DialogueDirector;
beforeEach(() => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => values.set(k, v),
    removeItem: (k: string) => values.delete(k),
  };
  vi.stubGlobal('localStorage', storage);
  vi.stubGlobal('document', { hidden: false });
  vi.stubGlobal('Audio', Player);
  Player.all = [];
  let run = 0;
  controller = new GameController(new SaveStore(() => storage), () => `director-${++run}`);
  audio = new ForegroundAudio(controller);
  vi.spyOn(audio, 'unlock').mockResolvedValue();
  director = new DialogueDirector(controller, audio);
  controller.pauses.clear();
  controller.state = createGame('director', 0, {}, 'service');
  controller.notify();
  director.setSurface('kitchen');
});
afterEach(() => {
  director.destroy();
  audio.destroy();
  vi.unstubAllGlobals();
});
it('returning to a surface retains the unresolved sentence without replaying stale audio', async () => {
  const o = controller.state.orders[0];
  if (!o) throw Error('order');
  director.request(o, true);
  const count = Player.all.length;
  director.setSurface('off');
  director.setSurface('kitchen');
  director.request(o, true);
  expect(director.current?.order).toBe(o.id);
  expect(director.current?.line.text).toBe(REQUESTS[o.request].text);
  expect(Player.all.length).toBe(count);
  expect(audio.active).toBeNull();
  vi.stubGlobal('document', { hidden: true });
  director.replay();
  expect(Player.all.length).toBe(count);
});
it('same-sentence customers receive separate playback evidence; captions remain meaning and replay creates no attempt', async () => {
  const first = controller.state.orders[0],
    second = controller.state.orders[1];
  if (!first || !second) throw Error('orders');
  first.request = 'apple';
  second.request = 'apple';
  director.request(first);
  director.request(second);
  await Promise.resolve();
  Player.all.at(-1)?.onended?.();
  expect(controller.state.orders[0]?.heard).toBe(false);
  expect(controller.state.orders[1]?.heard).toBe(true);
  expect(controller.state.attempts).toEqual([]);
  controller.command({ type: 'support', order: first.id, reason: 'caption-visible' });
  controller.command({ type: 'move', source: { supply: 'apple' }, destination: { tray: 0 } });
  controller.command({ type: 'deliver', tray: 0, order: first.id });
  const observation = controller.profile.value.observations.find((o) =>
    o.support.includes('caption-visible'),
  );
  expect(observation?.dimension).toBe('meaning');
  expect(observation?.audioQualified).toBe(false);
});
it('foreign audio order identity never credits a waiting request', () => {
  const s = createGame('scope');
  const r = dispatch(s, {
    id: 'audio',
    runId: s.runId,
    command: {
      type: 'audio',
      audio: { id: REQUESTS.apple.audio, version: 'dev', status: 'completed', order: 'guest-99' },
    },
  });
  expect(r.state.orders[0]?.heard).toBe(false);
});
it('a new chapter on the same yard surface immediately presents its own action sentence', () => {
  director.setSurface('yard');
  controller.enter('story', 1, 'less', true);
  expect(director.current?.line.audio).toBe('imm-open-cool');
});
it('explicit history replay of an already received request retains exact text while never crediting another guest', async () => {
  const o = controller.state.orders[0];
  if (!o) throw Error('order');
  director.request(o);
  const past = director.current;
  if (!past) throw Error('turn');
  controller.state.orders[0] = { ...o, status: 'done' };
  controller.notify();
  director.replay(past);
  expect(director.current?.line.text).toBe(past.line.text);
  await Promise.resolve();
  Player.all.at(-1)?.onended?.();
  expect(controller.state.attempts).toEqual([]);
});

it('an unresolved request first plays when assets allow sound; an interrupted sentence is never automatically resumed', async () => {
  const o = controller.state.orders[0];
  if (!o) throw Error('order');
  controller.pause('assets', true);
  director.request(o, true);
  expect(Player.all).toHaveLength(0);
  controller.pause('assets', false);
  expect(audio.active).toBe(REQUESTS[o.request].audio);
  await Promise.resolve();
  controller.pause('hidden', true);
  expect(audio.active).toBeNull();
  const count = Player.all.length;
  controller.pause('hidden', false);
  expect(Player.all.length).toBe(count);
  expect(director.current?.line.text).toBe(REQUESTS[o.request].text);
});
it('leaving before sound becomes available cancels the initial request opportunity', () => {
  const o = controller.state.orders[0];
  if (!o) throw Error('order');
  controller.pause('assets', true);
  director.request(o, true);
  director.setSurface('off');
  controller.pause('assets', false);
  expect(Player.all).toHaveLength(0);
});

it('food-shelf context sound records playback without crediting either identical waiting request', () => {
  const [first, second] = controller.state.orders;
  if (!first || !second) throw Error('orders');
  first.request = second.request = 'apple';
  for (const status of ['completed', 'failed', 'muted', 'skipped'] as const)
    controller.command({
      type: 'audio',
      audio: { id: REQUESTS.apple.audio, version: 'dev', status },
    });
  expect(
    controller.state.orders.every(
      (o) =>
        !o.heard &&
        !o.support.includes('audio-unavailable') &&
        !o.support.includes('muted-visual') &&
        !o.support.includes('skipped-visual'),
    ),
  ).toBe(true);
  expect(controller.state.audio.at(-1)?.status).toBe('skipped');
});

it('menu introduction voice uses its clock pause without interrupting the shared channel', async () => {
  controller.pause('growth', true);
  void audio.play(REQUESTS.banana.audio);
  director.setSurface('off');
  await Promise.resolve();
  expect(audio.active).toBe(REQUESTS.banana.audio);
  const before = controller.state.gameTime;
  controller.tick(250);
  expect(controller.state.gameTime).toBe(before);
  controller.pause('modal', true);
  expect(audio.active).toBeNull();
});

it('a real receipt remains available to a later visitor even before chapter completion', () => {
  controller.enter('story', 0, 'less', true);
  controller.command({ type: 'move', source: { supply: 'apple' }, destination: { tray: 0 } });
  const o = controller.state.orders[0];
  if (!o) throw Error('order');
  controller.command({ type: 'deliver', tray: 0, order: o.id });
  for (let i = 0; i < 100; i++) controller.tick(250);
  expect(controller.state.adventure?.rewards).toEqual([]);
  expect(controller.profile.value.activityMemories.at(-1)?.state.foods[0]?.product).toBe('apple');
  controller.enter('endless', 0, 'less', true);
  director.setSurface('yard');
  director.invite('rabbit');
  expect(director.current?.line.text).toBe('I remember your apple.');
});

it('a new muted request stays visible and starts once on first voice availability, without replay after later mute', () => {
  const o = controller.state.orders[0];
  if (!o) throw Error('order');
  audio.set('voice', false);
  director.request(o, true);
  expect(Player.all).toHaveLength(0);
  expect(director.current?.order).toBe(o.id);
  director.replay();
  audio.set('voice', true);
  expect(audio.active).toBe(REQUESTS[o.request].audio);
  const count = Player.all.length;
  audio.set('voice', false);
  audio.set('voice', true);
  expect(Player.all.length).toBe(count);
  expect(audio.active).toBeNull();
});
