import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CONTENT_VERSION } from '../src/content/catalog';
import { activate, type ViewState } from '../src/game/input';
import type { ForegroundAudio } from '../src/platform/audio';
import { GameController } from '../src/platform/controller';
import { decodeSnapshot } from '../src/rules/snapshot';

// Only the browser audio output is replaced; commands, inventory, attempts and saves are real.
const audio = { play: async () => 'completed', effect: () => {} } as unknown as ForegroundAudio;
let values: Map<string, string>;
beforeEach(() => {
  values = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
});
afterEach(() => vi.unstubAllGlobals());
function setup(level = 'c1-open-door') {
  const controller = new GameController();
  controller.enter('story', 0, 'pictures', true, 1, level);
  const ui: ViewState = {
    elements: new Map(),
    lowGraphics: false,
    inputBlocked: false,
    teaching: null,
    selected: null,
    selectedTray: 0,
    selectedGuest: '',
    hotspots: [],
    focus: null,
    ready: true,
    assetFailure: false,
    resourceMessage: '',
    prep: 'tray',
    openNote: () => {},
    openHelp: () => {},
    confirmClear: () => {},
    change: () => {},
  };
  const tap = (id: string) => activate(id, controller, audio, ui);
  return { controller, ui, tap };
}

it('tapping an empty tray changes ingredient destination after selecting the juice machine', () => {
  const { controller, ui, tap } = setup();
  tap('machine-apple');
  tap('tray-0');
  tap('supply-apple');
  expect(ui.prep).toBe('tray');
  expect(controller.state.items.find((item) => item.product === 'apple')?.location).toBe(
    'tray:0:0',
  );
  expect(controller.state.attempts).toHaveLength(0);
});
it('a picked-up tray is delivered only when the player then taps a guest', () => {
  const { controller, tap } = setup();
  tap('supply-apple');
  tap('tray-0');
  expect(controller.state.orders[0]?.status).toBe('waiting');
  tap('guest-0');
  expect(controller.state.orders[0]?.status).toBe('leaving');
  expect(controller.state.attempts).toHaveLength(1);
});
it('the speech bubble replays a request without submitting a held tray', () => {
  const { controller, ui, tap } = setup();
  tap('supply-apple');
  tap('tray-0');
  tap('listen-guest-0');
  expect(controller.state.orders[0]?.status).toBe('waiting');
  expect(controller.state.attempts).toHaveLength(0);
  expect(ui.selected).toEqual({ tray: 0 });
});
it('tapping a held tray again puts it down without submitting or changing its food', () => {
  const { controller, ui, tap } = setup();
  tap('supply-apple');
  tap('tray-0');
  tap('tray-0');
  expect(ui.selected).toBeNull();
  tap('guest-0');
  expect(controller.state.attempts).toHaveLength(0);
  expect(controller.state.items.map((i) => i.product)).toEqual(['apple']);
});
it('an explicitly delivered wrong tray stays available for correction', () => {
  const { controller, tap } = setup();
  tap('supply-banana');
  tap('tray-0');
  tap('guest-0');
  expect(controller.state.orders[0]?.status).toBe('waiting');
  expect(controller.state.attempts.at(-1)?.result).toBe('request-mismatch');
  expect(controller.state.items.map((item) => item.product)).toEqual(['banana']);
});
it('dragging an ingredient back to its basket removes only that instance', () => {
  const { controller, ui, tap } = setup();
  tap('supply-apple');
  tap('supply-banana');
  const apple = controller.state.items.find((item) => item.product === 'apple');
  if (!apple) throw Error('missing apple');
  activate('supply-apple', controller, audio, ui, { item: apple.id });
  expect(controller.state.items.map((item) => item.product)).toEqual(['banana']);
  expect(controller.state.attempts).toHaveLength(0);
});
it('starting juice leaves a direct preparation path while its output remains reserved', () => {
  const { controller, ui, tap } = setup('c1-first-juice');
  tap('machine-apple');
  tap('supply-apple');
  tap('start');
  expect(controller.state.machine.status).toBe('processing');
  expect(controller.state.routing.machine).toEqual({ tray: 0, slot: 0 });
  expect(ui.prep).toBe('tray');
});
it('choosing the physical juice tool prepares one real cup, just like touching the machine', () => {
  const { controller, tap } = setup('c1-first-juice');
  tap('family-juice');
  expect(controller.state.items.filter((i) => i.location === 'machine:cup')).toHaveLength(1);
  tap('supply-apple');
  tap('start');
  expect(controller.state.machine.status).toBe('processing');
});
it('only a completed choice changes the next visitor request, and an active follow-up survives reload', () => {
  const { controller } = setup();
  controller.profile.chooseStory('c1-two-friends', 1);
  controller.enter('story', 0, 'pictures', true, 1, 'c1-window-flower');
  expect(controller.state.orders.map((order) => order.request)).toEqual(['two', 'juice']);
  controller.profile.completeLevel('c1-two-friends', 1);
  controller.enter('story', 0, 'pictures', true, 1, 'c1-window-flower');
  expect(controller.state.orders.map((order) => order.request)).toEqual(['two', 'banana-juice']);
  const snapshot = decodeSnapshot(JSON.stringify(controller.state));
  expect(snapshot.ok).toBe(true);
  const run = controller.state.runId;
  controller.profile.chooseStory('c1-two-friends', 0);
  controller.enter('story', 0, 'pictures', false, 1, 'c1-window-flower');
  expect(controller.state.runId).toBe(run);
  expect(controller.state.orders.map((order) => order.request)).toEqual(['two', 'banana-juice']);
});
it('the preceding content version resumes a running job with the same instances and reservation', () => {
  const { controller, tap } = setup('c1-first-juice');
  tap('machine-apple');
  tap('supply-apple');
  tap('start');
  const prior = JSON.parse(JSON.stringify(controller.state));
  prior.schemaVersion = 6;
  prior.contentVersion = 'm2.3-story-1';
  delete prior.adventure;
  const resumed = decodeSnapshot(JSON.stringify(prior));
  expect(resumed.ok).toBe(true);
  if (!resumed.ok) throw Error(resumed.reason);
  expect(resumed.state.contentVersion).toBe(CONTENT_VERSION);
  expect(resumed.state.items).toEqual(prior.items);
  expect(resumed.state.routing).toEqual(prior.routing);
  expect(resumed.state.machine).toEqual(prior.machine);
});
it('slow active frames keep cooking moving in bounded steps, while suspension gaps do not fast-forward', () => {
  const { controller, tap } = setup('c1-first-juice');
  tap('machine-apple');
  tap('supply-apple');
  tap('start');
  controller.pause('home', false);
  for (let n = 0; n < 4; n++) controller.tick(400);
  expect(controller.state.machine.remaining).toBe(4000);
  controller.tick(10000);
  expect(controller.state.machine.remaining).toBe(4000);
  controller.pause('hidden', true);
  controller.tick(400);
  expect(controller.state.machine.remaining).toBe(4000);
});
it('an already running choice keeps its bound branch and preparation until an explicit replay', () => {
  const { controller, tap } = setup('c1-two-friends');
  tap('supply-apple');
  const run = controller.state.runId;
  const items = [...controller.state.items];
  controller.profile.chooseStory('c1-two-friends', 1);
  controller.enter('story', 0, 'pictures', false, 1, 'c1-two-friends');
  expect(controller.state.runId).toBe(run);
  expect(controller.state.items).toEqual(items);
  expect(controller.state.session.storyChoice).toBe(0);
  controller.enter('story', 0, 'pictures', true, 1, 'c1-two-friends');
  expect(controller.state.session.storyChoice).toBe(1);
});
