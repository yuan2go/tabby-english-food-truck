import { expect, it } from 'vitest';
import { ActorScheduler, buildPlan, samplePlan } from '../src/game/actor';
import { DoubleTap } from '../src/game/gestures';

it('teaching exit and overlapping delivery continue from actual position with bounded speed', () => {
  const actor = new ActorScheduler({ x: 0.75, y: 0.45 });
  actor.schedule('lesson', [{ point: { x: 0.25, y: 0.7 }, pose: 'reach', hold: 300 }]);
  actor.advance(470);
  const before = actor.frame.point;
  actor.schedule('delivery', [{ point: { x: 0.3, y: 0.3 }, pose: 'place', hold: 300 }], true);
  expect(actor.frame.point).toEqual(before);
  actor.advance(16);
  expect(Math.hypot(actor.frame.point.x - before.x, actor.frame.point.y - before.y)).toBeLessThan(
    0.02,
  );
  actor.advance(0);
  expect(actor.frame.point).toEqual(actor.frame.point);
});
it('plan duration is distance based and serial phases survive JSON roundtrip', () => {
  const a = buildPlan('a', { x: 0.7, y: 0.4 }, [
    { point: { x: 0.2, y: 0.7 }, pose: 'reach', hold: 260 },
    { point: { x: 0.5, y: 0.65 }, pose: 'place', hold: 340 },
  ]);
  expect(a.duration).toBeGreaterThan(2000);
  const frame = samplePlan(a, 800);
  expect(samplePlan(JSON.parse(JSON.stringify(a)), 800)).toEqual(frame);
  const scheduler = new ActorScheduler(frame.point);
  scheduler.schedule('next', [{ point: { x: 0.8, y: 0.4 }, pose: 'idle', hold: 0 }]);
  expect(scheduler.frame.point).toEqual(frame.point);
});
it('double tap belongs to same entity and is cancelled by drag, other pointer or cancellation', () => {
  const gesture = new DoubleTap();
  expect(gesture.tap('food-1', 100)).toBe(false);
  expect(gesture.tap('food-2', 200)).toBe(false);
  expect(gesture.tap('food-2', 300)).toBe(true);
  gesture.tap('food-1', 400);
  gesture.cancel();
  expect(gesture.tap('food-1', 450)).toBe(false);
  expect(gesture.tap('food-1', 1001)).toBe(false);
});
