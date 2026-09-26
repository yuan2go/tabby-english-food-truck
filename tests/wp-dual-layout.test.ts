import { describe, expect, it } from 'vitest';
import { REQUESTS } from '../src/content/catalog';
import { CHAPTERS } from '../src/content/chapters';
import { wordById } from '../src/content/learning';
import { MINI_LEVELS } from '../src/content/mini-levels';
import { PREPARED, RAW, RECIPES } from '../src/content/recipes';
import {
  levelsForChapter,
  STORY_LEVELS,
  storyRequests,
  storyVisitors,
} from '../src/content/story-levels';
import { layoutFor } from '../src/game/layout';
import { emptyProfile, ProfileStore } from '../src/platform/profile';
import { advance, createGame } from '../src/rules/game';
import {
  courseKind,
  courseTarget,
  createCourse,
  nextCourse,
  playCourse,
  startCourse,
  submitCourse,
  tileBank,
  toggleTile,
  validateCourse,
} from '../src/rules/mini-course';
import { configureSession } from '../src/rules/sessions';
import { decodeSnapshot, validateState } from '../src/rules/snapshot';

const supplyable = new Set([...RAW, ...PREPARED, ...RECIPES.map((recipe) => recipe.output)]);
describe('authored content and migrations', () => {
  it('connects 25 distinct story services to valid recipes and stable chapters', () => {
    expect(STORY_LEVELS).toHaveLength(25);
    expect(new Set(STORY_LEVELS.map((level) => level.id)).size).toBe(25);
    for (const chapter of CHAPTERS) expect(levelsForChapter(chapter.id)).toHaveLength(5);
    for (const level of STORY_LEVELS) {
      expect(level.situation.length).toBeGreaterThan(10);
      expect(level.objective.length).toBeGreaterThan(8);
      expect(level.result.length).toBeGreaterThan(8);
      expect(level.visitors).toHaveLength(level.requests.length);
      for (const request of level.requests) {
        expect(REQUESTS[request]).toBeDefined();
        expect(REQUESTS[request].products.every((product) => supplyable.has(product))).toBe(true);
      }
      if (level.choice) {
        expect(level.choice.alternate.join('|')).not.toBe(level.requests.join('|'));
        expect([...level.choice.alternate].sort()).toEqual([...level.requests].sort());
        expect(storyRequests(level, 1)).toEqual(level.choice.alternate);
        expect(storyVisitors(level, 1)).toEqual([...level.visitors].reverse());
      }
    }
    const final = STORY_LEVELS.at(-1);
    expect(final?.result).toContain('合影');
    expect(final?.situation).toContain('彩旗');
  });
  it('keeps old chapter receipts while new level receipts start unfinished', () => {
    const old = emptyProfile();
    old.completed = [0, 1];
    const {
      completedLevels: _levels,
      storyChoices: _choices,
      resolvedStoryChoices: _outcomes,
      ...legacy
    } = old;
    const raw = JSON.stringify(legacy);
    const storage = { getItem: () => raw, setItem: () => {}, removeItem: () => {} };
    const profile = new ProfileStore(() => storage);
    expect(profile.value.completed).toEqual([0, 1]);
    expect(profile.value.completedLevels).toEqual([]);
    profile.completeLevel('c3-bread');
    expect(profile.value.completedLevels).toEqual(['c3-bread']);
    expect(profile.value.completed).toEqual([0, 1]);
    profile.completeLevel('c1-two-friends', 1);
    expect(profile.value.resolvedStoryChoices['c1-two-friends']).toBe(1);
    profile.chooseStory('c1-two-friends', 0);
    expect(profile.value.resolvedStoryChoices['c1-two-friends']).toBe(1);
    profile.completeLevel('c1-two-friends', 0);
    expect(profile.value.resolvedStoryChoices['c1-two-friends']).toBe(0);
    expect(profile.value.completedLevels.filter((id) => id === 'c1-two-friends')).toHaveLength(1);
  });
  it('migrates m2.2 world content without inventing level progress', () => {
    const old = createGame('old-world');
    old.contentVersion = 'm2.2';
    const decoded = decodeSnapshot(JSON.stringify(old));
    expect(decoded.ok).toBe(true);
    if (decoded.ok) expect(decoded.state.session.levelId).toBeUndefined();
    const level = STORY_LEVELS.find((part) => part.choice);
    expect(level).toBeDefined();
    if (!level) return;
    const fresh = configureSession(
      createGame('choice-world'),
      'story',
      level.chapter,
      'pictures',
      ['juice', 'ice', 'sandwich', 'burger'],
      1,
      1,
      undefined,
      'combined',
      level.id,
      1,
    );
    expect(fresh.orders.map((order) => order.request)).toEqual(level.choice?.alternate);
    expect(validateState(fresh)).toBe(true);
  });
  it('keeps single-customer story orders on the only available tray for either variant', () => {
    for (const variant of [0, 1] as const) {
      const session = configureSession(
        createGame(`single-${variant}`, variant),
        'story',
        0,
        'pictures',
        ['juice'],
        2,
        1,
        undefined,
        'flavor',
        'c1-first-juice',
      );
      expect(session.mode).toBe('practice');
      expect(session.orders[0]?.seat).toBe(0);
      const twoRequests = configureSession(
        createGame(`queue-${variant}`, variant),
        'story',
        0,
        'pictures',
        ['juice'],
        2,
        1,
        undefined,
        'flavor',
        'c1-two-friends',
      );
      if (twoRequests.orders[0]) twoRequests.orders[0].status = 'done';
      const next = advance(twoRequests, 16);
      expect(next.orders[1]?.status).toBe('waiting');
      expect(next.orders[1]?.seat).toBe(0);
    }
  });
  it('allocates desktop, tablet, phone and short landscape within shared coordinates', () => {
    const cases = [
      [1440, 900, 'desktop'],
      [1024, 768, 'tablet'],
      [768, 1024, 'tablet'],
      [393, 665, 'phone'],
      [844, 390, 'short'],
    ] as const;
    for (const [width, height, form] of cases) {
      const layout = layoutFor(width, height);
      expect(layout.form).toBe(form);
      for (const point of [
        layout.machine,
        layout.helper,
        ...layout.guests,
        ...layout.trays,
        ...layout.supplies,
      ]) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(width);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(height);
      }
      if (form === 'tablet')
        expect(layout.trays[0].x).toBeGreaterThanOrEqual(layout.regions.trays.x);
    }
  });
});

describe('mini course content and deterministic answers', () => {
  it('has 30 explicit tasks sets plus mixed review, each with configured short length and real references', () => {
    expect(MINI_LEVELS).toHaveLength(31);
    expect(new Set(MINI_LEVELS.map((level) => level.id)).size).toBe(31);
    for (const level of MINI_LEVELS) {
      expect(level.targets.length).toBeGreaterThanOrEqual(4);
      expect(level.targets.length).toBeLessThanOrEqual(8);
      const state = createCourse(level, 'test');
      expect(validateCourse(state), level.id).toBe(true);
      for (const [round, target] of level.targets.entries()) {
        const kind = level.kind === 'review' ? level.taskKinds?.[round] : level.kind;
        if (kind === 'quantity' || kind === 'sentence')
          expect(REQUESTS[target as keyof typeof REQUESTS]).toBeDefined();
        else expect(wordById(target), `${level.id}:${target}`).toBeDefined();
      }
    }
  });
  it('reaches every authored ending through visible-answer rule submissions', () => {
    for (const level of MINI_LEVELS) {
      let state = startCourse(createCourse(level, `reach:${level.id}`));
      for (let round = 0; round < level.targets.length; round++) {
        state = playCourse(state);
        const kind = courseKind(level, state);
        const target = courseTarget(level, state);
        if (kind === 'spell' || kind === 'sentence') {
          const bank = tileBank(level, state);
          const wanted =
            kind === 'spell'
              ? [...(wordById(target)?.text.replaceAll(' ', '').toUpperCase() ?? '')]
              : [...bank]
                  .filter((tile) => Number(tile.id.split('-').at(-1)) < bank.length - 2)
                  .sort((a, b) => Number(a.id.split('-').at(-1)) - Number(b.id.split('-').at(-1)))
                  .map((tile) => tile.text);
          const unused = [...bank];
          for (const token of wanted) {
            const index = unused.findIndex((tile) => tile.text === token);
            expect(index, `${level.id}:${target}:${token}`).toBeGreaterThanOrEqual(0);
            const tile = unused.splice(index, 1)[0];
            if (tile) state = toggleTile(level, state, tile.id);
          }
          state = submitCourse(level, state);
        } else state = submitCourse(level, state, target);
        expect(state.phase, `${level.id}:${round}:${state.feedback}`).toBe('feedback');
        expect(validateCourse(state), level.id).toBe(true);
        state = nextCourse(level, state);
      }
      expect(state.phase, level.id).toBe('done');
      expect(validateCourse(state), level.id).toBe(true);
    }
  });
});
