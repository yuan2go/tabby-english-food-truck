import { useCallback, useEffect, useRef, useState } from 'react';
import { SCENE_LEVELS, SCENE_NAMES, type SceneKind, sceneLevel } from '../content/scene-levels';
import { vocabularyWord } from '../content/vocabulary';
import { assetUrl } from '../game/assets';
import type { ForegroundAudio } from '../platform/audio';
import type { MiniStore } from '../platform/minis';
import {
  createScene,
  replayScene,
  type SceneCommand,
  type SceneState,
  sceneCommand,
  sceneTask,
} from '../rules/scene-games';
import { useDialogFocus } from './dialog-focus';
import { DesignerBoard, HuntBoard, MemoryBoard, SortBoard, TheatreBoard } from './SceneBoards';
import { SceneGuide } from './SceneGuide';
import { VocabularyVisual, VoiceIcon } from './VocabularyVisual';
import './scene-games.css';

const stages = { entry: '先认识', variation: '换一种玩法', revisit: '再相见' };
const boards = {
  hunt: HuntBoard,
  memory: MemoryBoard,
  sort: SortBoard,
  design: DesignerBoard,
  theatre: TheatreBoard,
};
export function SceneGames({
  store,
  audio,
  exit,
}: {
  store: MiniStore;
  audio: ForegroundAudio;
  exit: () => void;
}) {
  const [kind, setKind] = useState<SceneKind>('hunt'),
    [state, setState] = useState<SceneState | null>(null),
    [issue, setIssue] = useState(''),
    [soundIssue, setSoundIssue] = useState(false),
    [restart, setRestart] = useState(false),
    [showGuide, setShowGuide] = useState(false);
  useDialogFocus(restart ? 'scene-restart' : state?.paused ? 'scene-pause' : null);
  const latest = useRef(state),
    voice = useRef(0);
  latest.current = state;
  const update = useCallback(
    (next: SceneState) => {
      store.saveScene(next);
      latest.current = next;
      setState(next);
      setIssue(store.issue);
    },
    [store],
  );
  const send = useCallback(
    (command: SceneCommand) => {
      const now = latest.current;
      if (!now) return;
      const next = sceneCommand(now, command);
      if (next !== now) {
        if (next.round !== now.round || next.phase === 'done') setShowGuide(false);
        update(next);
        if (next.actor.serial !== now.actor.serial) audio.effect('place');
        if (next.phase === 'feedback' && now.phase !== 'feedback') audio.effect('success');
      }
    },
    [update, audio],
  );
  const stop = useCallback(() => {
    voice.current++;
    audio.stop();
  }, [audio]);
  const say = useCallback(
    async (id?: string) => {
      const now = latest.current;
      if (!now || now.paused) return;
      const token = ++voice.current;
      const identity = `${now.id}:${now.round}:${now.phase}`;
      setSoundIssue(false);
      const result = await audio.play(id ?? sceneTask(now).audio);
      const current = latest.current;
      if (
        token !== voice.current ||
        !current ||
        `${current.id}:${current.round}:${current.phase}` !== identity
      )
        return;
      if (result === 'completed' && !id) send({ type: 'heard', value: true });
      else if (result !== 'completed') {
        if (result === 'failed' || result === 'muted') send({ type: 'heard', value: false });
        setSoundIssue(true);
      }
    },
    [audio, send],
  );
  const question = state ? `${state.id}:${state.round}:${state.phase}:${state.paused}` : '';
  useEffect(() => {
    const now = latest.current;
    if (question && now && !now.paused && ['meaning', 'play', 'observe'].includes(now.phase))
      void say();
    return stop;
  }, [question, say, stop]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) {
        stop();
        const now = latest.current;
        if (now) update(sceneCommand(now, { type: 'pause', value: true }));
      }
    };
    document.addEventListener('visibilitychange', pause);
    return () => {
      document.removeEventListener('visibilitychange', pause);
      stop();
    };
  }, [stop, update]);
  const leave = () => {
    stop();
    latest.current = null;
    setState(null);
    setShowGuide(false);
    setRestart(false);
    setSoundIssue(false);
  };
  const open = (id: string) => {
    const level = sceneLevel(id);
    if (!level) return;
    stop();
    const saved = store.scenes[id];
    const next = saved ?? createScene(level, crypto.randomUUID(), Date.now() >>> 0);
    update(
      next.phase === 'intro'
        ? sceneCommand(next, { type: 'start' })
        : next.phase === 'meaning'
          ? sceneCommand(next, { type: 'play' })
          : next,
    );
  };
  const exportSave = () => {
    const blob = new Blob([JSON.stringify(store.export(), null, 2)], { type: 'application/json' }),
      url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = 'dami-minigames-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  if (!state)
    return (
      <section
        className="scene-lobby"
        aria-label="小院场景小游戏"
        style={{ backgroundImage: `url(${assetUrl('courtyard')})` }}
      >
        <header>
          <button
            type="button"
            onClick={() => {
              stop();
              exit();
            }}
          >
            返回游戏小摊
          </button>
          <h2>大咪的小院游乐角</h2>
          <button
            type="button"
            aria-label="听游乐角引导"
            onClick={() => void audio.play('vocab-scene-welcome')}
          >
            <VoiceIcon />
          </button>
        </header>
        <div className="scene-kind-path">
          {(Object.keys(SCENE_NAMES) as SceneKind[]).map((k) => (
            <button
              type="button"
              key={k}
              aria-pressed={kind === k}
              onClick={() => {
                setKind(k);
                void audio.play(`vocab-scene-${k}`);
              }}
            >
              <VocabularyVisual
                id={
                  k === 'hunt'
                    ? 'basket'
                    : k === 'memory'
                      ? 'plate'
                      : k === 'sort'
                        ? 'shelf'
                        : k === 'design'
                          ? 'table'
                          : 'open'
                }
              />
              <span>{SCENE_NAMES[k]}</span>
            </button>
          ))}
        </div>
        <div className="scene-level-path">
          {SCENE_LEVELS.filter((l) => l.kind === kind).map((l) => (
            <button type="button" key={l.id} onClick={() => open(l.id)}>
              <span>{stages[l.stage]}</span>
              <strong>{l.title}</strong>
              <small>
                {store.completedScenes.includes(l.id)
                  ? '已留下活动记忆 · 可以回访'
                  : store.scenes[l.id]
                    ? '继续这一组'
                    : '开始这一组'}
              </small>
            </button>
          ))}
        </div>
        <p>点物件，再点要去的地方。随时重听、看图、撤回或回小院。</p>
        <small>开发语音未听审；完成活动不代表英语掌握率。</small>
        {store.issue ? (
          <p role="status">
            {store.issue}
            <button
              type="button"
              onClick={() => {
                store.retryScenes();
                setIssue(store.issue);
              }}
            >
              重试保存
            </button>
            <button type="button" onClick={exportSave}>
              导出进度
            </button>
          </p>
        ) : null}
      </section>
    );
  const level = sceneLevel(state.levelId);
  if (!level) return null;
  const task = sceneTask(state),
    Board = boards[level.kind];
  const words = task.words.filter((w, i, a) => a.indexOf(w) === i).slice(0, 4);
  const supported = state.support.includes('answer-help');
  return (
    <section
      className={`scene-game game-${level.kind}`}
      aria-label={level.title}
      data-scene-level={level.id}
      data-scene-phase={state.phase}
      data-scene-mode={state.mode}
    >
      <header className="scene-top">
        <button type="button" onClick={leave}>
          返回游乐角
        </button>
        <h2>
          {SCENE_NAMES[level.kind]}
          <small>
            {state.mode === 'free'
              ? '自由布置'
              : `${stages[level.stage]} · ${state.round + 1}/${level.tasks.length}`}
          </small>
        </h2>
        <button
          type="button"
          aria-label="暂停小游戏"
          onClick={() => {
            stop();
            send({ type: 'pause', value: true });
          }}
        >
          暂停
        </button>
      </header>
      <div className="scene-content">
        {state.phase === 'intro' ? (
          <div className="scene-intro">
            <img src={assetUrl('cat-greet')} alt="大咪邀请你玩" />
            <h3>{level.title}</h3>
            <p>{level.scene}</p>
            <button type="button" className="primary" onClick={() => send({ type: 'start' })}>
              先认识今天的物件
            </button>
            {level.kind === 'design' ? (
              <button type="button" onClick={() => send({ type: 'free' })}>
                自由布置餐桌
              </button>
            ) : null}
          </div>
        ) : null}
        {state.phase === 'meaning' ? (
          <div className="scene-meaning">
            <div className="meaning-gallery">
              {words.map((word) => (
                <button
                  type="button"
                  key={word}
                  onClick={() => void say(vocabularyWord(word)?.contextAudio)}
                >
                  <VocabularyVisual id={word} />
                  <span>{vocabularyWord(word)?.chinese}</span>
                  <VoiceIcon />
                </button>
              ))}
            </div>
            <p>{task.instruction}</p>
            <button type="button" aria-label="听本轮请求" onClick={() => void say()}>
              <VoiceIcon />
              听一听
            </button>
            <button type="button" className="primary" onClick={() => send({ type: 'play' })}>
              我来动手
            </button>
          </div>
        ) : null}
        {['play', 'observe', 'covered', 'feedback'].includes(state.phase) ? (
          <>
            <div className="scene-prompt">
              <button type="button" aria-label="重听场景请求" onClick={() => void say()}>
                <VoiceIcon />
              </button>
              <p>{state.mode === 'free' ? '自由布置 · 没有标准答案' : task.instruction}</p>
              <button
                type="button"
                onClick={() => {
                  send({ type: 'help' });
                  setShowGuide(true);
                  void say('vocab-scene-help');
                }}
              >
                看图示范
              </button>
            </div>
            {supported && showGuide ? (
              <section className="scene-help" aria-label="物件与动作示范">
                <button type="button" onClick={() => setShowGuide(false)}>
                  收起图示，自己试试
                </button>
                <SceneGuide state={state} />
                <small>按图示动手，帮助会保留。</small>
              </section>
            ) : null}
            <div
              className={`scene-stage actor-${state.actor.action}`}
              inert={state.phase === 'feedback'}
            >
              <img
                className={`scene-dami action-${state.actor.action}`}
                key={`${state.actor.serial}-${state.actor.action}`}
                src={assetUrl(
                  state.actor.action === 'idle'
                    ? 'cat-idle'
                    : state.actor.action === 'take' || state.actor.action === 'carry'
                      ? 'cat-carry'
                      : 'cat-celebrate',
                )}
                alt="大咪响应你做的动作"
              />
              <Board state={state} send={send} />
            </div>
            <footer className="scene-actions">
              {state.phase === 'feedback' ? (
                <button type="button" className="primary" onClick={() => send({ type: 'next' })}>
                  下一段活动
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={!state.undo.length}
                    onClick={() => send({ type: 'undo' })}
                  >
                    撤回一步
                  </button>
                  {level.kind !== 'hunt' && !['observe', 'covered'].includes(state.phase) ? (
                    <button
                      type="button"
                      className="primary"
                      onClick={() => send({ type: 'check' })}
                    >
                      {state.mode === 'free' ? '留下我的布置' : '给大咪看看'}
                    </button>
                  ) : null}
                </>
              )}
            </footer>
          </>
        ) : null}
        {state.phase === 'done' ? (
          <div className="scene-done">
            <img src={assetUrl('cat-celebrate')} alt="大咪和你的作品" />
            <h3>这次小院活动完成了</h3>
            <p>你动过的物件和帮助已经保留。可以再玩、换玩法或回到厨房。</p>
            <button
              type="button"
              onClick={() => {
                update(sceneCommand(replayScene(state, crypto.randomUUID()), { type: 'start' }));
              }}
            >
              再玩这一组
            </button>
            {level.kind === 'design' ? (
              <button type="button" onClick={() => send({ type: 'free' })}>
                继续自由布置
              </button>
            ) : null}
            <button type="button" className="primary" onClick={leave}>
              换个活动
            </button>
          </div>
        ) : null}
        <p className="scene-feedback" role="status">
          {state.feedback}
        </p>
        {soundIssue ? (
          <div className="scene-audio-issue" role="status">
            声音没播完整，物件会等你。
            <button type="button" onClick={() => void say()}>
              重试声音
            </button>
            <button
              type="button"
              onClick={() => {
                send({ type: 'help' });
                setShowGuide(true);
                setSoundIssue(false);
              }}
            >
              看图继续
            </button>
          </div>
        ) : null}
        <div className="scene-bottom">
          <button
            type="button"
            onClick={() => {
              stop();
              setRestart(true);
            }}
          >
            重玩这一组
          </button>
          <small>{issue || '开发语音未听审 · 没有计时与能力评分'}</small>
          {issue ? (
            <>
              <button
                type="button"
                onClick={() => {
                  store.retryScenes();
                  setIssue(store.issue);
                }}
              >
                重试保存
              </button>
              <button type="button" onClick={exportSave}>
                导出进度
              </button>
            </>
          ) : null}
        </div>
      </div>
      {state.paused ? (
        <div className="scene-overlay" role="dialog" aria-modal="true" aria-label="小游戏已暂停">
          <h3>休息一会儿</h3>
          <button
            type="button"
            className="primary"
            onClick={() => send({ type: 'pause', value: false })}
          >
            继续玩
          </button>
          <button type="button" onClick={leave}>
            回游乐角
          </button>
        </div>
      ) : null}
      {restart ? (
        <div className="scene-overlay" role="dialog" aria-modal="true" aria-label="重玩场景小游戏">
          <p>物件重新摆好，已经看过的帮助仍保留。</p>
          <button
            type="button"
            onClick={() => {
              stop();
              update(sceneCommand(replayScene(state, crypto.randomUUID()), { type: 'start' }));
              setRestart(false);
            }}
          >
            确认重玩
          </button>
          <button type="button" data-dialog-initial onClick={() => setRestart(false)}>
            继续这一轮
          </button>
        </div>
      ) : null}
    </section>
  );
}
