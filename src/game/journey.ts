import { levelsForChapter, STORY_LEVELS, storyLevel } from '../content/story-levels';
import type { GameState } from '../rules/types';
export const CHAPTER_GOALS = [
  '把小花放上窗台',
  '一起挂好彩旗',
  '铺好野餐桌布',
  '点亮小院灯串',
  '写完小食会食谱',
] as const;
/** Projection of completed pages and rule-clock receipts; never changes progress. */
export function chapterJourney(s: GameState, completedLevels: readonly string[]) {
  const level = storyLevel(s.session.levelId);
  const ids = new Set(completedLevels);
  const received = s.orders.filter((order) => {
    if (order.status === 'done') return true;
    if (order.status !== 'leaving') return false;
    const job = [s.actor.current, ...s.actor.queue].find(
      (job) => job?.kind === 'delivery' && job.order === order.id,
    );
    return job?.itemIds.length === 0;
  }).length;
  if (level && received === s.orders.length) ids.add(level.id);
  const completed = levelsForChapter(s.session.chapter).filter((page) => ids.has(page.id)).length;
  const fraction = completed + (level && !ids.has(level.id) ? received / s.orders.length : 0);
  return {
    goal: CHAPTER_GOALS[s.session.chapter] ?? CHAPTER_GOALS[0],
    completed,
    received,
    fraction,
  };
}
export function continueLevel(s: GameState, completedLevels: readonly string[]) {
  const current = s.session.activity === 'story' ? storyLevel(s.session.levelId) : undefined;
  if (current && s.orders.some((o) => o.status !== 'done')) return current;
  const next =
    STORY_LEVELS.find((level) => !completedLevels.includes(level.id)) ?? STORY_LEVELS.at(-1);
  if (!next) throw Error('Story requires at least one page');
  return next;
}
