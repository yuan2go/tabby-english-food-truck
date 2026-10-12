import { describe, expect, it } from 'vitest';
import { togetherDamiRect, togetherLayout } from '../src/game/together-layout';
import { createGame, dispatch } from '../src/rules/game';

describe('one physical stage on representative devices', () => {
  for (const [width, height] of [
    [393, 665],
    [1280, 720],
    [665, 393],
  ] as const) {
    it(`keeps core targets inside ${width} by ${height} without scrolling`, () => {
      const l = togetherLayout(width, height, 2);
      for (const r of [...l.seats, l.preparation, l.supplies, l.pause]) {
        expect(r.width).toBeGreaterThanOrEqual(48);
        expect(r.height).toBeGreaterThanOrEqual(48);
        expect(r.x).toBeGreaterThanOrEqual(0);
        expect(r.y).toBeGreaterThanOrEqual(0);
        expect(r.x + r.width).toBeLessThanOrEqual(width);
        expect(r.y + r.height).toBeLessThanOrEqual(height);
      }
      expect(l.guests).toHaveLength(2);
      expect(l.guests[0]?.height).toBeGreaterThan(90);
      expect(
        l.preparation.x + l.preparation.width <= l.dami.x + 30 ||
          l.dami.x + l.dami.width <= l.preparation.x + 30,
      ).toBe(true);
    });
  }
});
it('projects to the named visitor even when the rule admits that visitor into seat1', () => {
  let s = createGame('identity-target', 0, {}, 'service');
  s = dispatch(s, {
    id: 'chapter',
    runId: s.runId,
    command: { type: 'adventure-start', chapter: 0 },
  }).state;
  const rabbit = s.orders.find((o) => o.visitor === 'rabbit');
  if (!rabbit) throw Error('rabbit');
  rabbit.seat = 1;
  s = dispatch(s, {
    id: 'take',
    runId: s.runId,
    command: { type: 'pickup', source: { supply: 'apple' } },
  }).state;
  s = dispatch(s, {
    id: 'offer',
    runId: s.runId,
    command: { type: 'put', target: { order: rabbit.id } },
  }).state;
  const job = s.actor.current;
  if (!job) throw Error('delivery');
  job.elapsed = 0;
  for (const phase of job.plan.phases) {
    job.elapsed += phase.duration;
    if (phase.event === 'receive') break;
  }
  const l = togetherLayout(393, 665);
  expect(togetherDamiRect(s, l).x).toBeCloseTo(l.dami.x + ((l.seats[0]?.x ?? 0) - l.dami.x) * 0.72);
});
