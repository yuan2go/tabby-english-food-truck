import { useState } from 'react';
import { CHAPTERS, type Support } from '../content/chapters';
import { assetUrl } from '../game/assets';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import { Food } from './Food';
import { SupportChoice } from './SupportChoice';
export function Story({
  controller,
  audio,
  enter,
  home,
  support,
  setSupport,
}: {
  controller: GameController;
  audio: ForegroundAudio;
  enter: (chapter: number, replay?: boolean) => void;
  home: () => void;
  support: Support;
  setSupport: (support: Support) => void;
}) {
  const p = controller.profile.value;
  const [prologue, setPrologue] = useState(!p.prologue),
    [beat, setBeat] = useState(0);
  const lines = [
    '这把钥匙，交给你啦。',
    '旧食谱里，装着老朋友的味道。',
    '用食物和英语，和大家说你好吧。',
  ];
  if (prologue)
    return (
      <section
        className="story-stage"
        style={{ backgroundImage: `url(${assetUrl('courtyard')})` }}
        aria-label="长辈交接序章"
      >
        <button
          className="corner-back"
          type="button"
          onClick={() => {
            p.prologue = true;
            controller.profile.save();
            setPrologue(false);
            audio.stop();
          }}
        >
          跳过序章
        </button>
        <img className={`elder beat-${beat}`} src={assetUrl('elder')} alt="长辈交出钥匙和旧食谱" />
        <img
          className={`heir beat-${beat}`}
          src={assetUrl(beat === 2 ? 'cat-celebrate' : 'cat-reach')}
          alt="小猫接过餐车"
        />
        <div className="story-line">
          <p>{lines[beat]}</p>
          <button
            type="button"
            aria-label="重听故事"
            onClick={() => void audio.play(`prologue-${beat}`)}
          >
            ♫
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => {
              if (beat < 2) {
                setBeat(beat + 1);
                void audio.play(`prologue-${beat + 1}`);
              } else {
                p.prologue = true;
                controller.profile.save();
                setPrologue(false);
                enter(0);
              }
            }}
          >
            {beat < 2 ? '接着听' : '拿起食谱，开店啦'}
          </button>
        </div>
      </section>
    );
  return (
    <section className="recipe-book" aria-label="故事食谱">
      <button className="corner-back" type="button" onClick={home}>
        ← 小院
      </button>
      <h2>长辈的旧食谱</h2>
      <p>每一页，都有新朋友。</p>
      <SupportChoice value={support} change={setSupport} />
      <div className="chapter-pages">
        {CHAPTERS.map((c, i) => {
          const unlocked = i === 0 || p.completed.includes(i - 1);
          return (
            <button
              type="button"
              key={c.id}
              disabled={!unlocked}
              onClick={() => {
                void audio.play(c.audio);
                enter(i);
              }}
              aria-label={`${c.title}${unlocked ? '' : '，还没翻到这一页'}`}
            >
              <Food
                product={
                  (['juice', 'vanilla-cone', 'sandwich', 'burger', 'apple'] as const)[i] ?? 'apple'
                }
              />
              <span>{c.title}</span>
              <small>
                {p.completed.includes(i)
                  ? `✓ ${c.gift}`
                  : unlocked
                    ? c.subtitle
                    : '前一页的故事结束后翻开'}
              </small>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => {
          setBeat(0);
          setPrologue(true);
          void audio.play('prologue-0');
        }}
      >
        重看钥匙交接
      </button>
    </section>
  );
}
