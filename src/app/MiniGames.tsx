import { useCallback, useEffect, useRef, useState } from 'react';
import { wordById } from '../content/learning';
import { introducedWords } from '../content/teaching';
import type { ForegroundAudio, PlaybackResult } from '../platform/audio';
import type { GameController } from '../platform/controller';
import { miniKey } from '../platform/minis';
import {
  beginRound,
  createMini,
  type Difficulty,
  editLetter,
  eligibleWord,
  type Foundation,
  letters,
  type MatchMode,
  type MiniKind,
  type MiniState,
  nextRound,
  options,
  playRound,
  restartMini,
  submitMini,
  targetWord,
  wordGroups,
} from '../rules/minigames';
import { Food } from './Food';

export function MiniGames({
  controller,
  audio,
  home,
  collection,
  baskets,
}: {
  controller: GameController;
  audio: ForegroundAudio;
  home: () => void;
  collection?: { ids: string[]; focus: string } | null;
  baskets?: () => void;
}) {
  const store = controller.minis;
  const [state, setState] = useState<MiniState | null>(null);
  const latest = useRef(state);
  latest.current = state;
  const [difficulty, setDifficulty] = useState<Difficulty>('demo');
  const [mode, setMode] = useState<MatchMode>('listen');
  const [foundation, setFoundation] = useState<Foundation>('new');
  const [restart, setRestart] = useState(false);
  const [freshKind, setFreshKind] = useState<MiniKind | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [issue, showIssue] = useState(store.issue);
  const [speechIssue, setSpeechIssue] = useState<PlaybackResult | null>(null);
  const gesture = useRef<{
    id: string;
    pointer: number;
    x: number;
    y: number;
    moved: boolean;
    node: HTMLButtonElement;
  } | null>(null);
  const ignore = useRef(false),
    ghost = useRef<HTMLDivElement>(null);
  const update = useCallback(
    (next: MiniState) => {
      store.save(next);
      latest.current = next;
      setState(next);
      showIssue(store.issue);
    },
    [store],
  );
  const cancel = useCallback(() => {
    const g = gesture.current;
    gesture.current = null;
    if (g?.node.hasPointerCapture(g.pointer)) g.node.releasePointerCapture(g.pointer);
    if (ghost.current) ghost.current.style.display = 'none';
    ignore.current = true;
  }, []);
  useEffect(() => {
    const other = (e: PointerEvent) => {
      if (gesture.current && gesture.current.pointer !== e.pointerId) cancel();
    };
    document.addEventListener('pointerdown', other, true);
    document.addEventListener('visibilitychange', cancel);
    window.addEventListener('resize', cancel);
    window.addEventListener('blur', cancel);
    return () => {
      cancel();
      audio.stop();
      document.removeEventListener('pointerdown', other, true);
      document.removeEventListener('visibilitychange', cancel);
      window.removeEventListener('resize', cancel);
      window.removeEventListener('blur', cancel);
    };
  }, [audio, cancel]);
  useEffect(() => {
    if (!state) return;
    for (const a of state.attempts)
      controller.profile.observe({
        id: a.id,
        dimension:
          state.kind === 'spell' ? 'spelling' : state.mode === 'listen' ? 'listening' : 'meaning',
        target: a.target,
        result: a.result ? 'completed' : 'adjust',
        support: a.support,
        visit:
          controller.profile.value.observations.find(
            (o) => o.id === state.attempts.find((first) => first.round === a.round)?.id,
          )?.visit ?? (controller.profile.value.exposure.includes(a.target) ? 'revisit' : 'first'),
        audioQualified: false,
      });
  }, [state, controller]);
  const say = useCallback(() => {
    const current = latest.current;
    if (!current) return;
    const id = current.id,
      round = current.round,
      stage = current.stage,
      word = targetWord(current);
    setSpeechIssue(null);
    void audio.play(word.audio).then((result) => {
      const now = latest.current;
      if (now?.id !== id || now.round !== round || now.stage !== stage) return;
      if (result === 'completed') update({ ...now, heard: true });
      else if (result === 'failed' || result === 'muted') {
        update({
          ...now,
          support: [
            ...new Set([
              ...now.support,
              result === 'failed' ? 'audio-unavailable' : 'muted-visual',
            ]),
          ],
        });
        setSpeechIssue(result);
      } else if (result === 'interrupted') setSpeechIssue(result);
    });
  }, [audio, update]);
  const question = state ? `${state.id}:${state.round}:${state.stage}` : '';
  // Only a real phase/question transition starts speech; draft edits and audio notifications do not.
  useEffect(() => {
    if (!question || !['meaning', 'play'].includes(latest.current?.stage ?? '')) return;
    say();
    return () => audio.stop();
    // The stable question identity intentionally excludes current draft and support.
  }, [question, audio, say]);
  const lobby = () => {
    cancel();
    audio.stop();
    setSlot(null);
    latest.current = null;
    setState(null);
    setRestart(false);
  };
  const open = (kind: MiniKind, replace = false) => {
    audio.stop();
    const key = miniKey(kind, mode),
      saved = store.sessions[key];
    if (saved && !replace) {
      if (
        collection &&
        (saved.vocabulary.join() !== collection.ids.join() || saved.words[0] !== collection.focus)
      ) {
        setFreshKind(kind);
        return;
      }
      if (
        collection &&
        targetWord(saved).id === collection.focus &&
        ['intro', 'meaning', 'play'].includes(saved.stage)
      ) {
        update({
          ...saved,
          support: [...new Set([...saved.support, 'meaning-picture', 'collection-preview'])],
          carry: {
            ...saved.carry,
            [collection.focus]: [
              ...new Set([
                ...(saved.carry[collection.focus] ?? []),
                'meaning-picture',
                'collection-preview',
              ]),
            ],
          },
        });
      } else {
        setState(saved);
        latest.current = saved;
      }
      return;
    }
    const known = collection?.ids ?? introducedWords(controller.profile.value.presented);
    const fresh = createMini(
      kind,
      difficulty,
      Date.now() >>> 0,
      mode,
      known,
      foundation,
      crypto.randomUUID(),
    );
    if (
      collection &&
      fresh.vocabulary.includes(collection.focus) &&
      eligibleWord(collection.focus, kind, difficulty, foundation)
    ) {
      const rest = [...fresh.words];
      const previous = rest.indexOf(collection.focus);
      if (previous >= 0) rest.splice(previous, 1);
      else rest.pop();
      fresh.words = [collection.focus, ...rest.slice(0, 3)];
    }
    if (saved) fresh.carry = restartMini(saved, fresh.id).carry;
    if (collection && fresh.words[0] === collection.focus)
      fresh.carry[collection.focus] = [
        ...new Set([
          ...(fresh.carry[collection.focus] ?? []),
          'meaning-picture',
          'collection-preview',
          ...(kind === 'spell' ? ['word-model'] : []),
        ]),
      ];
    setFreshKind(null);
    update(fresh);
    void audio.play(kind === 'match' ? 'mini-match' : 'mini-spell');
  };
  const begin = (value: MiniState) => {
    const next = beginRound(value),
      word = targetWord(next);
    const previously = controller.profile.value.presented.includes(word.id);
    const reveals = next.difficulty !== 'independent' || !previously;
    if (reveals) {
      controller.profile.present(word.id);
      next.support = [
        ...new Set([
          ...next.support,
          'meaning-picture',
          ...(next.kind === 'spell' ? ['word-model'] : []),
        ]),
      ];
    }
    update(next);
    setSlot(null);
  };
  if (!state)
    return (
      <section className="mini-lobby" aria-label="游戏小摊">
        <button
          type="button"
          className="corner-back"
          onClick={() => {
            audio.stop();
            home();
          }}
        >
          ← 小院
        </button>
        <h2>食物朋友的小摊</h2>
        <p>
          {collection ? '这一篮的食物朋友，听一听，再找一找。' : '随时回来，字母和这一题都会等你。'}
        </p>
        {baskets ? (
          <button type="button" className="food-basket-entry" onClick={baskets}>
            <Food product="orange" />
            打开五篮食物朋友
          </button>
        ) : null}
        {issue ? <p role="status">{issue}</p> : null}
        <div className="mini-choices">
          <button type="button" onClick={() => open('match')}>
            <Food product="apple" />
            <strong>食物找朋友</strong>
            <span>
              {mode === 'listen'
                ? '听一题，选一张图'
                : mode === 'word-picture'
                  ? '看英文，选图片'
                  : '看中文，选英文'}
            </span>
            {store.sessions[miniKey('match', mode)] ? <small>继续上次</small> : null}
          </button>
          <button type="button" onClick={() => open('spell')}>
            <span className="letter-sign">A B C</span>
            <strong>WordSpell 拼食物</strong>
            <span>听发音，摆字母</span>
            {store.sessions.spell ? <small>继续上次</small> : null}
          </button>
        </div>
        <details className="mini-options">
          <summary>换帮助或玩法</summary>
          <fieldset className="choice-row">
            <legend>新活动需要怎样的帮助？</legend>
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
            <legend>字母准备到哪一步？</legend>
            {(['new', 'letters', 'phrases'] as const).map((f, i) => (
              <button
                type="button"
                key={f}
                aria-pressed={foundation === f}
                onClick={() => setFoundation(f)}
              >
                {['刚认识字母', '熟悉字母了', '也试多词短语'][i]}
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
          <div className="mini-fresh-actions">
            <button
              type="button"
              onClick={() =>
                store.sessions[miniKey('match', mode)] ? setFreshKind('match') : open('match', true)
              }
            >
              按新设置找朋友
            </button>
            <button
              type="button"
              onClick={() => (store.sessions.spell ? setFreshKind('spell') : open('spell', true))}
            >
              按新设置拼字母
            </button>
          </div>
        </details>
        {freshKind ? (
          <div className="mini-confirm" role="dialog" aria-label="新开活动">
            <p>新开一组会替换这项活动的草稿；没完成的题已用帮助仍保留。</p>
            <button type="button" onClick={() => open(freshKind, true)}>
              确认新开一组
            </button>
            <button type="button" onClick={() => setFreshKind(null)}>
              继续保留
            </button>
          </div>
        ) : null}
        <small>
          前两种从图片开始。中英文字配对供已识字玩家选择。继续活动保留原来的帮助与题目。
        </small>
      </section>
    );
  const word = targetWord(state),
    bank = letters(state);
  const commitLetter = (id: string, to: number | null) => {
    const next = editLetter(state, id, to);
    if (next !== state) update(next);
  };
  const bindLetter = (id: string, from: number | null) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!e.isPrimary || gesture.current) {
        cancel();
        return;
      }
      ignore.current = false;
      gesture.current = {
        id,
        pointer: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        moved: false,
        node: e.currentTarget,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => {
      const g = gesture.current;
      if (!g || g.pointer !== e.pointerId) return;
      if (Math.hypot(e.clientX - g.x, e.clientY - g.y) > 8) g.moved = true;
      if (g.moved && ghost.current) {
        ghost.current.textContent = bank.find((l) => l.id === id)?.text ?? '';
        ghost.current.style.display = 'grid';
        ghost.current.style.transform = `translate(${e.clientX - 25}px,${e.clientY - 30}px)`;
      }
    },
    onPointerCancel: cancel,
    onLostPointerCapture: () => {
      if (gesture.current) cancel();
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      const g = gesture.current;
      gesture.current = null;
      if (ghost.current) ghost.current.style.display = 'none';
      if (!g || g.pointer !== e.pointerId) return;
      if (e.currentTarget.hasPointerCapture(e.pointerId))
        e.currentTarget.releasePointerCapture(e.pointerId);
      if (!g.moved) return;
      ignore.current = true;
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const cell = target?.closest<HTMLElement>('[data-letter-slot]');
      if (cell) commitLetter(g.id, Number(cell.dataset.letterSlot));
      else if (target?.closest('.letter-bank')) commitLetter(g.id, null);
      else if (target?.closest('[data-letter-drop]'))
        commitLetter(
          g.id,
          state.draft.findIndex((x) => !x),
        );
    },
    onClick: () => {
      if (ignore.current) {
        ignore.current = false;
        return;
      }
      if (from !== null) {
        commitLetter(id, null);
        setSlot(from);
      } else {
        const index = slot !== null ? slot : state.draft.findIndex((x) => !x);
        commitLetter(id, index);
        setSlot(null);
      }
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (from !== null && e.altKey && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        commitLetter(id, from + (e.key === 'ArrowLeft' ? -1 : 1));
      }
    },
  });
  const submit = (answer?: string) => {
    const next = submitMini(state, answer);
    update(next);
    if (next.attempts.length > state.attempts.length)
      audio.effect(next.correct ? 'success' : 'gentle');
  };
  const shown =
    state.difficulty !== 'independent' ||
    state.support.includes('word-model') ||
    state.support.includes('meaning-picture');
  return (
    <section
      className={`mini-play mini-${state.kind}`}
      data-mini-key={miniKey(state.kind, state.mode)}
      aria-label={state.kind === 'match' ? '食物找朋友' : 'WordSpell拼食物'}
    >
      <button type="button" className="corner-back" onClick={lobby}>
        ← 回游戏小摊
      </button>
      <button type="button" className="mini-restart" onClick={() => setRestart(true)}>
        重新开始
      </button>
      <div className="mini-progress">
        {state.kind === 'spell'
          ? 'WordSpell'
          : state.mode === 'listen'
            ? '听词找图'
            : state.mode === 'word-picture'
              ? '英文配图片'
              : '中英文字配对'}{' '}
        · {state.round + 1} / 4
      </div>
      {speechIssue === 'failed' || speechIssue === 'muted' || speechIssue === 'interrupted' ? (
        <div className="voice-recovery mini-voice-recovery" role="status">
          <span>声音没播完整，可以重听或看图继续。</span>
          <button type="button" onClick={say}>
            ♫ 重试
          </button>
          <button
            type="button"
            onClick={() => {
              const now = latest.current;
              if (now)
                update({
                  ...now,
                  support: [...new Set([...now.support, 'answer-help'])],
                  feedback: '看图找这位朋友。',
                });
              setSpeechIssue(null);
            }}
          >
            🖼 看图
          </button>
        </div>
      ) : null}
      {restart ? (
        <div className="mini-confirm" role="dialog" aria-label="重新开始小游戏">
          <p>重新摆这一组，已经用过的帮助仍会保留。</p>
          <button
            type="button"
            onClick={() => {
              audio.stop();
              update(restartMini(state, crypto.randomUUID()));
              setRestart(false);
              setSlot(null);
            }}
          >
            确认重新开始
          </button>
          <button type="button" onClick={() => setRestart(false)}>
            继续这一题
          </button>
        </div>
      ) : null}
      {state.stage === 'intro' ? (
        <div className="mini-intro">
          <Food product="apple" />
          <h2>{state.kind === 'match' ? '给食物找朋友' : '一起摆字母'}</h2>
          <p>
            {state.kind === 'match'
              ? '听到后直接选图。随时重听或请小猫帮忙。每次只找一位朋友。'
              : '空格已经留好。点字母放入；点已放的字母撤回，再选空位重排，也能拖动。'}
          </p>
          <button type="button" className="primary" onClick={() => begin(state)}>
            开始玩
          </button>
        </div>
      ) : state.stage === 'done' ? (
        <div className="mini-ending">
          <img src="/assets/cat-celebrate.webp" alt="小猫庆祝" />
          <h2>四份心意，都找到了！</h2>
          <p>遇见：{[...new Set(state.words)].map((id) => wordById(id)?.text).join(' · ')}</p>
          <button
            type="button"
            className="primary"
            onClick={() => {
              const fresh = createMini(
                state.kind,
                state.difficulty,
                (state.seed + 1) >>> 0,
                state.mode,
                state.vocabulary,
                state.foundation,
                crypto.randomUUID(),
              );
              update(fresh);
            }}
          >
            再玩一组
          </button>
          <button type="button" onClick={lobby}>
            回游戏小摊
          </button>
        </div>
      ) : state.stage === 'meaning' ? (
        <div className="meaning-stage">
          {shown ? (
            <Food product={word.image} />
          ) : (
            <div className="all-food-intro">
              {options(state).map((w) => (
                <Food key={w.id} product={w.image} />
              ))}
            </div>
          )}
          <h2>{shown ? word.text : '听听食物朋友的名字'}</h2>
          <button type="button" onClick={say}>
            ♫ 听发音
          </button>
          <button type="button" className="primary" onClick={() => update(playRound(state))}>
            我来找 / 拼
          </button>
        </div>
      ) : (
        <>
          <div className="mini-prompt">
            {state.kind === 'spell' ? <Food product={word.image} /> : null}
            <button type="button" className="sound-tile" onClick={say}>
              {state.kind === 'match' && state.mode === 'word-picture'
                ? word.text
                : state.kind === 'match' && state.mode === 'bilingual'
                  ? word.chinese
                  : '♫ 听一听'}
            </button>
          </div>
          {state.kind === 'match' ? (
            <div className="matching-pictures">
              {options(state).map((w) => (
                <button
                  type="button"
                  key={w.id}
                  aria-label={state.mode === 'bilingual' ? w.text : w.chinese}
                  disabled={state.stage === 'feedback'}
                  onClick={() => submit(w.id)}
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
              <section
                className="letter-draft"
                data-letter-drop="true"
                aria-label="拼写区，词间空格固定"
              >
                {wordGroups(state).map((group, g) => (
                  <section
                    className="letter-word"
                    key={group.join('-')}
                    aria-label={`第${g + 1}个词`}
                  >
                    {group.map((i) => {
                      const id = state.draft[i] ?? '';
                      return (
                        <button
                          type="button"
                          data-letter-slot={i}
                          key={`slot-${i}`}
                          aria-pressed={slot === i}
                          aria-label={`字母位置${i + 1}${id ? ` ${bank.find((l) => l.id === id)?.text}` : ''}`}
                          disabled={state.fixed.includes(id) || state.stage === 'feedback'}
                          {...(id ? bindLetter(id, i) : { onClick: () => setSlot(i) })}
                        >
                          {id ? bank.find((l) => l.id === id)?.text : '·'}
                        </button>
                      );
                    })}
                  </section>
                ))}
              </section>
              {wordGroups(state).length > 1 ? <small>两个词，中间的空格已经留好了。</small> : null}
              <div className="letter-bank">
                {bank.map((l) => (
                  <button
                    type="button"
                    key={l.id}
                    aria-label={`字母 ${l.text} ${l.id}`}
                    disabled={state.draft.includes(l.id) || state.stage === 'feedback'}
                    {...bindLetter(l.id, null)}
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
          <div ref={ghost} className="letter-ghost" aria-hidden="true" />
          <p role="status" className="mini-feedback">
            {state.feedback}
          </p>
          {state.stage === 'feedback' ? (
            <button
              type="button"
              className="primary"
              onClick={() => {
                const next = nextRound(state);
                if (next.stage === 'done') update(next);
                else begin({ ...next, stage: 'intro' });
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
                  feedback: '看看这位朋友，接着试。',
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
