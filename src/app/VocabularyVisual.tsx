import type { CSSProperties } from 'react';
import { VOCAB_COLORS, VOCAB_NUMBERS, vocabularyWord } from '../content/vocabulary';
import { assetUrl } from '../game/assets';
import { resourceUrl } from '../platform/build';
import './scene-games.css';
export const vocabularyImage = (image: string) => resourceUrl('assets', `${image}.webp`);
export function ObjectArt({
  word,
  className = '',
  color,
  size,
  state,
}: {
  word: string;
  className?: string;
  color?: string | undefined;
  size?: string | undefined;
  state?: string | undefined;
}) {
  const concept = vocabularyWord(word);
  if (!concept) return null;
  if (color && word === 'bowl')
    return (
      <svg
        className={`vocab-art ${className} size-${size ?? 'normal'}`}
        viewBox="0 0 220 220"
        role="img"
        aria-label={`${vocabularyWord(color)?.chinese ?? color}碗`}
      >
        <path
          d="M35 85Q40 165 110 163Q180 165 185 85Z"
          fill={VOCAB_COLORS[color] ?? color}
          stroke="#6f654f"
          strokeWidth="3.5"
        />
        <ellipse
          cx="110"
          cy="85"
          rx="75"
          ry="18"
          fill="#f4e7cd"
          stroke="#6f654f"
          strokeWidth="3.5"
        />
      </svg>
    );
  if (color && word === 'cup')
    return (
      <svg
        className={`vocab-art ${className} size-${size ?? 'normal'}`}
        viewBox="0 0 220 220"
        role="img"
        aria-label={`${vocabularyWord(color)?.chinese ?? color}杯子`}
      >
        <path
          d="M54 55H143L135 163Q97 183 62 163Z"
          fill={VOCAB_COLORS[color] ?? color}
          stroke="#6f654f"
          strokeWidth="5"
        />
        <path
          d="M145 76Q193 70 184 112Q174 141 140 135"
          fill="none"
          stroke="#6f654f"
          strokeWidth="10"
        />
        <ellipse cx="98" cy="57" rx="43" ry="9" fill="#f7e9cf" />
      </svg>
    );
  return (
    <span
      className={`object-artwork state-${state ?? 'whole'} size-${size ?? 'normal'} ${className}`}
    >
      <img
        className="vocab-art"
        src={vocabularyImage(concept.image)}
        alt={concept.chinese}
        draggable={false}
      />
      {state === 'filled' || state === 'stirred' ? (
        <span className="object-water" aria-hidden="true" />
      ) : null}
      {state === 'open' ? <span className="object-open" aria-hidden="true" /> : null}
      {state === 'clean' ? <span className="object-shine" aria-hidden="true" /> : null}
      {state === 'cut' ? <span className="object-cut" aria-hidden="true" /> : null}
    </span>
  );
}
function MeaningScene({ word }: { word: string }) {
  const action = vocabularyWord(word)?.group === 'action';
  const item =
    word === 'wash'
      ? 'bowl'
      : word === 'cut' || word === 'share'
        ? 'apple'
        : word === 'take' || word === 'put'
          ? 'ball'
          : word === 'carry'
            ? 'basket'
            : word === 'pour' || word === 'stir'
              ? 'cup'
              : 'box';
  return (
    <span
      className={`meaning-scene meaning-${word}`}
      role="img"
      aria-label={vocabularyWord(word)?.context}
    >
      <span className="meaning-table">
        <ObjectArt word={word === 'in' ? 'basket' : 'table'} />
      </span>
      {action ? (
        <img
          className="meaning-cat"
          src={assetUrl(word === 'carry' ? 'cat-carry' : 'cat-idle')}
          alt="大咪演示"
          draggable={false}
        />
      ) : null}
      <span className="meaning-object">
        <ObjectArt word={action ? item : 'ball'} />
      </span>
      {word === 'pour' ? (
        <span className="meaning-tool">
          <ObjectArt word="jug" />
        </span>
      ) : null}
      {word === 'stir' ? (
        <span className="meaning-tool">
          <ObjectArt word="spoon" />
        </span>
      ) : null}
      {word === 'cut' ? (
        <span className="meaning-tool">
          <ObjectArt word="knife" />
        </span>
      ) : null}
      {word === 'share' ? (
        <img className="meaning-friend" src={assetUrl('guest-0-2')} alt="朋友接过分享" />
      ) : null}
      {word === 'wash' ? <span className="meaning-water" aria-hidden="true" /> : null}
      {word === 'pour' ? <span className="meaning-stream" aria-hidden="true" /> : null}
      {word === 'open' || word === 'close' ? (
        <span className="meaning-lid" aria-hidden="true" />
      ) : null}
    </span>
  );
}
export function VocabularyVisual({ id }: { id: string }) {
  const word = vocabularyWord(id);
  if (!word) return null;
  if (word.group === 'action' || word.group === 'position') return <MeaningScene word={id} />;
  if (word.group === 'number')
    return (
      <span className="meaning-number" role="img" aria-label={`${word.chinese}个杯子`}>
        {['cup-a', 'cup-b', 'cup-c', 'cup-d', 'cup-e']
          .slice(0, VOCAB_NUMBERS[id] ?? 1)
          .map((key) => (
            <ObjectArt key={key} word="cup" />
          ))}
      </span>
    );
  if (word.group === 'attribute')
    return (
      <span
        className={`meaning-attribute attribute-${id}`}
        style={{ '--vocab-color': VOCAB_COLORS[id] } as CSSProperties}
      >
        <ObjectArt
          word={
            id === 'round'
              ? 'plate'
              : id === 'soft'
                ? 'napkin'
                : id === 'big' || id === 'small'
                  ? 'bowl'
                  : 'cup'
          }
          color={id in VOCAB_COLORS ? id : undefined}
          size={id === 'big' || id === 'small' ? id : undefined}
        />
        {id === 'big' || id === 'small' ? (
          <span className="meaning-comparison">
            <ObjectArt word="bowl" size={id === 'big' ? 'small' : 'big'} />
          </span>
        ) : null}
      </span>
    );
  return <ObjectArt word={id} />;
}
export function VoiceIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 9H7L12 5V19L7 15H3Z" fill="currentColor" />
      <path
        d="M16 8Q21 12 16 16M18 4Q27 12 18 20"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
