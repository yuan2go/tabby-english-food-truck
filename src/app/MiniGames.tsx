import { useEffect, useRef, useState } from 'react';
import type { ForegroundAudio } from '../platform/audio';
import type { GameController } from '../platform/controller';
import {
  beginRound,
  createMini,
  type Difficulty,
  letters,
  type MatchMode,
  type MiniState,
  nextRound,
  options,
  playRound,
  submitMini,
  targetWord,
  validateMini,
} from '../rules/minigames';
import { Food } from './Food';

const KEY = 'tabby.foodtruck.minigame.m2';
export function MiniGames({
  controller,
  audio,
  home,
}: {
  controller: GameController;
  audio: ForegroundAudio;
  home: () => void;
}) {
  const [loaded] = useState((): { value: MiniState | null; blocked: boolean } => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(KEY);
      if (raw) {
        const value: unknown = JSON.parse(raw);
        if (validateMini(value)) return { value, blocked: false };
        return { value: null, blocked: true };
      }
    } catch {
      return { value: null, blocked: raw !== null };
    }
    return { value: null, blocked: false };
  });
  const [state, setState] = useState<MiniState | null>(loaded.value);
  const [difficulty, setDifficulty] = useState<Difficulty>('demo'),
    [mode, setMode] = useState<MatchMode>('listen');
  const [issue, setIssue] = useState(
    loaded.blocked ? '原小游戏存档未通过校验，已保护原文。本次可临时玩；设置导出包含原档。' : '',
  );
  const gesture = useRef<{
    id: string;
    pointer: number;
    x: number;
    y: number;
    fromDraft: boolean;
  } | null>(null);
  const ignore = useRef(false);
  const ghost = useRef<HTMLDivElement>(null);
  const update = (next: MiniState) => {
    setState(next);
    if (loaded.blocked) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      setIssue('本轮暂存在内存，离开前可在设置中导出。');
    }
  };
  useEffect(() => {
    if (!state) return;
    for (const [index, a] of state.attempts.entries())
      controller.profile.observe({
        id: `mini-${state.seed}-${state.kind}-${index}`,
        dimension:
          state.kind === 'spell' ? 'spelling' : state.mode === 'listen' ? 'listening' : 'meaning',
        target: a.target,
        result: a.result ? 'completed' : 'adjust',
        support: a.support,
        visit: controller.profile.value.exposure.includes(a.target) ? 'revisit' : 'first',
        audioQualified: false,
      });
  }, [state, controller]);
  useEffect(() => {
    const cancel = () => {
      gesture.current = null;
      if (ghost.current) ghost.current.style.display = 'none';
      ignore.current = true;
    };
    const other = (e: PointerEvent) => {
      if (gesture.current && gesture.current.pointer !== e.pointerId) cancel();
    };
    document.addEventListener('pointerdown', other, true);
    document.addEventListener('visibilitychange', cancel);
    window.addEventListener('resize', cancel);
    window.addEventListener('blur', cancel);
    return () => {
      document.removeEventListener('pointerdown', other, true);
      document.removeEventListener('visibilitychange', cancel);
      window.removeEventListener('resize', cancel);
      window.removeEventListener('blur', cancel);
    };
  }, []);
  const exit = () => {
    audio.stop();
    home();
  };
  if (!state)
    return (
      <section className="mini-lobby" aria-label="游戏小摊">
        <button type="button" className="corner-back" onClick={exit}>
          ← 小院
        </button>
        <h2>食物朋友的小摊</h2>
        {issue ? <p role="status">{issue}</p> : null}
        <p>听一听，找朋友；动动手，拼食物。</p>
        <div className="mini-choices">
          <button
            type="button"
            onClick={() => {
              update(createMini('match', difficulty, Date.now() >>> 0, mode));
              void audio.play('mini-match');
            }}
          >
            <Food product="apple" />
            <strong>食物找朋友</strong>
            <span>点两项，连成一对</span>
          </button>
          <button
            type="button"
            onClick={() => {
              update(createMini('spell', difficulty, Date.now() >>> 0));
              void audio.play('mini-spell');
            }}
          >
            <span className="letter-sign">A B C</span>
            <strong>WordSpell 拼食物</strong>
            <span>听发音，摆字母</span>
          </button>
        </div>
        <fieldset className="choice-row">
          <legend>需要怎样的帮助？</legend>
          {(['demo', 'partial', 'independent'] as const).map((d, i) => (
            <button
              type="button"
              key={d}
              aria-pressed={difficulty === d}
              onClick={() => setDifficulty(d)}
            >
              {['先看示范', '帮一部分', '我自己试'][i]}
            </button>
          ))}
        </fieldset>
        <fieldset className="choice-row">
          <legend>找朋友怎么玩？</legend>
          {(['listen', 'word-picture', 'bilingual'] as const).map((m, i) => (
            <button type="button" key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>
              {['听词找图', '英文配图片', '中英配对（识字后）'][i]}
            </button>
          ))}
        </fieldset>
      </section>
    );
  const word = targetWord(state);
  const say = () => void audio.play(word.audio);
  const selectLetter = (id: string) => {
    if (!state.draft.includes(id)) update({ ...state, draft: [...state.draft, id], feedback: '' });
  };
  const remove = (id: string) => {
    if (!state.fixed.includes(id)) update({ ...state, draft: state.draft.filter((x) => x !== id) });
  };
  const bindLetter = (id: string, fromDraft: boolean) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (gesture.current || !e.isPrimary) {
        gesture.current = null;
        ignore.current = true;
        return;
      }
      ignore.current = false;
      gesture.current = { id, pointer: e.pointerId, x: e.clientX, y: e.clientY, fromDraft };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => {
      const g = gesture.current;
      if (
        !g ||
        g.pointer !== e.pointerId ||
        Math.hypot(e.clientX - g.x, e.clientY - g.y) < 8 ||
        !ghost.current
      )
        return;
      ghost.current.textContent = letters(state).find((l) => l.id === id)?.text ?? '';
      ghost.current.style.display = 'grid';
      ghost.current.style.transform = `translate(${e.clientX - 25}px,${e.clientY - 30}px)`;
    },
    onPointerCancel: () => {
      gesture.current = null;
      ignore.current = true;
      if (ghost.current) ghost.current.style.display = 'none';
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      const g = gesture.current;
      gesture.current = null;
      if (ghost.current) ghost.current.style.display = 'none';
      if (!g || g.pointer !== e.pointerId) return;
      if (e.currentTarget.hasPointerCapture(e.pointerId))
        e.currentTarget.releasePointerCapture(e.pointerId);
      if (Math.hypot(e.clientX - g.x, e.clientY - g.y) > 8) {
        ignore.current = true;
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!g.fromDraft && target?.closest('[data-letter-drop]')) selectLetter(g.id);
        if (g.fromDraft && target?.closest('.letter-bank')) remove(g.id);
      }
    },
    onClick: () => {
      if (ignore.current) {
        ignore.current = false;
        return;
      }
      if (fromDraft) remove(id);
      else selectLetter(id);
    },
  });
  const submit = (answer?: string) => {
    const next = submitMini(state, answer);
    update(next);
    audio.effect(next.correct ? 'success' : 'gentle');
    if (next.correct) say();
  };
  return (
    <section
      className={`mini-play mini-${state.kind}`}
      aria-label={state.kind === 'match' ? '食物找朋友' : 'WordSpell拼食物'}
    >
      <button className="corner-back" type="button" onClick={exit}>
        ← 小院
      </button>
      <div className="mini-progress">
        {state.kind === 'match' ? '食物找朋友' : 'WordSpell'} · {state.round + 1} / 4
      </div>
      {state.stage === 'intro' ? (
        <div className="mini-intro">
          <Food product="apple" />
          <h2>{state.kind === 'match' ? '给食物找朋友' : '把声音变成字母'}</h2>
          <p>
            {state.kind === 'match'
              ? '点喇叭听一听，再点一张图片。英文配图和中英配对，也只要点两项。'
              : '先看食物，听发音。点大字母放进空位，点已放字母可撤回。拼好后告诉小猫。'}
          </p>
          <button
            type="button"
            className="primary"
            onClick={() => {
              update(beginRound(state));
              say();
            }}
          >
            开始玩
          </button>
        </div>
      ) : state.stage === 'done' ? (
        <div className="mini-ending">
          <img src="/assets/cat-celebrate.webp" alt="小猫庆祝" />
          <h2>四份心意，都找到了！</h2>
          <p>今天遇见：{state.words.join(' · ')}。可以回餐车用一用。</p>
          <button
            type="button"
            className="primary"
            onClick={() =>
              update(createMini(state.kind, state.difficulty, (state.seed + 1) >>> 0, state.mode))
            }
          >
            再玩一组
          </button>
          <button
            type="button"
            onClick={() => {
              setState(null);
              try {
                if (!loaded.blocked) localStorage.removeItem(KEY);
              } catch {}
            }}
          >
            回游戏小摊
          </button>
        </div>
      ) : state.stage === 'meaning' ? (
        <div className="meaning-stage">
          {state.kind === 'match' && state.difficulty === 'independent' ? (
            <div className="all-food-intro">
              {options(state).map((w) => (
                <Food key={w.id} product={w.image} />
              ))}
            </div>
          ) : (
            <Food product={word.image} />
          )}
          <h2>{state.difficulty === 'independent' ? '听听这位食物朋友的名字' : word.text}</h2>
          <button type="button" onClick={say}>
            ♫ 听发音
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => {
              update(playRound(state));
              say();
            }}
          >
            我来找 / 拼
          </button>
        </div>
      ) : (
        <>
          <div className="mini-prompt">
            {state.kind === 'spell' ? <Food product={word.image} /> : null}
            <button
              type="button"
              className="sound-tile"
              aria-pressed={state.selected === 'target'}
              onClick={() => {
                say();
                update({ ...state, selected: 'target' });
              }}
            >
              {state.kind === 'match' && state.mode === 'word-picture'
                ? word.text
                : state.kind === 'match' && state.mode === 'bilingual'
                  ? word.chinese
                  : '♫ 听一听'}
            </button>
          </div>
          {state.kind === 'match' ? (
            <div className="matching-pictures">
              {options(state)
                .filter(
                  (w, i, list) =>
                    state.difficulty !== 'partial' ||
                    w.id === word.id ||
                    i !== list.findIndex((x) => x.id !== word.id),
                )
                .map((w) => (
                  <button
                    type="button"
                    key={w.id}
                    aria-label={state.mode === 'bilingual' ? w.text : w.chinese}
                    disabled={state.stage === 'feedback'}
                    onClick={() => {
                      if (state.selected !== 'target') {
                        update({ ...state, feedback: '先点上面的词或喇叭，再选朋友。' });
                        return;
                      }
                      submit(w.id);
                    }}
                  >
                    {state.mode === 'bilingual' ? (
                      <strong>{w.text}</strong>
                    ) : (
                      <Food product={w.image} />
                    )}
                  </button>
                ))}
            </div>
          ) : (
            <div className="spelling-table">
              {state.difficulty === 'demo' || state.support.includes('answer-help') ? (
                <p className="spell-model">{word.text.toUpperCase()}</p>
              ) : null}
              <div className="letter-draft" data-letter-drop="true">
                {[...letters(state)]
                  .sort((a, b) => a.id.localeCompare(b.id))
                  .map((slot, i) => {
                    const id = state.draft[i];
                    return (
                      <button
                        type="button"
                        key={`slot-${slot.id}`}
                        aria-label={`字母位置${i + 1}${id ? ` ${letters(state).find((l) => l.id === id)?.text}` : ''}`}
                        disabled={!id || state.fixed.includes(id)}
                        {...(id ? bindLetter(id, true) : {})}
                      >
                        {id ? letters(state).find((l) => l.id === id)?.text : '·'}
                      </button>
                    );
                  })}
              </div>
              <div className="letter-bank">
                {letters(state).map((l) => (
                  <button
                    type="button"
                    key={l.id}
                    aria-label={`字母 ${l.text} ${l.id}`}
                    disabled={state.draft.includes(l.id) || state.stage === 'feedback'}
                    {...bindLetter(l.id, false)}
                  >
                    {l.text}
                  </button>
                ))}
              </div>
              {state.stage === 'play' ? (
                <button type="button" className="primary" onClick={() => submit()}>
                  拼好了
                </button>
              ) : null}
            </div>
          )}
          {state.kind === 'match' && state.support.includes('answer-help') ? (
            <div className="answer-help">
              <Food product={word.image} />
              <span>{word.text}</span>
            </div>
          ) : null}
          <div className="letter-ghost" ref={ghost} aria-hidden="true" />
          <p role="status" className="mini-feedback">
            {state.feedback}
          </p>
          {state.stage === 'feedback' ? (
            <button
              type="button"
              className="primary"
              onClick={() => {
                const next = nextRound(state);
                update(next);
                if (next.stage !== 'done') void audio.play(targetWord(next).audio);
              }}
            >
              下一位朋友
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                update({
                  ...state,
                  support: [...new Set([...state.support, 'answer-help'])],
                  feedback:
                    state.kind === 'match'
                      ? `看看${word.chinese}，听听 ${word.text}。`
                      : '一起看看字母，接着试。',
                });
                say();
              }}
            >
              小猫帮帮我
            </button>
          )}
        </>
      )}
      <p className="development-note">{issue || '开发语音未听审 · 没有计时与能力评分'}</p>
    </section>
  );
}
