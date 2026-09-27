import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAPTERS, type Support } from '../content/chapters';
import { levelsForChapter, STORY_LEVELS } from '../content/story-levels';
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
  enter: (chapter: number, replay?: boolean, levelId?: string) => void;
  home: () => void;
  support: Support;
  setSupport: (support: Support) => void;
  guests: 1 | 2;
  setGuests: (guests: 1 | 2) => void;
}) {
  const p = controller.profile.value;
  const [prologue, setPrologue] = useState(!p.prologue),
    [beat, setBeat] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState(() => {
    const next = CHAPTERS.findIndex((c) => !p.completed.includes(c.id));
    return next < 0 ? 4 : next;
  });
  const [, refreshChoices] = useState(0);
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
    '最后一页写着“社区小食会”，还没填完。大咪决定先开门认识大家。',
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
      <p>五章故事，每次帮一位朋友完成一件事。先看情境，再去柜台动手。</p>
      <SupportChoice value={support} change={setSupport} />
      {p.completed.includes(1) ? (
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
              onClick={() => setSelectedChapter(i)}
              aria-pressed={selectedChapter === i}
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
      <section className="story-levels" aria-label={`${CHAPTERS[selectedChapter]?.title}的小关`}>
        {levelsForChapter(selectedChapter).map((level, index, levels) => {
          const chapterUnlocked =
            selectedChapter === 0 || p.completed.includes(selectedChapter - 1);
          const unlocked =
            chapterUnlocked &&
            (index === 0 ||
              p.completedLevels.includes(levels[index - 1]?.id ?? '') ||
              p.completed.includes(selectedChapter));
          const completed = p.completedLevels.includes(level.id);
          const unfinished =
            controller.state.session.levelId === level.id &&
            controller.state.orders.some((order) => order.status !== 'done');
          const choice = p.storyChoices[level.id] ?? 0;
          return (
            <article key={level.id} className="story-level">
              <h3>
                {index + 1}. {level.title} {completed ? '✓' : ''}
              </h3>
              <p>
                <strong>{level.who}</strong> · {level.situation}
              </p>
              <p>{level.objective}</p>
              {completed ? (
                <p className="story-result">
                  {level.result}{' '}
                  {level.choice?.responses[p.resolvedStoryChoices[level.id] ?? choice]}
                </p>
              ) : null}
              {level.choice && unlocked ? (
                <fieldset className="story-choice">
                  <legend>{level.choice.prompt}</legend>
                  {level.choice.labels.map((label, option) => (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={choice === option}
                      onClick={() => {
                        controller.profile.chooseStory(level.id, option as 0 | 1);
                        refreshChoices((n) => n + 1);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </fieldset>
              ) : null}
              <button
                type="button"
                disabled={!unlocked}
                onClick={() => enter(level.chapter, completed && !unfinished, level.id)}
              >
                {unfinished
                  ? '继续这一关'
                  : completed
                    ? '重玩这一关'
                    : unlocked
                      ? '帮朋友完成这关'
                      : '先完成前一关'}
              </button>
            </article>
          );
        })}
      </section>
      {p.completedLevels.length === STORY_LEVELS.length ? (
        <p>小食会已经开场。可以重看故事、重玩小关，小游戏仍在小院。</p>
      ) : null}
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
