import { useEffect, useRef, useState } from 'react';
import { REQUESTS, type RequestId } from '../content/catalog';
import { ITEM_AUDIO, lessonWords } from '../content/learning';
import { FOOD, type Product, RAW } from '../content/recipes';
import {
  acceptsChoice,
  preparationSteps,
  REQUEST_UNITS,
  teachingFigures,
  UNITS,
} from '../content/teaching';
import type { ViewState } from '../game/input';
import type { ForegroundAudio, PlaybackResult } from '../platform/audio';
import type { GameController } from '../platform/controller';
import type { LessonProgress } from '../platform/profile';
import { shuffle } from '../rules/minigames';
import type { Destination } from '../rules/types';
import { Food } from './Food';

/** Meaning first; a child-selected raw choice uses the same real inventory command as the scene. */
export function Lesson({
  request,
  audio,
  close,
  controller,
  lessonKey,
  view,
}: {
  request: RequestId;
  audio: ForegroundAudio;
  close: () => void;
  controller: GameController;
  lessonKey: string;
  view: ViewState;
}) {
  const profile = controller.profile;
  const [progress, setProgress] = useState<LessonProgress>(() => {
    const saved = profile.value.lessons[lessonKey];
    if (saved && saved.request === request && !['done', 'skipped'].includes(saved.phase))
      return saved;
    const units = REQUEST_UNITS[request].filter((id) => !profile.value.learnedUnits.includes(id));
    return {
      request,
      units: units.length ? units : [...REQUEST_UNITS[request]].slice(-1),
      index: 0,
      phase: 'meaning',
      step: 0,
      tries: 0,
      nextAttempt: saved?.nextAttempt ?? 0,
      support: ['meaning-picture'],
    };
  });
  const [feedback, setFeedback] = useState('');
  const [wrongChoice, setWrongChoice] = useState<readonly Product[]>([]);
  const [voiceResult, setVoiceResult] = useState<PlaybackResult | null>(null);
  const voiceToken = useRef(0);
  const [destination, setDestination] = useState<Destination>({ tray: view.selectedTray });
  const unit = UNITS[progress.units[progress.index] ?? ''];
  const spec = REQUESTS[request];
  const steps = preparationSteps(spec.products[0]);
  const current = steps[progress.step];
  const update = (next: LessonProgress) => {
    profile.lesson(lessonKey, next);
    setProgress(next);
  };
  useEffect(() => {
    let cancelled = false;
    const token = ++voiceToken.current;
    setVoiceResult(null);
    let playback: Promise<PlaybackResult> | null = null;
    if (progress.phase === 'meaning' && unit) {
      profile.present(unit.id);
      playback = audio.sequence(
        request === 'vanilla-cup' || request === 'strawberry-cup'
          ? ['menu-ice-flavor', unit.audio]
          : ['vanilla-cone', 'cup-vanilla', 'cone-vanilla'].includes(request)
            ? ['menu-ice-container', unit.audio]
            : [unit.audio],
      );
    } else if (progress.phase === 'try' && unit) playback = audio.play(unit.prompt);
    else if (progress.phase === 'recipe')
      playback = audio.play(ITEM_AUDIO[current?.output ?? spec.products[0]]);
    void playback?.then((result) => {
      if (!cancelled && token === voiceToken.current) setVoiceResult(result);
    });
    return () => {
      cancelled = true;
      voiceToken.current++;
      audio.stop();
    };
  }, [audio, profile, progress.phase, unit, current?.output, spec.products, request]);
  useEffect(() => {
    view.lessonProducts =
      progress.phase === 'recipe' ? [current?.output ?? spec.products[0]] : (unit?.products ?? []);
    return () => {
      view.lessonProducts = [];
    };
  }, [view, progress.phase, current?.output, spec.products, unit]);
  const finish = (completed: boolean) => {
    update({ ...progress, phase: completed ? 'done' : 'skipped' });
    if (completed) profile.tutorial(`request-${request}`);
    close();
  };
  const practice = () => {
    update({ ...progress, phase: 'practice' });
    close();
  };
  const physical =
    unit &&
    unit.choices.every((c) => c.products.length === 1 && c.products.every((p) => RAW.includes(p)));
  const choose = (choice: string) => {
    if (!unit) return;
    const chosen = unit.choices.find((c) => c.id === choice);
    if (!chosen) return;
    if (physical && chosen.products[0]) {
      const result = controller.command({
        type: 'move',
        source: { supply: chosen.products[0] },
        destination,
      });
      if (result.kind !== 'ok') {
        setFeedback(result.message);
        return;
      }
    }
    const correct = acceptsChoice(unit, choice);
    profile.observe({
      id: `lesson:${lessonKey}:${progress.nextAttempt}`,
      dimension: unit.prerequisite === 'recognition' ? 'meaning' : 'structure',
      target: unit.id,
      result: correct ? 'completed' : 'adjust',
      support: progress.support,
      visit: profile.value.learnedUnits.includes(unit.id) ? 'revisit' : 'first',
      audioQualified: false,
    });
    if (physical) {
      update({
        ...progress,
        phase: 'practice',
        nextAttempt: progress.nextAttempt + 1,
        support: [...new Set([...progress.support, ...(!correct ? ['difference-feedback'] : [])])],
      });
      view.prep =
        'machine' in destination
          ? 'machine'
          : 'station' in destination
            ? destination.station
            : 'tray';
      if (!correct)
        controller.command({
          type: 'support',
          order:
            view.selectedGuest ||
            controller.state.orders.find((o) => o.status === 'waiting')?.id ||
            '',
          reason: 'difference-feedback',
        });
      close();
      controller.message = correct
        ? '刚才选的食物已放好，接着制作或送餐。'
        : '刚才选的食物保留了；点它可以放回，再听一听。';
      return;
    }
    if (!correct) {
      setWrongChoice(chosen.products);
      update({
        ...progress,
        tries: progress.tries + 1,
        nextAttempt: progress.nextAttempt + 1,
        support: [...new Set([...progress.support, 'difference-feedback'])],
      });
      setFeedback(
        chosen.products.length < unit.products.length
          ? '这次少了一份。看看两边的图片，再选一次。'
          : chosen.products.length > unit.products.length
            ? '这次多了一份。看看两边的图片，再选一次。'
            : '这张图和请求不同。看图换一份，或点 ♫ 重听。',
      );
      return;
    }
    setWrongChoice([]);
    profile.value.learnedUnits = [...new Set([...profile.value.learnedUnits, unit.id])].slice(-80);
    const index = progress.index + 1;
    update({
      ...progress,
      index,
      phase: index < progress.units.length ? 'meaning' : 'recipe',
      tries: 0,
      nextAttempt: progress.nextAttempt + 1,
    });
    setFeedback(unit.feedback);
    audio.effect('place');
  };
  return (
    <section
      className="lesson-dialog short-lesson"
      role="dialog"
      aria-modal="true"
      aria-label="场景小教学"
    >
      <div className="lesson-heading">
        <span>大咪的食谱 · 一次学一点</span>
        <button type="button" onClick={() => finish(false)} aria-label="我来试试">
          先到餐车试试 ↗
        </button>
      </div>
      {voiceResult === 'failed' || voiceResult === 'muted' || voiceResult === 'interrupted' ? (
        <div className="voice-recovery" role="status">
          <span>
            {voiceResult === 'failed'
              ? '声音没有播出来'
              : voiceResult === 'muted'
                ? '声音已关闭'
                : '声音暂停了'}
            ，看图也能继续。
          </span>
          <button
            type="button"
            onClick={() => {
              const id =
                progress.phase === 'meaning'
                  ? unit?.audio
                  : progress.phase === 'try'
                    ? unit?.prompt
                    : ITEM_AUDIO[current?.output ?? spec.products[0]];
              if (id) {
                const token = ++voiceToken.current;
                setVoiceResult(null);
                void audio.play(id).then((result) => {
                  if (token === voiceToken.current) setVoiceResult(result);
                });
              }
            }}
          >
            ♫ 重试
          </button>
        </div>
      ) : null}
      {['vanilla-cup', 'strawberry-cup'].includes(request) ? (
        <p>这一页：一球，装杯；选你听到的口味。</p>
      ) : ['vanilla-cone', 'cup-vanilla', 'cone-vanilla'].includes(request) ? (
        <p>这一页：一球香草；选杯子或蛋筒。</p>
      ) : null}
      {progress.phase !== 'recipe' && steps.length > 0 ? (
        <button
          type="button"
          onClick={() =>
            update({
              ...progress,
              phase: 'recipe',
              support: [...new Set([...progress.support, 'recipe-help'])],
            })
          }
        >
          看看怎么做
        </button>
      ) : null}
      {progress.phase !== 'recipe' && unit ? (
        <>
          <div
            className="lesson-beads"
            role="img"
            aria-label={`认识食物 ${progress.index + 1}/${progress.units.length}`}
          >
            {progress.units.map((id, i) => (
              <span key={id} className={i <= progress.index ? 'filled' : ''} />
            ))}
          </div>
          {progress.phase === 'meaning' ? (
            <>
              <button
                type="button"
                className="meaning-object"
                onClick={() => void audio.play(unit.audio)}
                aria-label={`听 ${unit.text}`}
              >
                <span className="meaning-products">
                  {teachingFigures(unit.products).map(({ id, product }) => (
                    <Food key={id} product={product} />
                  ))}
                </span>
                <strong>{unit.text}</strong>
                <span>♫</span>
              </button>
              <p>
                {unit.prerequisite === 'quantity'
                  ? '看得见的份数。点一下，听名字。'
                  : unit.prerequisite === 'combination'
                    ? '两种一起放。点一下，听名字。'
                    : '点食物，听它的名字。'}
              </p>
              <button
                type="button"
                className="primary"
                onClick={() => {
                  setFeedback('');
                  if (physical) update({ ...progress, phase: 'try' });
                  else practice();
                }}
              >
                {physical ? '来试一下 →' : '回餐车，亲手做 ↗'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="sound-tile"
                onClick={() => void audio.play(unit.prompt)}
              >
                ♫ 再听一遍
              </button>
              {physical ? (
                <fieldset className="choice-row">
                  <legend>选一个工作对象，食物会真的放进去</legend>
                  <button
                    type="button"
                    aria-pressed={'tray' in destination}
                    onClick={() => setDestination({ tray: view.selectedTray })}
                  >
                    备餐盘
                  </button>
                  {controller.state.session.family === 'juice' ? (
                    <button
                      type="button"
                      aria-pressed={'machine' in destination}
                      onClick={() =>
                        setDestination({ machine: unit?.id === 'cup' ? 'cup' : 'apple' })
                      }
                    >
                      果汁机
                    </button>
                  ) : null}
                  {controller.state.session.family === 'ice' ? (
                    <button
                      type="button"
                      aria-pressed={'station' in destination}
                      onClick={() => setDestination({ station: 'ice' })}
                    >
                      冰淇淋台
                    </button>
                  ) : null}
                  {['sandwich', 'burger'].includes(controller.state.session.family) ? (
                    <button
                      type="button"
                      aria-pressed={'station' in destination && destination.station === 'board'}
                      onClick={() => setDestination({ station: 'board' })}
                    >
                      组合板
                    </button>
                  ) : null}
                  {controller.state.session.family === 'burger' ? (
                    <button
                      type="button"
                      aria-pressed={'station' in destination && destination.station === 'grill'}
                      onClick={() => setDestination({ station: 'grill' })}
                    >
                      煎台
                    </button>
                  ) : null}
                </fieldset>
              ) : null}
              <div className="meaning-choices">
                {shuffle(unit.choices, controller.state.session.seed + progress.index).map(
                  (choice) => (
                    <button
                      type="button"
                      key={choice.id}
                      onClick={() => choose(choice.id)}
                      aria-label={choice.products.map((p) => FOOD[p][0]).join('、')}
                    >
                      {teachingFigures(choice.products).map(({ id, product }) => (
                        <Food key={id} product={product} />
                      ))}
                    </button>
                  ),
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  update({
                    ...progress,
                    phase: 'meaning',
                    support: [...new Set([...progress.support, 'answer-help'])],
                  });
                }}
              >
                🐾 再看大咪示范
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <h2>{current?.action ?? '摆到盘里'}</h2>
          <div className="lesson-ingredients">
            {teachingFigures(current?.inputs ?? spec.products).map(({ id, product }) => {
              const w = lessonWords([product])[0];
              if (!w) return null;
              return (
                <button type="button" key={id} onClick={() => void audio.play(w.audio)}>
                  <Food product={w.product} />
                  <span>{w.text}</span>
                </button>
              );
            })}
            <span>→</span>
            <button
              type="button"
              aria-label="听成品名称"
              onClick={() => void audio.play(ITEM_AUDIO[current?.output ?? spec.products[0]])}
            >
              <Food product={current?.output ?? spec.products[0]} />
              <span>{FOOD[current?.output ?? spec.products[0]][1]}</span>
            </button>
          </div>
          <div className="lesson-process">
            <span>
              {current
                ? { machine: '◉ 果汁机', ice: '❄ 冰淇淋台', board: '▰ 组合板', grill: '♨ 煎台' }[
                    current.station
                  ]
                : '● 备餐盘'}
            </span>
            <span>
              → {current?.action ?? '摆好'} →{' '}
              {current?.station === 'grill' ? '自动到组合板' : '自动到绑定托盘'}
            </span>
          </div>
          {steps.length > 1 ? (
            <div className="lesson-stepper">
              {steps.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={progress.step === i}
                  onClick={() => update({ ...progress, step: i })}
                >
                  {i + 1} · {r.action}
                </button>
              ))}
            </div>
          ) : null}
          {request.includes('juice') ? (
            <p>
              这里的果汁是一杯。水果由你选。
              <button
                type="button"
                aria-label="听果汁菜单约定"
                onClick={() => void audio.play('menu-cup')}
              >
                ♫
              </button>
            </p>
          ) : ['double-cream', 'banana-cream'].includes(request) ? (
            <p>
              这两道菜单用杯子装，口味和数量由你放。
              <button
                type="button"
                aria-label="听冰淇淋菜单约定"
                onClick={() => void audio.play('menu-cream')}
              >
                ♫
              </button>
            </p>
          ) : null}
          <button
            type="button"
            className="primary"
            onClick={() => {
              if (progress.step < steps.length - 1)
                update({ ...progress, step: progress.step + 1 });
              else finish(true);
            }}
          >
            {progress.step < steps.length - 1 ? '接着组装 →' : '回餐车，亲手做 ↗'}
          </button>
        </>
      )}
      <p role="status" className="lesson-feedback">
        {feedback}
      </p>
      {wrongChoice.length && unit ? (
        <div className="lesson-difference">
          <span>刚才选的</span>
          {teachingFigures(wrongChoice).map(({ id, product }) => (
            <Food key={id} product={product} />
          ))}
          <span>→ 看看请求</span>
          {teachingFigures(unit.products).map(({ id, product }) => (
            <Food key={id} product={product} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
