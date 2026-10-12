import { describe, expect, it } from 'vitest';
import { togetherLayout } from '../src/game/together-layout';

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
