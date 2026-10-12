import type { AdventureState, Visitor } from './adventure';
import type { RequestId } from './catalog';
export interface StoryWave {
  title: string;
  guests: readonly { request: RequestId; visitor: Visitor }[];
  together: boolean;
}
export type ChapterMemory = Omit<AdventureState, 'flow'> & {
  contract: 'continuous-gameplay-1' | 'legacy-adventure';
};
export interface StoryFlow {
  version: 1;
  wave: number;
  phase: 'service' | 'reward' | 'complete' | 'explore';
  until: number;
  legacy: boolean;
  legacyChapter?: number;
  completion?: ChapterMemory;
  archives: ChapterMemory[];
}
export const WAVE_GAP_MS = 650;
export const REWARD_MS = 1800;
export const TASTE_MS = 650;
export const STORY_WAVES: readonly (readonly StoryWave[])[] = [
  [
    {
      title: '一份早餐',
      together: false,
      guests: [
        { request: 'apple', visitor: 'rabbit' },
        { request: 'banana', visitor: 'hedgehog' },
      ],
    },
    {
      title: '一起分享',
      together: false,
      guests: [
        { request: 'two', visitor: 'rabbit' },
        { request: 'fruit', visitor: 'hedgehog' },
      ],
    },
  ],
  [
    {
      title: '杯子和蛋筒',
      together: false,
      guests: [
        { request: 'vanilla-cone', visitor: 'rabbit' },
        { request: 'strawberry-cup', visitor: 'hedgehog' },
      ],
    },
    {
      title: '双球与配料',
      together: true,
      guests: [
        { request: 'double-cream', visitor: 'rabbit' },
        { request: 'banana-cream', visitor: 'hedgehog' },
      ],
    },
    { title: '选一个清凉口味', together: false, guests: [] },
  ],
  [
    {
      title: '你先帮谁？',
      together: true,
      guests: [
        { request: 'sandwich', visitor: 'rabbit' },
        { request: 'salad-sandwich', visitor: 'hedgehog' },
      ],
    },
  ],
  [
    {
      title: '煎锅和果汁',
      together: true,
      guests: [
        { request: 'cheese-burger', visitor: 'rabbit' },
        { request: 'juice', visitor: 'hedgehog' },
      ],
    },
    {
      title: '交错准备',
      together: true,
      guests: [
        { request: 'burger', visitor: 'rabbit' },
        { request: 'banana-juice', visitor: 'hedgehog' },
      ],
    },
  ],
  [{ title: '为老朋友创作', together: true, guests: [] }],
];
export const flowOrders = (a: AdventureState) =>
  STORY_WAVES[a.chapter]?.flatMap((w) => w.guests) ?? [];
export function waveIndices(a: AdventureState): number[] {
  const f = a.flow;
  if (!f) return [];
  if (f.legacy) return a.chapter === 1 ? [0] : a.chapter === 4 ? [] : [0, 1];
  const waves = STORY_WAVES[a.chapter] ?? [];
  const first = waves.slice(0, f.wave).reduce((n, w) => n + w.guests.length, 0);
  return (waves[f.wave]?.guests ?? []).map((_, i) => first + i);
}
