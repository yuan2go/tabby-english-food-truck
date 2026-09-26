import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAPTERS, type Support } from '../content/chapters';
import { assetUrl } from '../game/assets';
import type { ForegroundAudio, PlaybackResult } from '../platform/audio';
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
  guests,
  setGuests,
}: {
  controller: GameController;
  audio: ForegroundAudio;
  enter: (chapter: number, replay?: boolean) => void;
  home: () => void;
  support: Support;
  setSupport: (support: Support) => void;
  guests: 1 | 2;
  setGuests: (guests: 1 | 2) => void;
}) {
  const p = controller.profile.value;
  const [prologue, setPrologue] = useState(!p.prologue),
    [beat, setBeat] = useState(0);
  const [voiceResult, setVoiceResult] = useState<PlaybackResult | null>(null);
  const voiceToken = useRef(0);
  const replay = useCallback(() => {
    const token = ++voiceToken.current;
    setVoiceResult(null);
    void audio.play(`prologue-${beat}`).then((result) => {
      if (token === voiceToken.current) setVoiceResult(result);
    });
  }, [audio, beat]);
  const lines = [
    '大咪，这把钥匙，交给你啦。',
    '旧食谱里，装着老朋友的味道。',
    '用食物和英语，和大家说你好吧。',
  ];
  useEffect(() => {
    if (prologue) replay();
    return () => {
      voiceToken.current++;
      audio.stop();
    };
  }, [audio, prologue, replay]);
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
            audio.skip();
          }}
        >
          跳过序章
        </button>
        <img className={`elder beat-${beat}`} src={assetUrl('elder')} alt="长辈交出钥匙和旧食谱" />
        <img
          className={`heir beat-${beat}`}
          src={assetUrl(beat === 2 ? 'cat-celebrate' : 'cat-reach')}
          alt="大咪接过餐车"
        />
        <div className="story-line">
          <p>{lines[beat]}</p>
          <button type="button" aria-label="重听故事" onClick={replay}>
            ♫
          </button>
          {voiceResult === 'failed' || voiceResult === 'muted' || voiceResult === 'interrupted' ? (
            <span role="status">声音没播完整。点 ♫ 重试，或看图接着走。</span>
          ) : null}
          <button
            type="button"
            className="primary"
            onClick={() => {
              if (beat < 2) {
                setBeat(beat + 1);
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
      {p.completed.includes(2) ? (
        <fieldset className="story-guests">
          <legend>后面的营业想招呼几位朋友？</legend>
          <button type="button" aria-pressed={guests === 1} onClick={() => setGuests(1)}>
            👤 一位一位来
          </button>
          <button type="button" aria-pressed={guests === 2} onClick={() => setGuests(2)}>
            👥 两位一起，自己决定先做哪份
          </button>
        </fieldset>
      ) : null}
      <div className="chapter-pages">
        {CHAPTERS.map((c, i) => {
          const unlocked = i === 0 || p.completed.includes(i - 1);
          return (
            <button
              type="button"
              key={c.id}
              disabled={!unlocked}
              onClick={() => {
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
        }}
      >
        重看钥匙交接
      </button>
    </section>
  );
}
