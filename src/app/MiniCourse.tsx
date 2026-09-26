import { useCallback, useEffect, useRef, useState } from 'react';
import { REQUESTS, type RequestId } from '../content/catalog';
import { wordById } from '../content/learning';
import {
  type CourseFoundation,
  type CourseKind,
  MINI_LEVELS,
  type MiniLevel,
  miniLevel,
} from '../content/mini-levels';
import type { Product } from '../content/recipes';
import { teachingFigures } from '../content/teaching';
import type { ForegroundAudio, PlaybackResult } from '../platform/audio';
import type { GameController } from '../platform/controller';
import {
  type CourseState,
  courseKind,
  coursePool,
  courseTarget,
  createCourse,
  nextCourse,
  playCourse,
  startCourse,
  submitCourse,
  tileBank,
  toggleTile,
} from '../rules/mini-course';
import { Food } from './Food';

const names: Record<CourseKind, string> = {
  listen: '听音找物',
  pair: '多组配对',
  spell: 'WordSpell',
  quantity: '数量与组合',
  sentence: '选词组句',
  review: '混合复习',
};
const foundations: Record<CourseFoundation, number> = { new: 0, letters: 1, phrases: 2 };
const requestPicture = (id: string) => (id in REQUESTS ? REQUESTS[id as RequestId].products : []);
function Pictures({ id }: { id: string }) {
  const word = wordById(id);
  return (
    <span className="course-pictures">
      {teachingFigures((word ? [word.image] : requestPicture(id)) as Product[]).map(
        ({ id: figureId, product }) => (
          <Food key={figureId} product={product} />
        ),
      )}
    </span>
  );
}
export function MiniCourse({
  controller,
  audio,
  exit,
}: {
  controller: GameController;
  audio: ForegroundAudio;
  exit: () => void;
}) {
  const store = controller.minis;
  const [kind, setKind] = useState<CourseKind>('listen');
  const [foundation, setFoundation] = useState<CourseFoundation>('new');
  const [state, setState] = useState<CourseState | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [soundIssue, setSoundIssue] = useState<PlaybackResult | null>(null);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const latest = useRef<CourseState | null>(null);
  const voiceToken = useRef(0);
  latest.current = state;
  const update = useCallback(
    (next: CourseState) => {
      store.saveCourse(next);
      latest.current = next;
      setState(next);
    },
    [store],
  );
  const level = state ? miniLevel(state.levelId) : undefined;
  const target = level && state ? courseTarget(level, state) : '';
  const mechanic = level && state ? courseKind(level, state) : 'listen';
  const say = useCallback(
    (forState = latest.current) => {
      if (!forState) return;
      const current = miniLevel(forState.levelId);
      if (!current) return;
      const asked = courseTarget(current, forState);
      const sound =
        wordById(asked)?.audio ?? (asked in REQUESTS ? REQUESTS[asked as RequestId].audio : '');
      if (!sound) return;
      const token = ++voiceToken.current;
      setSoundIssue(null);
      void audio.play(sound).then((result) => {
        const now = latest.current;
        if (
          token !== voiceToken.current ||
          now?.id !== forState.id ||
          now.round !== forState.round ||
          now.phase !== forState.phase
        )
          return;
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
          setSoundIssue(result);
        } else if (result === 'interrupted') setSoundIssue(result);
      });
    },
    [audio, update],
  );
  const question = state ? `${state.id}:${state.round}:${state.phase}` : '';
  useEffect(() => {
    const current = latest.current;
    if (!question || !current || !['meaning', 'play'].includes(current.phase)) return;
    say(current);
    return () => {
      voiceToken.current++;
      audio.stop();
    };
  }, [question, audio, say]);
  useEffect(
    () => () => {
      voiceToken.current++;
      audio.stop();
    },
    [audio],
  );
  const open = (chosen: MiniLevel, restart = false) => {
    audio.stop();
    voiceToken.current++;
    const saved = store.courses[chosen.id];
    const next = !restart && saved ? saved : createCourse(chosen, crypto.randomUUID());
    if (restart && saved?.support.length)
      next.support = [...new Set([...saved.support, 'restarted-after-help'])];
    update(next);
    setShowHelp(false);
    setConfirmRestart(false);
  };
  const leave = () => {
    audio.stop();
    voiceToken.current++;
    latest.current = null;
    setState(null);
    setSoundIssue(null);
    setShowHelp(false);
  };
  const submit = (answer?: string) => {
    if (!level || !state) return;
    const next = submitCourse(level, state, answer);
    if (next === state) return;
    const attempt = next.attempts.at(-1);
    if (attempt && attempt.id !== state.attempts.at(-1)?.id)
      controller.profile.observe({
        id: attempt.id,
        dimension:
          mechanic === 'spell'
            ? 'spelling'
            : mechanic === 'sentence'
              ? 'structure'
              : mechanic === 'listen'
                ? 'listening'
                : 'meaning',
        target: attempt.target,
        result: attempt.task
          ? 'completed'
          : attempt.grammar
            ? 'context-adjust'
            : 'structure-adjust',
        support: attempt.support,
        visit: controller.profile.value.exposure.includes(attempt.target) ? 'revisit' : 'first',
        audioQualified: false,
      });
    update(next);
  };
  if (!level || !state)
    return (
      <section className="mini-course" aria-label="主题关卡">
        <button type="button" className="corner-back" onClick={exit}>
          ← 回游戏小摊
        </button>
        <h2>主题关卡</h2>
        <p>先看图、听声音，再完成短任务。拼写与组句只是可选练习，不挡故事。</p>
        <fieldset className="course-tabs">
          <legend>今天玩什么？</legend>
          {(Object.keys(names) as CourseKind[]).map((name) => (
            <button
              type="button"
              key={name}
              aria-pressed={kind === name}
              onClick={() => setKind(name)}
            >
              {names[name]}
            </button>
          ))}
        </fieldset>
        <fieldset className="course-tabs">
          <legend>我的语言基础</legend>
          {(['new', 'letters', 'phrases'] as const).map((choice, index) => (
            <button
              type="button"
              key={choice}
              aria-pressed={foundation === choice}
              onClick={() => setFoundation(choice)}
            >
              {['先听图', '认识字母', '愿意组句'][index]}
            </button>
          ))}
        </fieldset>
        <div className="course-level-grid">
          {MINI_LEVELS.filter(
            (candidate) =>
              candidate.kind === kind &&
              foundations[candidate.foundation] <= foundations[foundation],
          ).map((candidate) => {
            const saved = store.courses[candidate.id];
            const complete = store.completedCourses.includes(candidate.id);
            return (
              <article key={candidate.id}>
                <small>
                  {candidate.theme} · {candidate.targets.length}个任务
                </small>
                <h3>{candidate.title}</h3>
                <p>{candidate.goal}</p>
                <button type="button" onClick={() => open(candidate, complete)}>
                  {complete ? '重玩' : saved ? '继续' : '开始'}
                </button>
                {complete ? <span> ✓ 完成</span> : null}
              </article>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() =>
            open(
              MINI_LEVELS.find((candidate) => candidate.id === 'mixed-review') as MiniLevel,
              Boolean(store.completedCourses.includes('mixed-review')),
            )
          }
        >
          混合复习 · 听、配、拼、辨、说
        </button>
        {store.issue ? <p role="status">{store.issue}</p> : null}
      </section>
    );
  const bank = tileBank(level, state);
  const choices = coursePool(level, state).filter(
    (id) => mechanic !== 'pair' || !state.used.includes(id),
  );
  return (
    <section className="mini-course" aria-label={`${level.title}关卡`}>
      <button type="button" className="corner-back" onClick={leave}>
        ← 返回主题
      </button>
      <h2>{level.title}</h2>
      <p>{level.scene}</p>
      <div className="course-progress">
        {names[mechanic]} · {state.round + 1}/{level.targets.length} · {level.goal}
      </div>
      {confirmRestart ? (
        <div className="course-confirm" role="dialog" aria-label="重玩关卡">
          <p>重玩会从第一题开始，已用帮助仍保留。</p>
          <button type="button" onClick={() => open(level, true)}>
            确认重玩
          </button>
          <button type="button" onClick={() => setConfirmRestart(false)}>
            继续本题
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirmRestart(true)}>
          重玩本关
        </button>
      )}
      {state.phase === 'intro' ? (
        <div className="course-intro">
          <Pictures id={target} />
          <p>{level.support}</p>
          <button type="button" className="primary" onClick={() => update(startCourse(state))}>
            看看今天的内容
          </button>
        </div>
      ) : null}
      {state.phase === 'meaning' ? (
        <div className="course-meaning">
          <Pictures id={target} />
          <p>
            先看一看：
            {wordById(target)?.chinese ??
              (target in REQUESTS ? REQUESTS[target as RequestId].explanation : '')}
          </p>
          <button type="button" onClick={() => say()}>
            ♫ 听一遍
          </button>
          <button type="button" className="primary" onClick={() => update(playCourse(state))}>
            我来试试
          </button>
        </div>
      ) : null}
      {state.phase === 'play' || state.phase === 'feedback' ? (
        <>
          <div className="course-prompt">
            {mechanic === 'spell' || mechanic === 'sentence' ? <Pictures id={target} /> : null}
            <button type="button" onClick={() => say()}>
              ♫ 重听请求
            </button>
            {showHelp ? (
              <span>
                <Pictures id={target} />
                {wordById(target)?.text ?? REQUESTS[target as RequestId]?.text}
              </span>
            ) : null}
          </div>
          {mechanic === 'listen' || mechanic === 'pair' || mechanic === 'quantity' ? (
            <div className="course-choice-grid">
              {choices.map((id) => (
                <button
                  type="button"
                  key={id}
                  disabled={state.phase === 'feedback'}
                  onClick={() => submit(id)}
                  aria-label={
                    mechanic === 'quantity'
                      ? `选择${REQUESTS[id as RequestId]?.explanation}`
                      : `选择${wordById(id)?.chinese}`
                  }
                >
                  <Pictures id={id} />
                  {mechanic === 'pair' ? <small>{wordById(id)?.chinese}</small> : null}
                </button>
              ))}
            </div>
          ) : (
            <>
              <fieldset className="course-draft" aria-label="已选词块">
                {state.selected.map((id) => (
                  <button
                    key={id}
                    type="button"
                    disabled={state.phase === 'feedback'}
                    onClick={() => update(toggleTile(level, state, id))}
                  >
                    {bank.find((tile) => tile.id === id)?.text} ×
                  </button>
                ))}
              </fieldset>
              <fieldset className="course-tiles" aria-label="可用词块">
                {bank
                  .filter((tile) => !state.selected.includes(tile.id))
                  .map((tile) => (
                    <button
                      key={tile.id}
                      type="button"
                      disabled={state.phase === 'feedback'}
                      onClick={() => update(toggleTile(level, state, tile.id))}
                    >
                      {tile.text}
                    </button>
                  ))}
              </fieldset>
              {state.phase === 'play' ? (
                <button type="button" className="primary" onClick={() => submit()}>
                  完成这句
                </button>
              ) : null}
            </>
          )}
          <p role="status">
            {state.feedback || (soundIssue ? '声音没播完整，可以重听或看图。' : '')}
          </p>
          {state.phase === 'play' ? (
            <button
              type="button"
              onClick={() => {
                setShowHelp(true);
                update({ ...state, support: [...new Set([...state.support, 'answer-help'])] });
              }}
            >
              看图和例句
            </button>
          ) : (
            <button
              type="button"
              className="primary"
              onClick={() => {
                update(nextCourse(level, state));
                setShowHelp(false);
              }}
            >
              下一份
            </button>
          )}
        </>
      ) : null}
      {state.phase === 'done' ? (
        <div className="course-done">
          <Food product="apple" />
          <h3>{level.completion}</h3>
          <p>这组活动完成了，故事和营业仍可继续。</p>
          <button type="button" className="primary" onClick={leave}>
            回主题关卡
          </button>
        </div>
      ) : null}
      <small>开发语音尚未人工听审；听过不等于会了。</small>
    </section>
  );
}
