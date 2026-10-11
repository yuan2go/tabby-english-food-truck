import { describe, expect, it } from 'vitest';
import { FOODS } from '../src/content/foods';
import { MINI_LEVELS } from '../src/content/mini-levels';

describe('learning vocabulary is independent of supply', () => {
  it('exposes 120 unique meaningful concepts and preserves all 50 food mappings', async () => {
    const expansion = await import('../src/content/vocabulary').catch(() => ({ VOCABULARY: [] }));
    const words = expansion.VOCABULARY;
    expect(words).toHaveLength(120);
    expect(new Set(words.map((w) => w.text.toLowerCase())).size).toBe(120);
    expect(FOODS).toHaveLength(50);
    expect(FOODS.some((f) => f.id === 'cup')).toBe(false);
    expect(MINI_LEVELS.filter((l) => l.kind !== 'review')).toHaveLength(30);
  });
});
