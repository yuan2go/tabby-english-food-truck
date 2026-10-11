import { useState } from 'react';
import { ITEM_AUDIO } from '../content/learning';
import type { Product } from '../content/recipes';
import { vocabularyWord } from '../content/vocabulary';
import type { ForegroundAudio } from '../platform/audio';
import { Food } from './Food';
import { VocabularyVisual, VoiceIcon } from './VocabularyVisual';
import './food-compare.css';

type Contrast = {
  label: string;
  sides: {
    label: string;
    foods?: { id: string; product: Product }[];
    word?: string;
    audio?: string;
  }[];
};
const contrasts: Contrast[] = [
  {
    label: '汉堡',
    sides: [
      { label: '普通汉堡', foods: [{ id: 'plain', product: 'burger' }] },
      { label: '多了芝士', foods: [{ id: 'cheese', product: 'cheese-burger' }] },
    ],
  },
  {
    label: '杯和筒',
    sides: [
      { label: '装在杯里', foods: [{ id: 'cup', product: 'vanilla-cup' }] },
      { label: '装在蛋筒里', foods: [{ id: 'cone', product: 'vanilla-cone' }] },
    ],
  },
  {
    label: '一份和两份',
    sides: [
      { label: '一份', foods: [{ id: 'single', product: 'apple' }], audio: 'name-one' },
      {
        label: '两份',
        foods: [
          { id: 'first', product: 'apple' },
          { id: 'second', product: 'apple' },
        ],
        audio: 'name-two',
      },
    ],
  },
  {
    label: '两种壶',
    sides: [
      { label: '倒水的壶', word: 'kettle' },
      { label: '浇花的壶', word: 'watering-can' },
    ],
  },
];
/** Both alternatives are always shown. Opening this reference records support at its caller. */
export function FoodCompare({ audio }: { audio: ForegroundAudio }) {
  const [index, setIndex] = useState(0);
  const contrast = contrasts[index] ?? contrasts[0];
  return (
    <section className="food-compare" aria-label="食物和份数图音对比">
      <fieldset className="contrast-tabs" aria-label="选择对比">
        {contrasts.map((c, i) => (
          <button
            type="button"
            key={c.label}
            aria-pressed={index === i}
            onClick={() => {
              audio.stop();
              setIndex(i);
            }}
          >
            {c.label}
          </button>
        ))}
      </fieldset>
      <div className="contrast-pair">
        {contrast?.sides.map((side) => (
          <button
            type="button"
            key={side.label}
            aria-label={`听${side.label}`}
            onClick={() => {
              const id =
                side.audio ??
                (side.word
                  ? vocabularyWord(side.word)?.audio
                  : side.foods?.[0]
                    ? ITEM_AUDIO[side.foods[0].product]
                    : undefined);
              if (id) void audio.play(id);
            }}
          >
            <span className="contrast-foods">
              {side.word ? (
                <VocabularyVisual id={side.word} />
              ) : (
                side.foods?.map((food) => <Food key={food.id} product={food.product} />)
              )}
            </span>
            <span>{side.label}</span>
            <VoiceIcon />
          </button>
        ))}
      </div>
      <p>两边都可以认识；听朋友的需要，再自己决定做哪一份。</p>
    </section>
  );
}
